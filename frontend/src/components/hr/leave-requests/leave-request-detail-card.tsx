'use client';

import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { LeaveType, LeaveStatus, type LeaveRequest } from '@/lib/types/leave';
import { LEAVE_TYPE_LABELS } from './leave-request-form';
import { LEAVE_STATUS_LABELS } from './leave-request-table';
import {
  Calendar,
  User,
  Building,
  Briefcase,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
} from 'lucide-react';

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

interface LeaveRequestDetailCardProps {
  request: LeaveRequest | null;
  isLoading?: boolean;
}

interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

function DetailRow({ icon, label, value }: DetailRowProps) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="text-muted-foreground mt-0.5">{icon}</div>
      <div className="flex-1">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="font-medium">{value}</div>
      </div>
    </div>
  );
}

export function LeaveRequestDetailCard({
  request,
  isLoading = false,
}: LeaveRequestDetailCardProps) {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'd MMMM yyyy', { locale: localeId });
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'd MMMM yyyy, HH:mm', { locale: localeId });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 py-2">
              <Skeleton className="h-5 w-5" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-32" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!request) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            Data pengajuan cuti tidak ditemukan
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Detail Pengajuan Cuti</CardTitle>
          <Badge variant={STATUS_VARIANTS[request.status]}>
            {LEAVE_STATUS_LABELS[request.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Employee Info */}
        {request.employee && (
          <>
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground">Informasi Karyawan</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <DetailRow
                  icon={<User className="h-4 w-4" />}
                  label="Nama"
                  value={request.employee.fullName}
                />
                <DetailRow
                  icon={<FileText className="h-4 w-4" />}
                  label="NIK"
                  value={request.employee.nik}
                />
                {request.employee.department && (
                  <DetailRow
                    icon={<Building className="h-4 w-4" />}
                    label="Departemen"
                    value={request.employee.department.name}
                  />
                )}
                {request.employee.position && (
                  <DetailRow
                    icon={<Briefcase className="h-4 w-4" />}
                    label="Jabatan"
                    value={request.employee.position.name}
                  />
                )}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Leave Details */}
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-muted-foreground">Detail Cuti</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <DetailRow
              icon={<Calendar className="h-4 w-4" />}
              label="Jenis Cuti"
              value={
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${LEAVE_TYPE_COLORS[request.leaveType]}`}>
                  {LEAVE_TYPE_LABELS[request.leaveType]}
                </span>
              }
            />
            <DetailRow
              icon={<Clock className="h-4 w-4" />}
              label="Total Hari"
              value={`${request.totalDays} hari kerja`}
            />
            <DetailRow
              icon={<Calendar className="h-4 w-4" />}
              label="Tanggal Mulai"
              value={formatDate(request.startDate)}
            />
            <DetailRow
              icon={<Calendar className="h-4 w-4" />}
              label="Tanggal Selesai"
              value={formatDate(request.endDate)}
            />
          </div>
        </div>

        <Separator />

        {/* Reason */}
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-muted-foreground">Alasan</h4>
          <p className="text-sm">{request.reason}</p>
        </div>

        {/* Attachment */}
        {request.attachmentUrl && (
          <>
            <Separator />
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground">Lampiran</h4>
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <a href={request.attachmentUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Lihat Lampiran
                </a>
              </Button>
            </div>
          </>
        )}

        <Separator />

        {/* Approver Info */}
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-muted-foreground">Informasi Persetujuan</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <DetailRow
              icon={<User className="h-4 w-4" />}
              label="Approver"
              value={request.approver?.fullName || '-'}
            />
            {request.delegateApprover && (
              <DetailRow
                icon={<User className="h-4 w-4" />}
                label="Delegate Approver"
                value={request.delegateApprover.fullName}
              />
            )}
          </div>
        </div>

        {/* Approval Notes */}
        {request.approvalNotes && (
          <>
            <Separator />
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground">Catatan Persetujuan</h4>
              <div className={`p-3 rounded-lg ${
                request.status === LeaveStatus.APPROVED
                  ? 'bg-green-50 border border-green-200'
                  : request.status === LeaveStatus.REJECTED
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-muted'
              }`}>
                <div className="flex items-start gap-2">
                  {request.status === LeaveStatus.APPROVED ? (
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  ) : request.status === LeaveStatus.REJECTED ? (
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                  ) : null}
                  <p className="text-sm">{request.approvalNotes}</p>
                </div>
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Timestamps */}
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-muted-foreground">Waktu</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <DetailRow
              icon={<Clock className="h-4 w-4" />}
              label="Diajukan"
              value={formatDateTime(request.createdAt)}
            />
            {request.approvedAt && (
              <DetailRow
                icon={<Clock className="h-4 w-4" />}
                label={request.status === LeaveStatus.APPROVED ? 'Disetujui' : 'Ditolak'}
                value={formatDateTime(request.approvedAt)}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}