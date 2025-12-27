import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { Employee, Gender } from './employee.entity';
import { RelationshipType } from '../master-data/relationship-type.entity';
import { EducationLevel } from '../master-data/education-level.entity';

@Entity('employee_families')
export class EmployeeFamily extends BaseEntity {
  @Column({ name: 'employee_id', type: 'uuid' })
  employeeId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ name: 'relationship_type_id', type: 'uuid' })
  relationshipTypeId: string;

  @ManyToOne(() => RelationshipType)
  @JoinColumn({ name: 'relationship_type_id' })
  relationshipType: RelationshipType;

  @Column({ name: 'full_name', type: 'varchar', length: 200 })
  fullName: string;

  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate: Date | null;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender | null;

  @Column({ name: 'education_level_id', type: 'uuid', nullable: true })
  educationLevelId: string | null;

  @ManyToOne(() => EducationLevel)
  @JoinColumn({ name: 'education_level_id' })
  educationLevel: EducationLevel;

  @Column({ type: 'varchar', length: 100, nullable: true })
  occupation: string | null;

  @Column({ name: 'is_emergency_contact', type: 'boolean', default: false })
  isEmergencyContact: boolean;

  @Column({ name: 'phone_number', type: 'varchar', length: 20, nullable: true })
  phoneNumber: string | null;
}