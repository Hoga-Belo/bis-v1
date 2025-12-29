'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StockTransactionDetailCard } from '@/components/inventory/stock-transactions';
import { stockTransactionsApi } from '@/lib/api/endpoints/inventory';
import { StockTransaction } from '@/lib/types/inventory';
import { ArrowLeft } from 'lucide-react';

export default function StockTransactionDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [transaction, setTransaction] = useState<StockTransaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        setIsLoading(true);
        const response = await stockTransactionsApi.getById(id);
        setTransaction(response.data ?? null);
      } catch (error) {
        console.error('Error fetching transaction:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchTransaction();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/inventory/stock-transactions">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Transaksi Tidak Ditemukan</h1>
            <p className="text-muted-foreground">
              Transaksi dengan ID tersebut tidak ditemukan
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/inventory/stock-transactions">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {transaction.transactionNumber}
          </h1>
          <p className="text-muted-foreground">
            Detail transaksi stok
          </p>
        </div>
      </div>

      <StockTransactionDetailCard transaction={transaction} />
    </div>
  );
}