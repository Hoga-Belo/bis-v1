'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/components/auth';
import { 
  Zap, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  RefreshCw, 
  MoveRight, 
  Plus,
  Package
} from 'lucide-react';

export function QuickActionsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Aksi Cepat
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Transaction Actions */}
        <div className="grid grid-cols-2 gap-3">
          <PermissionGate permissions={['inventory:stock-transaction:create']}>
            <Button
              className="w-full bg-green-500 hover:bg-green-600 text-white"
              asChild
            >
              <Link href="/inventory/stock-transactions/inbound">
                <ArrowDownCircle className="h-4 w-4 mr-2" />
                Barang Masuk
              </Link>
            </Button>
          </PermissionGate>

          <PermissionGate permissions={['inventory:stock-transaction:create']}>
            <Button
              variant="destructive"
              className="w-full"
              asChild
            >
              <Link href="/inventory/stock-transactions/outbound">
                <ArrowUpCircle className="h-4 w-4 mr-2" />
                Barang Keluar
              </Link>
            </Button>
          </PermissionGate>

          <PermissionGate permissions={['inventory:stock-transaction:create']}>
            <Button
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              asChild
            >
              <Link href="/inventory/stock-transactions/transfer">
                <MoveRight className="h-4 w-4 mr-2" />
                Transfer
              </Link>
            </Button>
          </PermissionGate>

          <PermissionGate permissions={['inventory:stock-transaction:create']}>
            <Button
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
              asChild
            >
              <Link href="/inventory/stock-transactions/adjustment">
                <RefreshCw className="h-4 w-4 mr-2" />
                Penyesuaian
              </Link>
            </Button>
          </PermissionGate>
        </div>

        {/* Separator */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Lainnya
            </span>
          </div>
        </div>

        {/* Other Actions */}
        <div className="grid grid-cols-2 gap-3">
          <PermissionGate permissions={['inventory:product:create']}>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/inventory/products/create">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Produk
              </Link>
            </Button>
          </PermissionGate>

          <PermissionGate permissions={['inventory:product:read']}>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/inventory/products">
                <Package className="h-4 w-4 mr-2" />
                Daftar Produk
              </Link>
            </Button>
          </PermissionGate>
        </div>
      </CardContent>
    </Card>
  );
}