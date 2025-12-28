'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RoleForm } from '@/components/roles/role-form';
import { rolesApi } from '@/lib/api/endpoints/roles';
import { CreateRoleRequest, UpdateRoleRequest } from '@/lib/types/role';

export default function CreateRolePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreateRoleRequest | UpdateRoleRequest) => {
    setIsSubmitting(true);
    try {
      const response = await rolesApi.createRole(data as CreateRoleRequest);
      if (response.success) {
        toast.success('Role berhasil dibuat');
        router.push('/roles');
      } else {
        toast.error(response.message || 'Gagal membuat role');
      }
    } catch (error) {
      console.error('Failed to create role:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal membuat role');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/roles">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tambah Role</h1>
          <p className="text-muted-foreground">Buat role baru untuk sistem</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Role</CardTitle>
          <CardDescription>
            Masukkan informasi role yang akan dibuat. Kode role harus unik dan akan digunakan sebagai identifier.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RoleForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </CardContent>
      </Card>
    </div>
  );
}