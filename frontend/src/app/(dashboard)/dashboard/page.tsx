'use client';

import Link from 'next/link';
import { Users, Package, Building2, Home, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/lib/stores/auth-store';
import { PermissionGate } from '@/components/auth';
import { EmployeeStats, ContractExpiryAlert } from '@/components/hr/employees';

const modules = [
  {
    title: 'HR Module',
    description: 'Manage employees, attendance, and payroll',
    icon: Users,
    href: '/hr',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    title: 'Inventory Module',
    description: 'Track inventory and manage stock',
    icon: Package,
    href: '/inventory',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    title: 'Mess Module',
    description: 'Manage mess operations and meals',
    icon: Home,
    href: '/mess',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    title: 'Building Module',
    description: 'Manage building and facilities',
    icon: Building2,
    href: '/building',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
];

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.nik || 'User'}!
        </p>
      </div>

      {/* Employee Statistics Section */}
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

      {/* Contract Expiry Alert Section */}
      <PermissionGate permissions={['hr:employee:read']}>
        <section className="grid gap-6 lg:grid-cols-2">
          <ContractExpiryAlert daysThreshold={30} maxItems={5} />
          
          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Aksi Cepat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link
                href="/hr/employees/create"
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <div className="p-2 rounded-full bg-blue-100">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Tambah Karyawan Baru</p>
                  <p className="text-sm text-muted-foreground">
                    Daftarkan karyawan baru ke sistem
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
              </Link>
              <Link
                href="/hr/organization"
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <div className="p-2 rounded-full bg-green-100">
                  <Building2 className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Struktur Organisasi</p>
                  <p className="text-sm text-muted-foreground">
                    Lihat hierarki organisasi
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
              </Link>
            </CardContent>
          </Card>
        </section>
      </PermissionGate>

      {/* Module Cards */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Modul</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {modules.map((module) => (
            <Link key={module.title} href={module.href}>
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
          ))}
        </div>
      </section>
    </div>
  );
}