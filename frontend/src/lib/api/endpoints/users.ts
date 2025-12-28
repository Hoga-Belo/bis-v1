import { apiClient } from '../client';
import { ApiResponse } from '@/lib/types/api';
import {
  UserListItem,
  UserDetail,
  CreateUserRequest,
  UpdateUserRequest,
  AssignRolesRequest,
  UserQueryParams,
  PaginatedResponse,
} from '@/lib/types/user';

export const usersApi = {
  getUsers: async (
    params?: UserQueryParams
  ): Promise<ApiResponse<PaginatedResponse<UserListItem>>> => {
    return apiClient.get('/users', params as Record<string, unknown>);
  },

  getUser: async (id: string): Promise<ApiResponse<UserDetail>> => {
    return apiClient.get(`/users/${id}`);
  },

  createUser: async (
    data: CreateUserRequest
  ): Promise<ApiResponse<UserListItem & { defaultPassword: string }>> => {
    return apiClient.post('/users', data);
  },

  updateUser: async (
    id: string,
    data: UpdateUserRequest
  ): Promise<ApiResponse<UserDetail>> => {
    return apiClient.patch(`/users/${id}`, data);
  },

  assignRoles: async (
    id: string,
    data: AssignRolesRequest
  ): Promise<ApiResponse<UserDetail>> => {
    return apiClient.post(`/users/${id}/assign-roles`, data);
  },

  resetPassword: async (
    id: string
  ): Promise<ApiResponse<{ message: string; defaultPassword: string }>> => {
    return apiClient.post(`/users/${id}/reset-password`);
  },

  deactivateUser: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.delete(`/users/${id}`);
  },
};