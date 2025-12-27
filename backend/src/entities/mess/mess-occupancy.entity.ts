import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { MessRoom } from './mess-room.entity';
import { Employee } from '../hr/employee.entity';

export enum OccupancyStatus {
  ACTIVE = 'ACTIVE',
  CHECKED_OUT = 'CHECKED_OUT',
  CANCELLED = 'CANCELLED',
}

@Entity('mess_occupancies')
@Index(['messRoomId', 'status'])
@Index(['employeeId', 'status'])
export class MessOccupancy extends BaseEntity {
  @Column({ name: 'mess_room_id', type: 'uuid' })
  messRoomId: string;

  @ManyToOne(() => MessRoom, (room) => room.occupancies)
  @JoinColumn({ name: 'mess_room_id' })
  messRoom: MessRoom;

  @Column({ name: 'employee_id', type: 'uuid' })
  employeeId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ name: 'check_in_date', type: 'date' })
  checkInDate: Date;

  @Column({ name: 'check_out_date', type: 'date', nullable: true })
  checkOutDate: Date | null;

  @Column({ name: 'expected_check_out_date', type: 'date', nullable: true })
  expectedCheckOutDate: Date | null;

  @Column({ type: 'enum', enum: OccupancyStatus, default: OccupancyStatus.ACTIVE })
  status: OccupancyStatus;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}