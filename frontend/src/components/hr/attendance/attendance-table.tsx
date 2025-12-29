'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import type { Attendance, AttendanceStatus } from '@/lib/types/attendance';
import { Eye, ChevronLeft, ChevronRight, Calendar, Filter } from 'lucide-react';

interface AttendanceTableProps {
  data: Attendance[];
  isLoading?: boolean;
  showEmployee?: boolean;
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onStatusFilter?: (status: AttendanceStatus | 'ALL') => void;
  onDateRangeChange?: (startDate: string, endDate: string) => void;
  onViewDetails?: (attendance: Attendance) => void;
  selectedStatus?: AttendanceStatus | 'ALL';
  startDate?: string;
  endDate?: string;
}

// Status badge configuration
const statusConfig: Record<AttendanceStatus, { label: string; className: string }> = {
  PRESENT: { label: 'Hadir', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  LATE: { label: 'Terlambat', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  ABSENT: { label: 'Tidak Hadir', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  LEAVE: { label: 'Cuti', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  SICK: { label: 'Sakit', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
  PERMIT: { label: 'Izin', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
  HOLIDAY: { label: 'Libur', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' },
  WEEKEND: { label: 'Akhir Pekan', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' },
};

export function AttendanceTable({
  data,
  isLoading = false,
  showEmployee = false,
  totalPages = 1,
  currentPage = 1,
  onPageChange,
  onStatusFilter,
  onDateRangeChange,
  onViewDetails,
  selectedStatus = 'ALL',
  startDate = '',
  endDate = '',
}: AttendanceTableProps) {
  const [localStartDate, setLocalStartDate] = useState(startDate);
  const [localEndDate, setLocalEndDate] = useState(endDate);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format time for display
  const formatTime = (timeString?: string) => {
    if (!timeString) return '-';
    return timeString;
  };

  // Format work hours
  const formatWorkHours = (hours?: number) => {
    if (hours === undefined || hours === null) return '-';
    return `${hours.toFixed(2)} jam`;
  };

  // Format late minutes
  const formatLateMinutes = (minutes?: number) => {
    if (!minutes || minutes === 0) return '-';
    if (minutes < 60) return `${minutes} menit`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} jam ${mins} menit`;
  };

  // Handle date range apply
  const handleDateRangeApply = () => {
    if (onDateRangeChange) {
      onDateRangeChange(localStartDate, localEndDate);
    }
  };

  // Render loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-20" />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                {showEmployee && <TableHead><Skeleton className="h-4 w-24" /></TableHead>}
                <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                <TableHead><Skeleton className="h-4 w-16" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  {showEmployee && <TableCell><Skeleton className="h-4 w-32" /></TableCell>}
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end">
        {/* Status Filter */}
        {onStatusFilter && (
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground flex items-center gap-1">
              <Filter className="h-3 w-3" />
              Status
            </label>
            <Select
              value={selectedStatus}
              onValueChange={(value) => onStatusFilter(value as AttendanceStatus | 'ALL')}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Status</SelectItem>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Date Range Filter */}
        {onDateRangeChange && (
          <>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Dari Tanggal
              </label>
              <Input
                type="date"
                value={localStartDate}
                onChange={(e) => setLocalStartDate(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Sampai Tanggal
              </label>
              <Input
                type="date"
                value={localEndDate}
                onChange={(e) => setLocalEndDate(e.target.value)}
                className="w-40"
              />
            </div>
            <Button onClick={handleDateRangeApply} variant="outline" size="sm">
              Terapkan
            </Button>
          </>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              {showEmployee && <TableHead>Karyawan</TableHead>}
              <TableHead>Clock In</TableHead>
              <TableHead>Clock Out</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Jam Kerja</TableHead>
              <TableHead>Terlambat</TableHead>
              <TableHead>Catatan</TableHead>
              <TableHead className="w-[50px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={showEmployee ? 9 : 8}
                  className="text-center py-8 text-muted-foreground"
                >
                  Tidak ada data kehadiran
                </TableCell>
              </TableRow>
            ) : (
              data.map((attendance) => (
                <TableRow key={attendance.id}>
                  <TableCell className="font-medium">
                    {formatDate(attendance.date)}
                  </TableCell>
                  {showEmployee && (
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {attendance.employee?.fullName || '-'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {attendance.employee?.nik || '-'}
                        </div>
                      </div>
                    </TableCell>
                  )}
                  <TableCell>{formatTime(attendance.clockIn)}</TableCell>
                  <TableCell>{formatTime(attendance.clockOut)}</TableCell>
                  <TableCell>
                    <Badge className={statusConfig[attendance.status]?.className || ''}>
                      {statusConfig[attendance.status]?.label || attendance.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatWorkHours(attendance.workHours)}</TableCell>
                  <TableCell>
                    {attendance.lateMinutes && attendance.lateMinutes > 0 ? (
                      <span className="text-yellow-600">
                        {formatLateMinutes(attendance.lateMinutes)}
                      </span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {attendance.notes || '-'}
                  </TableCell>
                  <TableCell>
                    {onViewDetails && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onViewDetails(attendance)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Halaman {currentPage} dari {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Selanjutnya
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}