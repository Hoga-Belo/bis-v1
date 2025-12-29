import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Brand } from '../../../entities/inventory/brand.entity';
import { Product } from '../../../entities/inventory/product.entity';
import { CreateBrandDto, UpdateBrandDto, BrandQueryDto } from './dto';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findAll(query: BrandQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const queryBuilder = this.brandRepository
      .createQueryBuilder('brand')
      .where('brand.deletedAt IS NULL');

    // Search by code or name
    if (search) {
      queryBuilder.andWhere(
        '(brand.code ILIKE :search OR brand.name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Get product count for each brand
    queryBuilder
      .loadRelationCountAndMap(
        'brand.productCount',
        'brand.products',
        'product',
        (qb) => qb.where('product.deletedAt IS NULL'),
      )
      .orderBy(`brand.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

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

  async findOne(id: string): Promise<Brand> {
    const brand = await this.brandRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!brand) {
      throw new NotFoundException(`Brand dengan ID ${id} tidak ditemukan`);
    }

    // Get product count
    const productCount = await this.productRepository.count({
      where: { brandId: id, deletedAt: IsNull() },
    });

    return { ...brand, productCount } as Brand & { productCount: number };
  }

  async create(createBrandDto: CreateBrandDto, userId: string): Promise<Brand> {
    // Check if code already exists
    const existingBrand = await this.brandRepository.findOne({
      where: { code: createBrandDto.code, deletedAt: IsNull() },
    });

    if (existingBrand) {
      throw new ConflictException(
        `Brand dengan kode ${createBrandDto.code} sudah ada`,
      );
    }

    const brand = this.brandRepository.create({
      ...createBrandDto,
      createdBy: userId,
      updatedBy: userId,
    });

    return this.brandRepository.save(brand);
  }

  async update(
    id: string,
    updateBrandDto: UpdateBrandDto,
    userId: string,
  ): Promise<Brand> {
    const brand = await this.findOne(id);

    // Check if code already exists (if code is being updated)
    if (updateBrandDto.code && updateBrandDto.code !== brand.code) {
      const existingBrand = await this.brandRepository.findOne({
        where: { code: updateBrandDto.code, deletedAt: IsNull() },
      });

      if (existingBrand) {
        throw new ConflictException(
          `Brand dengan kode ${updateBrandDto.code} sudah ada`,
        );
      }
    }

    Object.assign(brand, {
      ...updateBrandDto,
      updatedBy: userId,
    });

    return this.brandRepository.save(brand);
  }

  async remove(id: string, userId: string): Promise<void> {
    const brand = await this.findOne(id);

    // Check if brand has active products
    const productCount = await this.productRepository.count({
      where: { brandId: id, deletedAt: IsNull() },
    });

    if (productCount > 0) {
      throw new BadRequestException(
        `Tidak dapat menghapus brand karena masih memiliki ${productCount} produk aktif`,
      );
    }

    // Soft delete
    brand.deletedAt = new Date();
    brand.updatedBy = userId;
    await this.brandRepository.save(brand);
  }
}