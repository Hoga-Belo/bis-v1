'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { divisionsApi, organizationApi } from '@/lib/api/endpoints/hr';
import type {
  Department,
  Division,
  EmployeeSummary,
  CreateDepartmentDto,
} from '@/lib/types/hr';

const departmentSchema = z.object({
  code: z
    .string()
    .min(1, 'Kode wajib diisi')
    .max(20, 'Kode maksimal 20 karakter')
    .regex(
      /^[A-Z0-9_-]+$/,
      'Kode hanya boleh huruf kapital, angka, underscore, dan dash'
    ),
  name: z
    .string()
    .min(1, 'Nama wajib diisi')
    .max(100, 'Nama maksimal 100 karakter'),
  divisionId: z.string().min(1, 'Divisi wajib dipilih'),
  managerId: z.string().optional(),
  description: z.string().max(500, 'Deskripsi maksimal 500 karakter').optional(),
});

type DepartmentFormValues = z.infer<typeof departmentSchema>;

interface DepartmentFormProps {
  initialData?: Department | null;
  onSubmit: (data: CreateDepartmentDto) => Promise<void>;
  onCancel: () => void;
}

export function DepartmentForm({
  initialData,
  onSubmit,
  onCancel,
}: DepartmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [employees, setEmployees] = useState<EmployeeSummary[]>([]);
  const [loadingDivisions, setLoadingDivisions] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const isEditing = !!initialData;

  // Fetch divisions for dropdown
  useEffect(() => {
    const fetchDivisions = async () => {
      try {
        const response = await divisionsApi.getAll({ limit: 100 });
        if (response.success && response.data) {
          setDivisions(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch divisions:', error);
      } finally {
        setLoadingDivisions(false);
      }
    };
    fetchDivisions();
  }, []);

  // Fetch employees for manager dropdown
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await organizationApi.getAllEmployees();
        if (response.success && response.data) {
          setEmployees(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch employees:', error);
      } finally {
        setLoadingEmployees(false);
      }
    };
    fetchEmployees();
  }, []);

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      code: initialData?.code || '',
      name: initialData?.name || '',
      divisionId: initialData?.divisionId || '',
      managerId: initialData?.managerId || '',
      description: initialData?.description || '',
    },
  });

  const handleSubmit = async (data: DepartmentFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        code: data.code,
        name: data.name,
        divisionId: data.divisionId,
        managerId: data.managerId || undefined,
        description: data.description || undefined,
      });
    } catch {
      // Error is handled by parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kode Departemen</FormLabel>
              <FormControl>
                <Input
                  placeholder="Contoh: DEPT-001"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  disabled={isEditing}
                />
              </FormControl>
              <FormDescription>
                Kode unik untuk identifikasi departemen (tidak dapat diubah
                setelah dibuat)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Departemen</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Departemen Keuangan" {...field} />
              </FormControl>
              <FormDescription>Nama lengkap departemen</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="divisionId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Divisi</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={loadingDivisions}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        loadingDivisions
                          ? 'Memuat divisi...'
                          : 'Pilih divisi'
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {divisions.map((division) => (
                    <SelectItem key={division.id} value={division.id}>
                      {division.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Divisi yang membawahi departemen ini
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="managerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Manager (Opsional)</FormLabel>
              <Select
                onValueChange={(value) =>
                  field.onChange(value === '__none__' ? '' : value)
                }
                defaultValue={field.value || '__none__'}
                disabled={loadingEmployees}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        loadingEmployees
                          ? 'Memuat karyawan...'
                          : 'Pilih manager departemen'
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="__none__">Tidak ada manager</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.nik} - {employee.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Karyawan yang menjadi manager departemen ini
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi (Opsional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Deskripsi singkat tentang departemen ini..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Penjelasan singkat tentang fungsi dan tanggung jawab departemen
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || loadingDivisions || loadingEmployees}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Simpan Perubahan' : 'Buat Departemen'}
          </Button>
        </div>
      </form>
    </Form>
  );
}