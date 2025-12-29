'use client';

import { usePermissions } from '@/lib/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CategoryTable } from '@/components/inventory/categories';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

function CategoryTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="rounded-md border">
        <div className="h-[400px] p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const { can } = usePermissions();
  const canCreate = can('inventory:category:create');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kategori</h1>
          <p className="text-muted-foreground">
            Kelola kategori produk dan aset
          </p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/inventory/categories/create">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Kategori
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<CategoryTableSkeleton />}>
            <CategoryTable />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}