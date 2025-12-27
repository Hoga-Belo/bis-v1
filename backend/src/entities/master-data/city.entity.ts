import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { Province } from './province.entity';

@Entity('cities')
export class City extends BaseEntity {
  @Column({ name: 'province_id', type: 'uuid' })
  provinceId: string;

  @ManyToOne(() => Province, (province) => province.cities)
  @JoinColumn({ name: 'province_id' })
  province: Province;

  @Column({ type: 'varchar', length: 4 })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;
}