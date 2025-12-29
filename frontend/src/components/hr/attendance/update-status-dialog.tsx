'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { attendanceApi } from '@/lib/api/endpoints/attendance';
import { AttendanceStatus } from '@/lib/types/attendance';
import type { Attendance } from '@/lib/types/attendance';
import { toast } from 'sonner';
import { Loader2, Calendar, User, Clock } from 'lucide-react';

interface UpdateStatusDialogProps {
  attendance: Attendance | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (attendance: Attendance) => void;
}

// Status configuration
const statusOptions: Array<{ value: AttendanceStatus; label: string; className: string }> = [
  { value: AttendanceStatus.PRESENT, label: 'Hadir', className: 'bg-green-100 text-green-800' },
  { value: AttendanceStatus.LATE, label: 'Terlambat', className: 'bg-yellow-100 text-yellow-800' },
  { value: AttendanceStatus.ABSENT, label: 'Tidak Hadir', className: 'bg-red-100 text-red-800' },
  { value: AttendanceStatus.LEAVE, label: 'Cuti', className: 'bg-blue-100 text-blue-800' },
  { value: AttendanceStatus.SICK, label: 'Sakit', className: 'bg-purple-100 text-purple-800' },
  { value: AttendanceStatus.PERMIT, label: 'Izin', className: 'bg-orange-100 text-orange-800' },
];

export function UpdateStatusDialog({
  attendance,
  open,
  onOpenChange,
  onSuccess,
}: UpdateStatusDialogProps) {
  const [status, setStatus] = useState<AttendanceStatus | ''>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when dialog opens with new attendance
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && attendance) {
      setStatus(attendance.status);
      setNotes(attendance.notes || '');
    } else if (!newOpen) {
      setStatus('');
      setNotes('');
    }
    onOpenChange(newOpen);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!attendance || !status) {
      toast.error('Silakan pilih status');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await attendanceApi.updateStatus(attendance.id, {
        status: status as AttendanceStatus,
        notes: notes || undefined,
      });

      if (response.success && response.data) {
        toast.success('Status kehadiran berhasil diperbarui');
        onSuccess?.(response.data);
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Failed to update attendance status:', error);
      toast.error('Gagal memperbarui status kehadiran');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get current status config
  const currentStatusConfig = statusOptions.find((s) => s.value === attendance?.status);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ubah Status Kehadiran</DialogTitle>
          <DialogDescription>
            Perbarui status kehadiran karyawan. Perubahan akan dicatat dalam audit trail.
          </DialogDescription>
        </DialogHeader>

        {attendance && (
          <div className="space-y-4">
            {/* Attendance Info */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{formatDate(attendance.date)}</span>
              </div>
              {attendance.employee && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {attendance.employee.fullName} ({attendance.employee.nik})
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  Clock In: {attendance.clockIn || '-'} | Clock Out: {attendance.clockOut || '-'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Status Saat Ini:</span>
                {currentStatusConfig && (
                  <Badge className={currentStatusConfig.className}>
                    {currentStatusConfig.label}
                  </Badge>
                )}
              </div>
            </div>

            {/* Status Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status Baru</label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as AttendanceStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status baru" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${option.className.replace('text-', 'bg-').split(' ')[0]}`}
                        />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Catatan (Opsional)</label>
              <Textarea
                placeholder="Tambahkan catatan untuk perubahan ini..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !status}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Simpan Perubahan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}