'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { EmployeeForm } from '@/components/hr/employees';
import { employeesApi } from '@/lib/api/endpoints/hr';
import type { Employee, CreateEmployeeDto } from '@/lib/types/hr';

interface EditEmployeePageProps {
  params: Promise<{ id: string }>;
}

export default function EditEmployeePage({ params }: EditEmployeePageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await employeesApi.getById(id);
        if (response.success && response.data) {
          setEmployee(response.data);
        } else {
          toast.error('Gagal memuat data karyawan');
          router.push('/hr/employees');
        }
      } catch (error) {
        console.error('Failed to fetch employee:', error);
        toast.error('Gagal memuat data karyawan');
        router.push('/hr/employees');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id, router]);

  const handleSubmit = async (data: CreateEmployeeDto) => {
    const response = await employeesApi.update(id, data);
    if (response.success) {
      toast.success('Data karyawan berhasil diperbarui');
      router.push(`/hr/employees/${id}`);
    } else {
      toast.error(response.message || 'Gagal memperbarui data karyawan');
      throw new Error(response.message);
    }
  };

  const handleCancel = () => {
    router.push(`/hr/employees/${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!employee) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Karyawan</h1>
        <p className="text-muted-foreground">
          Perbarui data karyawan {employee.fullName}
        </p>
      </div>

      <EmployeeForm
        initialData={employee}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}