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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { BloodType, Religion } from '@/lib/types/hr';
import type { EmployeeFormValues } from '../employee-form';

interface PersonalInfoSectionProps {
  form: UseFormReturn<EmployeeFormValues>;
  bloodTypes: BloodType[];
  religions: Religion[];
  isEditing: boolean;
}

export function PersonalInfoSection({
  form,
  bloodTypes,
  religions,
  isEditing,
}: PersonalInfoSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <FormField
        control={form.control}
        name="nik"
        render={({ field }) => (
          <FormItem>
            <FormLabel>NIK *</FormLabel>
            <FormControl>
              <Input
                placeholder="Masukkan NIK"
                {...field}
                disabled={isEditing}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="fullName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nama Lengkap *</FormLabel>
            <FormControl>
              <Input placeholder="Masukkan nama lengkap" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="nickname"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nama Panggilan</FormLabel>
            <FormControl>
              <Input placeholder="Masukkan nama panggilan" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="idCardNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nomor KTP *</FormLabel>
            <FormControl>
              <Input placeholder="Masukkan 16 digit nomor KTP" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="birthPlace"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tempat Lahir *</FormLabel>
            <FormControl>
              <Input placeholder="Masukkan tempat lahir" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="birthDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tanggal Lahir *</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="gender"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Jenis Kelamin *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis kelamin" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="L">Laki-laki</SelectItem>
                <SelectItem value="P">Perempuan</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="bloodTypeId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Golongan Darah</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih golongan darah" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="">Tidak ada</SelectItem>
                {bloodTypes.map((bt) => (
                  <SelectItem key={bt.id} value={bt.id}>
                    {bt.name}
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
        name="religionId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Agama</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih agama" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="">Tidak ada</SelectItem>
                {religions.map((rel) => (
                  <SelectItem key={rel.id} value={rel.id}>
                    {rel.name}
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
        name="maritalStatus"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status Pernikahan *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status pernikahan" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="SINGLE">Belum Menikah</SelectItem>
                <SelectItem value="MARRIED">Menikah</SelectItem>
                <SelectItem value="DIVORCED">Cerai</SelectItem>
                <SelectItem value="WIDOWED">Duda/Janda</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="phoneNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nomor Telepon</FormLabel>
            <FormControl>
              <Input placeholder="Masukkan nomor telepon" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" placeholder="Masukkan email" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}