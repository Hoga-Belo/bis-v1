import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../base/base.entity';

@Entity('blood_types')
export class BloodType extends BaseEntity {
  @Column({ type: 'varchar', length: 3, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 50 })
  name: string;
}
