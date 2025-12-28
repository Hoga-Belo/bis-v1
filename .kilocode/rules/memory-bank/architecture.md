
# System Architecture

## Overview

Bebang BIS follows a Modular Monolith architecture with clear separation between backend API and frontend PWA. The system is designed for scalability while maintaining simplicity in deployment and operations.

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (PWA)                         │
│                    Next.js 14 App Router                    │
├─────────────────────────────────────────────────────────────┤
│                      REST API Layer                         │
│                    NestJS Controllers                       │
├─────────────────────────────────────────────────────────────┤
│                     Service Layer                           │
│              Business Logic & Validation                    │
├─────────────────────────────────────────────────────────────┤
│                    Repository Layer                         │
│                  TypeORM Repositories                       │
├─────────────────────────────────────────────────────────────┤
│                      Database                               │
│                    PostgreSQL 15                            │
└─────────────────────────────────────────────────────────────┘
```

## Source Code Paths

### Backend (`backend/`)
| Path | Description |
|------|-------------|
| `src/entities/` | TypeORM entities (43 tables across 8 modules) |
| `src/entities/base/` | Base entity with common audit columns |
| `src/entities/master-data/` | Province, City, BloodType, Religion, etc. |
| `src/entities/user-access/` | User, Role, Permission, UserRole, RolePermission, RefreshToken |
| `src/entities/hr/` | Employee, Department, Division, Position, Attendance, etc. |
| `src/entities/inventory/` | Product, Category, Brand, Stock, Asset, Warehouse |
| `src/entities/building/` | Building, Floor, Room, MaintenanceLog |
| `src/entities/mess/` | MessSite, MessBlock, MessFloor, MessRoom, MessOccupancy |
| `src/entities/audit/` | AuditLog |
| `src/modules/` | NestJS feature modules |
| `src/modules/hr/` | HR module (master data, employees, attendance, leave) |
| `src/modules/hr/hr.module.ts` | Main HR module aggregating all sub-modules |
| `src/modules/hr/divisions/` | Division management (CRUD) |
| `src/modules/hr/departments/` | Department management (CRUD with division relationship) |
| `src/modules/hr/positions/` | Position management (CRUD) |
| `src/modules/hr/job-grades/` | Job Grade management (CRUD with salary range) |
| `src/modules/hr/employment-statuses/` | Employment Status management (CRUD) |
| `src/modules/hr/work-locations/` | Work Location management (CRUD with city relationship) |
| `src/modules/hr/organization/` | Organization structure (read-only hierarchy views) |
| `src/modules/auth/` | Authentication (login, JWT strategy, guards, refresh token) |
| `src/modules/auth/strategies/` | JWT strategy for Passport.js |
| `src/modules/auth/guards/` | JwtAuthGuard for route protection |
| `src/modules/auth/dto/` | Login, ChangePassword, RefreshToken DTOs |
| `src/modules/users/` | User management (CRUD, role assignment, password reset) |
| `src/modules/users/dto/` | CreateUser, UpdateUser, AssignRoles, UserQuery DTOs |
| `src/modules/roles/` | Role management (CRUD, permission assignment) |
| `src/modules/roles/dto/` | CreateRole, UpdateRole, AssignPermissions DTOs |
| `src/modules/audit/` | Audit logging (CRUD, record history) |
| `src/modules/audit/audit.module.ts` | Audit module definition |
| `src/modules/audit/audit.service.ts` | Audit logging service with createLog, findAll, findByRecord |
| `src/modules/audit/audit.controller.ts` | Audit endpoints (GET /audit/logs, GET /audit/logs/:id, GET /audit/logs/record/:tableName/:recordId) |
| `src/modules/audit/dto/` | AuditQuery, CreateAuditLog DTOs |
| `src/common/` | Shared utilities, filters, interceptors, DTOs |
| `src/common/decorators/` | Custom decorators (@RequirePermissions, @CurrentUser, @Public, @Match) |
| `src/common/guards/` | PermissionsGuard for RBAC |
| `src/common/filters/` | HttpExceptionFilter for error handling |
| `src/common/interceptors/` | TransformInterceptor, AuditInterceptor for response formatting and audit logging |
| `src/common/interceptors/audit.interceptor.ts` | Global audit interceptor with old value capture via fetchOldValue() |
| `src/common/utils/` | Utility functions |
| `src/common/utils/audit.helper.ts` | Audit helper functions with TABLE_ENTITY_MAP, NESTED_ROUTE_PATTERNS, URL_ENTITY_MAP |
| `src/config/` | Database, JWT, and other configurations |
| `src/config/data-source.ts` | TypeORM DataSource configuration for CLI |
| `src/migrations/` | TypeORM database migrations |
| `src/migrations/1703635200000-InitialSchema.ts` | Initial migration with all 43 tables |
| `src/migrations/1703635300000-AddRefreshTokenTable.ts` | Refresh token table migration |
| `src/migrations/1703635400000-AddAuditLogsTable.ts` | Audit logs table migration |
| `src/seeders/` | Database seeders for initial data |
| `src/seeders/seed.ts` | Main seeder entry point |
| `src/seeders/master-data.seeder.ts` | Seeds provinces, cities, blood types, religions, etc. |
| `src/seeders/user-access.seeder.ts` | Seeds roles, permissions, and admin user |
| `src/seeders/hr.seeder.ts` | Seeds departments, divisions, positions, job grades |
| `src/types/` | TypeScript type declarations for external modules |

### Frontend (`frontend/`)
| Path | Description |
|------|-------------|
| `src/app/` | Next.js App Router pages |
| `src/app/(auth)/` | Authentication pages (login, change-password) |
| `src/app/(auth)/login/` | Login page |
| `src/app/(auth)/change-password/` | First login password change page |
| `src/app/(dashboard)/` | Protected dashboard pages |
| `src/app/(dashboard)/dashboard/` | Main dashboard page |
| `src/app/(dashboard)/profile/` | User profile page |
| `src/app/(dashboard)/users/` | User management pages (list, create, edit) |
| `src/app/(dashboard)/roles/` | Role management pages (list, create, edit, permissions) |
| `src/app/(dashboard)/audit/` | Audit trail page with filtering and pagination |
| `src/app/(dashboard)/hr/` | HR module pages |
| `src/app/(dashboard)/hr/layout.tsx` | HR layout with sidebar navigation |
| `src/app/(dashboard)/hr/page.tsx` | HR index (redirect to divisions) |
| `src/app/(dashboard)/hr/divisions/` | Division pages (list, create, edit) |
| `src/app/(dashboard)/hr/departments/` | Department pages (list, create, edit) |
| `src/app/(dashboard)/hr/positions/` | Position pages (list, create, edit) |
| `src/app/(dashboard)/hr/job-grades/` | Job Grade pages (list, create, edit) |
| `src/app/(dashboard)/hr/employment-statuses/` | Employment Status pages (list, create, edit) |
| `src/app/(dashboard)/hr/work-locations/` | Work Location pages (list, create, edit) |
| `src/app/(dashboard)/hr/organization/` | Organization structure page |
| `src/components/` | React components |
| `src/components/ui/` | Shadcn UI components |
| `src/components/forms/` | Form components (LoginForm, ChangePasswordForm) |
| `src/components/layouts/` | Layout components (DashboardLayout) |
| `src/components/shared/` | Shared/common components (LoadingSpinner) |
| `src/components/auth/` | Auth components (ProtectedRoute, PermissionGate) |
| `src/components/users/` | User components (UserTable, UserForm, RoleSelector) |
| `src/components/roles/` | Role components (RoleTable, RoleForm, PermissionTree) |
| `src/components/audit/` | Audit components (AuditDetailDialog, AuditHistoryDialog, ViewHistoryButton) |
| `src/components/hr/` | HR components |
| `src/components/hr/divisions/` | Division components (DivisionTable, DivisionForm) |
| `src/components/hr/departments/` | Department components (DepartmentTable, DepartmentForm) |
| `src/components/hr/positions/` | Position components (PositionTable, PositionForm) |
| `src/components/hr/job-grades/` | Job Grade components (JobGradeTable, JobGradeForm) |
| `src/components/hr/employment-statuses/` | Employment Status components (EmploymentStatusTable, EmploymentStatusForm) |
| `src/components/hr/work-locations/` | Work Location components (WorkLocationTable, WorkLocationForm) |
| `src/components/hr/organization/` | Organization components (OrganizationTree, DepartmentHierarchy) |
| `src/lib/api/` | API client and endpoint definitions |
| `src/lib/api/client.ts` | Axios client with interceptors |
| `src/lib/api/endpoints/` | API endpoint functions (auth, users, roles, audit, hr) |
| `src/lib/api/endpoints/hr.ts` | HR API endpoints (divisions, departments, positions, etc.) |
| `src/lib/stores/` | Zustand state stores |
| `src/lib/stores/auth-store.ts` | Authentication state with refresh token support |
| `src/lib/hooks/` | Custom React hooks |
| `src/lib/hooks/use-auth.ts` | Authentication hook |
| `src/lib/hooks/use-permissions.ts` | Permission checking hook |
| `src/lib/types/` | TypeScript type definitions |
| `src/lib/types/auth.ts` | Auth types (User, LoginRequest, etc.) |
| `src/lib/types/user.ts` | User management types |
| `src/lib/types/role.ts` | Role management types |
| `src/lib/types/api.ts` | API response types |
| `src/lib/types/audit.ts` | Audit types (AuditLog, AuditAction, AuditQueryParams) |
| `src/lib/types/hr.ts` | HR types (Division, Department, Position, JobGrade, etc.) |

## Key Technical Decisions

### Database Design
- **UUID Primary Keys**: All tables use UUID for primary keys to support distributed systems and prevent ID enumeration
- **Soft Delete Pattern**: `deleted_at` column on all entities for data recovery and audit compliance
- **Audit Columns**: `created_at`, `updated_at`, `created_by`, `updated_by` on all entities
- **JSONB Columns**: Used for flexible data storage (e.g., employee metadata, audit context)
- **Partial Unique Indexes**: Business rules enforced at database level (e.g., unique active employee per NIK)

### Authentication & Authorization
- **JWT Tokens**: Stateless authentication with access and refresh tokens
- **Refresh Token Rotation**: Database-stored refresh tokens for secure token rotation
- **Role-Based Access Control (RBAC)**: 11 predefined roles with granular permissions
- **Permission System**: Module-action based permissions (e.g., `user-access:user:create`)
- **First Login Flow**: Mandatory password change on first login
- **Global Guards**: JwtAuthGuard and PermissionsGuard registered globally in AppModule

### API Design
- **RESTful Conventions**: Standard HTTP methods and status codes
- **Response Envelope**: Consistent response format with `success`, `data`, `message`, `meta`
- **Pagination**: Cursor-based pagination for large datasets
- **Validation**: DTO-based validation with class-validator

### Frontend Architecture
- **App Router**: Next.js 14 App Router for file-based routing
- **Server Components**: Default server components with client components where needed
- **State Management**: Zustand for global state (auth, UI preferences)
- **Form Handling**: React Hook Form with Zod validation
- **Permission-based UI**: PermissionGate component for conditional rendering

## Design Patterns

### Backend Patterns
- **Repository Pattern**: TypeORM repositories for data access abstraction
- **Module Pattern**: NestJS modules for feature encapsulation
- **DTO Pattern**: Data Transfer Objects for request/response validation
- **Guard Pattern**: Route protection with JWT and permission guards
- **Decorator Pattern**: Custom decorators for permissions, current user, public routes
- **Interceptor Pattern**: Response transformation and logging
- **Filter Pattern**: Global exception handling

### Frontend Patterns
- **Container/Presenter**: Separation of data fetching and presentation
- **Custom Hooks**: Reusable logic encapsulation (useAuth, usePermissions)
- **Compound Components**: Complex UI components with shared state
- **Optimistic Updates**: Immediate UI feedback with rollback on error
- **Protected Routes**: ProtectedRoute component for authentication and authorization

## Component Relationships

### Backend Module Structure
```
Module
├── module.ts          # Module definition
├── controller.ts      # HTTP endpoints
├── service.ts         # Business logic
├── dto/               # Request/Response DTOs
│   ├── create-*.dto.ts
│   ├── update-*.dto.ts
│   └── *-response.dto.ts
├── guards/            # Module-specific guards (if any)
└── strategies/        # Auth strategies (for auth module)
```

### Entity Relationships
```
User ──────┬──── UserRole ────── Role ────── RolePermission ────── Permission
           │
           ├──── RefreshToken
           │
           └──── Employee ──────┬──── Department
                                ├──── Division
                                ├──── Position
                                ├──── EmployeeFamily
                                ├──── EmployeeEducation
                                ├──── EmployeeDocument
                                ├──── Attendance
                                ├──── LeaveRequest
                                ├──── AssetAssignment
                                └──── MessOccupancy
```

### Frontend Data Flow
```
Page Component
    │
    ├── useAuth() ──────────── auth-store (Zustand)
    │                              │
    │                              ├── isHydrated state (hydration handling)
    │                              ├── onRehydrateStorage callback
    │                              └── Refresh Token Logic
    │
    ├── usePermissions() ────── Permission Checking
    │
    ├── API Client ─────────── endpoints/auth.ts
    │                          endpoints/users.ts
    │                          endpoints/roles.ts
    │                          endpoints/audit.ts
    │                          endpoints/hr.ts
    │                              │
    │                              └── client.ts (axios with interceptors)
    │                                    │
    │                                    ├── isRefreshing flag
    │                                    ├── failedQueue for request queuing
    │                                    └── Automatic token refresh on 401
    │
    ├── ProtectedRoute ──────── Route Protection
    │                              │
    │                              └── Waits for isHydrated before rendering
    │
    ├── PermissionGate ──────── Conditional UI Rendering
    │
    └── UI Components ──────── Shadcn UI + Custom Components
```

## Critical Implementation Paths

### Authentication Flow
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Login     │────▶│  Validate   │────▶│  Generate   │
│   Form      │     │  Credentials│     │  Tokens     │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                    ┌─────────────────────────┘
                    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Store     │────▶│  Check      │────▶│  Redirect   │
│   Tokens    │     │  First Login│     │  Dashboard  │
└─────────────┘     └─────────────┘     └─────────────┘
                          │
                          ▼ (if first login)
                    ┌─────────────┐
                    │  Change     │
                    │  Password   │
                    └─────────────┘
```

1. User submits NIK/password via login form
2. Frontend calls `POST /api/auth/login`
3. Backend validates credentials against User entity with bcrypt
4. JWT access token and refresh token generated
5. Refresh token stored in database for rotation
6. Tokens stored in Zustand store and localStorage
7. Check if first login - redirect to change password if needed
8. Subsequent requests include token in Authorization header
9. JWT guard validates token on protected routes

### Refresh Token Flow
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   401       │────▶│  Call       │────▶│  Validate   │
│   Response  │     │  Refresh    │     │  Refresh    │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                    ┌─────────────────────────┘
                    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Update    │────▶│  Retry      │────▶│  Continue   │
│   Tokens    │     │  Request    │     │  Operation  │
└─────────────┘     └─────────────┘     └─────────────┘
```

1. API request returns 401 Unauthorized
2. Axios interceptor catches error
3. Call refresh token endpoint with stored refresh token
4. Backend validates refresh token in database
5. New access and refresh tokens generated (rotation)
6. Old refresh token invalidated
7. Retry original request with new access token

### RBAC Permission Check Flow
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Request   │────▶│  JWT Guard  │────▶│  Extract    │
│   Arrives   │     │  Validates  │     │  User       │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                    ┌─────────────────────────┘
                    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Check     │────▶│  Load User  │────▶│  Check      │
│   @Public   │     │  Roles      │     │  Permissions│
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                    ┌─────────────────────────┘
                    ▼
              ┌─────────────┐
              │  Grant or   │
              │  Deny (403) │
              └─────────────┘
```

1. Request hits protected endpoint
2. JwtAuthGuard validates JWT token
3. User extracted from token and attached to request
4. PermissionsGuard checks for @Public decorator
5. If not public, load user roles from database
6. Check @RequirePermissions decorator for required permissions
7. Query RolePermission join table for user's permissions
8. Access granted or 403 Forbidden returned

### Permission Code Structure
```
Permission codes follow the pattern: module:entity:action

Examples:
- user-access:user:create    - Create users
- user-access:user:read      - View users
- user-access:user:update    - Update users
- user-access:user:delete    - Delete users
- user-access:role:create    - Create roles
- user-access:role:read      - View roles
- user-access:role:update    - Update roles
- user-access:role:delete    - Delete roles
- hr:division:create         - Create divisions
- hr:division:read           - View divisions
- hr:division:update         - Update divisions
- hr:division:delete         - Delete divisions
- hr:department:create       - Create departments
- hr:department:read         - View departments
- hr:department:update       - Update departments
- hr:department:delete       - Delete departments
- hr:position:create         - Create positions
- hr:position:read           - View positions
- hr:position:update         - Update positions
- hr:position:delete         - Delete positions
- hr:job-grade:create        - Create job grades
- hr:job-grade:read          - View job grades
- hr:job-grade:update        - Update job grades
- hr:job-grade:delete        - Delete job grades
- hr:employment-status:create - Create employment statuses
- hr:employment-status:read   - View employment statuses
- hr:employment-status:update - Update employment statuses
- hr:employment-status:delete - Delete employment statuses
- hr:work-location:create    - Create work locations
- hr:work-location:read      - View work locations
- hr:work-location:update    - Update work locations
- hr:work-location:delete    - Delete work locations
- hr:organization:read       - View organization structure
- hr:employee:create         - Create employees
- hr:employee:read           - View employees
- inventory:product:create   - Create products
- audit:log:read             - View audit logs
```

### HR Module API Endpoints

| Endpoint | Method | Permission | Description |
|----------|--------|------------|-------------|
| `/hr/divisions` | GET | `hr:division:read` | List divisions with pagination |
| `/hr/divisions` | POST | `hr:division:create` | Create division |
| `/hr/divisions/:id` | GET | `hr:division:read` | Get division by ID |
| `/hr/divisions/:id` | PATCH | `hr:division:update` | Update division |
| `/hr/divisions/:id` | DELETE | `hr:division:delete` | Soft delete division |
| `/hr/departments` | GET | `hr:department:read` | List departments with pagination |
| `/hr/departments` | POST | `hr:department:create` | Create department |
| `/hr/departments/:id` | GET | `hr:department:read` | Get department by ID |
| `/hr/departments/:id` | PATCH | `hr:department:update` | Update department |
| `/hr/departments/:id` | DELETE | `hr:department:delete` | Soft delete department |
| `/hr/positions` | GET | `hr:position:read` | List positions with pagination |
| `/hr/positions` | POST | `hr:position:create` | Create position |
| `/hr/positions/:id` | GET | `hr:position:read` | Get position by ID |
| `/hr/positions/:id` | PATCH | `hr:position:update` | Update position |
| `/hr/positions/:id` | DELETE | `hr:position:delete` | Soft delete position |
| `/hr/job-grades` | GET | `hr:job-grade:read` | List job grades with pagination |
| `/hr/job-grades` | POST | `hr:job-grade:create` | Create job grade |
| `/hr/job-grades/:id` | GET | `hr:job-grade:read` | Get job grade by ID |
| `/hr/job-grades/:id` | PATCH | `hr:job-grade:update` | Update job grade |
| `/hr/job-grades/:id` | DELETE | `hr:job-grade:delete` | Soft delete job grade |
| `/hr/employment-statuses` | GET | `hr:employment-status:read` | List employment statuses |
| `/hr/employment-statuses` | POST | `hr:employment-status:create` | Create employment status |
| `/hr/employment-statuses/:id` | GET | `hr:employment-status:read` | Get employment status by ID |
| `/hr/employment-statuses/:id` | PATCH | `hr:employment-status:update` | Update employment status |
| `/hr/employment-statuses/:id` | DELETE | `hr:employment-status:delete` | Soft delete employment status |
| `/hr/work-locations` | GET | `hr:work-location:read` | List work locations with pagination |
| `/hr/work-locations` | POST | `hr:work-location:create` | Create work location |
| `/hr/work-locations/:id` | GET | `hr:work-location:read` | Get work location by ID |
| `/hr/work-locations/:id` | PATCH | `hr:work-location:update` | Update work location |
| `/hr/work-locations/:id` | DELETE | `hr:work-location:delete` | Soft delete work location |
| `/hr/organization/tree` | GET | `hr:organization:read` | Get full organization tree |
| `/hr/organization/department-hierarchy` | GET | `hr:organization:read` | Get department hierarchy |
| `/hr/organization/employees` | GET | `hr:organization:read` | Get list of active employees for manager selection |

### Organization Service Methods

#### Circular Dependency Validation
The organization service provides methods to prevent circular dependencies in hierarchical structures:

```typescript
// Type definition for manager lookup function
export type ManagerLookupFn = (id: string) => Promise<{ managerId: string | null } | null>;

// Generic method for cycle detection in any hierarchical structure
async validateNoCircularDependency(
  entityId: string,
  proposedManagerId: string | null,
  getManager: ManagerLookupFn,
): Promise<void>

// Convenience method specifically for employee manager validation
async validateEmployeeManagerNoCircularDependency(
  employeeId: string,
  proposedManagerId: string | null,
): Promise<void>
```

**Usage:**
- `validateNoCircularDependency`: Generic method that accepts a custom manager lookup function, allowing it to work with any entity that has a manager relationship
- `validateEmployeeManagerNoCircularDependency`: Pre-configured method for employee entities that uses the Employee repository

**Protection in Tree Building Methods:**
- `getOrganizationTree()`: Uses visited set to prevent infinite loops when building division/department tree
- `getEmployeeSubtree()`: Uses visited set to prevent infinite loops when building employee hierarchy
- `getAllSubordinates()`: Uses visited set to prevent infinite loops when collecting all subordinates

### HR Module Structure

#### Backend Structure
```
backend/src/modules/hr/
├── hr.module.ts                    # Main HR module
├── divisions/                      # Division management
│   ├── divisions.module.ts
│   ├── divisions.controller.ts
│   ├── divisions.service.ts
│   └── dto/
│       ├── create-division.dto.ts
│       ├── update-division.dto.ts
│       ├── division-query.dto.ts
│       └── index.ts
├── departments/                    # Department management
│   ├── departments.module.ts
│   ├── departments.controller.ts
│   ├── departments.service.ts
│   └── dto/
├── positions/                      # Position management
│   ├── positions.module.ts
│   ├── positions.controller.ts
│   ├── positions.service.ts
│   └── dto/
├── job-grades/                     # Job Grade management
│   ├── job-grades.module.ts
│   ├── job-grades.controller.ts
│   ├── job-grades.service.ts
│   └── dto/
├── employment-statuses/            # Employment Status management
│   ├── employment-statuses.module.ts
│   ├── employment-statuses.controller.ts
│   ├── employment-statuses.service.ts
│   └── dto/
├── work-locations/                 # Work Location management
│   ├── work-locations.module.ts
│   ├── work-locations.controller.ts
│   ├── work-locations.service.ts
│   └── dto/
└── organization/                   # Organization structure (read-only)
    ├── organization.module.ts
    ├── organization.controller.ts
    └── organization.service.ts
```

#### Frontend Structure
```
frontend/src/app/(dashboard)/hr/
├── layout.tsx                      # HR layout with sidebar
├── page.tsx                        # HR index (redirect)
├── divisions/                      # Division pages
│   ├── page.tsx                    # List
│   ├── create/page.tsx             # Create
│   └── [id]/page.tsx               # Edit
├── departments/                    # Department pages
│   ├── page.tsx
│   ├── create/page.tsx
│   └── [id]/page.tsx
├── positions/                      # Position pages
│   ├── page.tsx
│   ├── create/page.tsx
│   └── [id]/page.tsx
├── job-grades/                     # Job Grade pages
│   ├── page.tsx
│   ├── create/page.tsx
│   └── [id]/page.tsx
├── employment-statuses/            # Employment Status pages
│   ├── page.tsx
│   ├── create/page.tsx
│   └── [id]/page.tsx
├── work-locations/                 # Work Location pages
│   ├── page.tsx
│   ├── create/page.tsx
│   └── [id]/page.tsx
└── organization/                   # Organization chart
    └── page.tsx

frontend/src/components/hr/
├── index.ts                        # Main exports
├── divisions/
│   ├── index.ts
│   ├── division-table.tsx
│   └── division-form.tsx
├── departments/
│   ├── index.ts
│   ├── department-table.tsx
│   └── department-form.tsx
├── positions/
│   ├── index.ts
│   ├── position-table.tsx
│   └── position-form.tsx
├── job-grades/
│   ├── index.ts
│   ├── job-grade-table.tsx
│   └── job-grade-form.tsx
├── employment-statuses/
│   ├── index.ts
│   ├── employment-status-table.tsx
│   └── employment-status-form.tsx
├── work-locations/
│   ├── index.ts
│   ├── work-location-table.tsx
│   └── work-location-form.tsx
└── organization/
    ├── index.ts
    ├── organization-tree.tsx
    └── department-hierarchy.tsx
```

### Audit Trail Architecture

#### TABLE_ENTITY_MAP
Mapping dari table name ke entity class untuk dynamic repository lookup:
```typescript
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
```

#### NESTED_ROUTE_PATTERNS
Array of regex patterns untuk nested routes yang harus di-check sebelum base routes:
```typescript
const NESTED_ROUTE_PATTERNS: Array<{ pattern: RegExp; info: EntityInfo }> = [
  // User Access - Nested Routes
  { pattern: /\/users\/[^/]+\/roles/, info: { module: 'user-access', entityType: 'UserRole', tableName: 'user_roles' } },
  { pattern: /\/users\/[^/]+\/assign-roles/, info: { module: 'user-access', entityType: 'UserRole', tableName: 'user_roles' } },
  { pattern: /\/users\/[^/]+\/reset-password/, info: { module: 'user-access', entityType: 'User', tableName: 'users' } },
  { pattern: /\/roles\/[^/]+\/permissions/, info: { module: 'user-access', entityType: 'RolePermission', tableName: 'role_permissions' } },
  { pattern: /\/auth\/change-password/, info: { module: 'user-access', entityType: 'User', tableName: 'users' } },
  // HR - Nested Routes
  { pattern: /\/employees\/[^/]+\/family/, info: { module: 'hr', entityType: 'EmployeeFamily', tableName: 'employee_families' } },
  { pattern: /\/employees\/[^/]+\/education/, info: { module: 'hr', entityType: 'EmployeeEducation', tableName: 'employee_educations' } },
  { pattern: /\/employees\/[^/]+\/documents/, info: { module: 'hr', entityType: 'EmployeeDocument', tableName: 'employee_documents' } },
];
```

#### URL_ENTITY_MAP
Base URL patterns untuk semua 43 entities across 6 modules:
```typescript
const URL_ENTITY_MAP: Record<string, EntityInfo> = {
  // User Access Module
  '/users': { module: 'user-access', entityType: 'User', tableName: 'users' },
  '/roles': { module: 'user-access', entityType: 'Role', tableName: 'roles' },
  '/permissions': { module: 'user-access', entityType: 'Permission', tableName: 'permissions' },
  // HR Module
  '/employees': { module: 'hr', entityType: 'Employee', tableName: 'employees' },
  '/departments': { module: 'hr', entityType: 'Department', tableName: 'departments' },
  '/divisions': { module: 'hr', entityType: 'Division', tableName: 'divisions' },
  '/positions': { module: 'hr', entityType: 'Position', tableName: 'positions' },
  '/job-grades': { module: 'hr', entityType: 'JobGrade', tableName: 'job_grades' },
  '/employment-statuses': { module: 'hr', entityType: 'EmploymentStatus', tableName: 'employment_statuses' },
  '/work-locations': { module: 'hr', entityType: 'WorkLocation', tableName: 'work_locations' },
  '/attendance': { module: 'hr', entityType: 'Attendance', tableName: 'attendances' },
  '/leave-requests': { module: 'hr', entityType: 'LeaveRequest', tableName: 'leave_requests' },
  // Inventory Module
  '/products': { module: 'inventory', entityType: 'Product', tableName: 'products' },
  '/categories': { module: 'inventory', entityType: 'Category', tableName: 'categories' },
  '/brands': { module: 'inventory', entityType: 'Brand', tableName: 'brands' },
  '/uoms': { module: 'inventory', entityType: 'Uom', tableName: 'uoms' },
  '/warehouses': { module: 'inventory', entityType: 'Warehouse', tableName: 'warehouses' },
  '/stocks': { module: 'inventory', entityType: 'Stock', tableName: 'stocks' },
  '/stock-transactions': { module: 'inventory', entityType: 'StockTransaction', tableName: 'stock_transactions' },
  '/assets': { module: 'inventory', entityType: 'Asset', tableName: 'assets' },
  '/asset-assignments': { module: 'inventory', entityType: 'AssetAssignment', tableName: 'asset_assignments' },
  // Mess Module
  '/mess-sites': { module: 'mess', entityType: 'MessSite', tableName: 'mess_sites' },
  '/mess-blocks': { module: 'mess', entityType: 'MessBlock', tableName: 'mess_blocks' },
  '/mess-floors': { module: 'mess', entityType: 'MessFloor', tableName: 'mess_floors' },
  '/mess-rooms': { module: 'mess', entityType: 'MessRoom', tableName: 'mess_rooms' },
  '/mess-occupancies': { module: 'mess', entityType: 'MessOccupancy', tableName: 'mess_occupancies' },
  // Building Module
  '/buildings': { module: 'building', entityType: 'Building', tableName: 'buildings' },
  '/floors': { module: 'building', entityType: 'Floor', tableName: 'floors' },
  '/rooms': { module: 'building', entityType: 'Room', tableName: 'rooms' },
  '/maintenance-logs': { module: 'building', entityType: 'MaintenanceLog', tableName: 'maintenance_logs' },
  // Master Data Module
  '/provinces': { module: 'master-data', entityType: 'Province', tableName: 'provinces' },
  '/cities': { module: 'master-data', entityType: 'City', tableName: 'cities' },
  '/blood-types': { module: 'master-data', entityType: 'BloodType', tableName: 'blood_types' },
  '/religions': { module: 'master-data', entityType: 'Religion', tableName: 'religions' },
  '/education-levels': { module: 'master-data', entityType: 'EducationLevel', tableName: 'education_levels' },
  '/relationship-types': { module: 'master-data', entityType: 'RelationshipType', tableName: 'relationship_types' },
};
```

#### Audit Interceptor Flow
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Request   │────▶│  shouldAudit│────▶│  Extract    │
│   Arrives   │     │  Check      │     │  EntityInfo │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                    ┌─────────────────────────┘
                    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Fetch     │────▶│  Execute    │────▶│  Log Audit  │
│   Old Value │     │  Handler    │     │  Async      │
└─────────────┘     └─────────────┘     └─────────────┘
```

1. Request arrives at protected endpoint
2. `shouldAudit()` checks if URL/method should be audited
3. `extractEntityInfo()` gets module, entityType, tableName from URL
4. For UPDATE/DELETE: `fetchOldValue()` retrieves entity state before operation
5. Handler executes the actual operation
6. `logAudit()` creates audit log asynchronously (non-blocking)

#### Audit Service Query Features
```typescript
// Search by description OR user NIK
if (search) {
  queryBuilder.andWhere(
    '(audit.description ILIKE :search OR user.nik ILIKE :search)',
    { search: `%${search}%` },
  );
}

// Date range filtering
if (dateStart && dateEnd) {
  queryBuilder.andWhere('audit.createdAt BETWEEN :dateStart AND :dateEnd', {
    dateStart,
    dateEnd,
  });
}

// Server-side pagination
const [data, total] = await queryBuilder
  .skip((page - 1) * limit)
  .take(limit)
  .getManyAndCount();
```