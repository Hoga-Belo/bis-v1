'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DepartmentForm } from '@/components/hr/departments';
import { departmentsApi } from '@/lib/api/endpoints/hr';
import type { CreateDepartmentDto } from '@/lib/types/hr';

export default function CreateDepartmentPage() {
  const router = useRouter();

  const handleSubmit = async (data: CreateDepartmentDto) => {
    try {
      await departmentsApi.create(data);
      toast.success('Departemen berhasil dibuat');
      router.push('/hr/departments');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Gagal membuat departemen');
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tambah Departemen</h1>
        <p className="text-muted-foreground">Buat departemen baru</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Departemen</CardTitle>
        </CardHeader>
        <CardContent>
          <DepartmentForm
            onSubmit={handleSubmit}
            onCancel={() => router.push('/hr/departments')}
          />
        </CardContent>
      </Card>
    </div>
  );
}