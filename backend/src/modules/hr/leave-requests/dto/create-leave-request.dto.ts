import {
  IsEnum,
  IsDateString,
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeaveType } from '../../../../entities/hr/leave-request.entity';

export class CreateLeaveRequestDto {
  @ApiProperty({ enum: LeaveType, description: 'Type of leave' })
  @IsEnum(LeaveType)
  leaveType: LeaveType;

  @ApiProperty({ description: 'Start date of leave (YYYY-MM-DD)' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'End date of leave (YYYY-MM-DD)' })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    description: 'Reason for leave request',
    minLength: 10,
    maxLength: 500,
  })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  reason: string;

  @ApiPropertyOptional({
    description: 'URL to attachment (e.g., medical certificate)',
  })
  @IsOptional()
  @IsString()
  attachmentUrl?: string;
}