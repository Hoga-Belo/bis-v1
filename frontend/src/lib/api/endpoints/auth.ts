import { apiClient } from '../client';
import { ApiResponse } from '@/lib/types/api';
import { LoginResponse, User } from '@/lib/types/auth';

interface LoginRequest {
  nik: string;
  password: string;
}

interface ChangePasswordRequest {
  oldPassword?: string;
  newPassword: string;
  confirmPassword: string;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    return apiClient.post('/auth/login', data);
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    return apiClient.get('/auth/me');
  },

  changePassword: async (data: ChangePasswordRequest): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.post('/auth/change-password', data);
  },

  refresh: async (refreshToken: string): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> => {
    return apiClient.post('/auth/refresh', { refreshToken });
  },

  logout: async (refreshToken: string): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.post('/auth/logout', { refreshToken });
  },
};