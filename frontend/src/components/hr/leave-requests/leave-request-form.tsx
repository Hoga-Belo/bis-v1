'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { format, isWeekend, addDays } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { leaveApi } from '@/lib/api/endpoints/leave';
import { LeaveType, type CreateLeaveRequest } from '@/lib/types/leave';
import { Calendar, User, Loader2 } from 'lucide-react';

// Leave type labels in Indonesian
export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  [LeaveType.ANNUAL]: 'Cuti Tahunan',
  [LeaveType.SICK]: 'Cuti Sakit',
  [LeaveType.MATERNITY]: 'Cuti Melahirkan',
  [LeaveType.PATERNITY]: 'Cuti Ayah',
  [LeaveType.MARRIAGE]: 'Cuti Menikah',
  [LeaveType.BEREAVEMENT]: 'Cuti Duka',
  [LeaveType.UNPAID]: 'Cuti Tanpa Gaji',
  [LeaveType.PERMIT]: 'Izin',
  [LeaveType.OTHER]: 'Cuti Lainnya',
};

// Form validation schema
const leaveRequestSchema = z.object({
  leaveType: z.nativeEnum(LeaveType, {
    message: 'Pilih jenis cuti',
  }),
  startDate: z.string().min(1, 'Tanggal mulai wajib diisi'),
  endDate: z.string().min(1, 'Tanggal selesai wajib diisi'),
  reason: z.string().min(10, 'Alasan minimal 10 karakter'),
  attachmentUrl: z.string().url('URL tidak valid').optional().or(z.literal('')),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end >= start;
}, {
  message: 'Tanggal selesai harus sama atau setelah tanggal mulai',
  path: ['endDate'],
});

type LeaveRequestFormData = z.infer<typeof leaveRequestSchema>;

interface LeaveRequestFormProps {
  onSuccess?: () => void;
}

// Calculate working days (excluding weekends)
function calculateWorkingDays(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (end < start) return 0;
  
  let workingDays = 0;
  let currentDate = start;
  
  while (currentDate <= end) {
    if (!isWeekend(currentDate)) {
      workingDays++;
    }
    currentDate = addDays(currentDate, 1);
  }
  
  return workingDays;
}

export function LeaveRequestForm({ onSuccess }: LeaveRequestFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [approverInfo, setApproverInfo] = useState<{
    name: string;
    position: string;
  } | null>(null);
  const [isLoadingApprover, setIsLoadingApprover] = useState(true);

  const form = useForm<LeaveRequestFormData>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      leaveType: undefined,
      startDate: '',
      endDate: '',
      reason: '',
      attachmentUrl: '',
    },
  });

  const startDate = form.watch('startDate');
  const endDate = form.watch('endDate');

  // Calculate total days
  const totalDays = useMemo(() => {
    return calculateWorkingDays(startDate, endDate);
  }, [startDate, endDate]);

  // Fetch approver info (simulated - in real app would call API)
  useEffect(() => {
    const fetchApproverInfo = async () => {
      try {
        setIsLoadingApprover(true);
        // In a real implementation, this would call an API endpoint
        // For now, we'll simulate with a timeout
        await new Promise(resolve => setTimeout(resolve, 500));
        setApproverInfo({
          name: 'Manager',
          position: 'Department Head',
        });
      } catch (error) {
        console.error('Failed to fetch approver info:', error);
      } finally {
        setIsLoadingApprover(false);
      }
    };

    fetchApproverInfo();
  }, []);

  const onSubmit = async (data: LeaveRequestFormData) => {
    try {
      setIsSubmitting(true);
      
      const payload: CreateLeaveRequest = {
        leaveType: data.leaveType,
        startDate: data.startDate,
        endDate: data.endDate,
        reason: data.reason,
        attachmentUrl: data.attachmentUrl || undefined,
      };

      const response = await leaveApi.submit(payload);
      
      if (response.success) {
        toast.success('Pengajuan cuti berhasil dikirim');
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/hr/leave-requests');
        }
      } else {
        toast.error(response.message || 'Gagal mengajukan cuti');
      }
    } catch (error) {
      console.error('Failed to submit leave request:', error);
      toast.error('Gagal mengajukan cuti');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get minimum date (today)
  const minDate = format(new Date(), 'yyyy-MM-dd');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Detail Pengajuan Cuti
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Leave Type */}
            <FormField
              control={form.control}
              name="leaveType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenis Cuti</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis cuti" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(LEAVE_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Mulai</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        min={minDate}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Selesai</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        min={startDate || minDate}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Total Days Display */}
            {startDate && endDate && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Hari Kerja:</span>
                  <span className="text-lg font-bold text-primary">{totalDays} hari</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  * Tidak termasuk hari Sabtu dan Minggu
                </p>
              </div>
            )}

            {/* Reason */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alasan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Jelaskan alasan pengajuan cuti..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Minimal 10 karakter
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Attachment URL */}
            <FormField
              control={form.control}
              name="attachmentUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Lampiran (Opsional)</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Link ke dokumen pendukung (surat dokter, undangan, dll)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Approver Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              Atasan yang Akan Menyetujui
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingApprover ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            ) : approverInfo ? (
              <div>
                <p className="font-medium">{approverInfo.name}</p>
                <p className="text-sm text-muted-foreground">{approverInfo.position}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Tidak ada atasan yang ditentukan. Pengajuan akan diteruskan ke HR.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Ajukan Cuti
          </Button>
        </div>
      </form>
    </Form>
  );
}