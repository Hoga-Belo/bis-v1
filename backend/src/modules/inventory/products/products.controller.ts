import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './dto';
import { RequirePermissions } from '../../../common/decorators';
import { productPhotoUploadConfig } from '../../../config/upload.config';

@ApiTags('Inventory - Products')
@ApiBearerAuth()
@Controller('inventory/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @RequirePermissions('inventory:product:read')
  @ApiOperation({ summary: 'Get all products with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'brandId', required: false, type: String })
  @ApiQuery({ name: 'isAsset', required: false, type: Boolean })
  @ApiQuery({ name: 'lowStock', required: false, type: Boolean })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['sku', 'name', 'createdAt'] })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiResponse({
    status: 200,
    description: 'List of products with pagination',
  })
  async findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get('low-stock')
  @RequirePermissions('inventory:product:read')
  @ApiOperation({ summary: 'Get products with low stock' })
  @ApiResponse({
    status: 200,
    description: 'List of products where total stock < minStock',
  })
  async getLowStockProducts() {
    return this.productsService.getLowStockProducts();
  }

  @Get(':id')
  @RequirePermissions('inventory:product:read')
  @ApiOperation({ summary: 'Get product by ID with stock info' })
  @ApiParam({ name: 'id', type: String, description: 'Product UUID' })
  @ApiResponse({
    status: 200,
    description: 'Product details with stock information',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  @Get(':id/stock')
  @RequirePermissions('inventory:product:read')
  @ApiOperation({ summary: 'Get stock breakdown by warehouse for a product' })
  @ApiParam({ name: 'id', type: String, description: 'Product UUID' })
  @ApiResponse({
    status: 200,
    description: 'Stock breakdown by warehouse',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async getProductStock(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.getProductStock(id);
  }

  @Post()
  @RequirePermissions('inventory:product:create')
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 409,
    description: 'Product with SKU already exists',
  })
  async create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('inventory:product:update')
  @ApiOperation({ summary: 'Update a product' })
  @ApiParam({ name: 'id', type: String, description: 'Product UUID' })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Product with SKU already exists',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(id, dto);
  }

  @Post(':id/photo')
  @RequirePermissions('inventory:product:update')
  @UseInterceptors(FileInterceptor('photo', productPhotoUploadConfig))
  @ApiOperation({ summary: 'Upload product photo' })
  @ApiParam({ name: 'id', type: String, description: 'Product UUID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        photo: {
          type: 'string',
          format: 'binary',
          description: 'Product photo (jpg, jpeg, png, gif, max 5MB)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Photo uploaded successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file type or size',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async uploadPhoto(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.productsService.uploadPhoto(id, file);
  }

  @Delete(':id')
  @RequirePermissions('inventory:product:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a product (soft delete)' })
  @ApiParam({ name: 'id', type: String, description: 'Product UUID' })
  @ApiResponse({
    status: 204,
    description: 'Product deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete product with existing stock',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}