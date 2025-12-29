'use client';

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
import type { Uom } from '@/lib/types/inventory';

const uomSchema = z.object({
  code: z
    .string()
    .min(1, 'Kode wajib diisi')
    .max(20, 'Kode maksimal 20 karakter')
    .transform((val) => val.toUpperCase()),
  name: z
    .string()
    .min(1, 'Nama wajib diisi')
    .max(100, 'Nama maksimal 100 karakter'),
  symbol: z
    .string()
    .min(1, 'Simbol wajib diisi')
    .max(10, 'Simbol maksimal 10 karakter'),
  description: z
    .string()
    .max(500, 'Deskripsi maksimal 500 karakter')
    .optional()
    .or(z.literal('')),
});

type UomFormValues = z.infer<typeof uomSchema>;

interface UomFormProps {
  initialData?: Uom;
  onSubmit: (data: UomFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function UomForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: UomFormProps) {
  const isEditing = !!initialData;

  const form = useForm<UomFormValues>({
    resolver: zodResolver(uomSchema),
    defaultValues: {
      code: initialData?.code || '',
      name: initialData?.name || '',
      symbol: initialData?.symbol || '',
      description: initialData?.description || '',
    },
  });

  const handleSubmit = async (data: UomFormValues) => {
    await onSubmit({
      ...data,
      description: data.description || undefined,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kode *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Contoh: PCS"
                    disabled={isEditing}
                    className="uppercase"
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
                <FormLabel>Nama *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Contoh: Pieces" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="symbol"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Simbol *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Contoh: pcs" className="max-w-xs" />
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
                  placeholder="Deskripsi satuan (opsional)"
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
            {isSubmitting ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambah Satuan'}
          </Button>
        </div>
      </form>
    </Form>
  );
}