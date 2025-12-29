'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { OutboundForm } from '@/components/inventory/stock-transactions';
import { ArrowLeft } from 'lucide-react';

export default function OutboundTransactionPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/inventory/stock-transactions">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Barang Keluar</h1>
          <p className="text-muted-foreground">
            Catat pengeluaran barang dari gudang
          </p>
        </div>
      </div>

      <OutboundForm />
    </div>
  );
}