import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull, In } from 'typeorm';
import {
  Role,
  Permission,
  RolePermission,
  UserRole,
} from '../../entities/user-access';
import { CreateRoleDto, UpdateRoleDto, AssignPermissionsDto } from './dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    private dataSource: DataSource,
  ) {}

  async findAllRoles() {
    const roles = await this.roleRepository.find({
      where: { deletedAt: IsNull() },
      order: { name: 'ASC' },
    });

    // Get user count for each role
    const rolesWithCount = await Promise.all(
      roles.map(async (role) => {
        const userCount = await this.userRoleRepository.count({
          where: { roleId: role.id },
        });
        return {
          id: role.id,
          code: role.code,
          name: role.name,
          description: role.description,
          isSystem: role.isSystem,
          userCount,
          createdAt: role.createdAt,
          updatedAt: role.updatedAt,
        };
      }),
    );

    return rolesWithCount;
  }

  async findOneRole(id: string) {
    const role = await this.roleRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['rolePermissions', 'rolePermissions.permission'],
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    const userCount = await this.userRoleRepository.count({
      where: { roleId: role.id },
    });

    return {
      id: role.id,
      code: role.code,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      userCount,
      permissions: role.rolePermissions.map((rp) => ({
        id: rp.permission.id,
        code: rp.permission.code,
        module: rp.permission.module,
        feature: rp.permission.feature,
        action: rp.permission.action,
        description: rp.permission.description,
      })),
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }

  async createRole(dto: CreateRoleDto, createdBy?: string) {
    // Check if code already exists
    const existingRole = await this.roleRepository.findOne({
      where: { code: dto.code, deletedAt: IsNull() },
    });

    if (existingRole) {
      throw new ConflictException(`Role with code ${dto.code} already exists`);
    }

    const role = this.roleRepository.create({
      ...dto,
      isSystem: false, // Custom roles are not system roles
      createdBy,
    });

    const savedRole = await this.roleRepository.save(role);

    return {
      id: savedRole.id,
      code: savedRole.code,
      name: savedRole.name,
      description: savedRole.description,
      isSystem: savedRole.isSystem,
      createdAt: savedRole.createdAt,
    };
  }

  async updateRole(id: string, dto: UpdateRoleDto, updatedBy?: string) {
    const role = await this.roleRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    // System roles can only update name and description
    if (
      role.isSystem &&
      dto.name === undefined &&
      dto.description === undefined
    ) {
      throw new BadRequestException(
        'System roles can only update name and description',
      );
    }

    if (dto.name !== undefined) {
      role.name = dto.name;
    }
    if (dto.description !== undefined) {
      role.description = dto.description ?? null;
    }
    role.updatedBy = updatedBy ?? null;

    await this.roleRepository.save(role);

    return this.findOneRole(id);
  }

  async assignPermissions(
    roleId: string,
    dto: AssignPermissionsDto,
    updatedBy?: string,
  ) {
    const role = await this.roleRepository.findOne({
      where: { id: roleId, deletedAt: IsNull() },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    // Validate permissions exist
    const permissions = await this.permissionRepository.find({
      where: { id: In(dto.permissionIds), deletedAt: IsNull() },
    });

    if (permissions.length !== dto.permissionIds.length) {
      throw new BadRequestException('One or more permission IDs are invalid');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Delete existing role permissions
      await queryRunner.manager.delete(RolePermission, { roleId });

      // Create new role permissions
      const rolePermissions = dto.permissionIds.map((permissionId) =>
        this.rolePermissionRepository.create({
          roleId,
          permissionId,
          createdBy: updatedBy,
        }),
      );

      await queryRunner.manager.save(rolePermissions);

      await queryRunner.commitTransaction();

      return this.findOneRole(roleId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteRole(id: string, deletedBy?: string) {
    const role = await this.roleRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    if (role.isSystem) {
      throw new BadRequestException('System roles cannot be deleted');
    }

    // Check if role is assigned to any users
    const userCount = await this.userRoleRepository.count({
      where: { roleId: id },
    });

    if (userCount > 0) {
      throw new BadRequestException(
        `Cannot delete role. It is assigned to ${userCount} user(s)`,
      );
    }

    // Soft delete - updatedBy tracks who deleted
    role.deletedAt = new Date();
    role.updatedBy = deletedBy ?? null;
    await this.roleRepository.save(role);

    return { message: 'Role deleted successfully' };
  }

  async findAllPermissions() {
    const permissions = await this.permissionRepository.find({
      where: { deletedAt: IsNull() },
      order: { module: 'ASC', feature: 'ASC', action: 'ASC' },
    });

    // Group by module
    const grouped = permissions.reduce(
      (acc, permission) => {
        const module = permission.module;
        if (!acc[module]) {
          acc[module] = [];
        }
        acc[module].push({
          id: permission.id,
          code: permission.code,
          feature: permission.feature,
          action: permission.action,
          description: permission.description,
        });
        return acc;
      },
      {} as Record<
        string,
        Array<{
          id: string;
          code: string;
          feature: string;
          action: string;
          description: string | null;
        }>
      >,
    );

    return Object.entries(grouped).map(([module, permissions]) => ({
      module,
      permissions,
    }));
  }
}