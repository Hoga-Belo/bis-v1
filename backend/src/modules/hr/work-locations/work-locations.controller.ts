import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { WorkLocationsService } from './work-locations.service';
import {
  CreateWorkLocationDto,
  UpdateWorkLocationDto,
  WorkLocationQueryDto,
} from './dto';
import { RequirePermissions } from '../../../common/decorators';

@ApiTags('HR - Work Locations')
@ApiBearerAuth()
@Controller('hr/work-locations')
export class WorkLocationsController {
  constructor(private readonly workLocationsService: WorkLocationsService) {}

  @Post()
  @RequirePermissions('hr:work-location:create')
  @ApiOperation({ summary: 'Create a new work location' })
  @ApiResponse({
    status: 201,
    description: 'Work location created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Work location code already exists' })
  create(@Body() createWorkLocationDto: CreateWorkLocationDto) {
    return this.workLocationsService.create(createWorkLocationDto);
  }

  @Get()
  @RequirePermissions('hr:work-location:read')
  @ApiOperation({ summary: 'Get all work locations with pagination' })
  @ApiResponse({ status: 200, description: 'List of work locations' })
  findAll(@Query() query: WorkLocationQueryDto) {
    return this.workLocationsService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('hr:work-location:read')
  @ApiOperation({ summary: 'Get a work location by ID' })
  @ApiParam({ name: 'id', description: 'Work location ID' })
  @ApiResponse({ status: 200, description: 'Work location found' })
  @ApiResponse({ status: 404, description: 'Work location not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.workLocationsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('hr:work-location:update')
  @ApiOperation({ summary: 'Update a work location' })
  @ApiParam({ name: 'id', description: 'Work location ID' })
  @ApiResponse({
    status: 200,
    description: 'Work location updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Work location not found' })
  @ApiResponse({ status: 409, description: 'Work location code already exists' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateWorkLocationDto: UpdateWorkLocationDto,
  ) {
    return this.workLocationsService.update(id, updateWorkLocationDto);
  }

  @Delete(':id')
  @RequirePermissions('hr:work-location:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a work location' })
  @ApiParam({ name: 'id', description: 'Work location ID' })
  @ApiResponse({
    status: 204,
    description: 'Work location deleted successfully',
  })
  @ApiResponse({ status: 400, description: 'Cannot delete - active employees assigned' })
  @ApiResponse({ status: 404, description: 'Work location not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.workLocationsService.remove(id);
  }
}