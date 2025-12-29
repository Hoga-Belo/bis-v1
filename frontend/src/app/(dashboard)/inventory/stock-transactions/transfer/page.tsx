'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TransferForm } from '@/components/inventory/stock-transactions';
import { ArrowLeft } from 'lucide-react';

export default function TransferTransactionPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/inventory/stock-transactions">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transfer Stok</h1>
          <p className="text-muted-foreground">
            Pindahkan barang antar gudang
          </p>
        </div>
      </div>

      <TransferForm />
    </div>
  );
}