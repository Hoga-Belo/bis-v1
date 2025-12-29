'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/components/auth';
import { ProductTable } from '@/components/inventory/products';
import { Package, Plus } from 'lucide-react';

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Produk</h1>
            <p className="text-muted-foreground">
              Kelola data produk inventaris
            </p>
          </div>
        </div>
        <PermissionGate permissions={['inventory:product:create']}>
          <Button asChild>
            <Link href="/inventory/products/create">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Produk
            </Link>
          </Button>
        </PermissionGate>
      </div>

      {/* Product Table */}
      <ProductTable />
    </div>
  );
}