import { Entity, Column, ManyToOne, JoinColumn, OneToMany, Unique } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { MessFloor } from './mess-floor.entity';
import { MessOccupancy } from './mess-occupancy.entity';

export enum MessRoomType {
  SINGLE = 'SINGLE',
  DOUBLE = 'DOUBLE',
  SHARED = 'SHARED',
  VIP = 'VIP',
}

export enum MessRoomStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE',
  RESERVED = 'RESERVED',
}

@Entity('mess_rooms')
@Unique(['messFloorId', 'roomNumber'])
export class MessRoom extends BaseEntity {
  @Column({ name: 'mess_floor_id', type: 'uuid' })
  messFloorId: string;

  @ManyToOne(() => MessFloor, (floor) => floor.rooms)
  @JoinColumn({ name: 'mess_floor_id' })
  messFloor: MessFloor;

  @Column({ name: 'room_number', type: 'varchar', length: 20 })
  roomNumber: string;

  @Column({ name: 'room_type', type: 'enum', enum: MessRoomType, default: MessRoomType.SINGLE })
  roomType: MessRoomType;

  @Column({ type: 'int', default: 1 })
  capacity: number;

  @Column({ type: 'enum', enum: MessRoomStatus, default: MessRoomStatus.AVAILABLE })
  status: MessRoomStatus;

  @Column({ type: 'jsonb', nullable: true })
  facilities: {
    ac?: boolean;
    bathroom?: boolean;
    tv?: boolean;
    wifi?: boolean;
    [key: string]: boolean | undefined;
  } | null;

  @OneToMany(() => MessOccupancy, (occupancy) => occupancy.messRoom)
  occupancies: MessOccupancy[];
}
