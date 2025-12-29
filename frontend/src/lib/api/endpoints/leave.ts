import { apiClient } from '../client';
import type { ApiResponse } from '@/lib/types/api';
import type {
  LeaveRequest,
  LeaveRequestQueryParams,
  CreateLeaveRequest,
  ApproveLeaveRequest,
  RejectLeaveRequest,
  LeaveBalance,
  LeaveStatistics,
} from '@/lib/types/leave';
import type { HrPaginatedResponse } from './hr';

// Pending approvals response type
export interface PendingApprovalsResponse {
  data: LeaveRequest[];
  meta: {
    total: number;
  };
}

export const leaveApi = {
  /**
   * Submit a new leave request
   */
  submit: async (data: CreateLeaveRequest): Promise<ApiResponse<LeaveRequest>> => {
    return apiClient.post('/hr/leave-requests', data);
  },

  /**
   * Get my leave requests
   */
  getMyRequests: async (
    params?: LeaveRequestQueryParams
  ): Promise<ApiResponse<HrPaginatedResponse<LeaveRequest>>> => {
    return apiClient.get('/hr/leave-requests/me', params as Record<string, unknown>);
  },

  /**
   * Get pending approvals (for managers)
   */
  getPendingApprovals: async (): Promise<ApiResponse<PendingApprovalsResponse>> => {
    return apiClient.get('/hr/leave-requests/pending-approvals');
  },

  /**
   * Get my leave balance
   */
  getBalance: async (): Promise<ApiResponse<LeaveBalance>> => {
    return apiClient.get('/hr/leave-requests/balance');
  },

  /**
   * Get my leave statistics
   */
  getStatistics: async (year?: number): Promise<ApiResponse<LeaveStatistics>> => {
    return apiClient.get('/hr/leave-requests/statistics', year ? { year } : undefined);
  },

  /**
   * Get leave request by ID
   */
  getById: async (id: string): Promise<ApiResponse<LeaveRequest>> => {
    return apiClient.get(`/hr/leave-requests/${id}`);
  },

  /**
   * Approve leave request
   */
  approve: async (
    id: string,
    data?: ApproveLeaveRequest
  ): Promise<ApiResponse<LeaveRequest>> => {
    return apiClient.post(`/hr/leave-requests/${id}/approve`, data || {});
  },

  /**
   * Reject leave request
   */
  reject: async (
    id: string,
    data: RejectLeaveRequest
  ): Promise<ApiResponse<LeaveRequest>> => {
    return apiClient.post(`/hr/leave-requests/${id}/reject`, data);
  },

  /**
   * Cancel leave request
   */
  cancel: async (id: string): Promise<ApiResponse<LeaveRequest>> => {
    return apiClient.delete(`/hr/leave-requests/${id}`);
  },
};