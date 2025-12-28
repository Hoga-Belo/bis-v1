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
import { DivisionsService } from './divisions.service';
import { CreateDivisionDto, UpdateDivisionDto, DivisionQueryDto } from './dto';

@ApiTags('HR - Divisions')
@ApiBearerAuth()
@Controller('hr/divisions')
export class DivisionsController {
  constructor(private readonly divisionsService: DivisionsService) {}

  @Get()
  @RequirePermissions('hr:division:read')
  @ApiOperation({ summary: 'Get all divisions with pagination and filtering' })
  @ApiResponse({
    status: 200,
    description: 'List of divisions retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Missing required permissions',
  })
  async findAll(@Query() query: DivisionQueryDto) {
    return this.divisionsService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('hr:division:read')
  @ApiOperation({ summary: 'Get a single division by ID' })
  @ApiParam({ name: 'id', description: 'Division UUID' })
  @ApiResponse({ status: 200, description: 'Division retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Missing required permissions',
  })
  @ApiResponse({ status: 404, description: 'Division not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.divisionsService.findOne(id);
  }

  @Post()
  @RequirePermissions('hr:division:create')
  @ApiOperation({ summary: 'Create a new division' })
  @ApiResponse({ status: 201, description: 'Division created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Missing required permissions',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Division with code already exists',
  })
  async create(
    @Body() dto: CreateDivisionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.divisionsService.create(dto, user.id);
  }

  @Patch(':id')
  @RequirePermissions('hr:division:update')
  @ApiOperation({ summary: 'Update a division' })
  @ApiParam({ name: 'id', description: 'Division UUID' })
  @ApiResponse({ status: 200, description: 'Division updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Missing required permissions',
  })
  @ApiResponse({ status: 404, description: 'Division not found' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Division with code already exists',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDivisionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.divisionsService.update(id, dto, user.id);
  }

  @Delete(':id')
  @RequirePermissions('hr:division:delete')
  @ApiOperation({ summary: 'Soft delete a division' })
  @ApiParam({ name: 'id', description: 'Division UUID' })
  @ApiResponse({ status: 200, description: 'Division deleted successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Division has active departments',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Missing required permissions',
  })
  @ApiResponse({ status: 404, description: 'Division not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.divisionsService.remove(id, user.id);
  }
}