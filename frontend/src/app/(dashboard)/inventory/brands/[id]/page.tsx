'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BrandForm } from '@/components/inventory/brands';
import { brandsApi } from '@/lib/api/endpoints/inventory';
import { Brand } from '@/lib/types/inventory';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function EditBrandPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [brand, setBrand] = useState<Brand | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        const response = await brandsApi.getById(id);
        setBrand(response.data ?? null);
      } catch (error) {
        console.error('Failed to fetch brand:', error);
        toast.error('Gagal memuat data merek');
        router.push('/inventory/brands');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrand();
  }, [id, router]);

  const handleSubmit = async (data: { code: string; name: string; description?: string | null }) => {
    setIsSubmitting(true);
    try {
      await brandsApi.update(id, {
        name: data.name,
        description: data.description || undefined,
      });
      toast.success('Merek berhasil diperbarui');
      router.push('/inventory/brands');
    } catch (error) {
      console.error('Failed to update brand:', error);
      toast.error('Gagal memperbarui merek');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/inventory/brands');
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
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/inventory/brands">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Merek</h1>
          <p className="text-muted-foreground">
            Perbarui informasi merek {brand?.name}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Merek</CardTitle>
        </CardHeader>
        <CardContent>
          <BrandForm
            initialData={brand || undefined}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}