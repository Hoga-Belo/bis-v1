'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PermissionGate } from '@/components/auth';
import { JobGradeTable } from '@/components/hr/job-grades';
import { jobGradesApi } from '@/lib/api/endpoints/hr';
import type { JobGrade, HrQueryParams } from '@/lib/types/hr';

export default function JobGradesPage() {
  const router = useRouter();
  const [jobGrades, setJobGrades] = useState<JobGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchJobGrades = useCallback(async () => {
    try {
      setLoading(true);
      const params: HrQueryParams = {
        page: pagination.page,
        limit: pagination.limit,
        search: search || undefined,
        sortBy: 'code',
        sortOrder: 'ASC',
      };
      const response = await jobGradesApi.getAll(params);
      if (response.success) {
        // Transform interceptor flattens { data, meta } to { success, data, meta }
        // So response.data is the array and response.meta is at top level
        const jobGrades = Array.isArray(response.data)
          ? response.data
          : (response.data as { data: JobGrade[] })?.data ?? [];
        const meta = (response as { meta?: { total: number; totalPages: number } }).meta;
        
        setJobGrades(jobGrades);
        if (meta) {
          setPagination((prev) => ({
            ...prev,
            total: meta.total,
            totalPages: meta.totalPages,
          }));
        }
      }
    } catch (error) {
      toast.error('Gagal memuat data golongan');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchJobGrades();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchJobGrades]);

  const handleDelete = async (id: string) => {
    try {
      await jobGradesApi.delete(id);
      toast.success('Golongan berhasil dihapus');
      fetchJobGrades();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Gagal menghapus golongan');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Golongan</h1>
          <p className="text-muted-foreground">Kelola data golongan dan rentang gaji</p>
        </div>
        <PermissionGate permissions={['hr:job-grade:create']}>
          <Button onClick={() => router.push('/hr/job-grades/create')}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Golongan
          </Button>
        </PermissionGate>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Golongan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari golongan..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="pl-9"
              />
            </div>
          </div>
          <JobGradeTable
            data={jobGrades}
            loading={loading}
            pagination={pagination}
            onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
            onEdit={(id) => router.push(`/hr/job-grades/${id}`)}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </div>
  );
}