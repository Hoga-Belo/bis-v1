import { apiClient } from '../client';
import { ApiResponse } from '@/lib/types/api';
import {
  Role,
  RoleDetail,
  PermissionGroup,
  CreateRoleRequest,
  UpdateRoleRequest,
  AssignPermissionsRequest,
} from '@/lib/types/role';

// Re-export types for convenience
export type { Role, RoleDetail, PermissionGroup };

export const rolesApi = {
  // Get all roles
  getRoles: async (): Promise<ApiResponse<Role[]>> => {
    return apiClient.get('/roles');
  },

  // Get role by ID with permissions
  getRole: async (id: string): Promise<ApiResponse<RoleDetail>> => {
    return apiClient.get(`/roles/${id}`);
  },

  // Get all permissions grouped by module
  getPermissions: async (): Promise<ApiResponse<PermissionGroup[]>> => {
    return apiClient.get('/roles/permissions');
  },

  // Create new role
  createRole: async (data: CreateRoleRequest): Promise<ApiResponse<Role>> => {
    return apiClient.post('/roles', data);
  },

  // Update role
  updateRole: async (
    id: string,
    data: UpdateRoleRequest
  ): Promise<ApiResponse<Role>> => {
    return apiClient.patch(`/roles/${id}`, data);
  },

  // Delete role
  deleteRole: async (id: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/roles/${id}`);
  },

  // Assign permissions to role
  assignPermissions: async (
    id: string,
    data: AssignPermissionsRequest
  ): Promise<ApiResponse<RoleDetail>> => {
    return apiClient.post(`/roles/${id}/permissions`, data);
  },
};