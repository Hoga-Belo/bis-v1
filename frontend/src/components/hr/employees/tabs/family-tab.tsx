
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { employeesApi } from '@/lib/api/endpoints/hr';
import type {
  EmployeeFamily,
  Gender,
  CreateEmployeeFamilyDto,
  UpdateEmployeeFamilyDto,
} from '@/lib/types/hr';
import { Plus, Pencil, Trash2, Phone } from 'lucide-react';

interface FamilyTabProps {
  employeeId: string;
  families: EmployeeFamily[];
  onUpdate: () => void;
}

const genderLabels: Record<Gender, string> = {
  L: 'Laki-laki',
  P: 'Perempuan',
};

// Mock relationship types - in real app, fetch from API
const relationshipTypes = [
  { id: '1', name: 'Suami' },
  { id: '2', name: 'Istri' },
  { id: '3', name: 'Anak' },
  { id: '4', name: 'Ayah' },
  { id: '5', name: 'Ibu' },
  { id: '6', name: 'Saudara' },
];

// Mock education levels - in real app, fetch from API
const educationLevels = [
  { id: '1', name: 'SD' },
  { id: '2', name: 'SMP' },
  { id: '3', name: 'SMA/SMK' },
  { id: '4', name: 'D3' },
  { id: '5', name: 'S1' },
  { id: '6', name: 'S2' },
  { id: '7', name: 'S3' },
];

const familyFormSchema = z.object({
  relationshipTypeId: z.string().min(1, 'Hubungan wajib dipilih'),
  fullName: z.string().min(1, 'Nama lengkap wajib diisi'),
  birthDate: z.string().optional(),
  gender: z.enum(['L', 'P']).optional(),
  educationLevelId: z.string().optional(),
  occupation: z.string().optional(),
  isEmergencyContact: z.boolean(),
  phoneNumber: z.string().optional(),
});

type FamilyFormValues = z.infer<typeof familyFormSchema>;

function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function FamilyTab({ employeeId, families, onUpdate }: FamilyTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFamily, setEditingFamily] = useState<EmployeeFamily | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const form = useForm<FamilyFormValues>({
    resolver: zodResolver(familyFormSchema),
    defaultValues: {
      relationshipTypeId: '',
      fullName: '',
      birthDate: '',
      gender: undefined,
      educationLevelId: '',
      occupation: '',
      isEmergencyContact: false,
      phoneNumber: '',
    },
  });

  const openAddDialog = () => {
    form.reset({
      relationshipTypeId: '',
      fullName: '',
      birthDate: '',
      gender: undefined,
      educationLevelId: '',
      occupation: '',
      isEmergencyContact: false,
      phoneNumber: '',
    });
    setEditingFamily(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (family: EmployeeFamily) => {
    form.reset({
      relationshipTypeId: family.relationshipType?.id || '',
      fullName: family.fullName,
      birthDate: family.birthDate?.split('T')[0] || '',
      gender: family.gender,
      educationLevelId: family.educationLevel?.id || '',
      occupation: family.occupation || '',
      isEmergencyContact: family.isEmergencyContact,
      phoneNumber: family.phoneNumber || '',
    });
    setEditingFamily(family);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (values: FamilyFormValues) => {
    setIsSubmitting(true);
    try {
      const data: CreateEmployeeFamilyDto | UpdateEmployeeFamilyDto = {
        relationshipTypeId: values.relationshipTypeId,
        fullName: values.fullName,
        birthDate: values.birthDate || undefined,
        gender: values.gender,
        educationLevelId: values.educationLevelId || undefined,
        occupation: values.occupation || undefined,
        isEmergencyContact: values.isEmergencyContact,
        phoneNumber: values.phoneNumber || undefined,
      };

      if (editingFamily) {
        await employeesApi.updateFamily(employeeId, editingFamily.id, data);
        toast.success('Data keluarga berhasil diperbarui');
      } else {
        await employeesApi.addFamily(employeeId, data as CreateEmployeeFamilyDto);
        toast.success('Data keluarga berhasil ditambahkan');
      }

      setIsDialogOpen(false);
      onUpdate();
    } catch {
      toast.error(
        editingFamily
          ? 'Gagal memperbarui data keluarga'
          : 'Gagal menambahkan data keluarga'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (familyId: string) => {
    setDeletingId(familyId);
    try {
      await employeesApi.deleteFamily(employeeId, familyId);
      toast.success('Data keluarga berhasil dihapus');
      onUpdate();
    } catch {
      toast.error('Gagal menghapus data keluarga');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Data Keluarga</CardTitle>
        <PermissionGate permissions={['hr:employee:update']}>
          <Button onClick={openAddDialog} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Keluarga
          </Button>
        </PermissionGate>
      </CardHeader>
      <CardContent>
        {families.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            Belum ada data keluarga
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hubungan</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Tanggal Lahir</TableHead>
                  <TableHead>Jenis Kelamin</TableHead>
                  <TableHead>Pendidikan</TableHead>
                  <TableHead>Pekerjaan</TableHead>
                  <TableHead>Kontak Darurat</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {families.map((family) => (
                  <TableRow key={family.id}>
                    <TableCell>{family.relationshipType?.name || '-'}</TableCell>
                    <TableCell className="font-medium">{family.fullName}</TableCell>
                    <TableCell>{formatDate(family.birthDate)}</TableCell>
                    <TableCell>
                      {family.gender ? genderLabels[family.gender] : '-'}
                    </TableCell>
                    <TableCell>{family.educationLevel?.name || '-'}</TableCell>
                    <TableCell>{family.occupation || '-'}</TableCell>
                    <TableCell>
                      {family.isEmergencyContact ? (
                        <Badge variant="default" className="gap-1">
                          <Phone className="h-3 w-3" />
                          {family.phoneNumber || 'Ya'}
                        </Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <PermissionGate permissions={['hr:employee:update']}>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(family)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </PermissionGate>
                        <PermissionGate permissions={['hr:employee:update']}>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={deletingId === family.id}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Data Keluarga</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Apakah Anda yakin ingin menghapus data keluarga
                                  &quot;{family.fullName}&quot;?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(family.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </PermissionGate>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingFamily ? 'Edit Data Keluarga' : 'Tambah Data Keluarga'}
              </DialogTitle>
              <DialogDescription>
                {editingFamily
                  ? 'Perbarui informasi anggota keluarga'
                  : 'Tambahkan anggota keluarga baru'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="relationshipTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hubungan *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih hubungan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {relationshipTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Lengkap *</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan nama lengkap" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="birthDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tanggal Lahir</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jenis Kelamin</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="L">Laki-laki</SelectItem>
                            <SelectItem value="P">Perempuan</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="educationLevelId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pendidikan</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih pendidikan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {educationLevels.map((level) => (
                            <SelectItem key={level.id} value={level.id}>
                              {level.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="occupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pekerjaan</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan pekerjaan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isEmergencyContact"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Kontak Darurat</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Telepon</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan nomor telepon" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}