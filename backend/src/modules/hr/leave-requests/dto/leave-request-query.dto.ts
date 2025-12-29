import { IsOptional, IsEnum, IsNumber, Min, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../../common/dto/pagination.dto';
import {
  LeaveStatus,
  LeaveType,
} from '../../../../entities/hr/leave-request.entity';

export class LeaveRequestQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: LeaveStatus, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(LeaveStatus)
  status?: LeaveStatus;

  @ApiPropertyOptional({ enum: LeaveType, description: 'Filter by leave type' })
  @IsOptional()
  @IsEnum(LeaveType)
  leaveType?: LeaveType;

  @ApiPropertyOptional({ description: 'Filter by year' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(2020)
  year?: number;

  @ApiPropertyOptional({ description: 'Filter by employee ID' })
  @IsOptional()
  @IsUUID()
  employeeId?: string;
}