'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Warehouse } from '@/lib/types/inventory';
import { workLocationsApi, employeesApi } from '@/lib/api/endpoints/hr';
import { WorkLocation, Employee } from '@/lib/types/hr';

const warehouseFormSchema = z.object({
  code: z
    .string()
    .min(1, 'Kode wajib diisi')
    .max(20, 'Kode maksimal 20 karakter')
    .regex(/^[A-Z0-9_-]+$/, 'Kode hanya boleh huruf kapital, angka, underscore, dan dash'),
  name: z
    .string()
    .min(1, 'Nama wajib diisi')
    .max(100, 'Nama maksimal 100 karakter'),
  workLocationId: z
    .string()
    .optional()
    .nullable(),
  picEmployeeId: z
    .string()
    .optional()
    .nullable(),
  address: z
    .string()
    .max(500, 'Alamat maksimal 500 karakter')
    .optional()
    .nullable(),
  isActive: z.boolean(),
});

type WarehouseFormValues = z.infer<typeof warehouseFormSchema>;

interface WarehouseFormProps {
  initialData?: Warehouse;
  onSubmit: (data: WarehouseFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function WarehouseForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: WarehouseFormProps) {
  const isEditing = !!initialData;
  const [workLocations, setWorkLocations] = useState<WorkLocation[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingWorkLocations, setLoadingWorkLocations] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  const form = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseFormSchema),
    defaultValues: {
      code: '',
      name: '',
      workLocationId: '',
      picEmployeeId: '',
      address: '',
      isActive: true,
    },
  });

  // Fetch work locations
  useEffect(() => {
    const fetchWorkLocations = async () => {
      try {
        setLoadingWorkLocations(true);
        const response = await workLocationsApi.getAll({ limit: 100 });
        if (response.data) {
          setWorkLocations(response.data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch work locations:', error);
      } finally {
        setLoadingWorkLocations(false);
      }
    };
    fetchWorkLocations();
  }, []);

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoadingEmployees(true);
        const response = await employeesApi.getAll({ limit: 100 });
        if (response.data) {
          setEmployees(response.data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch employees:', error);
      } finally {
        setLoadingEmployees(false);
      }
    };
    fetchEmployees();
  }, []);

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        code: initialData.code,
        name: initialData.name,
        workLocationId: initialData.workLocationId || '',
        picEmployeeId: initialData.picEmployeeId || '',
        address: initialData.address || '',
        isActive: initialData.isActive,
      });
    }
  }, [initialData, form]);

  const handleSubmit = async (data: WarehouseFormValues) => {
    // Clean up empty strings to undefined for optional fields
    const cleanedData = {
      ...data,
      workLocationId: data.workLocationId || undefined,
      picEmployeeId: data.picEmployeeId || undefined,
      address: data.address || undefined,
    };
    await onSubmit(cleanedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Code Field */}
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kode</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Masukkan kode gudang"
                  disabled={isEditing || isSubmitting}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                />
              </FormControl>
              <FormDescription>
                Kode unik untuk gudang (huruf kapital, angka, underscore, dash)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Name Field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Masukkan nama gudang"
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Work Location Field */}
        <FormField
          control={form.control}
          name="workLocationId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lokasi Kerja</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || ''}
                disabled={isSubmitting || loadingWorkLocations}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingWorkLocations ? 'Memuat...' : 'Pilih lokasi kerja (opsional)'} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">Tidak ada</SelectItem>
                  {workLocations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.code} - {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Lokasi kerja terkait gudang ini
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* PIC Employee Field */}
        <FormField
          control={form.control}
          name="picEmployeeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Penanggung Jawab (PIC)</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || ''}
                disabled={isSubmitting || loadingEmployees}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingEmployees ? 'Memuat...' : 'Pilih penanggung jawab (opsional)'} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">Tidak ada</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.nik} - {employee.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Karyawan yang bertanggung jawab atas gudang ini
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Address Field */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alamat</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value || ''}
                  placeholder="Masukkan alamat gudang (opsional)"
                  disabled={isSubmitting}
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Active Status Field */}
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Aktif</FormLabel>
                <FormDescription>
                  Gudang yang tidak aktif tidak dapat digunakan untuk transaksi stok
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Simpan'}
          </Button>
        </div>
      </form>
    </Form>
  );
}