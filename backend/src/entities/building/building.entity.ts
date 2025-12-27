import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { WorkLocation } from '../hr/work-location.entity';
import { Employee } from '../hr/employee.entity';
import { Floor } from './floor.entity';

@Entity('buildings')
export class Building extends BaseEntity {
  @Column({ type: 'varchar', length: 20, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'work_location_id', type: 'uuid', nullable: true })
  workLocationId: string | null;

  @ManyToOne(() => WorkLocation)
  @JoinColumn({ name: 'work_location_id' })
  workLocation: WorkLocation;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ name: 'total_floors', type: 'int', default: 1 })
  totalFloors: number;

  @Column({ name: 'pic_employee_id', type: 'uuid', nullable: true })
  picEmployeeId: string | null;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'pic_employee_id' })
  picEmployee: Employee;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @OneToMany(() => Floor, (floor) => floor.building)
  floors: Floor[];
}