import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../../common/dto/pagination.dto';

export class PositionQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Search by code or name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Sort by field',
    default: 'level',
    enum: ['code', 'name', 'level', 'createdAt'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['code', 'name', 'level', 'createdAt'])
  sortBy?: string = 'level';

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