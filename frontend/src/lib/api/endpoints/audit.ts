import { apiClient } from '../client';
import { ApiResponse } from '@/lib/types/api';
import type {
  AuditLog,
  AuditLogListResponse,
  AuditQueryParams,
} from '@/lib/types/audit';

/**
 * Audit API Endpoints
 */

export const auditApi = {
  // Get audit logs with pagination and filters
  getLogs: async (
    params?: AuditQueryParams
  ): Promise<ApiResponse<AuditLog[]>> => {
    return apiClient.get('/audit/logs', params as Record<string, unknown>);
  },

  // Get single audit log by ID
  getLog: async (id: string): Promise<ApiResponse<AuditLog>> => {
    return apiClient.get(`/audit/logs/${id}`);
  },

  // Get audit logs for a specific record
  getRecordHistory: async (
    tableName: string,
    recordId: string,
    params?: Omit<AuditQueryParams, 'tableName' | 'recordId'>
  ): Promise<ApiResponse<AuditLog[]>> => {
    return apiClient.get(
      `/audit/logs/record/${tableName}/${recordId}`,
      params as Record<string, unknown>
    );
  },
};

// Helper function to transform API response to AuditLogListResponse
export function toAuditLogListResponse(
  response: ApiResponse<AuditLog[]>,
  params?: AuditQueryParams
): AuditLogListResponse {
  const data = response.data ?? [];
  return {
    data,
    meta: response.meta ?? {
      total: data.length,
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
      totalPages: 1,
    },
  };
}

// Get available modules for filter dropdown
export function getAuditModules(): string[] {
  return [
    'user-access',
    'hr',
    'inventory',
    'building',
    'mess',
    'audit',
  ];
}

// Get available actions for filter dropdown (must match backend AuditAction enum)
export function getAuditActions(): string[] {
  return [
    'CREATE',
    'UPDATE',
    'DELETE',
    'SOFT_DELETE',
    'RESTORE',
    'LOGIN',
    'LOGOUT',
    'EXPORT',
    'IMPORT',
  ];
}