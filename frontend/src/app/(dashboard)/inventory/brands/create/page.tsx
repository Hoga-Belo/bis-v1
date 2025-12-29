'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BrandForm } from '@/components/inventory/brands';
import { brandsApi } from '@/lib/api/endpoints/inventory';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function CreateBrandPage() {
  const router = useRouter();

  const handleSubmit = async (data: { code: string; name: string; description?: string | null }) => {
    try {
      await brandsApi.create({
        code: data.code,
        name: data.name,
        description: data.description || undefined,
      });
      toast.success('Merek berhasil dibuat');
      router.push('/inventory/brands');
    } catch (error) {
      console.error('Failed to create brand:', error);
      toast.error('Gagal membuat merek');
      throw error;
    }
  };

  const handleCancel = () => {
    router.push('/inventory/brands');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/inventory/brands">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tambah Merek</h1>
          <p className="text-muted-foreground">
            Buat merek produk baru
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Merek</CardTitle>
        </CardHeader>
        <CardContent>
          <BrandForm onSubmit={handleSubmit} onCancel={handleCancel} />
        </CardContent>
      </Card>
    </div>
  );
}