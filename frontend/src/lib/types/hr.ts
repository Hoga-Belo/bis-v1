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

// Employee-related enums and types
export type Gender = 'L' | 'P';
export type MaritalStatus = 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
export type EmployeeStatusType = 'ACTIVE' | 'ON_LEAVE' | 'RESIGNED' | 'TERMINATED';
export type DocumentType = 'KTP' | 'KK' | 'IJAZAH' | 'SERTIFIKAT' | 'KONTRAK' | 'SK' | 'OTHER';

// Master data types for dropdowns
export interface BloodType {
  id: string;
  name: string;
}

export interface Religion {
  id: string;
  name: string;
}

export interface City {
  id: string;
  name: string;
  province?: Province;
}

export interface Province {
  id: string;
  name: string;
}

export interface EducationLevel {
  id: string;
  name: string;
  level: number;
}

export interface RelationshipType {
  id: string;
  name: string;
}

// Employee interfaces
export interface Employee {
  id: string;
  nik: string;
  fullName: string;
  nickname?: string;
  idCardNumber: string;
  birthPlace: string;
  birthDate: string;
  gender: Gender;
  bloodType?: BloodType;
  religion?: Religion;
  maritalStatus: MaritalStatus;
  phoneNumber?: string;
  email?: string;
  photoUrl?: string;
  address?: string;
  city?: City;
  postalCode?: string;
  currentAddress?: string;
  currentCity?: City;
  division?: Division;
  department?: Department;
  position?: Position;
  jobGrade?: JobGrade;
  employmentStatus?: EmploymentStatus;
  workLocation?: WorkLocation;
  manager?: EmployeeSummary;
  joinDate?: string;
  permanentDate?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  resignDate?: string;
  resignReason?: string;
  employeeStatus: EmployeeStatusType;
  basicSalary?: number | null;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankAccountHolder?: string | null;
  taxNumber?: string | null;
  bpjsKesehatan?: string | null;
  bpjsKetenagakerjaan?: string | null;
  annualLeaveBalance: number;
  sickLeaveBalance: number;
  families?: EmployeeFamily[];
  educations?: EmployeeEducation[];
  documents?: EmployeeDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeFamily {
  id: string;
  relationshipType: RelationshipType;
  fullName: string;
  birthDate?: string;
  gender?: Gender;
  educationLevel?: EducationLevel;
  occupation?: string;
  isEmergencyContact: boolean;
  phoneNumber?: string;
}

export interface EmployeeEducation {
  id: string;
  educationLevel: EducationLevel;
  institutionName: string;
  major?: string;
  startYear: number;
  endYear?: number;
  gpa?: number;
  certificateNumber?: string;
  certificateUrl?: string;
}

export interface EmployeeDocument {
  id: string;
  documentType: DocumentType;
  documentName: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
}

// Employee DTOs
export interface CreateEmployeeDto {
  nik: string;
  fullName: string;
  nickname?: string;
  idCardNumber: string;
  birthPlace: string;
  birthDate: string;
  gender: Gender;
  bloodTypeId?: string;
  religionId?: string;
  maritalStatus: MaritalStatus;
  phoneNumber?: string;
  email?: string;
  address?: string;
  cityId?: string;
  postalCode?: string;
  currentAddress?: string;
  currentCityId?: string;
  divisionId: string;
  departmentId: string;
  positionId: string;
  jobGradeId?: string;
  employmentStatusId: string;
  workLocationId?: string;
  managerId?: string;
  joinDate: string;
  permanentDate?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  basicSalary?: number;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;
  taxNumber?: string;
  bpjsKesehatan?: string;
  bpjsKetenagakerjaan?: string;
}

export interface UpdateEmployeeDto extends Partial<CreateEmployeeDto> {
  employeeStatus?: EmployeeStatusType;
  resignDate?: string;
  resignReason?: string;
}

export interface EmployeeQueryParams extends HrQueryParams {
  departmentId?: string;
  divisionId?: string;
  positionId?: string;
  employeeStatus?: EmployeeStatusType;
  gender?: Gender;
  sortBy?: 'fullName' | 'nik' | 'joinDate';
  sortOrder?: 'ASC' | 'DESC';
}

// Employee Family DTOs
export interface CreateEmployeeFamilyDto {
  relationshipTypeId: string;
  fullName: string;
  birthDate?: string;
  gender?: Gender;
  educationLevelId?: string;
  occupation?: string;
  isEmergencyContact?: boolean;
  phoneNumber?: string;
}

export type UpdateEmployeeFamilyDto = Partial<CreateEmployeeFamilyDto>;

// Employee Education DTOs
export interface CreateEmployeeEducationDto {
  educationLevelId: string;
  institutionName: string;
  major?: string;
  startYear: number;
  endYear?: number;
  gpa?: number;
  certificateNumber?: string;
}

export type UpdateEmployeeEducationDto = Partial<CreateEmployeeEducationDto>;

// Employee Statistics for Dashboard
export interface EmployeeStatistics {
  totalActive: number;
  newHiresThisMonth: number;
  onLeave: number;
  contractsExpiringSoon: number;
}

// Contract Expiring Employee for alerts
export interface ContractExpiringEmployee {
  id: string;
  nik: string;
  fullName: string;
  contractEndDate: string;
  division: { id: string; name: string } | null;
  department: { id: string; name: string } | null;
  position: { id: string; name: string } | null;
}

// Excel Import types
export interface ImportError {
  rowNumber: number;
  nik: string;
  field: string;
  message: string;
  originalValue?: string;
}

export interface ImportResult {
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: ImportError[];
  errorReportPath?: string;
}