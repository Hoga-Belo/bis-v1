'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { JobGradeForm } from '@/components/hr/job-grades';
import { jobGradesApi } from '@/lib/api/endpoints/hr';
import type { JobGrade, UpdateJobGradeDto } from '@/lib/types/hr';

export default function EditJobGradePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [jobGrade, setJobGrade] = useState<JobGrade | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobGrade = async () => {
      try {
        const response = await jobGradesApi.getById(id);
        if (response.success && response.data) {
          setJobGrade(response.data);
        }
      } catch {
        toast.error('Gagal memuat data golongan');
        router.push('/hr/job-grades');
      } finally {
        setLoading(false);
      }
    };
    fetchJobGrade();
  }, [id, router]);

  const handleSubmit = async (data: UpdateJobGradeDto) => {
    try {
      await jobGradesApi.update(id, data);
      toast.success('Golongan berhasil diperbarui');
      router.push('/hr/job-grades');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Gagal memperbarui golongan');
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
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Golongan</h1>
        <p className="text-muted-foreground">Perbarui data golongan</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Golongan</CardTitle>
        </CardHeader>
        <CardContent>
          <JobGradeForm
            initialData={jobGrade}
            onSubmit={handleSubmit}
            onCancel={() => router.push('/hr/job-grades')}
          />
        </CardContent>
      </Card>
    </div>
  );
}