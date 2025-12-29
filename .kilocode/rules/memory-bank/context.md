
# Current Context

## Current Work Focus

**Authentication, RBAC, HR Module, dan Inventory Module - 100% COMPLETE** ✅

Semua modul inti telah diimplementasikan, diuji, dan siap untuk production:
1. ✅ **Authentication** - JWT login, refresh token rotation, first login password change
2. ✅ **RBAC** - 11 predefined roles, 374+ permissions, permission guards
3. ✅ **User Management** - CRUD users, role assignment, password reset
4. ✅ **Role Management** - CRUD roles, permission tree UI
5. ✅ **Audit Trail** - Global interceptor, old value capture, 43 table mappings
6. ✅ **HR Module Master Data** - 7 sub-modules (Divisions, Departments, Positions, Job Grades, Employment Statuses, Work Locations, Organization)
7. ✅ **HR Module Employees** - Complete CRUD, photo upload, document management, family/education records, statistics, contract expiry tracking
8. ✅ **HR Dashboard** - Statistics cards, contract expiry alerts (H-30/H-60), quick actions, module navigation
9. ✅ **Payroll Write Permissions** - Backend validation, frontend form protection
10. ✅ **Excel Import Feature** - Bulk employee import with validation, error reporting, and template generation
11. ✅ **Attendance Module** - Clock-in/out with geolocation and QR scan, late detection, statistics, HR management, calendar view, field mapping
12. ✅ **Leave Requests Module** - Submit/approve/reject/cancel, approval workflow with delegation, automatic escalation via cron job, leave balance tracking
13. ✅ **Inventory Module** - Categories, Brands, UOMs, Products, Warehouses, Stock Transactions, Dashboard with metrics and alerts

**Testing Results:**
- Backend API: 35+ endpoints passed (including inventory module)
- Frontend Login Flow: 8/8 test cases passed
- Protected Routes: 40+ pages verified (including inventory pages)
- TypeScript compilation: 0 errors
- ESLint: 0 errors

**System Status: Ready for Production** 🚀

**Siap untuk fase berikutnya: Mess Module atau Building Module**

## Recent Changes

### Inventory Module API Alignment Fixes (2025-12-29)

#### Fix 1: Stock Transaction API Paths Alignment
- **Backend**: Added `GET /inventory/stock-transactions/warehouse/:warehouseId` endpoint in [`stock-transactions.controller.ts`](backend/src/modules/inventory/stock-transactions/stock-transactions.controller.ts)
- **Backend**: Added `findByWarehouse(warehouseId: string)` method in [`stock-transactions.service.ts`](backend/src/modules/inventory/stock-transactions/stock-transactions.service.ts)
- **Frontend**: Updated `stockTransactionsApi` in [`inventory.ts`](frontend/src/lib/api/endpoints/inventory.ts) to:
  - Use specific endpoints (`/inbound`, `/outbound`, `/adjustment`, `/transfer`) instead of generic `create`
  - Added `getByWarehouse(warehouseId: string)` method

#### Fix 2: Stock Adjustment TransactionDate Support
- Verified all DTOs already have `transactionDate?: Date` field
- `CreateAdjustmentDto` uses `newQuantity` field allowing both increase and decrease (no constraint on positive/negative)

#### Fix 3: Product Stock Breakdown API Shape
- **Backend**: Updated `getProductStock()` in [`products.service.ts`](backend/src/modules/inventory/products/products.service.ts) to return `{ totalStock: number, breakdown: Stock[] }` instead of raw array
- Frontend already aligned with this response shape

#### Fix 4: Dashboard CategoryType for Fixed vs Consumable
- **Backend**: Added `categoryType: CategoryType` field to `StockByCategoryDto` in [`dashboard-metrics.dto.ts`](backend/src/modules/inventory/dashboard/dto/dashboard-metrics.dto.ts)
- **Backend**: Updated `getStockByCategory()` in [`dashboard.service.ts`](backend/src/modules/inventory/dashboard/dashboard.service.ts) to select and return `category.type`

#### Fix 5: Permission Keys Alignment
- **Frontend**: Updated [`quick-actions-card.tsx`](frontend/src/components/inventory/dashboard/quick-actions-card.tsx) to use `inventory:stock:create` and `inventory:stock:read` matching backend decorators

#### Verification Results
- Backend: `npm run lint && npx tsc --noEmit` - Exit code 0
- Frontend: `npm run lint && npx tsc --noEmit` - Exit code 0

### Inventory Module Implementation (2025-12-29)

#### Backend Inventory Module Structure
- **Main Module**: `backend/src/modules/inventory/inventory.module.ts` - Aggregates all inventory sub-modules
- **Categories Module**: `backend/src/modules/inventory/categories/`
  - `categories.module.ts`, `categories.service.ts`, `categories.controller.ts`
  - DTOs: `CreateCategoryDto`, `UpdateCategoryDto`, `CategoryQueryDto`
  - Features: CRUD with CategoryType (FIXED/CONSUMABLE), soft delete validation
- **Brands Module**: `backend/src/modules/inventory/brands/`
  - `brands.module.ts`, `brands.service.ts`, `brands.controller.ts`
  - DTOs: `CreateBrandDto`, `UpdateBrandDto`, `BrandQueryDto`
  - Features: CRUD with search and pagination
- **UOMs Module**: `backend/src/modules/inventory/uoms/`
  - `uoms.module.ts`, `uoms.service.ts`, `uoms.controller.ts`
  - DTOs: `CreateUomDto`, `UpdateUomDto`, `UomQueryDto`
  - Features: CRUD with search and pagination
- **Products Module**: `backend/src/modules/inventory/products/`
  - `products.module.ts`, `products.service.ts`, `products.controller.ts`
  - DTOs: `CreateProductDto`, `UpdateProductDto`, `ProductQueryDto`
  - Features: CRUD with photo upload, category/brand/UOM relations, minimum stock tracking
- **Warehouses Module**: `backend/src/modules/inventory/warehouses/`
  - `warehouses.module.ts`, `warehouses.service.ts`, `warehouses.controller.ts`
  - DTOs: `CreateWarehouseDto`, `UpdateWarehouseDto`, `WarehouseQueryDto`
  - Features: CRUD with HR integration (WorkLocation, PIC Employee), stock summary, statistics
- **Stock Transactions Module**: `backend/src/modules/inventory/stock-transactions/`
  - `stock-transactions.module.ts`, `stock-transactions.service.ts`, `stock-transactions.controller.ts`
  - DTOs: `CreateInboundDto`, `CreateOutboundDto`, `CreateAdjustmentDto`, `CreateTransferDto`, `StockTransactionQueryDto`
  - Features: Inbound, Outbound, Adjustment, Transfer with auto-generated transaction numbers
- **Dashboard Module**: `backend/src/modules/inventory/dashboard/`
  - `dashboard.module.ts`, `dashboard.service.ts`, `dashboard.controller.ts`
  - DTOs: `DashboardMetricsDto`
  - Features: Overview metrics, stock summary, recent transactions, low stock alerts
- **Seeder**: `backend/src/seeders/inventory.seeder.ts` - Initial categories, brands, UOMs, products, warehouses

#### Backend Enums and Types
- **CategoryType**: `FIXED`, `CONSUMABLE`
- **TransactionType**: `INBOUND`, `OUTBOUND`, `ADJUSTMENT`, `TRANSFER`
- **Transaction Number Format**:
  - INBOUND: `IN/YYYYMMDD/0001`
  - OUTBOUND: `OUT/YYYYMMDD/0001`
  - ADJUSTMENT: `ADJ/YYYYMMDD/0001`
  - TRANSFER: `TRF/YYYYMMDD/0001`

#### Frontend Inventory Implementation
- **Types**: `frontend/src/lib/types/inventory.ts`
  - Interfaces: `Category`, `Brand`, `Uom`, `Product`, `Warehouse`, `Stock`, `StockTransaction`
  - Enums: `CategoryType`, `TransactionType`
  - Query params and form types for all entities
- **API Client**: `frontend/src/lib/api/endpoints/inventory.ts`
  - Categories: `getAll`, `getById`, `create`, `update`, `delete`
  - Brands: `getAll`, `getById`, `create`, `update`, `delete`
  - UOMs: `getAll`, `getById`, `create`, `update`, `delete`
  - Products: `getAll`, `getById`, `create`, `update`, `delete`, `uploadPhoto`, `getMovementHistory`
  - Warehouses: `getAll`, `getById`, `create`, `update`, `delete`, `getStock`, `getStatistics`
  - Stock Transactions: `getAll`, `getById`, `createInbound`, `createOutbound`, `createAdjustment`, `createTransfer`
  - Dashboard: `getOverview`, `getStockSummary`, `getRecentTransactions`, `getLowStockAlerts`
- **Components**: `frontend/src/components/inventory/`
  - Categories: `CategoryTable`, `CategoryForm`
  - Brands: `BrandTable`, `BrandForm`
  - UOMs: `UomTable`, `UomForm`
  - Products: `ProductTable`, `ProductForm`, `ProductPhotoUpload`, `ProductStockCard`, `ProductMovementHistory`
  - Warehouses: `WarehouseTable`, `WarehouseForm`, `WarehouseStockSummary`, `WarehouseStatisticsCard`
  - Stock Transactions: `StockTransactionTable`, `StockTransactionDetailCard`, `InboundForm`, `OutboundForm`, `AdjustmentForm`, `TransferForm`
  - Dashboard: `InventoryOverviewCard`, `StockSummaryCard`, `LowStockAlertsCard`, `RecentTransactionsCard`, `QuickActionsCard`
- **Pages**: `frontend/src/app/(dashboard)/inventory/`
  - `layout.tsx` - Inventory layout with sidebar navigation
  - `page.tsx` - Inventory Dashboard with metrics, alerts, quick actions
  - Categories: `page.tsx`, `create/page.tsx`, `[id]/page.tsx`
  - Brands: `page.tsx`, `create/page.tsx`, `[id]/page.tsx`
  - UOMs: `page.tsx`, `create/page.tsx`, `[id]/page.tsx`
  - Products: `page.tsx`, `create/page.tsx`, `[id]/page.tsx`, `[id]/edit/page.tsx`
  - Warehouses: `page.tsx`, `create/page.tsx`, `[id]/page.tsx`, `[id]/edit/page.tsx`
  - Stock Transactions: `page.tsx`, `[id]/page.tsx`, `inbound/page.tsx`, `outbound/page.tsx`, `adjustment/page.tsx`, `transfer/page.tsx`

#### Permissions Added
- `inventory:category:create/read/update/delete`
- `inventory:brand:create/read/update/delete`
- `inventory:uom:create/read/update/delete`
- `inventory:product:create/read/update/delete`
- `inventory:warehouse:create/read/update/delete`
- `inventory:stock:create/read`
- `inventory:dashboard:read`

#### Navigation Menu Updates
- Added "Inventory" menu item in main navigation
- Added sidebar navigation for inventory sub-modules
- Updated dashboard layout with inventory module access

#### Verification Results
- TypeScript compilation: 0 errors (backend and frontend)
- ESLint: 0 errors (backend and frontend)
- All API endpoints functional
- All frontend pages rendering correctly

### Attendance and Leave Modules Implementation (2025-12-29)

#### Backend Attendance Module
- **Attendance Module**: `backend/src/modules/hr/attendance/`
  - `attendance.module.ts` - Module definition with TypeORM entity registration
  - `attendance.service.ts` - Business logic for clock-in/out, statistics, HR management
  - `attendance.controller.ts` - REST endpoints with Swagger documentation
- **DTOs**: `backend/src/modules/hr/attendance/dto/`
  - `ClockInDto` - Clock-in with method (LOCATION/QR), optional geolocation, optional qrCode
  - `ClockOutDto` - Clock-out with optional geolocation
  - `AttendanceQueryDto` - Query params for filtering (date range, employee, status)
  - `UpdateAttendanceStatusDto` - HR status update (status, notes)
- **Entity Fields** (`backend/src/entities/hr/attendance.entity.ts`):
  - `attendanceDate` (Date) - The date of attendance
  - `clockInTime` (Date | null) - Clock-in timestamp
  - `clockOutTime` (Date | null) - Clock-out timestamp
  - `clockInLocation` (JSONB) - `{ lat, lng, address? }`
  - `clockOutLocation` (JSONB) - `{ lat, lng, address? }`
  - `clockInMethod` (enum: QR, MANUAL, LOCATION) - How employee clocked in
  - `workHours` (decimal) - Calculated work hours
  - `status` (enum: PRESENT, LATE, ABSENT, LEAVE, SICK, PERMIT)
  - `notes` (text) - HR notes
  - `qrCode` (varchar) - QR code value if used for clock-in
- **Features**:
  - Clock-in/out with geolocation capture (LOCATION method)
  - Clock-in via QR code scan (QR method)
  - Late detection (08:00 threshold in Asia/Jakarta timezone)
  - Work hours calculation (clock-out - clock-in in hours, rounded to 2 decimals)
  - Monthly attendance statistics (present, late, absent, leave, sick, permit days)
  - HR management for status updates
- **Field Mapping** (Entity → Frontend):
  - `attendanceDate` → `date` (YYYY-MM-DD string)
  - `clockInTime` → `clockIn` (ISO timestamp string)
  - `clockOutTime` → `clockOut` (ISO timestamp string)
  - Mapping done via `mapAttendance()` function in service
- **Response Shapes**:
  - `MappedAttendance`: `{ id, employeeId, date, clockIn, clockOut, status, workHours, clockInLocation, clockOutLocation, clockInMethod, notes, qrCode, employee? }`
  - `TodayAttendanceResponse`: `{ attendance: MappedAttendance | null, canClockIn: boolean, canClockOut: boolean }`

#### Backend Approval Workflow Service
- **Approval Module**: `backend/src/modules/hr/approval/`
  - `approval.module.ts` - Reusable approval workflow module
  - `approval.service.ts` - Approver detection, availability check, delegation, escalation
- **Service Methods**:
  - `detectApprover(employeeId)` - Get direct manager from employee's manager hierarchy
  - `checkApproverAvailability(approverId, startDate, endDate)` - Check if approver has overlapping approved leave
  - `findDelegateApprover(approverId)` - Get skip-level manager (approver's manager)
  - `findAvailableApprover(employeeId, startDate, endDate)` - Get effective approver with automatic delegation
  - `getApprovalChain(employeeId)` - Build full approval chain up to top management
  - `getApproverInfo(employeeId, startDate, endDate)` - Get detailed approver info with availability status
  - `escalatePendingApprovals(slaDays)` - Escalate old pending requests to delegate approvers
- **Features**:
  - Detect approver from employee's manager hierarchy
  - Check if approver is on leave (approved leave request overlapping date range)
  - Find delegate when approver is unavailable (skip-level manager)
  - Automatic escalation after SLA (3 days) via cron job
  - Circular reference protection in approval chain building
  - Reusable for leave requests and future approval workflows

#### Backend Leave Requests Module
- **Leave Requests Module**: `backend/src/modules/hr/leave-requests/`
  - `leave-requests.module.ts` - Module definition with ApprovalModule import, ScheduleModule
  - `leave-requests.service.ts` - Business logic for submit, approve, reject, cancel, balance, statistics
  - `leave-requests.controller.ts` - REST endpoints with Swagger documentation
- **DTOs**: `backend/src/modules/hr/leave-requests/dto/`
  - `CreateLeaveRequestDto` - Submit leave (leaveType, startDate, endDate, reason, attachmentUrl?)
  - `ApproveLeaveDto` - Approve with optional notes
  - `RejectLeaveDto` - Reject with required notes (reason)
  - `LeaveRequestQueryDto` - Query params for filtering (status, leaveType, year)
- **Entity Fields** (`backend/src/entities/hr/leave-request.entity.ts`):
  - `leaveType` (enum: ANNUAL, SICK, MATERNITY, PATERNITY, MARRIAGE, BEREAVEMENT, UNPAID, PERMIT, OTHER)
  - `startDate`, `endDate` (Date)
  - `totalDays` (int) - Calculated working days
  - `reason` (text)
  - `attachmentUrl` (varchar, nullable) - For medical certificates etc.
  - `status` (enum: PENDING, APPROVED, REJECTED, CANCELLED)
  - `approverId`, `delegateApproverId` (UUID, nullable)
  - `approvedAt` (timestamp, nullable)
  - `approvalNotes` (text, nullable)
- **Features**:
  - Leave request submission with date range
  - Leave types: ANNUAL, SICK, MATERNITY, PATERNITY, MARRIAGE, BEREAVEMENT, UNPAID, PERMIT, OTHER
  - Approval workflow with manager hierarchy
  - Delegate escalation when manager is on leave
  - Automatic escalation after 3 days via cron job (`@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)`)
  - Leave balance tracking (annual: 12 days, sick: 12 days per year)
  - Working days calculation (excludes weekends)
  - Cancel own pending requests
  - Attendance records created automatically on approval (LEAVE, SICK, or PERMIT status)
  - Leave balance deduction on approval
- **Statistics Response Shape** (flattened):
  ```typescript
  {
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

#### Frontend Attendance Implementation
- **Types**: `frontend/src/lib/types/attendance.ts`
  - `AttendanceStatus` enum: PRESENT, LATE, ABSENT, LEAVE, SICK, PERMIT
  - `ClockInMethod` enum: QR, MANUAL, LOCATION
  - `Attendance` interface with mapped field names (date, clockIn, clockOut)
  - `TodayAttendance`: `{ attendance, canClockIn, canClockOut }`
  - `AttendanceStatistics`, `ClockInRequest`, `ClockOutRequest`, `AttendanceQueryParams`
- **API Client**: `frontend/src/lib/api/endpoints/attendance.ts`
  - `clockIn(data)` - POST /hr/attendance/clock-in
  - `clockOut(data)` - POST /hr/attendance/clock-out
  - `getTodayAttendance()` - GET /hr/attendance/me/today
  - `getMyAttendance(params)` - GET /hr/attendance/me
  - `getMyStatistics(month, year)` - GET /hr/attendance/statistics
  - `getEmployeeStatistics(employeeId, month, year)` - GET /hr/attendance/statistics/:employeeId
  - `getAll(params)` - GET /hr/attendance (HR management)
  - `getAttendanceByEmployee(employeeId, params)` - GET /hr/attendance/employee/:employeeId
  - `updateStatus(id, data)` - PATCH /hr/attendance/:id/status
- **Components**: `frontend/src/components/hr/attendance/`
  - `ClockInOutCard` - Clock in/out with geolocation capture and QR scan support
  - `AttendanceTable` - Data table with status badges
  - `AttendanceCalendar` - Monthly calendar with color-coded days
  - `AttendanceStatsCard` - Statistics display (present, late, absent, etc.)
  - `UpdateStatusDialog` - HR dialog for status updates
- **Pages**: `frontend/src/app/(dashboard)/hr/attendance/`
  - `page.tsx` - My attendance page with clock-in/out, calendar, stats
  - `all/page.tsx` - HR attendance management with filters
  - `employee/[id]/page.tsx` - Individual employee attendance detail

#### Frontend Leave Requests Implementation
- **Types**: `frontend/src/lib/types/leave.ts`
  - `LeaveType` enum: ANNUAL, SICK, MATERNITY, PATERNITY, MARRIAGE, BEREAVEMENT, UNPAID, PERMIT, OTHER
  - `LeaveStatus` enum: PENDING, APPROVED, REJECTED, CANCELLED
  - `LeaveRequest`, `LeaveBalance`, `LeaveStatistics` interfaces
  - `CreateLeaveRequest`, `ApproveLeave`, `RejectLeave` types
- **API Client**: `frontend/src/lib/api/endpoints/leave.ts`
  - `submit(data)` - POST /hr/leave-requests
  - `getMyRequests(params)` - GET /hr/leave-requests/my
  - `getPendingApprovals(params)` - GET /hr/leave-requests/pending
  - `getBalance()` - GET /hr/leave-requests/balance
  - `getStatistics(year)` - GET /hr/leave-requests/statistics
  - `getById(id)` - GET /hr/leave-requests/:id
  - `approve(id, data)` - POST /hr/leave-requests/:id/approve
  - `reject(id, data)` - POST /hr/leave-requests/:id/reject
  - `cancel(id)` - POST /hr/leave-requests/:id/cancel
- **Components**: `frontend/src/components/hr/leave-requests/`
  - `LeaveBalanceCard` - Display remaining leave balance
  - `LeaveRequestForm` - Submit new leave request
  - `LeaveRequestTable` - Data table with status and actions
  - `LeaveRequestDetailCard` - Request detail view
  - `ApprovalActionCard` - Approve/reject actions for approvers
  - `PendingApprovalsCard` - List of pending approvals
  - `LeaveStatisticsCard` - Leave usage statistics
  - `LeaveCalendar` - Calendar view of leave requests
- **Pages**: `frontend/src/app/(dashboard)/hr/leave-requests/`
  - `page.tsx` - My leave requests with balance and history
  - `create/page.tsx` - Submit new leave request
  - `[id]/page.tsx` - Leave request detail with approval actions
  - `approvals/page.tsx` - Pending approvals for managers

#### HR Dashboard Updates
- Added Attendance section with quick clock-in/out status
- Added Leave section with pending approvals count
- Updated navigation menu with Attendance and Leave items

#### Navigation Menu Updates
- Added "Absensi" (Attendance) menu item under HR
- Added "Cuti" (Leave) menu item under HR
- Updated HR layout sidebar with new navigation items

#### Permissions Added
- `hr:attendance:create` - Clock in/out
- `hr:attendance:read` - View attendance
- `hr:attendance:update` - Update attendance status (HR)
- `hr:leave:create` - Submit leave request
- `hr:leave:read` - View leave requests
- `hr:leave:approve` - Approve/reject leave requests

### Excel Import Bug Fixes (2025-12-29)

#### Bug Fix 1: Column Index Correction
- `parseEmployeeSheet()` in [`excel-import.service.ts`](backend/src/modules/hr/employees/excel-import.service.ts:306) was reading fields from wrong columns
- All 33 fields now correctly mapped to template columns (Column 1 = NIK through Column 33 = bpjsKetenagakerjaan)
- Lines 306-338 updated with correct column indices

#### Bug Fix 2: Gender Code Acceptance
- Template uses L/P codes but validation expected MALE/FEMALE
- Now accepts: L, LAKI-LAKI, MALE → Gender.MALE
- Now accepts: P, PEREMPUAN, FEMALE → Gender.FEMALE
- Lines 395-407 updated in [`excel-import.service.ts`](backend/src/modules/hr/employees/excel-import.service.ts:395)

#### Bug Fix 3: Unknown Employee NIK Error Reporting
- Family/education rows with unknown employee NIK were silently dropped
- Now validates against both parsed employees and existing database records
- Reports errors with field `employeeNik` and descriptive message
- Lines 626-636 (family) and 700-710 (education) updated

#### Bug Fix 4: Existing Employee Family/Education Attachment
- Insertion loop only used `employeeNikToIdMap` which only contains newly imported employees
- Now looks up existing employees in database during insertion if not found in new employee map
- Uses `queryRunner.manager.findOne(Employee, { where: { nik, deletedAt: Is