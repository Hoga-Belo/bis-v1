import { IsArray, IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRolesDto {
  @ApiProperty({ description: 'Array of role UUIDs to assign', type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  roleIds: string[];
}
