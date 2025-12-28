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
import type { Position } from '@/lib/types/hr';

const positionSchema = z.object({
  code: z
    .string()
    .min(1, 'Kode wajib diisi')
    .max(20, 'Kode maksimal 20 karakter')
    .regex(/^[A-Z0-9_-]+$/, 'Kode hanya boleh huruf kapital, angka, underscore, dan dash'),
  name: z
    .string()
    .min(1, 'Nama wajib diisi')
    .max(100, 'Nama maksimal 100 karakter'),
  level: z
    .number({ message: 'Level wajib diisi dan harus berupa angka' })
    .int({ message: 'Level harus berupa bilangan bulat' })
    .min(1, { message: 'Level minimal 1' })
    .max(99, { message: 'Level maksimal 99' }),
  description: z
    .string()
    .max(500, 'Deskripsi maksimal 500 karakter')
    .optional(),
});

type PositionFormValues = z.infer<typeof positionSchema>;

interface PositionFormProps {
  initialData?: Position | null;
  onSubmit: (data: { code: string; name: string; level: number; description?: string }) => Promise<void>;
  onCancel: () => void;
}

export function PositionForm({ initialData, onSubmit, onCancel }: PositionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!initialData;

  const form = useForm<PositionFormValues>({
    resolver: zodResolver(positionSchema),
    defaultValues: {
      code: initialData?.code || '',
      name: initialData?.name || '',
      level: initialData?.level || 1,
      description: initialData?.description || '',
    },
  });

  const handleSubmit = async (data: PositionFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        code: data.code,
        name: data.name,
        level: data.level,
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
              <FormLabel>Kode Jabatan</FormLabel>
              <FormControl>
                <Input
                  placeholder="Contoh: POS-001"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  disabled={isEditing}
                />
              </FormControl>
              <FormDescription>
                Kode unik untuk identifikasi jabatan (tidak dapat diubah setelah dibuat)
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
              <FormLabel>Nama Jabatan</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Manager Operasional" {...field} />
              </FormControl>
              <FormDescription>Nama lengkap jabatan</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Level Jabatan</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={99}
                  placeholder="Contoh: 1"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                />
              </FormControl>
              <FormDescription>
                Level hierarki jabatan (1 = tertinggi, semakin besar semakin rendah)
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
                  placeholder="Deskripsi singkat tentang jabatan ini..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Penjelasan singkat tentang tugas dan tanggung jawab jabatan
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
            {isEditing ? 'Simpan Perubahan' : 'Buat Jabatan'}
          </Button>
        </div>
      </form>
    </Form>
  );
}