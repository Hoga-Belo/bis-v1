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
  ApiParam,
} from '@nestjs/swagger';
import { BrandsService } from './brands.service';
import { CreateBrandDto, UpdateBrandDto, BrandQueryDto } from './dto';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('Inventory - Brands')
@ApiBearerAuth()
@Controller('inventory/brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  @RequirePermissions('inventory:brand:read')
  @ApiOperation({ summary: 'Mendapatkan daftar brand' })
  @ApiResponse({
    status: 200,
    description: 'Daftar brand berhasil diambil',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              code: { type: 'string' },
              name: { type: 'string' },
              productCount: { type: 'number' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
        meta: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            total: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
  })
  async findAll(@Query() query: BrandQueryDto) {
    return this.brandsService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('inventory:brand:read')
  @ApiOperation({ summary: 'Mendapatkan detail brand berdasarkan ID' })
  @ApiParam({ name: 'id', description: 'Brand ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Detail brand berhasil diambil',
  })
  @ApiResponse({
    status: 404,
    description: 'Brand tidak ditemukan',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.brandsService.findOne(id);
  }

  @Post()
  @RequirePermissions('inventory:brand:create')
  @ApiOperation({ summary: 'Membuat brand baru' })
  @ApiResponse({
    status: 201,
    description: 'Brand berhasil dibuat',
  })
  @ApiResponse({
    status: 400,
    description: 'Data tidak valid',
  })
  @ApiResponse({
    status: 409,
    description: 'Kode brand sudah ada',
  })
  async create(
    @Body() createBrandDto: CreateBrandDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.brandsService.create(createBrandDto, userId);
  }

  @Patch(':id')
  @RequirePermissions('inventory:brand:update')
  @ApiOperation({ summary: 'Mengupdate brand' })
  @ApiParam({ name: 'id', description: 'Brand ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Brand berhasil diupdate',
  })
  @ApiResponse({
    status: 404,
    description: 'Brand tidak ditemukan',
  })
  @ApiResponse({
    status: 409,
    description: 'Kode brand sudah ada',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBrandDto: UpdateBrandDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.brandsService.update(id, updateBrandDto, userId);
  }

  @Delete(':id')
  @RequirePermissions('inventory:brand:delete')
  @ApiOperation({ summary: 'Menghapus brand (soft delete)' })
  @ApiParam({ name: 'id', description: 'Brand ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Brand berhasil dihapus',
  })
  @ApiResponse({
    status: 400,
    description: 'Brand masih memiliki produk aktif',
  })
  @ApiResponse({
    status: 404,
    description: 'Brand tidak ditemukan',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.brandsService.remove(id, userId);
    return { message: 'Brand berhasil dihapus' };
  }
}