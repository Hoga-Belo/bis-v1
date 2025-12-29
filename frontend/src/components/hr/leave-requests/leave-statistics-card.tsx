'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { leaveApi } from '@/lib/api/endpoints/leave';
import type { LeaveStatistics } from '@/lib/types/leave';
import {
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Ban,
  Calendar,
  Thermometer,
  MoreHorizontal,
} from 'lucide-react';

interface LeaveStatisticsCardProps {
  year?: number;
}

export function LeaveStatisticsCard({ year }: LeaveStatisticsCardProps) {
  const [statistics, setStatistics] = useState<LeaveStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setIsLoading(true);
        const response = await leaveApi.getStatistics(year);
        if (response.success && response.data) {
          setStatistics(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch leave statistics:', error);
        toast.error('Gagal memuat statistik cuti');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatistics();
  }, [year]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Statistik Cuti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!statistics) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Statistik Cuti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Tidak ada data statistik
          </p>
        </CardContent>
      </Card>
    );
  }

  const stats = [
    {
      label: 'Total Pengajuan',
      value: statistics.totalRequests,
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Menunggu',
      value: statistics.pendingRequests,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      label: 'Disetujui',
      value: statistics.approvedRequests,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Ditolak',
      value: statistics.rejectedRequests,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      label: 'Dibatalkan',
      value: statistics.cancelledRequests,
      icon: Ban,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
    },
    {
      label: 'Cuti Tahunan',
      value: `${statistics.totalAnnualDaysTaken} hari`,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Cuti Sakit',
      value: `${statistics.totalSickDaysTaken} hari`,
      icon: Thermometer,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: 'Cuti Lainnya',
      value: `${statistics.totalOtherDaysTaken} hari`,
      icon: MoreHorizontal,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Statistik Cuti {year ? `Tahun ${year}` : 'Tahun Ini'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg border"
              >
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-xl font-semibold">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}