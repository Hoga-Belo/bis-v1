'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Employee, EmployeeStatusType } from '@/lib/types/hr';

interface EmploymentTabProps {
  employee: Employee;
}

const statusColors: Record<EmployeeStatusType, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  ON_LEAVE: 'bg-yellow-100 text-yellow-800',
  RESIGNED: 'bg-gray-100 text-gray-800',
  TERMINATED: 'bg-red-100 text-red-800',
};

const statusLabels: Record<EmployeeStatusType, string> = {
  ACTIVE: 'Aktif',
  ON_LEAVE: 'Cuti',
  RESIGNED: 'Resign',
  TERMINATED: 'Diberhentikan',
};

function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value || '-'}</dd>
    </div>
  );
}

export function EmploymentTab({ employee }: EmploymentTabProps) {
  return (
    <div className="space-y-6">
      {/* Organization */}
      <Card>
        <CardHeader>
          <CardTitle>Organisasi</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem label="Divisi" value={employee.division?.name} />
            <InfoItem label="Departemen" value={employee.department?.name} />
            <InfoItem label="Jabatan" value={employee.position?.name} />
            <InfoItem label="Job Grade" value={employee.jobGrade?.name} />
            <InfoItem
              label="Status Kepegawaian"
              value={employee.employmentStatus?.name}
            />
            <InfoItem label="Lokasi Kerja" value={employee.workLocation?.name} />
            <InfoItem
              label="Atasan Langsung"
              value={
                employee.manager
                  ? `${employee.manager.nik} - ${employee.manager.fullName}`
                  : undefined
              }
            />
          </dl>
        </CardContent>
      </Card>

      {/* Employment Dates */}
      <Card>
        <CardHeader>
          <CardTitle>Tanggal Kepegawaian</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem label="Tanggal Masuk" value={formatDate(employee.joinDate)} />
            <InfoItem
              label="Tanggal Pengangkatan"
              value={formatDate(employee.permanentDate)}
            />
            <InfoItem
              label="Tanggal Mulai Kontrak"
              value={formatDate(employee.contractStartDate)}
            />
            <InfoItem
              label="Tanggal Akhir Kontrak"
              value={formatDate(employee.contractEndDate)}
            />
          </dl>
        </CardContent>
      </Card>

      {/* Employee Status */}
      <Card>
        <CardHeader>
          <CardTitle>Status Karyawan</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1">
              <dt className="text-sm font-medium text-muted-foreground">
                Status
              </dt>
              <dd>
                <Badge className={statusColors[employee.employeeStatus]}>
                  {statusLabels[employee.employeeStatus]}
                </Badge>
              </dd>
            </div>
            {(employee.employeeStatus === 'RESIGNED' ||
              employee.employeeStatus === 'TERMINATED') && (
              <>
                <InfoItem
                  label="Tanggal Resign"
                  value={formatDate(employee.resignDate)}
                />
                <div className="sm:col-span-2 lg:col-span-3">
                  <InfoItem label="Alasan Resign" value={employee.resignReason} />
                </div>
              </>
            )}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}