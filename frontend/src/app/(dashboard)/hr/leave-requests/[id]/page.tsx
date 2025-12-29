'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { PermissionGate } from '@/components/auth/permission-gate';
import {
  LeaveRequestDetailCard,
  ApprovalActionCard,
} from '@/components/hr/leave-requests';
import { leaveApi } from '@/lib/api/endpoints/leave';
import { useAuth } from '@/lib/hooks/use-auth';
import { LeaveRequest, LeaveStatus } from '@/lib/types/leave';
import { ArrowLeft, X } from 'lucide-react';
import { toast } from 'sonner';

export default function LeaveRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params.id as string;

  const [leaveRequest, setLeaveRequest] = useState<LeaveRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchLeaveRequest = async () => {
      try {
        setLoading(true);
        const response = await leaveApi.getById(id);
        setLeaveRequest(response.data ?? null);
      } catch (error) {
        console.error('Failed to fetch leave request:', error);
        toast.error('Gagal memuat data pengajuan cuti');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLeaveRequest();
    }
  }, [id]);

  const handleCancel = async () => {
    try {
      setCancelling(true);
      await leaveApi.cancel(id);
      toast.success('Pengajuan cuti berhasil dibatalkan');
      router.push('/hr/leave-requests');
    } catch (error) {
      console.error('Failed to cancel leave request:', error);
      toast.error('Gagal membatalkan pengajuan cuti');
    } finally {
      setCancelling(false);
    }
  };

  const handleApprovalComplete = () => {
    // Refresh the leave request data after approval/rejection
    const fetchLeaveRequest = async () => {
      try {
        const response = await leaveApi.getById(id);
        setLeaveRequest(response.data ?? null);
      } catch (error) {
        console.error('Failed to refresh leave request:', error);
      }
    };
    fetchLeaveRequest();
  };

  // Check if current user is the requester (using user.employeeId to match employee)
  const isRequester = user?.employeeId === leaveRequest?.employeeId;
  
  // Check if current user is the approver
  const isApprover = user?.employeeId === leaveRequest?.approverId || user?.employeeId === leaveRequest?.delegateApproverId;
  
  // Check if request can be cancelled (only PENDING and by requester)
  const canCancel = isRequester && leaveRequest?.status === LeaveStatus.PENDING;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!leaveRequest) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Pengajuan cuti tidak ditemukan.
        </p>
        <Button variant="link" asChild className="mt-4">
          <Link href="/hr/leave-requests">Kembali ke daftar</Link>
        </Button>
      </div>
    );
  }

  return (
    <PermissionGate permissions={['hr:leave:read']} fallback={
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Anda tidak memiliki izin untuk melihat pengajuan cuti.
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
              <h1 className="text-2xl font-bold tracking-tight">Detail Pengajuan Cuti</h1>
              <p className="text-muted-foreground">
                Lihat detail pengajuan cuti
              </p>
            </div>
          </div>

          {/* Cancel Button (only for requester with PENDING status) */}
          {canCancel && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={cancelling}>
                  <X className="h-4 w-4 mr-2" />
                  Batalkan Pengajuan
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Batalkan Pengajuan Cuti?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah Anda yakin ingin membatalkan pengajuan cuti ini?
                    Tindakan ini tidak dapat dibatalkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Tidak</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancel}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Ya, Batalkan
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Leave Request Detail Card */}
        <LeaveRequestDetailCard request={leaveRequest} />

        {/* Approval Action Card (only for approver with PENDING status) */}
        {isApprover && leaveRequest.status === LeaveStatus.PENDING && (
          <PermissionGate permissions={['hr:leave:approve']}>
            <ApprovalActionCard
              request={leaveRequest}
              currentEmployeeId={user?.employeeId}
              onSuccess={handleApprovalComplete}
            />
          </PermissionGate>
        )}
      </div>
    </PermissionGate>
  );
}