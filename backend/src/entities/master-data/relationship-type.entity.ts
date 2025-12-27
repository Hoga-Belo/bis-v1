import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../base/base.entity';

@Entity('relationship_types')
export class RelationshipType extends BaseEntity {
  @Column({ type: 'varchar', length: 20, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 50 })
  name: string;
}