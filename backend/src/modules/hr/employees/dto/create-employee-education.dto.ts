import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsNumber,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEmployeeEducationDto {
  @ApiProperty({ description: 'Education level ID' })
  @IsUUID()
  @IsNotEmpty()
  educationLevelId: string;

  @ApiProperty({ description: 'Institution name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  institutionName: string;

  @ApiPropertyOptional({ description: 'Major/Field of study' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  major?: string;

  @ApiProperty({ description: 'Start year' })
  @IsNumber()
  @Min(1950)
  @Max(2100)
  startYear: number;

  @ApiPropertyOptional({ description: 'End year' })
  @IsOptional()
  @IsNumber()
  @Min(1950)
  @Max(2100)
  endYear?: number;

  @ApiPropertyOptional({ description: 'GPA' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(4)
  gpa?: number;

  @ApiPropertyOptional({ description: 'Certificate number' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  certificateNumber?: string;
}