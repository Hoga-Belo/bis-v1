import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
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
import { LeaveRequestsService } from './leave-requests.service';
import {
  CreateLeaveRequestDto,
  ApproveLeaveDto,
  RejectLeaveDto,
  LeaveRequestQueryDto,
} from './dto';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../../entities/user-access/user.entity';

/**
 * Helper function to validate that user has an associated employee
 */
function validateEmployeeId(user: User): string {
  if (!user.employeeId) {
    throw new BadRequestException(
      'User does not have an associated employee record. Please contact HR.',
    );
  }
  return user.employeeId;
}

@ApiTags('HR - Leave Requests')
@ApiBearerAuth()
@Controller('hr/leave-requests')
export class LeaveRequestsController {
  constructor(private readonly leaveRequestsService: LeaveRequestsService) {}

  /**
   * Submit a new leave request
   */
  @Post()
  @RequirePermissions('hr:leave:create')
  @ApiOperation({ summary: 'Submit a new leave request' })
  @ApiResponse({
    status: 201,
    description: 'Leave request submitted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data or insufficient leave balance',
  })
  async submitLeaveRequest(
    @CurrentUser() user: User,
    @Body() dto: CreateLeaveRequestDto,
  ) {
    const employeeId = validateEmployeeId(user);
    const leaveRequest = await this.leaveRequestsService.submitLeaveRequest(
      employeeId,
      dto,
    );
    return {
      success: true,
      message: 'Leave request submitted successfully',
      data: leaveRequest,
    };
  }

  /**
   * Get my leave requests
   */
  @Get('me')
  @RequirePermissions('hr:leave:read')
  @ApiOperation({ summary: 'Get my leave requests' })
  @ApiResponse({
    status: 200,
    description: 'Leave requests retrieved successfully',
  })
  async getMyLeaveRequests(
    @CurrentUser() user: User,
    @Query() query: LeaveRequestQueryDto,
  ) {
    const employeeId = validateEmployeeId(user);
    const result = await this.leaveRequestsService.getMyLeaveRequests(
      employeeId,
      query,
    );
    return {
      success: true,
      message: 'Leave requests retrieved successfully',
      data: result.data,
      meta: result.meta,
    };
  }

  /**
   * Get pending approvals for the current user
   */
  @Get('pending-approvals')
  @RequirePermissions('hr:leave:approve')
  @ApiOperation({ summary: 'Get pending leave requests for approval' })
  @ApiResponse({
    status: 200,
    description: 'Pending approvals retrieved successfully',
  })
  async getPendingApprovals(@CurrentUser() user: User) {
    const employeeId = validateEmployeeId(user);
    const result = await this.leaveRequestsService.getPendingApprovals(
      employeeId,
    );
    return {
      success: true,
      message: 'Pending approvals retrieved successfully',
      data: result.data,
      meta: { total: result.total },
    };
  }

  /**
   * Get my leave balance
   */
  @Get('balance')
  @RequirePermissions('hr:leave:read')
  @ApiOperation({ summary: 'Get my leave balance' })
  @ApiResponse({
    status: 200,
    description: 'Leave balance retrieved successfully',
  })
  async getLeaveBalance(@CurrentUser() user: User) {
    const employeeId = validateEmployeeId(user);
    const balance = await this.leaveRequestsService.getLeaveBalance(
      employeeId,
    );
    return {
      success: true,
      message: 'Leave balance retrieved successfully',
      data: balance,
    };
  }

  /**
   * Get my leave statistics for a specific year
   */
  @Get('statistics')
  @RequirePermissions('hr:leave:read')
  @ApiOperation({ summary: 'Get my leave statistics for a specific year' })
  @ApiQuery({
    name: 'year',
    required: false,
    description: 'Year for statistics (defaults to current year)',
  })
  @ApiResponse({
    status: 200,
    description: 'Leave statistics retrieved successfully',
  })
  async getLeaveStatistics(
    @CurrentUser() user: User,
    @Query('year') year?: number,
  ) {
    const employeeId = validateEmployeeId(user);
    const statisticsYear = year || new Date().getFullYear();
    const statistics = await this.leaveRequestsService.getLeaveStatistics(
      employeeId,
      statisticsYear,
    );
    return {
      success: true,
      message: 'Leave statistics retrieved successfully',
      data: statistics,
    };
  }

  /**
   * Get leave request by ID
   */
  @Get(':id')
  @RequirePermissions('hr:leave:read')
  @ApiOperation({ summary: 'Get leave request by ID' })
  @ApiParam({ name: 'id', description: 'Leave request ID' })
  @ApiResponse({
    status: 200,
    description: 'Leave request retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Leave request not found',
  })
  async getLeaveRequestById(@Param('id', ParseUUIDPipe) id: string) {
    const leaveRequest = await this.leaveRequestsService.getLeaveRequestById(id);
    return {
      success: true,
      message: 'Leave request retrieved successfully',
      data: leaveRequest,
    };
  }

  /**
   * Approve a leave request
   */
  @Post(':id/approve')
  @RequirePermissions('hr:leave:approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve a leave request' })
  @ApiParam({ name: 'id', description: 'Leave request ID' })
  @ApiResponse({
    status: 200,
    description: 'Leave request approved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot approve leave request with current status',
  })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to approve this leave request',
  })
  @ApiResponse({
    status: 404,
    description: 'Leave request not found',
  })
  async approveLeaveRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() dto: ApproveLeaveDto,
  ) {
    const employeeId = validateEmployeeId(user);
    const leaveRequest = await this.leaveRequestsService.approveLeaveRequest(
      id,
      employeeId,
      dto,
    );
    return {
      success: true,
      message: 'Leave request approved successfully',
      data: leaveRequest,
    };
  }

  /**
   * Reject a leave request
   */
  @Post(':id/reject')
  @RequirePermissions('hr:leave:approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject a leave request' })
  @ApiParam({ name: 'id', description: 'Leave request ID' })
  @ApiResponse({
    status: 200,
    description: 'Leave request rejected successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot reject leave request with current status',
  })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to reject this leave request',
  })
  @ApiResponse({
    status: 404,
    description: 'Leave request not found',
  })
  async rejectLeaveRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() dto: RejectLeaveDto,
  ) {
    const employeeId = validateEmployeeId(user);
    const leaveRequest = await this.leaveRequestsService.rejectLeaveRequest(
      id,
      employeeId,
      dto,
    );
    return {
      success: true,
      message: 'Leave request rejected successfully',
      data: leaveRequest,
    };
  }

  /**
   * Cancel a leave request
   */
  @Delete(':id')
  @RequirePermissions('hr:leave:delete')
  @ApiOperation({ summary: 'Cancel a leave request' })
  @ApiParam({ name: 'id', description: 'Leave request ID' })
  @ApiResponse({
    status: 200,
    description: 'Leave request cancelled successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot cancel leave request with current status',
  })
  @ApiResponse({
    status: 403,
    description: 'Can only cancel your own leave requests',
  })
  @ApiResponse({
    status: 404,
    description: 'Leave request not found',
  })
  async cancelLeaveRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    const employeeId = validateEmployeeId(user);
    const leaveRequest = await this.leaveRequestsService.cancelLeaveRequest(
      id,
      employeeId,
    );
    return {
      success: true,
      message: 'Leave request cancelled successfully',
      data: leaveRequest,
    };
  }
}