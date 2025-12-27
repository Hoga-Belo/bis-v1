import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { Employee } from './employee.entity';
import { EducationLevel } from '../master-data/education-level.entity';

@Entity('employee_educations')
export class EmployeeEducation extends BaseEntity {
  @Column({ name: 'employee_id', type: 'uuid' })
  employeeId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ name: 'education_level_id', type: 'uuid' })
  educationLevelId: string;

  @ManyToOne(() => EducationLevel)
  @JoinColumn({ name: 'education_level_id' })
  educationLevel: EducationLevel;

  @Column({ name: 'institution_name', type: 'varchar', length: 200 })
  institutionName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  major: string | null;

  @Column({ name: 'start_year', type: 'int' })
  startYear: number;

  @Column({ name: 'end_year', type: 'int', nullable: true })
  endYear: number | null;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  gpa: number | null;

  @Column({ name: 'certificate_number', type: 'varchar', length: 100, nullable: true })
  certificateNumber: string | null;

  @Column({ name: 'certificate_url', type: 'varchar', length: 255, nullable: true })
  certificateUrl: string | null;
}