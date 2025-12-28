'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Role } from '@/lib/api/endpoints/roles';
import { CreateRoleRequest, UpdateRoleRequest } from '@/lib/types/role';

const createRoleSchema = z.object({
  name: z
    .string()
    .min(1, 'Nama role wajib diisi')
    .max(100, 'Nama role maksimal 100 karakter'),
  code: z
    .string()
    .min(1, 'Kode role wajib diisi')
    .max(50, 'Kode role maksimal 50 karakter')
    .regex(
      /^[A-Z][A-Z0-9_]*$/,
      'Kode harus huruf kapital, diawali huruf, boleh angka dan underscore'
    ),
  description: z
    .string()
    .max(255, 'Deskripsi maksimal 255 karakter')
    .optional(),
});

const updateRoleSchema = z.object({
  name: z
    .string()
    .min(1, 'Nama role wajib diisi')
    .max(100, 'Nama role maksimal 100 karakter'),
  description: z
    .string()
    .max(255, 'Deskripsi maksimal 255 karakter')
    .optional(),
});

type CreateRoleFormValues = z.infer<typeof createRoleSchema>;
type UpdateRoleFormValues = z.infer<typeof updateRoleSchema>;

interface RoleFormProps {
  role?: Role;
  isSubmitting?: boolean;
  onSubmit: (data: CreateRoleRequest | UpdateRoleRequest) => void;
  onCancel?: () => void;
}

export function RoleForm({
  role,
  isSubmitting,
  onSubmit,
  onCancel,
}: RoleFormProps) {
  const isEditMode = !!role;

  const form = useForm<CreateRoleFormValues | UpdateRoleFormValues>({
    resolver: zodResolver(isEditMode ? updateRoleSchema : createRoleSchema),
    defaultValues: {
      name: role?.name || '',
      code: role?.code || '',
      description: role?.description || '',
    },
  });

  const handleSubmit = (data: CreateRoleFormValues | UpdateRoleFormValues) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Role</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan nama role" {...field} />
              </FormControl>
              <FormDescription>
                Nama yang akan ditampilkan untuk role ini
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {!isEditMode && (
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kode Role</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Masukkan kode role"
                    {...field}
                    onChange={(e) =>
                      field.onChange(e.target.value.toUpperCase())
                    }
                  />
                </FormControl>
                <FormDescription>
                  Kode unik untuk role (huruf kapital, angka, underscore)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {isEditMode && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Kode Role</label>
            <div className="rounded-md border bg-muted px-3 py-2">
              <code className="text-sm">{role?.code}</code>
            </div>
            <p className="text-sm text-muted-foreground">
              Kode role tidak dapat diubah
            </p>
          </div>
        )}

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi (Opsional)</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan deskripsi role" {...field} />
              </FormControl>
              <FormDescription>
                Penjelasan singkat tentang role ini
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Batal
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? 'Simpan Perubahan' : 'Buat Role'}
          </Button>
        </div>
      </form>
    </Form>
  );
}