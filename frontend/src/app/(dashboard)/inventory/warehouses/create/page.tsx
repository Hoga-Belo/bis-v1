'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WarehouseForm } from '@/components/inventory/warehouses';
import { warehousesApi } from '@/lib/api/endpoints/inventory';

export default function CreateWarehousePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      await warehousesApi.create(apiData);
      toast.success('Gudang berhasil dibuat');
      router.push('/inventory/warehouses');
    } catch (error) {
      console.error('Failed to create warehouse:', error);
      toast.error('Gagal membuat gudang');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/inventory/warehouses');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/inventory/warehouses">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tambah Gudang</h1>
          <p className="text-muted-foreground">
            Buat gudang baru untuk menyimpan produk
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Gudang</CardTitle>
        </CardHeader>
        <CardContent>
          <WarehouseForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}