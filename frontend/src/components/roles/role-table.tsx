'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MoreHorizontal,
  Pencil,
  Shield,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Skeleton } from '@/components/ui/skeleton';
import { PermissionGate } from '@/components/auth/permission-gate';
import { Role } from '@/lib/api/endpoints/roles';
import { rolesApi } from '@/lib/api/endpoints/roles';

interface RoleTableProps {
  roles: Role[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function RoleTable({ roles, isLoading, onRefresh }: RoleTableProps) {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!selectedRole) return;

    setIsDeleting(true);
    try {
      const response = await rolesApi.deleteRole(selectedRole.id);
      if (response.success) {
        toast.success('Role berhasil dihapus');
        setShowDeleteDialog(false);
        onRefresh?.();
      } else {
        toast.error(response.message || 'Gagal menghapus role');
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Gagal menghapus role'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">Tidak ada data role</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Kode</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead className="text-center">Jumlah User</TableHead>
              <TableHead className="w-[70px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="font-medium">{role.name}</TableCell>
                <TableCell>
                  <code className="rounded bg-muted px-2 py-1 text-sm">
                    {role.code}
                  </code>
                </TableCell>
                <TableCell className="max-w-[300px] truncate">
                  {role.description || '-'}
                </TableCell>
                <TableCell>
                  {role.isSystem ? (
                    <Badge variant="secondary">System</Badge>
                  ) : (
                    <Badge variant="outline">Custom</Badge>
                  )}
                </TableCell>
                <TableCell className="text-center">{role.userCount}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!role.isSystem && (
                        <PermissionGate permissions={['user.role.update']}>
                          <DropdownMenuItem
                            onClick={() => router.push(`/roles/${role.id}`)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        </PermissionGate>
                      )}
                      <PermissionGate permissions={['user.permission.update']}>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/roles/${role.id}/permissions`)
                          }
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          Kelola Permissions
                        </DropdownMenuItem>
                      </PermissionGate>
                      {!role.isSystem && (
                        <PermissionGate permissions={['user.role.delete']}>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setSelectedRole(role);
                              setShowDeleteDialog(true);
                            }}
                            disabled={role.userCount > 0}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
                          </DropdownMenuItem>
                        </PermissionGate>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Role</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus role{' '}
              <strong>{selectedRole?.name}</strong>? Tindakan ini tidak dapat
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}