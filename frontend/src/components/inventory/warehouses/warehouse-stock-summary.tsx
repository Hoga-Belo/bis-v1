'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Package, AlertTriangle, Boxes } from 'lucide-react';
import { warehousesApi } from '@/lib/api/endpoints/inventory';
import { Stock } from '@/lib/types/inventory';

interface WarehouseStockSummaryProps {
  warehouseId: string;
}

export function WarehouseStockSummary({ warehouseId }: WarehouseStockSummaryProps) {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await warehousesApi.getStock(warehouseId);
        if (response.data) {
          setStocks(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch warehouse stocks:', err);
        setError('Gagal memuat data stok');
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, [warehouseId]);

  // Calculate summary statistics
  const totalProducts = stocks.length;
  const totalQuantity = stocks.reduce((sum, stock) => sum + stock.quantity, 0);
  const lowStockProducts = stocks.filter((stock) => {
    const minStock = stock.product?.minStock || 0;
    return stock.quantity <= minStock && minStock > 0;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-destructive" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Jenis produk tersimpan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stok</CardTitle>
            <Boxes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuantity.toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground">
              Unit barang
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stok Rendah</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {lowStockProducts.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Produk perlu restock
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stock Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>Rincian Stok</CardTitle>
          <CardDescription>
            Daftar produk dan jumlah stok di gudang ini
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stocks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Belum ada stok di gudang ini</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Nama Produk</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                  <TableHead>Satuan</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stocks.map((stock) => {
                  const minStock = stock.product?.minStock || 0;
                  const isLowStock = stock.quantity <= minStock && minStock > 0;
                  
                  return (
                    <TableRow key={stock.id}>
                      <TableCell className="font-mono text-sm">
                        {stock.product?.sku || '-'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {stock.product?.name || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {stock.quantity.toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell>
                        {stock.product?.uom?.name || stock.product?.uom?.code || '-'}
                      </TableCell>
                      <TableCell>
                        {isLowStock ? (
                          <Badge variant="destructive">Stok Rendah</Badge>
                        ) : (
                          <Badge variant="secondary">Normal</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}