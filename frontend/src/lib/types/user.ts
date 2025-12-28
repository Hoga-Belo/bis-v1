export interface UserRole {
  id: string;
  code: string;
  name: string;
}

export interface UserListItem {
  id: string;
  nik: string;
  employeeId: string | null;
  employeeName: string | null;
  isActive: boolean;
  isFirstLogin: boolean;
  lastLoginAt: string | null;
  roles: UserRole[];
  createdAt: string;
  updatedAt: string;
}

export interface UserDetail extends UserListItem {
  permissions: string[];
}

export interface CreateUserRequest {
  nik: string;
  employeeId?: string;
  roleIds: string[];
}

export interface UpdateUserRequest {
  isActive?: boolean;
  roleIds?: string[];
}

export interface AssignRolesRequest {
  roleIds: string[];
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: string;
  isActive?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}