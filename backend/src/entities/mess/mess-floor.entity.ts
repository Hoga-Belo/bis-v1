import { Entity, Column, ManyToOne, JoinColumn, OneToMany, Unique } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { MessBlock } from './mess-block.entity';
import { MessRoom } from './mess-room.entity';

@Entity('mess_floors')
@Unique(['messBlockId', 'floorNumber'])
export class MessFloor extends BaseEntity {
  @Column({ name: 'mess_block_id', type: 'uuid' })
  messBlockId: string;

  @ManyToOne(() => MessBlock, (block) => block.floors)
  @JoinColumn({ name: 'mess_block_id' })
  messBlock: MessBlock;

  @Column({ name: 'floor_number', type: 'int' })
  floorNumber: number;

  @Column({ name: 'floor_name', type: 'varchar', length: 50 })
  floorName: string;

  @OneToMany(() => MessRoom, (room) => room.messFloor)
  rooms: MessRoom[];
}