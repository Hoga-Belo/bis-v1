'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PermissionGate } from '@/components/auth/permission-gate';
import { RoleTable } from '@/components/roles/role-table';
import { rolesApi, Role } from '@/lib/api/endpoints/roles';

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRoles = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await rolesApi.getRoles();
      if (response.success && response.data) {
        setRoles(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      toast.error('Gagal memuat data role');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
          <p className="text-muted-foreground">Kelola role dan hak akses pengguna sistem</p>
        </div>
        <PermissionGate permissions={['user.role.create']}>
          <Link href="/roles/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Role
            </Button>
          </Link>
        </PermissionGate>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Role</CardTitle>
          <CardDescription>
            Daftar semua role yang tersedia dalam sistem. Role sistem tidak dapat diedit atau dihapus.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RoleTable roles={roles} isLoading={isLoading} onRefresh={fetchRoles} />
        </CardContent>
      </Card>
    </div>
  );
}