import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceStatus } from '../../../../entities/hr/attendance.entity';

export class UpdateAttendanceStatusDto {
  @ApiProperty({ enum: AttendanceStatus, description: 'New attendance status' })
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @ApiPropertyOptional({ description: 'Notes for the status change' })
  @IsOptional()
  @IsString()
  notes?: string;
}