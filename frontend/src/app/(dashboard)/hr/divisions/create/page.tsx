'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DivisionForm } from '@/components/hr/divisions';
import { divisionsApi } from '@/lib/api/endpoints/hr';
import type { CreateDivisionDto } from '@/lib/types/hr';

export default function CreateDivisionPage() {
  const router = useRouter();

  const handleSubmit = async (data: CreateDivisionDto) => {
    try {
      await divisionsApi.create(data);
      toast.success('Divisi berhasil dibuat');
      router.push('/hr/divisions');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Gagal membuat divisi');
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tambah Divisi</h1>
        <p className="text-muted-foreground">Buat divisi baru</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Divisi</CardTitle>
        </CardHeader>
        <CardContent>
          <DivisionForm
            onSubmit={handleSubmit}
            onCancel={() => router.push('/hr/divisions')}
          />
        </CardContent>
      </Card>
    </div>
  );
}