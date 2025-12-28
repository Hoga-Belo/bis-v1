import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Department, Division, Employee, EmployeeStatus } from '../../../entities/hr';
import { CreateDepartmentDto, UpdateDepartmentDto, DepartmentQueryDto } from './dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
    @InjectRepository(Division)
    private divisionRepository: Repository<Division>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  /**
   * Find all departments with pagination and filtering
   */
  async findAll(query: DepartmentQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      divisionId,
      sortBy = 'name',
      sortOrder = 'ASC',
    } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.departmentRepository
      .createQueryBuilder('department')
      .leftJoin('department.division', 'division')
      .addSelect(['division.id', 'division.code', 'division.name'])
      .leftJoin('department.employees', 'employee', 'employee.deletedAt IS NULL AND employee.employeeStatus = :activeStatus', { activeStatus: EmployeeStatus.ACTIVE })
      .addSelect('COUNT(employee.id)', 'employeeCount')
      .where('department.deletedAt IS NULL')
      .groupBy('department.id')
      .addGroupBy('division.id');

    if (search) {
      queryBuilder.andWhere(
        '(department.code ILIKE :search OR department.name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (divisionId) {
      queryBuilder.andWhere('department.divisionId = :divisionId', { divisionId });
    }

    // Get total count before pagination
    const totalQueryBuilder = this.departmentRepository
      .createQueryBuilder('department')
      .where('department.deletedAt IS NULL');

    if (search) {
      totalQueryBuilder.andWhere(
        '(department.code ILIKE :search OR department.name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (divisionId) {
      totalQueryBuilder.andWhere('department.divisionId = :divisionId', { divisionId });
    }

    const total = await totalQueryBuilder.getCount();

    // Apply sorting and pagination
    const validSortFields = ['code', 'name', 'createdAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
    queryBuilder.orderBy(`department.${sortField}`, sortOrder);
    queryBuilder.skip(skip).take(limit);

    const rawResults = await queryBuilder.getRawAndEntities();

    const data = rawResults.entities.map((department, index) => ({
      id: department.id,
      code: department.code,
      name: department.name,
      description: department.description,
      divisionId: department.divisionId,
      division: rawResults.raw[index]?.division_id
        ? {
            id: rawResults.raw[index].division_id,
            code: rawResults.raw[index].division_code,
            name: rawResults.raw[index].division_name,
          }
        : null,
      managerId: department.managerId,
      employeeCount: parseInt(rawResults.raw[index]?.employeeCount || '0', 10),
      createdAt: department.createdAt,
      updatedAt: department.updatedAt,
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
   * Find a single department by ID with relations
   */
  async findOne(id: string) {
    const department = await this.departmentRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['division', 'employees'],
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    // Get manager details if managerId exists
    let manager = null;
    if (department.managerId) {
      const managerEmployee = await this.employeeRepository.findOne({
        where: { id: department.managerId, deletedAt: IsNull() },
      });
      if (managerEmployee) {
        manager = {
          id: managerEmployee.id,
          nik: managerEmployee.nik,
          fullName: managerEmployee.fullName,
        };
      }
    }

    // Filter out soft-deleted and inactive employees
    const activeEmployees = department.employees?.filter(
      (emp: Employee) => emp.deletedAt === null && emp.employeeStatus === EmployeeStatus.ACTIVE,
    ) || [];

    return {
      id: department.id,
      code: department.code,
      name: department.name,
      description: department.description,
      divisionId: department.divisionId,
      division: department.division
        ? {
            id: department.division.id,
            code: department.division.code,
            name: department.division.name,
          }
        : null,
      managerId: department.managerId,
      manager,
      employees: activeEmployees.map((emp: Employee) => ({
        id: emp.id,
        nik: emp.nik,
        fullName: emp.fullName,
      })),
      employeeCount: activeEmployees.length,
      createdAt: department.createdAt,
      updatedAt: department.updatedAt,
    };
  }

  /**
   * Create a new department
   */
  async create(dto: CreateDepartmentDto, createdBy?: string) {
    // Validate division exists
    const division = await this.divisionRepository.findOne({
      where: { id: dto.divisionId, deletedAt: IsNull() },
    });

    if (!division) {
      throw new NotFoundException(`Division with ID ${dto.divisionId} not found`);
    }

    // Validate manager if provided
    if (dto.managerId) {
      const manager = await this.employeeRepository.findOne({
        where: { id: dto.managerId, deletedAt: IsNull() },
      });

      if (!manager) {
        throw new BadRequestException(`Employee with ID ${dto.managerId} not found`);
      }

      if (manager.employeeStatus !== EmployeeStatus.ACTIVE) {
        throw new BadRequestException(
          `Employee with ID ${dto.managerId} is not active. Only active employees can be assigned as manager.`,
        );
      }
    }

    // Check if code already exists
    const existingDepartment = await this.departmentRepository.findOne({
      where: { code: dto.code, deletedAt: IsNull() },
    });

    if (existingDepartment) {
      throw new ConflictException(`Department with code ${dto.code} already exists`);
    }

    const department = this.departmentRepository.create({
      divisionId: dto.divisionId,
      code: dto.code,
      name: dto.name,
      managerId: dto.managerId || null,
      description: dto.description || null,
      createdBy,
    });

    const savedDepartment = await this.departmentRepository.save(department);

    return {
      id: savedDepartment.id,
      code: savedDepartment.code,
      name: savedDepartment.name,
      description: savedDepartment.description,
      divisionId: savedDepartment.divisionId,
      division: {
        id: division.id,
        code: division.code,
        name: division.name,
      },
      managerId: savedDepartment.managerId,
      employeeCount: 0,
      createdAt: savedDepartment.createdAt,
      updatedAt: savedDepartment.updatedAt,
    };
  }

  /**
   * Update a department
   */
  async update(id: string, dto: UpdateDepartmentDto, updatedBy?: string) {
    const department = await this.departmentRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    // Validate division if changed
    if (dto.divisionId && dto.divisionId !== department.divisionId) {
      const division = await this.divisionRepository.findOne({
        where: { id: dto.divisionId, deletedAt: IsNull() },
      });

      if (!division) {
        throw new NotFoundException(`Division with ID ${dto.divisionId} not found`);
      }
    }

    // Validate manager if changed
    if (dto.managerId !== undefined && dto.managerId !== department.managerId) {
      if (dto.managerId) {
        const manager = await this.employeeRepository.findOne({
          where: { id: dto.managerId, deletedAt: IsNull() },
        });

        if (!manager) {
          throw new BadRequestException(`Employee with ID ${dto.managerId} not found`);
        }

        if (manager.employeeStatus !== EmployeeStatus.ACTIVE) {
          throw new BadRequestException(
            `Employee with ID ${dto.managerId} is not active. Only active employees can be assigned as manager.`,
          );
        }
      }
    }

    // Check if code is being changed and if new code already exists
    if (dto.code && dto.code !== department.code) {
      const existingDepartment = await this.departmentRepository.findOne({
        where: { code: dto.code, deletedAt: IsNull() },
      });

      if (existingDepartment) {
        throw new ConflictException(`Department with code ${dto.code} already exists`);
      }
    }

    // Update fields
    if (dto.divisionId !== undefined) {
      department.divisionId = dto.divisionId;
    }
    if (dto.code !== undefined) {
      department.code = dto.code;
    }
    if (dto.name !== undefined) {
      department.name = dto.name;
    }
    if (dto.managerId !== undefined) {
      department.managerId = dto.managerId || null;
    }
    if (dto.description !== undefined) {
      department.description = dto.description || null;
    }
    department.updatedBy = updatedBy ?? null;

    await this.departmentRepository.save(department);

    return this.findOne(id);
  }

  /**
   * Soft delete a department
   */
  async remove(id: string, deletedBy?: string) {
    const department = await this.departmentRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['employees'],
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    // Check if any active employees exist
    const activeEmployees = department.employees?.filter(
      (emp: Employee) => emp.deletedAt === null && emp.employeeStatus === EmployeeStatus.ACTIVE,
    ) || [];

    if (activeEmployees.length > 0) {
      throw new BadRequestException(
        `Cannot delete department with ${activeEmployees.length} active employee(s). Please reassign employees first.`,
      );
    }

    // Soft delete
    department.deletedAt = new Date();
    department.updatedBy = deletedBy ?? null;

    await this.departmentRepository.save(department);

    return { message: 'Department deleted successfully' };
  }

  /**
   * Find employees in a department with pagination
   */
  async findEmployees(id: string, query: PaginationDto) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    // Check if department exists
    const department = await this.departmentRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    const [employees, total] = await this.employeeRepository.findAndCount({
      where: {
        departmentId: id,
        deletedAt: IsNull(),
        employeeStatus: EmployeeStatus.ACTIVE,
      },
      skip,
      take: limit,
      order: { fullName: 'ASC' },
    });

    const data = employees.map((emp) => ({
      id: emp.id,
      nik: emp.nik,
      fullName: emp.fullName,
      email: emp.email,
      phoneNumber: emp.phoneNumber,
      employeeStatus: emp.employeeStatus,
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
}