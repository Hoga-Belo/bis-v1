'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkLocationForm } from '@/components/hr/work-locations';
import { workLocationsApi } from '@/lib/api/endpoints/hr';
import type { CreateWorkLocationDto, UpdateWorkLocationDto } from '@/lib/types/hr';

export default function CreateWorkLocationPage() {
  const router = useRouter();

  const handleSubmit = async (data: CreateWorkLocationDto | UpdateWorkLocationDto) => {
    try {
      await workLocationsApi.create(data as CreateWorkLocationDto);
      toast.success('Lokasi kerja berhasil dibuat');
      router.push('/hr/work-locations');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Gagal membuat lokasi kerja');
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tambah Lokasi Kerja</h1>
        <p className="text-muted-foreground">Buat lokasi kerja baru</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Lokasi Kerja</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkLocationForm
            onSubmit={handleSubmit}
            onCancel={() => router.push('/hr/work-locations')}
          />
        </CardContent>
      </Card>
    </div>
  );
}