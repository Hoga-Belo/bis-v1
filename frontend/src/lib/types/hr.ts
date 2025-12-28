// Base interfaces for HR entities

export interface Division {
  id: string;
  code: string;
  name: string;
  description?: string;
  departmentCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  divisionId: string;
  code: string;
  name: string;
  managerId?: string;
  description?: string;
  division?: Division;
  manager?: EmployeeSummary;
  employeeCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Position {
  id: string;
  code: string;
  name: string;
  level: number;
  description?: string;
  employeeCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface JobGrade {
  id: string;
  code: string;
  name: string;
  minSalary: number;
  maxSalary: number;
  description?: string;
  employeeCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface EmploymentStatus {
  id: string;
  code: string;
  name: string;
  description?: string;
  employeeCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkLocation {
  id: string;
  code: string;
  name: string;
  address?: string;
  cityId?: string;
  city?: {
    id: string;
    name: string;
    province?: {
      id: string;
      name: string;
    };
  };
  employeeCount?: number;
  createdAt: string;
  updatedAt: string;
}

// Employee summary for references
export interface EmployeeSummary {
  id: string;
  nik: string;
  fullName: string;
  nickname?: string;
  photoUrl?: string;
}

// Organization tree node
export interface OrganizationNode {
  id: string;
  nik: string;
  name: string;
  position: {
    id: string;
    name: string;
    level: number;
  } | null;
  department: {
    id: string;
    name: string;
  } | null;
  division: {
    id: string;
    name: string;
  } | null;
  photoUrl: string | null;
  childrenCount: number;
  children: OrganizationNode[];
}

// Department hierarchy
export interface DepartmentHierarchy {
  division: {
    id: string;
    code: string;
    name: string;
  };
  departments: {
    id: string;
    code: string;
    name: string;
    manager: {
      id: string;
      nik: string;
      name: string;
    } | null;
    employeeCount: number;
  }[];
}

// DTOs for create/update operations
export interface CreateDivisionDto {
  code: string;
  name: string;
  description?: string;
}

export interface UpdateDivisionDto {
  code?: string;
  name?: string;
  description?: string;
}

export interface CreateDepartmentDto {
  divisionId: string;
  code: string;
  name: string;
  managerId?: string;
  description?: string;
}

export interface UpdateDepartmentDto {
  divisionId?: string;
  code?: string;
  name?: string;
  managerId?: string;
  description?: string;
}

export interface CreatePositionDto {
  code: string;
  name: string;
  level: number;
  description?: string;
}

export interface UpdatePositionDto {
  code?: string;
  name?: string;
  level?: number;
  description?: string;
}

export interface CreateJobGradeDto {
  code: string;
  name: string;
  minSalary: number;
  maxSalary: number;
  description?: string;
}

export interface UpdateJobGradeDto {
  code?: string;
  name?: string;
  minSalary?: number;
  maxSalary?: number;
  description?: string;
}

export interface CreateEmploymentStatusDto {
  code: string;
  name: string;
  description?: string;
}

export interface UpdateEmploymentStatusDto {
  code?: string;
  name?: string;
  description?: string;
}

export interface CreateWorkLocationDto {
  code: string;
  name: string;
  address?: string;
  cityId?: string;
}

export interface UpdateWorkLocationDto {
  code?: string;
  name?: string;
  address?: string;
  cityId?: string;
}

// Query params
export interface HrQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface DepartmentQueryParams extends HrQueryParams {
  divisionId?: string;
}