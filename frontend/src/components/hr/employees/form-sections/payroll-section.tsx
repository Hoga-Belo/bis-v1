'use client';

import { UseFormReturn } from 'react-hook-form';
import { AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { usePermissions } from '@/lib/hooks/use-permissions';
import type { EmployeeFormValues } from '../employee-form';

interface PayrollSectionProps {
  form: UseFormReturn<EmployeeFormValues>;
  isEditMode?: boolean;
}

export function PayrollSection({ form, isEditMode = false }: PayrollSectionProps) {
  const { can } = usePermissions();
  
  // Check write permission based on mode
  const hasWritePermission = isEditMode
    ? can('hr:employee:update:payroll')
    : can('hr:employee:create:payroll');

  // If no write permission, show read-only message
  if (!hasWritePermission) {
    return (
      <div className="flex items-center gap-2 p-4 text-muted-foreground bg-muted/50 rounded-md">
        <AlertCircle className="h-5 w-5" />
        <span>Anda tidak memiliki izin untuk {isEditMode ? 'mengubah' : 'mengisi'} informasi penggajian.</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="basicSalary"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Gaji Pokok</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Masukkan gaji pokok"
                {...field}
                onChange={(e) => {
                  const value = e.target.value;
                  field.onChange(value ? parseFloat(value) : undefined);
                }}
                value={field.value ?? ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="bankName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nama Bank</FormLabel>
            <FormControl>
              <Input placeholder="Masukkan nama bank" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="bankAccountNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nomor Rekening</FormLabel>
            <FormControl>
              <Input placeholder="Masukkan nomor rekening" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="bankAccountHolder"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nama Pemilik Rekening</FormLabel>
            <FormControl>
              <Input placeholder="Masukkan nama pemilik rekening" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="taxNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>NPWP</FormLabel>
            <FormControl>
              <Input placeholder="Masukkan nomor NPWP" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="bpjsKesehatan"
        render={({ field }) => (
          <FormItem>
            <FormLabel>BPJS Kesehatan</FormLabel>
            <FormControl>
              <Input placeholder="Masukkan nomor BPJS Kesehatan" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="bpjsKetenagakerjaan"
        render={({ field }) => (
          <FormItem>
            <FormLabel>BPJS Ketenagakerjaan</FormLabel>
            <FormControl>
              <Input
                placeholder="Masukkan nomor BPJS Ketenagakerjaan"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}