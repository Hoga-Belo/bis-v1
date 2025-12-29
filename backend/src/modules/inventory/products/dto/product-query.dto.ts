import { IsOptional, IsString, IsUUID, IsBoolean, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../../common/dto/pagination.dto';

export class ProductQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Search by SKU or name',
    example: 'chair',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by category ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Filter by brand ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @IsUUID()
  brandId?: string;

  @ApiPropertyOptional({
    description: 'Filter by asset status',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isAsset?: boolean;

  @ApiPropertyOptional({
    description: 'Filter products where current stock < minStock',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  lowStock?: boolean;

  @ApiPropertyOptional({
    description: 'Sort by field',
    example: 'name',
    enum: ['sku', 'name', 'createdAt'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['sku', 'name', 'createdAt'])
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'ASC',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';
}