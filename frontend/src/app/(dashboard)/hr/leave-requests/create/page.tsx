'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/components/auth/permission-gate';
import {
  LeaveBalanceCard,
  LeaveRequestForm,
} from '@/components/hr/leave-requests';
import { ArrowLeft } from 'lucide-react';

export default function CreateLeaveRequestPage() {
  return (
    <PermissionGate permissions={['hr:leave:create']} fallback={
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Anda tidak memiliki izin untuk mengajukan cuti.
        </p>
      </div>
    }>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/hr/leave-requests">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Ajukan Cuti Baru</h1>
            <p className="text-muted-foreground">
              Isi formulir di bawah untuk mengajukan cuti
            </p>
          </div>
        </div>

        {/* Leave Balance Card */}
        <LeaveBalanceCard />

        {/* Leave Request Form */}
        <LeaveRequestForm />
      </div>
    </PermissionGate>
  );
}