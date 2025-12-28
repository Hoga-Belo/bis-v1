import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateJobGradeDto {
  @ApiProperty({ description: 'Job grade code', example: 'G1', maxLength: 10 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  @Transform(({ value }) => value?.toUpperCase())
  code: string;

  @ApiProperty({
    description: 'Job grade name',
    example: 'Grade 1 - Entry Level',
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiPropertyOptional({ description: 'Minimum salary', example: 5000000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minSalary?: number;

  @ApiPropertyOptional({ description: 'Maximum salary', example: 8000000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxSalary?: number;
}