import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { AuditQueryDto } from './dto';
import { RequirePermissions } from '../../common/decorators';

@ApiTags('Audit')
@ApiBearerAuth()
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  @RequirePermissions('audit:log:read')
  @ApiOperation({ summary: 'Get all audit logs with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Returns paginated audit logs' })
  async findAll(@Query() query: AuditQueryDto) {
    return this.auditService.findAll(query);
  }

  @Get('logs/:id')
  @RequirePermissions('audit:log:read')
  @ApiOperation({ summary: 'Get a single audit log by ID' })
  @ApiResponse({ status: 200, description: 'Returns the audit log' })
  @ApiResponse({ status: 404, description: 'Audit log not found' })
  async findOne(@Param('id') id: string) {
    return this.auditService.findOne(id);
  }

  @Get('logs/record/:tableName/:recordId')
  @RequirePermissions('audit:log:read')
  @ApiOperation({ summary: 'Get audit history for a specific record' })
  @ApiResponse({ status: 200, description: 'Returns audit logs for the record' })
  async findByRecord(
    @Param('tableName') tableName: string,
    @Param('recordId') recordId: string,
  ) {
    return this.auditService.findByRecord(tableName, recordId);
  }
}