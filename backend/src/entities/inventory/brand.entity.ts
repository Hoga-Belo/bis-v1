import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { Product } from './product.entity';

@Entity('brands')
export class Brand extends BaseEntity {
  @Column({ type: 'varchar', length: 20, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @OneToMany(() => Product, (product) => product.brand)
  products: Product[];
}