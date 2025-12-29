'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PermissionGate } from '@/components/auth/permission-gate';
import { usePermissions } from '@/lib/hooks/use-permissions';
import { UserTable } from '@/components/users/user-table';
import { usersApi } from '@/lib/api/endpoints/users';
import { rolesApi, Role } from '@/lib/api/endpoints/roles';
import { UserListItem, UserQueryParams, PaginatedResponse } from '@/lib/types/user';
import { Plus, Search, X } from 'lucide-react';

export default function UsersPage() {
  const router = useRouter();
  const { can } = usePermissions();
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const fetchUsers = useCallback(async (params?: UserQueryParams) => {
    setIsLoading(true);
    try {
      const response = await usersApi.getUsers(params);
      if (response.success && response.data) {
        const paginatedData = response.data as PaginatedResponse<UserListItem>;
        setUsers(paginatedData.data);
        setPagination(paginatedData.meta);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Gagal memuat daftar user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const response = await rolesApi.getRoles();
      if (response.success && response.data) {
        setRoles(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    } finally {
      setIsLoadingRoles(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  useEffect(() => {
    const params: UserQueryParams = {
      page: pagination.page,
      limit: pagination.limit,
    };

    if (searchQuery) {
      params.search = searchQuery;
    }

    if (selectedRoleId && selectedRoleId !== 'all') {
      params.roleId = selectedRoleId;
    }

    if (selectedStatus && selectedStatus !== 'all') {
      params.isActive = selectedStatus === 'active';
    }

    fetchUsers(params);
  }, [pagination.page, pagination.limit, searchQuery, selectedRoleId, selectedStatus, fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedRoleId('all');
    setSelectedStatus('all');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleRefresh = () => {
    fetchUsers({
      page: pagination.page,
      limit: pagination.limit,
      search: searchQuery || undefined,
      roleId: selectedRoleId !== 'all' ? selectedRoleId : undefined,
      isActive: selectedStatus !== 'all' ? selectedStatus === 'active' : undefined,
    });
  };

  const hasActiveFilters = searchQuery || selectedRoleId !== 'all' || selectedStatus !== 'all';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Kelola user dan hak akses sistem
          </p>
        </div>
        <PermissionGate permissions={['user:user:create']}>
          {can('user:user:create') && (
            <Button onClick={() => router.push('/users/create')}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah User
            </Button>
          )}
        </PermissionGate>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar User</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 space-y-4">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari berdasarkan NIK atau nama..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="w-48">
                {isLoadingRoles ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select
                    value={selectedRoleId}
                    onValueChange={setSelectedRoleId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Semua Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Role</SelectItem>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="w-40">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Nonaktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClearFilters}
                >
                  <X className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              )}
            </form>
          </div>

          {/* Table */}
          <UserTable
            users={users}
            isLoading={isLoading}
            pagination={pagination}
            onPageChange={handlePageChange}
            onRefresh={handleRefresh}
          />
        </CardContent>
      </Card>
    </div>
  );
}