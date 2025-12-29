
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { PermissionGate } from '@/components/auth';
import { ViewHistoryButton } from '@/components/audit';
import type {
  Employee,
  EmployeeStatusType,
  Gender,
  Division,
  Department,
  Position,
} from '@/lib/types/hr';
import {
  Pencil,
  Trash2,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';

interface EmployeeTableProps {
  employees: Employee[];
  isLoading: boolean;
  onDelete: (id: string) => Promise<void>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  onSearch: (search: string) => void;
  onFilterChange: (filters: {
    departmentId?: string;
    divisionId?: string;
    positionId?: string;
    employeeStatus?: EmployeeStatusType;
    gender?: Gender;
  }) => void;
  filters: {
    search: string;
    departmentId?: string;
    divisionId?: string;
    positionId?: string;
    employeeStatus?: EmployeeStatusType;
    gender?: Gender;
  };
  divisions: Division[];
  departments: Department[];
  positions: Position[];
}

const statusColors: Record<EmployeeStatusType, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  ON_LEAVE: 'bg-yellow-100 text-yellow-800',
  RESIGNED: 'bg-gray-100 text-gray-800',
  TERMINATED: 'bg-red-100 text-red-800',
};

const statusLabels: Record<EmployeeStatusType, string> = {
  ACTIVE: 'Aktif',
  ON_LEAVE: 'Cuti',
  RESIGNED: 'Resign',
  TERMINATED: 'Diberhentikan',
};

export function EmployeeTable({
  employees,
  isLoading,
  onDelete,
  pagination,
  onPageChange,
  onSearch,
  onFilterChange,
  filters,
  divisions,
  departments,
  positions,
}: EmployeeTableProps) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(filters.search);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSearch = () => {
    onSearch(searchInput);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
      toast.success('Karyawan berhasil dihapus');
    } catch {
      toast.error('Gagal menghapus karyawan');
    } finally {
      setDeletingId(null);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari NIK atau nama..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-9"
            />
          </div>
          <Button onClick={handleSearch} variant="secondary">
            Cari
          </Button>
        </div>
        <div className="flex gap-2">
          <PermissionGate permissions={['hr:employee:create']}>
            <Button
              variant="outline"
              onClick={() => router.push('/hr/employees/import')}
            >
              <Upload className="mr-2 h-4 w-4" />
              Import Excel
            </Button>
          </PermissionGate>
          <PermissionGate permissions={['hr:employee:create']}>
            <Button onClick={() => router.push('/hr/employees/create')}>
              <UserPlus className="mr-2 h-4 w-4" />
              Tambah Karyawan
            </Button>
          </PermissionGate>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-2">
        <Select
          value={filters.divisionId || 'all'}
          onValueChange={(value) =>
            onFilterChange({
              ...filters,
              divisionId: value === 'all' ? undefined : value,
            })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Semua Divisi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Divisi</SelectItem>
            {divisions.map((division) => (
              <SelectItem key={division.id} value={division.id}>
                {division.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.departmentId || 'all'}
          onValueChange={(value) =>
            onFilterChange({
              ...filters,
              departmentId: value === 'all' ? undefined : value,
            })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Semua Departemen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Departemen</SelectItem>
            {departments.map((department) => (
              <SelectItem key={department.id} value={department.id}>
                {department.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.positionId || 'all'}
          onValueChange={(value) =>
            onFilterChange({
              ...filters,
              positionId: value === 'all' ? undefined : value,
            })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Semua Jabatan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Jabatan</SelectItem>
            {positions.map((position) => (
              <SelectItem key={position.id} value={position.id}>
                {position.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.employeeStatus || 'all'}
          onValueChange={(value) =>
            onFilterChange({
              ...filters,
              employeeStatus:
                value === 'all' ? undefined : (value as EmployeeStatusType),
            })
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="ACTIVE">Aktif</SelectItem>
            <SelectItem value="ON_LEAVE">Cuti</SelectItem>
            <SelectItem value="RESIGNED">Resign</SelectItem>
            <SelectItem value="TERMINATED">Diberhentikan</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.gender || 'all'}
          onValueChange={(value) =>
            onFilterChange({
              ...filters,
              gender: value === 'all' ? undefined : (value as Gender),
            })
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Semua Gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Gender</SelectItem>
            <SelectItem value="L">Laki-laki</SelectItem>
            <SelectItem value="P">Perempuan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Foto</TableHead>
              <TableHead>NIK</TableHead>
              <TableHead>Nama Lengkap</TableHead>
              <TableHead>Departemen</TableHead>
              <TableHead>Jabatan</TableHead>
              <TableHead>Tanggal Masuk</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-10 w-10 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-24 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Tidak ada data karyawan
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <Avatar>
                      <AvatarImage
                        src={employee.photoUrl}
                        alt={employee.fullName}
                      />
                      <AvatarFallback>
                        {getInitials(employee.fullName)}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{employee.nik}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{employee.fullName}</div>
                      {employee.nickname && (
                        <div className="text-sm text-muted-foreground">
                          ({employee.nickname})
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>{employee.department?.name || '-'}</div>
                      {employee.division && (
                        <div className="text-sm text-muted-foreground">
                          {employee.division.name}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{employee.position?.name || '-'}</TableCell>
                  <TableCell>{formatDate(employee.joinDate)}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[employee.employeeStatus]}>
                      {statusLabels[employee.employeeStatus]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          router.push(`/hr/employees/${employee.id}`)
                        }
                        title="Lihat Detail"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <PermissionGate permissions={['hr:employee:update']}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            router.push(`/hr/employees/${employee.id}/edit`)
                          }
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </PermissionGate>
                      <PermissionGate permissions={['hr:employee:delete']}>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={deletingId === employee.id}
                              title="Hapus"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Karyawan</AlertDialogTitle>
                              <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus karyawan
                                &quot;{employee.fullName}&quot;? Tindakan ini
                                tidak dapat dibatalkan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(employee.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </PermissionGate>
                      <ViewHistoryButton
                        tableName="employees"
                        recordId={employee.id}
                        variant="ghost"
                        size="icon"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!isLoading && employees.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Menampilkan {(pagination.page - 1) * pagination.limit + 1} -{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} dari{' '}
            {pagination.total} karyawan
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Sebelumnya
            </Button>
            <div className="text-sm">
              Halaman {pagination.page} dari {pagination.totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Selanjutnya
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}