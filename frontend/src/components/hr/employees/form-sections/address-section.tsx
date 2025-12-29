'use client';

import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { City } from '@/lib/types/hr';
import type { EmployeeFormValues } from '../employee-form';

interface AddressSectionProps {
  form: UseFormReturn<EmployeeFormValues>;
  cities: City[];
}

export function AddressSection({ form, cities }: AddressSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>Alamat KTP</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Masukkan alamat sesuai KTP"
                className="resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="cityId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Kota (KTP)</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kota" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="">Tidak ada</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="postalCode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Kode Pos</FormLabel>
            <FormControl>
              <Input placeholder="Masukkan kode pos" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="currentAddress"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>Alamat Domisili</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Masukkan alamat domisili saat ini"
                className="resize-none"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Kosongkan jika sama dengan alamat KTP
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="currentCityId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Kota (Domisili)</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kota" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="">Tidak ada</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}