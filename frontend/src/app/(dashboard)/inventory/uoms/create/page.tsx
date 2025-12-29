'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UomForm } from '@/components/inventory/uoms';
import { uomsApi } from '@/lib/api/endpoints/inventory';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function CreateUomPage() {
  const router = useRouter();

  const handleSubmit = async (data: { code: string; name: string; symbol: string; description?: string | null }) => {
    try {
      await uomsApi.create({
        code: data.code,
        name: data.name,
        symbol: data.symbol,
        description: data.description || undefined,
      });
      toast.success('Satuan berhasil dibuat');
      router.push('/inventory/uoms');
    } catch (error) {
      console.error('Failed to create UOM:', error);
      toast.error('Gagal membuat satuan');
      throw error;
    }
  };

  const handleCancel = () => {
    router.push('/inventory/uoms');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/inventory/uoms">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tambah Satuan</h1>
          <p className="text-muted-foreground">
            Buat satuan ukuran baru
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Satuan</CardTitle>
        </CardHeader>
        <CardContent>
          <UomForm onSubmit={handleSubmit} onCancel={handleCancel} />
        </CardContent>
      </Card>
    </div>
  );
}