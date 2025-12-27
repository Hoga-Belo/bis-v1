import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../base/base.entity';

@Entity('education_levels')
export class EducationLevel extends BaseEntity {
  @Column({ type: 'varchar', length: 10, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'int', default: 0 })
  level: number;
}
