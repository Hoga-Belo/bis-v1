import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UomsService } from './uoms.service';
import { CreateUomDto, UpdateUomDto, UomQueryDto } from './dto';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('Inventory - UOMs')
@ApiBearerAuth()
@Controller('inventory/uoms')
export class UomsController {
  constructor(private readonly uomsService: UomsService) {}

  @Get()
  @RequirePermissions('inventory:uom:read')
  @ApiOperation({ summary: 'Get all UOMs with pagination' })
  @ApiResponse({
    status: 200,
    description: 'List of UOMs retrieved successfully',
  })
  async findAll(@Query() query: UomQueryDto) {
    const result = await this.uomsService.findAll(query);
    return {
      success: true,
      message: 'Daftar satuan berhasil diambil',
      ...result,
    };
  }

  @Get(':id')
  @RequirePermissions('inventory:uom:read')
  @ApiOperation({ summary: 'Get UOM by ID' })
  @ApiResponse({
    status: 200,
    description: 'UOM retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'UOM not found',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.uomsService.findOne(id);
    return {
      success: true,
      message: 'Detail satuan berhasil diambil',
      data,
    };
  }

  @Post()
  @RequirePermissions('inventory:uom:create')
  @ApiOperation({ summary: 'Create a new UOM' })
  @ApiResponse({
    status: 201,
    description: 'UOM created successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'UOM with this code already exists',
  })
  async create(
    @Body() createUomDto: CreateUomDto,
    @CurrentUser('id') userId: string,
  ) {
    const data = await this.uomsService.create(createUomDto, userId);
    return {
      success: true,
      message: 'Satuan berhasil dibuat',
      data,
    };
  }

  @Patch(':id')
  @RequirePermissions('inventory:uom:update')
  @ApiOperation({ summary: 'Update UOM by ID' })
  @ApiResponse({
    status: 200,
    description: 'UOM updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'UOM not found',
  })
  @ApiResponse({
    status: 409,
    description: 'UOM with this code already exists',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUomDto: UpdateUomDto,
    @CurrentUser('id') userId: string,
  ) {
    const data = await this.uomsService.update(id, updateUomDto, userId);
    return {
      success: true,
      message: 'Satuan berhasil diperbarui',
      data,
    };
  }

  @Delete(':id')
  @RequirePermissions('inventory:uom:delete')
  @ApiOperation({ summary: 'Delete UOM by ID (soft delete)' })
  @ApiResponse({
    status: 200,
    description: 'UOM deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete UOM with active products',
  })
  @ApiResponse({
    status: 404,
    description: 'UOM not found',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.uomsService.remove(id, userId);
    return {
      success: true,
      message: 'Satuan berhasil dihapus',
    };
  }
}