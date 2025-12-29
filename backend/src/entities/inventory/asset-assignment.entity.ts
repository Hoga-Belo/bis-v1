import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { Asset, AssetCondition } from './asset.entity';

export enum AssignmentType {
  EMPLOYEE = 'EMPLOYEE',
  ROOM = 'ROOM',
  MESS = 'MESS',
}

@Entity('asset_assignments')
export class AssetAssignment extends BaseEntity {
  @Column({ name: 'asset_id', type: 'uuid' })
  assetId: string;

  @ManyToOne(() => Asset, (asset) => asset.assignments)
  @JoinColumn({ name: 'asset_id' })
  asset: Asset;

  @Column({ name: 'assignment_type', type: 'enum', enum: AssignmentType })
  assignmentType: AssignmentType;

  @Column({ name: 'assigned_to_id', type: 'uuid' })
  assignedToId: string;

  @Column({ name: 'assigned_date', type: 'date' })
  assignedDate: Date;

  @Column({ name: 'return_date', type: 'date', nullable: true })
  returnDate: Date | null;

  @Column({ name: 'handover_document_url', type: 'varchar', length: 255, nullable: true })
  handoverDocumentUrl: string | null;

  @Column({
    name: 'condition_on_handover',
    type: 'enum',
    enum: AssetCondition,
    enumName: 'asset_condition_enum',
  })
  conditionOnHandover: AssetCondition;

  @Column({
    name: 'condition_on_return',
    type: 'enum',
    enum: AssetCondition,
    enumName: 'asset_condition_enum',
    nullable: true,
  })
  conditionOnReturn: AssetCondition | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}
