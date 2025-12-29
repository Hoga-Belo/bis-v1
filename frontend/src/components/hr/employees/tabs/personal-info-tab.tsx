'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Employee, Gender, MaritalStatus } from '@/lib/types/hr';

interface PersonalInfoTabProps {
  employee: Employee;
}

const genderLabels: Record<Gender, string> = {
  L: 'Laki-laki',
  P: 'Perempuan',
};

const maritalStatusLabels: Record<MaritalStatus, string> = {
  SINGLE: 'Belum Menikah',
  MARRIED: 'Menikah',
  DIVORCED: 'Cerai',
  WIDOWED: 'Duda/Janda',
};

function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value || '-'}</dd>
    </div>
  );
}

export function PersonalInfoTab({ employee }: PersonalInfoTabProps) {
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Dasar</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem label="NIK" value={employee.nik} />
            <InfoItem label="Nama Lengkap" value={employee.fullName} />
            <InfoItem label="Nama Panggilan" value={employee.nickname} />
            <InfoItem label="Nomor KTP" value={employee.idCardNumber} />
            <InfoItem label="Tempat Lahir" value={employee.birthPlace} />
            <InfoItem label="Tanggal Lahir" value={formatDate(employee.birthDate)} />
            <InfoItem label="Jenis Kelamin" value={genderLabels[employee.gender]} />
            <InfoItem label="Golongan Darah" value={employee.bloodType?.name} />
            <InfoItem label="Agama" value={employee.religion?.name} />
            <InfoItem
              label="Status Pernikahan"
              value={maritalStatusLabels[employee.maritalStatus]}
            />
          </dl>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Kontak</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem label="Nomor Telepon" value={employee.phoneNumber} />
            <InfoItem label="Email" value={employee.email} />
          </dl>
        </CardContent>
      </Card>

      {/* KTP Address */}
      <Card>
        <CardHeader>
          <CardTitle>Alamat KTP</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="sm:col-span-2 lg:col-span-3">
              <InfoItem label="Alamat" value={employee.address} />
            </div>
            <InfoItem
              label="Kota"
              value={
                employee.city
                  ? `${employee.city.name}${employee.city.province ? `, ${employee.city.province.name}` : ''}`
                  : undefined
              }
            />
            <InfoItem label="Kode Pos" value={employee.postalCode} />
          </dl>
        </CardContent>
      </Card>

      {/* Current Address */}
      <Card>
        <CardHeader>
          <CardTitle>Alamat Domisili</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="sm:col-span-2 lg:col-span-3">
              <InfoItem label="Alamat" value={employee.currentAddress} />
            </div>
            <InfoItem
              label="Kota"
              value={
                employee.currentCity
                  ? `${employee.currentCity.name}${employee.currentCity.province ? `, ${employee.currentCity.province.name}` : ''}`
                  : undefined
              }
            />
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}