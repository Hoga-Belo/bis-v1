/**
 * Audit Trail Types
 *
 * Note: AuditAction must match backend enum in audit-log.entity.ts
 */

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'SOFT_DELETE'
  | 'RESTORE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'EXPORT'
  | 'IMPORT';

export interface AuditLog {
  id: string;
  module: string;
  entityType: string;
  tableName: string;
  recordId: string;
  action: AuditAction;
  description: string;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  userId: string | null;
  user?: {
    id: string;
    nik: string;
    employee?: {
      fullName: string;
    };
  };
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface AuditQueryParams {
  page?: number;
  limit?: number;
  module?: string;
  entityType?: string;
  tableName?: string;
  recordId?: string;
  action?: AuditAction;
  userId?: string;
  dateStart?: string;
  dateEnd?: string;
  search?: string;
}

export interface AuditLogListResponse {
  data: AuditLog[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// For displaying changes in UI
export interface AuditChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

// Helper to extract changes from audit log
export function extractChanges(log: AuditLog): AuditChange[] {
  const changes: AuditChange[] = [];

  if (!log.oldValue && !log.newValue) {
    return changes;
  }

  const allKeys = new Set([
    ...Object.keys(log.oldValue || {}),
    ...Object.keys(log.newValue || {}),
  ]);

  for (const key of allKeys) {
    const oldVal = log.oldValue?.[key];
    const newVal = log.newValue?.[key];

    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changes.push({
        field: key,
        oldValue: oldVal,
        newValue: newVal,
      });
    }
  }

  return changes;
}

// Action display names (must match backend AuditAction enum)
export const ACTION_LABELS: Record<AuditAction, string> = {
  CREATE: 'Created',
  UPDATE: 'Updated',
  DELETE: 'Deleted',
  SOFT_DELETE: 'Soft Deleted',
  RESTORE: 'Restored',
  LOGIN: 'Logged In',
  LOGOUT: 'Logged Out',
  EXPORT: 'Exported',
  IMPORT: 'Imported',
};

// Action colors for badges (must match backend AuditAction enum)
export const ACTION_COLORS: Record<AuditAction, string> = {
  CREATE: 'bg-green-100 text-green-800',
  UPDATE: 'bg-blue-100 text-blue-800',
  DELETE: 'bg-red-100 text-red-800',
  SOFT_DELETE: 'bg-orange-100 text-orange-800',
  RESTORE: 'bg-purple-100 text-purple-800',
  LOGIN: 'bg-cyan-100 text-cyan-800',
  LOGOUT: 'bg-gray-100 text-gray-800',
  EXPORT: 'bg-indigo-100 text-indigo-800',
  IMPORT: 'bg-pink-100 text-pink-800',
};