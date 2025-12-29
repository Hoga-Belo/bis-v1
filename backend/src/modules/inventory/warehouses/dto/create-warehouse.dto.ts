import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsBoolean,
  MaxLength,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateWarehouseDto {
  @ApiProperty({
    description: 'Warehouse code (unique, uppercase)',
    example: 'WH001',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @Transform(({ value }) => value?.toUpperCase()?.trim())
  @Matches(/^[A-Z0-9-_]+$/, {
    message: 'Code must contain only uppercase letters, numbers, hyphens, and underscores',
  })
  code: string;

  @ApiProperty({
    description: 'Warehouse name',
    example: 'Main Warehouse',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiPropertyOptional({
    description: 'Warehouse address',
    example: 'Jl. Industri No. 123, Jakarta',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(({ value }) => value?.trim())
  address?: string;

  @ApiPropertyOptional({
    description: 'Work location ID (reference to HR work location)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  workLocationId?: string;

  @ApiPropertyOptional({
    description: 'Person In Charge employee ID (reference to HR employee)',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @IsUUID()
  picEmployeeId?: string;

  @ApiPropertyOptional({
    description: 'Whether the warehouse is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}