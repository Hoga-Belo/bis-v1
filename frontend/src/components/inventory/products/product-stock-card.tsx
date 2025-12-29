'use client';

import { AlertTriangle, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Product } from '@/lib/types/inventory';

interface ProductStockCardProps {
  product: Product;
}

export function ProductStockCard({ product }: ProductStockCardProps) {
  const totalStock = product.totalStock ?? 0;
  const isLowStock = product.isLowStock ?? (totalStock < product.minStock);
  const uomSymbol = product.uom?.symbol || '';
  const stockBreakdown = product.stockBreakdown || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Informasi Stok
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Stock Summary */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Total Stok</p>
            <p className={`text-3xl font-bold ${isLowStock ? 'text-destructive' : ''}`}>
              {totalStock.toLocaleString('id-ID')} {uomSymbol}
            </p>
          </div>
          {isLowStock && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Stok Rendah
            </Badge>
          )}
        </div>

        {/* Min Stock Info */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Stok Minimum</span>
          <span className="font-medium">
            {product.minStock.toLocaleString('id-ID')} {uomSymbol}
          </span>
        </div>

        {/* Stock Breakdown by Warehouse */}
        {stockBreakdown.length > 0 ? (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Stok per Gudang</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gudang</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockBreakdown.map((stock) => (
                  <TableRow key={stock.warehouseId}>
                    <TableCell>{stock.warehouseName}</TableCell>
                    <TableCell className="text-right font-medium">
                      {stock.quantity.toLocaleString('id-ID')} {uomSymbol}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Belum ada stok di gudang manapun</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}