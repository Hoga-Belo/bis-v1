'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, KeyRound, UserX, Copy, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PermissionGate } from '@/components/auth/permission-gate';
import { ViewHistoryButton } from '@/components/audit';
import { RoleSelector } from '@/components/users/role-selector';
import { usersApi } from '@/lib/api/endpoints/users';
import { UserDetail } from '@/lib/types/user';

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await usersApi.getUser(userId);
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        toast.error('User tidak ditemukan');
        router.push('/users');
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      toast.error('Gagal memuat data user');
      router.push('/users');
    } finally {
      setIsLoading(false);
    }
  }, [userId, router]);

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId, fetchUser]);

  const handleResetPassword = async () => {
    setIsProcessing(true);
    try {
      const response = await usersApi.resetPassword(userId);
      if (response.success && response.data) {
        setNewPassword(response.data.defaultPassword);
        setShowResetDialog(false);
        setShowPasswordDialog(true);
        toast.success('Password berhasil direset');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal mereset password');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeactivate = async () => {
    setIsProcessing(true);
    try {
      const response = await usersApi.deactivateUser(userId);
      if (response.success) {
        toast.success('User berhasil dinonaktifkan');
        setShowDeactivateDialog(false);
        fetchUser();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menonaktifkan user');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(newPassword);
      setCopied(true);
      toast.success('Password berhasil disalin');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Gagal menyalin password');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">User tidak ditemukan</p>
        <Button variant="link" onClick={() => router.push('/users')}>
          Kembali ke daftar user
        </Button>
      </div>
    );
  }

  return (
    <PermissionGate
      permissions={['user:user:read']}
      fallback={
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">
            Anda tidak memiliki akses untuk melihat detail user.
          </p>
          <Button variant="link" onClick={() => router.push('/users')}>
            Kembali ke daftar user
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">{user.nik}</h1>
                {user.isActive ? (
                  <Badge variant="success">Aktif</Badge>
                ) : (
                  <Badge variant="destructive">Nonaktif</Badge>
                )}
                {user.isFirstLogin && (
                  <Badge variant="warning">First Login</Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                {user.employeeName || 'Tidak terhubung dengan karyawan'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <PermissionGate permissions={['audit:log:read']}>
              <ViewHistoryButton
                tableName="users"
                recordId={user.id}
                entityName={user.nik}
              />
            </PermissionGate>
            <PermissionGate permissions={['user:user:update']}>
              <Button
                variant="outline"
                onClick={() => setShowResetDialog(true)}
              >
                <KeyRound className="mr-2 h-4 w-4" />
                Reset Password
              </Button>
            </PermissionGate>
            <PermissionGate permissions={['user:user:delete']}>
              <Button
                variant="destructive"
                onClick={() => setShowDeactivateDialog(true)}
                disabled={!user.isActive}
              >
                <UserX className="mr-2 h-4 w-4" />
                Nonaktifkan
              </Button>
            </PermissionGate>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* User Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi User</CardTitle>
              <CardDescription>Detail akun user</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">NIK</p>
                  <p className="font-mono">{user.nik}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Employee ID</p>
                  <p>{user.employeeId || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nama</p>
                  <p>{user.employeeName || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <p>{user.isActive ? 'Aktif' : 'Nonaktif'}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Login Terakhir</p>
                  <p className="text-sm">{formatDate(user.lastLoginAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">First Login</p>
                  <p className="text-sm">{user.isFirstLogin ? 'Ya' : 'Tidak'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dibuat</p>
                  <p className="text-sm">{formatDate(user.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Diperbarui</p>
                  <p className="text-sm">{formatDate(user.updatedAt)}</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Role Saat Ini
                </p>
                <div className="flex flex-wrap gap-2">
                  {user.roles.map((role) => (
                    <Badge key={role.id} variant="secondary">
                      {role.name}
                    </Badge>
                  ))}
                  {user.roles.length === 0 && (
                    <span className="text-sm text-muted-foreground">
                      Tidak ada role
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role Assignment Card */}
          <Card>
            <CardHeader>
              <CardTitle>Kelola Role</CardTitle>
              <CardDescription>
                Assign atau unassign role untuk user ini
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PermissionGate
                permissions={['user:role:update']}
                fallback={
                  <div className="text-center py-8 text-muted-foreground">
                    Anda tidak memiliki akses untuk mengubah role user
                  </div>
                }
              >
                <RoleSelector
                  userId={userId}
                  currentRoles={user.roles}
                  onSuccess={fetchUser}
                />
              </PermissionGate>
            </CardContent>
          </Card>
        </div>

        {/* Permissions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Permissions</CardTitle>
            <CardDescription>
              Daftar permission yang dimiliki user berdasarkan role
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user.permissions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.permissions.map((permission) => (
                  <Badge key={permission} variant="outline" className="font-mono text-xs">
                    {permission}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                User tidak memiliki permission
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reset Password Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Password</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin mereset password untuk user{' '}
              <strong>{user.nik}</strong>? Password akan direset ke default.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetPassword} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                'Reset Password'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Deactivate Confirmation Dialog */}
      <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Nonaktifkan User</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menonaktifkan user <strong>{user.nik}</strong>?
              User yang dinonaktifkan tidak dapat login ke sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivate}
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                'Nonaktifkan'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* New Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Password Baru</DialogTitle>
            <DialogDescription>
              Password untuk user <strong>{user.nik}</strong> telah direset.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <p className="mb-2 text-sm font-medium text-muted-foreground">
                Password Baru:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-background px-3 py-2 font-mono text-lg">
                  {newPassword}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyPassword}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Pastikan untuk menyimpan password ini dan berikan kepada user.
              User akan diminta untuk mengubah password saat login pertama kali.
            </p>
            <div className="flex justify-end">
              <Button onClick={() => setShowPasswordDialog(false)}>
                Tutup
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PermissionGate>
  );
}