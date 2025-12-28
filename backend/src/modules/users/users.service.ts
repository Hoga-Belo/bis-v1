import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole, Role } from '../../entities/user-access';
import { Employee } from '../../entities/hr';
import { CreateUserDto, UpdateUserDto, AssignRolesDto, UserQueryDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    private dataSource: DataSource,
  ) {}

  /**
   * Find all users with pagination and filtering
   */
  async findAll(query: UserQueryDto) {
    const { page = 1, limit = 10, search, roleId, isActive } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.employee', 'employee')
      .leftJoinAndSelect('user.userRoles', 'userRoles')
      .leftJoinAndSelect('userRoles.role', 'role')
      .where('user.deletedAt IS NULL');

    if (search) {
      queryBuilder.andWhere('(user.nik ILIKE :search OR employee.fullName ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (roleId) {
      queryBuilder.andWhere('role.id = :roleId', { roleId });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('user.isActive = :isActive', { isActive });
    }

    const [users, total] = await queryBuilder
      .orderBy('user.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: users.map((user) => this.transformUser(user)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find a single user by ID with full details
   */
  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: [
        'employee',
        'userRoles',
        'userRoles.role',
        'userRoles.role.rolePermissions',
        'userRoles.role.rolePermissions.permission',
      ],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.transformUserWithPermissions(user);
  }

  /**
   * Create a new user with roles
   */
  async create(dto: CreateUserDto, createdBy?: string) {
    // Check if NIK already exists
    const existingUser = await this.userRepository.findOne({
      where: { nik: dto.nik, deletedAt: IsNull() },
    });

    if (existingUser) {
      throw new ConflictException(`User with NIK ${dto.nik} already exists`);
    }

    // Validate roles exist
    const roles = await this.roleRepository.findByIds(dto.roleIds);
    if (roles.length !== dto.roleIds.length) {
      throw new BadRequestException('One or more role IDs are invalid');
    }

    // Validate employee if provided
    if (dto.employeeId) {
      const employee = await this.employeeRepository.findOne({
        where: { id: dto.employeeId, deletedAt: IsNull() },
      });
      if (!employee) {
        throw new BadRequestException('Employee not found');
      }
    }

    // Generate default password (NIK + @123)
    const defaultPassword = `${dto.nik}@123`;
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    // Use transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create user
      const user = this.userRepository.create({
        nik: dto.nik,
        passwordHash,
        employeeId: dto.employeeId || null,
        isFirstLogin: true,
        isActive: true,
        createdBy,
      });

      const savedUser = await queryRunner.manager.save(user);

      // Create user roles
      const userRoles = dto.roleIds.map((roleId) =>
        this.userRoleRepository.create({
          userId: savedUser.id,
          roleId,
          createdBy,
        }),
      );

      await queryRunner.manager.save(userRoles);

      await queryRunner.commitTransaction();

      return {
        ...this.transformUser(savedUser),
        defaultPassword,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Update user details
   */
  async update(id: string, dto: UpdateUserDto, updatedBy?: string) {
    const user = await this.userRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (dto.isActive !== undefined) {
      user.isActive = dto.isActive;
    }

    user.updatedBy = updatedBy ?? null;

    await this.userRepository.save(user);

    // Update roles if provided
    if (dto.roleIds) {
      await this.assignRoles(id, { roleIds: dto.roleIds }, updatedBy);
    }

    return this.findOne(id);
  }

  /**
   * Assign roles to a user (replaces existing roles)
   */
  async assignRoles(userId: string, dto: AssignRolesDto, updatedBy?: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId, deletedAt: IsNull() },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Validate roles exist
    const roles = await this.roleRepository.findByIds(dto.roleIds);
    if (roles.length !== dto.roleIds.length) {
      throw new BadRequestException('One or more role IDs are invalid');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Delete existing user roles
      await queryRunner.manager.delete(UserRole, { userId });

      // Create new user roles
      const userRoles = dto.roleIds.map((roleId) =>
        this.userRoleRepository.create({
          userId,
          roleId,
          createdBy: updatedBy,
        }),
      );

      await queryRunner.manager.save(userRoles);

      await queryRunner.commitTransaction();

      return this.findOne(userId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Reset user password to default (NIK + @123)
   */
  async resetPassword(id: string, updatedBy?: string) {
    const user = await this.userRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Generate default password (NIK + @123)
    const defaultPassword = `${user.nik}@123`;
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    user.passwordHash = passwordHash;
    user.isFirstLogin = true;
    user.updatedBy = updatedBy ?? null;

    await this.userRepository.save(user);

    return {
      message: 'Password reset successfully',
      defaultPassword,
    };
  }

  /**
   * Deactivate a user (soft delete alternative)
   */
  async deactivate(id: string, updatedBy?: string) {
    const user = await this.userRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    user.isActive = false;
    user.updatedBy = updatedBy ?? null;

    await this.userRepository.save(user);

    return { message: 'User deactivated successfully' };
  }

  /**
   * Transform user entity to response format
   */
  private transformUser(user: User) {
    return {
      id: user.id,
      nik: user.nik,
      employeeId: user.employeeId,
      employeeName: user.employee?.fullName || null,
      isActive: user.isActive,
      isFirstLogin: user.isFirstLogin,
      lastLoginAt: user.lastLoginAt,
      roles:
        user.userRoles?.map((ur) => ({
          id: ur.role.id,
          code: ur.role.code,
          name: ur.role.name,
        })) || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Transform user entity with permissions to response format
   */
  private transformUserWithPermissions(user: User) {
    const permissions = new Set<string>();

    user.userRoles?.forEach((ur) => {
      ur.role.rolePermissions?.forEach((rp) => {
        permissions.add(rp.permission.code);
      });
    });

    return {
      ...this.transformUser(user),
      permissions: Array.from(permissions),
    };
  }
}
