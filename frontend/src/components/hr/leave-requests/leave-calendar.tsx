'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { leaveApi } from '@/lib/api/endpoints/leave';
import { LeaveType, LeaveStatus, type LeaveRequest } from '@/lib/types/leave';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

// Leave type labels in Indonesian
const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  [LeaveType.ANNUAL]: 'Cuti Tahunan',
  [LeaveType.SICK]: 'Cuti Sakit',
  [LeaveType.MATERNITY]: 'Cuti Melahirkan',
  [LeaveType.PATERNITY]: 'Cuti Ayah',
  [LeaveType.MARRIAGE]: 'Cuti Menikah',
  [LeaveType.BEREAVEMENT]: 'Cuti Duka',
  [LeaveType.UNPAID]: 'Cuti Tanpa Gaji',
  [LeaveType.OTHER]: 'Cuti Lainnya',
  [LeaveType.PERMIT]: 'Cuti Izin',
};

// Leave type colors for calendar
const LEAVE_TYPE_COLORS: Record<LeaveType, string> = {
  [LeaveType.ANNUAL]: 'bg-blue-500',
  [LeaveType.SICK]: 'bg-purple-500',
  [LeaveType.MATERNITY]: 'bg-pink-500',
  [LeaveType.PATERNITY]: 'bg-cyan-500',
  [LeaveType.MARRIAGE]: 'bg-rose-500',
  [LeaveType.BEREAVEMENT]: 'bg-slate-500',
  [LeaveType.UNPAID]: 'bg-orange-500',
  [LeaveType.OTHER]: 'bg-gray-500',
  [LeaveType.PERMIT]: 'bg-teal-500',
};

// Status colors for opacity
const STATUS_OPACITY: Record<LeaveStatus, string> = {
  [LeaveStatus.PENDING]: 'opacity-50',
  [LeaveStatus.APPROVED]: 'opacity-100',
  [LeaveStatus.REJECTED]: 'opacity-30 line-through',
  [LeaveStatus.CANCELLED]: 'opacity-30 line-through',
};

interface LeaveCalendarProps {
  employeeId?: string;
}

export function LeaveCalendar({ employeeId }: LeaveCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Fetch leave requests for the current year
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setIsLoading(true);
        const response = await leaveApi.getMyRequests({
          year,
          employeeId,
        });
        if (response.success && response.data) {
          setRequests(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch leave requests:', error);
        toast.error('Gagal memuat data cuti');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [year, employeeId]);

  // Get days in month
  const daysInMonth = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    // Add padding days from previous month
    const startPadding = firstDay.getDay();
    for (let i = startPadding - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push(date);
    }

    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    // Add padding days from next month
    const endPadding = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= endPadding; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  }, [year, month]);

  // Get leave requests for a specific day
  const getRequestsForDay = (date: Date): LeaveRequest[] => {
    const dateStr = date.toISOString().split('T')[0];
    return requests.filter((request) => {
      const start = new Date(request.startDate);
      const end = new Date(request.endDate);
      const current = new Date(dateStr);
      return current >= start && current <= end;
    });
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Navigate to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Format month name
  const monthName = currentDate.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  });

  // Day names
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Check if date is in current month
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === month;
  };

  // Get requests for selected day
  const selectedDayRequests = selectedDay ? getRequestsForDay(selectedDay) : [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Kalender Cuti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-32" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {[...Array(42)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Kalender Cuti
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Hari Ini
            </Button>
            <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[140px] text-center">
              {monthName}
            </span>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1">
            {dayNames.map((day) => (
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
            {daysInMonth.map((date, index) => {
              const dayRequests = getRequestsForDay(date);
              const hasRequests = dayRequests.length > 0;
              const isSelected =
                selectedDay &&
                date.toDateString() === selectedDay.toDateString();

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDay(date)}
                  className={`
                    relative h-12 p-1 text-sm rounded-md transition-colors
                    ${isCurrentMonth(date) ? 'text-foreground' : 'text-muted-foreground'}
                    ${isToday(date) ? 'bg-primary/10 font-bold' : ''}
                    ${isSelected ? 'ring-2 ring-primary' : ''}
                    ${hasRequests ? 'cursor-pointer hover:bg-muted' : 'hover:bg-muted/50'}
                  `}
                >
                  <span className="absolute top-1 left-2">{date.getDate()}</span>
                  {hasRequests && (
                    <div className="absolute bottom-1 left-1 right-1 flex gap-0.5 justify-center">
                      {dayRequests.slice(0, 3).map((request, i) => (
                        <div
                          key={i}
                          className={`
                            h-1.5 w-1.5 rounded-full
                            ${LEAVE_TYPE_COLORS[request.leaveType]}
                            ${STATUS_OPACITY[request.status]}
                          `}
                          title={LEAVE_TYPE_LABELS[request.leaveType]}
                        />
                      ))}
                      {dayRequests.length > 3 && (
                        <span className="text-[8px] text-muted-foreground">
                          +{dayRequests.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 pt-2 border-t">
            {Object.entries(LEAVE_TYPE_LABELS).map(([type, label]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div
                  className={`h-3 w-3 rounded-full ${LEAVE_TYPE_COLORS[type as LeaveType]}`}
                />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>

          {/* Selected day details */}
          {selectedDay && (
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">
                {selectedDay.toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </h4>
              {selectedDayRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Tidak ada cuti pada tanggal ini
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedDayRequests.map((request) => (
                    <div
                      key={request.id}
                      className={`
                        flex items-center justify-between p-2 rounded-md border
                        ${STATUS_OPACITY[request.status]}
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-3 w-3 rounded-full ${LEAVE_TYPE_COLORS[request.leaveType]}`}
                        />
                        <span className="text-sm">
                          {LEAVE_TYPE_LABELS[request.leaveType]}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          request.status === LeaveStatus.APPROVED
                            ? 'bg-green-100 text-green-800'
                            : request.status === LeaveStatus.PENDING
                              ? 'bg-yellow-100 text-yellow-800'
                              : request.status === LeaveStatus.REJECTED
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {request.status === LeaveStatus.APPROVED
                          ? 'Disetujui'
                          : request.status === LeaveStatus.PENDING
                            ? 'Menunggu'
                            : request.status === LeaveStatus.REJECTED
                              ? 'Ditolak'
                              : 'Dibatalkan'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}