'use client';

import { useState } from 'react';
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
import type { JobGrade } from '@/lib/types/hr';

const jobGradeSchema = z.object({
  code: z
    .string()
    .min(1, 'Kode wajib diisi')
    .max(20, 'Kode maksimal 20 karakter')
    .regex(/^[A-Z0-9_-]+$/, 'Kode hanya boleh huruf kapital, angka, underscore, dan dash'),
  name: z
    .string()
    .min(1, 'Nama wajib diisi')
    .max(100, 'Nama maksimal 100 karakter'),
  minSalary: z
    .number({ message: 'Gaji minimum wajib diisi dan harus berupa angka' })
    .min(0, { message: 'Gaji minimum tidak boleh negatif' }),
  maxSalary: z
    .number({ message: 'Gaji maksimum wajib diisi dan harus berupa angka' })
    .min(0, { message: 'Gaji maksimum tidak boleh negatif' }),
  description: z
    .string()
    .max(500, 'Deskripsi maksimal 500 karakter')
    .optional(),
}).refine((data) => data.maxSalary >= data.minSalary, {
  message: 'Gaji maksimum harus lebih besar atau sama dengan gaji minimum',
  path: ['maxSalary'],
});

type JobGradeFormValues = z.infer<typeof jobGradeSchema>;

interface JobGradeFormProps {
  initialData?: JobGrade | null;
  onSubmit: (data: { code: string; name: string; minSalary: number; maxSalary: number; description?: string }) => Promise<void>;
  onCancel: () => void;
}

export function JobGradeForm({ initialData, onSubmit, onCancel }: JobGradeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!initialData;

  const form = useForm<JobGradeFormValues>({
    resolver: zodResolver(jobGradeSchema),
    defaultValues: {
      code: initialData?.code || '',
      name: initialData?.name || '',
      minSalary: initialData?.minSalary || 0,
      maxSalary: initialData?.maxSalary || 0,
      description: initialData?.description || '',
    },
  });

  const handleSubmit = async (data: JobGradeFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        code: data.code,
        name: data.name,
        minSalary: data.minSalary,
        maxSalary: data.maxSalary,
        description: data.description || undefined,
      });
    } catch {
      // Error is handled by parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format number as currency for display
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('id-ID').format(value);
  };

  // Parse currency string to number
  const parseCurrency = (value: string): number => {
    const cleaned = value.replace(/[^\d]/g, '');
    return parseInt(cleaned) || 0;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kode Golongan</FormLabel>
              <FormControl>
                <Input
                  placeholder="Contoh: GRD-001"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  disabled={isEditing}
                />
              </FormControl>
              <FormDescription>
                Kode unik untuk identifikasi golongan (tidak dapat diubah setelah dibuat)
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
              <FormLabel>Nama Golongan</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Golongan I" {...field} />
              </FormControl>
              <FormDescription>Nama lengkap golongan</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="minSalary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gaji Minimum (Rp)</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Contoh: 5.000.000"
                    value={formatCurrency(field.value)}
                    onChange={(e) => field.onChange(parseCurrency(e.target.value))}
                  />
                </FormControl>
                <FormDescription>Batas bawah gaji untuk golongan ini</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxSalary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gaji Maksimum (Rp)</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Contoh: 10.000.000"
                    value={formatCurrency(field.value)}
                    onChange={(e) => field.onChange(parseCurrency(e.target.value))}
                  />
                </FormControl>
                <FormDescription>Batas atas gaji untuk golongan ini</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi (Opsional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Deskripsi singkat tentang golongan ini..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Penjelasan singkat tentang kriteria dan ketentuan golongan
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
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Simpan Perubahan' : 'Buat Golongan'}
          </Button>
        </div>
      </form>
    </Form>
  );
}