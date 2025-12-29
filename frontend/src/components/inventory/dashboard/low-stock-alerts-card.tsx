'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { inventoryDashboardApi } from '@/lib/api/endpoints/inventory';
import type { LowStockAlert } from '@/lib/types/inventory';
import { toast } from 'sonner';
import { AlertTriangle, ExternalLink, Package } from 'lucide-react';

export function LowStockAlertsCard() {
  const [alerts, setAlerts] = useState<LowStockAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await inventoryDashboardApi.getLowStockAlerts();
        if (response.success && response.data) {
          setAlerts(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch low stock alerts:', error);
        toast.error('Gagal memuat peringatan stok rendah');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getUrgencyBadge = (currentStock: number, minStock: number) => {
    const percentage = (currentStock / minStock) * 100;
    
    if (currentStock === 0) {
      return <Badge variant="destructive">Habis</Badge>;
    } else if (percentage <= 25) {
      return <Badge variant="destructive">Kritis</Badge>;
    } else if (percentage <= 50) {
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Rendah</Badge>;
    } else {
      return <Badge className="bg-orange-500 hover:bg-orange-600">Perhatian</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Peringatan Stok Rendah
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          Peringatan Stok Rendah
          {alerts.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {alerts.length} produk
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="h-12 w-12 text-green-500 mb-3" />
            <p className="text-muted-foreground">Semua stok dalam kondisi baik</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {alerts.map((alert) => (
              <div
                key={alert.productId}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                      <Link
                        href={`/inventory/products/${alert.productId}`}
                        className="font-medium text-sm hover:underline truncate"
                      >
                        {alert.productName}
                      </Link>
                      {getUrgencyBadge(alert.currentStock, alert.minStock)}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>SKU: {alert.productSku}</span>
                      <span>
                        Stok: <span className="font-medium text-red-600">{alert.currentStock}</span> / {alert.minStock}
                      </span>
                    </div>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/inventory/products/${alert.productId}`}>
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        )}
        
        {alerts.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/inventory/products?lowStock=true">
                Lihat Semua Produk Stok Rendah
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}