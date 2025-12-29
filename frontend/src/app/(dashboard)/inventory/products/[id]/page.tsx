'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { PermissionGate } from '@/components/auth';
import {
  ProductPhotoUpload,
  ProductStockCard,
  ProductMovementHistory,
} from '@/components/inventory/products';
import { productsApi } from '@/lib/api/endpoints/inventory';
import type { Product } from '@/lib/types/inventory';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Package,
  Pencil,
  Trash2,
  Info,
  Boxes,
  History,
  ImagePlus,
} from 'lucide-react';

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const response = await productsApi.getById(id);
      if (response.success && response.data) {
        setProduct(response.data);
      } else {
        toast.error('Produk tidak ditemukan');
        router.push('/inventory/products');
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
      toast.error('Gagal memuat data produk');
      router.push('/inventory/products');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const response = await productsApi.delete(id);
      if (response.success) {
        toast.success('Produk berhasil dihapus');
        router.push('/inventory/products');
      } else {
        toast.error(response.message || 'Gagal menghapus produk');
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error('Gagal menghapus produk');
    } finally {
      setDeleting(false);
    }
  };

  const handlePhotoUploadSuccess = (url: string) => {
    setShowPhotoUpload(false);
    if (product) {
      setProduct({ ...product, photoUrl: url });
    }
    toast.success('Foto produk berhasil diperbarui');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/inventory/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
              <p className="text-muted-foreground">SKU: {product.sku}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PermissionGate permissions={['inventory:product:update']}>
            <Button variant="outline" asChild>
              <Link href={`/inventory/products/${id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
          </PermissionGate>
          <PermissionGate permissions={['inventory:product:delete']}>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={deleting}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus Produk</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah Anda yakin ingin menghapus produk &quot;{product.name}&quot;?
                    Tindakan ini tidak dapat dibatalkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={deleting}>
                    {deleting ? 'Menghapus...' : 'Hapus'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </PermissionGate>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Photo Section */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Foto Produk</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              {showPhotoUpload ? (
                <ProductPhotoUpload
                  productId={product.id}
                  currentPhotoUrl={product.photoUrl}
                  onUploadSuccess={handlePhotoUploadSuccess}
                />
              ) : (
                <>
                  <Avatar className="h-48 w-48">
                    <AvatarImage src={product.photoUrl} alt={product.name} />
                    <AvatarFallback className="text-4xl">
                      {product.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <PermissionGate permissions={['inventory:product:update']}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPhotoUpload(true)}
                    >
                      <ImagePlus className="mr-2 h-4 w-4" />
                      {product.photoUrl ? 'Ganti Foto' : 'Upload Foto'}
                    </Button>
                  </PermissionGate>
                </>
              )}
              {showPhotoUpload && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPhotoUpload(false)}
                >
                  Batal
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="info" className="space-y-4">
            <TabsList>
              <TabsTrigger value="info" className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                Informasi
              </TabsTrigger>
              <TabsTrigger value="stock" className="flex items-center gap-2">
                <Boxes className="h-4 w-4" />
                Stok
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Riwayat
              </TabsTrigger>
            </TabsList>

            {/* Info Tab */}
            <TabsContent value="info">
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Produk</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">SKU</dt>
                      <dd className="text-sm font-mono">{product.sku}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Nama Produk</dt>
                      <dd className="text-sm">{product.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Kategori</dt>
                      <dd className="text-sm flex items-center gap-2">
                        {product.category?.name || '-'}
                        {product.category && (
                          <Badge variant={product.category.type === 'FIXED' ? 'default' : 'secondary'}>
                            {product.category.type === 'FIXED' ? 'Aset Tetap' : 'Habis Pakai'}
                          </Badge>
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Merek</dt>
                      <dd className="text-sm">{product.brand?.name || '-'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Satuan</dt>
                      <dd className="text-sm">
                        {product.uom ? `${product.uom.name} (${product.uom.symbol})` : '-'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Stok Minimum</dt>
                      <dd className="text-sm">{product.minStock}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                      <dd className="text-sm">
                        <Badge variant={product.isActive ? 'default' : 'secondary'}>
                          {product.isActive ? 'Aktif' : 'Tidak Aktif'}
                        </Badge>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Total Stok</dt>
                      <dd className="text-sm">
                        <span className={(product.totalStock ?? 0) < product.minStock ? 'text-destructive font-medium' : ''}>
                          {product.totalStock ?? 0} {product.uom?.symbol || ''}
                        </span>
                        {(product.totalStock ?? 0) < product.minStock && (
                          <Badge variant="destructive" className="ml-2">
                            Stok Rendah
                          </Badge>
                        )}
                      </dd>
                    </div>
                    {product.description && (
                      <div className="md:col-span-2">
                        <dt className="text-sm font-medium text-muted-foreground">Deskripsi</dt>
                        <dd className="text-sm whitespace-pre-wrap">{product.description}</dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Stock Tab */}
            <TabsContent value="stock">
              <ProductStockCard product={product} />
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history">
              <ProductMovementHistory productId={product.id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}