import apiClient from '../client';
import { ApiResponse } from '@/lib/types/api';
import { LoginRequest, LoginResponse, User } from '@/lib/types/auth';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data;
  },

  logout: async (): Promise<void> => {
    // Clear local storage/cookies - no API call needed for JWT
    return Promise.resolve();
  },
};