'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { PermissionGate } from '@/components/auth';
import {
  Building2,
  Users,
  UsersRound,
  Briefcase,
  GraduationCap,
  FileCheck,
  MapPin,
  Network,
  Clock,
  ClipboardList,
  Calendar,
  CheckCircle,
} from 'lucide-react';

const hrNavItems = [
  {
    href: '/hr/employees',
    label: 'Karyawan',
    icon: UsersRound,
    permission: 'hr:employee:read',
  },
  {
    href: '/hr/attendance',
    label: 'Kehadiran',
    icon: Clock,
    permission: 'hr:attendance:read',
  },
  {
    href: '/hr/attendance/all',
    label: 'Manajemen Kehadiran',
    icon: ClipboardList,
    permission: 'hr:attendance:read',
  },
  {
    href: '/hr/leave-requests',
    label: 'Pengajuan Cuti',
    icon: Calendar,
    permission: 'hr:leave:read',
  },
  {
    href: '/hr/leave-requests/approvals',
    label: 'Persetujuan Cuti',
    icon: CheckCircle,
    permission: 'hr:leave:approve',
  },
  {
    href: '/hr/divisions',
    label: 'Divisi',
    icon: Building2,
    permission: 'hr:division:read',
  },
  {
    href: '/hr/departments',
    label: 'Departemen',
    icon: Users,
    permission: 'hr:department:read',
  },
  {
    href: '/hr/positions',
    label: 'Jabatan',
    icon: Briefcase,
    permission: 'hr:position:read',
  },
  {
    href: '/hr/job-grades',
    label: 'Golongan',
    icon: GraduationCap,
    permission: 'hr:job-grade:read',
  },
  {
    href: '/hr/employment-statuses',
    label: 'Status Kepegawaian',
    icon: FileCheck,
    permission: 'hr:employment-status:read',
  },
  {
    href: '/hr/work-locations',
    label: 'Lokasi Kerja',
    icon: MapPin,
    permission: 'hr:work-location:read',
  },
  {
    href: '/hr/organization',
    label: 'Struktur Organisasi',
    icon: Network,
    permission: 'hr:organization:read',
  },
];

export default function HrLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex gap-6">
      {/* Sidebar Navigation */}
      <aside className="w-64 shrink-0">
        <div className="sticky top-6">
          <h2 className="mb-4 px-3 text-lg font-semibold">HR Management</h2>
          <nav className="space-y-1">
            {hrNavItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <PermissionGate
                  key={item.href}
                  permissions={[item.permission]}
                  fallback={null}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </PermissionGate>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}