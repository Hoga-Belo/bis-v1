'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { AttendanceStatistics } from '@/lib/types/attendance';
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Briefcase,
  Thermometer,
  Timer,
  TrendingUp,
} from 'lucide-react';

interface AttendanceStatsCardProps {
  statistics: AttendanceStatistics | null;
  isLoading?: boolean;
  title?: string;
  period?: string;
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: string;
}

function StatItem({ icon, label, value, color = 'text-foreground' }: StatItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
      <div className={`${color}`}>{icon}</div>
      <div>
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className={`text-lg font-semibold ${color}`}>{value}</div>
      </div>
    </div>
  );
}

export function AttendanceStatsCard({
  statistics,
  isLoading = false,
  title = 'Statistik Kehadiran',
  period,
}: AttendanceStatsCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="p-3 rounded-lg bg-muted/50">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-6 w-12" />
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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Tidak ada data statistik
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatHours = (hours: number) => {
    return `${hours.toFixed(1)} jam`;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {title}
          </span>
          {period && (
            <span className="text-sm font-normal text-muted-foreground">
              {period}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatItem
            icon={<Calendar className="h-5 w-5" />}
            label="Total Hari Kerja"
            value={statistics.totalDays}
            color="text-blue-600"
          />
          <StatItem
            icon={<CheckCircle className="h-5 w-5" />}
            label="Hadir"
            value={statistics.presentDays}
            color="text-green-600"
          />
          <StatItem
            icon={<XCircle className="h-5 w-5" />}
            label="Tidak Hadir"
            value={statistics.absentDays}
            color="text-red-600"
          />
          <StatItem
            icon={<Clock className="h-5 w-5" />}
            label="Terlambat"
            value={statistics.lateDays}
            color="text-yellow-600"
          />
          <StatItem
            icon={<Briefcase className="h-5 w-5" />}
            label="Cuti"
            value={statistics.leaveDays}
            color="text-blue-600"
          />
          <StatItem
            icon={<Thermometer className="h-5 w-5" />}
            label="Sakit"
            value={statistics.sickDays}
            color="text-purple-600"
          />
          <StatItem
            icon={<Timer className="h-5 w-5" />}
            label="Rata-rata Jam Kerja"
            value={formatHours(statistics.averageWorkHours)}
            color="text-teal-600"
          />
          <StatItem
            icon={<TrendingUp className="h-5 w-5" />}
            label="Total Lembur"
            value={formatHours(statistics.totalOvertimeHours)}
            color="text-orange-600"
          />
        </div>

        {/* Summary Bar */}
        <div className="mt-6">
          <div className="text-sm text-muted-foreground mb-2">
            Tingkat Kehadiran
          </div>
          <div className="h-4 bg-muted rounded-full overflow-hidden flex">
            {statistics.totalDays > 0 && (
              <>
                <div
                  className="bg-green-500 h-full transition-all"
                  style={{
                    width: `${(statistics.presentDays / statistics.totalDays) * 100}%`,
                  }}
                  title={`Hadir: ${statistics.presentDays} hari`}
                />
                <div
                  className="bg-yellow-500 h-full transition-all"
                  style={{
                    width: `${(statistics.lateDays / statistics.totalDays) * 100}%`,
                  }}
                  title={`Terlambat: ${statistics.lateDays} hari`}
                />
                <div
                  className="bg-blue-500 h-full transition-all"
                  style={{
                    width: `${(statistics.leaveDays / statistics.totalDays) * 100}%`,
                  }}
                  title={`Cuti: ${statistics.leaveDays} hari`}
                />
                <div
                  className="bg-purple-500 h-full transition-all"
                  style={{
                    width: `${(statistics.sickDays / statistics.totalDays) * 100}%`,
                  }}
                  title={`Sakit: ${statistics.sickDays} hari`}
                />
                <div
                  className="bg-red-500 h-full transition-all"
                  style={{
                    width: `${(statistics.absentDays / statistics.totalDays) * 100}%`,
                  }}
                  title={`Tidak Hadir: ${statistics.absentDays} hari`}
                />
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-4 mt-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Hadir ({statistics.presentDays})</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span>Terlambat ({statistics.lateDays})</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Cuti ({statistics.leaveDays})</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span>Sakit ({statistics.sickDays})</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>Tidak Hadir ({statistics.absentDays})</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}