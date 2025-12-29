import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import {
  ClockInDto,
  ClockOutDto,
  AttendanceQueryDto,
  UpdateAttendanceStatusDto,
} from './dto';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

interface JwtUser {
  sub: string;
  nik: string;
  employeeId?: string;
}

@ApiTags('HR - Attendance')
@ApiBearerAuth()
@Controller('hr/attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('clock-in')
  @RequirePermissions('hr:attendance:create')
  @ApiOperation({ summary: 'Clock in for the current employee' })
  @ApiResponse({ status: 201, description: 'Successfully clocked in' })
  @ApiResponse({ status: 400, description: 'Bad request - Employee not active' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  @ApiResponse({ status: 409, description: 'Already clocked in today' })
  async clockIn(@CurrentUser() user: JwtUser, @Body() dto: ClockInDto) {
    if (!user.employeeId) {
      throw new BadRequestException('User is not linked to an employee record');
    }
    return this.attendanceService.clockIn(user.employeeId, dto);
  }

  @Post('clock-out')
  @RequirePermissions('hr:attendance:create')
  @ApiOperation({ summary: 'Clock out for the current employee' })
  @ApiResponse({ status: 201, description: 'Successfully clocked out' })
  @ApiResponse({ status: 404, description: 'No clock-in record found for today' })
  @ApiResponse({ status: 409, description: 'Already clocked out today' })
  async clockOut(@CurrentUser() user: JwtUser, @Body() dto: ClockOutDto) {
    if (!user.employeeId) {
      throw new BadRequestException('User is not linked to an employee record');
    }
    return this.attendanceService.clockOut(user.employeeId, dto);
  }

  @Get('me')
  @RequirePermissions('hr:attendance:read')
  @ApiOperation({ summary: 'Get attendance records for the current employee' })
  @ApiResponse({ status: 200, description: 'Returns paginated attendance records' })
  async getMyAttendance(@CurrentUser() user: JwtUser, @Query() query: AttendanceQueryDto) {
    if (!user.employeeId) {
      throw new BadRequestException('User is not linked to an employee record');
    }
    return this.attendanceService.getMyAttendance(user.employeeId, query);
  }

  @Get('me/today')
  @RequirePermissions('hr:attendance:read')
  @ApiOperation({ summary: "Get today's attendance record for the current employee" })
  @ApiResponse({ status: 200, description: "Returns today's attendance record or null" })
  async getMyTodayAttendance(@CurrentUser() user: JwtUser) {
    if (!user.employeeId) {
      throw new BadRequestException('User is not linked to an employee record');
    }
    return this.attendanceService.getTodayAttendance(user.employeeId);
  }

  @Get('employee/:employeeId')
  @RequirePermissions('hr:attendance:read')
  @ApiOperation({ summary: 'Get attendance records for a specific employee (manager/HR)' })
  @ApiParam({ name: 'employeeId', description: 'Employee UUID' })
  @ApiResponse({ status: 200, description: 'Returns paginated attendance records' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async getAttendanceByEmployee(
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
    @Query() query: AttendanceQueryDto,
  ) {
    return this.attendanceService.getAttendanceByEmployee(employeeId, query);
  }

  @Get('statistics')
  @RequirePermissions('hr:attendance:read')
  @ApiOperation({ summary: 'Get attendance statistics for the current employee' })
  @ApiQuery({ name: 'month', description: 'Month (1-12)', required: true })
  @ApiQuery({ name: 'year', description: 'Year (e.g., 2024)', required: true })
  @ApiResponse({ status: 200, description: 'Returns attendance statistics' })
  @ApiResponse({ status: 400, description: 'Invalid month or year' })
  async getMyStatistics(
    @CurrentUser() user: JwtUser,
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    if (!user.employeeId) {
      throw new BadRequestException('User is not linked to an employee record');
    }
    return this.attendanceService.getAttendanceStatistics(user.employeeId, month, year);
  }

  @Get('statistics/:employeeId')
  @RequirePermissions('hr:attendance:read')
  @ApiOperation({ summary: 'Get attendance statistics for a specific employee (manager/HR)' })
  @ApiParam({ name: 'employeeId', description: 'Employee UUID' })
  @ApiQuery({ name: 'month', description: 'Month (1-12)', required: true })
  @ApiQuery({ name: 'year', description: 'Year (e.g., 2024)', required: true })
  @ApiResponse({ status: 200, description: 'Returns attendance statistics' })
  @ApiResponse({ status: 400, description: 'Invalid month or year' })
  async getEmployeeStatistics(
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    return this.attendanceService.getAttendanceStatistics(employeeId, month, year);
  }

  @Patch(':id/status')
  @RequirePermissions('hr:attendance:update')
  @ApiOperation({ summary: 'Update attendance status (HR Admin manual override)' })
  @ApiParam({ name: 'id', description: 'Attendance record UUID' })
  @ApiResponse({ status: 200, description: 'Attendance status updated successfully' })
  @ApiResponse({ status: 404, description: 'Attendance record not found' })
  async updateAttendanceStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAttendanceStatusDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.attendanceService.updateAttendanceStatus(id, dto, user.sub);
  }

  @Get()
  @RequirePermissions('hr:attendance:read')
  @ApiOperation({ summary: 'Get all attendance records with filters (admin)' })
  @ApiResponse({ status: 200, description: 'Returns paginated attendance records' })
  async findAll(@Query() query: AttendanceQueryDto) {
    return this.attendanceService.findAll(query);
  }
}