import { apiClient } from '../client';
import axios from 'axios';
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
  Employee,
  EmployeeFamily,
  EmployeeEducation,
  EmployeeDocument,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  EmployeeQueryParams,
  CreateEmployeeFamilyDto,
  UpdateEmployeeFamilyDto,
  CreateEmployeeEducationDto,
  UpdateEmployeeEducationDto,
  DocumentType,
  EmployeeStatistics,
  ContractExpiringEmployee,
  ImportResult,
} from '@/lib/types/hr';

// Paginated response type for HR entities
export interface HrPaginatedResponse<T> {
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

// Employees API
export const employeesApi = {
  getAll: async (
    params?: EmployeeQueryParams
  ): Promise<ApiResponse<HrPaginatedResponse<Employee>>> => {
    return apiClient.get('/hr/employees', params as Record<string, unknown>);
  },

  getById: async (id: string): Promise<ApiResponse<Employee>> => {
    return apiClient.get(`/hr/employees/${id}`);
  },

  create: async (data: CreateEmployeeDto): Promise<ApiResponse<Employee>> => {
    return apiClient.post('/hr/employees', data);
  },

  update: async (
    id: string,
    data: UpdateEmployeeDto
  ): Promise<ApiResponse<Employee>> => {
    return apiClient.patch(`/hr/employees/${id}`, data);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/hr/employees/${id}`);
  },

  uploadPhoto: async (
    id: string,
    file: File
  ): Promise<ApiResponse<{ photoUrl: string }>> => {
    const formData = new FormData();
    formData.append('photo', file);
    return apiClient.upload(`/hr/employees/${id}/photo`, formData);
  },

  // Family members
  getFamilies: async (
    employeeId: string
  ): Promise<ApiResponse<EmployeeFamily[]>> => {
    return apiClient.get(`/hr/employees/${employeeId}/families`);
  },

  addFamily: async (
    employeeId: string,
    data: CreateEmployeeFamilyDto
  ): Promise<ApiResponse<EmployeeFamily>> => {
    return apiClient.post(`/hr/employees/${employeeId}/families`, data);
  },

  updateFamily: async (
    employeeId: string,
    familyId: string,
    data: UpdateEmployeeFamilyDto
  ): Promise<ApiResponse<EmployeeFamily>> => {
    return apiClient.patch(
      `/hr/employees/${employeeId}/families/${familyId}`,
      data
    );
  },

  deleteFamily: async (
    employeeId: string,
    familyId: string
  ): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/hr/employees/${employeeId}/families/${familyId}`);
  },

  // Education records
  getEducations: async (
    employeeId: string
  ): Promise<ApiResponse<EmployeeEducation[]>> => {
    return apiClient.get(`/hr/employees/${employeeId}/educations`);
  },

  addEducation: async (
    employeeId: string,
    data: CreateEmployeeEducationDto
  ): Promise<ApiResponse<EmployeeEducation>> => {
    return apiClient.post(`/hr/employees/${employeeId}/educations`, data);
  },

  updateEducation: async (
    employeeId: string,
    educationId: string,
    data: UpdateEmployeeEducationDto
  ): Promise<ApiResponse<EmployeeEducation>> => {
    return apiClient.patch(
      `/hr/employees/${employeeId}/educations/${educationId}`,
      data
    );
  },

  deleteEducation: async (
    employeeId: string,
    educationId: string
  ): Promise<ApiResponse<void>> => {
    return apiClient.delete(
      `/hr/employees/${employeeId}/educations/${educationId}`
    );
  },

  // Documents
  getDocuments: async (
    employeeId: string
  ): Promise<ApiResponse<EmployeeDocument[]>> => {
    return apiClient.get(`/hr/employees/${employeeId}/documents`);
  },

  uploadDocument: async (
    employeeId: string,
    file: File,
    documentType: DocumentType,
    documentName: string
  ): Promise<ApiResponse<EmployeeDocument>> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    formData.append('documentName', documentName);
    return apiClient.upload(`/hr/employees/${employeeId}/documents`, formData);
  },

  deleteDocument: async (
    employeeId: string,
    documentId: string
  ): Promise<ApiResponse<void>> => {
    return apiClient.delete(
      `/hr/employees/${employeeId}/documents/${documentId}`
    );
  },

  // Contract expiration
  getExpiringContracts: async (
    days: number = 30
  ): Promise<ApiResponse<ContractExpiringEmployee[]>> => {
    return apiClient.get('/hr/employees/contracts/expiring', { days });
  },

  // Statistics for dashboard
  getStatistics: async (): Promise<ApiResponse<EmployeeStatistics>> => {
    return apiClient.get('/hr/employees/statistics');
  },

  // Excel Import
  downloadTemplate: async (): Promise<Blob> => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    
    const response = await axios.get(`${baseUrl}/hr/employees/import/template`, {
      responseType: 'blob',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },

  importFromExcel: async (
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ImportResult> => {
    const formData = new FormData();
    formData.append('file', file);

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    const response = await axios.post(`${baseUrl}/hr/employees/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        }
      },
    });
    // Extract data from ApiResponse wrapper
    return response.data?.data ?? response.data;
  },

  downloadErrorReport: async (filename: string): Promise<Blob> => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    const response = await axios.get(`${baseUrl}/hr/employees/import/errors/${filename}`, {
      responseType: 'blob',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
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
  employees: employeesApi,
};