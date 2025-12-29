
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { PermissionGate } from '@/components/auth';
import { usePermissions } from '@/lib/hooks/use-permissions';
import {
  productsApi,
  categoriesApi,
  brandsApi,
} from '@/lib/api/endpoints/inventory';
import type {
  Product,
  Category,
  Brand,
  ProductQueryParams,
  PaginationMeta,
} from '@/lib/types/inventory';
import { toast } from 'sonner';
import {
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Package,
  AlertTriangle,
} from 'lucide-react';

export function ProductTable() {
  const router = useRouter();
  const { can } = usePermissions();

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [brandId, setBrandId] = useState<string>('');
  const [isActive, setIsActive] = useState<string>('');
  const [isLowStock, setIsLowStock] = useState<string>('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params: ProductQueryParams = {
        page,
        limit,
        search: search || undefined,
        categoryId: categoryId || undefined,
        brandId: brandId || undefined,
        isActive: isActive === '' ? undefined : isActive === 'true',
        isLowStock: isLowStock === '' ? undefined : isLowStock === 'true',
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      };

      const response = await productsApi.getAll(params);
      if (response.success && response.data) {
        setProducts(response.data);
        if (response.meta) {
          setMeta(response.meta);
        }
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Gagal memuat data produk');
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryId, brandId, isActive, isLowStock]);

  // Fetch categories and brands for filters
  const fetchFilterOptions = useCallback(async () => {
    try {
      const [categoriesRes, brandsRes] = await Promise.all([
        categoriesApi.getAll({ limit: 100 }),
        brandsApi.getAll({ limit: 100 }),
      ]);

      if (categoriesRes.success && categoriesRes.data) {
        setCategories(categoriesRes.data);
      }
      if (brandsRes.success && brandsRes.data) {
        setBrands(brandsRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch filter options:', error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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

  // Handle delete
  const handleDelete = async () => {
    if (!productToDelete) return;

    try {
      setDeleting(true);
      const response = await productsApi.delete(productToDelete.id);
      if (response.success) {
        toast.success('Produk berhasil dihapus');
        fetchProducts();
      } else {
        toast.error(response.message || 'Gagal menghapus produk');
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error('Gagal menghapus produk');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  // Pagination helpers
  const renderPagination = () => {
    if (!meta) return null;

    const { page: currentPage, totalPages } = meta;

    return (
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          Menampilkan {(currentPage - 1) * meta.limit + 1} -{' '}
          {Math.min(currentPage * meta.limit, meta.total)} dari {meta.total} produk
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
  if (loading && products.length === 0) {
    return (
      <div className="space-y-4">
        {/* Filters skeleton */}
        <div className="flex flex-wrap gap-4">
          <Skeleton className="h-10 w-64" />
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
                <TableHead className="w-16">Foto</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Merek</TableHead>
                <TableHead>Satuan</TableHead>
                <TableHead className="text-right">Min Stok</TableHead>
                <TableHead className="text-right">Total Stok</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-16">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-10 w-10 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-16" />
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
            placeholder="Cari SKU atau nama..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={categoryId} onValueChange={(value) => { setCategoryId(value); setPage(1); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Semua Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Semua Kategori</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={brandId} onValueChange={(value) => { setBrandId(value); setPage(1); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Semua Merek" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Semua Merek</SelectItem>
            {brands.map((brand) => (
              <SelectItem key={brand.id} value={brand.id}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={isActive} onValueChange={(value) => { setIsActive(value); setPage(1); }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Semua Status</SelectItem>
            <SelectItem value="true">Aktif</SelectItem>
            <SelectItem value="false">Tidak Aktif</SelectItem>
          </SelectContent>
        </Select>

        <Select value={isLowStock} onValueChange={(value) => { setIsLowStock(value); setPage(1); }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Semua Stok" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Semua Stok</SelectItem>
            <SelectItem value="true">Stok Rendah</SelectItem>
            <SelectItem value="false">Stok Normal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Foto</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Merek</TableHead>
              <TableHead>Satuan</TableHead>
              <TableHead className="text-right">Min Stok</TableHead>
              <TableHead className="text-right">Total Stok</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-16">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Package className="h-8 w-8 mb-2" />
                    <p>Tidak ada produk ditemukan</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow
                  key={product.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/inventory/products/${product.id}`)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={product.photoUrl} alt={product.name} />
                      <AvatarFallback>
                        <Package className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    {product.category && (
                      <Badge variant={product.category.type === 'FIXED' ? 'default' : 'secondary'}>
                        {product.category.name}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{product.brand?.name || '-'}</TableCell>
                  <TableCell>{product.uom?.symbol || product.uom?.name || '-'}</TableCell>
                  <TableCell className="text-right">{product.minStock}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {product.isLowStock && (
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      )}
                      <span className={product.isLowStock ? 'text-destructive font-medium' : ''}>
                        {product.totalStock ?? 0}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.isActive ? 'default' : 'secondary'}>
                      {product.isActive ? 'Aktif' : 'Tidak Aktif'}
                    </Badge>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    {(can('inventory:product:update') || can('inventory:product:delete')) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Aksi</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <PermissionGate permissions={['inventory:product:update']}>
                            <DropdownMenuItem
                              onClick={() => router.push(`/inventory/products/${product.id}/edit`)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          </PermissionGate>
                          <PermissionGate permissions={['inventory:product:delete']}>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setProductToDelete(product);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Hapus
                            </DropdownMenuItem>
                          </PermissionGate>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {renderPagination()}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Produk</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus produk &quot;{productToDelete?.name}&quot;?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}