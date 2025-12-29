'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2, MapPin, User, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { PermissionGate } from '@/components/auth/permission-gate';
import { WarehouseStockSummary, WarehouseStatisticsCard } from '@/components/inventory/warehouses';
import { warehousesApi } from '@/lib/api/endpoints/inventory';
import { Warehouse } from '@/lib/types/inventory';

export default function WarehouseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchWarehouse = async () => {
      try {
        setLoading(true);
        const response = await warehousesApi.getById(id);
        if (response.data) {
          setWarehouse(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch warehouse:', error);
        toast.error('Gagal memuat data gudang');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchWarehouse();
    }
  }, [id]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await warehousesApi.delete(id);
      toast.success('Gudang berhasil dihapus');
      router.push('/inventory/warehouses');
    } catch (error) {
      console.error('Failed to delete warehouse:', error);
      toast.error('Gagal menghapus gudang');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!warehouse) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/inventory/warehouses">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gudang Tidak Ditemukan</h1>
            <p className="text-muted-foreground">
              Gudang yang Anda cari tidak ditemukan
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/inventory/warehouses">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{warehouse.name}</h1>
              <Badge variant={warehouse.isActive ? 'default' : 'secondary'}>
                {warehouse.isActive ? 'Aktif' : 'Tidak Aktif'}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Kode: {warehouse.code}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PermissionGate permissions={['inventory:warehouse:update']}>
            <Button variant="outline" asChild>
              <Link href={`/inventory/warehouses/${id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
          </PermissionGate>
          <PermissionGate permissions={['inventory:warehouse:delete']}>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={deleting}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {deleting ? 'Menghapus...' : 'Hapus'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus Gudang</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah Anda yakin ingin menghapus gudang &quot;{warehouse.name}&quot;?
                    Tindakan ini tidak dapat dibatalkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Hapus
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </PermissionGate>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Informasi</TabsTrigger>
          <TabsTrigger value="stock">Stok</TabsTrigger>
          <TabsTrigger value="statistics">Statistik</TabsTrigger>
        </TabsList>

        {/* Info Tab */}
        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Gudang</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Code */}
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Kode</p>
                  <p className="text-lg font-semibold">{warehouse.code}</p>
                </div>

                {/* Name */}
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Nama</p>
                  <p className="text-lg font-semibold">{warehouse.name}</p>
                </div>

                {/* Work Location */}
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Lokasi Kerja</p>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <p className="text-lg">
                      {warehouse.workLocation?.name || '-'}
                    </p>
                  </div>
                </div>

                {/* PIC Employee */}
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Penanggung Jawab (PIC)</p>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <p className="text-lg">
                      {warehouse.picEmployee
                        ? `${warehouse.picEmployee.nik} - ${warehouse.picEmployee.fullName}`
                        : '-'}
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={warehouse.isActive ? 'default' : 'secondary'}>
                    {warehouse.isActive ? 'Aktif' : 'Tidak Aktif'}
                  </Badge>
                </div>

                {/* Created At */}
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Dibuat</p>
                  <p className="text-lg">
                    {new Date(warehouse.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Address */}
              {warehouse.address && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Alamat</p>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <p className="text-lg">{warehouse.address}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stock Tab */}
        <TabsContent value="stock" className="space-y-4">
          <WarehouseStockSummary warehouseId={id} />
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics" className="space-y-4">
          <WarehouseStatisticsCard warehouseId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}