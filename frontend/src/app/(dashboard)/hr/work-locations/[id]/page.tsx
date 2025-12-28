'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { WorkLocationForm } from '@/components/hr/work-locations';
import { workLocationsApi } from '@/lib/api/endpoints/hr';
import type { WorkLocation, UpdateWorkLocationDto, CreateWorkLocationDto } from '@/lib/types/hr';

export default function EditWorkLocationPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [workLocation, setWorkLocation] = useState<WorkLocation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkLocation = async () => {
      try {
        const response = await workLocationsApi.getById(id);
        if (response.success && response.data) {
          setWorkLocation(response.data);
        }
      } catch {
        toast.error('Gagal memuat data lokasi kerja');
        router.push('/hr/work-locations');
      } finally {
        setLoading(false);
      }
    };
    fetchWorkLocation();
  }, [id, router]);

  const handleSubmit = async (data: CreateWorkLocationDto | UpdateWorkLocationDto) => {
    try {
      await workLocationsApi.update(id, data as UpdateWorkLocationDto);
      toast.success('Lokasi kerja berhasil diperbarui');
      router.push('/hr/work-locations');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Gagal memperbarui lokasi kerja');
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
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Lokasi Kerja</h1>
        <p className="text-muted-foreground">Perbarui data lokasi kerja</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Lokasi Kerja</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkLocationForm
            initialData={workLocation}
            onSubmit={handleSubmit}
            onCancel={() => router.push('/hr/work-locations')}
          />
        </CardContent>
      </Card>
    </div>
  );
}