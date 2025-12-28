import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RequirePermissions, CurrentUser } from '../../common/decorators';
import { AuthenticatedUser } from '../auth/auth.service';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto, AssignPermissionsDto } from './dto';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all roles' })
  @RequirePermissions('user.role.read')
  async findAllRoles() {
    return this.rolesService.findAllRoles();
  }

  @Get('permissions')
  @ApiOperation({ summary: 'Get all permissions grouped by module' })
  @RequirePermissions('user.permission.read')
  async findAllPermissions() {
    return this.rolesService.findAllPermissions();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get role by ID with permissions' })
  @RequirePermissions('user.role.read')
  async findOneRole(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.findOneRole(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new role' })
  @RequirePermissions('user.role.create')
  async createRole(
    @Body() dto: CreateRoleDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.rolesService.createRole(dto, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update role' })
  @RequirePermissions('user.role.update')
  async updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoleDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.rolesService.updateRole(id, dto, user.id);
  }

  @Post(':id/permissions')
  @ApiOperation({ summary: 'Assign permissions to role' })
  @RequirePermissions('user.permission.update')
  async assignPermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignPermissionsDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.rolesService.assignPermissions(id, dto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete role' })
  @RequirePermissions('user.role.delete')
  async deleteRole(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.rolesService.deleteRole(id, user.id);
  }
}