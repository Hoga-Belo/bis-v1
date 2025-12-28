import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse } from '@/lib/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Flag to prevent multiple refresh requests
let isRefreshing = false;
// Queue of failed requests to retry after token refresh
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

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

// Response interceptor for error handling and token refresh
axiosInstance.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Handle 401 Unauthorized - attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Skip refresh for auth endpoints to prevent infinite loops
      if (originalRequest.url?.includes('/auth/refresh') || originalRequest.url?.includes('/auth/login')) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-storage');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // Get refresh token from localStorage
      if (typeof window !== 'undefined') {
        try {
          const authStorage = localStorage.getItem('auth-storage');
          if (authStorage) {
            const { state } = JSON.parse(authStorage);
            const refreshToken = state?.refreshToken;

            if (refreshToken) {
              // Call refresh endpoint
              const response = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
                `${API_BASE_URL}/auth/refresh`,
                { refreshToken },
                { headers: { 'Content-Type': 'application/json' } }
              );

              const tokens = response.data.data;
              if (!tokens) {
                throw new Error('Invalid refresh token response');
              }
              const { accessToken: newAccessToken, refreshToken: newRefreshToken } = tokens;

              // Update localStorage with new tokens
              const updatedState = {
                ...state,
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
              };
              localStorage.setItem('auth-storage', JSON.stringify({ state: updatedState }));

              // Update authorization header
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

              // Process queued requests
              processQueue(null, newAccessToken);
              isRefreshing = false;

              // Retry original request
              return axiosInstance(originalRequest);
            }
          }
        } catch (refreshError) {
          // Refresh failed - clear storage and redirect to login
          processQueue(new Error('Token refresh failed'), null);
          isRefreshing = false;
          localStorage.removeItem('auth-storage');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      // No refresh token available - redirect to login
      isRefreshing = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
      }
    }
    
    const message = error.response?.data?.message || error.message || 'An error occurred';
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