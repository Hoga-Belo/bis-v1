'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { PermissionGate } from '@/components/auth/permission-gate';
import { usePermissions } from '@/lib/hooks/use-permissions';
import {
  AttendanceTable,
  AttendanceCalendar,
  AttendanceStatsCard,
  UpdateStatusDialog,
} from '@/components/hr/attendance';
import { attendanceApi } from '@/lib/api/endpoints/attendance';
import { hrApi } from '@/lib/api/endpoints/hr';
import type { Attendance, AttendanceStatistics, AttendanceStatus } from '@/lib/types/attendance';
import type { Employee } from '@/lib/types/hr';
import { ArrowLeft, User, Building2, Briefcase, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function EmployeeAttendancePage() {
  const params = useParams();
  const { canAny } = usePermissions();
  const employeeId = params.id as string;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [statistics, setStatistics] = useState<AttendanceStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Date range
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Update status dialog
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

  // Check if user can update attendance
  const canUpdateAttendance = canAny(['hr:attendance:update']);

  // Fetch employee data
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await hrApi.employees.getById(employeeId);
        if (response.data) {
          setEmployee(response.data);
        }
      } catch (err) {
        console.error('Error fetching employee:', err);
        setError('Gagal memuat data karyawan');
      }
    };
    fetchEmployee();
  }, [employeeId]);

  // Fetch attendance data
  const fetchAttendance = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Get current month's date range
      const startDate = new Date(currentYear, currentMonth, 1);
      const endDate = new Date(currentYear, currentMonth + 1, 0);

      const [attendanceResponse, statsResponse] = await Promise.all([
        attendanceApi.getAttendanceByEmployee(employeeId, {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          page: currentPage,
          limit: 31, // Max days in a month
        }),
        attendanceApi.getEmployeeStatistics(employeeId, currentMonth + 1, currentYear),
      ]);

      // Extract data from paginated response
      if (attendanceResponse.data && 'data' in attendanceResponse.data) {
        setAttendanceRecords(attendanceResponse.data.data || []);
        setTotalPages(attendanceResponse.data.meta?.totalPages || 1);
      } else {
        setAttendanceRecords([]);
      }

      // Extract statistics from response
      if (statsResponse.data) {
        setStatistics(statsResponse.data);
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setError('Gagal memuat data kehadiran');
    } finally {
      setIsLoading(false);
    }
  }, [employeeId, currentMonth, currentYear, currentPage]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // Handle month change
  const handleMonthChange = (month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
    setCurrentPage(1);
  };

  // Handle view details (open update dialog)
  const handleViewDetails = (attendance: Attendance) => {
    if (canUpdateAttendance) {
      setSelectedAttendance(attendance);
      setIsUpdateDialogOpen(true);
    }
  };

  // Handle status updated
  const handleStatusUpdated = () => {
    setIsUpdateDialogOpen(false);
    setSelectedAttendance(null);
    fetchAttendance();
    toast.success('Status kehadiran berhasil diperbarui');
  };

  // Handle status filter
  const handleStatusFilter = (status: AttendanceStatus | 'ALL') => {
    // For now, we'll filter client-side since we're fetching all records for the month
    // In a real app, you might want to add this to the API call
    console.log('Status filter:', status);
  };

  return (
    <PermissionGate permissions={['hr:attendance:read']}>
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" asChild className="gap-2">
          <Link href="/hr/attendance/all">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Daftar
          </Link>
        </Button>

        {/* Page Header */}
        <div className="flex items-center gap-3">
          <User className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {employee ? `Kehadiran ${employee.fullName}` : 'Kehadiran Karyawan'}
            </h1>
            <p className="text-muted-foreground">
              Lihat dan kelola riwayat kehadiran karyawan
            </p>
          </div>
        </div>

        {/* Employee Info Card */}
        {isLoading && !employee ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : employee ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Avatar */}
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>

                {/* Employee Details */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Nama Lengkap</div>
                    <div className="font-medium">{employee.fullName}</div>
                    <div className="text-sm text-muted-foreground">{employee.nik}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Departemen</div>
                      <div className="font-medium">{employee.department?.name || '-'}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Jabatan</div>
                      <div className="font-medium">{employee.position?.name || '-'}</div>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <Badge variant={employee.employeeStatus === 'ACTIVE' ? 'default' : 'secondary'}>
                  {employee.employeeStatus === 'ACTIVE' ? 'Aktif' : employee.employeeStatus === 'ON_LEAVE' ? 'Cuti' : employee.employeeStatus === 'RESIGNED' ? 'Resign' : 'Diberhentikan'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Error Message */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Statistics */}
        {isLoading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : statistics ? (
          <AttendanceStatsCard statistics={statistics} />
        ) : null}

        {/* Tabs for History and Calendar */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Riwayat Kehadiran
                </CardTitle>
                <CardDescription>
                  Lihat riwayat kehadiran dalam bentuk tabel atau kalender
                </CardDescription>
              </div>
              {canUpdateAttendance && (
                <Badge variant="outline" className="text-xs">
                  Klik pada baris untuk mengubah status
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="history" className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="history">Riwayat</TabsTrigger>
                <TabsTrigger value="calendar">Kalender</TabsTrigger>
              </TabsList>

              <TabsContent value="history" className="mt-6">
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <AttendanceTable
                    data={attendanceRecords}
                    showEmployee={false}
                    totalPages={totalPages}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    onStatusFilter={handleStatusFilter}
                    onViewDetails={canUpdateAttendance ? handleViewDetails : undefined}
                  />
                )}
              </TabsContent>

              <TabsContent value="calendar" className="mt-6">
                <AttendanceCalendar
                  data={attendanceRecords}
                  month={currentMonth}
                  year={currentYear}
                  onMonthChange={handleMonthChange}
                  onDayClick={canUpdateAttendance ? (date, attendance) => {
                    if (attendance) {
                      handleViewDetails(attendance);
                    }
                  } : undefined}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Update Status Dialog */}
        {selectedAttendance && (
          <UpdateStatusDialog
            attendance={selectedAttendance}
            open={isUpdateDialogOpen}
            onOpenChange={setIsUpdateDialogOpen}
            onSuccess={handleStatusUpdated}
          />
        )}
      </div>
    </PermissionGate>
  );
}