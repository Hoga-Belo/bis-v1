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
| `src/entities/user-access/` | User, Role, Permission, UserRole, RolePermission |
| `src/entities/hr/` | Employee, Department, Division, Position, Attendance, etc. |
| `src/entities/inventory/` | Product, Category, Brand, Stock, Asset, Warehouse |
| `src/entities/building/` | Building, Floor, Room, MaintenanceLog |
| `src/entities/mess/` | MessSite, MessBlock, MessFloor, MessRoom, MessOccupancy |
| `src/entities/audit/` | AuditLog |
| `src/modules/` | NestJS feature modules |
| `src/modules/auth/` | Authentication (login, JWT strategy, guards) |
| `src/common/` | Shared utilities, filters, interceptors, DTOs |
| `src/config/` | Database, JWT, and other configurations |
| `src/config/data-source.ts` | TypeORM DataSource configuration for CLI |
| `src/migrations/` | TypeORM database migrations |
| `src/migrations/1703635200000-InitialSchema.ts` | Initial migration with all 43 tables |
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
| `src/app/(auth)/` | Authentication pages (login) |
| `src/app/(dashboard)/` | Protected dashboard pages |
| `src/components/` | React components |
| `src/components/ui/` | Shadcn UI components |
| `src/components/forms/` | Form components |
| `src/components/layouts/` | Layout components |
| `src/components/shared/` | Shared/common components |
| `src/lib/api/` | API client and endpoint definitions |
| `src/lib/stores/` | Zustand state stores |
| `src/lib/hooks/` | Custom React hooks |
| `src/lib/types/` | TypeScript type definitions |

## Key Technical Decisions

### Database Design
- **UUID Primary Keys**: All tables use UUID for primary keys to support distributed systems and prevent ID enumeration
- **Soft Delete Pattern**: `deleted_at` column on all entities for data recovery and audit compliance
- **Audit Columns**: `created_at`, `updated_at`, `created_by`, `updated_by` on all entities
- **JSONB Columns**: Used for flexible data storage (e.g., employee metadata, audit context)
- **Partial Unique Indexes**: Business rules enforced at database level (e.g., unique active employee per NIK)

### Authentication & Authorization
- **JWT Tokens**: Stateless authentication with access tokens
- **Role-Based Access Control (RBAC)**: 11 predefined roles with granular permissions
- **Permission System**: Module-action based permissions (e.g., `hr:employee:create`)

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

## Design Patterns

### Backend Patterns
- **Repository Pattern**: TypeORM repositories for data access abstraction
- **Module Pattern**: NestJS modules for feature encapsulation
- **DTO Pattern**: Data Transfer Objects for request/response validation
- **Guard Pattern**: Route protection with JWT and role guards
- **Interceptor Pattern**: Response transformation and logging
- **Filter Pattern**: Global exception handling

### Frontend Patterns
- **Container/Presenter**: Separation of data fetching and presentation
- **Custom Hooks**: Reusable logic encapsulation
- **Compound Components**: Complex UI components with shared state
- **Optimistic Updates**: Immediate UI feedback with rollback on error

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
└── guards/            # Module-specific guards (if any)
```

### Entity Relationships
```
User ──────┬──── UserRole ────── Role ────── RolePermission ────── Permission
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
    │
    ├── API Client ─────────── endpoints/auth.ts
    │                              │
    │                              └── client.ts (axios)
    │
    └── UI Components ──────── Shadcn UI + Custom Components
```

## Critical Implementation Paths

### Authentication Flow
1. User submits NIK/password via login form
2. Frontend calls `POST /api/auth/login`
3. Backend validates credentials against User entity
4. JWT token generated with user ID and roles
5. Token stored in Zustand store and localStorage
6. Subsequent requests include token in Authorization header
7. JWT guard validates token on protected routes

### Audit Logging Flow
1. User performs action (create/update/delete)
2. Interceptor captures request context
3. Service executes business logic
4. AuditLog entity created with 5W1H context
5. Transaction commits both data change and audit log

### Role Permission Check
1. Request hits protected endpoint
2. JWT guard extracts user from token
3. Role guard checks user roles against required permissions
4. Permission checked against RolePermission join table
5. Access granted or 403 Forbidden returned