
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  EmployeeEducation,
  CreateEmployeeEducationDto,
  UpdateEmployeeEducationDto,
} from '@/lib/types/hr';
import { Plus, Pencil, Trash2, GraduationCap } from 'lucide-react';

interface EducationTabProps {
  employeeId: string;
  educations: EmployeeEducation[];
  onUpdate: () => void;
}

// Mock education levels - in real app, fetch from API
const educationLevels = [
  { id: '1', name: 'SD' },
  { id: '2', name: 'SMP' },
  { id: '3', name: 'SMA/SMK' },
  { id: '4', name: 'D1' },
  { id: '5', name: 'D2' },
  { id: '6', name: 'D3' },
  { id: '7', name: 'D4/S1' },
  { id: '8', name: 'S2' },
  { id: '9', name: 'S3' },
];

const educationFormSchema = z.object({
  educationLevelId: z.string().min(1, 'Jenjang pendidikan wajib dipilih'),
  institutionName: z.string().min(1, 'Nama institusi wajib diisi'),
  major: z.string().optional(),
  startYear: z.coerce.number().min(1900, 'Tahun tidak valid').max(new Date().getFullYear(), 'Tahun tidak valid').optional().or(z.literal('')),
  endYear: z.coerce.number().min(1900, 'Tahun tidak valid').max(new Date().getFullYear() + 10, 'Tahun tidak valid').optional().or(z.literal('')),
  gpa: z.coerce.number().min(0, 'IPK tidak valid').max(4, 'IPK maksimal 4.0').optional().or(z.literal('')),
  certificateNumber: z.string().optional(),
});

type EducationFormValues = z.input<typeof educationFormSchema>;

export function EducationTab({ employeeId, educations, onUpdate }: EducationTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<EmployeeEducation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const form = useForm<EducationFormValues>({
    resolver: zodResolver(educationFormSchema),
    defaultValues: {
      educationLevelId: '',
      institutionName: '',
      major: '',
      startYear: '',
      endYear: '',
      gpa: '',
      certificateNumber: '',
    },
  });

  const openAddDialog = () => {
    form.reset({
      educationLevelId: '',
      institutionName: '',
      major: '',
      startYear: '',
      endYear: '',
      gpa: '',
      certificateNumber: '',
    });
    setEditingEducation(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (education: EmployeeEducation) => {
    form.reset({
      educationLevelId: education.educationLevel?.id || '',
      institutionName: education.institutionName,
      major: education.major || '',
      startYear: education.startYear ?? '',
      endYear: education.endYear ?? '',
      gpa: education.gpa ?? '',
      certificateNumber: education.certificateNumber || '',
    });
    setEditingEducation(education);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (values: EducationFormValues) => {
    setIsSubmitting(true);
    try {
      const data: CreateEmployeeEducationDto | UpdateEmployeeEducationDto = {
        educationLevelId: values.educationLevelId,
        institutionName: values.institutionName,
        major: values.major || undefined,
        startYear: typeof values.startYear === 'number' ? values.startYear : undefined,
        endYear: typeof values.endYear === 'number' ? values.endYear : undefined,
        gpa: typeof values.gpa === 'number' ? values.gpa : undefined,
        certificateNumber: values.certificateNumber || undefined,
      };

      if (editingEducation) {
        await employeesApi.updateEducation(employeeId, editingEducation.id, data);
        toast.success('Data pendidikan berhasil diperbarui');
      } else {
        await employeesApi.addEducation(employeeId, data as CreateEmployeeEducationDto);
        toast.success('Data pendidikan berhasil ditambahkan');
      }

      setIsDialogOpen(false);
      onUpdate();
    } catch {
      toast.error(
        editingEducation
          ? 'Gagal memperbarui data pendidikan'
          : 'Gagal menambahkan data pendidikan'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (educationId: string) => {
    setDeletingId(educationId);
    try {
      await employeesApi.deleteEducation(employeeId, educationId);
      toast.success('Data pendidikan berhasil dihapus');
      onUpdate();
    } catch {
      toast.error('Gagal menghapus data pendidikan');
    } finally {
      setDeletingId(null);
    }
  };

  const formatYears = (startYear?: number, endYear?: number): string => {
    if (!startYear && !endYear) return '-';
    if (startYear && endYear) return `${startYear} - ${endYear}`;
    if (startYear) return `${startYear} - Sekarang`;
    return `- ${endYear}`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Riwayat Pendidikan
        </CardTitle>
        <PermissionGate permissions={['hr:employee:update']}>
          <Button onClick={openAddDialog} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Pendidikan
          </Button>
        </PermissionGate>
      </CardHeader>
      <CardContent>
        {educations.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            Belum ada data pendidikan
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Jenjang</TableHead>
                  <TableHead>Institusi</TableHead>
                  <TableHead>Jurusan</TableHead>
                  <TableHead>Tahun</TableHead>
                  <TableHead>IPK</TableHead>
                  <TableHead>No. Ijazah</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {educations.map((education) => (
                  <TableRow key={education.id}>
                    <TableCell>{education.educationLevel?.name || '-'}</TableCell>
                    <TableCell className="font-medium">{education.institutionName}</TableCell>
                    <TableCell>{education.major || '-'}</TableCell>
                    <TableCell>{formatYears(education.startYear, education.endYear)}</TableCell>
                    <TableCell>{education.gpa?.toFixed(2) || '-'}</TableCell>
                    <TableCell>{education.certificateNumber || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <PermissionGate permissions={['hr:employee:update']}>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(education)}
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
                                disabled={deletingId === education.id}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Data Pendidikan</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Apakah Anda yakin ingin menghapus data pendidikan di
                                  &quot;{education.institutionName}&quot;?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(education.id)}
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
                {editingEducation ? 'Edit Data Pendidikan' : 'Tambah Data Pendidikan'}
              </DialogTitle>
              <DialogDescription>
                {editingEducation
                  ? 'Perbarui informasi pendidikan'
                  : 'Tambahkan riwayat pendidikan baru'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="educationLevelId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jenjang Pendidikan *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih jenjang" />
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
                  name="institutionName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Institusi *</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan nama institusi" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="major"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jurusan</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan jurusan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tahun Masuk</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="2020"
                            value={field.value === '' || field.value === undefined ? '' : String(field.value)}
                            onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tahun Lulus</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="2024"
                            value={field.value === '' || field.value === undefined ? '' : String(field.value)}
                            onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="gpa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IPK</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="3.50"
                            value={field.value === '' || field.value === undefined ? '' : String(field.value)}
                            onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="certificateNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>No. Ijazah</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan nomor ijazah" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Batal
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Menyimpan...' : editingEducation ? 'Simpan' : 'Tambah'}
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