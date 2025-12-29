'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Attendance, AttendanceStatus } from '@/lib/types/attendance';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface AttendanceCalendarProps {
  data: Attendance[];
  isLoading?: boolean;
  onDayClick?: (date: string, attendance?: Attendance) => void;
  month?: number; // 0-11
  year?: number;
  onMonthChange?: (month: number, year: number) => void;
}

// Status color configuration
const statusColors: Record<AttendanceStatus, string> = {
  PRESENT: 'bg-green-500',
  LATE: 'bg-yellow-500',
  ABSENT: 'bg-red-500',
  LEAVE: 'bg-blue-500',
  SICK: 'bg-purple-500',
  PERMIT: 'bg-orange-500',
  HOLIDAY: 'bg-gray-400',
  WEEKEND: 'bg-gray-300',
};

const statusLabels: Record<AttendanceStatus, string> = {
  PRESENT: 'Hadir',
  LATE: 'Terlambat',
  ABSENT: 'Tidak Hadir',
  LEAVE: 'Cuti',
  SICK: 'Sakit',
  PERMIT: 'Izin',
  HOLIDAY: 'Libur',
  WEEKEND: 'Akhir Pekan',
};

const DAYS_OF_WEEK = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function AttendanceCalendar({
  data,
  isLoading = false,
  onDayClick,
  month: propMonth,
  year: propYear,
  onMonthChange,
}: AttendanceCalendarProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(propMonth ?? today.getMonth());
  const [currentYear, setCurrentYear] = useState(propYear ?? today.getFullYear());

  // Create attendance map by date
  const attendanceMap = useMemo(() => {
    const map = new Map<string, Attendance>();
    data.forEach((attendance) => {
      map.set(attendance.date, attendance);
    });
    return map;
  }, [data]);

  // Get calendar days
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const startingDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const days: Array<{
      date: Date | null;
      dateString: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      attendance?: Attendance;
    }> = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({
        date: null,
        dateString: '',
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateString = date.toISOString().split('T')[0];
      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

      days.push({
        date,
        dateString,
        isCurrentMonth: true,
        isToday,
        attendance: attendanceMap.get(dateString),
      });
    }

    return days;
  }, [currentMonth, currentYear, attendanceMap, today]);

  // Handle month navigation
  const handlePreviousMonth = () => {
    let newMonth = currentMonth - 1;
    let newYear = currentYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    onMonthChange?.(newMonth, newYear);
  };

  const handleNextMonth = () => {
    let newMonth = currentMonth + 1;
    let newYear = currentYear;
    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    onMonthChange?.(newMonth, newYear);
  };

  // Handle day click
  const handleDayClick = (dateString: string, attendance?: Attendance) => {
    if (dateString && onDayClick) {
      onDayClick(dateString, attendance);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={`header-${i}`} className="h-8 w-full" />
            ))}
            {[...Array(35)].map((_, i) => (
              <Skeleton key={`day-${i}`} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {MONTHS[currentMonth]} {currentYear}
          </CardTitle>
          <div className="flex gap-1">
            <Button variant="outline" size="icon-sm" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon-sm" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`
                min-h-[60px] p-1 rounded-md border transition-colors
                ${day.isCurrentMonth ? 'bg-background' : 'bg-muted/30'}
                ${day.isToday ? 'border-primary border-2' : 'border-border'}
                ${day.date && onDayClick ? 'cursor-pointer hover:bg-muted/50' : ''}
              `}
              onClick={() => day.date && handleDayClick(day.dateString, day.attendance)}
            >
              {day.date && (
                <>
                  <div
                    className={`
                      text-sm font-medium
                      ${day.isToday ? 'text-primary' : ''}
                      ${day.date.getDay() === 0 || day.date.getDay() === 6 ? 'text-muted-foreground' : ''}
                    `}
                  >
                    {day.date.getDate()}
                  </div>
                  {day.attendance && (
                    <div className="mt-1">
                      <div
                        className={`
                          w-full h-2 rounded-full
                          ${statusColors[day.attendance.status]}
                        `}
                        title={statusLabels[day.attendance.status]}
                      />
                      {day.attendance.clockIn && (
                        <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
                          {day.attendance.clockIn}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-3 justify-center">
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded-full ${color}`} />
              <span className="text-xs text-muted-foreground">
                {statusLabels[status as AttendanceStatus]}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}