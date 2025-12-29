'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/components/auth';
import { ExcelImport } from '@/components/hr/employees/excel-import';

export default function ImportEmployeesPage() {
  const router = useRouter();

  const handleImportComplete = () => {
    // Navigate to employee list after successful import
    router.push('/hr/employees');
  };

  return (
    <PermissionGate permissions={['hr:employee:create']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Import Data Karyawan</h1>
            <p className="text-muted-foreground">
              Import data karyawan dari file Excel secara massal
            </p>
          </div>
        </div>

        {/* Import Component */}
        <ExcelImport onImportComplete={handleImportComplete} />

        {/* Instructions */}
        <div className="rounded-lg border bg-muted/50 p-4">
          <h3 className="font-medium mb-2">Petunjuk Import</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
            <li>Unduh template Excel dengan mengklik tombol &quot;Unduh Template&quot;</li>
            <li>Buka file template dan baca petunjuk di sheet &quot;READ_ME&quot;</li>
            <li>Isi data karyawan di sheet &quot;KARYAWAN_HEAD&quot;</li>
            <li>Isi data keluarga di sheet &quot;KELUARGA_DETAIL&quot; (opsional)</li>
            <li>Isi data pendidikan di sheet &quot;PENDIDIKAN_DETAIL&quot; (opsional)</li>
            <li>Simpan file dan upload menggunakan form di atas</li>
            <li>Periksa hasil import dan perbaiki data yang error jika ada</li>
          </ol>
        </div>
      </div>
    </PermissionGate>
  );
}