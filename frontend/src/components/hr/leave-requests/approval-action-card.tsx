'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { LeaveStatus, type LeaveRequest } from '@/lib/types/leave';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface ApprovalActionCardProps {
  request: LeaveRequest;
  currentEmployeeId?: string | null;
  onSuccess?: () => void;
}

export function ApprovalActionCard({
  request,
  currentEmployeeId,
  onSuccess,
}: ApprovalActionCardProps) {
  const [notes, setNotes] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  // Check if current user is the approver (using employeeId)
  const isApprover = currentEmployeeId && (
    request.approverId === currentEmployeeId ||
    request.delegateApproverId === currentEmployeeId
  );

  // Only show if request is pending and current user is approver
  if (request.status !== LeaveStatus.PENDING || !isApprover) {
    return null;
  }

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      const response = await leaveApi.approve(request.id, { notes: notes || undefined });
      
      if (response.success) {
        toast.success('Pengajuan cuti berhasil disetujui');
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error(response.message || 'Gagal menyetujui pengajuan');
      }
    } catch (error) {
      console.error('Failed to approve leave request:', error);
      toast.error('Gagal menyetujui pengajuan');
    } finally {
      setIsApproving(false);
      setApproveDialogOpen(false);
    }
  };

  const handleReject = async () => {
    if (!notes.trim()) {
      toast.error('Catatan wajib diisi untuk penolakan');
      return;
    }

    try {
      setIsRejecting(true);
      const response = await leaveApi.reject(request.id, { notes });
      
      if (response.success) {
        toast.success('Pengajuan cuti berhasil ditolak');
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error(response.message || 'Gagal menolak pengajuan');
      }
    } catch (error) {
      console.error('Failed to reject leave request:', error);
      toast.error('Gagal menolak pengajuan');
    } finally {
      setIsRejecting(false);
      setRejectDialogOpen(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Tindakan Persetujuan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="approval-notes">Catatan (Opsional untuk Setuju, Wajib untuk Tolak)</Label>
            <Textarea
              id="approval-notes"
              placeholder="Tambahkan catatan..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div className="flex gap-3">
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => setApproveDialogOpen(true)}
              disabled={isApproving || isRejecting}
            >
              {isApproving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Setujui
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => setRejectDialogOpen(true)}
              disabled={isApproving || isRejecting}
            >
              {isRejecting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="mr-2 h-4 w-4" />
              )}
              Tolak
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Setujui Pengajuan Cuti?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menyetujui pengajuan cuti ini?
              {request.employee && (
                <span className="block mt-2 font-medium text-foreground">
                  {request.employee.fullName} - {request.totalDays} hari
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isApproving}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              disabled={isApproving}
              className="bg-green-600 hover:bg-green-700"
            >
              {isApproving ? 'Menyetujui...' : 'Ya, Setujui'}
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
              {request.employee && (
                <span className="block mt-2 font-medium text-foreground">
                  {request.employee.fullName} - {request.totalDays} hari
                </span>
              )}
              {!notes.trim() && (
                <span className="block mt-2 text-destructive">
                  ⚠️ Catatan wajib diisi untuk penolakan
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRejecting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={isRejecting || !notes.trim()}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isRejecting ? 'Menolak...' : 'Ya, Tolak'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}