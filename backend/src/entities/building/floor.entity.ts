import { Entity, Column, ManyToOne, JoinColumn, OneToMany, Unique } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { Building } from './building.entity';
import { Room } from './room.entity';

@Entity('floors')
@Unique(['buildingId', 'floorNumber'])
export class Floor extends BaseEntity {
  @Column({ name: 'building_id', type: 'uuid' })
  buildingId: string;

  @ManyToOne(() => Building, (building) => building.floors)
  @JoinColumn({ name: 'building_id' })
  building: Building;

  @Column({ name: 'floor_number', type: 'int' })
  floorNumber: number;

  @Column({ name: 'floor_name', type: 'varchar', length: 50 })
  floorName: string;

  @OneToMany(() => Room, (room) => room.floor)
  rooms: Room[];
}
