import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePositionDto {
  @ApiProperty({ description: 'Position code', example: 'MGR', maxLength: 20 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  @Transform(({ value }) => value?.toUpperCase())
  code: string;

  @ApiProperty({
    description: 'Position name',
    example: 'Manager',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Position level (1=highest)', example: 1 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  level: number;

  @ApiPropertyOptional({ description: 'Position description' })
  @IsOptional()
  @IsString()
  description?: string;
}