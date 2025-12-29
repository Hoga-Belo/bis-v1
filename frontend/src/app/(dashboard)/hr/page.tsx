
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Building2,
  Briefcase,
  GraduationCap,
  MapPin,
  Network,
  UserPlus,
  ChevronRight,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PermissionGate } from '@/components/auth';
import { EmployeeStats } from '@/components/hr/employees/employee-stats';
import { employeesApi } from '@/lib/api/endpoints/hr';
import { ContractExpiringEmployee } from '@/lib/types/hr';

// Quick navigation cards for HR sub-modules
const hrModules = [
  {
    title: 'Karyawan',
    description: 'Kelola data karyawan',
    icon: Users,
    href: '/hr/employees',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    permission: 'hr:employee:read',
  },
  {
    title: 'Divisi',
    description: 'Kelola divisi perusahaan',
    icon: Building2,
    href: '/hr/divisions',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    permission: 'hr:division:read',
  },
  {
    title: 'Departemen',
    description: 'Kelola departemen',
    icon: Network,
    href: '/hr/departments',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    permission: 'hr:department:read',
  },
  {
    title: 'Jabatan',
    description: 'Kelola jabatan karyawan',
    icon: Briefcase,
    href: '/hr/positions',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    permission: 'hr:position:read',
  },
  {
    title: 'Grade',
    description: 'Kelola job grade',
    icon: GraduationCap,
    href: '/hr/job-grades',
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    permission: 'hr:job-grade:read',
  },
  {
    title: 'Lokasi Kerja',
    description: 'Kelola lokasi kerja',
    icon: MapPin,
    href: '/hr/work-locations',
    color: 'text-teal-600',
    bgColor: 'bg-teal-100',
    permission: 'hr:work-location:read',
  },
];

interface ContractExpiryData {
  h30: ContractExpiringEmployee[];
  h60: ContractExpiringEmployee[];
  loading: boolean;
  error: string | null;
}

function ContractExpirySection() {
  const [data, setData] = useState<ContractExpiryData>({
    h30: [],
    h60: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setData((prev) => ({ ...prev, loading: true, error: null }));
        
        // Fetch both H-30 and H-60 data
        const [h30Response, h60Response] = await Promise.all([
          employeesApi.getExpiringContracts(30),
          employeesApi.getExpiringContracts(60),
        ]);

        // H-60 should exclude H-30 employees (only show 31-60 days)
        const h30Ids = new Set(
          h30Response.success && h30Response.data
            ? h30Response.data.map((e) => e.id)
            : []
        );
        
        const h60Only = h60Response.success && h60Response.data
          ? h60Response.data.filter((e) => !h30Ids.has(e.id))
          : [];

        setData({
          h30: h30Response.success && h30Response.data ? h30Response.data : [],
          h60: h60Only,
          loading: false,
          error: null,
        });
      } catch (err) {
        console.error('Error fetching contract expiry data:', err);
        setData((prev) => ({
          ...prev,
          loading: false,
          error: 'Gagal memuat data kontrak',
        }));
      }
    };

    fetchData();
  }, []);

  if (data.loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (data.error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <p>{data.error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* H-30 Card - Urgent */}
      <Card className={data.h30.length > 0 ? 'border-red-200 bg-red-50' : ''}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <AlertTriangle className={`h-5 w-5 ${data.h30.length > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
            Kontrak H-30
          </CardTitle>
          <Badge variant={data.h30.length > 0 ? 'destructive' : 'secondary'}>
            {data.h30.length} karyawan
          </Badge>
        </CardHeader>
        <CardContent>
          {data.h30.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Tidak ada kontrak yang berakhir dalam 30 hari
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-red-600 font-medium">
                Perlu tindakan segera!
              </p>
              <div className="space-y-1">
                {data.h30.slice(0, 3).map((emp) => (
                  <Link
                    key={emp.id}
                    href={`/hr/employees/${emp.id}`}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-red-100 transition-colors"
                  >
                    <span className="text-sm font-medium truncate">{emp.fullName}</span>
                    <span className="text-xs text-red-600">
                      {new Date(emp.contractEndDate).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </Link>
                ))}
              </div>
              {data.h30.length > 3 && (
                <Link
                  href="/hr/employees?contractExpiring=30"
                  className="text-sm text-red-600 hover:underline flex items-center gap-1"
                >
                  Lihat {data.h30.length - 3} lainnya
                  <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* H-60 Card - Warning */}
      <Card className={data.h60.length > 0 ? 'border-yellow-200 bg-yellow-50' : ''}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Clock className={`h-5 w-5 ${data.h60.length > 0 ? 'text-yellow-600' : 'text-muted-foreground'}`} />
            Kontrak H-60
          </CardTitle>
          <Badge variant={data.h60.length > 0 ? 'default' : 'secondary'} className={data.h60.length > 0 ? 'bg-yellow-500' : ''}>
            {data.h60.length} karyawan
          </Badge>
        </CardHeader>
        <CardContent>
          {data.h60.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Tidak ada kontrak yang berakhir dalam 31-60 hari
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-yellow-700 font-medium">
                Persiapkan perpanjangan kontrak
              </p>
              <div className="space-y-1">
                {data.h60.slice(0, 3).map((emp) => (
                  <Link
                    key={emp.id}
                    href={`/hr/employees/${emp.id}`}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-yellow-100 transition-colors"
                  >
                    <span className="text-sm font-medium truncate">{emp.fullName}</span>
                    <span className="text-xs text-yellow-700">
                      {new Date(emp.contractEndDate).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </Link>
                ))}
              </div>
              {data.h60.length > 3 && (
                <Link
                  href="/hr/employees?contractExpiring=60"
                  className="text-sm text-yellow-700 hover:underline flex items-center gap-1"
                >
                  Lihat {data.h60.length - 3} lainnya
                  <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function HrPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">HR Dashboard</h1>
        <p className="text-muted-foreground">
          Kelola sumber daya manusia perusahaan
        </p>
      </div>

      {/* Employee Statistics */}
      <PermissionGate permissions={['hr:employee:read']}>
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Statistik Karyawan</h2>
            <Link
              href="/hr/employees"
              className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
            >
              Lihat Semua
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <EmployeeStats />
        </section>
      </PermissionGate>

      {/* Contract Expiry Alerts */}
      <PermissionGate permissions={['hr:employee:read']}>
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Peringatan Kontrak</h2>
          <ContractExpirySection />
        </section>
      </PermissionGate>

      {/* Quick Actions */}
      <PermissionGate permissions={['hr:employee:create']}>
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Aksi Cepat</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/hr/employees/create">
              <Card className="h-full transition-all hover:shadow-md hover:scale-[1.02] hover:border-primary cursor-pointer">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="p-3 rounded-full bg-blue-100">
                    <UserPlus className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Tambah Karyawan Baru</p>
                    <p className="text-sm text-muted-foreground">
                      Daftarkan karyawan baru ke sistem
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/hr/organization">
              <Card className="h-full transition-all hover:shadow-md hover:scale-[1.02] hover:border-primary cursor-pointer">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="p-3 rounded-full bg-green-100">
                    <Network className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Struktur Organisasi</p>
                    <p className="text-sm text-muted-foreground">
                      Lihat hierarki organisasi
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>
      </PermissionGate>

      {/* HR Modules Navigation */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Modul HR</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {hrModules.map((module) => (
            <PermissionGate key={module.href} permissions={[module.permission]}>
              <Link href={module.href}>
                <Card className="h-full transition-all hover:shadow-md hover:scale-[1.02] hover:border-primary cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{module.title}</CardTitle>
                    <div className={`p-2 rounded-full ${module.bgColor}`}>
                      <module.icon className={`h-4 w-4 ${module.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{module.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            </PermissionGate>
          ))}
        </div>
      </section>
    </div>
  );
}