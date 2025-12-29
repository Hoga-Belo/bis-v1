import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsOptional,
  IsUUID,
  IsNumber,
  IsBoolean,
  IsObject,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product SKU (Stock Keeping Unit)',
    example: 'PRD001',
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  @Transform(({ value }) => value?.toUpperCase())
  sku: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Office Chair',
    maxLength: 200,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({
    description: 'Product description',
    example: 'Ergonomic office chair with lumbar support',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Category ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsUUID()
  categoryId: string;

  @ApiPropertyOptional({
    description: 'Brand ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @IsUUID()
  brandId?: string;

  @ApiProperty({
    description: 'Unit of Measure ID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsNotEmpty()
  @IsUUID()
  uomId: string;

  @ApiPropertyOptional({
    description: 'Minimum stock level',
    example: 10,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minStock?: number;

  @ApiPropertyOptional({
    description: 'Maximum stock level',
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxStock?: number;

  @ApiPropertyOptional({
    description: 'Whether this product is an asset',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isAsset?: boolean;

  @ApiPropertyOptional({
    description: 'Product specifications as JSON object',
    example: { color: 'black', material: 'leather', weight: '15kg' },
  })
  @IsOptional()
  @IsObject()
  specifications?: Record<string, unknown>;
}