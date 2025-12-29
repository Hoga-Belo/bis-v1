// Attendance status enum matching backend
export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  LATE = 'LATE',
  ABSENT = 'ABSENT',
  LEAVE = 'LEAVE',
  SICK = 'SICK',
  PERMIT = 'PERMIT',
}

// Clock-in method enum matching backend
export enum ClockInMethod {
  QR = 'QR',
  MANUAL = 'MANUAL',
  LOCATION = 'LOCATION',
}

// Attendance record interface
export interface Attendance {
  id: string;
  employeeId: string;
  employee?: {
    id: string;
    nik: string;
    fullName: string;
    department?: { id: string; name: string };
    position?: { id: string; name: string };
  };
  date: string; // YYYY-MM-DD
  clockIn?: string; // HH:mm:ss
  clockOut?: string; // HH:mm:ss
  status: AttendanceStatus;
  workHours?: number;
  overtimeHours?: number;
  lateMinutes?: number;
  earlyLeaveMinutes?: number;
  clockInLocation?: { lat: number; lng: number };
  clockOutLocation?: { lat: number; lng: number };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Clock-in request
export interface ClockInRequest {
  method: ClockInMethod;
  location?: { lat: number; lng: number; address?: string };
  qrCode?: string;
}

// Clock-out request
export interface ClockOutRequest {
  location?: { lat: number; lng: number; address?: string };
}

// Attendance query params
export interface AttendanceQueryParams {
  page?: number;
  limit?: number;
  employeeId?: string;
  status?: AttendanceStatus;
  startDate?: string;
  endDate?: string;
}

// Update attendance status request
export interface UpdateAttendanceStatusRequest {
  status: AttendanceStatus;
  notes?: string;
}

// Attendance statistics
export interface AttendanceStatistics {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  leaveDays: number;
  sickDays: number;
  averageWorkHours: number;
  totalOvertimeHours: number;
}

// Today's attendance response
export interface TodayAttendance {
  attendance: Attendance | null;
  canClockIn: boolean;
  canClockOut: boolean;
}

// Attendance response DTO (mapped from backend entity)
export interface AttendanceResponseDto {
  id: string;
  employeeId: string;
  employee?: {
    id: string;
    nik: string;
    fullName: string;
    department?: { id: string; name: string };
    position?: { id: string; name: string };
  };
  date: string; // YYYY-MM-DD (mapped from attendanceDate)
  clockIn?: string; // ISO timestamp (mapped from clockInTime)
  clockOut?: string; // ISO timestamp (mapped from clockOutTime)
  clockInLocation?: { lat: number; lng: number; address?: string };
  clockOutLocation?: { lat: number; lng: number; address?: string };
  clockInMethod?: ClockInMethod;
  status: AttendanceStatus;
  workHours?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}