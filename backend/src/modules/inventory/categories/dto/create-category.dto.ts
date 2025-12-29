import { IsNotEmpty, IsString, MaxLength, IsOptional, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategoryType } from '../../../../entities/inventory/category.entity';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category code',
    example: 'CAT001',
    maxLength: 20,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  @Transform(({ value }) => value?.toUpperCase())
  code: string;

  @ApiProperty({
    description: 'Category name',
    example: 'Office Equipment',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Category type',
    enum: CategoryType,
    example: CategoryType.FIXED,
  })
  @IsNotEmpty()
  @IsEnum(CategoryType)
  type: CategoryType;

  @ApiPropertyOptional({
    description: 'Category description',
    example: 'Office equipment and furniture',
  })
  @IsOptional()
  @IsString()
  description?: string;
}