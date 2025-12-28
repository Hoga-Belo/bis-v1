'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PositionForm } from '@/components/hr/positions';
import { positionsApi } from '@/lib/api/endpoints/hr';
import type { Position, UpdatePositionDto } from '@/lib/types/hr';

export default function EditPositionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [position, setPosition] = useState<Position | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosition = async () => {
      try {
        const response = await positionsApi.getById(id);
        if (response.success && response.data) {
          setPosition(response.data);
        }
      } catch {
        toast.error('Gagal memuat data jabatan');
        router.push('/hr/positions');
      } finally {
        setLoading(false);
      }
    };
    fetchPosition();
  }, [id, router]);

  const handleSubmit = async (data: UpdatePositionDto) => {
    try {
      await positionsApi.update(id, data);
      toast.success('Jabatan berhasil diperbarui');
      router.push('/hr/positions');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Gagal memperbarui jabatan');
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
        <h1 className="text-2xl font-bold">Edit Jabatan</h1>
        <p className="text-muted-foreground">Perbarui data jabatan</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Jabatan</CardTitle>
        </CardHeader>
        <CardContent>
          <PositionForm
            initialData={position}
            onSubmit={handleSubmit}
            onCancel={() => router.push('/hr/positions')}
          />
        </CardContent>
      </Card>
    </div>
  );
}