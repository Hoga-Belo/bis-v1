'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/components/auth/permission-gate';
import { StockTransactionTable } from '@/components/inventory/stock-transactions';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  Settings2,
} from 'lucide-react';

export default function StockTransactionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transaksi Stok</h1>
          <p className="text-muted-foreground">
            Kelola transaksi stok barang masuk, keluar, transfer, dan penyesuaian
          </p>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <PermissionGate permissions={['inventory:stock:create']}>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/inventory/stock-transactions/inbound">
              <ArrowDownToLine className="mr-2 h-4 w-4" />
              Barang Masuk
            </Link>
          </Button>
        </PermissionGate>

        <PermissionGate permissions={['inventory:stock:create']}>
          <Button asChild variant="destructive">
            <Link href="/inventory/stock-transactions/outbound">
              <ArrowUpFromLine className="mr-2 h-4 w-4" />
              Barang Keluar
            </Link>
          </Button>
        </PermissionGate>

        <PermissionGate permissions={['inventory:stock:create']}>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/inventory/stock-transactions/transfer">
              <ArrowLeftRight className="mr-2 h-4 w-4" />
              Transfer
            </Link>
          </Button>
        </PermissionGate>

        <PermissionGate permissions={['inventory:stock:create']}>
          <Button asChild className="bg-yellow-600 hover:bg-yellow-700">
            <Link href="/inventory/stock-transactions/adjustment">
              <Settings2 className="mr-2 h-4 w-4" />
              Penyesuaian
            </Link>
          </Button>
        </PermissionGate>
      </div>

      {/* Transaction Table */}
      <StockTransactionTable />
    </div>
  );
}