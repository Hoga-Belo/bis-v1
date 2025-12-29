import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, DataSource } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LeaveRequest, LeaveStatus, LeaveType } from '../../../entities/hr/leave-request.entity';
import { Employee } from '../../../entities/hr/employee.entity';
import { Attendance, AttendanceStatus } from '../../../entities/hr/attendance.entity';
import { ApprovalService } from '../approval/approval.service';
import {
  CreateLeaveRequestDto,
  ApproveLeaveDto,
  RejectLeaveDto,
  LeaveRequestQueryDto,
} from './dto';

@Injectable()
export class LeaveRequestsService {
  private readonly logger = new Logger(LeaveRequestsService.name);

  constructor(
    @InjectRepository(LeaveRequest)
    private readonly leaveRequestRepository: Repository<LeaveRequest>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    private readonly approvalService: ApprovalService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Calculate total days between two dates (inclusive)
   * Excludes weekends (Saturday and Sunday)
   */
  private calculateTotalDays(startDate: Date, endDate: Date): number {
    let totalDays = 0;
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      // Exclude Saturday (6) and Sunday (0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        totalDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return totalDays;
  }

  /**
   * Validate that employee exists and is active
   */
  private async validateEmployee(employeeId: string): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId, deletedAt: IsNull() },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    return employee;
  }

  /**
   * Submit a new leave request
   */
  async submitLeaveRequest(
    employeeId: string,
    dto: CreateLeaveRequestDto,
  ): Promise<LeaveRequest> {
    // Validate employee
    const employee = await this.validateEmployee(employeeId);

    // Parse dates
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    // Validate dates
    if (startDate > endDate) {
      throw new BadRequestException('Start date must be before or equal to end date');
    }

    // Check if start date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (startDate < today) {
      throw new BadRequestException('Start date cannot be in the past');
    }

    // Calculate total days
    const totalDays = this.calculateTotalDays(startDate, endDate);

    if (totalDays === 0) {
      throw new BadRequestException('Leave request must include at least one working day');
    }

    // Check leave balance based on leave type
    if (dto.leaveType === LeaveType.ANNUAL) {
      if (employee.annualLeaveBalance < totalDays) {
        throw new BadRequestException(
          `Insufficient annual leave balance. Available: ${employee.annualLeaveBalance}, Requested: ${totalDays}`,
        );
      }
    } else if (dto.leaveType === LeaveType.SICK) {
      // For sick leave, check balance but allow if attachment is provided
      if (employee.sickLeaveBalance < totalDays && !dto.attachmentUrl) {
        throw new BadRequestException(
          `Insufficient sick leave balance. Available: ${employee.sickLeaveBalance}, Requested: ${totalDays}. Please provide a medical certificate for extended sick leave.`,
        );
      }
    }
    // Other leave types (MATERNITY, PATERNITY, UNPAID, PERMIT) don't require balance check

    // Find available approver
    const { approver, isDelegate } = await this.approvalService.findAvailableApprover(
      employeeId,
      startDate,
      endDate,
    );

    // Create leave request
    const leaveRequest = this.leaveRequestRepository.create({
      employeeId,
      leaveType: dto.leaveType,
      startDate,
      endDate,
      totalDays,
      reason: dto.reason,
      attachmentUrl: dto.attachmentUrl || null,
      status: LeaveStatus.PENDING,
      approverId: approver?.id || null,
      delegateApproverId: isDelegate ? approver?.id : null,
    });

    const savedRequest = await this.leaveRequestRepository.save(leaveRequest);

    // Load relations for response
    return this.leaveRequestRepository.findOne({
      where: { id: savedRequest.id },
      relations: ['employee', 'approver', 'delegateApprover'],
    }) as Promise<LeaveRequest>;
  }

  /**
   * Get leave requests for the logged-in employee
   */
  async getMyLeaveRequests(employeeId: string, query: LeaveRequestQueryDto) {
    const { page = 1, limit = 10, status, leaveType, year } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.leaveRequestRepository
      .createQueryBuilder('leave')
      .leftJoinAndSelect('leave.approver', 'approver')
      .leftJoinAndSelect('leave.delegateApprover', 'delegateApprover')
      .where('leave.employeeId = :employeeId', { employeeId })
      .andWhere('leave.deletedAt IS NULL');

    if (status) {
      queryBuilder.andWhere('leave.status = :status', { status });
    }

    if (leaveType) {
      queryBuilder.andWhere('leave.leaveType = :leaveType', { leaveType });
    }

    if (year) {
      queryBuilder.andWhere('EXTRACT(YEAR FROM leave.startDate) = :year', { year });
    }

    queryBuilder.orderBy('leave.createdAt', 'DESC');

    const total = await queryBuilder.getCount();
    queryBuilder.skip(skip).take(limit);

    const data = await queryBuilder.getMany();

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get pending approvals for an approver
   */
  async getPendingApprovals(approverId: string) {
    const queryBuilder = this.leaveRequestRepository
      .createQueryBuilder('leave')
      .leftJoinAndSelect('leave.employee', 'employee')
      .leftJoinAndSelect('employee.position', 'position')
      .where('leave.status = :status', { status: LeaveStatus.PENDING })
      .andWhere('leave.deletedAt IS NULL')
      .andWhere(
        '(leave.approverId = :approverId OR leave.delegateApproverId = :approverId)',
        { approverId },
      )
      .orderBy('leave.createdAt', 'ASC');

    const data = await queryBuilder.getMany();

    return {
      data: data.map((leave) => ({
        ...leave,
        employee: leave.employee
          ? {
              id: leave.employee.id,
              nik: leave.employee.nik,
              fullName: leave.employee.fullName,
              position: leave.employee.position
                ? {
                    id: leave.employee.position.id,
                    name: leave.employee.position.name,
                  }
                : null,
            }
          : null,
      })),
      total: data.length,
    };
  }

  /**
   * Get leave request by ID
   */
  async getLeaveRequestById(id: string): Promise<LeaveRequest> {
    const leaveRequest = await this.leaveRequestRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['employee', 'approver', 'delegateApprover'],
    });

    if (!leaveRequest) {
      throw new NotFoundException(`Leave request with ID ${id} not found`);
    }

    return leaveRequest;
  }

  /**
   * Approve a leave request
   */
  async approveLeaveRequest(
    requestId: string,
    approverId: string,
    dto: ApproveLeaveDto,
  ): Promise<LeaveRequest> {
    const leaveRequest = await this.getLeaveRequestById(requestId);

    // Validate status
    if (leaveRequest.status !== LeaveStatus.PENDING) {
      throw new BadRequestException(
        `Cannot approve leave request with status ${leaveRequest.status}`,
      );
    }

    // Validate approver
    if (
      leaveRequest.approverId !== approverId &&
      leaveRequest.delegateApproverId !== approverId
    ) {
      throw new ForbiddenException('You are not authorized to approve this leave request');
    }

    // Use transaction for atomicity
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update leave request status
      leaveRequest.status = LeaveStatus.APPROVED;
      leaveRequest.approvedAt = new Date();
      leaveRequest.approvalNotes = dto.notes || null;

      await queryRunner.manager.save(leaveRequest);

      // Deduct leave balance
      const employee = await queryRunner.manager.findOne(Employee, {
        where: { id: leaveRequest.employeeId },
      });

      if (employee) {
        if (leaveRequest.leaveType === LeaveType.ANNUAL) {
          employee.annualLeaveBalance = Math.max(
            0,
            employee.annualLeaveBalance - leaveRequest.totalDays,
          );
        } else if (leaveRequest.leaveType === LeaveType.SICK) {
          employee.sickLeaveBalance = Math.max(
            0,
            employee.sickLeaveBalance - leaveRequest.totalDays,
          );
        }
        await queryRunner.manager.save(employee);
      }

      // Create attendance records for each day of leave
      const startDate = new Date(leaveRequest.startDate);
      const endDate = new Date(leaveRequest.endDate);
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();
        // Only create attendance for working days
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          // Check if attendance record already exists
          const existingAttendance = await queryRunner.manager.findOne(Attendance, {
            where: {
              employeeId: leaveRequest.employeeId,
              attendanceDate: new Date(currentDate),
              deletedAt: IsNull(),
            },
          });

          if (!existingAttendance) {
            // Determine attendance status based on leave type
            let attendanceStatus: AttendanceStatus;
            switch (leaveRequest.leaveType) {
              case LeaveType.SICK:
                attendanceStatus = AttendanceStatus.SICK;
                break;
              case LeaveType.PERMIT:
                attendanceStatus = AttendanceStatus.PERMIT;
                break;
              default:
                attendanceStatus = AttendanceStatus.LEAVE;
            }

            const attendance = queryRunner.manager.create(Attendance, {
              employeeId: leaveRequest.employeeId,
              attendanceDate: new Date(currentDate),
              status: attendanceStatus,
              notes: `Leave request: ${leaveRequest.leaveType} - ${leaveRequest.reason}`,
            });

            await queryRunner.manager.save(attendance);
          }
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      await queryRunner.commitTransaction();

      this.logger.log(
        `Leave request ${requestId} approved by ${approverId}. Balance deducted: ${leaveRequest.totalDays} days`,
      );

      return this.getLeaveRequestById(requestId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Reject a leave request
   */
  async rejectLeaveRequest(
    requestId: string,
    approverId: string,
    dto: RejectLeaveDto,
  ): Promise<LeaveRequest> {
    const leaveRequest = await this.getLeaveRequestById(requestId);

    // Validate status
    if (leaveRequest.status !== LeaveStatus.PENDING) {
      throw new BadRequestException(
        `Cannot reject leave request with status ${leaveRequest.status}`,
      );
    }

    // Validate approver
    if (
      leaveRequest.approverId !== approverId &&
      leaveRequest.delegateApproverId !== approverId
    ) {
      throw new ForbiddenException('You are not authorized to reject this leave request');
    }

    // Update leave request status
    leaveRequest.status = LeaveStatus.REJECTED;
    leaveRequest.approvalNotes = dto.notes;

    await this.leaveRequestRepository.save(leaveRequest);

    this.logger.log(`Leave request ${requestId} rejected by ${approverId}`);

    return this.getLeaveRequestById(requestId);
  }

  /**
   * Cancel a leave request (by the employee)
   */
  async cancelLeaveRequest(requestId: string, employeeId: string): Promise<LeaveRequest> {
    const leaveRequest = await this.getLeaveRequestById(requestId);

    // Validate employee
    if (leaveRequest.employeeId !== employeeId) {
      throw new ForbiddenException('You can only cancel your own leave requests');
    }

    // Validate status
    if (leaveRequest.status !== LeaveStatus.PENDING) {
      throw new BadRequestException(
        `Cannot cancel leave request with status ${leaveRequest.status}. Only pending requests can be cancelled.`,
      );
    }

    // Update leave request status
    leaveRequest.status = LeaveStatus.CANCELLED;

    await this.leaveRequestRepository.save(leaveRequest);

    this.logger.log(`Leave request ${requestId} cancelled by employee ${employeeId}`);

    return this.getLeaveRequestById(requestId);
  }

  /**
   * Get leave balance for an employee
   */
  async getLeaveBalance(employeeId: string): Promise<{
    annualLeaveBalance: number;
    sickLeaveBalance: number;
  }> {
    const employee = await this.validateEmployee(employeeId);

    return {
      annualLeaveBalance: employee.annualLeaveBalance,
      sickLeaveBalance: employee.sickLeaveBalance,
    };
  }

  /**
   * Get leave statistics for an employee for a specific year
   */
  async getLeaveStatistics(
    employeeId: string,
    year: number,
  ): Promise<{
    year: number;
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    cancelledRequests: number;
    totalAnnualDaysTaken: number;
    totalSickDaysTaken: number;
    totalOtherDaysTaken: number;
  }> {
    // Validate employee exists
    await this.validateEmployee(employeeId);

    // Get all leave requests for the year
    const leaveRequests = await this.leaveRequestRepository
      .createQueryBuilder('leave')
      .where('leave.employeeId = :employeeId', { employeeId })
      .andWhere('EXTRACT(YEAR FROM leave.startDate) = :year', { year })
      .andWhere('leave.deletedAt IS NULL')
      .getMany();

    // Initialize counters
    let pendingRequests = 0;
    let approvedRequests = 0;
    let rejectedRequests = 0;
    let cancelledRequests = 0;
    let totalAnnualDaysTaken = 0;
    let totalSickDaysTaken = 0;
    let totalOtherDaysTaken = 0;

    // Calculate statistics
    for (const request of leaveRequests) {
      // Count by status
      switch (request.status) {
        case LeaveStatus.PENDING:
          pendingRequests++;
          break;
        case LeaveStatus.APPROVED:
          approvedRequests++;
          break;
        case LeaveStatus.REJECTED:
          rejectedRequests++;
          break;
        case LeaveStatus.CANCELLED:
          cancelledRequests++;
          break;
      }

      // Sum days by leave type (only for approved requests)
      if (request.status === LeaveStatus.APPROVED) {
        switch (request.leaveType) {
          case LeaveType.ANNUAL:
            totalAnnualDaysTaken += request.totalDays;
            break;
          case LeaveType.SICK:
            totalSickDaysTaken += request.totalDays;
            break;
          default:
            totalOtherDaysTaken += request.totalDays;
            break;
        }
      }
    }

    return {
      year,
      totalRequests: leaveRequests.length,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      cancelledRequests,
      totalAnnualDaysTaken,
      totalSickDaysTaken,
      totalOtherDaysTaken,
    };
  }

  /**
   * Cron job to escalate pending leave requests that have exceeded the SLA
   * Runs daily at midnight (00:00)
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleEscalation(): Promise<void> {
    this.logger.log('Running scheduled escalation check for pending leave requests');
    
    try {
      const escalatedCount = await this.approvalService.escalatePendingApprovals(3);
      this.logger.log(`Scheduled escalation completed: ${escalatedCount} requests escalated`);
    } catch (error) {
      this.logger.error('Error during scheduled escalation:', error);
    }
  }
}