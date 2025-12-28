import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse } from '@/lib/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage (zustand persist)
    if (typeof window !== 'undefined') {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        try {
          const { state } = JSON.parse(authStorage);
          if (state?.accessToken) {
            config.headers.Authorization = `Bearer ${state.accessToken}`;
          }
        } catch (e) {
          console.error('Error parsing auth storage:', e);
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<ApiResponse<unknown>>) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Clear auth storage and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(new Error(message));
  }
);

export const apiClient = {
  get: <T>(url: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> =>
    axiosInstance.get(url, { params }),

  post: <T>(url: string, data?: unknown): Promise<ApiResponse<T>> =>
    axiosInstance.post(url, data),

  put: <T>(url: string, data?: unknown): Promise<ApiResponse<T>> =>
    axiosInstance.put(url, data),

  patch: <T>(url: string, data?: unknown): Promise<ApiResponse<T>> =>
    axiosInstance.patch(url, data),

  delete: <T>(url: string): Promise<ApiResponse<T>> =>
    axiosInstance.delete(url),
};

export default apiClient;