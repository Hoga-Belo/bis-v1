import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { RolePermission } from './role-permission.entity';

@Entity('permissions')
@Index(['module', 'feature', 'action'])
export class Permission extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  module: string;

  @Column({ type: 'varchar', length: 50 })
  feature: string;

  @Column({ type: 'varchar', length: 20 })
  action: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  field: string | null;

  @Column({ type: 'varchar', length: 100, unique: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.permission)
  rolePermissions: RolePermission[];
}
