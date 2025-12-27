import { Entity, Column, ManyToOne, JoinColumn, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { Product } from './product.entity';
import { AssetAssignment } from './asset-assignment.entity';

export enum AssetStatus {
  NEW = 'NEW',
  AVAILABLE = 'AVAILABLE',
  IN_USE = 'IN_USE',
  BROKEN = 'BROKEN',
  MAINTENANCE = 'MAINTENANCE',
  SCRAP = 'SCRAP',
}

export enum AssetCondition {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
}

export enum LocationType {
  WAREHOUSE = 'WAREHOUSE',
  EMPLOYEE = 'EMPLOYEE',
  ROOM = 'ROOM',
  MESS = 'MESS',
}

@Entity('assets')
export class Asset extends BaseEntity {
  @Index()
  @Column({ name: 'asset_code', type: 'varchar', length: 50, unique: true })
  assetCode: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product, (product) => product.assets)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Index()
  @Column({ name: 'serial_number', type: 'varchar', length: 100, nullable: true })
  serialNumber: string | null;

  @Column({ name: 'purchase_date', type: 'date', nullable: true })
  purchaseDate: Date | null;

  @Column({ name: 'purchase_price', type: 'decimal', precision: 15, scale: 2, nullable: true })
  purchasePrice: number | null;

  @Column({ name: 'warranty_end_date', type: 'date', nullable: true })
  warrantyEndDate: Date | null;

  @Column({ name: 'qr_code', type: 'varchar', length: 255, unique: true })
  qrCode: string;

  @Column({ type: 'enum', enum: AssetStatus, default: AssetStatus.NEW })
  status: AssetStatus;

  @Column({ type: 'enum', enum: AssetCondition, default: AssetCondition.EXCELLENT })
  condition: AssetCondition;

  @Column({ name: 'current_location_type', type: 'enum', enum: LocationType, nullable: true })
  currentLocationType: LocationType | null;

  @Column({ name: 'current_location_id', type: 'uuid', nullable: true })
  currentLocationId: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToMany(() => AssetAssignment, (assignment) => assignment.asset)
  assignments: AssetAssignment[];
}