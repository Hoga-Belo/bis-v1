'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { UomForm } from '@/components/inventory/uoms';
import { uomsApi } from '@/lib/api/endpoints/inventory';
import { Uom } from '@/lib/types/inventory';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function EditUomPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [uom, setUom] = useState<Uom | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUom = async () => {
      try {
        const response = await uomsApi.getById(id);
        setUom(response.data ?? null);
      } catch (error) {
        console.error('Failed to fetch UOM:', error);
        toast.error('Gagal memuat data satuan');
        router.push('/inventory/uoms');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUom();
  }, [id, router]);

  const handleSubmit = async (data: { code: string; name: string; symbol: string; description?: string | null }) => {
    setIsSubmitting(true);
    try {
      await uomsApi.update(id, {
        code: data.code,
        name: data.name,
        symbol: data.symbol,
        description: data.description || undefined,
      });
      toast.success('Satuan berhasil diperbarui');
      router.push('/inventory/uoms');
    } catch (error) {
      console.error('Failed to update UOM:', error);
      toast.error('Gagal memperbarui satuan');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/inventory/uoms');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
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

  if (!uom) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/inventory/uoms">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Satuan</h1>
          <p className="text-muted-foreground">
            Edit data satuan ukuran
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Satuan</CardTitle>
        </CardHeader>
        <CardContent>
          <UomForm
            initialData={uom}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}