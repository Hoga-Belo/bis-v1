'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RoleForm } from '@/components/roles/role-form';
import { PermissionGate } from '@/components/auth/permission-gate';
import { ViewHistoryButton } from '@/components/audit';
import { rolesApi, RoleDetail } from '@/lib/api/endpoints/roles';
import { CreateRoleRequest, UpdateRoleRequest } from '@/lib/types/role';

export default function EditRolePage() {
  const router = useRouter();
  const params = useParams();
  const roleId = params.id as string;

  const [role, setRole] = useState<RoleDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        setIsLoading(true);
        const response = await rolesApi.getRole(roleId);
        if (response.success && response.data) {
          // System roles should redirect to permissions page
          if (response.data.isSystem) {
            router.replace(`/roles/${roleId}/permissions`);
            return;
          }
          setRole(response.data);
        } else {
          toast.error('Role tidak ditemukan');
          router.push('/roles');
        }
      } catch (error) {
        console.error('Failed to fetch role:', error);
        toast.error('Gagal memuat data role');
        router.push('/roles');
      } finally {
        setIsLoading(false);
      }
    };

    if (roleId) {
      fetchRole();
    }
  }, [roleId, router]);

  const handleSubmit = async (data: CreateRoleRequest | UpdateRoleRequest) => {
    setIsSubmitting(true);
    try {
      const response = await rolesApi.updateRole(roleId, data);
      if (response.success) {
        toast.success('Role berhasil diperbarui');
        router.push('/roles');
      } else {
        toast.error(response.message || 'Gagal memperbarui role');
      }
    } catch (error) {
      console.error('Failed to update role:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal memperbarui role');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!role) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/roles">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Role</h1>
            <p className="text-muted-foreground">Perbarui informasi role {role.name}</p>
          </div>
        </div>
        <PermissionGate permissions={['audit:log:read']}>
          <ViewHistoryButton
            tableName="roles"
            recordId={role.id}
            entityName={role.name}
          />
        </PermissionGate>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Role</CardTitle>
          <CardDescription>
            Perbarui informasi role. Kode role tidak dapat diubah.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RoleForm
            role={role}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}