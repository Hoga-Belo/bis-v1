'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PermissionGate } from '@/components/auth';
import { PositionTable } from '@/components/hr/positions';
import { positionsApi } from '@/lib/api/endpoints/hr';
import type { Position, HrQueryParams } from '@/lib/types/hr';

export default function PositionsPage() {
  const router = useRouter();
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchPositions = useCallback(async () => {
    try {
      setLoading(true);
      const params: HrQueryParams = {
        page: pagination.page,
        limit: pagination.limit,
        search: search || undefined,
        sortBy: 'level',
        sortOrder: 'ASC',
      };
      const response = await positionsApi.getAll(params);
      if (response.success && response.data) {
        const responseData = response.data;
        setPositions(responseData.data);
        setPagination((prev) => ({
          ...prev,
          total: responseData.meta.total,
          totalPages: responseData.meta.totalPages,
        }));
      }
    } catch (error) {
      toast.error('Gagal memuat data jabatan');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchPositions();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchPositions]);

  const handleDelete = async (id: string) => {
    try {
      await positionsApi.delete(id);
      toast.success('Jabatan berhasil dihapus');
      fetchPositions();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Gagal menghapus jabatan');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Jabatan</h1>
          <p className="text-muted-foreground">Kelola data jabatan perusahaan</p>
        </div>
        <PermissionGate permissions={['hr:position:create']}>
          <Button onClick={() => router.push('/hr/positions/create')}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Jabatan
          </Button>
        </PermissionGate>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Jabatan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari jabatan..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="pl-9"
              />
            </div>
          </div>
          <PositionTable
            data={positions}
            loading={loading}
            pagination={pagination}
            onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
            onEdit={(id) => router.push(`/hr/positions/${id}`)}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </div>
  );
}