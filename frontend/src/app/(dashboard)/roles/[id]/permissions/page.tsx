'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PermissionTree } from '@/components/roles/permission-tree';
import { rolesApi, RoleDetail, PermissionGroup } from '@/lib/api/endpoints/roles';

export default function RolePermissionsPage() {
  const router = useRouter();
  const params = useParams();
  const roleId = params.id as string;

  const [role, setRole] = useState<RoleDetail | null>(null);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [roleResponse, permissionsResponse] = await Promise.all([
        rolesApi.getRole(roleId),
        rolesApi.getPermissions(),
      ]);

      if (roleResponse.success && roleResponse.data) {
        setRole(roleResponse.data);
        // Set initial selected permissions from role
        const currentPermissionIds = roleResponse.data.permissions?.map((p) => p.id) || [];
        setSelectedPermissionIds(currentPermissionIds);
      } else {
        toast.error('Role tidak ditemukan');
        router.push('/roles');
        return;
      }

      if (permissionsResponse.success && permissionsResponse.data) {
        setPermissionGroups(permissionsResponse.data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Gagal memuat data');
      router.push('/roles');
    } finally {
      setIsLoading(false);
    }
  }, [roleId, router]);

  useEffect(() => {
    if (roleId) {
      fetchData();
    }
  }, [roleId, fetchData]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await rolesApi.assignPermissions(roleId, {
        permissionIds: selectedPermissionIds,
      });

      if (response.success) {
        toast.success('Permissions berhasil diperbarui');
        // Refresh data to get updated permissions
        fetchData();
      } else {
        toast.error(response.message || 'Gagal memperbarui permissions');
      }
    } catch (error) {
      console.error('Failed to save permissions:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal memperbarui permissions');
    } finally {
      setIsSaving(false);
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
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
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
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Kelola Permissions</h1>
              {role.isSystem && <Badge variant="secondary">System Role</Badge>}
            </div>
            <p className="text-muted-foreground">
              Atur permissions untuk role <strong>{role.name}</strong>
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Permissions</CardTitle>
          <CardDescription>
            Pilih permissions yang akan diberikan ke role ini. Permissions dikelompokkan berdasarkan modul.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PermissionTree
            permissionGroups={permissionGroups}
            selectedPermissionIds={selectedPermissionIds}
            onSelectionChange={setSelectedPermissionIds}
            disabled={isSaving}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </Button>
      </div>
    </div>
  );
}