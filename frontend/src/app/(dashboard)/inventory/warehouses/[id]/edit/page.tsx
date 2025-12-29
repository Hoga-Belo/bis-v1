'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { WarehouseForm } from '@/components/inventory/warehouses';
import { warehousesApi } from '@/lib/api/endpoints/inventory';
import { Warehouse } from '@/lib/types/inventory';

export default function EditWarehousePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchWarehouse = async () => {
      try {
        setLoading(true);
        const response = await warehousesApi.getById(id);
        if (response.data) {
          setWarehouse(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch warehouse:', error);
        toast.error('Gagal memuat data gudang');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchWarehouse();
    }
  }, [id]);

  const handleSubmit = async (data: {
    code: string;
    name: string;
    workLocationId?: string | null;
    picEmployeeId?: string | null;
    address?: string | null;
    isActive: boolean;
  }) => {
    try {
      setIsSubmitting(true);
      // Transform null values to undefined for API compatibility
      const apiData = {
        code: data.code,
        name: data.name,
        isActive: data.isActive,
        workLocationId: data.workLocationId ?? undefined,
        picEmployeeId: data.picEmployeeId ?? undefined,
        address: data.address ?? undefined,
      };
      await warehousesApi.update(id, apiData);
      toast.success('Gudang berhasil diperbarui');
      router.push(`/inventory/warehouses/${id}`);
    } catch (error) {
      console.error('Failed to update warehouse:', error);
      toast.error('Gagal memperbarui gudang');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/inventory/warehouses/${id}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
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

  if (!warehouse) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/inventory/warehouses">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gudang Tidak Ditemukan</h1>
            <p className="text-muted-foreground">
              Gudang yang Anda cari tidak ditemukan
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/inventory/warehouses/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Gudang</h1>
          <p className="text-muted-foreground">
            Edit informasi gudang {warehouse.name}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Gudang</CardTitle>
        </CardHeader>
        <CardContent>
          <WarehouseForm
            initialData={warehouse}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}