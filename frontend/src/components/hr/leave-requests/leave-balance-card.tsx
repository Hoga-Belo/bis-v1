'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { leaveApi } from '@/lib/api/endpoints/leave';
import type { LeaveBalance } from '@/lib/types/leave';
import { Calendar, Thermometer } from 'lucide-react';

interface LeaveBalanceCardProps {
  balance?: LeaveBalance | null;
  isLoading?: boolean;
  showFetch?: boolean;
}

// Default annual leave quota (can be configured)
const DEFAULT_ANNUAL_QUOTA = 12;
const DEFAULT_SICK_QUOTA = 12;

export function LeaveBalanceCard({
  balance: externalBalance,
  isLoading: externalLoading,
  showFetch = true,
}: LeaveBalanceCardProps) {
  const [balance, setBalance] = useState<LeaveBalance | null>(externalBalance || null);
  const [isLoading, setIsLoading] = useState(externalLoading ?? showFetch);

  useEffect(() => {
    if (externalBalance) {
      setBalance(externalBalance);
      return;
    }

    if (!showFetch) return;

    const fetchBalance = async () => {
      try {
        setIsLoading(true);
        const response = await leaveApi.getBalance();
        if (response.success && response.data) {
          setBalance(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch leave balance:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
  }, [externalBalance, showFetch]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const annualUsed = DEFAULT_ANNUAL_QUOTA - (balance?.annualLeaveBalance ?? DEFAULT_ANNUAL_QUOTA);
  const sickUsed = DEFAULT_SICK_QUOTA - (balance?.sickLeaveBalance ?? DEFAULT_SICK_QUOTA);

  const annualPercentage = (annualUsed / DEFAULT_ANNUAL_QUOTA) * 100;
  const sickPercentage = (sickUsed / DEFAULT_SICK_QUOTA) * 100;

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getTextColor = (remaining: number, total: number) => {
    const percentage = ((total - remaining) / total) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Sisa Cuti</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Annual Leave */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Cuti Tahunan</span>
              </div>
              <span className={`text-sm font-bold ${getTextColor(balance?.annualLeaveBalance ?? DEFAULT_ANNUAL_QUOTA, DEFAULT_ANNUAL_QUOTA)}`}>
                {balance?.annualLeaveBalance ?? DEFAULT_ANNUAL_QUOTA} / {DEFAULT_ANNUAL_QUOTA} hari
              </span>
            </div>
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className={`h-full transition-all duration-300 ease-in-out ${getProgressColor(annualPercentage)}`}
                style={{ width: `${annualPercentage}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Terpakai: {annualUsed} hari
            </p>
          </div>

          {/* Sick Leave */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Cuti Sakit</span>
              </div>
              <span className={`text-sm font-bold ${getTextColor(balance?.sickLeaveBalance ?? DEFAULT_SICK_QUOTA, DEFAULT_SICK_QUOTA)}`}>
                {balance?.sickLeaveBalance ?? DEFAULT_SICK_QUOTA} / {DEFAULT_SICK_QUOTA} hari
              </span>
            </div>
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className={`h-full transition-all duration-300 ease-in-out ${getProgressColor(sickPercentage)}`}
                style={{ width: `${sickPercentage}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Terpakai: {sickUsed} hari
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}