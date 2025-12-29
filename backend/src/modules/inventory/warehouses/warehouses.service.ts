import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { Warehouse } from '../../../entities/inventory/warehouse.entity';
import { Stock } from '../../../entities/inventory/stock.entity';
import { Product } from '../../../entities/inventory/product.entity';
import { WorkLocation } from '../../../entities/hr/work-location.entity';
import { Employee } from '../../../entities/hr/employee.entity';
import {
  CreateWarehouseDto,
  UpdateWarehouseDto,
  WarehouseQueryDto,
} from './dto';

export interface WarehouseWithStats extends Warehouse {
  totalProducts: number;
  totalStock: number;
}

export interface WarehouseStockItem {
  productId: string;
  productSku: string;
  productName: string;
  categoryName: string | null;
  uomName: string | null;
  quantity: number;
  minStock: number;
  isLowStock: boolean;
}

export interface WarehouseStatistics {
  totalProducts: number;
  totalQuantity: number;
  lowStockCount: number;
}

@Injectable()
export class WarehousesService {
  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(WorkLocation)
    private readonly workLocationRepository: Repository<WorkLocation>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  /**
   * Find all warehouses with pagination, search, and filters
   */
  async findAll(query: WarehouseQueryDto): Promise<{
    data: WarehouseWithStats[];
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
      workLocationId,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const queryBuilder = this.warehouseRepository
      .createQueryBuilder('warehouse')
      .leftJoinAndSelect('warehouse.workLocation', 'workLocation')
      .leftJoinAndSelect('warehouse.picEmployee', 'picEmployee')
      .leftJoin('warehouse.stocks', 'stock', 'stock.deletedAt IS NULL')
      .addSelect('COUNT(DISTINCT stock.productId)', 'totalProducts')
      .addSelect('COALESCE(SUM(stock.quantity), 0)', 'totalStock')
      .where('warehouse.deletedAt IS NULL')
      .groupBy('warehouse.id')
      .addGroupBy('workLocation.id')
      .addGroupBy('picEmployee.id');

    // Apply search filter
    if (search) {
      queryBuilder.andWhere(
        '(LOWER(warehouse.code) LIKE LOWER(:search) OR LOWER(warehouse.name) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    // Apply work location filter
    if (workLocationId) {
      queryBuilder.andWhere('warehouse.workLocationId = :workLocationId', {
        workLocationId,
      });
    }

    // Apply active status filter
    if (isActive !== undefined) {
      queryBuilder.andWhere('warehouse.isActive = :isActive', { isActive });
    }

    // Apply sorting
    const sortColumn = `warehouse.${sortBy}`;
    queryBuilder.orderBy(sortColumn, sortOrder);

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    queryBuilder.skip((page - 1) * limit).take(limit);

    // Execute query
    const rawResults = await queryBuilder.getRawAndEntities();

    // Map results with stats
    const data: WarehouseWithStats[] = rawResults.entities.map(
      (warehouse, index) => {
        const raw = rawResults.raw[index];
        return {
          ...warehouse,
          totalProducts: parseInt(raw.totalProducts || '0', 10),
          totalStock: parseInt(raw.totalStock || '0', 10),
        };
      },
    );

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
   * Find one warehouse by ID with all relations and stock summary
   */
  async findOne(id: string): Promise<WarehouseWithStats> {
    const queryBuilder = this.warehouseRepository
      .createQueryBuilder('warehouse')
      .leftJoinAndSelect('warehouse.workLocation', 'workLocation')
      .leftJoinAndSelect('workLocation.city', 'city')
      .leftJoinAndSelect('warehouse.picEmployee', 'picEmployee')
      .leftJoin('warehouse.stocks', 'stock', 'stock.deletedAt IS NULL')
      .addSelect('COUNT(DISTINCT stock.productId)', 'totalProducts')
      .addSelect('COALESCE(SUM(stock.quantity), 0)', 'totalStock')
      .where('warehouse.id = :id', { id })
      .andWhere('warehouse.deletedAt IS NULL')
      .groupBy('warehouse.id')
      .addGroupBy('workLocation.id')
      .addGroupBy('city.id')
      .addGroupBy('picEmployee.id');

    const result = await queryBuilder.getRawAndEntities();

    if (!result.entities.length) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }

    const warehouse = result.entities[0];
    const raw = result.raw[0];

    return {
      ...warehouse,
      totalProducts: parseInt(raw.totalProducts || '0', 10),
      totalStock: parseInt(raw.totalStock || '0', 10),
    };
  }

  /**
   * Create a new warehouse
   */
  async create(dto: CreateWarehouseDto): Promise<Warehouse> {
    // Check if code already exists
    const existingWarehouse = await this.warehouseRepository.findOne({
      where: { code: dto.code, deletedAt: IsNull() },
    });

    if (existingWarehouse) {
      throw new ConflictException(`Warehouse with code ${dto.code} already exists`);
    }

    // Validate work location if provided
    if (dto.workLocationId) {
      const workLocation = await this.workLocationRepository.findOne({
        where: { id: dto.workLocationId, deletedAt: IsNull() },
      });

      if (!workLocation) {
        throw new BadRequestException(
          `Work location with ID ${dto.workLocationId} not found`,
        );
      }
    }

    // Validate PIC employee if provided
    if (dto.picEmployeeId) {
      const employee = await this.employeeRepository.findOne({
        where: { id: dto.picEmployeeId, deletedAt: IsNull() },
      });

      if (!employee) {
        throw new BadRequestException(
          `Employee with ID ${dto.picEmployeeId} not found`,
        );
      }
    }

    const warehouse = this.warehouseRepository.create({
      ...dto,
      isActive: dto.isActive ?? true,
    });

    return this.warehouseRepository.save(warehouse);
  }

  /**
   * Update an existing warehouse
   */
  async update(id: string, dto: UpdateWarehouseDto): Promise<Warehouse> {
    const warehouse = await this.warehouseRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }

    // Check if code is being changed and if new code already exists
    if (dto.code && dto.code !== warehouse.code) {
      const existingWarehouse = await this.warehouseRepository.findOne({
        where: { code: dto.code, deletedAt: IsNull(), id: Not(id) },
      });

      if (existingWarehouse) {
        throw new ConflictException(
          `Warehouse with code ${dto.code} already exists`,
        );
      }
    }

    // Validate work location if provided
    if (dto.workLocationId) {
      const workLocation = await this.workLocationRepository.findOne({
        where: { id: dto.workLocationId, deletedAt: IsNull() },
      });

      if (!workLocation) {
        throw new BadRequestException(
          `Work location with ID ${dto.workLocationId} not found`,
        );
      }
    }

    // Validate PIC employee if provided
    if (dto.picEmployeeId) {
      const employee = await this.employeeRepository.findOne({
        where: { id: dto.picEmployeeId, deletedAt: IsNull() },
      });

      if (!employee) {
        throw new BadRequestException(
          `Employee with ID ${dto.picEmployeeId} not found`,
        );
      }
    }

    Object.assign(warehouse, dto);
    return this.warehouseRepository.save(warehouse);
  }

  /**
   * Soft delete a warehouse
   */
  async remove(id: string): Promise<void> {
    const warehouse = await this.warehouseRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }

    // Check if warehouse has active stocks
    const activeStocksCount = await this.stockRepository.count({
      where: {
        warehouseId: id,
        deletedAt: IsNull(),
        quantity: Not(0),
      },
    });

    if (activeStocksCount > 0) {
      throw new BadRequestException(
        `Cannot delete warehouse with ${activeStocksCount} active stock items. Please transfer or remove all stock first.`,
      );
    }

    warehouse.deletedAt = new Date();
    await this.warehouseRepository.save(warehouse);
  }

  /**
   * Get all products and their quantities in a warehouse
   */
  async getWarehouseStock(id: string): Promise<WarehouseStockItem[]> {
    // Verify warehouse exists
    const warehouse = await this.warehouseRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }

    const stocks = await this.stockRepository
      .createQueryBuilder('stock')
      .leftJoinAndSelect('stock.product', 'product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.uom', 'uom')
      .where('stock.warehouseId = :warehouseId', { warehouseId: id })
      .andWhere('stock.deletedAt IS NULL')
      .andWhere('product.deletedAt IS NULL')
      .orderBy('product.name', 'ASC')
      .getMany();

    return stocks.map((stock) => ({
      productId: stock.productId,
      productSku: stock.product.sku,
      productName: stock.product.name,
      categoryName: stock.product.category?.name || null,
      uomName: stock.product.uom?.name || null,
      quantity: stock.quantity,
      minStock: stock.product.minStock,
      isLowStock: stock.quantity < stock.product.minStock,
    }));
  }

  /**
   * Get warehouse statistics
   */
  async getWarehouseStatistics(id: string): Promise<WarehouseStatistics> {
    // Verify warehouse exists
    const warehouse = await this.warehouseRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }

    // Get total products and total quantity
    const stockStats = await this.stockRepository
      .createQueryBuilder('stock')
      .leftJoin('stock.product', 'product')
      .select('COUNT(DISTINCT stock.productId)', 'totalProducts')
      .addSelect('COALESCE(SUM(stock.quantity), 0)', 'totalQuantity')
      .where('stock.warehouseId = :warehouseId', { warehouseId: id })
      .andWhere('stock.deletedAt IS NULL')
      .andWhere('product.deletedAt IS NULL')
      .getRawOne();

    // Get low stock count
    const lowStockResult = await this.stockRepository
      .createQueryBuilder('stock')
      .leftJoin('stock.product', 'product')
      .where('stock.warehouseId = :warehouseId', { warehouseId: id })
      .andWhere('stock.deletedAt IS NULL')
      .andWhere('product.deletedAt IS NULL')
      .andWhere('stock.quantity < product.minStock')
      .getCount();

    return {
      totalProducts: parseInt(stockStats?.totalProducts || '0', 10),
      totalQuantity: parseInt(stockStats?.totalQuantity || '0', 10),
      lowStockCount: lowStockResult,
    };
  }
}