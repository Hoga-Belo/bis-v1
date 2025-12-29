import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { Product } from '../../../entities/inventory/product.entity';
import { Category } from '../../../entities/inventory/category.entity';
import { Brand } from '../../../entities/inventory/brand.entity';
import { Uom } from '../../../entities/inventory/uom.entity';
import { Stock } from '../../../entities/inventory/stock.entity';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './dto';

export interface ProductWithTotalStock extends Product {
  totalStock: number;
}

export interface StockByWarehouse {
  warehouseId: string;
  warehouseName: string;
  warehouseCode: string;
  quantity: number;
  lastStockOpnameDate: Date | null;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(Uom)
    private readonly uomRepository: Repository<Uom>,
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
  ) {}

  /**
   * Find all products with pagination, search, and filters
   */
  async findAll(query: ProductQueryDto): Promise<{
    data: ProductWithTotalStock[];
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
      categoryId,
      brandId,
      isAsset,
      lowStock,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.uom', 'uom')
      .leftJoin('product.stocks', 'stock')
      .addSelect('COALESCE(SUM(stock.quantity), 0)', 'totalStock')
      .where('product.deletedAt IS NULL');

    // Search by SKU or name
    if (search) {
      queryBuilder.andWhere(
        '(product.sku ILIKE :search OR product.name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Filter by category
    if (categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    // Filter by brand
    if (brandId) {
      queryBuilder.andWhere('product.brandId = :brandId', { brandId });
    }

    // Filter by asset status
    if (isAsset !== undefined) {
      queryBuilder.andWhere('product.isAsset = :isAsset', { isAsset });
    }

    // Group by product for aggregation
    queryBuilder.groupBy('product.id');
    queryBuilder.addGroupBy('category.id');
    queryBuilder.addGroupBy('brand.id');
    queryBuilder.addGroupBy('uom.id');

    // Filter by low stock (having clause after group by)
    if (lowStock === true) {
      queryBuilder.having(
        'COALESCE(SUM(stock.quantity), 0) < product.minStock',
      );
    }

    // Sorting
    const validSortFields = ['sku', 'name', 'createdAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`product.${sortField}`, sortOrder);

    // Get total count (before pagination)
    const totalQuery = queryBuilder.clone();
    const totalResult = await totalQuery.getRawMany();
    const total = totalResult.length;

    // Pagination
    queryBuilder.offset((page - 1) * limit).limit(limit);

    // Execute query
    const rawResults = await queryBuilder.getRawAndEntities();

    // Map results to include totalStock
    const data: ProductWithTotalStock[] = rawResults.entities.map(
      (product, index) => {
        const raw = rawResults.raw[index];
        return {
          ...product,
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
   * Find one product by ID with all relations and stock per warehouse
   */
  async findOne(id: string): Promise<ProductWithTotalStock> {
    const product = await this.productRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['category', 'brand', 'uom', 'stocks', 'stocks.warehouse'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Calculate total stock
    const totalStock = product.stocks?.reduce(
      (sum, stock) => sum + stock.quantity,
      0,
    ) || 0;

    return {
      ...product,
      totalStock,
    };
  }

  /**
   * Create a new product
   */
  async create(dto: CreateProductDto): Promise<Product> {
    // Check if SKU already exists
    const existingSku = await this.productRepository.findOne({
      where: { sku: dto.sku.toUpperCase(), deletedAt: IsNull() },
    });

    if (existingSku) {
      throw new ConflictException(`Product with SKU ${dto.sku} already exists`);
    }

    // Validate category exists
    const category = await this.categoryRepository.findOne({
      where: { id: dto.categoryId, deletedAt: IsNull() },
    });

    if (!category) {
      throw new NotFoundException(
        `Category with ID ${dto.categoryId} not found`,
      );
    }

    // Validate brand exists (if provided)
    if (dto.brandId) {
      const brand = await this.brandRepository.findOne({
        where: { id: dto.brandId, deletedAt: IsNull() },
      });

      if (!brand) {
        throw new NotFoundException(`Brand with ID ${dto.brandId} not found`);
      }
    }

    // Validate UOM exists
    const uom = await this.uomRepository.findOne({
      where: { id: dto.uomId, deletedAt: IsNull() },
    });

    if (!uom) {
      throw new NotFoundException(`UOM with ID ${dto.uomId} not found`);
    }

    // Create product
    const product = this.productRepository.create({
      ...dto,
      sku: dto.sku.toUpperCase(),
    });

    return this.productRepository.save(product);
  }

  /**
   * Update a product
   */
  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Check if SKU is being changed and if new SKU already exists
    if (dto.sku && dto.sku.toUpperCase() !== product.sku) {
      const existingSku = await this.productRepository.findOne({
        where: {
          sku: dto.sku.toUpperCase(),
          deletedAt: IsNull(),
          id: Not(id),
        },
      });

      if (existingSku) {
        throw new ConflictException(
          `Product with SKU ${dto.sku} already exists`,
        );
      }
    }

    // Validate category exists (if provided)
    if (dto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: dto.categoryId, deletedAt: IsNull() },
      });

      if (!category) {
        throw new NotFoundException(
          `Category with ID ${dto.categoryId} not found`,
        );
      }
    }

    // Validate brand exists (if provided)
    if (dto.brandId) {
      const brand = await this.brandRepository.findOne({
        where: { id: dto.brandId, deletedAt: IsNull() },
      });

      if (!brand) {
        throw new NotFoundException(`Brand with ID ${dto.brandId} not found`);
      }
    }

    // Validate UOM exists (if provided)
    if (dto.uomId) {
      const uom = await this.uomRepository.findOne({
        where: { id: dto.uomId, deletedAt: IsNull() },
      });

      if (!uom) {
        throw new NotFoundException(`UOM with ID ${dto.uomId} not found`);
      }
    }

    // Update product
    Object.assign(product, {
      ...dto,
      sku: dto.sku ? dto.sku.toUpperCase() : product.sku,
    });

    return this.productRepository.save(product);
  }

  /**
   * Soft delete a product
   */
  async remove(id: string): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['stocks'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Check if product has any stock
    const hasStock = product.stocks?.some((stock) => stock.quantity > 0);
    if (hasStock) {
      throw new BadRequestException(
        'Cannot delete product with existing stock. Please clear all stock first.',
      );
    }

    // Soft delete
    product.deletedAt = new Date();
    await this.productRepository.save(product);
  }

  /**
   * Upload product photo
   */
  async uploadPhoto(id: string, file: Express.Multer.File): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Update photo URL
    product.photoUrl = `/uploads/products/${file.filename}`;
    return this.productRepository.save(product);
  }

  /**
   * Get products with low stock (total stock < minStock)
   */
  async getLowStockProducts(): Promise<ProductWithTotalStock[]> {
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.uom', 'uom')
      .leftJoin('product.stocks', 'stock')
      .addSelect('COALESCE(SUM(stock.quantity), 0)', 'totalStock')
      .where('product.deletedAt IS NULL')
      .groupBy('product.id')
      .addGroupBy('category.id')
      .addGroupBy('brand.id')
      .addGroupBy('uom.id')
      .having('COALESCE(SUM(stock.quantity), 0) < product.minStock')
      .orderBy('product.name', 'ASC');

    const rawResults = await queryBuilder.getRawAndEntities();

    return rawResults.entities.map((product, index) => {
      const raw = rawResults.raw[index];
      return {
        ...product,
        totalStock: parseInt(raw.totalStock || '0', 10),
      };
    });
  }

  /**
   * Get stock breakdown by warehouse for a product
   */
  async getProductStock(id: string): Promise<{
    totalStock: number;
    breakdown: StockByWarehouse[];
  }> {
    const product = await this.productRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const stocks = await this.stockRepository.find({
      where: { productId: id },
      relations: ['warehouse'],
    });

    const breakdown = stocks.map((stock) => ({
      warehouseId: stock.warehouseId,
      warehouseName: stock.warehouse?.name || '',
      warehouseCode: stock.warehouse?.code || '',
      quantity: stock.quantity,
      lastStockOpnameDate: stock.lastStockOpnameDate,
    }));

    const totalStock = breakdown.reduce((sum, item) => sum + item.quantity, 0);

    return {
      totalStock,
      breakdown,
    };
  }
}