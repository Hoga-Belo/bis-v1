import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role, Permission, RolePermission, User, UserRole } from '../entities';

export async function seedUserAccess(dataSource: DataSource): Promise<void> {
  console.log('Seeding user access data...');

  // Seed Roles
  const roleRepo = dataSource.getRepository(Role);
  const roles = [
    {
      code: 'SUPER_ADMIN',
      name: 'Super Administrator',
      description: 'Full system access',
      isSystem: true,
    },
    { code: 'ADMIN', name: 'Administrator', description: 'Administrative access', isSystem: true },
    {
      code: 'HR_MANAGER',
      name: 'HR Manager',
      description: 'HR module full access',
      isSystem: false,
    },
    {
      code: 'HR_STAFF',
      name: 'HR Staff',
      description: 'HR module limited access',
      isSystem: false,
    },
    {
      code: 'INVENTORY_MANAGER',
      name: 'Inventory Manager',
      description: 'Inventory module full access',
      isSystem: false,
    },
    {
      code: 'INVENTORY_STAFF',
      name: 'Inventory Staff',
      description: 'Inventory module limited access',
      isSystem: false,
    },
    {
      code: 'MESS_MANAGER',
      name: 'Mess Manager',
      description: 'Mess module full access',
      isSystem: false,
    },
    {
      code: 'MESS_STAFF',
      name: 'Mess Staff',
      description: 'Mess module limited access',
      isSystem: false,
    },
    {
      code: 'BUILDING_MANAGER',
      name: 'Building Manager',
      description: 'Building module full access',
      isSystem: false,
    },
    {
      code: 'BUILDING_STAFF',
      name: 'Building Staff',
      description: 'Building module limited access',
      isSystem: false,
    },
    { code: 'EMPLOYEE', name: 'Employee', description: 'Basic employee access', isSystem: false },
  ];

  const savedRoles: Record<string, Role> = {};
  for (const role of roles) {
    let existingRole = await roleRepo.findOne({ where: { code: role.code } });
    if (!existingRole) {
      existingRole = await roleRepo.save(roleRepo.create(role));
    }
    savedRoles[role.code] = existingRole;
  }
  console.log(`  ✓ Seeded ${roles.length} roles`);

  // Seed Permissions
  const permissionRepo = dataSource.getRepository(Permission);
  const modules = ['hr', 'inventory', 'mess', 'building', 'user', 'report', 'audit'];
  const actions = ['create', 'read', 'update', 'delete', 'export', 'import'];

  // Define module-feature mappings
  const moduleFeatures: Record<string, string[]> = {
    hr: ['employee', 'attendance', 'leave', 'division', 'department', 'position'],
    inventory: ['stock', 'asset', 'product', 'warehouse', 'category', 'brand'],
    mess: ['room', 'occupancy', 'site', 'block', 'floor'],
    building: ['building', 'room', 'maintenance', 'floor'],
    user: ['user', 'role', 'permission'],
    report: ['dashboard', 'analytics', 'export'],
    audit: ['log', 'activity'],
  };

  const permissions: {
    code: string;
    module: string;
    feature: string;
    action: string;
    description: string;
  }[] = [];
  for (const module of modules) {
    const featuresForModule = moduleFeatures[module] || ['general'];
    for (const feature of featuresForModule) {
      for (const action of actions) {
        permissions.push({
          code: `${module}:${feature}:${action}`,
          module,
          feature,
          action,
          description: `${action.charAt(0).toUpperCase() + action.slice(1)} ${feature} in ${module} module`,
        });
      }
    }
  }

  const savedPermissions: Record<string, Permission> = {};
  for (const permission of permissions) {
    let existingPermission = await permissionRepo.findOne({ where: { code: permission.code } });
    if (!existingPermission) {
      existingPermission = await permissionRepo.save(permissionRepo.create(permission));
    }
    savedPermissions[permission.code] = existingPermission;
  }
  console.log(`  ✓ Seeded ${permissions.length} permissions`);

  // Seed Role-Permission mappings for Super Admin (all permissions)
  const rolePermissionRepo = dataSource.getRepository(RolePermission);
  const superAdminRole = savedRoles['SUPER_ADMIN'];

  for (const permission of Object.values(savedPermissions)) {
    const exists = await rolePermissionRepo.findOne({
      where: { roleId: superAdminRole.id, permissionId: permission.id },
    });
    if (!exists) {
      await rolePermissionRepo.save(
        rolePermissionRepo.create({
          roleId: superAdminRole.id,
          permissionId: permission.id,
        }),
      );
    }
  }
  console.log(`  ✓ Assigned all permissions to Super Admin role`);

  // Seed Role-Permission mappings for Admin (all except audit delete)
  const adminRole = savedRoles['ADMIN'];
  for (const permission of Object.values(savedPermissions)) {
    // Skip audit delete permissions for admin
    if (permission.module === 'audit' && permission.action === 'delete') {
      continue;
    }
    const exists = await rolePermissionRepo.findOne({
      where: { roleId: adminRole.id, permissionId: permission.id },
    });
    if (!exists) {
      await rolePermissionRepo.save(
        rolePermissionRepo.create({
          roleId: adminRole.id,
          permissionId: permission.id,
        }),
      );
    }
  }
  console.log(`  ✓ Assigned permissions to Admin role`);

  // Seed Role-Permission mappings for HR Manager (HR module full access)
  const hrManagerRole = savedRoles['HR_MANAGER'];
  for (const permission of Object.values(savedPermissions)) {
    if (
      permission.module === 'hr' ||
      (permission.module === 'report' && permission.feature === 'dashboard')
    ) {
      const exists = await rolePermissionRepo.findOne({
        where: { roleId: hrManagerRole.id, permissionId: permission.id },
      });
      if (!exists) {
        await rolePermissionRepo.save(
          rolePermissionRepo.create({
            roleId: hrManagerRole.id,
            permissionId: permission.id,
          }),
        );
      }
    }
  }
  console.log(`  ✓ Assigned permissions to HR Manager role`);

  // Seed Role-Permission mappings for HR Staff (HR module read only)
  const hrStaffRole = savedRoles['HR_STAFF'];
  for (const permission of Object.values(savedPermissions)) {
    if (permission.module === 'hr' && permission.action === 'read') {
      const exists = await rolePermissionRepo.findOne({
        where: { roleId: hrStaffRole.id, permissionId: permission.id },
      });
      if (!exists) {
        await rolePermissionRepo.save(
          rolePermissionRepo.create({
            roleId: hrStaffRole.id,
            permissionId: permission.id,
          }),
        );
      }
    }
  }
  console.log(`  ✓ Assigned permissions to HR Staff role`);

  // Seed Role-Permission mappings for Inventory Manager
  const inventoryManagerRole = savedRoles['INVENTORY_MANAGER'];
  for (const permission of Object.values(savedPermissions)) {
    if (
      permission.module === 'inventory' ||
      (permission.module === 'report' && permission.feature === 'dashboard')
    ) {
      const exists = await rolePermissionRepo.findOne({
        where: { roleId: inventoryManagerRole.id, permissionId: permission.id },
      });
      if (!exists) {
        await rolePermissionRepo.save(
          rolePermissionRepo.create({
            roleId: inventoryManagerRole.id,
            permissionId: permission.id,
          }),
        );
      }
    }
  }
  console.log(`  ✓ Assigned permissions to Inventory Manager role`);

  // Seed Role-Permission mappings for Inventory Staff (read only)
  const inventoryStaffRole = savedRoles['INVENTORY_STAFF'];
  for (const permission of Object.values(savedPermissions)) {
    if (permission.module === 'inventory' && permission.action === 'read') {
      const exists = await rolePermissionRepo.findOne({
        where: { roleId: inventoryStaffRole.id, permissionId: permission.id },
      });
      if (!exists) {
        await rolePermissionRepo.save(
          rolePermissionRepo.create({
            roleId: inventoryStaffRole.id,
            permissionId: permission.id,
          }),
        );
      }
    }
  }
  console.log(`  ✓ Assigned permissions to Inventory Staff role`);

  // Seed Role-Permission mappings for Mess Manager
  const messManagerRole = savedRoles['MESS_MANAGER'];
  for (const permission of Object.values(savedPermissions)) {
    if (
      permission.module === 'mess' ||
      (permission.module === 'report' && permission.feature === 'dashboard')
    ) {
      const exists = await rolePermissionRepo.findOne({
        where: { roleId: messManagerRole.id, permissionId: permission.id },
      });
      if (!exists) {
        await rolePermissionRepo.save(
          rolePermissionRepo.create({
            roleId: messManagerRole.id,
            permissionId: permission.id,
          }),
        );
      }
    }
  }
  console.log(`  ✓ Assigned permissions to Mess Manager role`);

  // Seed Role-Permission mappings for Mess Staff (read only)
  const messStaffRole = savedRoles['MESS_STAFF'];
  for (const permission of Object.values(savedPermissions)) {
    if (permission.module === 'mess' && permission.action === 'read') {
      const exists = await rolePermissionRepo.findOne({
        where: { roleId: messStaffRole.id, permissionId: permission.id },
      });
      if (!exists) {
        await rolePermissionRepo.save(
          rolePermissionRepo.create({
            roleId: messStaffRole.id,
            permissionId: permission.id,
          }),
        );
      }
    }
  }
  console.log(`  ✓ Assigned permissions to Mess Staff role`);

  // Seed Role-Permission mappings for Building Manager
  const buildingManagerRole = savedRoles['BUILDING_MANAGER'];
  for (const permission of Object.values(savedPermissions)) {
    if (
      permission.module === 'building' ||
      (permission.module === 'report' && permission.feature === 'dashboard')
    ) {
      const exists = await rolePermissionRepo.findOne({
        where: { roleId: buildingManagerRole.id, permissionId: permission.id },
      });
      if (!exists) {
        await rolePermissionRepo.save(
          rolePermissionRepo.create({
            roleId: buildingManagerRole.id,
            permissionId: permission.id,
          }),
        );
      }
    }
  }
  console.log(`  ✓ Assigned permissions to Building Manager role`);

  // Seed Role-Permission mappings for Building Staff (read only)
  const buildingStaffRole = savedRoles['BUILDING_STAFF'];
  for (const permission of Object.values(savedPermissions)) {
    if (permission.module === 'building' && permission.action === 'read') {
      const exists = await rolePermissionRepo.findOne({
        where: { roleId: buildingStaffRole.id, permissionId: permission.id },
      });
      if (!exists) {
        await rolePermissionRepo.save(
          rolePermissionRepo.create({
            roleId: buildingStaffRole.id,
            permissionId: permission.id,
          }),
        );
      }
    }
  }
  console.log(`  ✓ Assigned permissions to Building Staff role`);

  // Seed Default Super Admin User
  const userRepo = dataSource.getRepository(User);
  const userRoleRepo = dataSource.getRepository(UserRole);

  const defaultAdminNik = 'ADMIN001';
  let adminUser = await userRepo.findOne({ where: { nik: defaultAdminNik } });

  if (!adminUser) {
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    adminUser = await userRepo.save(
      userRepo.create({
        nik: defaultAdminNik,
        passwordHash: hashedPassword,
        isActive: true,
        isFirstLogin: true,
      }),
    );
    console.log(`  ✓ Created default super admin user (NIK: ${defaultAdminNik})`);
  }

  // Assign Super Admin role to admin user
  const existingUserRole = await userRoleRepo.findOne({
    where: { userId: adminUser.id, roleId: superAdminRole.id },
  });
  if (!existingUserRole) {
    await userRoleRepo.save(
      userRoleRepo.create({
        userId: adminUser.id,
        roleId: superAdminRole.id,
      }),
    );
    console.log(`  ✓ Assigned Super Admin role to admin user`);
  }

  console.log('User access seeding completed!');
}
