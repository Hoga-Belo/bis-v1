
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePermissions } from '@/lib/hooks/use-permissions';
import {
  divisionsApi,
  departmentsApi,
  positionsApi,
  jobGradesApi,
  employmentStatusesApi,
  workLocationsApi,
  organizationApi,
} from '@/lib/api/endpoints/hr';
import { masterDataApi } from '@/lib/api/endpoints/master-data';
import type {
  Employee,
  Division,
  Department,
  Position,
  JobGrade,
  EmploymentStatus,
  WorkLocation,
  EmployeeSummary,
  BloodType,
  Religion,
  City,
  CreateEmployeeDto,
} from '@/lib/types/hr';

// Define schema
const employeeSchema = z.object({
  nik: z.string().min(3, 'NIK minimal 3 karakter').max(20, 'NIK maksimal 20 karakter'),
  fullName: z.string().min(2, 'Nama lengkap minimal 2 karakter').max(100, 'Nama lengkap maksimal 100 karakter'),
  nickname: z.string().max(50, 'Nama panggilan maksimal 50 karakter').optional().or(z.literal('')),
  idCardNumber: z.string().length(16, 'Nomor KTP harus 16 digit').regex(/^\d+$/, 'Nomor KTP hanya boleh angka'),
  birthPlace: z.string().min(1, 'Tempat lahir wajib diisi'),
  birthDate: z.string().min(1, 'Tanggal lahir wajib diisi'),
  gender: z.enum(['L', 'P'], { message: 'Jenis kelamin wajib dipilih' }),
  bloodTypeId: z.string().optional().or(z.literal('')),
  religionId: z.string().optional().or(z.literal('')),
  maritalStatus: z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED'], { message: 'Status pernikahan wajib dipilih' }),
  phoneNumber: z.string().optional().or(z.literal('')),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  address: z.string().max(500, 'Alamat maksimal 500 karakter').optional().or(z.literal('')),
  cityId: z.string().optional().or(z.literal('')),
  postalCode: z.string().max(10, 'Kode pos maksimal 10 karakter').optional().or(z.literal('')),
  currentAddress: z.string().max(500, 'Alamat domisili maksimal 500 karakter').optional().or(z.literal('')),
  currentCityId: z.string().optional().or(z.literal('')),
  divisionId: z.string().min(1, 'Divisi wajib dipilih'),
  departmentId: z.string().min(1, 'Departemen wajib dipilih'),
  positionId: z.string().min(1, 'Jabatan wajib dipilih'),
  jobGradeId: z.string().optional().or(z.literal('')),
  employmentStatusId: z.string().min(1, 'Status kepegawaian wajib dipilih'),
  workLocationId: z.string().optional().or(z.literal('')),
  managerId: z.string().optional().or(z.literal('')),
  joinDate: z.string().min(1, 'Tanggal bergabung wajib diisi'),
  permanentDate: z.string().optional().or(z.literal('')),
  contractStartDate: z.string().optional().or(z.literal('')),
  contractEndDate: z.string().optional().or(z.literal('')),
  basicSalary: z.coerce.number().min(0, 'Gaji pokok tidak boleh negatif').optional(),
  bankName: z.string().max(100, 'Nama bank maksimal 100 karakter').optional().or(z.literal('')),
  bankAccountNumber: z.string().max(50, 'Nomor rekening maksimal 50 karakter').optional().or(z.literal('')),
  bankAccountHolder: z.string().max(100, 'Nama pemilik rekening maksimal 100 karakter').optional().or(z.literal('')),
  taxNumber: z.string().max(30, 'NPWP maksimal 30 karakter').optional().or(z.literal('')),
  bpjsKesehatan: z.string().max(30, 'No BPJS Kesehatan maksimal 30 karakter').optional().or(z.literal('')),
  bpjsKetenagakerjaan: z.string().max(30, 'No BPJS Ketenagakerjaan maksimal 30 karakter').optional().or(z.literal('')),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;
export type EmployeeFormReturn = UseFormReturn<EmployeeFormValues>;

// Import form sections after type export to avoid circular dependency
import {
  PersonalInfoSection,
  AddressSection,
  EmploymentSection,
  PayrollSection,
} from './form-sections';

interface EmployeeFormProps {
  initialData?: Employee | null;
  onSubmit: (data: CreateEmployeeDto) => Promise<void>;
  onCancel: () => void;
}

export function EmployeeForm({ initialData, onSubmit, onCancel }: EmployeeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { can } = usePermissions();
  const isEditing = !!initialData;

  const [divisions, setDivisions] = useState<Division[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [jobGrades, setJobGrades] = useState<JobGrade[]>([]);
  const [employmentStatuses, setEmploymentStatuses] = useState<EmploymentStatus[]>([]);
  const [workLocations, setWorkLocations] = useState<WorkLocation[]>([]);
  const [employees, setEmployees] = useState<EmployeeSummary[]>([]);
  const [bloodTypes, setBloodTypes] = useState<BloodType[]>([]);
  const [religions, setReligions] = useState<Religion[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  // Check if user can view payroll section (either create or update permission)
  const canViewPayroll = can('hr:employee:create:payroll') || can('hr:employee:update:payroll');
  // Check if user can write payroll data based on mode
  const canWritePayroll = isEditing
    ? can('hr:employee:update:payroll')
    : can('hr:employee:create:payroll');

  const form = useForm<EmployeeFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(employeeSchema) as any,
    defaultValues: {
      nik: initialData?.nik || '',
      fullName: initialData?.fullName || '',
      nickname: initialData?.nickname || '',
      idCardNumber: initialData?.idCardNumber || '',
      birthPlace: initialData?.birthPlace || '',
      birthDate: initialData?.birthDate ? initialData.birthDate.split('T')[0] : '',
      gender: initialData?.gender || undefined,
      bloodTypeId: initialData?.bloodType?.id || '',
      religionId: initialData?.religion?.id || '',
      maritalStatus: initialData?.maritalStatus || undefined,
      phoneNumber: initialData?.phoneNumber || '',
      email: initialData?.email || '',
      address: initialData?.address || '',
      cityId: initialData?.city?.id || '',
      postalCode: initialData?.postalCode || '',
      currentAddress: initialData?.currentAddress || '',
      currentCityId: initialData?.currentCity?.id || '',
      divisionId: initialData?.division?.id || '',
      departmentId: initialData?.department?.id || '',
      positionId: initialData?.position?.id || '',
      jobGradeId: initialData?.jobGrade?.id || '',
      employmentStatusId: initialData?.employmentStatus?.id || '',
      workLocationId: initialData?.workLocation?.id || '',
      managerId: initialData?.manager?.id || '',
      joinDate: initialData?.joinDate ? initialData.joinDate.split('T')[0] : '',
      permanentDate: initialData?.permanentDate ? initialData.permanentDate.split('T')[0] : '',
      contractStartDate: initialData?.contractStartDate ? initialData.contractStartDate.split('T')[0] : '',
      contractEndDate: initialData?.contractEndDate ? initialData.contractEndDate.split('T')[0] : '',
      basicSalary: initialData?.basicSalary || undefined,
      bankName: initialData?.bankName || '',
      bankAccountNumber: initialData?.bankAccountNumber || '',
      bankAccountHolder: initialData?.bankAccountHolder || '',
      taxNumber: initialData?.taxNumber || '',
      bpjsKesehatan: initialData?.bpjsKesehatan || '',
      bpjsKetenagakerjaan: initialData?.bpjsKetenagakerjaan || '',
    },
  });

  const selectedDivisionId = form.watch('divisionId');

  const filterDepartmentsByDivision = useCallback(
    (divisionId: string) => {
      if (divisionId) {
        const filtered = departments.filter((dept) => dept.divisionId === divisionId);
        setFilteredDepartments(filtered);
      } else {
        setFilteredDepartments(departments);
      }
    },
    [departments]
  );

  useEffect(() => {
    filterDepartmentsByDivision(selectedDivisionId);
    const currentDepartmentId = form.getValues('departmentId');
    if (currentDepartmentId) {
      const departmentBelongsToDivision = departments.find(
        (dept) => dept.id === currentDepartmentId && dept.divisionId === selectedDivisionId
      );
      if (!departmentBelongsToDivision) {
        form.setValue('departmentId', '');
      }
    }
  }, [selectedDivisionId, departments, filterDepartmentsByDivision, form]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [
          divisionsRes,
          departmentsRes,
          positionsRes,
          jobGradesRes,
          employmentStatusesRes,
          workLocationsRes,
          employeesRes,
          bloodTypesRes,
          religionsRes,
          citiesRes,
        ] = await Promise.all([
          divisionsApi.getAll({ limit: 100 }),
          departmentsApi.getAll({ limit: 100 }),
          positionsApi.getAll({ limit: 100 }),
          jobGradesApi.getAll({ limit: 100 }),
          employmentStatusesApi.getAll({ limit: 100 }),
          workLocationsApi.getAll({ limit: 100 }),
          organizationApi.getAllEmployees(),
          masterDataApi.getBloodTypes(),
          masterDataApi.getReligions(),
          masterDataApi.getCities(),
        ]);

        if (divisionsRes.success && divisionsRes.data) setDivisions(divisionsRes.data.data);
        if (departmentsRes.success && departmentsRes.data) {
          setDepartments(departmentsRes.data.data);
          setFilteredDepartments(departmentsRes.data.data);
        }
        if (positionsRes.success && positionsRes.data) setPositions(positionsRes.data.data);
        if (jobGradesRes.success && jobGradesRes.data) setJobGrades(jobGradesRes.data.data);
        if (employmentStatusesRes.success && employmentStatusesRes.data) setEmploymentStatuses(employmentStatusesRes.data.data);
        if (workLocationsRes.success && workLocationsRes.data) setWorkLocations(workLocationsRes.data.data);
        if (employeesRes.success && employeesRes.data) {
          const filteredEmployees = initialData
            ? employeesRes.data.filter((emp) => emp.id !== initialData.id)
            : employeesRes.data;
          setEmployees(filteredEmployees);
        }
        if (bloodTypesRes.success && bloodTypesRes.data) setBloodTypes(bloodTypesRes.data);
        if (religionsRes.success && religionsRes.data) setReligions(religionsRes.data);
        if (citiesRes.success && citiesRes.data) setCities(citiesRes.data);
      } catch (error) {
        console.error('Failed to fetch dropdown data:', error);
      } finally {
        setLoadingDropdowns(false);
      }
    };

    fetchDropdownData();
  }, [initialData]);

  const handleSubmit = async (data: EmployeeFormValues) => {
    setIsSubmitting(true);
    try {
      const submitData: CreateEmployeeDto = {
        nik: data.nik,
        fullName: data.fullName,
        nickname: data.nickname || undefined,
        idCardNumber: data.idCardNumber,
        birthPlace: data.birthPlace,
        birthDate: data.birthDate,
        gender: data.gender,
        bloodTypeId: data.bloodTypeId || undefined,
        religionId: data.religionId || undefined,
        maritalStatus: data.maritalStatus,
        phoneNumber: data.phoneNumber || undefined,
        email: data.email || undefined,
        address: data.address || undefined,
        cityId: data.cityId || undefined,
        postalCode: data.postalCode || undefined,
        currentAddress: data.currentAddress || undefined,
        currentCityId: data.currentCityId || undefined,
        divisionId: data.divisionId,
        departmentId: data.departmentId,
        positionId: data.positionId,
        jobGradeId: data.jobGradeId || undefined,
        employmentStatusId: data.employmentStatusId,
        workLocationId: data.workLocationId || undefined,
        managerId: data.managerId || undefined,
        joinDate: data.joinDate,
        permanentDate: data.permanentDate || undefined,
        contractStartDate: data.contractStartDate || undefined,
        contractEndDate: data.contractEndDate || undefined,
      };

      // Only include payroll fields if user has write permission
      if (canWritePayroll) {
        submitData.basicSalary = data.basicSalary;
        submitData.bankName = data.bankName || undefined;
        submitData.bankAccountNumber = data.bankAccountNumber || undefined;
        submitData.bankAccountHolder = data.bankAccountHolder || undefined;
        submitData.taxNumber = data.taxNumber || undefined;
        submitData.bpjsKesehatan = data.bpjsKesehatan || undefined;
        submitData.bpjsKetenagakerjaan = data.bpjsKetenagakerjaan || undefined;
      }

      await onSubmit(submitData);
    } catch {
      // Error is handled by parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingDropdowns) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Pribadi</CardTitle>
          </CardHeader>
          <CardContent>
            <PersonalInfoSection
              form={form}
              bloodTypes={bloodTypes}
              religions={religions}
              isEditing={isEditing}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Alamat</CardTitle>
          </CardHeader>
          <CardContent>
            <AddressSection form={form} cities={cities} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Kepegawaian</CardTitle>
          </CardHeader>
          <CardContent>
            <EmploymentSection
              form={form}
              divisions={divisions}
              departments={filteredDepartments}
              positions={positions}
              jobGrades={jobGrades}
              employmentStatuses={employmentStatuses}
              workLocations={workLocations}
              employees={employees}
            />
          </CardContent>
        </Card>

        {canViewPayroll && (
          <Card>
            <CardHeader>
              <CardTitle>Informasi Penggajian</CardTitle>
            </CardHeader>
            <CardContent>
              <PayrollSection form={form} isEditMode={isEditing} />
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Simpan Perubahan' : 'Buat Karyawan'}
          </Button>
        </div>
      </form>
    </Form>
  );
}