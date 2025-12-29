// Leave type enum matching backend
export enum LeaveType {
  ANNUAL = 'ANNUAL',
  SICK = 'SICK',
  MATERNITY = 'MATERNITY',
  PATERNITY = 'PATERNITY',
  MARRIAGE = 'MARRIAGE',
  BEREAVEMENT = 'BEREAVEMENT',
  UNPAID = 'UNPAID',
  PERMIT = 'PERMIT',
  OTHER = 'OTHER',
}

// Leave status enum matching backend
export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

// Leave request interface
export interface LeaveRequest {
  id: string;
  employeeId: string;
  employee?: {
    id: string;
    nik: string;
    fullName: string;
    department?: { id: string; name: string };
    position?: { id: string; name: string };
  };
  leaveType: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalDays: number;
  reason: string;
  attachmentUrl?: string;
  status: LeaveStatus;
  approverId?: string;
  approver?: {
    id: string;
    nik: string;
    fullName: string;
  };
  delegateApproverId?: string;
  delegateApprover?: {
    id: string;
    nik: string;
    fullName: string;
  };
  approvedAt?: string;
  approvalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// Create leave request
export interface CreateLeaveRequest {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  attachmentUrl?: string;
}

// Approve leave request
export interface ApproveLeaveRequest {
  notes?: string;
}

// Reject leave request
export interface RejectLeaveRequest {
  notes: string;
}

// Leave request query params
export interface LeaveRequestQueryParams {
  page?: number;
  limit?: number;
  status?: LeaveStatus;
  leaveType?: LeaveType;
  year?: number;
  employeeId?: string;
}

// Leave balance
export interface LeaveBalance {
  annualLeaveBalance: number;
  sickLeaveBalance: number;
}

// Leave statistics
export interface LeaveStatistics {
  year: number;
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  cancelledRequests: number;
  totalAnnualDaysTaken: number;
  totalSickDaysTaken: number;
  totalOtherDaysTaken: number;
}

// Approver info
export interface ApproverInfo {
  approver: {
    id: string;
    nik: string;
    fullName: string;
    position?: { name: string };
  } | null;
  isDelegate: boolean;
  delegateReason?: string;
}