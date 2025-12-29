'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { attendanceApi } from '@/lib/api/endpoints/attendance';
import type { TodayAttendance, Attendance } from '@/lib/types/attendance';
import { toast } from 'sonner';
import { Clock, MapPin, LogIn, LogOut, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface ClockInOutCardProps {
  onClockAction?: (attendance: Attendance) => void;
}

export function ClockInOutCard({ onClockAction }: ClockInOutCardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayAttendance, setTodayAttendance] = useState<TodayAttendance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClocking, setIsClocking] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch today's attendance status
  const fetchTodayAttendance = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await attendanceApi.getTodayAttendance();
      if (response.success && response.data) {
        setTodayAttendance(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch today attendance:', error);
      toast.error('Gagal memuat status kehadiran hari ini');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodayAttendance();
  }, [fetchTodayAttendance]);

  // Get current location
  const getCurrentLocation = (): Promise<{ lat: number; lng: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setLocationError('Geolocation tidak didukung oleh browser Anda');
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationError(null);
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          let errorMessage = 'Gagal mendapatkan lokasi';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Izin lokasi ditolak. Silakan aktifkan izin lokasi.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Informasi lokasi tidak tersedia';
              break;
            case error.TIMEOUT:
              errorMessage = 'Waktu permintaan lokasi habis';
              break;
          }
          setLocationError(errorMessage);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  // Handle clock in
  const handleClockIn = async () => {
    try {
      setIsClocking(true);
      const location = await getCurrentLocation();
      
      const response = await attendanceApi.clockIn({
        location: location || undefined,
      });

      if (response.success && response.data) {
        toast.success('Clock In berhasil!');
        await fetchTodayAttendance();
        onClockAction?.(response.data);
      }
    } catch (error) {
      console.error('Clock in failed:', error);
      toast.error('Gagal melakukan Clock In');
    } finally {
      setIsClocking(false);
    }
  };

  // Handle clock out
  const handleClockOut = async () => {
    try {
      setIsClocking(true);
      const location = await getCurrentLocation();
      
      const response = await attendanceApi.clockOut({
        location: location || undefined,
      });

      if (response.success && response.data) {
        toast.success('Clock Out berhasil!');
        await fetchTodayAttendance();
        onClockAction?.(response.data);
      }
    } catch (error) {
      console.error('Clock out failed:', error);
      toast.error('Gagal melakukan Clock Out');
    } finally {
      setIsClocking(false);
    }
  };

  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get status display
  const getStatusDisplay = () => {
    if (!todayAttendance?.attendance) {
      return {
        text: 'Belum Clock In',
        variant: 'secondary' as const,
        icon: <XCircle className="h-4 w-4" />,
      };
    }

    const { clockIn, clockOut } = todayAttendance.attendance;

    if (clockIn && clockOut) {
      return {
        text: 'Sudah Clock Out',
        variant: 'success' as const,
        icon: <CheckCircle className="h-4 w-4" />,
      };
    }

    if (clockIn && !clockOut) {
      return {
        text: 'Sudah Clock In',
        variant: 'default' as const,
        icon: <Clock className="h-4 w-4" />,
      };
    }

    return {
      text: 'Belum Clock In',
      variant: 'secondary' as const,
      icon: <XCircle className="h-4 w-4" />,
    };
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  const status = getStatusDisplay();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Kehadiran Hari Ini
          </span>
          <Badge variant={status.variant} className="flex items-center gap-1">
            {status.icon}
            {status.text}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Time Display */}
        <div className="text-center py-4 bg-muted/50 rounded-lg">
          <div className="text-4xl font-bold font-mono">
            {formatTime(currentTime)}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {formatDate(currentTime)}
          </div>
        </div>

        {/* Today's Attendance Info */}
        {todayAttendance?.attendance && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="text-muted-foreground">Clock In</div>
              <div className="font-medium flex items-center gap-1">
                <LogIn className="h-4 w-4 text-green-600" />
                {todayAttendance.attendance.clockIn || '-'}
              </div>
              {todayAttendance.attendance.clockInLocation && (
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Lokasi tercatat
                </div>
              )}
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">Clock Out</div>
              <div className="font-medium flex items-center gap-1">
                <LogOut className="h-4 w-4 text-red-600" />
                {todayAttendance.attendance.clockOut || '-'}
              </div>
              {todayAttendance.attendance.clockOutLocation && (
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Lokasi tercatat
                </div>
              )}
            </div>
          </div>
        )}

        {/* Work Hours */}
        {todayAttendance?.attendance?.workHours !== undefined && (
          <div className="text-center text-sm">
            <span className="text-muted-foreground">Jam Kerja: </span>
            <span className="font-medium">
              {todayAttendance.attendance.workHours.toFixed(2)} jam
            </span>
          </div>
        )}

        {/* Location Error */}
        {locationError && (
          <div className="text-sm text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {locationError}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            className="flex-1"
            onClick={handleClockIn}
            disabled={!todayAttendance?.canClockIn || isClocking}
          >
            {isClocking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            Clock In
          </Button>
          <Button
            className="flex-1"
            variant="outline"
            onClick={handleClockOut}
            disabled={!todayAttendance?.canClockOut || isClocking}
          >
            {isClocking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            Clock Out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}