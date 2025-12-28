import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { RequirePermissions, CurrentUser } from '../../../common/decorators';
import { AuthenticatedUser } from '../../auth/auth.service';
import { EmploymentStatusesService } from './employment-statuses.service';
import {
  CreateEmploymentStatusDto,
  UpdateEmploymentStatusDto,
  EmploymentStatusQueryDto,
} from './dto';

@ApiTags('HR - Employment Statuses')
@ApiBearerAuth()
@Controller('hr/employment-statuses')
export class EmploymentStatusesController {
  constructor(
    private readonly employmentStatusesService: EmploymentStatusesService,
  ) {}

  @Get()
  @RequirePermissions('hr:employment-status:read')
  @ApiOperation({
    summary: 'Get all employment statuses with pagination and filtering',
  })
  @ApiResponse({
    status: 200,
    description: 'List of employment statuses retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Missing required permissions',
  })
  async findAll(@Query() query: EmploymentStatusQueryDto) {
    return this.employmentStatusesService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('hr:employment-status:read')
  @ApiOperation({ summary: 'Get a single employment status by ID' })
  @ApiParam({ name: 'id', description: 'Employment Status UUID' })
  @ApiResponse({
    status: 200,
    description: 'Employment status retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Missing required permissions',
  })
  @ApiResponse({ status: 404, description: 'Employment status not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.employmentStatusesService.findOne(id);
  }

  @Post()
  @RequirePermissions('hr:employment-status:create')
  @ApiOperation({ summary: 'Create a new employment status' })
  @ApiResponse({
    status: 201,
    description: 'Employment status created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Missing required permissions',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Employment status with code already exists',
  })
  async create(
    @Body() dto: CreateEmploymentStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.employmentStatusesService.create(dto, user.id);
  }

  @Patch(':id')
  @RequirePermissions('hr:employment-status:update')
  @ApiOperation({ summary: 'Update an employment status' })
  @ApiParam({ name: 'id', description: 'Employment Status UUID' })
  @ApiResponse({
    status: 200,
    description: 'Employment status updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Missing required permissions',
  })
  @ApiResponse({ status: 404, description: 'Employment status not found' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Employment status with code already exists',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEmploymentStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.employmentStatusesService.update(id, dto, user.id);
  }

  @Delete(':id')
  @RequirePermissions('hr:employment-status:delete')
  @ApiOperation({ summary: 'Soft delete an employment status' })
  @ApiParam({ name: 'id', description: 'Employment Status UUID' })
  @ApiResponse({
    status: 200,
    description: 'Employment status deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Employment status has active employees',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Missing required permissions',
  })
  @ApiResponse({ status: 404, description: 'Employment status not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.employmentStatusesService.remove(id, user.id);
  }
}