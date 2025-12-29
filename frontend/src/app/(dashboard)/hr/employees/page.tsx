'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmployeeTable } from '@/components/hr/employees';
import {
  employeesApi,
  divisionsApi,
  departmentsApi,
  positionsApi,
} from '@/lib/api/endpoints/hr';
import type {
  Employee,
  Division,
  Department,
  Position,
  EmployeeStatusType,
  Gender,
  EmployeeQueryParams,
} from '@/lib/types/hr';

interface Filters {
  search: string;
  departmentId?: string;
  divisionId?: string;
  positionId?: string;
  employeeStatus?: EmployeeStatusType;
  gender?: Gender;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    search: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Fetch filter options (divisions, departments, positions)
  const fetchFilterOptions = useCallback(async () => {
    try {
      const [divisionsRes, departmentsRes, positionsRes] = await Promise.all([
        divisionsApi.getAll({ limit: 100 }),
        departmentsApi.getAll({ limit: 100 }),
        positionsApi.getAll({ limit: 100 }),
      ]);

      // Transform interceptor flattens { data, meta } to { success, data, meta }
      // So response.data is the array and response.meta is at top level
      if (divisionsRes.success) {
        const divisions = Array.isArray(divisionsRes.data)
          ? divisionsRes.data
          : (divisionsRes.data as { data: Division[] })?.data ?? [];
        setDivisions(divisions);
      }
      if (departmentsRes.success) {
        const departments = Array.isArray(departmentsRes.data)
          ? departmentsRes.data
          : (departmentsRes.data as { data: Department[] })?.data ?? [];
        setDepartments(departments);
      }
      if (positionsRes.success) {
        const positions = Array.isArray(positionsRes.data)
          ? positionsRes.data
          : (positionsRes.data as { data: Position[] })?.data ?? [];
        setPositions(positions);
      }
    } catch (error) {
      console.error('Failed to fetch filter options:', error);
    }
  }, []);

  // Fetch employees
  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const params: EmployeeQueryParams = {
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search || undefined,
        departmentId: filters.departmentId,
        divisionId: filters.divisionId,
        positionId: filters.positionId,
        employeeStatus: filters.employeeStatus,
        gender: filters.gender,
        sortBy: 'fullName',
        sortOrder: 'ASC',
      };

      const response = await employeesApi.getAll(params);
      if (response.success) {
        // Transform interceptor flattens { data, meta } to { success, data, meta }
        // So response.data is the array and response.meta is at top level
        const employees = Array.isArray(response.data)
          ? response.data
          : (response.data as { data: Employee[] })?.data ?? [];
        const meta = (response as { meta?: { total: number; totalPages: number } }).meta;
        
        setEmployees(employees);
        if (meta) {
          setPagination((prev) => ({
            ...prev,
            total: meta.total,
            totalPages: meta.totalPages,
          }));
        }
      }
    } catch (error) {
      toast.error('Gagal memuat data karyawan');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [
    pagination.page,
    pagination.limit,
    filters.search,
    filters.departmentId,
    filters.divisionId,
    filters.positionId,
    filters.employeeStatus,
    filters.gender,
  ]);

  // Initial load - fetch filter options
  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  // Fetch employees when filters or pagination change
  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchEmployees();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchEmployees]);

  const handleDelete = async (id: string) => {
    try {
      await employeesApi.delete(id);
      toast.success('Karyawan berhasil dihapus');
      fetchEmployees();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Gagal menghapus karyawan');
    }
  };

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (newFilters: {
    departmentId?: string;
    divisionId?: string;
    positionId?: string;
    employeeStatus?: EmployeeStatusType;
    gender?: Gender;
  }) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Karyawan</h1>
        <p className="text-muted-foreground">
          Kelola data karyawan perusahaan
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Karyawan</CardTitle>
        </CardHeader>
        <CardContent>
          <EmployeeTable
            employees={employees}
            isLoading={loading}
            onDelete={handleDelete}
            pagination={pagination}
            onPageChange={handlePageChange}
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            filters={filters}
            divisions={divisions}
            departments={departments}
            positions={positions}
          />
        </CardContent>
      </Card>
    </div>
  );
}