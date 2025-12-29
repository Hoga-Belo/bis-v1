export interface User {
  id: string;
  nik: string;
  employeeId: string | null;
  roles: string[];
  permissions: string[];
  isFirstLogin: boolean;
  lastLoginAt: string | null;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}