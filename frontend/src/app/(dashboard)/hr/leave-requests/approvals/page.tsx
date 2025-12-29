'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PermissionGate } from '@/components/auth/permission-gate';
import { LeaveRequestTable } from '@/components/hr/leave-requests';
import { leaveApi } from '@/lib/api/endpoints/leave';
import { LeaveRequest, LeaveType } from '@/lib/types/leave';
import { ArrowLeft, ClipboardList, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

// Leave type labels
const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  [LeaveType.ANNUAL]: 'Cuti Tahunan',
  [LeaveType.SICK]: 'Cuti Sakit',
  [LeaveType.MATERNITY]: 'Cuti Melahirkan',
  [LeaveType.PATERNITY]: 'Cuti Ayah',
  [LeaveType.MARRIAGE]: 'Cuti Menikah',
  [LeaveType.BEREAVEMENT]: 'Cuti Duka',
  [LeaveType.UNPAID]: 'Cuti Tanpa Gaji',
  [LeaveType.OTHER]: 'Cuti Lainnya',
  [LeaveType.PERMIT]: 'Cuti Izin',
};

export default function LeaveApprovalsPage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [allRequests, setAllRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>('all');
  const [total, setTotal] = useState(0);

  const fetchPendingApprovals = useCallback(async () => {
    try {
      setLoading(true);
      const response = await leaveApi.getPendingApprovals();
      
      if (response.success && response.data) {
        setAllRequests(response.data.data);
        setTotal(response.data.meta?.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch pending approvals:', error);
      toast.error('Gagal memuat data persetujuan');
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter requests based on leave type
  useEffect(() => {
    if (leaveTypeFilter === 'all') {
      setRequests(allRequests);
    } else {
      setRequests(allRequests.filter(r => r.leaveType === leaveTypeFilter));
    }
  }, [allRequests, leaveTypeFilter]);

  useEffect(() => {
    fetchPendingApprovals();
  }, [fetchPendingApprovals]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPendingApprovals();
    setRefreshing(false);
    toast.success('Data berhasil diperbarui');
  };

  const handleLeaveTypeChange = (value: string) => {
    setLeaveTypeFilter(value);
  };

  const handleApprovalComplete = () => {
    // Refresh the list after approval/rejection
    fetchPendingApprovals();
  };

  return (
    <PermissionGate permissions={['hr:leave:approve']} fallback={
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Anda tidak memiliki izin untuk menyetujui pengajuan cuti.
        </p>
      </div>
    }>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/hr/leave-requests">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Persetujuan Cuti</h1>
              <p className="text-muted-foreground">
                Kelola pengajuan cuti yang menunggu persetujuan
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Summary Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Ringkasan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-yellow-600">
                {loading ? <Skeleton className="h-9 w-12" /> : total}
              </div>
              <div className="text-muted-foreground">
                pengajuan menunggu persetujuan
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="w-48">
            <Select value={leaveTypeFilter} onValueChange={handleLeaveTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Jenis Cuti" />
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
        </div>

        {/* Pending Approvals Table */}
        {loading ? (
          <Card>
            <CardContent className="py-8">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Tidak ada pengajuan cuti yang menunggu persetujuan</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <LeaveRequestTable
            requests={requests}
            showEmployeeColumn={true}
            onRefresh={handleApprovalComplete}
          />
        )}
      </div>
    </PermissionGate>
  );
}