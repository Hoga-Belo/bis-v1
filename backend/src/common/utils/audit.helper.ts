
/**
 * Audit Helper Utilities
 * Functions untuk membantu audit logging
 */

import { EntityTarget, ObjectLiteral } from 'typeorm';

// Import all entities for mapping
import {
  User,
  Role,
  Permission,
  RolePermission,
  UserRole,
  RefreshToken,
} from '../../entities/user-access';
import {
  Employee,
  Department,
  Division,
  Position,
  JobGrade,
  EmploymentStatus,
  WorkLocation,
  Attendance,
  EmployeeFamily,
  EmployeeEducation,
  EmployeeDocument,
  LeaveRequest,
} from '../../entities/hr';
import {
  Product,
  Category,
  Brand,
  Uom,
  Warehouse,
  Stock,
  StockTransaction,
  Asset,
  AssetAssignment,
} from '../../entities/inventory';
import {
  MessSite,
  MessBlock,
  MessFloor,
  MessRoom,
  MessOccupancy,
} from '../../entities/mess';
import {
  Building,
  Floor,
  Room,
  MaintenanceLog,
} from '../../entities/building';
import {
  Province,
  City,
  BloodType,
  Religion,
  EducationLevel,
  RelationshipType,
} from '../../entities/master-data';

// Mapping table name ke entity class
const TABLE_ENTITY_MAP: Record<string, EntityTarget<ObjectLiteral>> = {
  // User Access
  users: User,
  roles: Role,
  permissions: Permission,
  role_permissions: RolePermission,
  user_roles: UserRole,
  refresh_tokens: RefreshToken,
  // HR
  employees: Employee,
  departments: Department,
  divisions: Division,
  positions: Position,
  job_grades: JobGrade,
  employment_statuses: EmploymentStatus,
  work_locations: WorkLocation,
  attendances: Attendance,
  employee_families: EmployeeFamily,
  employee_educations: EmployeeEducation,
  employee_documents: EmployeeDocument,
  leave_requests: LeaveRequest,
  // Inventory
  products: Product,
  categories: Category,
  brands: Brand,
  uoms: Uom,
  warehouses: Warehouse,
  stocks: Stock,
  stock_transactions: StockTransaction,
  assets: Asset,
  asset_assignments: AssetAssignment,
  // Mess
  mess_sites: MessSite,
  mess_blocks: MessBlock,
  mess_floors: MessFloor,
  mess_rooms: MessRoom,
  mess_occupancies: MessOccupancy,
  // Building
  buildings: Building,
  floors: Floor,
  rooms: Room,
  maintenance_logs: MaintenanceLog,
  // Master Data
  provinces: Province,
  cities: City,
  blood_types: BloodType,
  religions: Religion,
  education_levels: EducationLevel,
  relationship_types: RelationshipType,
};

/**
 * Get entity class from table name
 */
export function getEntityFromTableName(
  tableName: string,
): EntityTarget<ObjectLiteral> | null {
  return TABLE_ENTITY_MAP[tableName] || null;
}

// Entity info type
interface EntityInfo {
  module: string;
  entityType: string;
  tableName: string;
  isNestedRoute?: boolean;
  parentEntity?: string;
}

// Nested route patterns - these must be checked BEFORE base routes
// Pattern format: regex pattern -> entity info
const NESTED_ROUTE_PATTERNS: Array<{
  pattern: RegExp;
  info: EntityInfo;
}> = [
  // User Access - Nested Routes
  {
    pattern: /\/users\/[^/]+\/roles/,
    info: {
      module: 'user-access',
      entityType: 'UserRole',
      tableName: 'user_roles',
      isNestedRoute: true,
      parentEntity: 'User',
    },
  },
  {
    pattern: /\/users\/[^/]+\/assign-roles/,
    info: {
      module: 'user-access',
      entityType: 'UserRole',
      tableName: 'user_roles',
      isNestedRoute: true,
      parentEntity: 'User',
    },
  },
  {
    pattern: /\/users\/[^/]+\/reset-password/,
    info: {
      module: 'user-access',
      entityType: 'User',
      tableName: 'users',
      isNestedRoute: true,
      parentEntity: 'User',
    },
  },
  {
    pattern: /\/roles\/[^/]+\/permissions/,
    info: {
      module: 'user-access',
      entityType: 'RolePermission',
      tableName: 'role_permissions',
      isNestedRoute: true,
      parentEntity: 'Role',
    },
  },
  // Auth - Password Change
  {
    pattern: /\/auth\/change-password/,
    info: {
      module: 'user-access',
      entityType: 'User',
      tableName: 'users',
    },
  },
  // HR - Nested Routes
  {
    pattern: /\/employees\/[^/]+\/family/,
    info: {
      module: 'hr',
      entityType: 'EmployeeFamily',
      tableName: 'employee_families',
      isNestedRoute: true,
      parentEntity: 'Employee',
    },
  },
  {
    pattern: /\/employees\/[^/]+\/education/,
    info: {
      module: 'hr',
      entityType: 'EmployeeEducation',
      tableName: 'employee_educations',
      isNestedRoute: true,
      parentEntity: 'Employee',
    },
  },
  {
    pattern: /\/employees\/[^/]+\/documents/,
    info: {
      module: 'hr',
      entityType: 'EmployeeDocument',
      tableName: 'employee_documents',
      isNestedRoute: true,
      parentEntity: 'Employee',
    },
  },
];

// Base URL patterns - checked after nested routes
const URL_ENTITY_MAP: Record<string, EntityInfo> = {
  // ==========================================
  // User Access Module
  // ==========================================
  '/users': {
    module: 'user-access',
    entityType: 'User',
    tableName: 'users',
  },
  '/roles': {
    module: 'user-access',
    entityType: 'Role',
    tableName: 'roles',
  },
  '/permissions': {
    module: 'user-access',
    entityType: 'Permission',
    tableName: 'permissions',
  },

  // ==========================================
  // HR Module
  // ==========================================
  '/employees': {
    module: 'hr',
    entityType: 'Employee',
    tableName: 'employees',
  },
  '/departments': {
    module: 'hr',
    entityType: 'Department',
    tableName: 'departments',
  },
  '/divisions': {
    module: 'hr',
    entityType: 'Division',
    tableName: 'divisions',
  },
  '/positions': {
    module: 'hr',
    entityType: 'Position',
    tableName: 'positions',
  },
  '/job-grades': {
    module: 'hr',
    entityType: 'JobGrade',
    tableName: 'job_grades',
  },
  '/employment-statuses': {
    module: 'hr',
    entityType: 'EmploymentStatus',
    tableName: 'employment_statuses',
  },
  '/work-locations': {
    module: 'hr',
    entityType: 'WorkLocation',
    tableName: 'work_locations',
  },
  '/attendance': {
    module: 'hr',
    entityType: 'Attendance',
    tableName: 'attendances',
  },
  '/leave-requests': {
    module: 'hr',
    entityType: 'LeaveRequest',
    tableName: 'leave_requests',
  },

  // ==========================================
  // Inventory Module
  // ==========================================
  '/products': {
    module: 'inventory',
    entityType: 'Product',
    tableName: 'products',
  },
  '/categories': {
    module: 'inventory',
    entityType: 'Category',
    tableName: 'categories',
  },
  '/brands': {
    module: 'inventory',
    entityType: 'Brand',
    tableName: 'brands',
  },
  '/uoms': {
    module: 'inventory',
    entityType: 'Uom',
    tableName: 'uoms',
  },
  '/warehouses': {
    module: 'inventory',
    entityType: 'Warehouse',
    tableName: 'warehouses',
  },
  '/stocks': {
    module: 'inventory',
    entityType: 'Stock',
    tableName: 'stocks',
  },
  '/stock-transactions': {
    module: 'inventory',
    entityType: 'StockTransaction',
    tableName: 'stock_transactions',
  },
  '/assets': {
    module: 'inventory',
    entityType: 'Asset',
    tableName: 'assets',
  },
  '/asset-assignments': {
    module: 'inventory',
    entityType: 'AssetAssignment',
    tableName: 'asset_assignments',
  },

  // ==========================================
  // Mess Module
  // ==========================================
  '/mess-sites': {
    module: 'mess',
    entityType: 'MessSite',
    tableName: 'mess_sites',
  },
  '/mess-blocks': {
    module: 'mess',
    entityType: 'MessBlock',
    tableName: 'mess_blocks',
  },
  '/mess-floors': {
    module: 'mess',
    entityType: 'MessFloor',
    tableName: 'mess_floors',
  },
  '/mess-rooms': {
    module: 'mess',
    entityType: 'MessRoom',
    tableName: 'mess_rooms',
  },
  '/mess-occupancies': {
    module: 'mess',
    entityType: 'MessOccupancy',
    tableName: 'mess_occupancies',
  },

  // ==========================================
  // Building Module
  // ==========================================
  '/buildings': {
    module: 'building',
    entityType: 'Building',
    tableName: 'buildings',
  },
  '/floors': {
    module: 'building',
    entityType: 'Floor',
    tableName: 'floors',
  },
  '/rooms': {
    module: 'building',
    entityType: 'Room',
    tableName: 'rooms',
  },
  '/maintenance-logs': {
    module: 'building',
    entityType: 'MaintenanceLog',
    tableName: 'maintenance_logs',
  },

  // ==========================================
  // Master Data Module
  // ==========================================
  '/provinces': {
    module: 'master-data',
    entityType: 'Province',
    tableName: 'provinces',
  },
  '/cities': {
    module: 'master-data',
    entityType: 'City',
    tableName: 'cities',
  },
  '/blood-types': {
    module: 'master-data',
    entityType: 'BloodType',
    tableName: 'blood_types',
  },
  '/religions': {
    module: 'master-data',
    entityType: 'Religion',
    tableName: 'religions',
  },
  '/education-levels': {
    module: 'master-data',
    entityType: 'EducationLevel',
    tableName: 'education_levels',
  },
  '/relationship-types': {
    module: 'master-data',
    entityType: 'RelationshipType',
    tableName: 'relationship_types',
  },
};

// Fields yang harus di-sanitize (tidak boleh masuk audit log)
const SENSITIVE_FIELDS = [
  'password',
  'passwordHash',
  'token',
  'refreshToken',
  'secret',
  'apiKey',
];

/**
 * Extract entity info dari URL
 * Handles both nested routes (e.g., /users/:id/roles) and base routes (e.g., /users)
 */
export function extractEntityInfo(url: string): EntityInfo | null {
  // Remove query params dan trailing slash
  const cleanUrl = url.split('?')[0].replace(/\/$/, '');

  // First, check nested route patterns (more specific patterns first)
  for (const { pattern, info } of NESTED_ROUTE_PATTERNS) {
    if (pattern.test(cleanUrl)) {
      return info;
    }
  }

  // Then, check base URL patterns
  // Sort patterns by length (longest first) to match most specific route
  const sortedPatterns = Object.entries(URL_ENTITY_MAP).sort(
    ([a], [b]) => b.length - a.length,
  );

  for (const [pattern, info] of sortedPatterns) {
    if (cleanUrl.includes(pattern)) {
      return info;
    }
  }

  return null;
}

/**
 * Extract record ID dari URL
 * Supports: /users/:id, /users/:id/roles, etc.
 * For nested routes, extracts the parent entity ID
 */
export function extractRecordId(url: string): string | null {
  const cleanUrl = url.split('?')[0];
  const uuidRegex =
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
  const match = cleanUrl.match(uuidRegex);
  return match ? match[0] : null;
}

/**
 * Sanitize object - remove sensitive fields
 */
export function sanitizeValue(
  value: unknown,
): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const sanitized: Record<string, unknown> = {};

  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    // Skip sensitive fields
    if (
      SENSITIVE_FIELDS.some((field) =>
        key.toLowerCase().includes(field.toLowerCase()),
      )
    ) {
      continue;
    }

    // Skip internal TypeORM fields
    if (key.startsWith('__')) {
      continue;
    }

    // Recursively sanitize nested objects
    if (
      val &&
      typeof val === 'object' &&
      !Array.isArray(val) &&
      !(val instanceof Date)
    ) {
      sanitized[key] = sanitizeValue(val);
    } else {
      sanitized[key] = val;
    }
  }

  return sanitized;
}

/**
 * Compare two objects and return only changed fields
 */
export function compareObjects(
  oldObj: Record<string, unknown> | null,
  newObj: Record<string, unknown> | null,
): { oldValue: Record<string, unknown>; newValue: Record<string, unknown> } {
  const oldValue: Record<string, unknown> = {};
  const newValue: Record<string, unknown> = {};

  if (!oldObj && !newObj) {
    return { oldValue, newValue };
  }

  if (!oldObj) {
    return { oldValue: {}, newValue: newObj || {} };
  }

  if (!newObj) {
    return { oldValue: oldObj, newValue: {} };
  }

  // Get all keys from both objects
  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

  for (const key of allKeys) {
    const oldVal = oldObj[key];
    const newVal = newObj[key];

    // Skip if values are equal
    if (JSON.stringify(oldVal) === JSON.stringify(newVal)) {
      continue;
    }

    oldValue[key] = oldVal;
    newValue[key] = newVal;
  }

  return { oldValue, newValue };
}

/**
 * Build human-readable description
 */
export function buildDescription(
  action: string,
  entityType: string,
  userName?: string,
  recordIdentifier?: string,
): string {
  const user = userName || 'System';
  const record = recordIdentifier ? ` "${recordIdentifier}"` : '';

  switch (action) {
    case 'CREATE':
      return `${user} created ${entityType}${record}`;
    case 'UPDATE':
      return `${user} updated ${entityType}${record}`;
    case 'DELETE':
    case 'SOFT_DELETE':
      return `${user} deleted ${entityType}${record}`;
    case 'RESTORE':
      return `${user} restored ${entityType}${record}`;
    default:
      return `${user} performed ${action} on ${entityType}${record}`;
  }
}

/**
 * Map HTTP method ke AuditAction
 */
export function mapMethodToAction(method: string): string | null {
  switch (method.toUpperCase()) {
    case 'POST':
      return 'CREATE';
    case 'PUT':
    case 'PATCH':
      return 'UPDATE';
    case 'DELETE':
      return 'DELETE';
    default:
      return null;
  }
}

/**
 * Check if URL should be audited
 */
export function shouldAudit(url: string, method: string): boolean {
  // Skip audit endpoints
  if (url.includes('/audit')) {
    return false;
  }

  // Skip auth endpoints except change-password
  if (
    url.includes('/auth') &&
    !url.includes('/change-password')
  ) {
    return false;
  }

  // Only audit CUD operations
  const action = mapMethodToAction(method);
  return action !== null;
}