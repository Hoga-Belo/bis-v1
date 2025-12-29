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
import { usePermissions } from '@/lib/hooks/use-permissions';
import { brandsApi } from '@/lib/api/endpoints/inventory';
import { Brand } from '@/lib/types/inventory';
import { toast } from 'sonner';
import { Pencil, Trash2, Search } from 'lucide-react';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function BrandTable() {
  const router = useRouter();
  const { can } = usePermissions();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);
  const [deleting, setDeleting] = useState(false);

  const canEdit = can('inventory:brand:update');
  const canDelete = can('inventory:brand:delete');

  const fetchBrands = useCallback(async () => {
    try {
      setLoading(true);
      const response = await brandsApi.getAll({
        page: meta.page,
        limit: meta.limit,
        search: search || undefined,
      });
      if (response.data) {
        setBrands(response.data);
      }
      if (response.meta) {
        setMeta(response.meta);
      }
    } catch (error) {
      console.error('Failed to fetch brands:', error);
      toast.error('Gagal memuat data merek');
    } finally {
      setLoading(false);
    }
  }, [meta.page, meta.limit, search]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setMeta((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setMeta((prev) => ({ ...prev, page: newPage }));
  };

  const handleEdit = (brand: Brand) => {
    router.push(`/inventory/brands/${brand.id}`);
  };

  const handleDeleteClick = (brand: Brand) => {
    setBrandToDelete(brand);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!brandToDelete) return;

    try {
      setDeleting(true);
      await brandsApi.delete(brandToDelete.id);
      toast.success('Merek berhasil dihapus');
      fetchBrands();
    } catch (error) {
      console.error('Failed to delete brand:', error);
      toast.error('Gagal menghapus merek');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setBrandToDelete(null);
    }
  };

  if (loading && brands.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-[300px]" />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead className="w-[100px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
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
      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari merek..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Deskripsi</TableHead>
              {(canEdit || canDelete) && (
                <TableHead className="w-[100px]">Aksi</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={canEdit || canDelete ? 4 : 3}
                  className="h-24 text-center"
                >
                  Tidak ada data merek
                </TableCell>
              </TableRow>
            ) : (
              brands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell className="font-medium">{brand.code}</TableCell>
                  <TableCell>{brand.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {brand.description || '-'}
                  </TableCell>
                  {(canEdit || canDelete) && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(brand)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(brand)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Menampilkan {(meta.page - 1) * meta.limit + 1} -{' '}
            {Math.min(meta.page * meta.limit, meta.total)} dari {meta.total} data
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(meta.page - 1)}
              disabled={meta.page <= 1}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(meta.page + 1)}
              disabled={meta.page >= meta.totalPages}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Merek</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus merek &quot;{brandToDelete?.name}&quot;?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
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