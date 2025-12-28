'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PositionForm } from '@/components/hr/positions';
import { positionsApi } from '@/lib/api/endpoints/hr';
import type { CreatePositionDto } from '@/lib/types/hr';

export default function CreatePositionPage() {
  const router = useRouter();

  const handleSubmit = async (data: CreatePositionDto) => {
    try {
      await positionsApi.create(data);
      toast.success('Jabatan berhasil dibuat');
      router.push('/hr/positions');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Gagal membuat jabatan');
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tambah Jabatan</h1>
        <p className="text-muted-foreground">Buat jabatan baru</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Jabatan</CardTitle>
        </CardHeader>
        <CardContent>
          <PositionForm
            onSubmit={handleSubmit}
            onCancel={() => router.push('/hr/positions')}
          />
        </CardContent>
      </Card>
    </div>
  );
}