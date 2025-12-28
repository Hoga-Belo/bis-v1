// Role types - defined here to avoid circular dependencies

export interface Role {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

// Permission within a role
export interface RolePermission {
  id: string;
  code: string;
  name: string;
  module: string;
  action: string;
}

export interface RoleDetail extends Role {
  permissions: RolePermission[];
}

export interface PermissionGroup {
  module: string;
  permissions: {
    id: string;
    code: string;
    name: string;
    action: string;
    description: string;
  }[];
}

// Request types for role CRUD operations
export interface CreateRoleRequest {
  name: string;
  code: string;
  description?: string;
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
}

export interface AssignPermissionsRequest {
  permissionIds: string[];
}

// Permission item for tree display
export interface PermissionItem {
  id: string;
  code: string;
  name: string;
  action: string;
  description: string;
}

// Grouped permissions by module for tree display
export interface PermissionsByModule {
  module: string;
  permissions: PermissionItem[];
}

// Feature grouping within a module
export interface PermissionFeature {
  feature: string;
  permissions: PermissionItem[];
}

// Module with features for hierarchical display
export interface PermissionModule {
  module: string;
  features: PermissionFeature[];
}