'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PermissionGate } from '@/components/auth';
import { DivisionTable } from '@/components/hr/divisions';
import { divisionsApi } from '@/lib/api/endpoints/hr';
import type { Division, HrQueryParams } from '@/lib/types/hr';

export default function DivisionsPage() {
  const router = useRouter();
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchDivisions = useCallback(async () => {
    try {
      setLoading(true);
      const params: HrQueryParams = {
        page: pagination.page,
        limit: pagination.limit,
        search: search || undefined,
        sortBy: 'name',
        sortOrder: 'ASC',
      };
      const response = await divisionsApi.getAll(params);
      if (response.success) {
        // Transform interceptor flattens { data, meta } to { success, data, meta }
        // So response.data is the array and response.meta is at top level
        const divisions = Array.isArray(response.data)
          ? response.data
          : (response.data as { data: Division[] })?.data ?? [];
        const meta = (response as { meta?: { total: number; totalPages: number } }).meta;
        
        setDivisions(divisions);
        if (meta) {
          setPagination((prev) => ({
            ...prev,
            total: meta.total,
            totalPages: meta.totalPages,
          }));
        }
      }
    } catch (error) {
      toast.error('Gagal memuat data divisi');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchDivisions();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchDivisions]);

  const handleDelete = async (id: string) => {
    try {
      await divisionsApi.delete(id);
      toast.success('Divisi berhasil dihapus');
      fetchDivisions();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Gagal menghapus divisi');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Divisi</h1>
          <p className="text-muted-foreground">Kelola data divisi perusahaan</p>
        </div>
        <PermissionGate permissions={['hr:division:create']}>
          <Button onClick={() => router.push('/hr/divisions/create')}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Divisi
          </Button>
        </PermissionGate>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Divisi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari divisi..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="pl-9"
              />
            </div>
          </div>
          <DivisionTable
            data={divisions}
            loading={loading}
            pagination={pagination}
            onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
            onEdit={(id) => router.push(`/hr/divisions/${id}`)}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </div>
  );
}