import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Category } from '../../../entities/inventory/category.entity';
import { Product } from '../../../entities/inventory/product.entity';
import { CreateCategoryDto, UpdateCategoryDto, CategoryQueryDto } from './dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  /**
   * Find all categories with pagination and filtering
   */
  async findAll(query: CategoryQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      type,
      sortBy = 'name',
      sortOrder = 'ASC',
    } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.categoryRepository
      .createQueryBuilder('category')
      .leftJoin('category.products', 'product', 'product.deletedAt IS NULL')
      .addSelect('COUNT(product.id)', 'productCount')
      .where('category.deletedAt IS NULL')
      .groupBy('category.id');

    if (search) {
      queryBuilder.andWhere(
        '(category.code ILIKE :search OR category.name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (type) {
      queryBuilder.andWhere('category.type = :type', { type });
    }

    // Get total count before pagination
    const totalQueryBuilder = this.categoryRepository
      .createQueryBuilder('category')
      .where('category.deletedAt IS NULL');

    if (search) {
      totalQueryBuilder.andWhere(
        '(category.code ILIKE :search OR category.name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (type) {
      totalQueryBuilder.andWhere('category.type = :type', { type });
    }

    const total = await totalQueryBuilder.getCount();

    // Apply sorting and pagination
    const validSortFields = ['code', 'name', 'type', 'createdAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
    queryBuilder.orderBy(`category.${sortField}`, sortOrder);
    queryBuilder.skip(skip).take(limit);

    const rawResults = await queryBuilder.getRawAndEntities();

    const data = rawResults.entities.map((category, index) => ({
      id: category.id,
      code: category.code,
      name: category.name,
      type: category.type,
      description: category.description,
      productCount: parseInt(rawResults.raw[index]?.productCount || '0', 10),
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }));

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find a single category by ID with products count
   */
  async findOne(id: string) {
    const category = await this.categoryRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Get active products count
    const productCount = await this.productRepository.count({
      where: { categoryId: id, deletedAt: IsNull() },
    });

    return {
      id: category.id,
      code: category.code,
      name: category.name,
      type: category.type,
      description: category.description,
      productCount,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  /**
   * Create a new category
   */
  async create(dto: CreateCategoryDto, createdBy?: string) {
    // Check if code already exists
    const existingCategory = await this.categoryRepository.findOne({
      where: { code: dto.code, deletedAt: IsNull() },
    });

    if (existingCategory) {
      throw new ConflictException(`Category with code ${dto.code} already exists`);
    }

    const category = this.categoryRepository.create({
      code: dto.code,
      name: dto.name,
      type: dto.type,
      description: dto.description || null,
      createdBy,
    });

    const savedCategory = await this.categoryRepository.save(category);

    return {
      id: savedCategory.id,
      code: savedCategory.code,
      name: savedCategory.name,
      type: savedCategory.type,
      description: savedCategory.description,
      productCount: 0,
      createdAt: savedCategory.createdAt,
      updatedAt: savedCategory.updatedAt,
    };
  }

  /**
   * Update a category
   */
  async update(id: string, dto: UpdateCategoryDto, updatedBy?: string) {
    const category = await this.categoryRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Check if code is being changed and if new code already exists
    if (dto.code && dto.code !== category.code) {
      const existingCategory = await this.categoryRepository.findOne({
        where: { code: dto.code, deletedAt: IsNull() },
      });

      if (existingCategory) {
        throw new ConflictException(`Category with code ${dto.code} already exists`);
      }
    }

    // Update fields
    if (dto.code !== undefined) {
      category.code = dto.code;
    }
    if (dto.name !== undefined) {
      category.name = dto.name;
    }
    if (dto.type !== undefined) {
      category.type = dto.type;
    }
    if (dto.description !== undefined) {
      category.description = dto.description || null;
    }
    category.updatedBy = updatedBy ?? null;

    await this.categoryRepository.save(category);

    return this.findOne(id);
  }

  /**
   * Soft delete a category
   */
  async remove(id: string, deletedBy?: string) {
    const category = await this.categoryRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Check if any active products exist
    const activeProductsCount = await this.productRepository.count({
      where: { categoryId: id, deletedAt: IsNull() },
    });

    if (activeProductsCount > 0) {
      throw new BadRequestException(
        `Cannot delete category with ${activeProductsCount} active product(s). Please delete or reassign products first.`,
      );
    }

    // Soft delete
    category.deletedAt = new Date();
    category.updatedBy = deletedBy ?? null;

    await this.categoryRepository.save(category);

    return { message: 'Category deleted successfully' };
  }
}