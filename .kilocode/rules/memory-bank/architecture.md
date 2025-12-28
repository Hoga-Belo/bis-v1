
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
| `src/modules/auth/` | Authentication (login, JWT strategy, guards, refresh token) |
| `src/modules/auth/strategies/` | JWT strategy for Passport.js |
| `src/modules/auth/guards/` | JwtAuthGuard for route protection |
| `src/modules/auth/dto/` | Login, ChangePassword, RefreshToken DTOs |
| `src/modules/users/` | User management (CRUD, role assignment, password reset) |
| `src/modules/users/dto/` | CreateUser, UpdateUser, AssignRoles, UserQuery DTOs |
| `src/modules/roles/` | Role management (CRUD, permission assignment) |
| `src/modules/roles/dto/` | CreateRole, UpdateRole, AssignPermissions DTOs |
| `src/common/` | Shared utilities, filters, interceptors, DTOs |
| `src/common/decorators/` | Custom decorators (@RequirePermissions, @CurrentUser, @Public, @Match) |
| `src/common/guards/` | PermissionsGuard for RBAC |
| `src/common/filters/` | HttpExceptionFilter for error handling |
| `src/common/interceptors/` | TransformInterceptor for response formatting |
| `src/config/` | Database, JWT, and other configurations |
| `src/config/data-source.ts` | TypeORM DataSource configuration for CLI |
| `src/migrations/` | TypeORM database migrations |
| `src/migrations/1703635200000-InitialSchema.ts` | Initial migration with all 43 tables |
| `src/migrations/1703635300000-AddRefreshTokenTable.ts` | Refresh token table migration |
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
| `src/components/` | React components |
| `src/components/ui/` | Shadcn UI components |
| `src/components/forms/` | Form components (LoginForm, ChangePasswordForm) |
| `src/components/layouts/` | Layout components (DashboardLayout) |
| `src/components/shared/` | Shared/common components (LoadingSpinner) |
| `src/components/auth/` | Auth components (ProtectedRoute, PermissionGate) |
| `src/components/users/` | User components (UserTable, UserForm, RoleSelector) |
| `src/components/roles/` | Role components (RoleTable, RoleForm, PermissionTree) |
| `src/lib/api/` | API client and endpoint definitions |
| `src/lib/api/client.ts` | Axios client with interceptors |
| `src/lib/api/endpoints/` | API endpoint functions (auth, users, roles) |
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
- hr:employee:create         - Create employees
- hr:employee:read           - View employees
- inventory:product:create   - Create