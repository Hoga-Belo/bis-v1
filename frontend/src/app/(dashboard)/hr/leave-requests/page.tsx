'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PermissionGate } from '@/components/auth/permission-gate';
import {
  LeaveBalanceCard,
  LeaveRequestTable,
  LeaveStatisticsCard,
  LeaveCalendar,
  PendingApprovalsCard,
} from '@/components/hr/leave-requests';
import { usePermissions } from '@/lib/hooks/use-permissions';
import { useAuth } from '@/lib/hooks/use-auth';
import { leaveApi } from '@/lib/api/endpoints/leave';
import { LeaveType, LeaveStatus, type LeaveRequest } from '@/lib/types/leave';
import { Plus, FileText, BarChart3, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function LeaveRequestsPage() {
  const [activeTab, setActiveTab] = useState('requests');
  const { can } = usePermissions();
  const { user } = useAuth();
  const canApprove = can('hr:leave:approve');

  // State for leave requests
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | undefined>();
  const [typeFilter, setTypeFilter] = useState<LeaveType | undefined>();
  const limit = 10;

  const fetchRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await leaveApi.getMyRequests({
        page,
        limit,
        status: statusFilter,
        leaveType: typeFilter,
      });
      
      if (response.success && response.data) {
        // response.data is HrPaginatedResponse<LeaveRequest>
        setRequests(response.data.data);
        setTotal(response.data.meta?.total || response.data.data.length);
      }
    } catch (error) {
      console.error('Failed to fetch leave requests:', error);
      toast.error('Gagal memuat data pengajuan cuti');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, statusFilter, typeFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleStatusChange = (status: LeaveStatus | undefined) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleTypeChange = (type: LeaveType | undefined) => {
    setTypeFilter(type);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pengajuan Cuti</h1>
          <p className="text-muted-foreground">
            Kelola pengajuan cuti Anda
          </p>
        </div>
        <PermissionGate permissions={['hr:leave:create']}>
          <Button asChild>
            <Link href="/hr/leave-requests/create">
              <Plus className="mr-2 h-4 w-4" />
              Ajukan Cuti
            </Link>
          </Button>
        </PermissionGate>
      </div>

      {/* Leave Balance Card */}
      <PermissionGate permissions={['hr:leave:read']}>
        <LeaveBalanceCard />
      </PermissionGate>

      {/* Pending Approvals for Managers */}
      {canApprove && (
        <PermissionGate permissions={['hr:leave:approve']}>
          <PendingApprovalsCard />
        </PermissionGate>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Pengajuan Saya
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Statistik
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Kalender
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="mt-4">
          <PermissionGate permissions={['hr:leave:read']}>
            <LeaveRequestTable
              requests={requests}
              isLoading={isLoading}
              currentUserId={user?.id}
              onRefresh={fetchRequests}
              pagination={{
                page,
                limit,
                total,
                onPageChange: handlePageChange,
              }}
              filters={{
                status: statusFilter,
                leaveType: typeFilter,
                onStatusChange: handleStatusChange,
                onLeaveTypeChange: handleTypeChange,
              }}
            />
          </PermissionGate>
        </TabsContent>

        <TabsContent value="statistics" className="mt-4">
          <PermissionGate permissions={['hr:leave:read']}>
            <LeaveStatisticsCard />
          </PermissionGate>
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <PermissionGate permissions={['hr:leave:read']}>
            <LeaveCalendar />
          </PermissionGate>
        </TabsContent>
      </Tabs>
    </div>
  );
}