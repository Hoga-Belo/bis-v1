'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { PermissionGate } from '@/components/auth/permission-gate';
import { AttendanceTable, UpdateStatusDialog } from '@/components/hr/attendance';
import { attendanceApi } from '@/lib/api/endpoints/attendance';
import { hrApi } from '@/lib/api/endpoints/hr';
import { AttendanceStatus } from '@/lib/types/attendance';
import type { Attendance } from '@/lib/types/attendance';
import type { Department } from '@/lib/types/hr';
import { Users, Search, Filter, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function AllAttendancePage() {
  const router = useRouter();
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus | 'ALL'>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Update status dialog
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

  // Fetch departments for filter
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await hrApi.departments.getAll({ limit: 100 });
        if (response.data && 'data' in response.data) {
          setDepartments(response.data.data || []);
        }
      } catch (err) {
        console.error('Error fetching departments:', err);
      }
    };
    fetchDepartments();
  }, []);

  // Fetch attendance data
  const fetchAttendance = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: Record<string, unknown> = {
        page: currentPage,
        limit: 20,
      };

      if (search) params.search = search;
      if (selectedDepartment !== 'ALL') params.departmentId = selectedDepartment;
      if (selectedStatus !== 'ALL') params.status = selectedStatus;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await attendanceApi.getAll(params);

      if (response.data && 'data' in response.data) {
        setAttendanceRecords(response.data.data || []);
        setTotalPages(response.data.meta?.totalPages || 1);
      } else {
        setAttendanceRecords([]);
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setError('Gagal memuat data kehadiran');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, search, selectedDepartment, selectedStatus, startDate, endDate]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1);
    fetchAttendance();
  };

  // Handle status filter
  const handleStatusFilter = (status: AttendanceStatus | 'ALL') => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  // Handle date range change
  const handleDateRangeChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    setCurrentPage(1);
  };

  // Handle view details
  const handleViewDetails = (attendance: Attendance) => {
    if (attendance.employee?.id) {
      router.push(`/hr/attendance/employee/${attendance.employee.id}`);
    }
  };

  // Handle status updated
  const handleStatusUpdated = () => {
    setIsUpdateDialogOpen(false);
    setSelectedAttendance(null);
    fetchAttendance();
    toast.success('Status kehadiran berhasil diperbarui');
  };

  return (
    <PermissionGate permissions={['hr:attendance:read']}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manajemen Kehadiran</h1>
            <p className="text-muted-foreground">
              Kelola dan pantau kehadiran seluruh karyawan
            </p>
          </div>
        </div>

        {/* Filters Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground flex items-center gap-1">
                  <Search className="h-3 w-3" />
                  Cari Karyawan
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="NIK atau nama..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} variant="outline" size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Department Filter */}
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Departemen</label>
                <Select
                  value={selectedDepartment}
                  onValueChange={(value) => {
                    setSelectedDepartment(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Departemen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Semua Departemen</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Dari Tanggal
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => handleDateRangeChange(e.target.value, endDate)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Sampai Tanggal
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => handleDateRangeChange(startDate, e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Attendance Table */}
        <Card>
          <CardHeader>
            <CardTitle>Data Kehadiran</CardTitle>
            <CardDescription>
              Klik pada baris untuk melihat detail kehadiran karyawan
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Skeleton className="h-9 w-40" />
                  <Skeleton className="h-9 w-32" />
                </div>
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <AttendanceTable
                data={attendanceRecords}
                showEmployee={true}
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onStatusFilter={handleStatusFilter}
                selectedStatus={selectedStatus}
                onViewDetails={handleViewDetails}
              />
            )}
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