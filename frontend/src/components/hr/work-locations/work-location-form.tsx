'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { WorkLocation, CreateWorkLocationDto, UpdateWorkLocationDto } from '@/lib/types/hr';

const workLocationSchema = z.object({
  code: z
    .string()
    .min(1, 'Kode wajib diisi')
    .max(20, 'Kode maksimal 20 karakter')
    .regex(
      /^[A-Z0-9_-]+$/,
      'Kode hanya boleh huruf kapital, angka, underscore, dan dash'
    ),
  name: z.string().min(1, 'Nama wajib diisi').max(100, 'Nama maksimal 100 karakter'),
  address: z.string().max(500, 'Alamat maksimal 500 karakter').optional(),
  cityId: z.string().uuid('ID kota tidak valid').optional().or(z.literal('')),
});

type WorkLocationFormValues = z.infer<typeof workLocationSchema>;

interface WorkLocationFormProps {
  initialData?: WorkLocation | null;
  onSubmit: (data: CreateWorkLocationDto | UpdateWorkLocationDto) => Promise<void>;
  onCancel: () => void;
}

export function WorkLocationForm({
  initialData,
  onSubmit,
  onCancel,
}: WorkLocationFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<WorkLocationFormValues>({
    resolver: zodResolver(workLocationSchema),
    defaultValues: {
      code: initialData?.code || '',
      name: initialData?.name || '',
      address: initialData?.address || '',
      cityId: initialData?.cityId || '',
    },
  });

  const handleSubmit = async (values: WorkLocationFormValues) => {
    setLoading(true);
    try {
      await onSubmit({
        code: values.code,
        name: values.name,
        address: values.address || undefined,
        cityId: values.cityId || undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kode</FormLabel>
              <FormControl>
                <Input
                  placeholder="Contoh: LOC-TALIABU"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  disabled={!!initialData}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Site Taliabu" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alamat</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Alamat lengkap lokasi kerja (opsional)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cityId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID Kota</FormLabel>
              <FormControl>
                <Input
                  placeholder="UUID kota (opsional)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Menyimpan...' : initialData ? 'Perbarui' : 'Simpan'}
          </Button>
        </div>
      </form>
    </Form>
  );
}