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
import { Pencil, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { usePermissions } from '@/lib/hooks/use-permissions';
import { uomsApi } from '@/lib/api/endpoints/inventory';
import type { Uom, PaginationMeta } from '@/lib/types/inventory';

export function UomTable() {
  const router = useRouter();
  const { can } = usePermissions();
  const [uoms, setUoms] = useState<Uom[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const canEdit = can('inventory:uom:update');
  const canDelete = can('inventory:uom:delete');

  const fetchUoms = useCallback(async () => {
    try {
      setLoading(true);
      const response = await uomsApi.getAll({
        page,
        limit: 10,
        search: search || undefined,
      });
      if (response.data) {
        setUoms(response.data);
      }
      if (response.meta) {
        setMeta(response.meta);
      }
    } catch (error) {
      console.error('Failed to fetch UOMs:', error);
      toast.error('Gagal memuat data satuan');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchUoms();
  }, [fetchUoms]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleEdit = (id: string) => {
    router.push(`/inventory/uoms/${id}`);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleting(true);
      await uomsApi.delete(deleteId);
      toast.success('Satuan berhasil dihapus');
      fetchUoms();
    } catch (error) {
      console.error('Failed to delete UOM:', error);
      toast.error('Gagal menghapus satuan');
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  if (loading && uoms.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Simbol</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead className="w-[100px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-20" /></TableCell>
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
            placeholder="Cari kode atau nama..."
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
              <TableHead>Simbol</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead className="w-[100px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {uoms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Tidak ada data satuan
                </TableCell>
              </TableRow>
            ) : (
              uoms.map((uom) => (
                <TableRow key={uom.id}>
                  <TableCell className="font-medium">{uom.code}</TableCell>
                  <TableCell>{uom.name}</TableCell>
                  <TableCell className="font-mono">{uom.symbol}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {uom.description || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(uom.id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(uom.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
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
            Menampilkan {((meta.page - 1) * meta.limit) + 1} - {Math.min(meta.page * meta.limit, meta.total)} dari {meta.total} data
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Halaman {meta.page} dari {meta.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === meta.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Satuan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus satuan ini? Tindakan ini tidak dapat dibatalkan.
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