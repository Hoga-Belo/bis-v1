import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { Division } from './division.entity';
import { Employee } from './employee.entity';

@Entity('departments')
export class Department extends BaseEntity {
  @Column({ name: 'division_id', type: 'uuid' })
  divisionId: string;

  @ManyToOne(() => Division, (division) => division.departments)
  @JoinColumn({ name: 'division_id' })
  division: Division;

  @Column({ type: 'varchar', length: 20, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'manager_id', type: 'uuid', nullable: true })
  managerId: string | null;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'manager_id' })
  manager: Employee;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @OneToMany(() => Employee, (employee) => employee.department)
  employees: Employee[];
}
