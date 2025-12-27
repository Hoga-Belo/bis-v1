import { Entity, Column, ManyToOne, JoinColumn, OneToMany, Unique } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { MessSite } from './mess-site.entity';
import { MessFloor } from './mess-floor.entity';

@Entity('mess_blocks')
@Unique(['messSiteId', 'blockCode'])
export class MessBlock extends BaseEntity {
  @Column({ name: 'mess_site_id', type: 'uuid' })
  messSiteId: string;

  @ManyToOne(() => MessSite, (site) => site.blocks)
  @JoinColumn({ name: 'mess_site_id' })
  messSite: MessSite;

  @Column({ name: 'block_code', type: 'varchar', length: 20 })
  blockCode: string;

  @Column({ name: 'block_name', type: 'varchar', length: 100 })
  blockName: string;

  @Column({ name: 'total_floors', type: 'int', default: 1 })
  totalFloors: number;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @OneToMany(() => MessFloor, (floor) => floor.messBlock)
  floors: MessFloor[];
}
