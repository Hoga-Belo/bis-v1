import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import {
  EmploymentStatus as EmploymentStatusEntity,
  Employee,
  EmployeeStatus,
} from '../../../entities/hr';
import {
  CreateEmploymentStatusDto,
  UpdateEmploymentStatusDto,
  EmploymentStatusQueryDto,
} from './dto';

@Injectable()
export class EmploymentStatusesService {
  constructor(
    @InjectRepository(EmploymentStatusEntity)
    private employmentStatusRepository: Repository<EmploymentStatusEntity>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  /**
   * Find all employment statuses with pagination and filtering
   */
  async findAll(query: EmploymentStatusQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'name',
      sortOrder = 'ASC',
    } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.employmentStatusRepository
      .createQueryBuilder('employmentStatus')
      .where('employmentStatus.deletedAt IS NULL');

    if (search) {
      queryBuilder.andWhere(
        '(employmentStatus.code ILIKE :search OR employmentStatus.name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Get total count before pagination
    const total = await queryBuilder.getCount();

    // Apply sorting and pagination
    const validSortFields = ['code', 'name', 'createdAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
    queryBuilder.orderBy(`employmentStatus.${sortField}`, sortOrder);
    queryBuilder.skip(skip).take(limit);

    const employmentStatuses = await queryBuilder.getMany();

    // Get employee counts for each employment status using subquery
    const employmentStatusIds = employmentStatuses.map((es) => es.id);
    const employeeCounts: Record<string, number> = {};

    if (employmentStatusIds.length > 0) {
      const counts = await this.employeeRepository
        .createQueryBuilder('employee')
        .select('employee.employmentStatusId', 'employmentStatusId')
        .addSelect('COUNT(employee.id)', 'count')
        .where('employee.employmentStatusId IN (:...employmentStatusIds)', {
          employmentStatusIds,
        })
        .andWhere('employee.deletedAt IS NULL')
        .andWhere('employee.employeeStatus = :activeStatus', {
          activeStatus: EmployeeStatus.ACTIVE,
        })
        .groupBy('employee.employmentStatusId')
        .getRawMany();

      counts.forEach((c) => {
        employeeCounts[c.employmentStatusId] = parseInt(c.count, 10);
      });
    }

    const data = employmentStatuses.map((employmentStatus) => ({
      id: employmentStatus.id,
      code: employmentStatus.code,
      name: employmentStatus.name,
      description: employmentStatus.description,
      employeeCount: employeeCounts[employmentStatus.id] || 0,
      createdAt: employmentStatus.createdAt,
      updatedAt: employmentStatus.updatedAt,
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
   * Find a single employment status by ID
   */
  async findOne(id: string) {
    const employmentStatus = await this.employmentStatusRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!employmentStatus) {
      throw new NotFoundException(`Employment status with ID ${id} not found`);
    }

    // Get active employee count
    const employeeCount = await this.employeeRepository.count({
      where: {
        employmentStatusId: id,
        deletedAt: IsNull(),
        employeeStatus: EmployeeStatus.ACTIVE,
      },
    });

    return {
      id: employmentStatus.id,
      code: employmentStatus.code,
      name: employmentStatus.name,
      description: employmentStatus.description,
      employeeCount,
      createdAt: employmentStatus.createdAt,
      updatedAt: employmentStatus.updatedAt,
    };
  }

  /**
   * Create a new employment status
   */
  async create(dto: CreateEmploymentStatusDto, createdBy?: string) {
    // Check if code already exists
    const existingEmploymentStatus =
      await this.employmentStatusRepository.findOne({
        where: { code: dto.code, deletedAt: IsNull() },
      });

    if (existingEmploymentStatus) {
      throw new ConflictException(
        `Employment status with code ${dto.code} already exists`,
      );
    }

    const employmentStatus = this.employmentStatusRepository.create({
      code: dto.code,
      name: dto.name,
      description: dto.description || null,
      createdBy,
    });

    const savedEmploymentStatus =
      await this.employmentStatusRepository.save(employmentStatus);

    return {
      id: savedEmploymentStatus.id,
      code: savedEmploymentStatus.code,
      name: savedEmploymentStatus.name,
      description: savedEmploymentStatus.description,
      employeeCount: 0,
      createdAt: savedEmploymentStatus.createdAt,
      updatedAt: savedEmploymentStatus.updatedAt,
    };
  }

  /**
   * Update an employment status
   */
  async update(id: string, dto: UpdateEmploymentStatusDto, updatedBy?: string) {
    const employmentStatus = await this.employmentStatusRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!employmentStatus) {
      throw new NotFoundException(`Employment status with ID ${id} not found`);
    }

    // Check if code is being changed and if new code already exists
    if (dto.code && dto.code !== employmentStatus.code) {
      const existingEmploymentStatus =
        await this.employmentStatusRepository.findOne({
          where: { code: dto.code, deletedAt: IsNull() },
        });

      if (existingEmploymentStatus) {
        throw new ConflictException(
          `Employment status with code ${dto.code} already exists`,
        );
      }
    }

    // Update fields
    if (dto.code !== undefined) {
      employmentStatus.code = dto.code;
    }
    if (dto.name !== undefined) {
      employmentStatus.name = dto.name;
    }
    if (dto.description !== undefined) {
      employmentStatus.description = dto.description || null;
    }
    employmentStatus.updatedBy = updatedBy ?? null;

    await this.employmentStatusRepository.save(employmentStatus);

    return this.findOne(id);
  }

  /**
   * Soft delete an employment status
   */
  async remove(id: string, deletedBy?: string) {
    const employmentStatus = await this.employmentStatusRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!employmentStatus) {
      throw new NotFoundException(`Employment status with ID ${id} not found`);
    }

    // Check if any active employees exist with this employment status
    const activeEmployeeCount = await this.employeeRepository.count({
      where: {
        employmentStatusId: id,
        deletedAt: IsNull(),
        employeeStatus: EmployeeStatus.ACTIVE,
      },
    });

    if (activeEmployeeCount > 0) {
      throw new BadRequestException(
        `Cannot delete employment status with ${activeEmployeeCount} active employee(s). Please reassign employees first.`,
      );
    }

    // Soft delete
    employmentStatus.deletedAt = new Date();
    employmentStatus.updatedBy = deletedBy ?? null;

    await this.employmentStatusRepository.save(employmentStatus);

    return { message: 'Employment status deleted successfully' };
  }
}