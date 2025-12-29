'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Brand } from '@/lib/types/inventory';

const brandFormSchema = z.object({
  code: z
    .string()
    .min(1, 'Kode wajib diisi')
    .max(20, 'Kode maksimal 20 karakter')
    .regex(/^[A-Z0-9_-]+$/, 'Kode hanya boleh huruf kapital, angka, underscore, dan dash'),
  name: z
    .string()
    .min(1, 'Nama wajib diisi')
    .max(100, 'Nama maksimal 100 karakter'),
  description: z
    .string()
    .max(500, 'Deskripsi maksimal 500 karakter')
    .optional()
    .nullable(),
});

type BrandFormValues = z.infer<typeof brandFormSchema>;

interface BrandFormProps {
  initialData?: Brand;
  onSubmit: (data: BrandFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function BrandForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: BrandFormProps) {
  const isEditing = !!initialData;

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        code: initialData.code,
        name: initialData.name,
        description: initialData.description || '',
      });
    }
  }, [initialData, form]);

  const handleSubmit = async (data: BrandFormValues) => {
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kode</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Masukkan kode merek"
                  disabled={isEditing || isSubmitting}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
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
                <Input
                  {...field}
                  placeholder="Masukkan nama merek"
                  disabled={isSubmitting}
                />
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
                  {...field}
                  value={field.value || ''}
                  placeholder="Masukkan deskripsi merek (opsional)"
                  disabled={isSubmitting}
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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