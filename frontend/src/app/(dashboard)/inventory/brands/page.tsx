'use client';

import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BrandTable } from '@/components/inventory/brands';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { usePermissions } from '@/lib/hooks/use-permissions';

function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-64" />
      </div>
      <div className="rounded-md border">
        <div className="h-[400px] p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BrandsPage() {
  const { can } = usePermissions();
  const canCreate = can('inventory:brand:create');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Merek</h1>
          <p className="text-muted-foreground">
            Kelola data merek produk
          </p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/inventory/brands/create">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Merek
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Merek</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<TableSkeleton />}>
            <BrandTable />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}