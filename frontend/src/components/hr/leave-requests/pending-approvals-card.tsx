'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
} from '@/components/ui/alert-dialog';
import { leaveApi } from '@/lib/api/endpoints/leave';
import { LeaveType, type LeaveRequest } from '@/lib/types/leave';
import { CheckCircle, XCircle, Clock, Eye, Loader2 } from 'lucide-react';

// Leave type labels in Indonesian
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

// Leave type badge colors
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

interface PendingApprovalsCardProps {
  onApprovalChange?: () => void;
}

export function PendingApprovalsCard({ onApprovalChange }: PendingApprovalsCardProps) {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);

  const fetchPendingApprovals = async () => {
    try {
      setIsLoading(true);
      const response = await leaveApi.getPendingApprovals();
      if (response.success && response.data) {
        setRequests(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch pending approvals:', error);
      toast.error('Gagal memuat data persetujuan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const handleApprove = async () => {
    if (!selectedRequest) return;

    try {
      setProcessingId(selectedRequest.id);
      const response = await leaveApi.approve(selectedRequest.id, {});
      
      if (response.success) {
        toast.success('Pengajuan cuti berhasil disetujui');
        fetchPendingApprovals();
        if (onApprovalChange) {
          onApprovalChange();
        }
      } else {
        toast.error(response.message || 'Gagal menyetujui pengajuan');
      }
    } catch (error) {
      console.error('Failed to approve leave request:', error);
      toast.error('Gagal menyetujui pengajuan');
    } finally {
      setProcessingId(null);
      setApproveDialogOpen(false);
      setSelectedRequest(null);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    try {
      setProcessingId(selectedRequest.id);
      const response = await leaveApi.reject(selectedRequest.id, { notes: 'Ditolak melalui quick action' });
      
      if (response.success) {
        toast.success('Pengajuan cuti berhasil ditolak');
        fetchPendingApprovals();
        if (onApprovalChange) {
          onApprovalChange();
        }
      } else {
        toast.error(response.message || 'Gagal menolak pengajuan');
      }
    } catch (error) {
      console.error('Failed to reject leave request:', error);
      toast.error('Gagal menolak pengajuan');
    } finally {
      setProcessingId(null);
      setRejectDialogOpen(false);
      setSelectedRequest(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Menunggu Persetujuan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Menunggu Persetujuan
            </CardTitle>
            {requests.length > 0 && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                {requests.length}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <p>Tidak ada pengajuan yang menunggu persetujuan</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.slice(0, 5).map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {request.employee?.fullName || 'Unknown'}
                      </span>
                      <Badge className={LEAVE_TYPE_COLORS[request.leaveType]}>
                        {LEAVE_TYPE_LABELS[request.leaveType]}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(request.startDate)} - {formatDate(request.endDate)} ({request.totalDays} hari)
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100"
                      onClick={() => {
                        setSelectedRequest(request);
                        setApproveDialogOpen(true);
                      }}
                      disabled={processingId === request.id}
                    >
                      {processingId === request.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100"
                      onClick={() => {
                        setSelectedRequest(request);
                        setRejectDialogOpen(true);
                      }}
                      disabled={processingId === request.id}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      asChild
                    >
                      <Link href={`/hr/leave-requests/${request.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
              {requests.length > 5 && (
                <div className="text-center pt-2">
                  <Button variant="link" asChild>
                    <Link href="/hr/leave-requests/approvals">
                      Lihat semua ({requests.length} pengajuan)
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Setujui Pengajuan Cuti?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menyetujui pengajuan cuti ini?
              {selectedRequest && (
                <span className="block mt-2 font-medium text-foreground">
                  {selectedRequest.employee?.fullName} - {selectedRequest.totalDays} hari
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!processingId}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              disabled={!!processingId}
              className="bg-green-600 hover:bg-green-700"
            >
              {processingId ? 'Menyetujui...' : 'Ya, Setujui'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tolak Pengajuan Cuti?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menolak pengajuan cuti ini?
              {selectedRequest && (
                <span className="block mt-2 font-medium text-foreground">
                  {selectedRequest.employee?.fullName} - {selectedRequest.totalDays} hari
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!processingId}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={!!processingId}
              className="bg-destructive hover:bg-destructive/90"
            >
              {processingId ? 'Menolak...' : 'Ya, Tolak'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}