import { apiClient } from '../client';
import type { ApiResponse } from '@/lib/types/api';
import type {
  Attendance,
  AttendanceQueryParams,
  AttendanceStatistics,
  ClockInRequest,
  ClockOutRequest,
  TodayAttendance,
  UpdateAttendanceStatusRequest,
} from '@/lib/types/attendance';
import type { HrPaginatedResponse } from './hr';

export const attendanceApi = {
  /**
   * Clock in for current user
   */
  clockIn: async (data: ClockInRequest): Promise<ApiResponse<Attendance>> => {
    return apiClient.post('/hr/attendance/clock-in', data);
  },

  /**
   * Clock out for current user
   */
  clockOut: async (data: ClockOutRequest): Promise<ApiResponse<Attendance>> => {
    return apiClient.post('/hr/attendance/clock-out', data);
  },

  /**
   * Get today's attendance for current user
   */
  getTodayAttendance: async (): Promise<ApiResponse<TodayAttendance>> => {
    return apiClient.get('/hr/attendance/me/today');
  },

  /**
   * Get my attendance history
   */
  getMyAttendance: async (
    params?: AttendanceQueryParams
  ): Promise<ApiResponse<HrPaginatedResponse<Attendance>>> => {
    return apiClient.get('/hr/attendance/me', params as Record<string, unknown>);
  },

  /**
   * Get attendance by employee ID (for managers/HR)
   */
  getAttendanceByEmployee: async (
    employeeId: string,
    params?: AttendanceQueryParams
  ): Promise<ApiResponse<HrPaginatedResponse<Attendance>>> => {
    return apiClient.get(
      `/hr/attendance/employee/${employeeId}`,
      params as Record<string, unknown>
    );
  },

  /**
   * Get attendance statistics for current user
   */
  getMyStatistics: async (
    month: number,
    year: number
  ): Promise<ApiResponse<AttendanceStatistics>> => {
    return apiClient.get('/hr/attendance/statistics', { month, year });
  },

  /**
   * Get attendance statistics for a specific employee (manager/HR)
   */
  getEmployeeStatistics: async (
    employeeId: string,
    month: number,
    year: number
  ): Promise<ApiResponse<AttendanceStatistics>> => {
    return apiClient.get(`/hr/attendance/statistics/${employeeId}`, { month, year });
  },

  /**
   * Get all attendance records (for HR)
   */
  getAll: async (
    params?: AttendanceQueryParams
  ): Promise<ApiResponse<HrPaginatedResponse<Attendance>>> => {
    return apiClient.get('/hr/attendance', params as Record<string, unknown>);
  },

  /**
   * Update attendance status (for HR)
   */
  updateStatus: async (
    id: string,
    data: UpdateAttendanceStatusRequest
  ): Promise<ApiResponse<Attendance>> => {
    return apiClient.patch(`/hr/attendance/${id}/status`, data);
  },
};