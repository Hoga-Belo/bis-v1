import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../base/base.entity';

@Entity('religions')
export class Religion extends BaseEntity {
  @Column({ type: 'varchar', length: 20, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 50 })
  name: string;
}
