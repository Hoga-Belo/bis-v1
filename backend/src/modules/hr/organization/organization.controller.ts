import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators';
import {
  OrganizationService,
  OrganizationNode,
  DepartmentHierarchy,
  DirectReportEmployee,
  EmployeeSummaryDto,
} from './organization.service';

@ApiTags('HR - Organization')
@ApiBearerAuth()
@Controller('hr/organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get('tree')
  @RequirePermissions('hr:organization:read')
  @ApiOperation({ summary: 'Get full organization tree' })
  @ApiResponse({
    status: 200,
    description: 'Organization tree retrieved successfully',
  })
  async getOrganizationTree(): Promise<OrganizationNode[]> {
    return this.organizationService.getOrganizationTree();
  }

  @Get('tree/:employeeId')
  @RequirePermissions('hr:organization:read')
  @ApiOperation({ summary: 'Get organization subtree from specific employee' })
  @ApiParam({ name: 'employeeId', description: 'Employee ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Organization subtree retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async getEmployeeSubtree(
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
  ): Promise<OrganizationNode | null> {
    return this.organizationService.getEmployeeSubtree(employeeId);
  }

  @Get('direct-reports/:employeeId')
  @RequirePermissions('hr:organization:read')
  @ApiOperation({ summary: 'Get direct reports for an employee' })
  @ApiParam({ name: 'employeeId', description: 'Employee ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Direct reports retrieved successfully',
  })
  async getDirectReports(
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
  ): Promise<DirectReportEmployee[]> {
    return this.organizationService.getDirectReports(employeeId);
  }

  @Get('subordinates/:employeeId')
  @RequirePermissions('hr:organization:read')
  @ApiOperation({
    summary: 'Get all subordinates (direct and indirect) for an employee',
  })
  @ApiParam({ name: 'employeeId', description: 'Employee ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Subordinates retrieved successfully',
  })
  async getAllSubordinates(
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
  ): Promise<DirectReportEmployee[]> {
    return this.organizationService.getAllSubordinates(employeeId);
  }

  @Get('departments')
  @RequirePermissions('hr:organization:read')
  @ApiOperation({ summary: 'Get department hierarchy grouped by division' })
  @ApiResponse({
    status: 200,
    description: 'Department hierarchy retrieved successfully',
  })
  async getDepartmentHierarchy(): Promise<DepartmentHierarchy[]> {
    return this.organizationService.getDepartmentHierarchy();
  }

  @Get('employees')
  @RequirePermissions('hr:employee:read')
  @ApiOperation({ summary: 'Get all employees as a flat list (for dropdowns)' })
  @ApiResponse({
    status: 200,
    description: 'Employees list retrieved successfully',
  })
  async getAllEmployees(): Promise<EmployeeSummaryDto[]> {
    return this.organizationService.getAllEmployees();
  }
}