'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DepartmentForm } from '@/components/hr/departments';
import { departmentsApi } from '@/lib/api/endpoints/hr';
import type { Department, UpdateDepartmentDto } from '@/lib/types/hr';

export default function EditDepartmentPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        const response = await departmentsApi.getById(id);
        if (response.success && response.data) {
          setDepartment(response.data);
        }
      } catch {
        toast.error('Gagal memuat data departemen');
        router.push('/hr/departments');
      } finally {
        setLoading(false);
      }
    };
    fetchDepartment();
  }, [id, router]);

  const handleSubmit = async (data: UpdateDepartmentDto) => {
    try {
      await departmentsApi.update(id, data);
      toast.success('Departemen berhasil diperbarui');
      router.push('/hr/departments');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Gagal memperbarui departemen');
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
        <h1 className="text-2xl font-bold">Edit Departemen</h1>
        <p className="text-muted-foreground">Perbarui data departemen</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Departemen</CardTitle>
        </CardHeader>
        <CardContent>
          <DepartmentForm
            initialData={department}
            onSubmit={handleSubmit}
            onCancel={() => router.push('/hr/departments')}
          />
        </CardContent>
      </Card>
    </div>
  );
}