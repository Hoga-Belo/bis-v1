import { IsString, IsNotEmpty, IsUUID, IsArray, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'User NIK (Employee ID)', example: 'EMP001' })
  @IsString()
  @IsNotEmpty()
  nik: string;

  @ApiPropertyOptional({ description: 'Employee UUID to link with user' })
  @IsUUID()
  @IsOptional()
  employeeId?: string;

  @ApiProperty({ description: 'Array of role UUIDs to assign', type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  roleIds: string[];
}
