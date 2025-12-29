'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { inventoryDashboardApi } from '@/lib/api/endpoints/inventory';
import type { InventoryOverview } from '@/lib/types/inventory';
import { toast } from 'sonner';
import { Package, FolderTree, Tag, Warehouse } from 'lucide-react';

export function InventoryOverviewCard() {
  const [overview, setOverview] = useState<InventoryOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const response = await inventoryDashboardApi.getOverview();
        if (response.success && response.data) {
          setOverview(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch inventory overview:', error);
        toast.error('Gagal memuat ringkasan inventaris');
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Inventaris</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!overview) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Inventaris</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Gagal memuat data</p>
        </CardContent>
      </Card>
    );
  }

  const stats = [
    {
      label: 'Total Produk',
      value: overview.totalProducts,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Kategori',
      value: overview.totalCategories,
      icon: FolderTree,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Merek',
      value: overview.totalBrands,
      icon: Tag,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: 'Gudang',
      value: overview.totalWarehouses,
      icon: Warehouse,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ringkasan Inventaris</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-3 p-3 rounded-lg border"
            >
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}