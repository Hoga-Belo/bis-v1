import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { City } from './city.entity';

@Entity('provinces')
export class Province extends BaseEntity {
  @Column({ type: 'varchar', length: 2, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @OneToMany(() => City, (city) => city.province)
  cities: City[];
}
