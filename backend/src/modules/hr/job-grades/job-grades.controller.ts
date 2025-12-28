import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { RequirePermissions, CurrentUser } from '../../../common/decorators';
import { AuthenticatedUser } from '../../auth/auth.service';
import { JobGradesService } from './job-grades.service';
import { CreateJobGradeDto, UpdateJobGradeDto, JobGradeQueryDto } from './dto';

@ApiTags('HR - Job Grades')
@ApiBearerAuth()
@Controller('hr/job-grades')
export class JobGradesController {
  constructor(private readonly jobGradesService: JobGradesService) {}

  @Get()
  @RequirePermissions('hr:job-grade:read')
  @ApiOperation({ summary: 'Get all job grades with pagination and filtering' })
  @ApiResponse({
    status: 200,
    description: 'List of job grades retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Missing required permissions',
  })
  async findAll(@Query() query: JobGradeQueryDto) {
    return this.jobGradesService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('hr:job-grade:read')
  @ApiOperation({ summary: 'Get a single job grade by ID' })
  @ApiParam({ name: 'id', description: 'Job Grade UUID' })
  @ApiResponse({ status: 200, description: 'Job grade retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Missing required permissions',
  })
  @ApiResponse({ status: 404, description: 'Job grade not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.jobGradesService.findOne(id);
  }

  @Post()
  @RequirePermissions('hr:job-grade:create')
  @ApiOperation({ summary: 'Create a new job grade' })
  @ApiResponse({ status: 201, description: 'Job grade created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input or minSalary > maxSalary',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Missing required permissions',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Job grade with code already exists',
  })
  async create(
    @Body() dto: CreateJobGradeDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.jobGradesService.create(dto, user.id);
  }

  @Patch(':id')
  @RequirePermissions('hr:job-grade:update')
  @ApiOperation({ summary: 'Update a job grade' })
  @ApiParam({ name: 'id', description: 'Job Grade UUID' })
  @ApiResponse({ status: 200, description: 'Job grade updated successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input or minSalary > maxSalary',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Missing required permissions',
  })
  @ApiResponse({ status: 404, description: 'Job grade not found' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Job grade with code already exists',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateJobGradeDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.jobGradesService.update(id, dto, user.id);
  }

  @Delete(':id')
  @RequirePermissions('hr:job-grade:delete')
  @ApiOperation({ summary: 'Soft delete a job grade' })
  @ApiParam({ name: 'id', description: 'Job Grade UUID' })
  @ApiResponse({ status: 200, description: 'Job grade deleted successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Job grade has active employees',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Missing required permissions',
  })
  @ApiResponse({ status: 404, description: 'Job grade not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.jobGradesService.remove(id, user.id);
  }
}