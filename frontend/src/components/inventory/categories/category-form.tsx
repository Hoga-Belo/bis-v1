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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { Category, CategoryType, CreateCategoryRequest } from '@/lib/types/inventory';

const categorySchema = z.object({
  code: z
    .string()
    .min(1, 'Kode wajib diisi')
    .max(20, 'Kode maksimal 20 karakter')
    .regex(/^[A-Z0-9_-]+$/, 'Kode hanya boleh huruf kapital, angka, underscore, dan dash'),
  name: z
    .string()
    .min(1, 'Nama wajib diisi')
    .max(100, 'Nama maksimal 100 karakter'),
  type: z.enum(['FIXED', 'CONSUMABLE'], {
    message: 'Tipe wajib dipilih',
  }),
  description: z
    .string()
    .max(500, 'Deskripsi maksimal 500 karakter')
    .optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  initialData?: Category | null;
  onSubmit: (data: CreateCategoryRequest) => Promise<void>;
  onCancel: () => void;
}

export function CategoryForm({ initialData, onSubmit, onCancel }: CategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!initialData;

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      code: initialData?.code || '',
      name: initialData?.name || '',
      type: initialData?.type || undefined,
      description: initialData?.description || '',
    },
  });

  const handleSubmit = async (data: CategoryFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        code: data.code,
        name: data.name,
        type: data.type as CategoryType,
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
              <FormLabel>Kode Kategori</FormLabel>
              <FormControl>
                <Input
                  placeholder="Contoh: CAT-001"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  disabled={isEditing}
                />
              </FormControl>
              <FormDescription>
                Kode unik untuk identifikasi kategori (tidak dapat diubah setelah dibuat)
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
              <FormLabel>Nama Kategori</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Elektronik" {...field} />
              </FormControl>
              <FormDescription>Nama lengkap kategori</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipe Kategori</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe kategori" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="FIXED">Aset Tetap</SelectItem>
                  <SelectItem value="CONSUMABLE">Barang Habis Pakai</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Aset Tetap untuk barang inventaris, Barang Habis Pakai untuk consumable
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
                  placeholder="Deskripsi singkat tentang kategori ini..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Penjelasan singkat tentang kategori ini
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
            {isEditing ? 'Simpan Perubahan' : 'Buat Kategori'}
          </Button>
        </div>
      </form>
    </Form>
  );
}