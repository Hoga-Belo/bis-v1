'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/lib/hooks/use-auth';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

function ProfileSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-32" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="mt-2 h-4 w-48" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-40" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-56" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="mt-4 h-9 w-40" />
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-24" />
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-28" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-4 w-48" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function formatDate(value?: string | null): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
}

function ProfileContent() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const displayName = useMemo(() => {
    // Saat ini type User hanya punya nik & roles; name/email opsional dari backend
    const withName = user as unknown as { name?: string | null; fullName?: string | null };
    return withName.name ?? withName.fullName ?? user?.nik ?? '-';
  }, [user]);

  const email = (user as unknown as { email?: string | null })?.email ?? null;

  if (isLoading || !user) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profil Saya</h1>
        <p className="text-muted-foreground">
          Informasi akun dan aktivitas login Anda di sistem Bebang BIS.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profil utama */}
        <Card>
          <CardHeader>
            <CardTitle>Profil</CardTitle>
            <CardDescription>Detail identitas akun yang sedang login.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">NIK</p>
              <p className="text-sm font-semibold">{user.nik}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Nama</p>
              <p className="text-sm font-semibold">{displayName}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Email</p>
              <p className="text-sm">{email || '-'}</p>
            </div>

            <Button
              type="button"
              className="mt-2"
              onClick={() => router.push('/change-password')}
            >
              Ganti Password
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Roles */}
          <Card>
            <CardHeader>
              <CardTitle>Roles</CardTitle>
              <CardDescription>Hak akses peran yang dimiliki akun Anda.</CardDescription>
            </CardHeader>
            <CardContent>
              {user.roles && user.roles.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.roles.map((role) => (
                    <Badge key={role} variant="secondary" className="uppercase tracking-tight">
                      {role}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Tidak ada role yang terdaftar.</p>
              )}
            </CardContent>
          </Card>

          {/* Aktivitas */}
          <Card>
            <CardHeader>
              <CardTitle>Aktivitas</CardTitle>
              <CardDescription>Ringkasan aktivitas login akun Anda.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Login terakhir</span>
                <span className="font-medium">
                  {formatDate((user as unknown as { lastLoginAt?: string | null }).lastLoginAt)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Akun dibuat</span>
                <span className="font-medium">
                  {formatDate((user as unknown as { createdAt?: string }).createdAt)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}