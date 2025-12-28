'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PermissionGate } from '@/components/auth/permission-gate';
import { UserForm } from '@/components/users/user-form';

export default function CreateUserPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/users');
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <PermissionGate
      permissions={['user.user.create']}
      fallback={
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">
            Anda tidak memiliki akses untuk membuat user baru.
          </p>
          <Button variant="link" onClick={() => router.push('/users')}>
            Kembali ke daftar user
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tambah User Baru</h1>
            <p className="text-muted-foreground">
              Buat akun user baru untuk mengakses sistem
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informasi User</CardTitle>
          </CardHeader>
          <CardContent>
            <UserForm onSuccess={handleSuccess} onCancel={handleCancel} />
          </CardContent>
        </Card>
      </div>
    </PermissionGate>
  );
}