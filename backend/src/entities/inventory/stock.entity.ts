import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { Product } from './product.entity';
import { Warehouse } from './warehouse.entity';

@Entity('stocks')
@Unique(['productId', 'warehouseId'])
export class Stock extends BaseEntity {
  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product, (product) => product.stocks)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'warehouse_id', type: 'uuid' })
  warehouseId: string;

  @ManyToOne(() => Warehouse, (warehouse) => warehouse.stocks)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ name: 'last_stock_opname_date', type: 'date', nullable: true })
  lastStockOpnameDate: Date | null;
}
