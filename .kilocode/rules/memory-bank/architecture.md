
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
| `src/modules/hr/attendance/` | Attendance module (clock-in/out, statistics, HR management) |
| `src/modules/hr/attendance/attendance.module.ts` | Attendance module definition with TypeORM entity registration |
| `src/modules/hr/attendance/attendance.service.ts` | Attendance business logic (clock-in/out, statistics, HR management) |
| `src/modules/hr/attendance/attendance.controller.ts` | Attendance REST endpoints with Swagger documentation |
| `src/modules/hr/attendance/dto/` | Attendance DTOs (ClockInDto, ClockOutDto, AttendanceQueryDto, UpdateAttendanceStatusDto) |
| `src/modules/hr/approval/` | Approval workflow service (reusable for leave and other modules) |
| `src/modules/hr/approval/approval.module.ts` | Approval module definition |
| `src/modules/hr/approval/approval.service.ts` | Approver detection, availability check, delegation logic |
| `src/modules/hr/leave-requests/` | Leave requests module (submit, approve, reject, cancel, balance) |
| `src/modules/hr/leave-requests/leave-requests.module.ts` | Leave requests module definition with ApprovalModule import |
| `src/modules/hr/leave-requests/leave-requests.service.ts` | Leave requests business logic (submit, approve, reject, cancel, balance) |
| `src/modules/hr/leave-requests/leave-requests.controller.ts` | Leave requests REST endpoints with Swagger documentation |
| `src/modules/hr/leave-requests/dto/` | Leave DTOs (CreateLeaveRequestDto, ApproveLeaveDto, RejectLeaveDto, LeaveRequestQueryDto) |
| `src/modules/hr/divisions/` | Division management (CRUD) |
| `src/modules/hr/departments/` | Department management (CRUD with division relationship) |
| `src/modules/hr/positions/` | Position management (CRUD) |
| `src/modules/hr/job-grades/` | Job Grade management (CRUD with salary range) |
| `src/modules/hr/employment-statuses/` | Employment Status management (CRUD) |
| `src/modules/hr/work-locations/` | Work Location management (CRUD with city relationship) |
| `src/modules/hr/organization/` | Organization structure (read-only hierarchy views) |
| `src/modules/hr/employees/` | Employee management (CRUD, file uploads, statistics) |
| `src/modules/hr/employees/employees.module.ts` | Employee module definition with Multer config |
| `src/modules/hr/employees/employees.controller.ts` | Employee endpoints with Swagger docs (18+ endpoints) |
| `src/modules/hr/employees/employees.service.ts` | Employee business logic (CRUD, files, stats) |
| `src/modules/hr/employees/dto/` | CreateEmployee, UpdateEmployee, EmployeeQuery, CreateEmployeeFamily, CreateEmployeeEducation DTOs |
| `src/modules/hr/employees/dto/import-employee.dto.ts` | Import DTOs (ImportEmployeeRowDto, ImportFamilyRowDto, ImportEducationRowDto, ImportResultDto) |
| `src/modules/hr/employees/excel-template.service.ts` | Excel template generation with 4 sheets and data validation |
| `src/modules/hr/employees/excel-import.service.ts` | Excel import with validation, transaction, and error report generation |
| `src/config/upload.config.ts` | Multer configurations for photos (5MB), documents (10MB), and Excel (20MB) |
| `uploads/photos/` | Employee photo storage directory |
| `uploads/documents/` | Employee document storage directory |
| `uploads/temp/` | Temporary Excel file storage for import processing |
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
| `src/seeders/inventory.seeder.ts` | Seeds categories, brands, UOMs, products, warehouses |
| `src/types/` | TypeScript type declarations for external modules |
| `src/modules/inventory/` | Inventory module (categories, brands, UOMs, products, warehouses, stock transactions, dashboard) |
| `src/modules/inventory/inventory.module.ts` | Main Inventory module aggregating all sub-modules |
| `src/modules/inventory/categories/` | Category management (CRUD with CategoryType) |
| `src/modules/inventory/categories/categories.module.ts` | Category module definition |
| `src/modules/inventory/categories/categories.service.ts` | Category business logic (CRUD, soft delete validation) |
| `src/modules/inventory/categories/categories.controller.ts` | Category REST endpoints with Swagger documentation |
| `src/modules/inventory/categories/dto/` | Category DTOs (CreateCategoryDto, UpdateCategoryDto, CategoryQueryDto) |
| `src/modules/inventory/brands/` | Brand management (CRUD) |
| `src/modules/inventory/brands/brands.module.ts` | Brand module definition |
| `src/modules/inventory/brands/brands.service.ts` | Brand business logic (CRUD with search and pagination) |
| `src/modules/inventory/brands/brands.controller.ts` | Brand REST endpoints with Swagger documentation |
| `src/modules/inventory/brands/dto/` | Brand DTOs (CreateBrandDto, UpdateBrandDto, BrandQueryDto) |
| `src/modules/inventory/uoms/` | UOM (Unit of Measure) management (CRUD) |
| `src/modules/inventory/uoms/uoms.module.ts` | UOM module definition |
| `src/modules/inventory/uoms/uoms.service.ts` | UOM business logic (CRUD with search and pagination) |
| `src/modules/inventory/uoms/uoms.controller.ts` | UOM REST endpoints with Swagger documentation |
| `src/modules/inventory/uoms/dto/` | UOM DTOs (CreateUomDto, UpdateUomDto, UomQueryDto) |
| `src/modules/inventory/products/` | Product management (CRUD with photo upload) |
| `src/modules/inventory/products/products.module.ts` | Product module definition with Multer config |
| `src/modules/inventory/products/products.service.ts` | Product business logic (CRUD, photo upload, movement history) |
| `src/modules/inventory/products/products.controller.ts` | Product REST endpoints with Swagger documentation |
| `src/modules/inventory/products/dto/` | Product DTOs (CreateProductDto, UpdateProductDto, ProductQueryDto) |
| `src/modules/inventory/warehouses/` | Warehouse management (CRUD with HR integration) |
| `src/modules/inventory/warehouses/warehouses.module.ts` | Warehouse module definition |
| `src/modules/inventory/warehouses/warehouses.service.ts` | Warehouse business logic (CRUD, stock summary, statistics) |
| `src/modules/inventory/warehouses/warehouses.controller.ts` | Warehouse REST endpoints with Swagger documentation |
| `src/modules/inventory/warehouses/dto/` | Warehouse DTOs (CreateWarehouseDto, UpdateWarehouseDto, WarehouseQueryDto) |
| `src/modules/inventory/stock-transactions/` | Stock transaction management (Inbound, Outbound, Adjustment, Transfer) |
| `src/modules/inventory/stock-transactions/stock-transactions.module.ts` | Stock transaction module definition |
| `src/modules/inventory/stock-transactions/stock-transactions.service.ts` | Stock transaction business logic (create transactions, update stock) |
| `src/modules/inventory/stock-transactions/stock-transactions.controller.ts` | Stock transaction REST endpoints with Swagger documentation |
| `src/modules/inventory/stock-transactions/dto/` | Stock transaction DTOs (CreateInboundDto, CreateOutboundDto, CreateAdjustmentDto, CreateTransferDto, StockTransactionQueryDto) |
| `src/modules/inventory/dashboard/` | Inventory dashboard (metrics, alerts) |
| `src/modules/inventory/dashboard/dashboard.module.ts` | Dashboard module definition |
| `src/modules/inventory/dashboard/dashboard.service.ts` | Dashboard business logic (overview, stock summary, low stock alerts) |
| `src/modules/inventory/dashboard/dashboard.controller.ts` | Dashboard REST endpoints with Swagger documentation |
| `src/modules/inventory/dashboard/dto/` | Dashboard DTOs (DashboardMetricsDto) |
| `uploads/products/` | Product photo storage directory |

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
| `src/app/(dashboard)/hr/page.tsx` | HR Dashboard with stats, alerts, quick actions, module navigation |
| `src/app/(dashboard)/hr/divisions/` | Division pages (list, create, edit) |
| `src/app/(dashboard)/hr/departments/` | Department pages (list, create, edit) |
| `src/app/(dashboard)/hr/positions/` | Position pages (list, create, edit) |
| `src/app/(dashboard)/hr/job-grades/` | Job Grade pages (list, create, edit) |
| `src/app/(dashboard)/hr/employment-statuses/` | Employment Status pages (list, create, edit) |
| `src/app/(dashboard)/hr/work-locations/` | Work Location pages (list, create, edit) |
| `src/app/(dashboard)/hr/organization/` | Organization structure page |
| `src/app/(dashboard)/hr/employees/` | Employee pages (list, detail, create, edit, import) |
| `src/app/(dashboard)/hr/employees/page.tsx` | Employee list page with search, filter, pagination |
| `src/app/(dashboard)/hr/employees/[id]/page.tsx` | Employee detail page with 6 tabs |
| `src/app/(dashboard)/hr/employees/create/page.tsx` | Employee create page with multi-section form |
| `src/app/(dashboard)/hr/employees/[id]/edit/page.tsx` | Employee edit page with pre-populated data |
| `src/app/(dashboard)/hr/employees/import/page.tsx` | Excel import page with drag & drop upload |
| `src/components/` | React components |
| `src/components/ui/` | Shadcn UI components |
| `src/components/ui/progress.tsx` | Progress bar component for upload tracking |
| `src/components/ui/alert.tsx` | Alert component with variants (default, destructive, warning) |
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
| `src/components/hr/employees/` | Employee components (EmployeeTable, EmployeeForm, PhotoUpload, ExcelImport, etc.) |
| `src/components/hr/employees/excel-import.tsx` | Excel import component with drag & drop, progress, and error display |
| `src/components/hr/employees/tabs/` | Employee detail tabs (PersonalInfoTab, EmploymentTab, FamilyTab, EducationTab, DocumentsTab, PayrollTab) |
| `src/components/hr/employees/form-sections/` | Employee form sections (PersonalInfoSection, AddressSection, EmploymentSection, PayrollSection) |
| `src/components/dashboard/` | Dashboard components (StatsCard) |
| `src/lib/api/` | API client and endpoint definitions |
| `src/lib/api/client.ts` | Axios client with interceptors |
| `src/lib/api/endpoints/` | API endpoint functions (auth, users, roles, audit, hr, master-data) |
| `src/lib/api/endpoints/hr.ts` | HR API endpoints (divisions, departments, positions, employees, etc.) |
| `src/lib/api/endpoints/master-data.ts` | Master data API endpoints (blood types, religions, education levels, relationship types) |
| `src/lib/utils/file.ts` | File utility functions (formatFileSize, getFileExtension) |
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
| `src/lib/types/hr.ts` | HR types (Division, Department, Position, JobGrade, Employee, EmployeeFamily, EmployeeEducation, EmployeeDocument, etc.) |
| `src/lib/types/attendance.ts` | Attendance types (Attendance, AttendanceStatus, AttendanceStatistics, ClockInRequest, ClockOutRequest) |
| `src/lib/types/leave.ts` | Leave types (LeaveRequest, LeaveType, LeaveStatus, LeaveBalance, LeaveStatistics) |
| `src/lib/api/endpoints/attendance.ts` | Attendance API client (clockIn, clockOut, getToday, getMy, getStatistics, getAll, updateStatus) |
| `src/lib/api/endpoints/leave.ts` | Leave requests API client (create, getMy, getPending, approve, reject, cancel, getBalance) |
| `src/components/hr/attendance/` | Attendance components |
| `src/components/hr/attendance/clock-in-out-card.tsx` | Clock in/out card with geolocation capture |
| `src/components/hr/attendance/attendance-table.tsx` | Attendance data table with status badges |
| `src/components/hr/attendance/attendance-calendar.tsx` | Monthly attendance calendar with color-coded days |
| `src/components/hr/attendance/attendance-stats-card.tsx` | Attendance statistics display |
| `src/components/hr/attendance/update-status-dialog.tsx` | HR dialog for status updates |
| `src/components/hr/leave-requests/` | Leave request components |
| `src/components/hr/leave-requests/leave-balance-card.tsx` | Leave balance display |
| `src/components/hr/leave-requests/leave-request-form.tsx` | Leave request submission form |
| `src/components/hr/leave-requests/leave-request-table.tsx` | Leave requests data table |
| `src/components/hr/leave-requests/leave-request-detail-card.tsx` | Request detail view |
| `src/components/hr/leave-requests/approval-action-card.tsx` | Approve/reject actions for approvers |
| `src/components/hr/leave-requests/pending-approvals-card.tsx` | Pending approvals list |
| `src/components/hr/leave-requests/leave-statistics-card.tsx` | Leave usage statistics |
| `src/components/hr/leave-requests/leave-calendar.tsx` | Leave calendar view |
| `src/app/(dashboard)/hr/attendance/` | Attendance pages |
| `src/app/(dashboard)/hr/attendance/page.tsx` | My attendance page with clock-in/out, calendar, stats |
| `src/app/(dashboard)/hr/attendance/all/page.tsx` | HR attendance management with filters |
| `src/app/(dashboard)/hr/attendance/employee/[id]/page.tsx` | Individual employee attendance detail |
| `src/app/(dashboard)/hr/leave-requests/` | Leave request pages |
| `src/app/(dashboard)/hr/leave-requests/page.tsx` | My leave requests with balance and history |
| `src/app/(dashboard)/hr/leave-requests/create/page.tsx` | Submit new leave request |
| `src/app/(dashboard)/hr/leave-requests/[id]/page.tsx` | Leave request detail with approval actions |
| `src/app/(dashboard)/hr/leave-requests/approvals/page.tsx` | Pending approvals for managers |
| `src/app/(dashboard)/inventory/` | Inventory module pages |
| `src/app/(dashboard)/inventory/layout.tsx` | Inventory layout with sidebar navigation |
| `src/app/(dashboard)/inventory/page.tsx` | Inventory Dashboard with metrics, alerts, quick actions |
| `src/app/(dashboard)/inventory/categories/` | Category pages (list, create, edit) |
| `src/app/(dashboard)/inventory/categories/page.tsx` | Category list page |
| `src/app/(dashboard)/inventory/categories/create/page.tsx` | Category create page |
| `src/app/(dashboard)/inventory/categories/[id]/page.tsx` | Category edit page |
| `src/app/(dashboard)/inventory/brands/` | Brand pages (list, create, edit) |
| `src/app/(dashboard)/inventory/brands/page.tsx` | Brand list page |
| `src/app/(dashboard)/inventory/brands/create/page.tsx` | Brand create page |
| `src/app/(dashboard)/inventory/brands/[id]/page.tsx` | Brand edit page |
| `src/app/(dashboard)/inventory/uoms/` | UOM pages (list, create, edit) |
| `src/app/(dashboard)/inventory/uoms/page.tsx` | UOM list page |
| `src/app/(dashboard)/inventory/uoms/create/page.tsx` | UOM create page |
| `src/app/(dashboard)/inventory/uoms/[id]/page.tsx` | UOM edit page |
| `src/app/(dashboard)/inventory/products/` | Product pages (list, detail, create, edit) |
| `src/app/(dashboard)/inventory/products/page.tsx` | Product list page with search, filter, pagination |
| `src/app/(dashboard)/inventory/products/create/page.tsx` | Product create page |
| `src/app/(dashboard)/inventory/products/[id]/page.tsx` | Product detail page with stock info |
| `src/app/(dashboard)/inventory/products/[id]/edit/page.tsx` | Product edit page |
| `src/app/(dashboard)/inventory/warehouses/` | Warehouse pages (list, detail, create, edit) |
| `src/app/(dashboard)/inventory/warehouses/page.tsx` | Warehouse list page |
| `src/app/(dashboard)/inventory/warehouses/create/page.tsx` | Warehouse create page |
| `src/app/(dashboard)/inventory/warehouses/[id]/page.tsx` | Warehouse detail page with stock summary |
| `src/app/(dashboard)/inventory/warehouses/[id]/edit/page.tsx` | Warehouse edit page |
| `src/app/(dashboard)/inventory/stock-transactions/` | Stock transaction pages |
| `src/app/(dashboard)/inventory/stock-transactions/page.tsx` | Transaction list page |
| `src/app/(dashboard)/inventory/stock-transactions/[id]/page.tsx` | Transaction detail page |
| `src/app/(dashboard)/inventory/stock-transactions/inbound/page.tsx` | Inbound transaction form |
| `src/app/(dashboard)/inventory/stock-transactions/outbound/page.tsx` | Outbound transaction form |
| `src/app/(dashboard)/inventory/stock-transactions/adjustment/page.tsx` | Adjustment transaction form |
| `src/app/(dashboard)/inventory/stock-transactions/transfer/page.tsx` | Transfer transaction form |
| `src/components/inventory/` | Inventory components |
| `src/components/inventory/index.ts` | Main exports |
| `src/components/inventory/categories/` | Category components (CategoryTable, CategoryForm) |
| `src/components/inventory/brands/` | Brand components (BrandTable, BrandForm) |
| `src/components/inventory/uoms/` | UOM components (UomTable, UomForm) |
| `src/components/inventory/products/` | Product components (ProductTable, ProductForm, ProductPhotoUpload, ProductStockCard, ProductMovementHistory) |
| `src/components/inventory/warehouses/` | Warehouse components (WarehouseTable, WarehouseForm, WarehouseStockSummary, WarehouseStatisticsCard) |
| `src/components/inventory/stock-transactions/` | Stock transaction components (StockTransactionTable, StockTransactionDetailCard, InboundForm, OutboundForm, AdjustmentForm, TransferForm) |
| `src/components/inventory/dashboard/` | Dashboard components (InventoryOverviewCard, StockSummaryCard, LowStockAlertsCard, RecentTransactionsCard, QuickActionsCard) |
| `src/lib/types/inventory.ts` | Inventory types (Category, Brand, Uom, Product, Warehouse, Stock, StockTransaction, CategoryType, TransactionType) |
| `src/lib/api/endpoints/inventory.ts` | Inventory API client (categories, brands, uoms, products, warehouses, stockTransactions, dashboard) |

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
- hr:employee:update         - Update employees
- hr:employee:delete         - Delete employees
- hr:employee:read:payroll   - View employee payroll data (field-level permission)
- hr:employee:create:payroll - Create employee payroll data (field-level permission)
- hr:employee:update:payroll - Update employee payroll data (field-level permission)
- hr:attendance:create       - Clock in/out
- hr:attendance:read         - View attendance records
- hr:attendance:update       - Update attendance status (HR)
- hr:leave:create            - Submit leave request
- hr:leave:read              - View leave requests
- hr:leave:approve           - Approve/reject leave requests
- inventory:category:create  - Create categories
- inventory:category:read    - View categories
- inventory:category:update  - Update categories
- inventory:category:delete  - Delete categories
- inventory:brand:create     - Create brands
- inventory:brand:read       - View brands
- inventory:brand:update     - Update brands
- inventory:brand:delete     - Delete brands
- inventory:uom:create       - Create units of measure
- inventory:uom:read         - View units of measure
- inventory:uom:update       - Update units of measure
- inventory:uom:delete       - Delete units of measure
- inventory:product:create   - Create products
- inventory:product:read     - View products
- inventory:product:update   - Update products
- inventory:product:delete   - Delete products
- inventory:warehouse:create - Create warehouses
- inventory:warehouse:read   - View warehouses
- inventory:warehouse:update - Update warehouses
- inventory:warehouse:delete - Delete warehouses
- inventory:stock:create     - Create stock transactions
- inventory:stock:read       - View stock records
- inventory:dashboard:read   - View inventory dashboard
- audit:log:read             - View audit logs
```

### Auth API Endpoints

| Endpoint | Method | Permission | Description |
|----------|--------|------------|-------------|
| `/auth/login` | POST | Public | Login with NIK and password |
| `/auth/refresh` | POST | Public | Refresh access token |
| `/auth/change-password` | POST | Authenticated | Change password (first login or voluntary) |
| `/auth/logout` | POST | Authenticated | Logout and invalidate refresh token |

### User Access API Endpoints

| Endpoint | Method | Permission | Description |
|----------|--------|------------|-------------|
| `/users` | GET | `user-access:user:read` | List users with pagination |
| `/users` | POST | `user-access:user:create` | Create user |
| `/users/:id` | GET | `user-access:user:read` | Get user by ID |
| `/users/:id` | PATCH | `user-access:user:update` | Update user |
| `/users/:id` | DELETE | `user-access:user:delete` | Soft delete user |
| `/users/:id/assign-roles` | POST | `user-access:user:update` | Assign roles to user |
| `/users/:id/reset-password` | POST | `user-access:user:update` | Reset user password (admin) |
| `/roles` | GET | `user-access:role:read` | List roles |
| `/roles` | POST | `user-access:role:create` | Create role |
| `/roles/:id` | GET | `user-access:role:read` | Get role by ID |
| `/roles/:id` | PATCH | `user-access:role:update` | Update role |
| `/roles/:id` | DELETE | `user-access:role:delete` | Soft delete role |
| `/roles/:id/permissions` | GET | `user-access:role:read` | Get role permissions |
| `/roles/:id/permissions` | POST | `user-access:role:update` | Assign permissions to role |
| `/permissions` | GET | `user-access:permission:read` | List all permissions |

### Audit API Endpoints

| Endpoint | Method | Permission | Description |
|----------|--------|------------|-------------|
| `/audit/logs` | GET | `audit:log:read` | List audit logs with filtering and pagination |
| `/audit/logs/:id` | GET | `audit:log:read` | Get audit log by ID |
| `/audit/logs/record/:tableName/:recordId` | GET | `audit:log:read` | Get audit history for a specific record |

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

### Employee Module API Endpoints

| Endpoint | Method | Permission | Description |
|----------|--------|------------|-------------|
| `/hr/employees` | GET | `hr:employee:read` | List employees with pagination, search, filter |
| `/hr/employees` | POST | `hr:employee:create` | Create employee |
| `/hr/employees/statistics` | GET | `hr:employee:read` | Get employee statistics (total, active, contract expiring) |
| `/hr/employees/contracts/expiring` | GET | `hr:employee:read` | Get employees with contracts expiring (configurable days param, default 30) |
| `/hr/employees/:id` | GET | `hr:employee:read` | Get employee by ID with all relations |
| `/hr/employees/:id` | PATCH | `hr:employee:update` | Update employee |
| `/hr/employees/:id` | DELETE | `hr:employee:delete` | Soft delete employee |
| `/hr/employees/:id/photo` | POST | `hr:employee:update` | Upload employee photo |
| `/hr/employees/:id/documents` | GET | `hr:employee:read` | List employee documents |
| `/hr/employees/:id/documents` | POST | `hr:employee:update` | Upload employee document |
| `/hr/employees/:id/documents/:docId` | DELETE | `hr:employee:update` | Delete employee document |
| `/hr/employees/:id/family` | GET | `hr:employee:read` | List employee family members |
| `/hr/employees/:id/family` | POST | `hr:employee:update` | Add employee family member |
| `/hr/employees/:id/family/:familyId` | PATCH | `hr:employee:update` | Update employee family member |
| `/hr/employees/:id/family/:familyId` | DELETE | `hr:employee:update` | Delete employee family member |
| `/hr/employees/:id/education` | GET | `hr:employee:read` | List employee education records |
| `/hr/employees/:id/education` | POST | `hr:employee:update` | Add employee education record |
| `/hr/employees/:id/education/:eduId` | PATCH | `hr:employee:update` | Update employee education record |
| `/hr/employees/:id/education/:eduId` | DELETE | `hr:employee:update` | Delete employee education record |

### Attendance Module API Endpoints

| Endpoint | Method | Permission | Description |
|----------|--------|------------|-------------|
| `/hr/attendance/clock-in` | POST | `hr:attendance:create` | Clock in for the day with method (LOCATION/QR), optional geolocation, optional qrCode |
| `/hr/attendance/clock-out` | POST | `hr:attendance:create` | Clock out for the day with optional geolocation |
| `/hr/attendance/me/today` | GET | `hr:attendance:read` | Get today's attendance for current user (returns TodayAttendanceResponse) |
| `/hr/attendance/me` | GET | `hr:attendance:read` | Get my attendance history with pagination |
| `/hr/attendance/statistics` | GET | `hr:attendance:read` | Get my monthly attendance statistics |
| `/hr/attendance/statistics/:employeeId` | GET | `hr:attendance:read` | Get specific employee's monthly statistics |
| `/hr/attendance` | GET | `hr:attendance:read` | List all attendance records (HR management) |
| `/hr/attendance/employee/:id` | GET | `hr:attendance:read` | Get specific employee's attendance history |
| `/hr/attendance/:id/status` | PATCH | `hr:attendance:update` | Update attendance status (HR management) |

### Attendance Field Mapping (Entity → Frontend)

The backend uses `mapAttendance()` function to transform entity fields to frontend-friendly names:

```typescript
// Entity fields → Frontend fields
attendanceDate → date (YYYY-MM-DD string)
clockInTime → clockIn (ISO timestamp string or null)
clockOutTime → clockOut (ISO timestamp string or null)

// MappedAttendance interface
interface MappedAttendance {
  id: string;
  employeeId: string;
  date: string;           // YYYY-MM-DD format
  clockIn: string | null; // ISO timestamp
  clockOut: string | null; // ISO timestamp
  status: AttendanceStatus;
  workHours: number | null;
  clockInLocation: { lat: number; lng: number; address?: string } | null;
  clockOutLocation: { lat: number; lng: number; address?: string } | null;
  clockInMethod: ClockInMethod;
  notes: string | null;
  qrCode: string | null;
  employee?: Employee; // Optional, included when requested
}
```

### TodayAttendance Response Shape

```typescript
// GET /hr/attendance/me/today response
interface TodayAttendanceResponse {
  attendance: MappedAttendance | null;  // null if not clocked in today
  canClockIn: boolean;   // true if no clock-in record for today
  canClockOut: boolean;  // true if clocked in but not clocked out
}
```

### ClockInMethod Enum

```typescript
// backend/src/entities/hr/attendance.entity.ts
export enum ClockInMethod {
  QR = 'QR',           // Clock-in via QR code scan
  MANUAL = 'MANUAL',   // Manual clock-in by HR
  LOCATION = 'LOCATION' // Clock-in with geolocation
}
```

### Clock-In Request DTOs

```typescript
// ClockInDto - supports both LOCATION and QR methods
interface ClockInDto {
  method: ClockInMethod;  // Required: LOCATION or QR
  latitude?: number;      // Optional: for LOCATION method
  longitude?: number;     // Optional: for LOCATION method
  qrCode?: string;        // Optional: for QR method
}

// ClockOutDto
interface ClockOutDto {
  latitude?: number;      // Optional geolocation
  longitude?: number;     // Optional geolocation
}
```

### Late Detection Logic

```typescript
// In attendance.service.ts - Asia/Jakarta timezone (UTC+7)
const LATE_THRESHOLD_HOUR = 8; // 08:00 local time

// Check if clock-in is late
const clockInTime = new Date();
const jakartaTime = new Date(clockInTime.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
const isLate = jakartaTime.getHours() >= LATE_THRESHOLD_HOUR;
const status = isLate ? AttendanceStatus.LATE : AttendanceStatus.PRESENT;
```

### Leave Requests Module API Endpoints

| Endpoint | Method | Permission | Description |
|----------|--------|------------|-------------|
| `/hr/leave-requests` | POST | `hr:leave:create` | Submit new leave request |
| `/hr/leave-requests/my` | GET | `hr:leave:read` | Get my leave requests with pagination |
| `/hr/leave-requests/pending` | GET | `hr:leave:approve` | Get pending approvals for current user |
| `/hr/leave-requests/balance` | GET | `hr:leave:read` | Get my leave balance (annual, sick) |
| `/hr/leave-requests/statistics` | GET | `hr:leave:read` | Get my leave usage statistics (flattened response) |
| `/hr/leave-requests/:id` | GET | `hr:leave:read` | Get leave request detail |
| `/hr/leave-requests/:id/approve` | POST | `hr:leave:approve` | Approve leave request |
| `/hr/leave-requests/:id/reject` | POST | `hr:leave:approve` | Reject leave request with reason |
| `/hr/leave-requests/:id/cancel` | POST | `hr:leave:create` | Cancel own pending leave request |

### Inventory Module API Endpoints

| Endpoint | Method | Permission | Description |
|----------|--------|------------|-------------|
| `/inventory/categories` | GET | `inventory:category:read` | List categories with pagination |
| `/inventory/categories` | POST | `inventory:category:create` | Create category |
| `/inventory/categories/:id` | GET | `inventory:category:read` | Get category by ID |
| `/inventory/categories/:id` | PATCH | `inventory:category:update` | Update category |
| `/inventory/categories/:id` | DELETE | `inventory:category:delete` | Soft delete category |
| `/inventory/brands` | GET | `inventory:brand:read` | List brands with pagination |
| `/inventory/brands` | POST | `inventory:brand:create` | Create brand |
| `/inventory/brands/:id` | GET | `inventory:brand:read` | Get brand by ID |
| `/inventory/brands/:id` | PATCH | `inventory:brand:update` | Update brand |
| `/inventory/brands/:id` | DELETE | `inventory:brand:delete` | Soft delete brand |
| `/inventory/uoms` | GET | `inventory:uom:read` | List UOMs with pagination |
| `/inventory/uoms` | POST | `inventory:uom:create` | Create UOM |
| `/inventory/uoms/:id` | GET | `inventory:uom:read` | Get UOM by ID |
| `/inventory/uoms/:id` | PATCH | `inventory:uom:update` | Update UOM |
| `/inventory/uoms/:id` | DELETE | `inventory:uom:delete` | Soft delete UOM |
| `/inventory/products` | GET | `inventory:product:read` | List products with pagination, search, filter |
| `/inventory/products` | POST | `inventory:product:create` | Create product |
| `/inventory/products/:id` | GET | `inventory:product:read` | Get product by ID with stock info |
| `/inventory/products/:id` | PATCH | `inventory:product:update` | Update product |
| `/inventory/products/:id` | DELETE | `inventory:product:delete` | Soft delete product |
| `/inventory/products/:id/photo` | POST | `inventory:product:update` | Upload product photo |
| `/inventory/products/:id/movement-history` | GET | `inventory:product:read` | Get product movement history |
| `/inventory/warehouses` | GET | `inventory:warehouse:read` | List warehouses with pagination |
| `/inventory/warehouses` | POST | `inventory:warehouse:create` | Create warehouse |
| `/inventory/warehouses/:id` | GET | `inventory:warehouse:read` | Get warehouse by ID |
| `/inventory/warehouses/:id` | PATCH | `inventory:warehouse:update` | Update warehouse |
| `/inventory/warehouses/:id` | DELETE | `inventory:warehouse:delete` | Soft delete warehouse |
| `/inventory/warehouses/:id/stock` | GET | `inventory:warehouse:read` | Get warehouse stock summary |
| `/inventory/warehouses/:id/statistics` | GET | `inventory:warehouse:read` | Get warehouse statistics |
| `/inventory/stock-transactions` | GET | `inventory:stock:read` | List stock transactions with pagination |
| `/inventory/stock-transactions/:id` | GET | `inventory:stock:read` | Get stock transaction by ID |
| `/inventory/stock-transactions/inbound` | POST | `inventory:stock:create` | Create inbound transaction |
| `/inventory/stock-transactions/outbound` | POST | `inventory:stock:create` | Create outbound transaction |
| `/inventory/stock-transactions/adjustment` | POST | `inventory:stock:create` | Create adjustment transaction |
| `/inventory/stock-transactions/transfer` | POST | `inventory:stock:create` | Create transfer transaction |
| `/inventory/dashboard/overview` | GET | `inventory:dashboard:read` | Get inventory overview metrics |
| `/inventory/dashboard/stock-summary` | GET | `inventory:dashboard:read` | Get stock summary by status |
| `/inventory/dashboard/recent-transactions` | GET | `inventory:dashboard:read` | Get recent transactions |
| `/inventory/dashboard/low-stock-alerts` | GET | `inventory:dashboard:read` | Get low stock alerts |

### Inventory Enums

#### CategoryType Enum

```typescript
// backend/src/entities/inventory/category.entity.ts
export enum CategoryType {
  FIXED = 'FIXED',           // Aset Tetap (Fixed Assets)
  CONSUMABLE = 'CONSUMABLE', // Barang Habis Pakai (Consumables)
}
```

#### TransactionType Enum

```typescript
// backend/src/entities/inventory/stock-transaction.entity.ts
export enum TransactionType {
  INBOUND = 'INBOUND',       // Barang Masuk
  OUTBOUND = 'OUTBOUND',     // Barang Keluar
  ADJUSTMENT = 'ADJUSTMENT', // Penyesuaian Stok
  TRANSFER = 'TRANSFER',     // Transfer Antar Gudang
}
```

### Transaction Number Format

Stock transactions use auto-generated transaction numbers with the following format:

```typescript
// Format: PREFIX/YYYYMMDD/SEQUENCE
// Examples:
// - INBOUND:    IN/20251229/0001
// - OUTBOUND:   OUT/20251229/0001
// - ADJUSTMENT: ADJ/20251229/0001
// - TRANSFER:   TRF/20251229/0001

// Generation logic in stock-transactions.service.ts
private async generateTransactionNumber(type: TransactionType): Promise<string> {
  const prefix = {
    [TransactionType.INBOUND]: 'IN',
    [TransactionType.OUTBOUND]: 'OUT',
    [TransactionType.ADJUSTMENT]: 'ADJ',
    [TransactionType.TRANSFER]: 'TRF',
  }[type];
  
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  
  // Get count of transactions today
  const count = await this.stockTransactionRepository.count({
    where: {
      transactionType: type,
      createdAt: Between(startOfDay(today), endOfDay(today)),
    },
  });
  
  const sequence = String(count + 1).padStart(4, '0');
  return `${prefix}/${dateStr}/${sequence}`;
}
```

### Stock Transaction Logic

```typescript
// Inbound: Creates/updates stock record, increases quantity
async createInbound(dto: CreateInboundDto): Promise<StockTransaction> {
  // Find or create stock record
  let stock = await this.stockRepository.findOne({
    where: { productId: dto.productId, warehouseId: dto.warehouseId },
  });
  
  if (stock) {
    stock.quantity += dto.quantity;
  } else {
    stock = this.stockRepository.create({
      productId: dto.productId,
      warehouseId: dto.warehouseId,
      quantity: dto.quantity,
    });
  }
  
  await this.stockRepository.save(stock);
  // Create transaction record...
}

// Outbound: Validates sufficient stock, decreases quantity
async createOutbound(dto: CreateOutboundDto): Promise<StockTransaction> {
  const stock = await this.stockRepository.findOne({
    where: { productId: dto.productId, warehouseId: dto.warehouseId },
  });
  
  if (!stock || stock.quantity < dto.quantity) {
    throw new BadRequestException('Insufficient stock');
  }
  
  stock.quantity -= dto.quantity;
  await this.stockRepository.save(stock);
  // Create transaction record...
}

// Adjustment: Sets quantity to new value
async createAdjustment(dto: CreateAdjustmentDto): Promise<StockTransaction> {
  let stock = await this.stockRepository.findOne({
    where: { productId: dto.productId, warehouseId: dto.warehouseId },
  });
  
  const oldQuantity = stock?.quantity || 0;
  const adjustmentQuantity = dto.newQuantity - oldQuantity;
  
  if (stock) {
    stock.quantity = dto.newQuantity;
  } else {
    stock = this.stockRepository.create({
      productId: dto.productId,
      warehouseId: dto.warehouseId,
      quantity: dto.newQuantity,
    });
  }
  
  await this.stockRepository.save(stock);
  // Create transaction record with adjustmentQuantity...
}

// Transfer: Validates source stock, decreases source, increases destination
async createTransfer(dto: CreateTransferDto): Promise<StockTransaction> {
  // Validate source stock
  const sourceStock = await this.stockRepository.findOne({
    where: { productId: dto.productId, warehouseId: dto.sourceWarehouseId },
  });
  
  if (!sourceStock || sourceStock.quantity < dto.quantity) {
    throw new BadRequestException('Insufficient stock in source warehouse');
  }
  
  // Decrease source
  sourceStock.quantity -= dto.quantity;
  await this.stockRepository.save(sourceStock);
  
  // Increase destination
  let destStock = await this.stockRepository.findOne({
    where: { productId: dto.productId, warehouseId: dto.destinationWarehouseId },
  });
  
  if (destStock) {
    destStock.quantity += dto.quantity;
  } else {
    destStock = this.stockRepository.create({
      productId: dto.productId,
      warehouseId: dto.destinationWarehouseId,
      quantity: dto.quantity,
    });
  }
  
  await this.stockRepository.save(destStock);
  // Create transaction record...
}
```

### Warehouse-HR Integration

Warehouses can be linked to HR entities for better management:

```typescript
// backend/src/entities/inventory/warehouse.entity.ts
@Entity('warehouses')
export class Warehouse extends BaseEntity {
  @Column()
  code: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  address: string;

  // Link to WorkLocation from HR module
  @Column({ name: 'work_location_id', nullable: true })
  workLocationId: string;

  @ManyToOne(() => WorkLocation)
  @JoinColumn({ name: 'work_location_id' })
  workLocation: WorkLocation;

  // Link to Employee as Person In Charge
  @Column({ name: 'pic_employee_id', nullable: true })
  picEmployeeId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'pic_employee_id' })
  picEmployee: Employee;

  @Column({ default: true })
  isActive: boolean;
}
```

### Inventory Dashboard Metrics

```typescript
// Dashboard overview response
interface DashboardOverview {
  totalProducts: number;
  totalCategories: number;
  totalBrands: number;
  totalWarehouses: number;
  totalStockValue: number;
  lowStockCount: number;
  outOfStockCount: number;
}

// Stock summary by status
interface StockSummary {
  healthy: number;      // Stock > 50% of minimum
  low: number;          // Stock <= 50% of minimum but > 0
  outOfStock: number;   // Stock = 0
  byCategory: {
    categoryId: string;
    categoryName: string;
    categoryType: CategoryType;
    totalProducts: number;
    totalQuantity: number;
  }[];
}

// Low stock alert
interface LowStockAlert {
  productId: string;
  productCode: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  currentStock: number;
  minimumStock: number;
  percentage: number;    // currentStock / minimumStock * 100
  urgency: 'critical' | 'warning';  // critical <= 25%, warning <= 50%
}
```

### Leave Statistics Response Shape (Flattened)

```typescript
// GET /hr/leave-requests/statistics response
interface LeaveStatistics {
  year: number;
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  cancelledRequests: number;
  totalAnnualDaysTaken: number;
  totalSickDaysTaken: number;
  totalOtherDaysTaken: number;
}
```

### Leave Balance Response Shape

```typescript
// GET /hr/leave-requests/balance response
interface LeaveBalance {
  annualLeave: {
    total: number;      // Default: 12 days per year
    used: number;
    remaining: number;
  };
  sickLeave: {
    total: number;      // Default: 12 days per year
    used: number;
    remaining: number;
  };
}
```

### Leave Type Enum

```typescript
// backend/src/entities/hr/leave-request.entity.ts
export enum LeaveType {
  ANNUAL = 'ANNUAL',           // Cuti Tahunan
  SICK = 'SICK',               // Cuti Sakit
  MATERNITY = 'MATERNITY',     // Cuti Melahirkan
  PATERNITY = 'PATERNITY',     // Cuti Ayah
  MARRIAGE = 'MARRIAGE',       // Cuti Menikah
  BEREAVEMENT = 'BEREAVEMENT', // Cuti Duka
  UNPAID = 'UNPAID',           // Cuti Tanpa Gaji
  PERMIT = 'PERMIT',           // Izin
  OTHER = 'OTHER',             // Lainnya
}
```

### Leave Status Enum

```typescript
export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}
```

### Working Days Calculation

```typescript
// Excludes weekends (Saturday = 6, Sunday = 0)
function calculateWorkingDays(startDate: Date, endDate: Date): number {
  let count = 0;
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}
```

### Approval Workflow Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Employee  │────▶│   Detect    │────▶│   Check     │
│   Submits   │     │   Approver  │     │   Available │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                    ┌─────────────────────────┘
                    ▼
              ┌─────────────┐
              │  Approver   │
              │  On Leave?  │
              └─────────────┘
                    │
         ┌──────────┴──────────┐
         ▼                     ▼
   ┌───────────┐         ┌───────────┐
   │    NO     │         │    YES    │
   │  Assign   │         │  Find     │
   │  Direct   │         │  Delegate │
   └───────────┘         └───────────┘
```

**Approval Workflow Process:**
1. Employee submits leave request
2. System detects approver from employee's manager hierarchy
3. System checks if approver is available (not on approved leave)
4. If approver is on leave, system finds delegate (approver's manager)
5. Request is assigned to available approver
6. Approver can approve or reject with notes/reason
7. Employee is notified of decision
8. Leave balance is updated on approval

**Approval Service Methods:**
```typescript
// Detect approver from employee's manager hierarchy
async detectApprover(employeeId: string): Promise<Employee | null>

// Check if approver has overlapping approved leave
async checkApproverAvailability(approverId: string, startDate: Date, endDate: Date): Promise<boolean>

// Get skip-level manager (approver's manager)
async findDelegateApprover(approverId: string): Promise<Employee | null>

// Get effective approver with automatic delegation - returns { approver, isDelegate }
async findAvailableApprover(employeeId: string, startDate: Date, endDate: Date): Promise<{ approver: Employee | null; isDelegate: boolean }>

// Build full approval chain up to top management
async getApprovalChain(employeeId: string): Promise<Employee[]>

// Get detailed approver info with availability status
async getApproverInfo(employeeId: string, startDate: Date, endDate: Date): Promise<ApproverInfo>

// Escalate old pending requests to delegate approvers (called by cron job)
async escalatePendingApprovals(slaDays: number): Promise<number>
```

**Automatic Escalation Cron Job:**
```typescript
// In leave-requests.service.ts
@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
async handleEscalation(): Promise<void> {
  const escalatedCount = await this.approvalService.escalatePendingApprovals(3);
  this.logger.log(`Escalated ${escalatedCount} pending leave requests`);
}
```

### Excel Import API Endpoints

| Endpoint | Method | Permission | Description |
|----------|--------|------------|-------------|
| `/hr/employees/import/template` | GET | `hr:employee:create` | Download Excel import template (4 sheets) |
| `/hr/employees/import` | POST | `hr:employee:create` | Import employees from Excel file |
| `/hr/employees/import/errors/:filename` | GET | `hr:employee:create` | Download error report Excel file |

### Excel Import Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Download  │────▶│   Fill      │────▶│   Upload    │
│   Template  │     │   Data      │     │   Excel     │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                    ┌─────────────────────────┘
                    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Parse     │────▶│   Validate  │────▶│   Insert    │
│   Excel     │     │   Rows      │     │   Database  │
└─────────────┘     └─────────────┘     └─────────────┘
                          │                    │
                          ▼                    ▼
                    ┌─────────────┐     ┌─────────────┐
                    │   Collect   │     │   Audit     │
                    │   Errors    │     │   Trail     │
                    └─────────────┘     └─────────────┘
                          │
                          ▼
                    ┌─────────────┐
                    │   Generate  │
                    │   Error     │
                    │   Report    │
                    └─────────────┘
```

**Excel Import Process:**
1. User downloads Excel template with 4 sheets (READ_ME, KARYAWAN_HEAD, KELUARGA_DETAIL, PENDIDIKAN_DETAIL)
2. User fills in employee data in KARYAWAN_HEAD sheet with dropdown validation
3. User fills in family data in KELUARGA_DETAIL sheet (optional, linked by NIK)
4. User fills in education data in PENDIDIKAN_DETAIL sheet (optional, linked by NIK)
5. User uploads filled Excel file via drag & drop interface
6. Backend parses Excel using exceljs library
7. Each row is validated against master data (department, position, religion, etc.)
8. NIK uniqueness is checked against database and within batch
9. Family/education records can be attached to both newly imported AND existing employees
10. Valid rows are inserted using TypeORM transaction (atomic operation)
11. Errors are collected with row number, NIK, field, message, and original value
12. If errors exist, error report Excel is generated for download
13. All imported employees are logged in audit trail with CREATE action

**Template Sheet Structure:**
- **READ_ME**: Instructions and master data reference codes
- **KARYAWAN_HEAD**: Employee data with dropdown validation for Gender, Religion, Blood Type, Marital Status, Department, Position, Job Grade, Employment Status, Work Location
- **KELUARGA_DETAIL**: Family member data with Relationship Type dropdown (linked by NIK to new or existing employees)
- **PENDIDIKAN_DETAIL**: Education history with Education Level dropdown (linked by NIK to new or existing employees)

**Excel Import Service Internal Interfaces:**
```typescript
// ParsedFamily interface with rowNumber for error tracking
interface ParsedFamily {
  employeeNik: string;
  rowNumber: number;  // Added for error reporting
  name: string;
  relationshipTypeId: string;
  birthDate?: Date;
  phone?: string;
  address?: string;
  isEmergencyContact: boolean;
}

// ParsedEducation interface with rowNumber for error tracking
interface ParsedEducation {
  employeeNik: string;
  rowNumber: number;  // Added for error reporting
  educationLevelId: string;
  institutionName: string;
  major?: string;
  graduationYear?: number;
  gpa?: number;
}
```

**Insertion Logic for Family/Education Records:**
```typescript
// During insertion, lookup existing employees if not in new employee map
for (const family of parsedData.families) {
  let employeeId = employeeNikToIdMap.get(family.employeeNik);
  
  // If not found in new employees, lookup existing employee in database
  if (!employeeId) {
    const existingEmployee = await queryRunner.manager.findOne(Employee, {
      where: { nik: family.employeeNik, deletedAt: IsNull() },
    });
    if (existingEmployee) {
      employeeId = existingEmployee.id;
    }
  }
  
  if (employeeId) {
    // Insert family record
    familySuccessCount++;
  }
}
```

**Success Count Tracking:**
- `employeeSuccessCount`: Number of new employees successfully imported
- `familySuccessCount`: Number of family records successfully attached
- `educationSuccessCount`: Number of education records successfully attached

**Gender Code Mapping:**
```typescript
// Accepts multiple formats for gender
const genderMap = {
  'L': Gender.MALE,
  'LAKI-LAKI': Gender.MALE,
  'MALE': Gender.MALE,
  'P': Gender.FEMALE,
  'PEREMPUAN': Gender.FEMALE,
  'FEMALE': Gender.FEMALE,
};
```

### File Upload Configuration

The system uses Multer for handling file uploads with the following configurations:

```typescript
// backend/src/config/upload.config.ts

// Photo upload configuration
export const photoUploadConfig = {
  storage: diskStorage({
    destination: './uploads/photos',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `photo-${uniqueSuffix}${extname(file.originalname)}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
      cb(new BadRequestException('Only image files are allowed'), false);
    }
    cb(null, true);
  },
};

// Document upload configuration
export const documentUploadConfig = {
  storage: diskStorage({
    destination: './uploads/documents',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `doc-${uniqueSuffix}${extname(file.originalname)}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/\/(pdf|msword|vnd.openxmlformats|jpeg|jpg|png)$/)) {
      cb(new BadRequestException('Only PDF, Word, and image files are allowed'), false);
    }
    cb(null, true);
  },
};

// Excel upload configuration
export const excelUploadConfig = {
  storage: diskStorage({
    destination: './uploads/temp',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `import-${uniqueSuffix}${extname(file.originalname)}`);
    },
  }),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(xlsx|xls)$/)) {
      cb(new BadRequestException('Only Excel files are allowed'), false);
    }
    cb(null, true);
  },
};
```

**File Storage Directories:**
- `backend/uploads/photos/` - Employee photos (max 5MB, images only)
- `backend/uploads/documents/` - Employee documents (max 10MB, PDF/Word/images)
- `backend/uploads/temp/` - Temporary Excel files for import (max 20MB, .xlsx/.xls only, cleaned up after processing)

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
├── organization/                   # Organization structure (read-only)
│   ├── organization.module.ts
│   ├── organization.controller.ts
│   └── organization.service.ts
├── employees/                      # Employee management
│   ├── employees.module.ts         # Module with Multer config
│   ├── employees.controller.ts     # 21+ endpoints with Swagger docs (includes import)
│   ├── employees.service.ts        # CRUD, file uploads, statistics
│   ├── excel-template.service.ts   # Excel template generation with 4 sheets
│   ├── excel-import.service.ts     # Excel import with validation and transaction
│   └── dto/
│       ├── create-employee.dto.ts
│       ├── update-employee.dto.ts
│       ├── employee-query.dto.ts
│       ├── create-employee-family.dto.ts
│       ├── create-employee-education.dto.ts
│       ├── import-employee.dto.ts  # Import DTOs (row, error, result)
│       └── index.ts
├── attendance/                     # Attendance management
│   ├── attendance.module.ts        # Module with TypeORM entity registration
│   ├── attendance.controller.ts    # REST endpoints with Swagger docs
│   ├── attendance.service.ts       # Clock-in/out, statistics, HR management
│   └── dto/
│       ├── clock-in.dto.ts         # Clock-in with optional geolocation
│       ├── clock-out.dto.ts        # Clock-out with optional geolocation
│       ├── attendance-query.dto.ts # Query params for filtering
│       ├── update-attendance-status.dto.ts  # HR status update
│       └── index.ts
├── approval/                       # Approval workflow (reusable)
│   ├── approval.module.ts          # Module definition
│   ├── approval.service.ts         # Approver detection, availability, delegation
│   └── index.ts
└── leave-requests/                 # Leave requests management
    ├── leave-requests.module.ts    # Module with ApprovalModule import
    ├── leave-requests.controller.ts # REST endpoints with Swagger docs
    ├── leave-requests.service.ts   # Submit, approve, reject, cancel, balance
    └── dto/
        ├── create-leave-request.dto.ts  # Submit leave request
        ├── approve-leave.dto.ts    # Approve with optional notes
        ├── reject-leave.dto.ts     # Reject with required reason
        ├── leave-request-query.dto.ts  # Query params for filtering
        └── index.ts
```

#### Frontend Structure
```
frontend/src/app/(dashboard)/hr/
├── layout.tsx                      # HR layout with sidebar
├── page.tsx                        # HR Dashboard (stats, alerts, quick actions, module grid)
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
├── organization/                   # Organization chart
│   └── page.tsx
├── employees/                      # Employee pages
│   ├── page.tsx                    # List with search, filter, pagination, import button
│   ├── create/page.tsx             # Multi-section create form
│   ├── import/page.tsx             # Excel import page with drag & drop
│   └── [id]/
│       ├── page.tsx                # Detail with 6 tabs
│       └── edit/page.tsx           # Edit with pre-populated data
├── attendance/                     # Attendance pages
│   ├── page.tsx                    # My attendance with clock-in/out, calendar, stats
│   ├── all/page.tsx                # HR attendance management with filters
│   └── employee/
│       └── [id]/page.tsx           # Individual employee attendance detail
└── leave-requests/                 # Leave request pages
    ├── page.tsx                    # My leave requests with balance and history
    ├── create/page.tsx             # Submit new leave request
    ├── approvals/page.tsx          # Pending approvals for managers
    └── [id]/page.tsx               # Leave request detail with approval actions

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
├── organization/
│   ├── index.ts
│   ├── organization-tree.tsx
│   └── department-hierarchy.tsx
├── employees/
│   ├── index.ts                    # Main exports
│   ├── employee-table.tsx          # Data table with actions and import button
│   ├── employee-form.tsx           # Multi-section form
│   ├── photo-upload.tsx            # Photo upload with preview
│   ├── document-upload.tsx         # Document upload with drag-and-drop
│   ├── document-list.tsx           # Document list with download/delete
│   ├── employee-stats.tsx          # Statistics cards
│   ├── contract-expiry-alert.tsx   # Contract expiry notifications
│   ├── excel-import.tsx            # Excel import with drag & drop, progress, error display
│   ├── tabs/
│   │   ├── index.ts
│   │   ├── personal-info-tab.tsx   # Personal information display
│   │   ├── employment-tab.tsx      # Employment details display
│   │   ├── family-tab.tsx          # Family records with inline CRUD
│   │   ├── education-tab.tsx       # Education records with inline CRUD
│   │   ├── documents-tab.tsx       # Document management
│   │   └── payroll-tab.tsx         # Payroll data (permission-protected)
│   └── form-sections/
│       ├── index.ts
│       ├── personal-info-section.tsx
│       ├── address-section.tsx
│       ├── employment-section.tsx
│       └── payroll-section.tsx     # Permission-protected section
├── attendance/                     # Attendance components
│   ├── index.ts                    # Main exports
│   ├── clock-in-out-card.tsx       # Clock in/out with geolocation capture
│   ├── attendance-table.tsx        # Attendance data table with status badges
│   ├── attendance-calendar.tsx     # Monthly calendar with color-coded days
│   ├── attendance-stats-card.tsx   # Attendance statistics display
│   └── update-status-dialog.tsx    # HR dialog for status updates
└── leave-requests/                 # Leave request components
    ├── index.ts                    # Main exports
    ├── leave-balance-card.tsx      # Leave balance display
    ├── leave-request-form.tsx      # Leave request submission form
    ├── leave-request-table.tsx     # Leave requests data table
    ├── leave-request-detail-card.tsx # Request detail view
    ├── approval-action-card.tsx    # Approve/reject actions for approvers
    ├── pending-approvals-card.tsx  # Pending approvals list
    ├── leave-statistics-card.tsx   # Leave usage statistics
    └── leave-calendar.tsx          # Leave calendar view
```

### HR Dashboard Page Structure

The HR landing page (`frontend/src/app/(dashboard)/hr/page.tsx`) serves as a comprehensive dashboard:

```typescript
// HR Dashboard Structure
<div className="space-y-6">
  {/* Employee Statistics Section */}
  <PermissionGate permission="hr:employee:read">
    <EmployeeStats />  {/* Total, Active, Contract Expiring counts */}
  </PermissionGate>

  {/* Contract Expiry Alerts - Tiered System */}
  <PermissionGate permission="hr:employee:read">
    <ContractExpiryAlert
      employees={expiringH30}  // ≤30 days - red/urgent
      variant="destructive"
      title="Kontrak Segera Berakhir (H-30)"
    />
    <ContractExpiryAlert
      employees={expiringH60}  // 31-60 days - yellow/warning
      variant="warning"
      title="Kontrak Akan Berakhir (H-60)"
    />
  </PermissionGate>

  {/* Quick Actions */}
  <div className="flex gap-4">
    <PermissionGate permission="hr:employee:create">
      <Button asChild><Link href="/hr/employees/create">Tambah Karyawan</Link></Button>
    </PermissionGate>
    <PermissionGate permission="hr:organization:read">
      <Button variant="outline" asChild><Link href="/hr/organization">Struktur Organisasi</Link></Button>
    </PermissionGate>
  </div>

  {/* HR Modules Navigation Grid */}
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {/* Division, Department, Position, Job Grade, Employment Status, Work Location, Organization, Employees */}
    {modules.map(module => (
      <PermissionGate key={module.href} permission={module.permission}>
        <Card><Link href={module.href}>{module.title}</Link></Card>
      </PermissionGate>
    ))}
  </div>
</div>
```

**Key Features:**
- **Employee Statistics**: Uses `EmployeeStats` component with `employeesApi.getStatistics()`
- **Tiered Contract Alerts**: H-30 (red/urgent) and H-60 (yellow/warning) using `employeesApi.getExpiringContracts(days)`
- **Quick Actions**: Add Employee and Organization Structure buttons
- **Module Navigation**: Grid of HR sub-modules with permission gates
- **Loading States**: Skeleton loaders during data fetch
- **Error Handling**: Graceful error display with retry options

### Contract Expiry API

The contract expiry endpoint supports a configurable days parameter:

```typescript
// Backend: employees.controller.ts
@Get('contracts/expiring')
@RequirePermissions('hr:employee:read')
async getContractExpiringEmployees(
  @Query('days') days: number = 30,
): Promise<Employee[]> {
  return this.employeesService.getContractExpiringEmployees(days);
}

// Backend: employees.service.ts
async getContractExpiringEmployees(days: number = 30): Promise<Employee[]> {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + days);

  return this.employeeRepository.find({
    where: {
      contractEndDate: Between(today, futureDate),
      deletedAt: IsNull(),
    },
    relations: ['department', 'position'],
    order: { contractEndDate: 'ASC' },
  });
}

// Frontend: hr.ts API endpoint
getExpiringContracts: async (days: number = 30): Promise<Employee[]> => {
  const response = await client.get(`/hr/employees/contracts/expiring?days=${days}`);
  return response.data;
}
```

**Usage in HR Dashboard:**
```typescript
// Fetch H-30 (urgent) and H-60 (warning) separately
const [h30Employees, h60Employees] = await Promise.all([
  employeesApi.getExpiringContracts(30),
  employeesApi.getExpiringContracts(60),
]);

// Filter H-60 to exclude H-30 (already shown as urgent)
const h60Only = h60Employees.filter(emp => {
  const daysRemaining = calculateDaysRemaining(emp.contractEndDate);
  return daysRemaining > 30 && daysRemaining <= 60;
});
```

### Payroll Permission Validation Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Request   │────▶│  Extract    │────▶│  Check      │
│   Arrives   │     │  User       │     │  Permission │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                    ┌─────────────────────────┘
                    ▼
              ┌─────────────┐
              │  Has Payroll│
              │  Permission?│
              └─────────────┘
                    │
         ┌──────────┴──────────┐
         ▼                     ▼
   ┌───────────┐         ┌───────────┐
   │   YES     │         │    NO     │
   │  Include  │         │   Strip   │
   │  Payroll  │         │  Payroll  │
   │  Fields   │         │  Fields   │
   └───────────┘         └───────────┘
```

**Backend Implementation:**
```typescript
// employees.service.ts
private async validatePayrollPermission(
  userId: string,
  isCreate: boolean,
  dto: CreateEmployeeDto | UpdateEmployeeDto,
): Promise<CreateEmployeeDto | UpdateEmployeeDto> {
  const permission = isCreate
    ? 'hr:employee:create:payroll'
    : 'hr:employee:update:payroll';
  
  const hasPermission = await this.checkUserPermission(userId, permission);
  
  if (!hasPermission) {
    // Strip payroll fields from DTO
    const { bankName, bankAccountNumber, bankAccountHolderName,
            npwp, bpjsKesehatan, bpjsKetenagakerjaan, ...rest } = dto;
    return rest;
  }
  
  return dto;
}

// Usage in create/update methods
async create(userId: string, dto: CreateEmployeeDto): Promise<Employee> {
  const sanitizedDto = await this.validatePayrollPermission(userId, true, dto);
  // ... create employee with sanitizedDto
}

async update(userId: string, id: string, dto: UpdateEmployeeDto): Promise<Employee> {
  const sanitizedDto = await this.validatePayrollPermission(userId, false, dto);
  // ... update employee with sanitizedDto
}
```

**Frontend Implementation:**
```typescript
// payroll-section.tsx
export function PayrollSection({ form, isEditing }: PayrollSectionProps) {
  const { hasPermission } = usePermissions();
  
  const canWritePayroll = isEditing
    ? hasPermission('hr:employee:update:payroll')
    : hasPermission('hr:employee:create:payroll');
  
  if (!canWritePayroll) {
    return (
      <Alert variant="info">
        <AlertDescription>
          Anda tidak memiliki izin untuk mengedit data payroll.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Bank Name, Account Number, Account Holder, NPWP, BPJS fields */}
    </div>
  );
}

// employee-form.tsx - Form submission
const onSubmit = async (data: EmployeeFormData) => {
  // Exclude payroll fields if user lacks permission
  if (!hasPermission(isEditing ? 'hr:employee:update:payroll' : 'hr:employee:create:payroll')) {
    const { bankName, bankAccountNumber, bankAccountHolderName,
            npwp, bpjsKesehatan, bpjsKetenagakerjaan, ...rest } = data;
    data = rest;
  }
  
  // Submit sanitized data
  await employeesApi.create(data);
};
```

### Dashboard Integration

The dashboard page integrates with the Employee Module to display HR statistics:

```typescript
// frontend/src/app/(dashboard)/dashboard/page.tsx

// HR Statistics Section
<section>
  <h2>HR Overview</h2>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <StatsCard
      title="Total Employees"
      value={stats.total}
      icon={<Users />}
    />
    <StatsCard
      title="Active Employees"
      value={stats.active}
      icon={<UserCheck />}
    />
    <StatsCard
      title="Contract Expiring"
      value={stats.contractExpiring}
      icon={<AlertTriangle />}
      variant="warning"
    />
  </div>
  <ContractExpiryAlert employees={expiringContracts} />
</section>
```

**Dashboard Components:**
- `StatsCard` - Reusable statistics card with icon, title, value, and optional variant
- `ContractExpiryAlert` - Alert component showing employees with contracts expiring in 30 days

**API Integration:**
- `employeesApi.getStatistics()` - Fetches total, active, and contract expiring counts
- `employeesApi.getContractExpiring()` - Fetches list of employees with expiring contracts

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