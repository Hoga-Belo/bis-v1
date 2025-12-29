'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { inventoryDashboardApi } from '@/lib/api/endpoints/inventory';
import type { StockSummary, StockByCategory } from '@/lib/types/inventory';
import { CategoryType } from '@/lib/types/inventory';
import { toast } from 'sonner';
import { Package, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';

export function StockSummaryCard() {
  const [stockSummary, setStockSummary] = useState<StockSummary | null>(null);
  const [stockByCategory, setStockByCategory] = useState<StockByCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryResponse, categoryResponse] = await Promise.all([
          inventoryDashboardApi.getStockSummary(),
          inventoryDashboardApi.getStockByCategory(),
        ]);

        if (summaryResponse.success && summaryResponse.data) {
          setStockSummary(summaryResponse.data);
        }
        if (categoryResponse.success && categoryResponse.data) {
          setStockByCategory(categoryResponse.data);
        }
      } catch (error) {
        console.error('Failed to fetch stock summary:', error);
        toast.error('Gagal memuat ringkasan stok');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Stok</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!stockSummary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Stok</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Gagal memuat data</p>
        </CardContent>
      </Card>
    );
  }

  const totalProducts = stockSummary.totalItems;
  const healthyPercentage = totalProducts > 0 
    ? Math.round((stockSummary.healthyStockCount / totalProducts) * 100) 
    : 0;
  const lowStockPercentage = totalProducts > 0 
    ? Math.round((stockSummary.lowStockCount / totalProducts) * 100) 
    : 0;
  const outOfStockPercentage = totalProducts > 0 
    ? Math.round((stockSummary.outOfStockCount / totalProducts) * 100) 
    : 0;

  // Calculate stock by category type
  const fixedStock = stockByCategory
    .filter((c) => c.categoryType === CategoryType.FIXED)
    .reduce((sum, c) => sum + c.totalStock, 0);
  const consumableStock = stockByCategory
    .filter((c) => c.categoryType === CategoryType.CONSUMABLE)
    .reduce((sum, c) => sum + c.totalStock, 0);
  const totalStock = fixedStock + consumableStock;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ringkasan Stok</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stock Status */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Status Stok</h4>
          
          <div className="flex items-center gap-3">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span>Stok Sehat</span>
                <span className="font-medium">{stockSummary.healthyStockCount} produk</span>
              </div>
              <Progress value={healthyPercentage} className="h-2 bg-gray-200" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span>Stok Rendah</span>
                <span className="font-medium">{stockSummary.lowStockCount} produk</span>
              </div>
              <Progress value={lowStockPercentage} className="h-2 bg-gray-200" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <XCircle className="h-4 w-4 text-red-600" />
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span>Stok Habis</span>
                <span className="font-medium">{stockSummary.outOfStockCount} produk</span>
              </div>
              <Progress value={outOfStockPercentage} className="h-2 bg-gray-200" />
            </div>
          </div>
        </div>

        {/* Stock by Category Type */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Stok per Tipe Kategori</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg border bg-blue-50">
              <div className="flex items-center gap-2 mb-1">
                <Package className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Aset Tetap</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{fixedStock.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">
                {totalStock > 0 ? Math.round((fixedStock / totalStock) * 100) : 0}% dari total
              </p>
            </div>

            <div className="p-3 rounded-lg border bg-green-50">
              <div className="flex items-center gap-2 mb-1">
                <Package className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Habis Pakai</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{consumableStock.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">
                {totalStock > 0 ? Math.round((consumableStock / totalStock) * 100) : 0}% dari total
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}