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
import { PositionsService } from './positions.service';
import { CreatePositionDto, UpdatePositionDto, PositionQueryDto } from './dto';

@ApiTags('HR - Positions')
@ApiBearerAuth()
@Controller('hr/positions')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Get()
  @RequirePermissions('hr:position:read')
  @ApiOperation({ summary: 'Get all positions with pagination and filtering' })
  @ApiResponse({
    status: 200,
    description: 'List of positions retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Missing required permissions',
  })
  async findAll(@Query() query: PositionQueryDto) {
    return this.positionsService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('hr:position:read')
  @ApiOperation({ summary: 'Get a single position by ID' })
  @ApiParam({ name: 'id', description: 'Position UUID' })
  @ApiResponse({ status: 200, description: 'Position retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Missing required permissions',
  })
  @ApiResponse({ status: 404, description: 'Position not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.positionsService.findOne(id);
  }

  @Post()
  @RequirePermissions('hr:position:create')
  @ApiOperation({ summary: 'Create a new position' })
  @ApiResponse({ status: 201, description: 'Position created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Missing required permissions',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Position with code already exists',
  })
  async create(
    @Body() dto: CreatePositionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.positionsService.create(dto, user.id);
  }

  @Patch(':id')
  @RequirePermissions('hr:position:update')
  @ApiOperation({ summary: 'Update a position' })
  @ApiParam({ name: 'id', description: 'Position UUID' })
  @ApiResponse({ status: 200, description: 'Position updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Missing required permissions',
  })
  @ApiResponse({ status: 404, description: 'Position not found' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Position with code already exists',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePositionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.positionsService.update(id, dto, user.id);
  }

  @Delete(':id')
  @RequirePermissions('hr:position:delete')
  @ApiOperation({ summary: 'Soft delete a position' })
  @ApiParam({ name: 'id', description: 'Position UUID' })
  @ApiResponse({ status: 200, description: 'Position deleted successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Position has active employees',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Missing required permissions',
  })
  @ApiResponse({ status: 404, description: 'Position not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.positionsService.remove(id, user.id);
  }
}