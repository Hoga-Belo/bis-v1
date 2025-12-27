import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { BloodType } from '../master-data/blood-type.entity';
import { Religion } from '../master-data/religion.entity';
import { City } from '../master-data/city.entity';
import { Division } from './division.entity';
import { Department } from './department.entity';
import { Position } from './position.entity';
import { JobGrade } from './job-grade.entity';
import { EmploymentStatus } from './employment-status.entity';
import { WorkLocation } from './work-location.entity';

export enum Gender {
  MALE = 'L',
  FEMALE = 'P',
}

export enum MaritalStatus {
  SINGLE = 'SINGLE',
  MARRIED = 'MARRIED',
  DIVORCED = 'DIVORCED',
  WIDOWED = 'WIDOWED',
}

export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  RESIGNED = 'RESIGNED',
  TERMINATED = 'TERMINATED',
}

@Entity('employees')
export class Employee extends BaseEntity {
  // Personal Information
  @Index()
  @Column({ type: 'varchar', length: 20, unique: true })
  nik: string;

  @Column({ name: 'full_name', type: 'varchar', length: 200 })
  fullName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nickname: string | null;

  @Index()
  @Column({ name: 'id_card_number', type: 'varchar', length: 16, unique: true })
  idCardNumber: string;

  @Column({ name: 'birth_place', type: 'varchar', length: 100 })
  birthPlace: string;

  @Column({ name: 'birth_date', type: 'date' })
  birthDate: Date;

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  @Column({ name: 'blood_type_id', type: 'uuid', nullable: true })
  bloodTypeId: string | null;

  @ManyToOne(() => BloodType)
  @JoinColumn({ name: 'blood_type_id' })
  bloodType: BloodType;

  @Column({ name: 'religion_id', type: 'uuid', nullable: true })
  religionId: string | null;

  @ManyToOne(() => Religion)
  @JoinColumn({ name: 'religion_id' })
  religion: Religion;

  @Column({
    name: 'marital_status',
    type: 'enum',
    enum: MaritalStatus,
    default: MaritalStatus.SINGLE,
  })
  maritalStatus: MaritalStatus;

  @Column({ name: 'phone_number', type: 'varchar', length: 20, nullable: true })
  phoneNumber: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string | null;

  @Column({ name: 'photo_url', type: 'varchar', length: 255, nullable: true })
  photoUrl: string | null;

  // Address Information
  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ name: 'city_id', type: 'uuid', nullable: true })
  cityId: string | null;

  @ManyToOne(() => City)
  @JoinColumn({ name: 'city_id' })
  city: City;

  @Column({ name: 'postal_code', type: 'varchar', length: 10, nullable: true })
  postalCode: string | null;

  @Column({ name: 'current_address', type: 'text', nullable: true })
  currentAddress: string | null;

  @Column({ name: 'current_city_id', type: 'uuid', nullable: true })
  currentCityId: string | null;

  @ManyToOne(() => City)
  @JoinColumn({ name: 'current_city_id' })
  currentCity: City;

  // Employment Information
  @Column({ name: 'division_id', type: 'uuid', nullable: true })
  divisionId: string | null;

  @ManyToOne(() => Division)
  @JoinColumn({ name: 'division_id' })
  division: Division;

  @Column({ name: 'department_id', type: 'uuid', nullable: true })
  departmentId: string | null;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @Column({ name: 'position_id', type: 'uuid', nullable: true })
  positionId: string | null;

  @ManyToOne(() => Position)
  @JoinColumn({ name: 'position_id' })
  position: Position;

  @Column({ name: 'job_grade_id', type: 'uuid', nullable: true })
  jobGradeId: string | null;

  @ManyToOne(() => JobGrade)
  @JoinColumn({ name: 'job_grade_id' })
  jobGrade: JobGrade;

  @Column({ name: 'employment_status_id', type: 'uuid', nullable: true })
  employmentStatusId: string | null;

  @ManyToOne(() => EmploymentStatus)
  @JoinColumn({ name: 'employment_status_id' })
  employmentStatus: EmploymentStatus;

  @Column({ name: 'work_location_id', type: 'uuid', nullable: true })
  workLocationId: string | null;

  @ManyToOne(() => WorkLocation)
  @JoinColumn({ name: 'work_location_id' })
  workLocation: WorkLocation;

  @Column({ name: 'manager_id', type: 'uuid', nullable: true })
  managerId: string | null;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'manager_id' })
  manager: Employee;

  @Column({ name: 'join_date', type: 'date', nullable: true })
  joinDate: Date | null;

  @Column({ name: 'permanent_date', type: 'date', nullable: true })
  permanentDate: Date | null;

  @Column({ name: 'contract_start_date', type: 'date', nullable: true })
  contractStartDate: Date | null;

  @Column({ name: 'contract_end_date', type: 'date', nullable: true })
  contractEndDate: Date | null;

  @Column({ name: 'resign_date', type: 'date', nullable: true })
  resignDate: Date | null;

  @Column({ name: 'resign_reason', type: 'text', nullable: true })
  resignReason: string | null;

  @Column({
    name: 'employee_status',
    type: 'enum',
    enum: EmployeeStatus,
    default: EmployeeStatus.ACTIVE,
  })
  employeeStatus: EmployeeStatus;

  // Payroll Information (Sensitive)
  @Column({ name: 'basic_salary', type: 'decimal', precision: 15, scale: 2, nullable: true })
  basicSalary: number | null;

  @Column({ name: 'bank_name', type: 'varchar', length: 100, nullable: true })
  bankName: string | null;

  @Column({ name: 'bank_account_number', type: 'varchar', length: 50, nullable: true })
  bankAccountNumber: string | null;

  @Column({ name: 'bank_account_holder', type: 'varchar', length: 200, nullable: true })
  bankAccountHolder: string | null;

  @Column({ name: 'tax_number', type: 'varchar', length: 30, nullable: true })
  taxNumber: string | null;

  @Column({ name: 'bpjs_kesehatan', type: 'varchar', length: 30, nullable: true })
  bpjsKesehatan: string | null;

  @Column({ name: 'bpjs_ketenagakerjaan', type: 'varchar', length: 30, nullable: true })
  bpjsKetenagakerjaan: string | null;

  // Leave Balance
  @Column({ name: 'annual_leave_balance', type: 'int', default: 12 })
  annualLeaveBalance: number;

  @Column({ name: 'sick_leave_balance', type: 'int', default: 12 })
  sickLeaveBalance: number;
}
