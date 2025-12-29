'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { inventoryDashboardApi } from '@/lib/api/endpoints/inventory';
import type { RecentTransaction } from '@/lib/types/inventory';
import { TransactionType } from '@/lib/types/inventory';
import { toast } from 'sonner';
import { ArrowLeftRight, ExternalLink, History, ArrowDownCircle, ArrowUpCircle, RefreshCw, MoveRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

export function RecentTransactionsCard() {
  const [transactions, setTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await inventoryDashboardApi.getRecentTransactions();
        if (response.success && response.data) {
          setTransactions(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch recent transactions:', error);
        toast.error('Gagal memuat transaksi terbaru');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getTransactionBadge = (type: TransactionType) => {
    switch (type) {
      case TransactionType.INBOUND:
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <ArrowDownCircle className="h-3 w-3 mr-1" />
            Masuk
          </Badge>
        );
      case TransactionType.OUTBOUND:
        return (
          <Badge variant="destructive">
            <ArrowUpCircle className="h-3 w-3 mr-1" />
            Keluar
          </Badge>
        );
      case TransactionType.ADJUSTMENT:
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">
            <RefreshCw className="h-3 w-3 mr-1" />
            Penyesuaian
          </Badge>
        );
      case TransactionType.TRANSFER:
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">
            <MoveRight className="h-3 w-3 mr-1" />
            Transfer
          </Badge>
        );
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: id });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Transaksi Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Transaksi Terbaru
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ArrowLeftRight className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Belum ada transaksi</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-muted-foreground">
                      {transaction.transactionNumber}
                    </span>
                    {getTransactionBadge(transaction.transactionType)}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium truncate">{transaction.productName}</span>
                    <span className="text-muted-foreground">×</span>
                    <span className={`font-medium ${
                      transaction.transactionType === TransactionType.INBOUND 
                        ? 'text-green-600' 
                        : transaction.transactionType === TransactionType.OUTBOUND 
                          ? 'text-red-600' 
                          : ''
                    }`}>
                      {transaction.transactionType === TransactionType.INBOUND ? '+' : 
                       transaction.transactionType === TransactionType.OUTBOUND ? '-' : ''}
                      {transaction.quantity}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span>{transaction.warehouseName}</span>
                    <span>•</span>
                    <span>{formatDate(transaction.createdAt)}</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/inventory/stock-transactions/${transaction.id}`}>
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        )}
        
        {transactions.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/inventory/stock-transactions">
                Lihat Semua Transaksi
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}