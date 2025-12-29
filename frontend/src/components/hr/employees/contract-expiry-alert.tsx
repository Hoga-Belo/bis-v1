'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Calendar, User, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PermissionGate } from '@/components/auth';
import { employeesApi } from '@/lib/api/endpoints/hr';
import { ContractExpiringEmployee } from '@/lib/types/hr';

interface ContractExpiryAlertProps {
  daysThreshold?: number;
  maxItems?: number;
}

function getUrgencyColor(daysRemaining: number): string {
  if (daysRemaining <= 7) return 'bg-red-100 text-red-800 border-red-200';
  if (daysRemaining <= 14) return 'bg-orange-100 text-orange-800 border-orange-200';
  return 'bg-yellow-100 text-yellow-800 border-yellow-200';
}

function getUrgencyBadgeVariant(
  daysRemaining: number
): 'destructive' | 'default' | 'secondary' {
  if (daysRemaining <= 7) return 'destructive';
  if (daysRemaining <= 14) return 'default';
  return 'secondary';
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function calculateDaysRemaining(contractEndDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(contractEndDate);
  endDate.setHours(0, 0, 0, 0);
  const diffTime = endDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function ContractExpiryAlert({
  daysThreshold = 30,
  maxItems = 5,
}: ContractExpiryAlertProps) {
  const [employees, setEmployees] = useState<ContractExpiringEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExpiringContracts = async () => {
      try {
        setLoading(true);
        const response = await employeesApi.getExpiringContracts(daysThreshold);
        if (response.success && response.data) {
          setEmployees(response.data.slice(0, maxItems));
        }
      } catch (err) {
        setError('Gagal memuat data kontrak');
        console.error('Error fetching expiring contracts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExpiringContracts();
  }, [daysThreshold, maxItems]);

  return (
    <PermissionGate permissions={['hr:employee:read']}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Kontrak Akan Berakhir
          </CardTitle>
          <Link
            href="/hr/employees?contractExpiring=true"
            className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
          >
            Lihat Semua
            <ChevronRight className="h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-4 text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-500" />
              <p>{error}</p>
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Calendar className="h-10 w-10 mx-auto mb-2 text-green-500" />
              <p className="font-medium">Tidak ada kontrak yang akan berakhir</p>
              <p className="text-sm">
                dalam {daysThreshold} hari ke depan
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {employees.map((employee) => {
                const daysRemaining = calculateDaysRemaining(employee.contractEndDate);
                return (
                  <Link
                    key={employee.id}
                    href={`/hr/employees/${employee.id}`}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors hover:bg-accent ${getUrgencyColor(daysRemaining)}`}
                  >
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{employee.fullName}</p>
                      <p className="text-sm opacity-80">{employee.nik}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <Badge variant={getUrgencyBadgeVariant(daysRemaining)}>
                        {daysRemaining} hari
                      </Badge>
                      <p className="text-xs mt-1 opacity-80">
                        {formatDate(employee.contractEndDate)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </PermissionGate>
  );
}