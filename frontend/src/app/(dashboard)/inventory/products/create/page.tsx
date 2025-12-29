'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProductForm } from '@/components/inventory/products';
import { ArrowLeft, Package } from 'lucide-react';

export default function CreateProductPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/inventory/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <Package className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tambah Produk</h1>
            <p className="text-muted-foreground">
              Buat produk baru untuk inventaris
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl">
        <ProductForm />
      </div>
    </div>
  );
}