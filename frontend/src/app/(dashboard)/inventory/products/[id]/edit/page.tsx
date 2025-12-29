'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductForm } from '@/components/inventory/products';
import { productsApi } from '@/lib/api/endpoints/inventory';
import { Product } from '@/lib/types/inventory';
import { ArrowLeft, Package } from 'lucide-react';
import { toast } from 'sonner';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productsApi.getById(id);
        setProduct(response.data ?? null);
      } catch (error) {
        console.error('Failed to fetch product:', error);
        toast.error('Gagal memuat data produk');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="max-w-4xl space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/inventory/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Produk Tidak Ditemukan</h1>
        </div>
        <p className="text-muted-foreground">
          Produk yang Anda cari tidak ditemukan atau telah dihapus.
        </p>
        <Button asChild>
          <Link href="/inventory/products">Kembali ke Daftar Produk</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/inventory/products/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Edit Produk</h1>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl">
        <ProductForm product={product} isEditing />
      </div>
    </div>
  );
}