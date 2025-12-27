import { Entity, Column, ManyToOne, JoinColumn, Unique, Index } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { Employee } from './employee.entity';

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  LATE = 'LATE',
  ABSENT = 'ABSENT',
  LEAVE = 'LEAVE',
  SICK = 'SICK',
  PERMIT = 'PERMIT',
}

export enum ClockInMethod {
  QR = 'QR',
  MANUAL = 'MANUAL',
  LOCATION = 'LOCATION',
}

@Entity('attendances')
@Unique(['employeeId', 'attendanceDate'])
export class Attendance extends BaseEntity {
  @Column({ name: 'employee_id', type: 'uuid' })
  employeeId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Index()
  @Column({ name: 'attendance_date', type: 'date' })
  attendanceDate: Date;

  @Column({ name: 'clock_in_time', type: 'timestamptz', nullable: true })
  clockInTime: Date | null;

  @Column({ name: 'clock_in_location', type: 'jsonb', nullable: true })
  clockInLocation: { lat: number; lng: number; address?: string } | null;

  @Column({ name: 'clock_in_method', type: 'enum', enum: ClockInMethod, nullable: true })
  clockInMethod: ClockInMethod | null;

  @Column({ name: 'clock_out_time', type: 'timestamptz', nullable: true })
  clockOutTime: Date | null;

  @Column({ name: 'clock_out_location', type: 'jsonb', nullable: true })
  clockOutLocation: { lat: number; lng: number; address?: string } | null;

  @Column({ name: 'work_hours', type: 'decimal', precision: 4, scale: 2, nullable: true })
  workHours: number | null;

  @Column({ type: 'enum', enum: AttendanceStatus, default: AttendanceStatus.PRESENT })
  status: AttendanceStatus;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
