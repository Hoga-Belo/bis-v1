import { IsOptional, IsString, IsIn, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../../common/dto/pagination.dto';
import { CategoryType } from '../../../../entities/inventory/category.entity';

export class CategoryQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Search by code or name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by category type',
    enum: CategoryType,
  })
  @IsOptional()
  @IsEnum(CategoryType)
  type?: CategoryType;

  @ApiPropertyOptional({
    description: 'Sort by field',
    default: 'name',
    enum: ['code', 'name', 'type', 'createdAt'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['code', 'name', 'type', 'createdAt'])
  sortBy?: string = 'name';

  @ApiPropertyOptional({
    description: 'Sort order',
    default: 'ASC',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}