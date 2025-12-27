import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../base/base.entity';

@Entity('employment_statuses')
export class EmploymentStatus extends BaseEntity {
  @Column({ type: 'varchar', length: 20, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;
}