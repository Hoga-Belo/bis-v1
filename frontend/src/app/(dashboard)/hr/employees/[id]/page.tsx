'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
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
import { PermissionGate } from '@/components/auth';
import { ViewHistoryButton } from '@/components/audit';
import {
  PersonalInfoTab,
  EmploymentTab,
  FamilyTab,
  EducationTab,
  PayrollTab,
  DocumentsTab,
} from '@/components/hr/employees/tabs';
import { PhotoUpload } from '@/components/hr/employees/photo-upload';
import { employeesApi } from '@/lib/api/endpoints/hr';
import type { Employee, EmployeeStatusType } from '@/lib/types/hr';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';

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

export default function EmployeeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const fetchEmployee = async () => {
    try {
      const response = await employeesApi.getById(id);
      if (response.success && response.data) {
        setEmployee(response.data);
        setPhotoUrl(response.data.photoUrl);
      }
    } catch {
      toast.error('Gagal memuat data karyawan');
      router.push('/hr/employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployee();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await employeesApi.delete(id);
      toast.success('Karyawan berhasil dihapus');
      router.push('/hr/employees');
    } catch {
      toast.error('Gagal menghapus karyawan');
    } finally {
      setDeleting(false);
    }
  };

  const handlePhotoUpdated = (newPhotoUrl: string) => {
    setPhotoUrl(newPhotoUrl);
    if (employee) {
      setEmployee({ ...employee, photoUrl: newPhotoUrl });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="flex-1">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="mt-2 h-4 w-48" />
          </div>
        </div>

        {/* Profile Card Skeleton */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Skeleton */}
        <Skeleton className="h-10 w-full" />
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Data karyawan tidak ditemukan</p>
        <Button
          variant="link"
          onClick={() => router.push('/hr/employees')}
          className="mt-4"
        >
          Kembali ke daftar karyawan
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push('/hr/employees')}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </Button>

      {/* Profile Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            {/* Employee Info */}
            <div className="flex items-start gap-6">
              <PhotoUpload
                employeeId={employee.id}
                currentPhotoUrl={photoUrl}
                employeeName={employee.fullName}
                onPhotoUpdated={handlePhotoUpdated}
                size="lg"
              />
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{employee.fullName}</h1>
                  <Badge className={statusColors[employee.employeeStatus]}>
                    {statusLabels[employee.employeeStatus]}
                  </Badge>
                </div>
                <p className="text-lg text-muted-foreground">{employee.nik}</p>
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  {employee.department && (
                    <span>{employee.department.name}</span>
                  )}
                  {employee.department && employee.position && (
                    <span>•</span>
                  )}
                  {employee.position && <span>{employee.position.name}</span>}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <ViewHistoryButton
                tableName="employees"
                recordId={employee.id}
                variant="outline"
              />
              <PermissionGate permissions={['hr:employee:update']}>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/hr/employees/${id}/edit`)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </PermissionGate>
              <PermissionGate permissions={['hr:employee:delete']}>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={deleting}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Hapus
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Hapus Karyawan</AlertDialogTitle>
                      <AlertDialogDescription>
                        Apakah Anda yakin ingin menghapus karyawan &quot;
                        {employee.fullName}&quot;? Tindakan ini tidak dapat
                        dibatalkan.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Hapus
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </PermissionGate>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="personal">Informasi Pribadi</TabsTrigger>
          <TabsTrigger value="employment">Kepegawaian</TabsTrigger>
          <TabsTrigger value="family">Keluarga</TabsTrigger>
          <TabsTrigger value="education">Pendidikan</TabsTrigger>
          <PermissionGate
            permissions={['hr:employee:read:payroll']}
            fallback={null}
          >
            <TabsTrigger value="payroll">Penggajian</TabsTrigger>
          </PermissionGate>
          <TabsTrigger value="documents">Dokumen</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <PersonalInfoTab employee={employee} />
        </TabsContent>

        <TabsContent value="employment">
          <EmploymentTab employee={employee} />
        </TabsContent>

        <TabsContent value="family">
          <FamilyTab
            employeeId={employee.id}
            families={employee.families || []}
            onUpdate={fetchEmployee}
          />
        </TabsContent>

        <TabsContent value="education">
          <EducationTab
            employeeId={employee.id}
            educations={employee.educations || []}
            onUpdate={fetchEmployee}
          />
        </TabsContent>

        <TabsContent value="payroll">
          <PayrollTab employee={employee} />
        </TabsContent>

        <TabsContent value="documents">
          <DocumentsTab
            employeeId={employee.id}
            documents={employee.documents || []}
            onUpdate={fetchEmployee}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}