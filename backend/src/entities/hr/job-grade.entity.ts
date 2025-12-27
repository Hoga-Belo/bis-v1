import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../base/base.entity';

@Entity('job_grades')
export class JobGrade extends BaseEntity {
  @Column({ type: 'varchar', length: 10, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ name: 'min_salary', type: 'decimal', precision: 15, scale: 2, nullable: true })
  minSalary: number | null;

  @Column({ name: 'max_salary', type: 'decimal', precision: 15, scale: 2, nullable: true })
  maxSalary: number | null;
}
