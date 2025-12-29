'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CategoryForm } from '@/components/inventory/categories';
import { categoriesApi } from '@/lib/api/endpoints/inventory';
import { Category, CreateCategoryRequest } from '@/lib/types/inventory';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

function FormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

export default function EditCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await categoriesApi.getById(id);
        setCategory(response.data ?? null);
      } catch (error) {
        console.error('Failed to fetch category:', error);
        toast.error('Gagal memuat data kategori');
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id]);

  const handleSubmit = async (data: CreateCategoryRequest) => {
    try {
      await categoriesApi.update(id, data);
      toast.success('Kategori berhasil diperbarui');
      router.push('/inventory/categories');
    } catch (error) {
      console.error('Failed to update category:', error);
      toast.error('Gagal memperbarui kategori');
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
          <h1 className="text-3xl font-bold tracking-tight">Edit Kategori</h1>
          <p className="text-muted-foreground">
            Ubah informasi kategori
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <FormSkeleton />
          ) : category ? (
            <CategoryForm
              initialData={category}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Kategori tidak ditemukan
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}