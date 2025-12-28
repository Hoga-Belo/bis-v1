'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PermissionGate } from '@/components/auth';
import { DepartmentTable } from '@/components/hr/departments';
import { departmentsApi, divisionsApi } from '@/lib/api/endpoints/hr';
import type { Department, Division, DepartmentQueryParams } from '@/lib/types/hr';

export default function DepartmentsPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [divisionFilter, setDivisionFilter] = useState<string>('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Fetch divisions for filter dropdown
  useEffect(() => {
    const fetchDivisions = async () => {
      try {
        const response = await divisionsApi.getAll({ limit: 100 });
        if (response.success && response.data) {
          setDivisions(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch divisions:', error);
      }
    };
    fetchDivisions();
  }, []);

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const params: DepartmentQueryParams = {
        page: pagination.page,
        limit: pagination.limit,
        search: search || undefined,
        divisionId: divisionFilter !== 'all' ? divisionFilter : undefined,
        sortBy: 'name',
        sortOrder: 'ASC',
      };
      const response = await departmentsApi.getAll(params);
      if (response.success && response.data) {
        const responseData = response.data;
        setDepartments(responseData.data);
        setPagination((prev) => ({
          ...prev,
          total: responseData.meta.total,
          totalPages: responseData.meta.totalPages,
        }));
      }
    } catch (error) {
      toast.error('Gagal memuat data departemen');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, divisionFilter]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchDepartments();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchDepartments]);

  const handleDelete = async (id: string) => {
    try {
      await departmentsApi.delete(id);
      toast.success('Departemen berhasil dihapus');
      fetchDepartments();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Gagal menghapus departemen');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Departemen</h1>
          <p className="text-muted-foreground">
            Kelola data departemen perusahaan
          </p>
        </div>
        <PermissionGate permissions={['hr:department:create']}>
          <Button onClick={() => router.push('/hr/departments/create')}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Departemen
          </Button>
        </PermissionGate>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Departemen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari departemen..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="pl-9"
              />
            </div>
            <Select
              value={divisionFilter}
              onValueChange={(value) => {
                setDivisionFilter(value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter Divisi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Divisi</SelectItem>
                {divisions.map((division) => (
                  <SelectItem key={division.id} value={division.id}>
                    {division.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DepartmentTable
            data={departments}
            loading={loading}
            pagination={pagination}
            onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
            onEdit={(id) => router.push(`/hr/departments/${id}`)}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </div>
  );
}