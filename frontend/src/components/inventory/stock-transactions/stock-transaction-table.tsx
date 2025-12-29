
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  stockTransactionsApi,
  productsApi,
  warehousesApi,
} from '@/lib/api/endpoints/inventory';
import type {
  StockTransaction,
  Product,
  Warehouse,
  StockTransactionQueryParams,
  TransactionType,
  PaginationMeta,
} from '@/lib/types/inventory';
import { toast } from 'sonner';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCw,
  ArrowRightLeft,
} from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

// Transaction type badge colors
const transactionTypeBadge: Record<
  TransactionType,
  { label: string; className: string; icon: React.ReactNode }
> = {
  INBOUND: {
    label: 'Barang Masuk',
    className: 'bg-green-100 text-green-800 hover:bg-green-100',
    icon: <ArrowDownCircle className="h-3 w-3 mr-1" />,
  },
  OUTBOUND: {
    label: 'Barang Keluar',
    className: 'bg-red-100 text-red-800 hover:bg-red-100',
    icon: <ArrowUpCircle className="h-3 w-3 mr-1" />,
  },
  ADJUSTMENT: {
    label: 'Penyesuaian',
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
    icon: <RefreshCw className="h-3 w-3 mr-1" />,
  },
  TRANSFER: {
    label: 'Transfer',
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
    icon: <ArrowRightLeft className="h-3 w-3 mr-1" />,
  },
};

export function StockTransactionTable() {
  const router = useRouter();

  // State
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [transactionType, setTransactionType] = useState<string>('');
  const [productId, setProductId] = useState<string>('');
  const [warehouseId, setWarehouseId] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const params: StockTransactionQueryParams = {
        page,
        limit,
        search: search || undefined,
        transactionType: (transactionType as TransactionType) || undefined,
        productId: productId || undefined,
        warehouseId: warehouseId || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      };

      const response = await stockTransactionsApi.getAll(params);
      if (response.success && response.data) {
        setTransactions(response.data);
        if (response.meta) {
          setMeta(response.meta);
        }
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      toast.error('Gagal memuat data transaksi');
    } finally {
      setLoading(false);
    }
  }, [page, search, transactionType, productId, warehouseId, dateFrom, dateTo]);

  // Fetch filter options
  const fetchFilterOptions = useCallback(async () => {
    try {
      const [productsRes, warehousesRes] = await Promise.all([
        productsApi.getAll({ limit: 100 }),
        warehousesApi.getAll({ limit: 100 }),
      ]);

      if (productsRes.success && productsRes.data) {
        setProducts(productsRes.data);
      }
      if (warehousesRes.success && warehousesRes.data) {
        setWarehouses(warehousesRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch filter options:', error);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Format quantity with sign
  const formatQuantity = (transaction: StockTransaction) => {
    const { transactionType: type, quantity } = transaction;
    if (type === 'INBOUND' || type === 'TRANSFER') {
      return <span className="text-green-600 font-medium">+{quantity}</span>;
    } else if (type === 'OUTBOUND') {
      return <span className="text-red-600 font-medium">-{quantity}</span>;
    } else {
      // ADJUSTMENT can be positive or negative
      return quantity >= 0 ? (
        <span className="text-green-600 font-medium">+{quantity}</span>
      ) : (
        <span className="text-red-600 font-medium">{quantity}</span>
      );
    }
  };

  // Format warehouse display
  const formatWarehouse = (transaction: StockTransaction) => {
    if (transaction.transactionType === 'TRANSFER') {
      return (
        <div className="text-sm">
          <div>{transaction.warehouse?.name || '-'}</div>
          <div className="text-muted-foreground">
            → {transaction.targetWarehouse?.name || '-'}
          </div>
        </div>
      );
    }
    return transaction.warehouse?.name || '-';
  };

  // Pagination helpers
  const renderPagination = () => {
    if (!meta) return null;

    const { page: currentPage, totalPages } = meta;

    return (
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          Menampilkan {(currentPage - 1) * meta.limit + 1} -{' '}
          {Math.min(currentPage * meta.limit, meta.total)} dari {meta.total}{' '}
          transaksi
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Sebelumnya
          </Button>
          <div className="text-sm">
            Halaman {currentPage} dari {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Selanjutnya
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  // Loading skeleton
  if (loading && transactions.length === 0) {
    return (
      <div className="space-y-4">
        {/* Filters skeleton */}
        <div className="flex flex-wrap gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        {/* Table skeleton */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Transaksi</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Produk</TableHead>
                <TableHead>Gudang</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead>Referensi</TableHead>
                <TableHead className="w-16">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari no. transaksi atau referensi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={transactionType}
          onValueChange={(value) => {
            setTransactionType(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Semua Tipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Semua Tipe</SelectItem>
            <SelectItem value="INBOUND">Barang Masuk</SelectItem>
            <SelectItem value="OUTBOUND">Barang Keluar</SelectItem>
            <SelectItem value="ADJUSTMENT">Penyesuaian</SelectItem>
            <SelectItem value="TRANSFER">Transfer</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={productId}
          onValueChange={(value) => {
            setProductId(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Semua Produk" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Semua Produk</SelectItem>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.sku} - {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={warehouseId}
          onValueChange={(value) => {
            setWarehouseId(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Semua Gudang" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Semua Gudang</SelectItem>
            {warehouses.map((warehouse) => (
              <SelectItem key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="date"
          placeholder="Dari Tanggal"
          value={dateFrom}
          onChange={(e) => {
            setDateFrom(e.target.value);
            setPage(1);
          }}
          className="w-[150px]"
        />

        <Input
          type="date"
          placeholder="Sampai Tanggal"
          value={dateTo}
          onChange={(e) => {
            setDateTo(e.target.value);
            setPage(1);
          }}
          className="w-[150px]"
        />
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No. Transaksi</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>Produk</TableHead>
              <TableHead>Gudang</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead>Referensi</TableHead>
              <TableHead className="w-16">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <ArrowRightLeft className="h-8 w-8 mb-2" />
                    <p>Tidak ada transaksi ditemukan</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => {
                const typeBadge =
                  transactionTypeBadge[transaction.transactionType];
                return (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {transaction.transactionNumber}
                    </TableCell>
                    <TableCell>
                      {transaction.createdAt
                        ? format(
                            new Date(transaction.createdAt),
                            'dd MMM yyyy HH:mm',
                            { locale: localeId }
                          )
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={typeBadge.className}
                      >
                        {typeBadge.icon}
                        {typeBadge.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">
                          {transaction.product?.sku || '-'}
                        </div>
                        <div className="text-muted-foreground">
                          {transaction.product?.name || '-'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatWarehouse(transaction)}</TableCell>
                    <TableCell className="text-right">
                      {formatQuantity(transaction)}
                    </TableCell>
                    <TableCell>
                      {transaction.referenceNumber || '-'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          router.push(
                            `/inventory/stock-transactions/${transaction.id}`
                          )
                        }
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
}