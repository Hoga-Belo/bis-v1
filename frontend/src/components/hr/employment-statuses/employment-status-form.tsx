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
import type { EmploymentStatus, CreateEmploymentStatusDto, UpdateEmploymentStatusDto } from '@/lib/types/hr';

const employmentStatusSchema = z.object({
  code: z
    .string()
    .min(1, 'Kode wajib diisi')
    .max(20, 'Kode maksimal 20 karakter')
    .regex(
      /^[A-Z0-9_-]+$/,
      'Kode hanya boleh huruf kapital, angka, underscore, dan dash'
    ),
  name: z.string().min(1, 'Nama wajib diisi').max(100, 'Nama maksimal 100 karakter'),
  description: z.string().max(500, 'Deskripsi maksimal 500 karakter').optional(),
});

type EmploymentStatusFormValues = z.infer<typeof employmentStatusSchema>;

interface EmploymentStatusFormProps {
  initialData?: EmploymentStatus | null;
  onSubmit: (data: CreateEmploymentStatusDto | UpdateEmploymentStatusDto) => Promise<void>;
  onCancel: () => void;
}

export function EmploymentStatusForm({
  initialData,
  onSubmit,
  onCancel,
}: EmploymentStatusFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<EmploymentStatusFormValues>({
    resolver: zodResolver(employmentStatusSchema),
    defaultValues: {
      code: initialData?.code || '',
      name: initialData?.name || '',
      description: initialData?.description || '',
    },
  });

  const handleSubmit = async (values: EmploymentStatusFormValues) => {
    setLoading(true);
    try {
      await onSubmit({
        code: values.code,
        name: values.name,
        description: values.description || undefined,
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
                  placeholder="Contoh: PERMANENT"
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
                <Input placeholder="Contoh: Karyawan Tetap" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Deskripsi status kepegawaian (opsional)"
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