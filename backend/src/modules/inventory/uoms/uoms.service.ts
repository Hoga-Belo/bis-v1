import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Uom } from '../../../entities/inventory/uom.entity';
import { Product } from '../../../entities/inventory/product.entity';
import { CreateUomDto, UpdateUomDto, UomQueryDto } from './dto';

@Injectable()
export class UomsService {
  constructor(
    @InjectRepository(Uom)
    private readonly uomRepository: Repository<Uom>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findAll(query: UomQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const queryBuilder = this.uomRepository
      .createQueryBuilder('uom')
      .where('uom.deletedAt IS NULL');

    // Search by code or name
    if (search) {
      queryBuilder.andWhere(
        '(uom.code ILIKE :search OR uom.name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Get product count for each UOM
    queryBuilder
      .loadRelationCountAndMap(
        'uom.productCount',
        'uom.products',
        'product',
        (qb) => qb.where('product.deletedAt IS NULL'),
      )
      .orderBy(`uom.${sortBy}`, sortOrder)
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

  async findOne(id: string): Promise<Uom> {
    const uom = await this.uomRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!uom) {
      throw new NotFoundException(`Satuan dengan ID ${id} tidak ditemukan`);
    }

    // Get product count
    const productCount = await this.productRepository.count({
      where: { uomId: id, deletedAt: IsNull() },
    });

    return { ...uom, productCount } as Uom & { productCount: number };
  }

  async create(createUomDto: CreateUomDto, userId: string): Promise<Uom> {
    // Check if code already exists
    const existingUom = await this.uomRepository.findOne({
      where: { code: createUomDto.code, deletedAt: IsNull() },
    });

    if (existingUom) {
      throw new ConflictException(
        `Satuan dengan kode ${createUomDto.code} sudah ada`,
      );
    }

    const uom = this.uomRepository.create({
      ...createUomDto,
      createdBy: userId,
      updatedBy: userId,
    });

    return this.uomRepository.save(uom);
  }

  async update(
    id: string,
    updateUomDto: UpdateUomDto,
    userId: string,
  ): Promise<Uom> {
    const uom = await this.findOne(id);

    // Check if code already exists (if code is being updated)
    if (updateUomDto.code && updateUomDto.code !== uom.code) {
      const existingUom = await this.uomRepository.findOne({
        where: { code: updateUomDto.code, deletedAt: IsNull() },
      });

      if (existingUom) {
        throw new ConflictException(
          `Satuan dengan kode ${updateUomDto.code} sudah ada`,
        );
      }
    }

    Object.assign(uom, {
      ...updateUomDto,
      updatedBy: userId,
    });

    return this.uomRepository.save(uom);
  }

  async remove(id: string, userId: string): Promise<void> {
    const uom = await this.findOne(id);

    // Check if UOM has active products
    const productCount = await this.productRepository.count({
      where: { uomId: id, deletedAt: IsNull() },
    });

    if (productCount > 0) {
      throw new BadRequestException(
        `Tidak dapat menghapus satuan karena masih digunakan oleh ${productCount} produk aktif`,
      );
    }

    // Soft delete
    uom.deletedAt = new Date();
    uom.updatedBy = userId;
    await this.uomRepository.save(uom);
  }
}