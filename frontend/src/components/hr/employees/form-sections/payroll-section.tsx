'use client';

import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { EmployeeFormValues } from '../employee-form';

interface PayrollSectionProps {
  form: UseFormReturn<EmployeeFormValues>;
}

export function PayrollSection({ form }: PayrollSectionProps) {
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