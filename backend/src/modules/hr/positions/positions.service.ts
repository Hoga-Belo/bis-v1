import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Position, Employee, EmployeeStatus } from '../../../entities/hr';
import { CreatePositionDto, UpdatePositionDto, PositionQueryDto } from './dto';

@Injectable()
export class PositionsService {
  constructor(
    @InjectRepository(Position)
    private positionRepository: Repository<Position>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  /**
   * Find all positions with pagination and filtering
   */
  async findAll(query: PositionQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'level',
      sortOrder = 'ASC',
    } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.positionRepository
      .createQueryBuilder('position')
      .leftJoin(
        'position.employees',
        'employee',
        'employee.deletedAt IS NULL AND employee.employeeStatus = :activeStatus',
        { activeStatus: EmployeeStatus.ACTIVE },
      )
      .addSelect('COUNT(employee.id)', 'employeeCount')
      .where('position.deletedAt IS NULL')
      .groupBy('position.id');

    if (search) {
      queryBuilder.andWhere(
        '(position.code ILIKE :search OR position.name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Get total count before pagination
    const totalQueryBuilder = this.positionRepository
      .createQueryBuilder('position')
      .where('position.deletedAt IS NULL');

    if (search) {
      totalQueryBuilder.andWhere(
        '(position.code ILIKE :search OR position.name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const total = await totalQueryBuilder.getCount();

    // Apply sorting and pagination
    const validSortFields = ['code', 'name', 'level', 'createdAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'level';
    queryBuilder.orderBy(`position.${sortField}`, sortOrder);
    queryBuilder.skip(skip).take(limit);

    const rawResults = await queryBuilder.getRawAndEntities();

    const data = rawResults.entities.map((position, index) => ({
      id: position.id,
      code: position.code,
      name: position.name,
      level: position.level,
      employeeCount: parseInt(rawResults.raw[index]?.employeeCount || '0', 10),
      createdAt: position.createdAt,
      updatedAt: position.updatedAt,
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
   * Find a single position by ID
   */
  async findOne(id: string) {
    const position = await this.positionRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!position) {
      throw new NotFoundException(`Position with ID ${id} not found`);
    }

    // Get active employee count
    const employeeCount = await this.employeeRepository.count({
      where: {
        positionId: id,
        deletedAt: IsNull(),
        employeeStatus: EmployeeStatus.ACTIVE,
      },
    });

    return {
      id: position.id,
      code: position.code,
      name: position.name,
      level: position.level,
      employeeCount,
      createdAt: position.createdAt,
      updatedAt: position.updatedAt,
    };
  }

  /**
   * Create a new position
   */
  async create(dto: CreatePositionDto, createdBy?: string) {
    // Check if code already exists
    const existingPosition = await this.positionRepository.findOne({
      where: { code: dto.code, deletedAt: IsNull() },
    });

    if (existingPosition) {
      throw new ConflictException(
        `Position with code ${dto.code} already exists`,
      );
    }

    const position = this.positionRepository.create({
      code: dto.code,
      name: dto.name,
      level: dto.level,
      createdBy,
    });

    const savedPosition = await this.positionRepository.save(position);

    return {
      id: savedPosition.id,
      code: savedPosition.code,
      name: savedPosition.name,
      level: savedPosition.level,
      employeeCount: 0,
      createdAt: savedPosition.createdAt,
      updatedAt: savedPosition.updatedAt,
    };
  }

  /**
   * Update a position
   */
  async update(id: string, dto: UpdatePositionDto, updatedBy?: string) {
    const position = await this.positionRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!position) {
      throw new NotFoundException(`Position with ID ${id} not found`);
    }

    // Check if code is being changed and if new code already exists
    if (dto.code && dto.code !== position.code) {
      const existingPosition = await this.positionRepository.findOne({
        where: { code: dto.code, deletedAt: IsNull() },
      });

      if (existingPosition) {
        throw new ConflictException(
          `Position with code ${dto.code} already exists`,
        );
      }
    }

    // Update fields
    if (dto.code !== undefined) {
      position.code = dto.code;
    }
    if (dto.name !== undefined) {
      position.name = dto.name;
    }
    if (dto.level !== undefined) {
      position.level = dto.level;
    }
    position.updatedBy = updatedBy ?? null;

    await this.positionRepository.save(position);

    return this.findOne(id);
  }

  /**
   * Soft delete a position
   */
  async remove(id: string, deletedBy?: string) {
    const position = await this.positionRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!position) {
      throw new NotFoundException(`Position with ID ${id} not found`);
    }

    // Check if any active employees exist with this position
    const activeEmployeeCount = await this.employeeRepository.count({
      where: {
        positionId: id,
        deletedAt: IsNull(),
        employeeStatus: EmployeeStatus.ACTIVE,
      },
    });

    if (activeEmployeeCount > 0) {
      throw new BadRequestException(
        `Cannot delete position with ${activeEmployeeCount} active employee(s). Please reassign employees first.`,
      );
    }

    // Soft delete
    position.deletedAt = new Date();
    position.updatedBy = deletedBy ?? null;

    await this.positionRepository.save(position);

    return { message: 'Position deleted successfully' };
  }
}