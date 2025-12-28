import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { JobGrade, Employee, EmployeeStatus } from '../../../entities/hr';
import { CreateJobGradeDto, UpdateJobGradeDto, JobGradeQueryDto } from './dto';

@Injectable()
export class JobGradesService {
  constructor(
    @InjectRepository(JobGrade)
    private jobGradeRepository: Repository<JobGrade>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  /**
   * Validate that minSalary is less than maxSalary
   */
  private validateSalaryRange(minSalary?: number, maxSalary?: number): void {
    if (
      minSalary !== undefined &&
      maxSalary !== undefined &&
      minSalary > maxSalary
    ) {
      throw new BadRequestException(
        'Minimum salary must be less than or equal to maximum salary',
      );
    }
  }

  /**
   * Find all job grades with pagination and filtering
   */
  async findAll(query: JobGradeQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'code',
      sortOrder = 'ASC',
    } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.jobGradeRepository
      .createQueryBuilder('jobGrade')
      .leftJoin(
        'jobGrade.employees',
        'employee',
        'employee.deletedAt IS NULL AND employee.employeeStatus = :activeStatus',
        { activeStatus: EmployeeStatus.ACTIVE },
      )
      .addSelect('COUNT(employee.id)', 'employeeCount')
      .where('jobGrade.deletedAt IS NULL')
      .groupBy('jobGrade.id');

    if (search) {
      queryBuilder.andWhere(
        '(jobGrade.code ILIKE :search OR jobGrade.name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Get total count before pagination
    const totalQueryBuilder = this.jobGradeRepository
      .createQueryBuilder('jobGrade')
      .where('jobGrade.deletedAt IS NULL');

    if (search) {
      totalQueryBuilder.andWhere(
        '(jobGrade.code ILIKE :search OR jobGrade.name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const total = await totalQueryBuilder.getCount();

    // Apply sorting and pagination
    const validSortFields = ['code', 'name', 'minSalary', 'maxSalary', 'createdAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'code';
    queryBuilder.orderBy(`jobGrade.${sortField}`, sortOrder);
    queryBuilder.skip(skip).take(limit);

    const rawResults = await queryBuilder.getRawAndEntities();

    const data = rawResults.entities.map((jobGrade, index) => ({
      id: jobGrade.id,
      code: jobGrade.code,
      name: jobGrade.name,
      minSalary: jobGrade.minSalary ? Number(jobGrade.minSalary) : null,
      maxSalary: jobGrade.maxSalary ? Number(jobGrade.maxSalary) : null,
      employeeCount: parseInt(rawResults.raw[index]?.employeeCount || '0', 10),
      createdAt: jobGrade.createdAt,
      updatedAt: jobGrade.updatedAt,
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
   * Find a single job grade by ID
   */
  async findOne(id: string) {
    const jobGrade = await this.jobGradeRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!jobGrade) {
      throw new NotFoundException(`Job grade with ID ${id} not found`);
    }

    // Get active employee count
    const employeeCount = await this.employeeRepository.count({
      where: {
        jobGradeId: id,
        deletedAt: IsNull(),
        employeeStatus: EmployeeStatus.ACTIVE,
      },
    });

    return {
      id: jobGrade.id,
      code: jobGrade.code,
      name: jobGrade.name,
      minSalary: jobGrade.minSalary ? Number(jobGrade.minSalary) : null,
      maxSalary: jobGrade.maxSalary ? Number(jobGrade.maxSalary) : null,
      employeeCount,
      createdAt: jobGrade.createdAt,
      updatedAt: jobGrade.updatedAt,
    };
  }

  /**
   * Create a new job grade
   */
  async create(dto: CreateJobGradeDto, createdBy?: string) {
    // Validate salary range
    this.validateSalaryRange(dto.minSalary, dto.maxSalary);

    // Check if code already exists
    const existingJobGrade = await this.jobGradeRepository.findOne({
      where: { code: dto.code, deletedAt: IsNull() },
    });

    if (existingJobGrade) {
      throw new ConflictException(
        `Job grade with code ${dto.code} already exists`,
      );
    }

    const jobGrade = this.jobGradeRepository.create({
      code: dto.code,
      name: dto.name,
      minSalary: dto.minSalary ?? null,
      maxSalary: dto.maxSalary ?? null,
      createdBy,
    });

    const savedJobGrade = await this.jobGradeRepository.save(jobGrade);

    return {
      id: savedJobGrade.id,
      code: savedJobGrade.code,
      name: savedJobGrade.name,
      minSalary: savedJobGrade.minSalary ? Number(savedJobGrade.minSalary) : null,
      maxSalary: savedJobGrade.maxSalary ? Number(savedJobGrade.maxSalary) : null,
      employeeCount: 0,
      createdAt: savedJobGrade.createdAt,
      updatedAt: savedJobGrade.updatedAt,
    };
  }

  /**
   * Update a job grade
   */
  async update(id: string, dto: UpdateJobGradeDto, updatedBy?: string) {
    const jobGrade = await this.jobGradeRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!jobGrade) {
      throw new NotFoundException(`Job grade with ID ${id} not found`);
    }

    // Determine final values for salary validation
    const finalMinSalary = dto.minSalary !== undefined ? dto.minSalary : jobGrade.minSalary;
    const finalMaxSalary = dto.maxSalary !== undefined ? dto.maxSalary : jobGrade.maxSalary;

    // Validate salary range with final values
    this.validateSalaryRange(
      finalMinSalary !== null ? Number(finalMinSalary) : undefined,
      finalMaxSalary !== null ? Number(finalMaxSalary) : undefined,
    );

    // Check if code is being changed and if new code already exists
    if (dto.code && dto.code !== jobGrade.code) {
      const existingJobGrade = await this.jobGradeRepository.findOne({
        where: { code: dto.code, deletedAt: IsNull() },
      });

      if (existingJobGrade) {
        throw new ConflictException(
          `Job grade with code ${dto.code} already exists`,
        );
      }
    }

    // Update fields
    if (dto.code !== undefined) {
      jobGrade.code = dto.code;
    }
    if (dto.name !== undefined) {
      jobGrade.name = dto.name;
    }
    if (dto.minSalary !== undefined) {
      jobGrade.minSalary = dto.minSalary ?? null;
    }
    if (dto.maxSalary !== undefined) {
      jobGrade.maxSalary = dto.maxSalary ?? null;
    }
    jobGrade.updatedBy = updatedBy ?? null;

    await this.jobGradeRepository.save(jobGrade);

    return this.findOne(id);
  }

  /**
   * Soft delete a job grade
   */
  async remove(id: string, deletedBy?: string) {
    const jobGrade = await this.jobGradeRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!jobGrade) {
      throw new NotFoundException(`Job grade with ID ${id} not found`);
    }

    // Check if any active employees exist with this job grade
    const activeEmployeeCount = await this.employeeRepository.count({
      where: {
        jobGradeId: id,
        deletedAt: IsNull(),
        employeeStatus: EmployeeStatus.ACTIVE,
      },
    });

    if (activeEmployeeCount > 0) {
      throw new BadRequestException(
        `Cannot delete job grade with ${activeEmployeeCount} active employee(s). Please reassign employees first.`,
      );
    }

    // Soft delete
    jobGrade.deletedAt = new Date();
    jobGrade.updatedBy = deletedBy ?? null;

    await this.jobGradeRepository.save(jobGrade);

    return { message: 'Job grade deleted successfully' };
  }
}