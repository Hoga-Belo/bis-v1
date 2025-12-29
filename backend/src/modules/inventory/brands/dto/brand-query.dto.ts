import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn } from 'class-validator';
import { PaginationDto } from '../../../../common/dto/pagination.dto';

export class BrandQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Pencarian berdasarkan kode atau nama',
    example: 'CAT',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Kolom untuk sorting',
    example: 'name',
    enum: ['code', 'name', 'createdAt'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['code', 'name', 'createdAt'])
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Urutan sorting',
    example: 'ASC',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}