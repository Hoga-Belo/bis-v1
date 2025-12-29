import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, LessThan } from 'typeorm';
import { Employee, LeaveRequest } from '../../../entities/hr';
import { LeaveStatus } from '../../../entities/hr/leave-request.entity';

/**
 * ApprovalService - Reusable service for approval workflow
 *
 * This service handles the approval workflow logic for Leave Requests
 * and can be extended for other modules that require approval workflows.
 *
 * Key features:
 * - Detect direct approver (manager) for an employee
 * - Check approver availability (not on leave during the request period)
 * - Find delegate approver (skip-level manager) when direct approver is unavailable
 * - Build approval chain for hierarchy visualization
 */
@Injectable()
export class ApprovalService {
  private readonly logger = new Logger(ApprovalService.name);

  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(LeaveRequest)
    private readonly leaveRequestRepository: Repository<LeaveRequest>,
  ) {}

  /**
   * Detect the direct approver (manager) for an employee
   *
   * @param employeeId - The ID of the employee requesting approval
   * @returns The manager Employee object, or null if no manager exists
   */
  async detectApprover(employeeId: string): Promise<Employee | null> {
    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId, deletedAt: IsNull() },
      relations: ['manager'],
    });

    if (!employee) {
      this.logger.warn(`Employee not found: ${employeeId}`);
      return null;
    }

    if (!employee.manager) {
      this.logger.log(
        `Employee ${employeeId} has no manager, will escalate to HR Admin`,
      );
      return null;
    }

    this.logger.log(
      `Direct approver for employee ${employeeId}: ${employee.manager.id} (${employee.manager.fullName})`,
    );
    return employee.manager;
  }

  /**
   * Check if an approver is available (not on leave) during a date range
   *
   * @param approverId - The ID of the approver to check
   * @param startDate - Start date of the leave request
   * @param endDate - End date of the leave request
   * @returns true if approver is available, false if on leave
   */
  async checkApproverAvailability(
    approverId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<boolean> {
    // Check if approver has any approved leave that overlaps with the date range
    // Overlap condition: leave.startDate <= endDate AND leave.endDate >= startDate
    const overlappingLeave = await this.leaveRequestRepository
      .createQueryBuilder('leave')
      .where('leave.employeeId = :approverId', { approverId })
      .andWhere('leave.status = :status', { status: LeaveStatus.APPROVED })
      .andWhere('leave.deletedAt IS NULL')
      .andWhere(
        '(leave.startDate <= :endDate AND leave.endDate >= :startDate)',
        { startDate, endDate },
      )
      .getOne();

    if (overlappingLeave) {
      this.logger.log(
        `Approver ${approverId} is on leave from ${overlappingLeave.startDate} to ${overlappingLeave.endDate}`,
      );
      return false;
    }

    this.logger.log(`Approver ${approverId} is available for the date range`);
    return true;
  }

  /**
   * Find a delegate approver (skip-level manager) when direct approver is unavailable
   *
   * @param originalApproverId - The ID of the original (unavailable) approver
   * @returns The skip-level manager Employee object, or null if not found
   */
  async findDelegateApprover(
    originalApproverId: string,
  ): Promise<Employee | null> {
    // Get the original approver's manager (skip-level)
    const originalApprover = await this.employeeRepository.findOne({
      where: { id: originalApproverId, deletedAt: IsNull() },
      relations: ['manager'],
    });

    if (!originalApprover || !originalApprover.manager) {
      this.logger.log(
        `No delegate approver found for ${originalApproverId}, will escalate to HR Admin`,
      );
      return null;
    }

    this.logger.log(
      `Delegate approver for ${originalApproverId}: ${originalApprover.manager.id} (${originalApprover.manager.fullName})`,
    );
    return originalApprover.manager;
  }

  /**
   * Build the full approval chain from employee up to top management
   *
   * @param employeeId - The ID of the employee
   * @returns Array of managers in order (direct manager first)
   */
  async getApprovalChain(employeeId: string): Promise<Employee[]> {
    const chain: Employee[] = [];
    const visited = new Set<string>(); // Prevent infinite loops from circular references

    let currentEmployee = await this.employeeRepository.findOne({
      where: { id: employeeId, deletedAt: IsNull() },
      relations: ['manager'],
    });

    while (currentEmployee?.manager) {
      // Check for circular reference
      if (visited.has(currentEmployee.manager.id)) {
        this.logger.warn(
          `Circular reference detected in approval chain at employee ${currentEmployee.manager.id}`,
        );
        break;
      }

      visited.add(currentEmployee.manager.id);
      chain.push(currentEmployee.manager);

      currentEmployee = await this.employeeRepository.findOne({
        where: { id: currentEmployee.manager.id, deletedAt: IsNull() },
        relations: ['manager'],
      });
    }

    this.logger.log(
      `Approval chain for employee ${employeeId}: ${chain.map((e) => e.fullName).join(' -> ')}`,
    );
    return chain;
  }

  /**
   * Find an available approver for a leave request
   *
   * This is the main method that combines all approval logic:
   * 1. Detect direct approver (manager)
   * 2. Check if direct approver is available
   * 3. If not available, find delegate approver (skip-level manager)
   * 4. Check if delegate is available
   *
   * @param employeeId - The ID of the employee requesting leave
   * @param startDate - Start date of the leave request
   * @param endDate - End date of the leave request
   * @returns Object containing the available approver and whether it's a delegate
   */
  async findAvailableApprover(
    employeeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{ approver: Employee | null; isDelegate: boolean }> {
    this.logger.log(
      `Finding available approver for employee ${employeeId} (${startDate} to ${endDate})`,
    );

    // Step 1: Detect direct approver
    const directApprover = await this.detectApprover(employeeId);

    if (!directApprover) {
      this.logger.log(
        `No direct approver found for employee ${employeeId}, escalating to HR Admin`,
      );
      return { approver: null, isDelegate: false };
    }

    // Step 2: Check if direct approver is available
    const isAvailable = await this.checkApproverAvailability(
      directApprover.id,
      startDate,
      endDate,
    );

    if (isAvailable) {
      this.logger.log(
        `Direct approver ${directApprover.fullName} is available`,
      );
      return { approver: directApprover, isDelegate: false };
    }

    // Step 3: Direct approver is on leave, find delegate
    this.logger.log(
      `Direct approver ${directApprover.fullName} is unavailable, finding delegate`,
    );

    const delegateApprover = await this.findDelegateApprover(directApprover.id);

    if (!delegateApprover) {
      this.logger.log(
        `No delegate approver found, escalating to HR Admin`,
      );
      return { approver: null, isDelegate: false };
    }

    // Step 4: Check if delegate is available
    const isDelegateAvailable = await this.checkApproverAvailability(
      delegateApprover.id,
      startDate,
      endDate,
    );

    if (isDelegateAvailable) {
      this.logger.log(
        `Delegate approver ${delegateApprover.fullName} is available`,
      );
      return { approver: delegateApprover, isDelegate: true };
    }

    // No available approver found, will need to escalate to HR Admin
    this.logger.log(
      `Both direct and delegate approvers are unavailable, escalating to HR Admin`,
    );
    return { approver: null, isDelegate: false };
  }

  /**
   * Get approver information with availability status for a specific date range
   *
   * Useful for displaying approver status in the UI before submitting a request
   *
   * @param employeeId - The ID of the employee
   * @param startDate - Start date to check
   * @param endDate - End date to check
   * @returns Detailed approver information including availability
   */
  async getApproverInfo(
    employeeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    directApprover: Employee | null;
    directApproverAvailable: boolean;
    delegateApprover: Employee | null;
    delegateApproverAvailable: boolean;
    finalApprover: Employee | null;
    isDelegate: boolean;
  }> {
    const directApprover = await this.detectApprover(employeeId);
    let directApproverAvailable = false;
    let delegateApprover: Employee | null = null;
    let delegateApproverAvailable = false;

    if (directApprover) {
      directApproverAvailable = await this.checkApproverAvailability(
        directApprover.id,
        startDate,
        endDate,
      );

      if (!directApproverAvailable) {
        delegateApprover = await this.findDelegateApprover(directApprover.id);
        if (delegateApprover) {
          delegateApproverAvailable = await this.checkApproverAvailability(
            delegateApprover.id,
            startDate,
            endDate,
          );
        }
      }
    }

    // Determine final approver
    let finalApprover: Employee | null = null;
    let isDelegate = false;

    if (directApproverAvailable) {
      finalApprover = directApprover;
      isDelegate = false;
    } else if (delegateApproverAvailable) {
      finalApprover = delegateApprover;
      isDelegate = true;
    }

    return {
      directApprover,
      directApproverAvailable,
      delegateApprover,
      delegateApproverAvailable,
      finalApprover,
      isDelegate,
    };
  }

  /**
   * Escalate pending leave requests that have exceeded the SLA
   *
   * This method finds all pending leave requests older than the specified SLA days
   * and escalates them to the delegate approver (skip-level manager).
   *
   * @param slaDays - Number of days after which to escalate (default: 3)
   * @returns Number of requests escalated
   */
  async escalatePendingApprovals(slaDays: number = 3): Promise<number> {
    this.logger.log(`Starting escalation check for requests older than ${slaDays} days`);

    // Calculate the cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - slaDays);

    // Find all pending leave requests older than SLA
    const pendingRequests = await this.leaveRequestRepository.find({
      where: {
        status: LeaveStatus.PENDING,
        deletedAt: IsNull(),
        createdAt: LessThan(cutoffDate),
      },
      relations: ['approver', 'employee'],
    });

    this.logger.log(`Found ${pendingRequests.length} pending requests older than ${slaDays} days`);

    let escalatedCount = 0;

    for (const request of pendingRequests) {
      // Skip if no current approver
      if (!request.approverId) {
        this.logger.warn(`Request ${request.id} has no approver, skipping escalation`);
        continue;
      }

      // Find delegate approver
      const delegateApprover = await this.findDelegateApprover(request.approverId);

      if (!delegateApprover) {
        this.logger.warn(
          `No delegate approver found for request ${request.id}, cannot escalate`,
        );
        continue;
      }

      // Check if delegate is available for the leave period
      const isDelegateAvailable = await this.checkApproverAvailability(
        delegateApprover.id,
        request.startDate,
        request.endDate,
      );

      if (!isDelegateAvailable) {
        this.logger.warn(
          `Delegate approver ${delegateApprover.fullName} is not available for request ${request.id}`,
        );
        continue;
      }

      // Update the request with the delegate approver
      const originalApproverId = request.approverId;
      request.delegateApproverId = delegateApprover.id;
      
      await this.leaveRequestRepository.save(request);

      this.logger.log(
        `Escalated request ${request.id} from approver ${originalApproverId} to delegate ${delegateApprover.id} (${delegateApprover.fullName})`,
      );

      escalatedCount++;
    }

    this.logger.log(`Escalation complete: ${escalatedCount} requests escalated`);
    return escalatedCount;
  }
}