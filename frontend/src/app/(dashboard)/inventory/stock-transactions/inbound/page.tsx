'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { InboundForm } from '@/components/inventory/stock-transactions';
import { ArrowLeft } from 'lucide-react';

export default function InboundTransactionPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/inventory/stock-transactions">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Barang Masuk</h1>
          <p className="text-muted-foreground">
            Catat penerimaan barang ke gudang
          </p>
        </div>
      </div>

      <InboundForm />
    </div>
  );
}