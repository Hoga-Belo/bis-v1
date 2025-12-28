'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmploymentStatusForm } from '@/components/hr/employment-statuses';
import { employmentStatusesApi } from '@/lib/api/endpoints/hr';
import type { EmploymentStatus, UpdateEmploymentStatusDto, CreateEmploymentStatusDto } from '@/lib/types/hr';

export default function EditEmploymentStatusPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [employmentStatus, setEmploymentStatus] = useState<EmploymentStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmploymentStatus = async () => {
      try {
        const response = await employmentStatusesApi.getById(id);
        if (response.success && response.data) {
          setEmploymentStatus(response.data);
        }
      } catch {
        toast.error('Gagal memuat data status kepegawaian');
        router.push('/hr/employment-statuses');
      } finally {
        setLoading(false);
      }
    };
    fetchEmploymentStatus();
  }, [id, router]);

  const handleSubmit = async (data: CreateEmploymentStatusDto | UpdateEmploymentStatusDto) => {
    try {
      await employmentStatusesApi.update(id, data as UpdateEmploymentStatusDto);
      toast.success('Status kepegawaian berhasil diperbarui');
      router.push('/hr/employment-statuses');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Gagal memperbarui status kepegawaian');
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Status Kepegawaian</h1>
        <p className="text-muted-foreground">Perbarui data status kepegawaian</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Status Kepegawaian</CardTitle>
        </CardHeader>
        <CardContent>
          <EmploymentStatusForm
            initialData={employmentStatus}
            onSubmit={handleSubmit}
            onCancel={() => router.push('/hr/employment-statuses')}
          />
        </CardContent>
      </Card>
    </div>
  );
}