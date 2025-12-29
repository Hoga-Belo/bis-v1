'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Pencil, Trash2, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { usePermissions } from '@/lib/hooks/use-permissions';
import { categoriesApi } from '@/lib/api/endpoints/inventory';
import { toast } from 'sonner';
import type { Category, CategoryType, PaginationMeta } from '@/lib/types/inventory';

const getCategoryTypeBadge = (type: CategoryType) => {
  switch (type) {
    case 'FIXED':
      return <Badge variant="default">Aset Tetap</Badge>;
    case 'CONSUMABLE':
      return <Badge variant="secondary">Barang Habis Pakai</Badge>;
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
};

export function CategoryTable() {
  const router = useRouter();
  const { can } = usePermissions();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const canEdit = can('inventory:category:update');
  const canDelete = can('inventory:category:delete');

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await categoriesApi.getAll({
        page: meta.page,
        limit: meta.limit,
        search: search || undefined,
        type: typeFilter !== 'all' ? (typeFilter as CategoryType) : undefined,
      });
      if (response.data) {
        setCategories(response.data);
      }
      if (response.meta) {
        setMeta(response.meta);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Gagal memuat data kategori');
    } finally {
      setLoading(false);
    }
  }, [meta.page, meta.limit, search, typeFilter]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setMeta((prev) => ({ ...prev, page: 1 }));
  };

  const handleTypeFilter = (value: string) => {
    setTypeFilter(value);
    setMeta((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setMeta((prev) => ({ ...prev, page: newPage }));
  };

  const handleEdit = (id: string) => {
    router.push(`/inventory/categories/${id}`);
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;

    setIsDeleting(true);
    try {
      await categoriesApi.delete(selectedCategory.id);
      toast.success('Kategori berhasil dihapus');
      fetchCategories();
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast.error('Gagal menghapus kategori');
    } finally {
      setIsDeleting(false);
      setSelectedCategory(null);
    }
  };

  if (loading && categories.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari kategori..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={handleTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter tipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Tipe</SelectItem>
            <SelectItem value="FIXED">Aset Tetap</SelectItem>
            <SelectItem value="CONSUMABLE">Barang Habis Pakai</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">Tidak ada data kategori</p>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead className="w-[70px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.code}</TableCell>
                    <TableCell>{category.name}</TableCell>
                    <TableCell>{getCategoryTypeBadge(category.type)}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {category.description || '-'}
                    </TableCell>
                    <TableCell>
                      {(canEdit || canDelete) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {canEdit && (
                              <DropdownMenuItem onClick={() => handleEdit(category.id)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            {canDelete && (
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  setSelectedCategory(category);
                                  setShowDeleteDialog(true);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4">
              <p className="text-sm text-muted-foreground">
                Menampilkan {(meta.page - 1) * meta.limit + 1} -{' '}
                {Math.min(meta.page * meta.limit, meta.total)} dari{' '}
                {meta.total} kategori
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(meta.page - 1)}
                  disabled={meta.page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Sebelumnya
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      const current = meta.page;
                      return (
                        page === 1 ||
                        page === meta.totalPages ||
                        (page >= current - 1 && page <= current + 1)
                      );
                    })
                    .map((page, index, array) => {
                      const showEllipsis = index > 0 && page - array[index - 1] > 1;
                      return (
                        <span key={page} className="flex items-center">
                          {showEllipsis && (
                            <span className="px-2 text-muted-foreground">...</span>
                          )}
                          <Button
                            variant={page === meta.page ? 'default' : 'outline'}
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </Button>
                        </span>
                      );
                    })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(meta.page + 1)}
                  disabled={meta.page >= meta.totalPages}
                >
                  Selanjutnya
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kategori</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus kategori{' '}
              <strong>{selectedCategory?.name}</strong>? Tindakan ini tidak dapat
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}