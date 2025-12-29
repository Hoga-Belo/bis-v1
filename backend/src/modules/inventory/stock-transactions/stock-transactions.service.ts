
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull, QueryRunner } from 'typeorm';
import {
  StockTransaction,
  TransactionType,
} from '../../../entities/inventory/stock-transaction.entity';
import { Stock } from '../../../entities/inventory/stock.entity';
import { Product } from '../../../entities/inventory/product.entity';
import { Warehouse } from '../../../entities/inventory/warehouse.entity';
import { CreateStockTransactionDto, StockTransactionQueryDto } from './dto';

@Injectable()
export class StockTransactionsService {
  constructor(
    @InjectRepository(StockTransaction)
    private readonly stockTransactionRepository: Repository<StockTransaction>,
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Find all stock transactions with pagination, search, and filters
   */
  async findAll(query: StockTransactionQueryDto): Promise<{
    data: StockTransaction[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const {
      page = 1,
      limit = 10,
      search,
      transactionType,
      productId,
      warehouseId,
      dateFrom,
      dateTo,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const queryBuilder = this.stockTransactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.product', 'product')
      .leftJoinAndSelect('transaction.warehouse', 'warehouse')
      .leftJoinAndSelect('transaction.fromWarehouse', 'fromWarehouse')
      .leftJoinAndSelect('transaction.toWarehouse', 'toWarehouse')
      .where('transaction.deletedAt IS NULL');

    // Search by transaction number or reference number
    if (search) {
      queryBuilder.andWhere(
        '(transaction.transactionNumber ILIKE :search OR transaction.referenceNumber ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Filter by transaction type
    if (transactionType) {
      queryBuilder.andWhere('transaction.transactionType = :transactionType', {
        transactionType,
      });
    }

    // Filter by product
    if (productId) {
      queryBuilder.andWhere('transaction.productId = :productId', { productId });
    }

    // Filter by warehouse
    if (warehouseId) {
      queryBuilder.andWhere(
        '(transaction.warehouseId = :warehouseId OR transaction.fromWarehouseId = :warehouseId OR transaction.toWarehouseId = :warehouseId)',
        { warehouseId },
      );
    }

    // Filter by date range
    if (dateFrom && dateTo) {
      queryBuilder.andWhere(
        'transaction.transactionDate BETWEEN :dateFrom AND :dateTo',
        { dateFrom, dateTo },
      );
    } else if (dateFrom) {
      queryBuilder.andWhere('transaction.transactionDate >= :dateFrom', {
        dateFrom,
      });
    } else if (dateTo) {
      queryBuilder.andWhere('transaction.transactionDate <= :dateTo', { dateTo });
    }

    // Sorting
    const sortColumn = `transaction.${sortBy}`;
    queryBuilder.orderBy(sortColumn, sortOrder);

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find a single stock transaction by ID
   */
  async findOne(id: string): Promise<StockTransaction> {
    const transaction = await this.stockTransactionRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['product', 'warehouse', 'fromWarehouse', 'toWarehouse', 'approver'],
    });

    if (!transaction) {
      throw new NotFoundException(`Stock transaction with ID ${id} not found`);
    }

    return transaction;
  }

  /**
   * Generate unique transaction number based on type and date
   * Format: PREFIX/YYYYMMDD/NNNN (e.g., IN/20241229/0001)
   */
  private async generateTransactionNumber(
    type: TransactionType,
    queryRunner: QueryRunner,
  ): Promise<string> {
    const prefixMap: Record<TransactionType, string> = {
      [TransactionType.INBOUND]: 'IN',
      [TransactionType.OUTBOUND]: 'OUT',
      [TransactionType.ADJUSTMENT]: 'ADJ',
      [TransactionType.TRANSFER]: 'TRF',
    };

    const prefix = prefixMap[type];
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const pattern = `${prefix}/${dateStr}/%`;

    // Count existing transactions for today with this prefix
    const count = await queryRunner.manager
      .createQueryBuilder(StockTransaction, 'st')
      .where('st.transactionNumber LIKE :pattern', { pattern })
      .getCount();

    const sequence = (count + 1).toString().padStart(4, '0');
    return `${prefix}/${dateStr}/${sequence}`;
  }

  /**
   * Create an inbound stock transaction
   */
  async createInbound(
    dto: CreateStockTransactionDto,
    userId: string,
  ): Promise<StockTransaction> {
    if (dto.transactionType !== TransactionType.INBOUND) {
      throw new BadRequestException('Transaction type must be INBOUND');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate product exists
      const product = await queryRunner.manager.findOne(Product, {
        where: { id: dto.productId, deletedAt: IsNull() },
      });
      if (!product) {
        throw new NotFoundException(`Product with ID ${dto.productId} not found`);
      }

      // Validate warehouse exists
      const warehouse = await queryRunner.manager.findOne(Warehouse, {
        where: { id: dto.warehouseId, deletedAt: IsNull() },
      });
      if (!warehouse) {
        throw new NotFoundException(`Warehouse with ID ${dto.warehouseId} not found`);
      }

      // Generate transaction number
      const transactionNumber = await this.generateTransactionNumber(
        TransactionType.INBOUND,
        queryRunner,
      );

      // Find or create stock record
      let stock = await queryRunner.manager.findOne(Stock, {
        where: {
          productId: dto.productId,
          warehouseId: dto.warehouseId,
          deletedAt: IsNull(),
        },
      });

      if (!stock) {
        stock = queryRunner.manager.create(Stock, {
          productId: dto.productId,
          warehouseId: dto.warehouseId,
          quantity: 0,
          createdBy: userId,
        });
        stock = await queryRunner.manager.save(Stock, stock);
      }

      // Increase stock quantity
      stock.quantity += dto.quantity;
      stock.updatedBy = userId;
      await queryRunner.manager.save(Stock, stock);

      // Create stock transaction record
      const transaction = queryRunner.manager.create(StockTransaction, {
        transactionNumber,
        transactionType: TransactionType.INBOUND,
        transactionDate: new Date(),
        productId: dto.productId,
        warehouseId: dto.warehouseId,
        quantity: dto.quantity,
        referenceNumber: dto.referenceNumber,
        notes: dto.notes,
        createdBy: userId,
      });

      const savedTransaction = await queryRunner.manager.save(
        StockTransaction,
        transaction,
      );

      await queryRunner.commitTransaction();

      // Return with relations
      return this.findOne(savedTransaction.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Create an outbound stock transaction
   */
  async createOutbound(
    dto: CreateStockTransactionDto,
    userId: string,
  ): Promise<StockTransaction> {
    if (dto.transactionType !== TransactionType.OUTBOUND) {
      throw new BadRequestException('Transaction type must be OUTBOUND');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate product exists
      const product = await queryRunner.manager.findOne(Product, {
        where: { id: dto.productId, deletedAt: IsNull() },
      });
      if (!product) {
        throw new NotFoundException(`Product with ID ${dto.productId} not found`);
      }

      // Validate warehouse exists
      const warehouse = await queryRunner.manager.findOne(Warehouse, {
        where: { id: dto.warehouseId, deletedAt: IsNull() },
      });
      if (!warehouse) {
        throw new NotFoundException(`Warehouse with ID ${dto.warehouseId} not found`);
      }

      // Find stock record and validate sufficient quantity
      const stock = await queryRunner.manager.findOne(Stock, {
        where: {
          productId: dto.productId,
          warehouseId: dto.warehouseId,
          deletedAt: IsNull(),
        },
      });

      if (!stock) {
        throw new BadRequestException(
          `No stock found for product ${dto.productId} in warehouse ${dto.warehouseId}`,
        );
      }

      if (stock.quantity < dto.quantity) {
        throw new BadRequestException(
          `Insufficient stock. Available: ${stock.quantity}, Requested: ${dto.quantity}`,
        );
      }

      // Generate transaction number
      const transactionNumber = await this.generateTransactionNumber(
        TransactionType.OUTBOUND,
        queryRunner,
      );

      // Decrease stock quantity
      stock.quantity -= dto.quantity;
      stock.updatedBy = userId;
      await queryRunner.manager.save(Stock, stock);

      // Create stock transaction record
      const transaction = queryRunner.manager.create(StockTransaction, {
        transactionNumber,
        transactionType: TransactionType.OUTBOUND,
        transactionDate: new Date(),
        productId: dto.productId,
        warehouseId: dto.warehouseId,
        quantity: dto.quantity,
        referenceNumber: dto.referenceNumber,
        notes: dto.notes,
        createdBy: userId,
      });

      const savedTransaction = await queryRunner.manager.save(
        StockTransaction,
        transaction,
      );

      await queryRunner.commitTransaction();

      // Return with relations
      return this.findOne(savedTransaction.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Create an adjustment stock transaction
   */
  async createAdjustment(
    dto: CreateStockTransactionDto,
    userId: string,
  ): Promise<StockTransaction> {
    if (dto.transactionType !== TransactionType.ADJUSTMENT) {
      throw new BadRequestException('Transaction type must be ADJUSTMENT');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate product exists
      const product = await queryRunner.manager.findOne(Product, {
        where: { id: dto.productId, deletedAt: IsNull() },
      });
      if (!product) {
        throw new NotFoundException(`Product with ID ${dto.productId} not found`);
      }

      // Validate warehouse exists
      const warehouse = await queryRunner.manager.findOne(Warehouse, {
        where: { id: dto.warehouseId, deletedAt: IsNull() },
      });
      if (!warehouse) {
        throw new NotFoundException(`Warehouse with ID ${dto.warehouseId} not found`);
      }

      // Generate transaction number
      const transactionNumber = await this.generateTransactionNumber(
        TransactionType.ADJUSTMENT,
        queryRunner,
      );

      // Find or create stock record
      let stock = await queryRunner.manager.findOne(Stock, {
        where: {
          productId: dto.productId,
          warehouseId: dto.warehouseId,
          deletedAt: IsNull(),
        },
      });

      const previousQuantity = stock?.quantity || 0;

      if (!stock) {
        stock = queryRunner.manager.create(Stock, {
          productId: dto.productId,
          warehouseId: dto.warehouseId,
          quantity: dto.quantity,
          createdBy: userId,
        });
      } else {
        // Set stock to the new quantity (adjustment sets absolute value)
        stock.quantity = dto.quantity;
        stock.updatedBy = userId;
      }

      await queryRunner.manager.save(Stock, stock);

      // Calculate the adjustment difference for notes
      const adjustmentDiff = dto.quantity - previousQuantity;
      const adjustmentNote = `Adjusted from ${previousQuantity} to ${dto.quantity} (${adjustmentDiff >= 0 ? '+' : ''}${adjustmentDiff})`;

      // Create stock transaction record
      const transaction = queryRunner.manager.create(StockTransaction, {
        transactionNumber,
        transactionType: TransactionType.ADJUSTMENT,
        transactionDate: new Date(),
        productId: dto.productId,
        warehouseId: dto.warehouseId,
        quantity: dto.quantity,
        referenceNumber: dto.referenceNumber,
        notes: dto.notes ? `${dto.notes} | ${adjustmentNote}` : adjustmentNote,
        createdBy: userId,
      });

      const savedTransaction = await queryRunner.manager.save(
        StockTransaction,
        transaction,
      );

      await queryRunner.commitTransaction();

      // Return with relations
      return this.findOne(savedTransaction.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Create a transfer stock transaction
   */
  async createTransfer(
    dto: CreateStockTransactionDto,
    userId: string,
  ): Promise<StockTransaction> {
    if (dto.transactionType !== TransactionType.TRANSFER) {
      throw new BadRequestException('Transaction type must be TRANSFER');
    }

    if (!dto.targetWarehouseId) {
      throw new BadRequestException(
        'Target warehouse is required for TRANSFER transactions',
      );
    }

    if (dto.warehouseId === dto.targetWarehouseId) {
      throw new BadRequestException(
        'Source and target warehouse cannot be the same',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate product exists
      const product = await queryRunner.manager.findOne(Product, {
        where: { id: dto.productId, deletedAt: IsNull() },
      });
      if (!product) {
        throw new NotFoundException(`Product with ID ${dto.productId} not found`);
      }

      // Validate source warehouse exists
      const sourceWarehouse = await queryRunner.manager.findOne(Warehouse, {
        where: { id: dto.warehouseId, deletedAt: IsNull() },
      });
      if (!sourceWarehouse) {
        throw new NotFoundException(`Source warehouse with ID ${dto.warehouseId} not found`);
      }

      // Validate target warehouse exists
      const targetWarehouse = await queryRunner.manager.findOne(Warehouse, {
        where: { id: dto.targetWarehouseId, deletedAt: IsNull() },
      });
      if (!targetWarehouse) {
        throw new NotFoundException(`Target warehouse with ID ${dto.targetWarehouseId} not found`);
      }

      // Find source stock and validate sufficient quantity
      const sourceStock = await queryRunner.manager.findOne(Stock, {
        where: {
          productId: dto.productId,
          warehouseId: dto.warehouseId,
          deletedAt: IsNull(),
        },
      });

      if (!sourceStock) {
        throw new BadRequestException(
          `No stock found for product ${dto.productId} in source warehouse ${dto.warehouseId}`,
        );
      }

      if (sourceStock.quantity < dto.quantity) {
        throw new BadRequestException(
          `Insufficient stock in source warehouse. Available: ${sourceStock.quantity}, Requested: ${dto.quantity}`,
        );
      }

      // Generate transaction number
      const transactionNumber = await this.generateTransactionNumber(
        TransactionType.TRANSFER,
        queryRunner,
      );

      // Decrease stock in source warehouse
      sourceStock.quantity -= dto.quantity;
      sourceStock.updatedBy = userId;
      await queryRunner.manager.save(Stock, sourceStock);

      // Find or create stock in target warehouse
      let targetStock = await queryRunner.manager.findOne(Stock, {
        where: {
          productId: dto.productId,
          warehouseId: dto.targetWarehouseId,
          deletedAt: IsNull(),
        },
      });

      if (!targetStock) {
        targetStock = queryRunner.manager.create(Stock, {
          productId: dto.productId,
          warehouseId: dto.targetWarehouseId,
          quantity: 0,
          createdBy: userId,
        });
        targetStock = await queryRunner.manager.save(Stock, targetStock);
      }

      // Increase stock in target warehouse
      targetStock.quantity += dto.quantity;
      targetStock.updatedBy = userId;
      await queryRunner.manager.save(Stock, targetStock);

      // Create stock transaction record
      const transaction = queryRunner.manager.create(StockTransaction, {
        transactionNumber,
        transactionType: TransactionType.TRANSFER,
        transactionDate: new Date(),
        productId: dto.productId,
        warehouseId: dto.warehouseId,
        fromWarehouseId: dto.warehouseId,
        toWarehouseId: dto.targetWarehouseId,
        quantity: dto.quantity,
        referenceNumber: dto.referenceNumber,
        notes: dto.notes,
        createdBy: userId,
      });

      const savedTransaction = await queryRunner.manager.save(
        StockTransaction,
        transaction,
      );

      await queryRunner.commitTransaction();

      // Return with relations
      return this.findOne(savedTransaction.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get stock movement history for a product
   */
  async getStockMovementHistory(
    productId: string,
    warehouseId?: string,
  ): Promise<StockTransaction[]> {
    // Validate product exists
    const product = await this.productRepository.findOne({
      where: { id: productId, deletedAt: IsNull() },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    const queryBuilder = this.stockTransactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.product', 'product')
      .leftJoinAndSelect('transaction.warehouse', 'warehouse')
      .leftJoinAndSelect('transaction.fromWarehouse', 'fromWarehouse')
      .leftJoinAndSelect('transaction.toWarehouse', 'toWarehouse')
      .where('transaction.productId = :productId', { productId })
      .andWhere('transaction.deletedAt IS NULL');

    if (warehouseId) {
      queryBuilder.andWhere(
        '(transaction.warehouseId = :warehouseId OR transaction.fromWarehouseId = :warehouseId OR transaction.toWarehouseId = :warehouseId)',
        { warehouseId },
      );
    }

    queryBuilder.orderBy('transaction.transactionDate', 'DESC');

    return queryBuilder.getMany();
  }
}