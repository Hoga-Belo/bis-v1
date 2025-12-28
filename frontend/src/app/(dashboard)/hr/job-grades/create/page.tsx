'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { JobGradeForm } from '@/components/hr/job-grades';
import { jobGradesApi } from '@/lib/api/endpoints/hr';
import type { CreateJobGradeDto } from '@/lib/types/hr';

export default function CreateJobGradePage() {
  const router = useRouter();

  const handleSubmit = async (data: CreateJobGradeDto) => {
    try {
      await jobGradesApi.create(data);
      toast.success('Golongan berhasil dibuat');
      router.push('/hr/job-grades');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Gagal membuat golongan');
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tambah Golongan</h1>
        <p className="text-muted-foreground">Buat golongan baru dengan rentang gaji</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Golongan</CardTitle>
        </CardHeader>
        <CardContent>
          <JobGradeForm
            onSubmit={handleSubmit}
            onCancel={() => router.push('/hr/job-grades')}
          />
        </CardContent>
      </Card>
    </div>
  );
}