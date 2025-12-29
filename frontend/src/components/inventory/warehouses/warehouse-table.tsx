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
import { warehousesApi } from '@/lib/api/endpoints/inventory';
import type {
  Warehouse,
  WarehouseQueryParams,
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
  Warehouse as WarehouseIcon,
} from 'lucide-react';

export function WarehouseTable() {
  const router = useRouter();
  const { can } = usePermissions();

  // State
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [isActive, setIsActive] = useState<string>('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [warehouseToDelete, setWarehouseToDelete] = useState<Warehouse | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch warehouses
  const fetchWarehouses = useCallback(async () => {
    try {
      setLoading(true);
      const params: WarehouseQueryParams = {
        page,
        limit,
        search: search || undefined,
        isActive: isActive === '' ? undefined : isActive === 'true',
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      };

      const response = await warehousesApi.getAll(params);
      if (response.success && response.data) {
        setWarehouses(response.data);
        if (response.meta) {
          setMeta(response.meta);
        }
      }
    } catch (error) {
      console.error('Failed to fetch warehouses:', error);
      toast.error('Gagal memuat data gudang');
    } finally {
      setLoading(false);
    }
  }, [page, search, isActive]);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Handle delete
  const handleDelete = async () => {
    if (!warehouseToDelete) return;

    try {
      setDeleting(true);
      const response = await warehousesApi.delete(warehouseToDelete.id);
      if (response.success) {
        toast.success('Gudang berhasil dihapus');
        fetchWarehouses();
      } else {
        toast.error(response.message || 'Gagal menghapus gudang');
      }
    } catch (error) {
      console.error('Failed to delete warehouse:', error);
      toast.error('Gagal menghapus gudang');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setWarehouseToDelete(null);
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
          {Math.min(currentPage * meta.limit, meta.total)} dari {meta.total} gudang
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
  if (loading && warehouses.length === 0) {
    return (
      <div className="space-y-4">
        {/* Filters skeleton */}
        <div className="flex flex-wrap gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        {/* Table skeleton */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Lokasi Kerja</TableHead>
                <TableHead>PIC</TableHead>
                <TableHead>Alamat</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-16">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-36" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
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
            placeholder="Cari kode atau nama..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

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
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Lokasi Kerja</TableHead>
              <TableHead>PIC</TableHead>
              <TableHead>Alamat</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-16">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {warehouses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <WarehouseIcon className="h-8 w-8 mb-2" />
                    <p>Tidak ada gudang ditemukan</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              warehouses.map((warehouse) => (
                <TableRow
                  key={warehouse.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/inventory/warehouses/${warehouse.id}`)}
                >
                  <TableCell className="font-mono text-sm">{warehouse.code}</TableCell>
                  <TableCell className="font-medium">{warehouse.name}</TableCell>
                  <TableCell>{warehouse.workLocation?.name || '-'}</TableCell>
                  <TableCell>
                    {warehouse.picEmployee
                      ? `${warehouse.picEmployee.nik} - ${warehouse.picEmployee.fullName}`
                      : '-'}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {warehouse.address || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={warehouse.isActive ? 'default' : 'secondary'}>
                      {warehouse.isActive ? 'Aktif' : 'Tidak Aktif'}
                    </Badge>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    {(can('inventory:warehouse:update') || can('inventory:warehouse:delete')) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Aksi</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <PermissionGate permissions={['inventory:warehouse:update']}>
                            <DropdownMenuItem
                              onClick={() => router.push(`/inventory/warehouses/${warehouse.id}/edit`)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          </PermissionGate>
                          <PermissionGate permissions={['inventory:warehouse:delete']}>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setWarehouseToDelete(warehouse);
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
            <AlertDialogTitle>Hapus Gudang</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus gudang &quot;{warehouseToDelete?.name}&quot;?
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