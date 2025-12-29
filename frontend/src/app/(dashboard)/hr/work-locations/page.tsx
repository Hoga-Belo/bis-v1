'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PermissionGate } from '@/components/auth';
import { WorkLocationTable } from '@/components/hr/work-locations';
import { workLocationsApi } from '@/lib/api/endpoints/hr';
import type { WorkLocation } from '@/lib/types/hr';

export default function WorkLocationsPage() {
  const router = useRouter();
  const [data, setData] = useState<WorkLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await workLocationsApi.getAll({
        page,
        limit: 10,
        search: search || undefined,
      });
      if (response.success) {
        // Transform interceptor flattens { data, meta } to { success, data, meta }
        // So response.data is the array and response.meta is at top level
        const locations = Array.isArray(response.data)
          ? response.data
          : (response.data as { data: WorkLocation[] })?.data ?? [];
        const meta = (response as { meta?: { totalPages: number } }).meta;
        
        setData(locations);
        if (meta) {
          setTotalPages(meta.totalPages);
        }
      }
    } catch (error) {
      console.error('Failed to fetch work locations:', error);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lokasi Kerja</h1>
          <p className="text-muted-foreground">
            Kelola data lokasi kerja
          </p>
        </div>
        <PermissionGate permissions={['hr:work-location:create']}>
          <Button onClick={() => router.push('/hr/work-locations/create')}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Lokasi
          </Button>
        </PermissionGate>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Lokasi Kerja</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari lokasi kerja..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <WorkLocationTable
            data={data}
            loading={loading}
            onRefresh={fetchData}
          />

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Sebelumnya
              </Button>
              <span className="text-sm text-muted-foreground">
                Halaman {page} dari {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Selanjutnya
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}