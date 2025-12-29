'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { PermissionGate } from '@/components/auth/permission-gate';
import {
  ClockInOutCard,
  AttendanceTable,
  AttendanceCalendar,
  AttendanceStatsCard,
} from '@/components/hr/attendance';
import { attendanceApi } from '@/lib/api/endpoints/attendance';
import type { Attendance, AttendanceStatistics } from '@/lib/types/attendance';
import { Clock } from 'lucide-react';

export default function MyAttendancePage() {
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [statistics, setStatistics] = useState<AttendanceStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Fetch attendance data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Get current month's date range
        const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

        const [attendanceData, statsData] = await Promise.all([
          attendanceApi.getMyAttendance({
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
          }),
          attendanceApi.getMyStatistics({
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
          }),
        ]);

        setAttendanceRecords(attendanceData.data || []);
        setStatistics(statsData);
      } catch (err) {
        console.error('Error fetching attendance data:', err);
        setError('Gagal memuat data kehadiran');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentMonth]);

  const handleMonthChange = (date: Date) => {
    setCurrentMonth(date);
  };

  const handleRefresh = () => {
    // Trigger re-fetch by updating the month state
    setCurrentMonth(new Date(currentMonth));
  };

  return (
    <PermissionGate permission="hr:attendance:read">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <Clock className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Kehadiran Saya</h1>
            <p className="text-muted-foreground">
              Kelola kehadiran dan lihat riwayat absensi Anda
            </p>
          </div>
        </div>

        {/* Clock In/Out Card */}
        <ClockInOutCard onClockAction={handleRefresh} />

        {/* Statistics */}
        {isLoading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : statistics ? (
          <AttendanceStatsCard statistics={statistics} />
        ) : null}

        {/* Error Message */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Tabs for History and Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Kehadiran</CardTitle>
            <CardDescription>
              Lihat riwayat kehadiran Anda dalam bentuk tabel atau kalender
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="history" className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="history">Riwayat</TabsTrigger>
                <TabsTrigger value="calendar">Kalender</TabsTrigger>
              </TabsList>

              <TabsContent value="history" className="mt-6">
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <AttendanceTable
                    data={attendanceRecords}
                    showEmployee={false}
                    showActions={false}
                  />
                )}
              </TabsContent>

              <TabsContent value="calendar" className="mt-6">
                <AttendanceCalendar
                  attendanceRecords={attendanceRecords}
                  currentMonth={currentMonth}
                  onMonthChange={handleMonthChange}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PermissionGate>
  );
}