
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
  Calendar,
  CheckCircle,
  ClipboardList,
  Heart,
  CalendarPlus,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PermissionGate } from '@/components/auth';
import { EmployeeStats } from '@/components/hr/employees/employee-stats';
import { ClockInOutCard } from '@/components/hr/attendance/clock-in-out-card';
import { PendingApprovalsCard } from '@/components/hr/leave-requests/pending-approvals-card';
import { employeesApi } from '@/lib/api/endpoints/hr';
import { attendanceApi } from '@/lib/api/endpoints/attendance';
import { leaveApi } from '@/lib/api/endpoints/leave';
import { ContractExpiringEmployee } from '@/lib/types/hr';
import type { AttendanceStatistics } from '@/lib/types/attendance';
import type { LeaveBalance } from '@/lib/types/leave';

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
    title: 'Kehadiran',
    description: 'Kelola kehadiran karyawan',
    icon: Clock,
    href: '/hr/attendance',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
    permission: 'hr:attendance:read',
  },
  {
    title: 'Pengajuan Cuti',
    description: 'Kelola pengajuan cuti',
    icon: Calendar,
    href: '/hr/leave-requests',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    permission: 'hr:leave:read',
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

// HR Management modules (for managers/HR staff)
const hrManagementModules = [
  {
    title: 'Manajemen Kehadiran',
    description: 'Kelola semua data kehadiran',
    icon: ClipboardList,
    href: '/hr/attendance/all',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
    permission: 'hr:attendance:read',
  },
  {
    title: 'Persetujuan Cuti',
    description: 'Setujui atau tolak pengajuan cuti',
    icon: CheckCircle,
    href: '/hr/leave-requests/approvals',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    permission: 'hr:leave:approve',
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

// Quick Stats Section Component
function QuickStatsSection() {
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStatistics | null>(null);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const [attendanceResponse, leaveResponse] = await Promise.all([
          attendanceApi.getMyStatistics(month, year).catch(() => null),
          leaveApi.getBalance().catch(() => null),
        ]);

        if (attendanceResponse?.success && attendanceResponse.data) {
          setAttendanceStats(attendanceResponse.data);
        }
        if (leaveResponse?.success && leaveResponse.data) {
          setLeaveBalance(leaveResponse.data);
        }
      } catch (error) {
        console.error('Error fetching quick stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Attendance Stats */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm">Hadir Bulan Ini</span>
          </div>
          <p className="text-2xl font-bold">{attendanceStats?.presentDays ?? '-'}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="h-4 w-4 text-yellow-600" />
            <span className="text-sm">Terlambat</span>
          </div>
          <p className="text-2xl font-bold">{attendanceStats?.lateDays ?? '-'}</p>
        </CardContent>
      </Card>

      {/* Leave Balance */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Calendar className="h-4 w-4 text-indigo-600" />
            <span className="text-sm">Sisa Cuti Tahunan</span>
          </div>
          <p className="text-2xl font-bold">{leaveBalance?.annualLeaveBalance ?? '-'}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Heart className="h-4 w-4 text-red-600" />
            <span className="text-sm">Sisa Cuti Sakit</span>
          </div>
          <p className="text-2xl font-bold">{leaveBalance?.sickLeaveBalance ?? '-'}</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function HrPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard HR</h1>
        <p className="text-muted-foreground">
          Kelola sumber daya manusia perusahaan
        </p>
      </div>

      {/* Today's Attendance - Quick Clock In/Out */}
      <PermissionGate permissions={['hr:attendance:read']}>
        <section>
          <h2 className="text-lg font-semibold mb-4">Kehadiran Hari Ini</h2>
          <ClockInOutCard />
        </section>
      </PermissionGate>

      {/* Pending Approvals for Managers */}
      <PermissionGate permissions={['hr:leave:approve']}>
        <section>
          <h2 className="text-lg font-semibold mb-4">Menunggu Persetujuan</h2>
          <PendingApprovalsCard />
        </section>
      </PermissionGate>

      {/* Quick Stats Grid */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Ringkasan Bulan Ini</h2>
        <QuickStatsSection />
      </section>

      {/* Employee Statistics */}
      <PermissionGate permissions={['hr:employee:read']}>
        <section>
          <h2 className="text-lg font-semibold mb-4">Statistik Karyawan</h2>
          <EmployeeStats />
        </section>
      </PermissionGate>

      {/* Contract Expiry Alerts */}
      <PermissionGate permissions={['hr:employee:read']}>
        <section>
          <h2 className="text-lg font-semibold mb-4">Peringatan Kontrak</h2>
          <ContractExpirySection />
        </section>
      </PermissionGate>

      {/* Quick Actions */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Aksi Cepat</h2>
        <div className="flex gap-4 flex-wrap">
          <PermissionGate permissions={['hr:employee:create']}>
            <Button asChild>
              <Link href="/hr/employees/create">
                <UserPlus className="h-4 w-4 mr-2" />
                Tambah Karyawan
              </Link>
            </Button>
          </PermissionGate>
          <PermissionGate permissions={['hr:leave:create']}>
            <Button variant="outline" asChild>
              <Link href="/hr/leave-requests/create">
                <CalendarPlus className="h-4 w-4 mr-2" />
                Ajukan Cuti
              </Link>
            </Button>
          </PermissionGate>
          <PermissionGate permissions={['hr:organization:read']}>
            <Button variant="outline" asChild>
              <Link href="/hr/organization">
                <Network className="h-4 w-4 mr-2" />
                Struktur Organisasi
              </Link>
            </Button>
          </PermissionGate>
        </div>
      </section>

      {/* HR Management Modules (for managers/HR staff) */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Manajemen HR</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {hrManagementModules.map((module) => (
            <PermissionGate key={module.href} permissions={[module.permission]}>
              <Link href={module.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <div className={`w-10 h-10 rounded-lg ${module.bgColor} flex items-center justify-center mb-2`}>
                      <module.icon className={`h-5 w-5 ${module.color}`} />
                    </div>
                    <CardTitle className="text-base">{module.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {module.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </PermissionGate>
          ))}
        </div>
      </section>

      {/* HR Modules Navigation Grid */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Modul HR</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {hrModules.map((module) => (
            <PermissionGate key={module.href} permissions={[module.permission]}>
              <Link href={module.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <div className={`w-10 h-10 rounded-lg ${module.bgColor} flex items-center justify-center mb-2`}>
                      <module.icon className={`h-5 w-5 ${module.color}`} />
                    </div>
                    <CardTitle className="text-base">{module.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {module.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </PermissionGate>
          ))}
        </div>
      </section>
    </div>
  );
}