import { apiClient } from '../client';
import type { ApiResponse } from '@/lib/types/api';
import type {
  Division,
  Department,
  Position,
  JobGrade,
  EmploymentStatus,
  WorkLocation,
  OrganizationNode,
  DepartmentHierarchy,
  CreateDivisionDto,
  UpdateDivisionDto,
  CreateDepartmentDto,
  UpdateDepartmentDto,
  CreatePositionDto,
  UpdatePositionDto,
  CreateJobGradeDto,
  UpdateJobGradeDto,
  CreateEmploymentStatusDto,
  UpdateEmploymentStatusDto,
  CreateWorkLocationDto,
  UpdateWorkLocationDto,
  HrQueryParams,
  DepartmentQueryParams,
  EmployeeSummary,
} from '@/lib/types/hr';

// Paginated response type for HR entities
interface HrPaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Divisions API
export const divisionsApi = {
  getAll: async (
    params?: HrQueryParams
  ): Promise<ApiResponse<HrPaginatedResponse<Division>>> => {
    return apiClient.get('/hr/divisions', params as Record<string, unknown>);
  },

  getById: async (id: string): Promise<ApiResponse<Division>> => {
    return apiClient.get(`/hr/divisions/${id}`);
  },

  create: async (data: CreateDivisionDto): Promise<ApiResponse<Division>> => {
    return apiClient.post('/hr/divisions', data);
  },

  update: async (
    id: string,
    data: UpdateDivisionDto
  ): Promise<ApiResponse<Division>> => {
    return apiClient.patch(`/hr/divisions/${id}`, data);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/hr/divisions/${id}`);
  },
};

// Departments API
export const departmentsApi = {
  getAll: async (
    params?: DepartmentQueryParams
  ): Promise<ApiResponse<HrPaginatedResponse<Department>>> => {
    return apiClient.get('/hr/departments', params as Record<string, unknown>);
  },

  getById: async (id: string): Promise<ApiResponse<Department>> => {
    return apiClient.get(`/hr/departments/${id}`);
  },

  getEmployees: async (
    id: string,
    params?: HrQueryParams
  ): Promise<ApiResponse<HrPaginatedResponse<EmployeeSummary>>> => {
    return apiClient.get(
      `/hr/departments/${id}/employees`,
      params as Record<string, unknown>
    );
  },

  create: async (
    data: CreateDepartmentDto
  ): Promise<ApiResponse<Department>> => {
    return apiClient.post('/hr/departments', data);
  },

  update: async (
    id: string,
    data: UpdateDepartmentDto
  ): Promise<ApiResponse<Department>> => {
    return apiClient.patch(`/hr/departments/${id}`, data);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/hr/departments/${id}`);
  },
};

// Positions API
export const positionsApi = {
  getAll: async (
    params?: HrQueryParams
  ): Promise<ApiResponse<HrPaginatedResponse<Position>>> => {
    return apiClient.get('/hr/positions', params as Record<string, unknown>);
  },

  getById: async (id: string): Promise<ApiResponse<Position>> => {
    return apiClient.get(`/hr/positions/${id}`);
  },

  create: async (data: CreatePositionDto): Promise<ApiResponse<Position>> => {
    return apiClient.post('/hr/positions', data);
  },

  update: async (
    id: string,
    data: UpdatePositionDto
  ): Promise<ApiResponse<Position>> => {
    return apiClient.patch(`/hr/positions/${id}`, data);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/hr/positions/${id}`);
  },
};

// Job Grades API
export const jobGradesApi = {
  getAll: async (
    params?: HrQueryParams
  ): Promise<ApiResponse<HrPaginatedResponse<JobGrade>>> => {
    return apiClient.get('/hr/job-grades', params as Record<string, unknown>);
  },

  getById: async (id: string): Promise<ApiResponse<JobGrade>> => {
    return apiClient.get(`/hr/job-grades/${id}`);
  },

  create: async (data: CreateJobGradeDto): Promise<ApiResponse<JobGrade>> => {
    return apiClient.post('/hr/job-grades', data);
  },

  update: async (
    id: string,
    data: UpdateJobGradeDto
  ): Promise<ApiResponse<JobGrade>> => {
    return apiClient.patch(`/hr/job-grades/${id}`, data);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/hr/job-grades/${id}`);
  },
};

// Employment Statuses API
export const employmentStatusesApi = {
  getAll: async (
    params?: HrQueryParams
  ): Promise<ApiResponse<HrPaginatedResponse<EmploymentStatus>>> => {
    return apiClient.get(
      '/hr/employment-statuses',
      params as Record<string, unknown>
    );
  },

  getById: async (id: string): Promise<ApiResponse<EmploymentStatus>> => {
    return apiClient.get(`/hr/employment-statuses/${id}`);
  },

  create: async (
    data: CreateEmploymentStatusDto
  ): Promise<ApiResponse<EmploymentStatus>> => {
    return apiClient.post('/hr/employment-statuses', data);
  },

  update: async (
    id: string,
    data: UpdateEmploymentStatusDto
  ): Promise<ApiResponse<EmploymentStatus>> => {
    return apiClient.patch(`/hr/employment-statuses/${id}`, data);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/hr/employment-statuses/${id}`);
  },
};

// Work Locations API
export const workLocationsApi = {
  getAll: async (
    params?: HrQueryParams
  ): Promise<ApiResponse<HrPaginatedResponse<WorkLocation>>> => {
    return apiClient.get(
      '/hr/work-locations',
      params as Record<string, unknown>
    );
  },

  getById: async (id: string): Promise<ApiResponse<WorkLocation>> => {
    return apiClient.get(`/hr/work-locations/${id}`);
  },

  create: async (
    data: CreateWorkLocationDto
  ): Promise<ApiResponse<WorkLocation>> => {
    return apiClient.post('/hr/work-locations', data);
  },

  update: async (
    id: string,
    data: UpdateWorkLocationDto
  ): Promise<ApiResponse<WorkLocation>> => {
    return apiClient.patch(`/hr/work-locations/${id}`, data);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/hr/work-locations/${id}`);
  },
};

// Organization API
export const organizationApi = {
  getTree: async (): Promise<ApiResponse<OrganizationNode[]>> => {
    return apiClient.get('/hr/organization/tree');
  },

  getSubtree: async (
    employeeId: string
  ): Promise<ApiResponse<OrganizationNode | null>> => {
    return apiClient.get(`/hr/organization/tree/${employeeId}`);
  },

  getDirectReports: async (
    employeeId: string
  ): Promise<ApiResponse<EmployeeSummary[]>> => {
    return apiClient.get(`/hr/organization/direct-reports/${employeeId}`);
  },

  getAllSubordinates: async (
    employeeId: string
  ): Promise<ApiResponse<EmployeeSummary[]>> => {
    return apiClient.get(`/hr/organization/subordinates/${employeeId}`);
  },

  getDepartmentHierarchy: async (): Promise<
    ApiResponse<DepartmentHierarchy[]>
  > => {
    return apiClient.get('/hr/organization/departments');
  },

  getAllEmployees: async (): Promise<ApiResponse<EmployeeSummary[]>> => {
    return apiClient.get('/hr/organization/employees');
  },
};

// Combined HR API export
export const hrApi = {
  divisions: divisionsApi,
  departments: departmentsApi,
  positions: positionsApi,
  jobGrades: jobGradesApi,
  employmentStatuses: employmentStatusesApi,
  workLocations: workLocationsApi,
  organization: organizationApi,
};