import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { UserRole } from './user-role.entity';

@Entity('users')
export class User extends BaseEntity {
  @Index()
  @Column({ type: 'varchar', length: 20, unique: true })
  nik: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ name: 'is_first_login', type: 'boolean', default: true })
  isFirstLogin: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt: Date | null;

  @Column({ name: 'employee_id', type: 'uuid', nullable: true })
  employeeId: string | null;

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles: UserRole[];
}