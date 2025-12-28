import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Division, Department } from '../../../entities/hr';
import { CreateDivisionDto, UpdateDivisionDto, DivisionQueryDto } from './dto';

@Injectable()
export class DivisionsService {
  constructor(
    @InjectRepository(Division)
    private divisionRepository: Repository<Division>,
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
  ) {}

  /**
   * Find all divisions with pagination and filtering
   */
  async findAll(query: DivisionQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'name',
      sortOrder = 'ASC',
    } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.divisionRepository
      .createQueryBuilder('division')
      .leftJoin('division.departments', 'department', 'department.deletedAt IS NULL')
      .addSelect('COUNT(department.id)', 'departmentCount')
      .where('division.deletedAt IS NULL')
      .groupBy('division.id');

    if (search) {
      queryBuilder.andWhere(
        '(division.code ILIKE :search OR division.name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Get total count before pagination
    const totalQueryBuilder = this.divisionRepository
      .createQueryBuilder('division')
      .where('division.deletedAt IS NULL');

    if (search) {
      totalQueryBuilder.andWhere(
        '(division.code ILIKE :search OR division.name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const total = await totalQueryBuilder.getCount();

    // Apply sorting and pagination
    const validSortFields = ['code', 'name', 'createdAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
    queryBuilder.orderBy(`division.${sortField}`, sortOrder);
    queryBuilder.skip(skip).take(limit);

    const rawResults = await queryBuilder.getRawAndEntities();

    const data = rawResults.entities.map((division, index) => ({
      id: division.id,
      code: division.code,
      name: division.name,
      description: division.description,
      departmentCount: parseInt(rawResults.raw[index]?.departmentCount || '0', 10),
      createdAt: division.createdAt,
      updatedAt: division.updatedAt,
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
   * Find a single division by ID with departments
   */
  async findOne(id: string) {
    const division = await this.divisionRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['departments'],
    });

    if (!division) {
      throw new NotFoundException(`Division with ID ${id} not found`);
    }

    // Filter out soft-deleted departments
    const activeDepartments = division.departments?.filter(
      (dept) => dept.deletedAt === null,
    ) || [];

    return {
      id: division.id,
      code: division.code,
      name: division.name,
      description: division.description,
      departments: activeDepartments.map((dept) => ({
        id: dept.id,
        code: dept.code,
        name: dept.name,
      })),
      departmentCount: activeDepartments.length,
      createdAt: division.createdAt,
      updatedAt: division.updatedAt,
    };
  }

  /**
   * Create a new division
   */
  async create(dto: CreateDivisionDto, createdBy?: string) {
    // Check if code already exists
    const existingDivision = await this.divisionRepository.findOne({
      where: { code: dto.code, deletedAt: IsNull() },
    });

    if (existingDivision) {
      throw new ConflictException(`Division with code ${dto.code} already exists`);
    }

    const division = this.divisionRepository.create({
      code: dto.code,
      name: dto.name,
      description: dto.description || null,
      createdBy,
    });

    const savedDivision = await this.divisionRepository.save(division);

    return {
      id: savedDivision.id,
      code: savedDivision.code,
      name: savedDivision.name,
      description: savedDivision.description,
      departmentCount: 0,
      createdAt: savedDivision.createdAt,
      updatedAt: savedDivision.updatedAt,
    };
  }

  /**
   * Update a division
   */
  async update(id: string, dto: UpdateDivisionDto, updatedBy?: string) {
    const division = await this.divisionRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!division) {
      throw new NotFoundException(`Division with ID ${id} not found`);
    }

    // Check if code is being changed and if new code already exists
    if (dto.code && dto.code !== division.code) {
      const existingDivision = await this.divisionRepository.findOne({
        where: { code: dto.code, deletedAt: IsNull() },
      });

      if (existingDivision) {
        throw new ConflictException(`Division with code ${dto.code} already exists`);
      }
    }

    // Update fields
    if (dto.code !== undefined) {
      division.code = dto.code;
    }
    if (dto.name !== undefined) {
      division.name = dto.name;
    }
    if (dto.description !== undefined) {
      division.description = dto.description || null;
    }
    division.updatedBy = updatedBy ?? null;

    await this.divisionRepository.save(division);

    return this.findOne(id);
  }

  /**
   * Soft delete a division
   */
  async remove(id: string, deletedBy?: string) {
    const division = await this.divisionRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['departments'],
    });

    if (!division) {
      throw new NotFoundException(`Division with ID ${id} not found`);
    }

    // Check if any active departments exist
    const activeDepartments = division.departments?.filter(
      (dept) => dept.deletedAt === null,
    ) || [];

    if (activeDepartments.length > 0) {
      throw new BadRequestException(
        `Cannot delete division with ${activeDepartments.length} active department(s). Please delete or reassign departments first.`,
      );
    }

    // Soft delete
    division.deletedAt = new Date();
    division.updatedBy = deletedBy ?? null;

    await this.divisionRepository.save(division);

    return { message: 'Division deleted successfully' };
  }
}