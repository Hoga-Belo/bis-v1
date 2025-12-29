'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { EmployeeForm } from '@/components/hr/employees';
import { employeesApi } from '@/lib/api/endpoints/hr';
import type { CreateEmployeeDto } from '@/lib/types/hr';

export default function CreateEmployeePage() {
  const router = useRouter();

  const handleSubmit = async (data: CreateEmployeeDto) => {
    const response = await employeesApi.create(data);
    if (response.success) {
      toast.success('Karyawan berhasil ditambahkan');
      router.push('/hr/employees');
    } else {
      toast.error(response.message || 'Gagal menambahkan karyawan');
      throw new Error(response.message);
    }
  };

  const handleCancel = () => {
    router.push('/hr/employees');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tambah Karyawan</h1>
        <p className="text-muted-foreground">
          Isi formulir di bawah untuk menambahkan karyawan baru
        </p>
      </div>

      <EmployeeForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  );
}