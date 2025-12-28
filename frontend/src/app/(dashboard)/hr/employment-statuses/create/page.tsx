'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmploymentStatusForm } from '@/components/hr/employment-statuses';
import { employmentStatusesApi } from '@/lib/api/endpoints/hr';
import type { CreateEmploymentStatusDto, UpdateEmploymentStatusDto } from '@/lib/types/hr';

export default function CreateEmploymentStatusPage() {
  const router = useRouter();

  const handleSubmit = async (data: CreateEmploymentStatusDto | UpdateEmploymentStatusDto) => {
    try {
      await employmentStatusesApi.create(data as CreateEmploymentStatusDto);
      toast.success('Status kepegawaian berhasil dibuat');
      router.push('/hr/employment-statuses');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Gagal membuat status kepegawaian');
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tambah Status Kepegawaian</h1>
        <p className="text-muted-foreground">Buat status kepegawaian baru</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Status Kepegawaian</CardTitle>
        </CardHeader>
        <CardContent>
          <EmploymentStatusForm
            onSubmit={handleSubmit}
            onCancel={() => router.push('/hr/employment-statuses')}
          />
        </CardContent>
      </Card>
    </div>
  );
}