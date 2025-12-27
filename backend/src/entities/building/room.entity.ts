import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { Floor } from './floor.entity';
import { Employee } from '../hr/employee.entity';

export enum RoomType {
  OFFICE = 'OFFICE',
  MEETING = 'MEETING',
  STORAGE = 'STORAGE',
  SERVER = 'SERVER',
  TOILET = 'TOILET',
  PANTRY = 'PANTRY',
  OTHER = 'OTHER',
}

export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE',
  CLOSED = 'CLOSED',
}

@Entity('rooms')
export class Room extends BaseEntity {
  @Column({ name: 'floor_id', type: 'uuid' })
  floorId: string;

  @ManyToOne(() => Floor, (floor) => floor.rooms)
  @JoinColumn({ name: 'floor_id' })
  floor: Floor;

  @Column({ name: 'room_number', type: 'varchar', length: 20 })
  roomNumber: string;

  @Column({ name: 'room_name', type: 'varchar', length: 100 })
  roomName: string;

  @Column({ name: 'room_type', type: 'enum', enum: RoomType, default: RoomType.OFFICE })
  roomType: RoomType;

  @Column({ type: 'int', nullable: true })
  capacity: number | null;

  @Column({ name: 'area_sqm', type: 'decimal', precision: 8, scale: 2, nullable: true })
  areaSqm: number | null;

  @Column({ name: 'pic_employee_id', type: 'uuid', nullable: true })
  picEmployeeId: string | null;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'pic_employee_id' })
  picEmployee: Employee;

  @Column({ type: 'enum', enum: RoomStatus, default: RoomStatus.AVAILABLE })
  status: RoomStatus;

  @Column({ type: 'jsonb', nullable: true })
  facilities: { ac?: boolean; projector?: boolean; whiteboard?: boolean; [key: string]: boolean | undefined } | null;
}