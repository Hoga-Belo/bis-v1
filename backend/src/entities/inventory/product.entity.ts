import { Entity, Column, ManyToOne, JoinColumn, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { Category } from './category.entity';
import { Brand } from './brand.entity';
import { Uom } from './uom.entity';
import { Stock } from './stock.entity';
import { Asset } from './asset.entity';

@Entity('products')
export class Product extends BaseEntity {
  @Index()
  @Column({ type: 'varchar', length: 50, unique: true })
  sku: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'brand_id', type: 'uuid', nullable: true })
  brandId: string | null;

  @ManyToOne(() => Brand, (brand) => brand.products)
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @Column({ name: 'uom_id', type: 'uuid' })
  uomId: string;

  @ManyToOne(() => Uom, (uom) => uom.products)
  @JoinColumn({ name: 'uom_id' })
  uom: Uom;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'jsonb', nullable: true })
  specifications: Record<string, unknown> | null;

  @Column({ name: 'is_asset', type: 'boolean', default: false })
  isAsset: boolean;

  @Column({ name: 'min_stock', type: 'int', default: 0 })
  minStock: number;

  @Column({ name: 'photo_url', type: 'varchar', length: 255, nullable: true })
  photoUrl: string | null;

  @OneToMany(() => Stock, (stock) => stock.product)
  stocks: Stock[];

  @OneToMany(() => Asset, (asset) => asset.product)
  assets: Asset[];
}