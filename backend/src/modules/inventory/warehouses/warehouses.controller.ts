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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';
import { WarehousesService, WarehouseWithStats, WarehouseStockItem, WarehouseStatistics } from './warehouses.service';
import {
  CreateWarehouseDto,
  UpdateWarehouseDto,
  WarehouseQueryDto,
} from './dto';
import { Warehouse } from '../../../entities/inventory/warehouse.entity';

@ApiTags('Inventory - Warehouses')
@ApiBearerAuth()
@Controller('inventory/warehouses')
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Get()
  @RequirePermissions('inventory:warehouse:read')
  @ApiOperation({ summary: 'Get all warehouses with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by code or name' })
  @ApiQuery({ name: 'workLocationId', required: false, type: String, description: 'Filter by work location ID' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Sort by field (code, name, createdAt)' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Sort order' })
  @ApiResponse({
    status: 200,
    description: 'List of warehouses with pagination metadata',
  })
  async findAll(@Query() query: WarehouseQueryDto): Promise<{
    data: WarehouseWithStats[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    return this.warehousesService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('inventory:warehouse:read')
  @ApiOperation({ summary: 'Get warehouse by ID with stock summary' })
  @ApiParam({ name: 'id', type: String, description: 'Warehouse UUID' })
  @ApiResponse({
    status: 200,
    description: 'Warehouse details with stock summary',
  })
  @ApiResponse({
    status: 404,
    description: 'Warehouse not found',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<WarehouseWithStats> {
    return this.warehousesService.findOne(id);
  }

  @Get(':id/stock')
  @RequirePermissions('inventory:warehouse:read')
  @ApiOperation({ summary: 'Get all products and quantities in warehouse' })
  @ApiParam({ name: 'id', type: String, description: 'Warehouse UUID' })
  @ApiResponse({
    status: 200,
    description: 'List of products with quantities in the warehouse',
  })
  @ApiResponse({
    status: 404,
    description: 'Warehouse not found',
  })
  async getWarehouseStock(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<WarehouseStockItem[]> {
    return this.warehousesService.getWarehouseStock(id);
  }

  @Get(':id/statistics')
  @RequirePermissions('inventory:warehouse:read')
  @ApiOperation({ summary: 'Get warehouse statistics' })
  @ApiParam({ name: 'id', type: String, description: 'Warehouse UUID' })
  @ApiResponse({
    status: 200,
    description: 'Warehouse statistics (total products, total quantity, low stock count)',
  })
  @ApiResponse({
    status: 404,
    description: 'Warehouse not found',
  })
  async getWarehouseStatistics(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<WarehouseStatistics> {
    return this.warehousesService.getWarehouseStatistics(id);
  }

  @Post()
  @RequirePermissions('inventory:warehouse:create')
  @ApiOperation({ summary: 'Create a new warehouse' })
  @ApiResponse({
    status: 201,
    description: 'Warehouse created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or referenced entity not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Warehouse with this code already exists',
  })
  async create(@Body() dto: CreateWarehouseDto): Promise<Warehouse> {
    return this.warehousesService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('inventory:warehouse:update')
  @ApiOperation({ summary: 'Update a warehouse' })
  @ApiParam({ name: 'id', type: String, description: 'Warehouse UUID' })
  @ApiResponse({
    status: 200,
    description: 'Warehouse updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or referenced entity not found',
  })
  @ApiResponse({
    status: 404,
    description: 'Warehouse not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Warehouse with this code already exists',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWarehouseDto,
  ): Promise<Warehouse> {
    return this.warehousesService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('inventory:warehouse:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a warehouse' })
  @ApiParam({ name: 'id', type: String, description: 'Warehouse UUID' })
  @ApiResponse({
    status: 204,
    description: 'Warehouse deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete warehouse with active stock items',
  })
  @ApiResponse({
    status: 404,
    description: 'Warehouse not found',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.warehousesService.remove(id);
  }
}