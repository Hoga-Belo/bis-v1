'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryForm } from '@/components/inventory/categories';
import { categoriesApi } from '@/lib/api/endpoints/inventory';
import { CreateCategoryRequest } from '@/lib/types/inventory';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function CreateCategoryPage() {
  const router = useRouter();

  const handleSubmit = async (data: CreateCategoryRequest) => {
    try {
      await categoriesApi.create(data);
      toast.success('Kategori berhasil dibuat');
      router.push('/inventory/categories');
    } catch (error) {
      console.error('Failed to create category:', error);
      toast.error('Gagal membuat kategori');
      throw error;
    }
  };

  const handleCancel = () => {
    router.push('/inventory/categories');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/inventory/categories">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tambah Kategori</h1>
          <p className="text-muted-foreground">
            Buat kategori baru untuk produk atau aset
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryForm onSubmit={handleSubmit} onCancel={handleCancel} />
        </CardContent>
      </Card>
    </div>
  );
}