import { IsString, IsUUID, IsEnum, IsOptional, IsObject } from 'class-validator';
import { AuditAction } from '../../../entities/audit/audit-log.entity';

export class CreateAuditLogDto {
  @IsString()
  module: string;

  @IsString()
  entityType: string;

  @IsString()
  tableName: string;

  @IsOptional()
  @IsUUID()
  recordId?: string;

  @IsEnum(AuditAction)
  action: AuditAction;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  oldValue?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  newValue?: Record<string, unknown>;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;
}