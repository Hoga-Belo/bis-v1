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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto, CategoryQueryDto } from './dto';

@ApiTags('Inventory - Categories')
@ApiBearerAuth()
@Controller('inventory/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @RequirePermissions('inventory:category:read')
  @ApiOperation({ summary: 'Get all categories with pagination and filtering' })
  @ApiResponse({
    status: 200,
    description: 'List of categories retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Missing required permissions',
  })
  async findAll(@Query() query: CategoryQueryDto) {
    return this.categoriesService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('inventory:category:read')
  @ApiOperation({ summary: 'Get a single category by ID' })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  @ApiResponse({ status: 200, description: 'Category retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Missing required permissions',
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.findOne(id);
  }

  @Post()
  @RequirePermissions('inventory:category:create')
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Missing required permissions',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Category with code already exists',
  })
  async create(
    @Body() dto: CreateCategoryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.categoriesService.create(dto, user.id);
  }

  @Patch(':id')
  @RequirePermissions('inventory:category:update')
  @ApiOperation({ summary: 'Update a category' })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Missing required permissions',
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Category with code already exists',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.categoriesService.update(id, dto, user.id);
  }

  @Delete(':id')
  @RequirePermissions('inventory:category:delete')
  @ApiOperation({ summary: 'Soft delete a category' })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Category has active products',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Missing required permissions',
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.categoriesService.remove(id, user.id);
  }
}