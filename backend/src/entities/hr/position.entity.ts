import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../base/base.entity';

@Entity('positions')
export class Position extends BaseEntity {
  @Column({ type: 'varchar', length: 20, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'int', default: 1 })
  level: number;
}
