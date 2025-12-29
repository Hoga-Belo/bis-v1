'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { leaveApi } from '@/lib/api/endpoints/leave';
import { LeaveType, LeaveStatus, type LeaveRequest } from '@/lib/types/leave';
import { Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { LEAVE_TYPE_LABELS } from './leave-request-form';

// Status labels in Indonesian
export const LEAVE_STATUS_LABELS: Record<LeaveStatus, string> = {
  [LeaveStatus.PENDING]: 'Menunggu',
  [LeaveStatus.APPROVED]: 'Disetujui',
  [LeaveStatus.REJECTED]: 'Ditolak',
  [LeaveStatus.CANCELLED]: 'Dibatalkan',
};

// Status badge variants
const STATUS_VARIANTS: Record<LeaveStatus, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'> = {
  [LeaveStatus.PENDING]: 'warning',
  [LeaveStatus.APPROVED]: 'success',
  [LeaveStatus.REJECTED]: 'destructive',
  [LeaveStatus.CANCELLED]: 'secondary',
};

// Leave type colors
const LEAVE_TYPE_COLORS: Record<LeaveType, string> = {
  [LeaveType.ANNUAL]: 'bg-blue-100 text-blue-800',
  [LeaveType.SICK]: 'bg-purple-100 text-purple-800',
  [LeaveType.MATERNITY]: 'bg-pink-100 text-pink-800',
  [LeaveType.PATERNITY]: 'bg-cyan-100 text-cyan-800',
  [LeaveType.MARRIAGE]: 'bg-rose-100 text-rose-800',
  [LeaveType.BEREAVEMENT]: 'bg-slate-100 text-slate-800',
  [LeaveType.UNPAID]: 'bg-orange-100 text-orange-800',
  [LeaveType.OTHER]: 'bg-gray-100 text-gray-800',
  [LeaveType.PERMIT]: 'bg-teal-100 text-teal-800',
};

interface LeaveRequestTableProps {
  requests: LeaveRequest[];
  isLoading?: boolean;
  showEmployeeColumn?: boolean;
  currentUserId?: string;
  onRefresh?: () => void;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  filters?: {
    status?: LeaveStatus;
    leaveType?: LeaveType;
    onStatusChange?: (status: LeaveStatus | undefined) => void;
    onLeaveTypeChange?: (type: LeaveType | undefined) => void;
  };
}

export function LeaveRequestTable({
  requests,
  isLoading = false,
  showEmployeeColumn = false,
  currentUserId,
  onRefresh,
  pagination,
  filters,
}: LeaveRequestTableProps) {
  const router = useRouter();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleViewDetail = (id: string) => {
    router.push(`/hr/leave-requests/${id}`);
  };

  const handleCancelClick = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedRequest) return;

    try {
      setIsCancelling(true);
      const response = await leaveApi.cancel(selectedRequest.id);
      
      if (response.success) {
        toast.success('Pengajuan cuti berhasil dibatalkan');
        if (onRefresh) {
          onRefresh();
        }
      } else {
        toast.error(response.message || 'Gagal membatalkan pengajuan');
      }
    } catch (error) {
      console.error('Failed to cancel leave request:', error);
      toast.error('Gagal membatalkan pengajuan');
    } finally {
      setIsCancelling(false);
      setCancelDialogOpen(false);
      setSelectedRequest(null);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'd MMM yyyy', { locale: localeId });
  };

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.limit) : 1;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Filters skeleton */}
        {filters && (
          <div className="flex gap-4">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-40" />
          </div>
        )}
        {/* Table skeleton */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                {showEmployeeColumn && <TableHead><Skeleton className="h-4 w-24" /></TableHead>}
                <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                <TableHead><Skeleton className="h-4 w-24" /></TableHead>
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
                  {showEmployeeColumn && <TableCell><Skeleton className="h-4 w-32" /></TableCell>}
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-20" /></TableCell>
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
      {filters && (
        <div className="flex flex-wrap gap-4">
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => filters.onStatusChange?.(value === 'all' ? undefined : value as LeaveStatus)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              {Object.entries(LEAVE_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.leaveType || 'all'}
            onValueChange={(value) => filters.onLeaveTypeChange?.(value === 'all' ? undefined : value as LeaveType)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter Jenis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Jenis</SelectItem>
              {Object.entries(LEAVE_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal Pengajuan</TableHead>
              {showEmployeeColumn && <TableHead>Karyawan</TableHead>}
              <TableHead>Jenis Cuti</TableHead>
              <TableHead>Periode</TableHead>
              <TableHead>Hari</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Approver</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={showEmployeeColumn ? 8 : 7}
                  className="text-center py-8 text-muted-foreground"
                >
                  Tidak ada data pengajuan cuti
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{formatDate(request.createdAt)}</TableCell>
                  {showEmployeeColumn && (
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.employee?.fullName}</div>
                        <div className="text-sm text-muted-foreground">{request.employee?.nik}</div>
                      </div>
                    </TableCell>
                  )}
                  <TableCell>
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${LEAVE_TYPE_COLORS[request.leaveType]}`}>
                      {LEAVE_TYPE_LABELS[request.leaveType]}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDate(request.startDate)} - {formatDate(request.endDate)}
                    </div>
                  </TableCell>
                  <TableCell>{request.totalDays}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANTS[request.status]}>
                      {LEAVE_STATUS_LABELS[request.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {request.approver ? (
                      <div className="text-sm">{request.approver.fullName}</div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetail(request.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {request.status === LeaveStatus.PENDING &&
                        request.employeeId === currentUserId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancelClick(request)}
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.total > pagination.limit && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Menampilkan {((pagination.page - 1) * pagination.limit) + 1} -{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} dari{' '}
            {pagination.total} data
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Halaman {pagination.page} dari {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Batalkan Pengajuan Cuti?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin membatalkan pengajuan cuti ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Tidak</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              disabled={isCancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCancelling ? 'Membatalkan...' : 'Ya, Batalkan'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}