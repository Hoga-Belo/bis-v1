import { IsEnum, IsOptional, IsString, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClockInMethod } from '../../../../entities/hr/attendance.entity';

export class LocationDto {
  @ApiProperty({ description: 'Latitude coordinate' })
  @IsNumber()
  lat: number;

  @ApiProperty({ description: 'Longitude coordinate' })
  @IsNumber()
  lng: number;

  @ApiPropertyOptional({ description: 'Address string' })
  @IsOptional()
  @IsString()
  address?: string;
}

export class ClockInDto {
  @ApiProperty({ enum: ClockInMethod, description: 'Clock-in method' })
  @IsEnum(ClockInMethod)
  method: ClockInMethod;

  @ApiPropertyOptional({ type: LocationDto, description: 'Location data' })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @ApiPropertyOptional({ description: 'QR code value if method is QR' })
  @IsOptional()
  @IsString()
  qrCode?: string;
}