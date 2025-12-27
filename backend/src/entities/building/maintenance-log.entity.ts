import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { Employee } from '../hr/employee.entity';

export enum MaintenanceType {
  BUILDING = 'BUILDING',
  ROOM = 'ROOM',
  FACILITY = 'FACILITY',
}

export enum MaintenancePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum MaintenanceStatus {
  REPORTED = 'REPORTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('maintenance_logs')
export class MaintenanceLog extends BaseEntity {
  @Column({ name: 'maintenance_type', type: 'enum', enum: MaintenanceType })
  maintenanceType: MaintenanceType;

  @Column({ name: 'reference_id', type: 'uuid' })
  referenceId: string;

  @Column({ name: 'issue_description', type: 'text' })
  issueDescription: string;

  @Column({ name: 'reported_by', type: 'uuid' })
  reportedBy: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'reported_by' })
  reporter: Employee;

  @Column({ name: 'reported_date', type: 'date' })
  reportedDate: Date;

  @Column({ type: 'enum', enum: MaintenancePriority, default: MaintenancePriority.MEDIUM })
  priority: MaintenancePriority;

  @Column({ type: 'enum', enum: MaintenanceStatus, default: MaintenanceStatus.REPORTED })
  status: MaintenanceStatus;

  @Column({ name: 'assigned_to', type: 'uuid', nullable: true })
  assignedTo: string | null;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'assigned_to' })
  assignee: Employee;

  @Column({ name: 'completion_date', type: 'date', nullable: true })
  completionDate: Date | null;

  @Column({ name: 'completion_notes', type: 'text', nullable: true })
  completionNotes: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  cost: number | null;
}