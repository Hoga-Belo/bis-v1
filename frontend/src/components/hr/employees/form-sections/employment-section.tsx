'use client';

import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import {
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
import type {
  Division,
  Department,
  Position,
  JobGrade,
  EmploymentStatus,
  WorkLocation,
  EmployeeSummary,
} from '@/lib/types/hr';
import type { EmployeeFormValues } from '../employee-form';

interface EmploymentSectionProps {
  form: UseFormReturn<EmployeeFormValues>;
  divisions: Division[];
  departments: Department[];
  positions: Position[];
  jobGrades: JobGrade[];
  employmentStatuses: EmploymentStatus[];
  workLocations: WorkLocation[];
  employees: EmployeeSummary[];
}

export function EmploymentSection({
  form,
  divisions,
  departments,
  positions,
  jobGrades,
  employmentStatuses,
  workLocations,
  employees,
}: EmploymentSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="divisionId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Divisi *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih divisi" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {divisions.map((division) => (
                  <SelectItem key={division.id} value={division.id}>
                    {division.name}
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
        name="departmentId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Departemen *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih departemen" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {departments.map((department) => (
                  <SelectItem key={department.id} value={department.id}>
                    {department.name}
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
        name="positionId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Jabatan *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jabatan" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {positions.map((position) => (
                  <SelectItem key={position.id} value={position.id}>
                    {position.name}
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
        name="jobGradeId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Job Grade</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih job grade" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="">Tidak ada</SelectItem>
                {jobGrades.map((jobGrade) => (
                  <SelectItem key={jobGrade.id} value={jobGrade.id}>
                    {jobGrade.name}
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
        name="employmentStatusId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status Kepegawaian *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {employmentStatuses.map((status) => (
                  <SelectItem key={status.id} value={status.id}>
                    {status.name}
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
        name="workLocationId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Lokasi Kerja</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih lokasi kerja" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="">Tidak ada</SelectItem>
                {workLocations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
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
        name="managerId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Atasan Langsung</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih atasan" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="">Tidak ada</SelectItem>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.nik} - {employee.fullName}
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
        name="joinDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tanggal Bergabung *</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="permanentDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tanggal Pengangkatan</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="contractStartDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tanggal Mulai Kontrak</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="contractEndDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tanggal Akhir Kontrak</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}