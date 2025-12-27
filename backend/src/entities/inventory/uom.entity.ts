import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { Product } from './product.entity';

@Entity('uoms')
export class Uom extends BaseEntity {
  @Column({ type: 'varchar', length: 10, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @OneToMany(() => Product, (product) => product.uom)
  products: Product[];
}
