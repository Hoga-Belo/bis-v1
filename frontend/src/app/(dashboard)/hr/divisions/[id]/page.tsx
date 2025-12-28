'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DivisionForm } from '@/components/hr/divisions';
import { divisionsApi } from '@/lib/api/endpoints/hr';
import type { Division, UpdateDivisionDto } from '@/lib/types/hr';

export default function EditDivisionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [division, setDivision] = useState<Division | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDivision = async () => {
      try {
        const response = await divisionsApi.getById(id);
        if (response.success && response.data) {
          setDivision(response.data);
        }
      } catch {
        toast.error('Gagal memuat data divisi');
        router.push('/hr/divisions');
      } finally {
        setLoading(false);
      }
    };
    fetchDivision();
  }, [id, router]);

  const handleSubmit = async (data: UpdateDivisionDto) => {
    try {
      await divisionsApi.update(id, data);
      toast.success('Divisi berhasil diperbarui');
      router.push('/hr/divisions');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Gagal memperbarui divisi');
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
        <h1 className="text-2xl font-bold">Edit Divisi</h1>
        <p className="text-muted-foreground">Perbarui data divisi</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Divisi</CardTitle>
        </CardHeader>
        <CardContent>
          <DivisionForm
            initialData={division}
            onSubmit={handleSubmit}
            onCancel={() => router.push('/hr/divisions')}
          />
        </CardContent>
      </Card>
    </div>
  );
}