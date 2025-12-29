'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PermissionGate } from '@/components/auth';
import type { Employee } from '@/lib/types/hr';
import { Wallet, Building2, FileText, Shield, Calendar } from 'lucide-react';

interface PayrollTabProps {
  employee: Employee;
}

function formatCurrency(value?: number | null): string {
  if (value === undefined || value === null) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function InfoRow({ label, value }: { label: string; value: string | number | undefined | null }) {
  return (
    <div className="flex justify-between py-2 border-b last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value || '-'}</span>
    </div>
  );
}

export function PayrollTab({ employee }: PayrollTabProps) {
  return (
    <PermissionGate
      permissions={['hr:employee:read:payroll']}
      fallback={
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Shield className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">Akses Terbatas</p>
              <p className="text-sm">
                Anda tidak memiliki izin untuk melihat informasi penggajian
              </p>
            </div>
          </CardContent>
        </Card>
      }
    >
      <div className="space-y-6">
        {/* Salary Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wallet className="h-5 w-5" />
              Informasi Gaji
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <InfoRow label="Gaji Pokok" value={formatCurrency(employee.basicSalary)} />
              </div>
              <div className="space-y-1">
                <InfoRow label="Grade Jabatan" value={employee.jobGrade?.name} />
                {employee.jobGrade && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Range: {formatCurrency(employee.jobGrade.minSalary)} - {formatCurrency(employee.jobGrade.maxSalary)}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bank Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5" />
              Informasi Bank
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <InfoRow label="Nama Bank" value={employee.bankName} />
              <InfoRow label="Nomor Rekening" value={employee.bankAccountNumber} />
              <InfoRow label="Nama Pemilik Rekening" value={employee.bankAccountHolder} />
            </div>
          </CardContent>
        </Card>

        {/* Tax & Insurance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              Pajak & Asuransi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <InfoRow label="NPWP" value={employee.taxNumber} />
              <InfoRow label="BPJS Kesehatan" value={employee.bpjsKesehatan} />
              <InfoRow label="BPJS Ketenagakerjaan" value={employee.bpjsKetenagakerjaan} />
            </div>
          </CardContent>
        </Card>

        {/* Leave Balance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              Saldo Cuti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border p-4 text-center">
                <div className="text-3xl font-bold text-primary">
                  {employee.annualLeaveBalance ?? 0}
                </div>
                <div className="text-sm text-muted-foreground">Cuti Tahunan</div>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <div className="text-3xl font-bold text-primary">
                  {employee.sickLeaveBalance ?? 0}
                </div>
                <div className="text-sm text-muted-foreground">Cuti Sakit</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PermissionGate>
  );
}