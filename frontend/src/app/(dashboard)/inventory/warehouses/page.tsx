'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/components/auth/permission-gate';
import { WarehouseTable } from '@/components/inventory/warehouses';

export default function WarehousesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gudang</h1>
          <p className="text-muted-foreground">
            Kelola data gudang dan lokasi penyimpanan
          </p>
        </div>
        <PermissionGate permissions={['inventory:warehouse:create']}>
          <Button asChild>
            <Link href="/inventory/warehouses/create">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Gudang
            </Link>
          </Button>
        </PermissionGate>
      </div>

      <WarehouseTable />
    </div>
  );
}