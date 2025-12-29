'use client';

import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { UomTable } from '@/components/inventory/uoms';
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
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function UomsPage() {
  const { can } = usePermissions();
  const canCreate = can('inventory:uom:create');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Satuan</h1>
          <p className="text-muted-foreground">
            Kelola data satuan (Unit of Measure)
          </p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/inventory/uoms/create">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Satuan
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Satuan</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<TableSkeleton />}>
            <UomTable />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}