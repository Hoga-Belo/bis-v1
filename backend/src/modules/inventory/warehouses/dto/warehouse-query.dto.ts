import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsBoolean, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../../../common/dto/pagination.dto';

export class WarehouseQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Search by code or name',
    example: 'WH001',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by work location ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  workLocationId?: string;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Sort by field',
    example: 'name',
    enum: ['code', 'name', 'createdAt'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['code', 'name', 'createdAt'])
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'ASC',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  @Transform(({ value }) => value?.toUpperCase())
  sortOrder?: 'ASC' | 'DESC';
}