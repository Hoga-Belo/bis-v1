'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { usersApi } from '@/lib/api/endpoints/users';
import { rolesApi, Role } from '@/lib/api/endpoints/roles';
import { CreateUserRequest } from '@/lib/types/user';
import { Copy, Check, Loader2 } from 'lucide-react';

const createUserSchema = z.object({
  nik: z
    .string()
    .min(1, 'NIK wajib diisi')
    .max(20, 'NIK maksimal 20 karakter')
    .regex(/^[A-Z0-9]+$/, 'NIK hanya boleh huruf kapital dan angka'),
  employeeId: z.string().optional(),
  roleIds: z.array(z.string()).min(1, 'Pilih minimal satu role'),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

interface UserFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function UserForm({ onSuccess, onCancel }: UserFormProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [defaultPassword, setDefaultPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      nik: '',
      employeeId: '',
      roleIds: [],
    },
  });

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await rolesApi.getRoles();
        if (response.success && response.data) {
          setRoles(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch roles:', error);
        toast.error('Gagal memuat daftar role');
      } finally {
        setIsLoadingRoles(false);
      }
    };

    fetchRoles();
  }, []);

  const onSubmit = async (data: CreateUserFormValues) => {
    setIsSubmitting(true);
    try {
      const payload: CreateUserRequest = {
        nik: data.nik,
        roleIds: data.roleIds,
      };

      if (data.employeeId) {
        payload.employeeId = data.employeeId;
      }

      const response = await usersApi.createUser(payload);

      if (response.success && response.data) {
        setDefaultPassword(response.data.defaultPassword);
        setShowPasswordDialog(true);
        toast.success('User berhasil dibuat');
      } else {
        toast.error(response.message || 'Gagal membuat user');
      }
    } catch (error) {
      console.error('Failed to create user:', error);
      toast.error('Terjadi kesalahan saat membuat user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(defaultPassword);
      setCopied(true);
      toast.success('Password berhasil disalin');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Gagal menyalin password');
    }
  };

  const handleClosePasswordDialog = () => {
    setShowPasswordDialog(false);
    setDefaultPassword('');
    form.reset();
    onSuccess?.();
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="nik"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NIK</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Masukkan NIK"
                    {...field}
                    onChange={(e) =>
                      field.onChange(e.target.value.toUpperCase())
                    }
                  />
                </FormControl>
                <FormDescription>
                  NIK akan digunakan sebagai username untuk login
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="employeeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employee ID (Opsional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Masukkan Employee ID jika ada"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Hubungkan user dengan data karyawan yang sudah ada
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="roleIds"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel>Role</FormLabel>
                  <FormDescription>
                    Pilih satu atau lebih role untuk user ini
                  </FormDescription>
                </div>
                {isLoadingRoles ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-6 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {roles.map((role) => (
                      <FormField
                        key={role.id}
                        control={form.control}
                        name="roleIds"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={role.id}
                              className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(role.id)}
                                  onCheckedChange={(checked: boolean | 'indeterminate') => {
                                    return checked === true
                                      ? field.onChange([
                                          ...field.value,
                                          role.id,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== role.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="cursor-pointer font-medium">
                                  {role.name}
                                </FormLabel>
                                {role.description && (
                                  <p className="text-xs text-muted-foreground">
                                    {role.description}
                                  </p>
                                )}
                              </div>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                )}
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
            <Button type="submit" disabled={isSubmitting || isLoadingRoles}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Buat User
            </Button>
          </div>
        </form>
      </Form>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Berhasil Dibuat</DialogTitle>
            <DialogDescription>
              Simpan password default berikut. Password ini hanya ditampilkan
              sekali.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <p className="mb-2 text-sm font-medium text-muted-foreground">
                Password Default:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-background px-3 py-2 font-mono text-lg">
                  {defaultPassword}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyPassword}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              User akan diminta untuk mengganti password saat login pertama
              kali.
            </p>
            <div className="flex justify-end">
              <Button onClick={handleClosePasswordDialog}>Tutup</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}