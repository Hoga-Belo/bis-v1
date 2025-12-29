'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, UserPlus, Calendar, FileWarning } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PermissionGate } from '@/components/auth';
import { employeesApi } from '@/lib/api/endpoints/hr';
import { EmployeeStatistics } from '@/lib/types/hr';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
  loading?: boolean;
}

function StatCard({ title, value, icon, color, onClick, loading }: StatCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] ${onClick ? 'hover:border-primary' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            {loading ? (
              <>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </>
            ) : (
              <>
                <p className="text-3xl font-bold">{value}</p>
                <p className="text-sm text-muted-foreground">{title}</p>
              </>
            )}
          </div>
          <div className={`p-3 rounded-full ${color}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export function EmployeeStats() {
  const router = useRouter();
  const [stats, setStats] = useState<EmployeeStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await employeesApi.getStatistics();
        if (response.success && response.data) {
          setStats(response.data);
        }
      } catch (err) {
        setError('Gagal memuat statistik');
        console.error('Error fetching employee statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleNavigate = (filter: string) => {
    router.push(`/hr/employees?${filter}`);
  };

  if (error) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <PermissionGate permissions={['hr:employee:read']}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Karyawan Aktif"
          value={stats?.totalActive ?? 0}
          icon={<Users className="h-6 w-6 text-blue-600" />}
          color="bg-blue-100"
          onClick={() => handleNavigate('status=ACTIVE')}
          loading={loading}
        />
        <StatCard
          title="Karyawan Baru Bulan Ini"
          value={stats?.newHiresThisMonth ?? 0}
          icon={<UserPlus className="h-6 w-6 text-green-600" />}
          color="bg-green-100"
          onClick={() => handleNavigate('newHires=true')}
          loading={loading}
        />
        <StatCard
          title="Sedang Cuti"
          value={stats?.onLeave ?? 0}
          icon={<Calendar className="h-6 w-6 text-purple-600" />}
          color="bg-purple-100"
          onClick={() => handleNavigate('status=ON_LEAVE')}
          loading={loading}
        />
        <StatCard
          title="Kontrak Akan Berakhir"
          value={stats?.contractsExpiringSoon ?? 0}
          icon={<FileWarning className="h-6 w-6 text-orange-600" />}
          color="bg-orange-100"
          onClick={() => handleNavigate('contractExpiring=true')}
          loading={loading}
        />
      </div>
    </PermissionGate>
  );
}