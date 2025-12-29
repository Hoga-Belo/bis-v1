import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { LocationDto } from './clock-in.dto';

export class ClockOutDto {
  @ApiPropertyOptional({ type: LocationDto, description: 'Location data' })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;
}