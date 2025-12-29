'use client';

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { History, ArrowDownCircle, ArrowUpCircle, ArrowRightLeft, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { productsApi } from '@/lib/api/endpoints/inventory';
import { TransactionType, type StockMovement } from '@/lib/types/inventory';
import type { PaginationMeta } from '@/lib/types/api';

interface ProductMovementHistoryProps {
  productId: string;
}

const transactionTypeConfig: Record<
  TransactionType,
  { label: string; icon: React.ReactNode; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  [TransactionType.INBOUND]: {
    label: 'Masuk',
    icon: <ArrowDownCircle className="h-4 w-4" />,
    variant: 'default',
  },
  [TransactionType.OUTBOUND]: {
    label: 'Keluar',
    icon: <ArrowUpCircle className="h-4 w-4" />,
    variant: 'destructive',
  },
  [TransactionType.TRANSFER]: {
    label: 'Transfer',
    icon: <ArrowRightLeft className="h-4 w-4" />,
    variant: 'secondary',
  },
  [TransactionType.ADJUSTMENT]: {
    label: 'Penyesuaian',
    icon: <Package className="h-4 w-4" />,
    variant: 'outline',
  },
};

export function ProductMovementHistory({ productId }: ProductMovementHistoryProps) {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const fetchMovements = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await productsApi.getMovementHistory(productId, { page, limit: 10 });
      if (response.success && response.data) {
        setMovements(response.data);
        if (response.meta) {
          setPagination(response.meta);
        }
      }
    } catch (error) {
      console.error('Failed to fetch movement history:', error);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  const handlePageChange = (newPage: number) => {
    fetchMovements(newPage);
  };

  const formatQuantity = (type: TransactionType, quantity: number): string => {
    if (type === TransactionType.INBOUND) {
      return `+${quantity.toLocaleString('id-ID')}`;
    } else if (type === TransactionType.OUTBOUND) {
      return `-${quantity.toLocaleString('id-ID')}`;
    }
    return quantity.toLocaleString('id-ID');
  };

  const getQuantityColor = (type: TransactionType): string => {
    if (type === TransactionType.INBOUND) {
      return 'text-green-600';
    } else if (type === TransactionType.OUTBOUND) {
      return 'text-red-600';
    }
    return '';
  };

  if (loading && movements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Riwayat Pergerakan Stok
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Riwayat Pergerakan Stok
        </CardTitle>
      </CardHeader>
      <CardContent>
        {movements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Belum ada riwayat pergerakan stok</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>No. Transaksi</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Gudang</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                  <TableHead>Referensi</TableHead>
                  <TableHead>Catatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((movement) => {
                  const config = transactionTypeConfig[movement.transactionType];
                  return (
                    <TableRow key={movement.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(movement.createdAt), 'dd MMM yyyy HH:mm', {
                          locale: localeId,
                        })}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {movement.transactionNumber}
                      </TableCell>
                      <TableCell>
                        <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
                          {config.icon}
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {movement.warehouseName}
                        {movement.targetWarehouseName && (
                          <span className="text-muted-foreground">
                            {' → '}{movement.targetWarehouseName}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${getQuantityColor(movement.transactionType)}`}>
                        {formatQuantity(movement.transactionType, movement.quantity)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {movement.referenceNumber || '-'}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground">
                        {movement.notes || '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Menampilkan {movements.length} dari {pagination.total} data
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1 || loading}
                  >
                    Sebelumnya
                  </Button>
                  <span className="text-sm">
                    Halaman {pagination.page} dari {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages || loading}
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}