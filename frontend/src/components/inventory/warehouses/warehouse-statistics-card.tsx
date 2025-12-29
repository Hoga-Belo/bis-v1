'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Boxes, TrendingUp, AlertTriangle } from 'lucide-react';
import { warehousesApi } from '@/lib/api/endpoints/inventory';

interface WarehouseStatistics {
  totalProducts: number;
  totalStock: number;
}

interface WarehouseStatisticsCardProps {
  warehouseId: string;
}

export function WarehouseStatisticsCard({ warehouseId }: WarehouseStatisticsCardProps) {
  const [statistics, setStatistics] = useState<WarehouseStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await warehousesApi.getStatistics(warehouseId);
        if (response.data) {
          setStatistics(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch warehouse statistics:', err);
        setError('Gagal memuat statistik');
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [warehouseId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32 mt-2" />
            </CardContent>
          </Card>
        ))}
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

  if (!statistics) {
    return null;
  }

  const stats = [
    {
      title: 'Total Produk',
      value: statistics.totalProducts,
      description: 'Jenis produk tersimpan',
      icon: Package,
      color: 'text-blue-500',
    },
    {
      title: 'Total Stok',
      value: statistics.totalStock,
      description: 'Unit barang tersedia',
      icon: Boxes,
      color: 'text-green-500',
    },
    {
      title: 'Rata-rata Stok',
      value: statistics.totalProducts > 0 
        ? Math.round(statistics.totalStock / statistics.totalProducts) 
        : 0,
      description: 'Per jenis produk',
      icon: TrendingUp,
      color: 'text-purple-500',
    },
    {
      title: 'Kapasitas',
      value: '-',
      description: 'Belum dikonfigurasi',
      icon: Boxes,
      color: 'text-gray-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {typeof stat.value === 'number' 
                  ? stat.value.toLocaleString('id-ID') 
                  : stat.value}
              </div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Statistics Info */}
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Gudang</CardTitle>
          <CardDescription>
            Informasi statistik dan performa gudang
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Total Jenis Produk</span>
              <span className="font-medium">{statistics.totalProducts.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Total Unit Stok</span>
              <span className="font-medium">{statistics.totalStock.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Rata-rata Stok per Produk</span>
              <span className="font-medium">
                {statistics.totalProducts > 0 
                  ? Math.round(statistics.totalStock / statistics.totalProducts).toLocaleString('id-ID')
                  : 0}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Status Gudang</span>
              <span className="font-medium text-green-600">Aktif</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}