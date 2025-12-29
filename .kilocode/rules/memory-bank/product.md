# Product Overview

## Why This Project Exists

Bebang BIS addresses the operational challenges of PT Prima Sarana Gemilang (Site Taliabu) by providing a unified platform for managing HR, Inventory, Mess (employee housing), and Building facilities. The system consolidates fragmented operational data into a single, accessible application that works both online and offline through PWA technology.

## Problems It Solves

### HR Management
- Fragmented employee data across multiple systems and spreadsheets
- Manual attendance tracking prone to errors
- Inefficient leave request and approval workflows
- Lack of centralized employee documentation (contracts, certifications)
- No structured tracking of employee family and education records

### Inventory Management
- Manual inventory and asset tracking leading to discrepancies
- No real-time visibility into stock levels across warehouses
- Difficulty tracking asset assignments and movements
- Lack of audit trail for stock transactions

### Mess (Employee Housing) Management
- Inefficient mess housing allocation and occupancy tracking
- No visibility into room availability across sites/blocks/floors
- Manual tracking of check-in/check-out dates
- Difficulty managing housing for different employee categories

### Building & Facilities Management
- Lack of centralized building maintenance records
- No systematic tracking of maintenance requests and completion
- Difficulty managing room allocations across buildings
- No historical data for facility planning

### Compliance & Audit
- No audit trail for operational changes
- Difficulty tracking who did what and when
- Lack of role-based access control for sensitive data

## How It Should Work

### Authentication & Access Control

#### Login Flow
- Single sign-on with NIK (Employee ID) and password
- JWT-based authentication with access and refresh tokens
- Automatic token refresh for seamless user experience
- Secure password hashing with bcrypt

#### First Login Flow
- New users must change their password on first login
- System detects first login via `is_first_login` flag
- Redirects to change password page before accessing dashboard
- Password must meet security requirements (min 8 chars, uppercase, lowercase, number, special char)

#### Role-Based Access Control (RBAC)
- **11 Predefined Roles**:
  - Super Admin - Full system access
  - Admin - Administrative functions
  - HR Manager - HR module management
  - HR Staff - HR data entry
  - Inventory Manager - Inventory module management
  - Inventory Staff - Inventory data entry
  - Mess Manager - Mess module management
  - Mess Staff - Mess data entry
  - Building Manager - Building module management
  - Building Staff - Building data entry
  - Viewer - Read-only access

- **Permission Structure**: Module-action based permissions
  - Format: `module:entity:action`
  - Examples: `user-access:user:create`, `hr:employee:read`, `inventory:product:update`
  - Actions: create, read, update, delete

- **Permission-based UI Rendering**:
  - PermissionGate component for conditional rendering
  - Navigation items shown/hidden based on user permissions
  - Action buttons (edit, delete) only visible if user has permission
  - usePermissions hook for programmatic permission checking

#### Session Management
- Access tokens with configurable expiration (default: 1 day)
- Refresh tokens stored in database for secure rotation
- Automatic token refresh on 401 responses
- Logout clears all tokens and redirects to login

### Module Operations
- **HR Module**: Complete employee lifecycle management from onboarding to offboarding
- **Inventory Module**: Real-time inventory and stock tracking with transaction history
- **Mess Module**: Automated mess occupancy management with availability dashboard
- **Building Module**: Centralized maintenance request system with status tracking

### HR Module (Master Data - Implemented)

#### Division Management
- Create, read, update, delete divisions
- Fields: code (unique), name, description
- Search and filter with pagination
- Soft delete for data recovery

#### Department Management
- Create, read, update, delete departments
- Fields: code (unique), name, description, division relationship, manager (optional)
- Division dropdown for parent assignment
- Manager dropdown with employee list (format: "NIK - Full Name")
- Optional manager field with "Tidak ada manager" option
- Search and filter with pagination

#### Position Management
- Create, read, update, delete positions
- Fields: code (unique), name, level (numeric), description
- Level indicates hierarchy position
- Search and filter with pagination

#### Job Grade Management
- Create, read, update, delete job grades
- Fields: code (unique), name, minSalary, maxSalary, description
- Salary range validation (min <= max)
- Search and filter with pagination

#### Employment Status Management
- Create, read, update, delete employment statuses
- Fields: code (unique), name, description
- Examples: Permanent, Contract, Probation, Internship
- Search and filter with pagination

#### Work Location Management
- Create, read, update, delete work locations
- Fields: code (unique), name, address, city relationship
- City dropdown for location assignment
- Search and filter with pagination

#### Organization Structure Visualization
- **Organization Tree**: Hierarchical view of divisions and departments
  - Expandable/collapsible tree structure
  - Shows division → department relationships
  - Visual indicators for hierarchy levels
  - **Circular dependency protection**: Uses visited set to prevent infinite loops
- **Department Hierarchy**: Detailed department structure view
  - Shows departments grouped by division
  - Displays department details (code, name, description)
  - Quick navigation to department management
- **Circular Dependency Validation**: Prevents invalid manager assignments
  - Generic validation method for any hierarchical entity
  - Employee-specific convenience method
  - Protects tree building methods from infinite loops

### HR Module (Employee Management - Implemented)

#### Employee CRUD Operations
- Create, read, update, delete employees
- Comprehensive employee profile with multiple data sections:
  - **Personal Information**: NIK, full name, gender, birth date/place, blood type, religion, marital status, phone, email
  - **Address Information**: Current address, city, province, postal code
  - **Employment Information**: Department, division, position, job grade, employment status, work location, join date, contract dates, manager
  - **Payroll Information**: Bank name, account number, account holder name, NPWP, BPJS Kesehatan, BPJS Ketenagakerjaan
- Search by NIK, name, or email
- Filter by department, division, position, employment status
- Pagination with configurable page size
- Soft delete for data recovery

#### Photo Upload
- Upload employee profile photo
- Supported formats: JPG, JPEG, PNG, GIF
- Maximum file size: 5MB
- Photo preview before upload
- Automatic file naming with unique suffix
- Storage in `uploads/photos/` directory

#### Document Management
- Upload employee documents (contracts, certifications, etc.)
- Supported formats: PDF, Word documents, images
- Maximum file size: 10MB per document
- Document metadata: name, type, file path, upload date
- Drag-and-drop upload interface
- Document list with download and delete actions
- Storage in `uploads/documents/` directory

#### Family Records Management
- Add, edit, delete employee family members
- Fields: name, relationship type, birth date, phone, address, is emergency contact
- Relationship types from master data (Father, Mother, Spouse, Child, Sibling, etc.)
- Inline CRUD within employee detail page
- Emergency contact designation for quick reference

#### Education Records Management
- Add, edit, delete employee education history
- Fields: education level, institution name, major, graduation year, GPA
- Education levels from master data (SD, SMP, SMA, D3, S1, S2, S3, etc.)
- Inline CRUD within employee detail page
- Chronological display of education history

#### Employee Statistics Dashboard
- **Total Employees**: Count of all employees (including inactive)
- **Active Employees**: Count of employees with active status
- **Contract Expiring**: Count of employees with contracts expiring in 30 days
- Statistics displayed on HR dashboard with visual cards
- Quick navigation to employee list from statistics

#### Contract Expiry Tracking & Notification System
- **Tiered Alert System**:
  - **H-30 (≤30 days)**: Red/destructive variant - urgent action required
  - **H-60 (31-60 days)**: Yellow/warning variant - advance notice
- **Configurable Days Parameter**: API supports custom days parameter (default: 30)
- **Alert Component Features**:
  - Employee list with name, NIK, and days remaining
  - Visual urgency indicators (color-coded)
  - Quick navigation to employee details for contract renewal
  - Grouped display by urgency level
- **Dashboard Integration**: Alerts displayed prominently on HR dashboard

#### HR Dashboard (Landing Page)
- **Employee Statistics Section**:
  - Total employees count
  - Active employees count
  - Contract expiring count (30 days)
  - Visual cards with icons
- **Contract Expiry Alerts**:
  - H-30 urgent alerts (red)
  - H-60 warning alerts (yellow)
  - Employee list with days remaining
- **Quick Actions**:
  - Add Employee button
  - Organization Structure link
- **HR Modules Navigation Grid**:
  - Divisions, Departments, Positions
  - Job Grades, Employment Statuses, Work Locations
  - Organization Structure, Employees
  - Icons and descriptions for each module
- **Permission Gates**: All sections protected by appropriate permissions
- **Loading States**: Skeleton loaders during data fetch
- **Error Handling**: Graceful error display with retry options

#### Field-Level Permissions for Payroll
- **Read Permissions**:
  - `hr:employee:read:payroll` - View payroll information
  - Payroll tab only visible to users with read permission
- **Write Permissions**:
  - `hr:employee:create:payroll` - Create payroll data for new employees
  - `hr:employee:update:payroll` - Update payroll data for existing employees
- **Backend Validation**:
  - `validatePayrollPermission()` method checks user permissions
  - Strips payroll fields from request if user lacks permission
  - Prevents unauthorized payroll data modification
- **Frontend Protection**:
  - `PayrollSection` component hides form inputs without permission
  - Form submission excludes payroll fields when user lacks write permission
  - Uses `usePermissions` hook for real-time permission checking
- **Sensitive Data Protection**:
  - Bank account information protected
  - NPWP (tax ID) protected
  - BPJS numbers protected

#### Employee Detail View (6 Tabs)
1. **Personal Info Tab**: Personal details, contact information, address
2. **Employment Tab**: Job details, department, position, contract dates
3. **Family Tab**: Family members with inline add/edit/delete
4. **Education Tab**: Education history with inline add/edit/delete
5. **Documents Tab**: Document upload and management
6. **Payroll Tab**: Bank and tax information (permission-protected)

#### Excel Bulk Import
- **Template Download**: 4-sheet Excel template with data validation
  - **READ_ME**: Instructions and master data reference codes
  - **KARYAWAN_HEAD**: Employee data with dropdown validation for Gender, Religion, Blood Type, Marital Status, Department, Position, Job Grade, Employment Status, Work Location
  - **KELUARGA_DETAIL**: Family member data with Relationship Type dropdown (linked by NIK to new or existing employees)
  - **PENDIDIKAN_DETAIL**: Education history data with Education Level dropdown (linked by NIK to new or existing employees)
- **Data Validation Dropdowns**: Pre-populated from master data for data integrity
  - Gender (L/Laki-laki, P/Perempuan - accepts multiple formats)
  - Religion (Islam, Kristen, Katolik, Hindu, Buddha, Konghucu)
  - Blood Type (A, B, AB, O)
  - Marital Status (Belum Menikah, Menikah, Cerai Hidup, Cerai Mati)
  - Relationship Type (Ayah, Ibu, Suami, Istri, Anak, Saudara, etc.)
  - Education Level (SD, SMP, SMA, D1, D2, D3, D4, S1, S2, S3)
  - Department, Position, Job Grade, Employment Status, Work Location (from database)
- **Import Process**:
  - Drag & drop file upload with visual feedback
  - File validation (only .xlsx, max 20MB)
  - Upload progress bar with percentage
  - Row-by-row validation against master data
  - NIK uniqueness check (database and within batch)
  - Family/education records can be attached to both newly imported AND existing employees
  - TypeORM transaction for atomic inserts (all-or-nothing per valid row)
  - Skip-error strategy (valid rows inserted, invalid rows skipped)
  - Separate success counts for employees, family records, and education records
- **Error Handling**:
  - Detailed error messages per row (row number, NIK, field, message, original value)
  - Unknown employee NIK in family/education sheets reported with clear error message
  - Error table with pagination in UI
  - Error report Excel generation for download
  - Clear success/error count summary
- **Audit Trail**: All imported employees logged with CREATE action
- **Permission Required**: `hr:employee:create` for template download and import

### HR Module (Attendance Tracking - Implemented)

#### Clock-In/Out System
- **Clock-In Methods**:
  - **LOCATION**: Clock-in with geolocation capture (latitude, longitude)
  - **QR**: Clock-in via QR code scan (stores QR code value)
  - **MANUAL**: Manual clock-in by HR staff
- **Clock-In Features**:
  - Optional geolocation capture for LOCATION method
  - QR code validation for QR method
  - Automatic late detection (08:00 threshold in Asia/Jakarta timezone)
  - Prevents duplicate clock-in for same day
  - Stores clock-in method for audit purposes
- **Clock-Out Features**:
  - Optional geolocation capture for verification
  - Automatic work hours calculation (clock-out - clock-in, rounded to 2 decimals)
  - Prevents clock-out without prior clock-in

#### Attendance Status Types
- **Present**: On-time attendance (clock-in before 08:00)
- **Late**: Late arrival (clock-in at or after 08:00)
- **Absent**: No attendance record for workday
- **Leave**: On approved leave (auto-created when leave approved)
- **Sick**: On sick leave (auto-created when sick leave approved)
- **Permit**: On permit/izin (auto-created when permit approved)

#### Today's Attendance Response
- **Real-time Status Check**:
  - `attendance`: Current day's attendance record (or null if not clocked in)
  - `canClockIn`: Boolean indicating if user can clock in (no record for today)
  - `canClockOut`: Boolean indicating if user can clock out (clocked in but not out)
- **Used by Clock-In/Out Card**: Determines which button to show

#### Attendance Calendar View
- Monthly calendar with color-coded days
- Visual indicators for each status type:
  - Green: Present
  - Yellow: Late
  - Red: Absent
  - Blue: Leave
  - Purple: Sick
  - Cyan: Permit
- Quick navigation between months
- Click on day to view details

#### Attendance Statistics
- **Monthly Statistics**:
  - Present days count
  - Late days count
  - Absent days count
  - Leave days count
  - Sick days count
  - Permit days count
- **Work Hours Summary**: Total hours worked in period
- **Attendance Rate**: Percentage of on-time attendance

#### HR Attendance Management
- View all employee attendance records
- Filter by:
  - Date range (start date, end date)
  - Employee (search by name or NIK)
  - Status (present, late, absent, leave, sick, permit)
- Update attendance status with notes
- View individual employee attendance history
- Export attendance reports

#### Permissions
- `hr:attendance:create` - Clock in/out for self
- `hr:attendance:read` - View attendance records
- `hr:attendance:update` - Update attendance status (HR management)

### HR Module (Leave Management - Implemented)

#### Leave Request Submission
- **Leave Types** (9 types):
  - **ANNUAL**: Cuti Tahunan (Annual Leave)
  - **SICK**: Cuti Sakit (Sick Leave)
  - **MATERNITY**: Cuti Melahirkan (Maternity Leave)
  - **PATERNITY**: Cuti Ayah (Paternity Leave)
  - **MARRIAGE**: Cuti Menikah (Marriage Leave)
  - **BEREAVEMENT**: Cuti Duka (Bereavement Leave)
  - **UNPAID**: Cuti Tanpa Gaji (Unpaid Leave)
  - **PERMIT**: Izin (Permit/Permission)
  - **OTHER**: Lainnya (Other)
- **Request Fields**:
  - Leave type selection
  - Start date and end date
  - Reason/notes for the request
  - Optional attachment URL (for medical certificates, etc.)
- **Validation**:
  - Cannot request leave for past dates
  - End date must be after or equal to start date
  - Sufficient leave balance required (for ANNUAL and SICK)
  - No overlapping leave requests

#### Leave Balance Tracking
- **Annual Leave**: 12 days per year (default allocation)
- **Sick Leave**: 12 days per year (default allocation)
- **Balance Display**:
  - Total allocated days
  - Used days
  - Remaining days
- **Automatic Deduction**: Balance reduced upon approval
- **Balance Restoration**: Balance restored if request cancelled
- **Balance Response Shape**:
  ```
  {
    annualLeave: { total, used, remaining },
    sickLeave: { total, used, remaining }
  }
  ```

#### Approval Workflow
- **Automatic Approver Detection**:
  - System detects approver from employee's manager hierarchy
  - Uses `managerId` field from employee record
  - `detectApprover(employeeId)` method in ApprovalService
- **Approver Availability Check**:
  - System checks if approver is on approved leave
  - Queries leave_requests table for overlapping approved leaves
  - `checkApproverAvailability(approverId, startDate, endDate)` method
- **Delegate Escalation**:
  - If approver is on leave, system finds delegate
  - Delegate is the approver's manager (skip-level manager)
  - `findDelegateApprover(approverId)` method
  - `findAvailableApprover(employeeId, startDate, endDate)` returns `{ approver, isDelegate }`
- **Automatic Escalation (SLA)**:
  - Pending requests older than 3 days are automatically escalated
  - Cron job runs daily at midnight: `@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)`
  - `escalatePendingApprovals(slaDays)` method escalates to delegate approvers
  - Logs escalation count for monitoring
- **Approval Actions**:
  - Approve with optional notes
  - Reject with required reason
- **Status Flow**: Pending → Approved/Rejected/Cancelled
- **Attendance Record Creation**:
  - On approval, attendance records are automatically created for leave dates
  - Status set to LEAVE, SICK, or PERMIT based on leave type

#### Working Days Calculation
- Excludes weekends (Saturday = 6, Sunday = 0) from leave duration
- Example: Monday to Friday = 5 working days
- Example: Friday to Monday = 2 working days (excludes Sat/Sun)
- Used for `totalDays` field in leave request

#### Leave Calendar View
- Monthly calendar showing all leave requests
- Color-coded by status:
  - Yellow: Pending approval
  - Green: Approved
  - Red: Rejected
  - Gray: Cancelled
- Team view for managers to see team availability

#### Leave Statistics (Flattened Response)
- **Response Shape**:
  ```
  {
    year: number,
    totalRequests: number,
    pendingRequests: number,
    approvedRequests: number,
    rejectedRequests: number,
    cancelledRequests: number,
    totalAnnualDaysTaken: number,
    totalSickDaysTaken: number,
    totalOtherDaysTaken: number
  }
  ```
- **Personal Statistics**:
  - Total requests submitted
  - Approved requests count
  - Rejected requests count
  - Pending requests count
  - Cancelled requests count
- **Usage by Type**:
  - Annual leave days used
  - Sick leave days used
  - Other leave days used

#### Pending Approvals (For Managers)
- List of pending leave requests requiring action
- Quick approve/reject actions
- View request details before decision
- Filter by employee or date range
- Shows delegate indicator if request was escalated

#### Self-Service Features
- View own leave history
- Cancel pending requests
- Check leave balance
- Track request status

#### Permissions
- `hr:leave:create` - Submit leave request
- `hr:leave:read` - View leave requests
- `hr:leave:approve` - Approve/reject leave requests (managers)

### Inventory Module (Implemented)

#### Category Management
- Create, read, update, delete categories
- Fields: code (unique), name, description, categoryType
- **Category Types**:
  - **FIXED**: Aset Tetap (Fixed Assets) - long-term assets like equipment, vehicles
  - **CONSUMABLE**: Barang Habis Pakai (Consumables) - items that are used up
- Search and filter with pagination
- Soft delete with validation (cannot delete if products exist)

#### Brand Management
- Create, read, update, delete brands
- Fields: code (unique), name, description
- Search and filter with pagination
- Soft delete for data recovery

#### UOM (Unit of Measure) Management
- Create, read, update, delete units of measure
- Fields: code (unique), name, description
- Examples: PCS (Pieces), BOX, KG, LITER, METER
- Search and filter with pagination
- Soft delete for data recovery

#### Product Management
- Create, read, update, delete products
- Fields: code (unique), name, description, category, brand, UOM, minimumStock, photoUrl
- **Photo Upload**:
  - Supported formats: JPG, JPEG, PNG, GIF
  - Maximum file size: 5MB
  - Storage in `uploads/products/` directory
  - Automatic file naming with unique suffix
- **Stock Tracking**:
  - Current stock per warehouse
  - Minimum stock threshold for alerts
  - Stock status indicators (healthy, low, out of stock)
- **Movement History**:
  - View all stock transactions for a product
  - Filter by date range and transaction type
  - Chronological display with transaction details
- Search by code, name, or description
- Filter by category, brand, stock status
- Pagination with configurable page size

#### Warehouse Management
- Create, read, update, delete warehouses
- Fields: code (unique), name, address, workLocationId, picEmployeeId, isActive
- **HR Integration**:
  - Link to WorkLocation from HR module
  - Link to Employee as Person In Charge (PIC)
  - Both are optional but recommended for proper management
- **Stock Summary**:
  - View all products and quantities in warehouse
  - Filter by category or stock status
  - Export stock report
- **Statistics**:
  - Total products count
  - Total stock quantity
  - Low stock items count
  - Recent transactions count
- Search and filter with pagination
- Soft delete for data recovery

#### Stock Transactions
- **Transaction Types**:
  - **INBOUND**: Barang Masuk - receiving stock into warehouse
  - **OUTBOUND**: Barang Keluar - issuing stock from warehouse
  - **ADJUSTMENT**: Penyesuaian Stok - correcting stock quantities
  - **TRANSFER**: Transfer Antar Gudang - moving stock between warehouses
- **Auto-Generated Transaction Numbers**:
  - Format: `PREFIX/YYYYMMDD/SEQUENCE`
  - INBOUND: `IN/20251229/0001`
  - OUTBOUND: `OUT/20251229/0001`
  - ADJUSTMENT: `ADJ/20251229/0001`
  - TRANSFER: `TRF/20251229/0001`
- **Transaction Fields**:
  - Transaction number (auto-generated)
  - Transaction type
  - Product and warehouse
  - Quantity
  - Reference number (optional)
  - Notes (optional)
  - For transfers: source and destination warehouses
- **Stock Updates**:
  - Inbound: Creates/updates stock record, increases quantity
  - Outbound: Validates sufficient stock, decreases quantity
  - Adjustment: Sets quantity to new value (can increase or decrease)
  - Transfer: Validates source stock, decreases source, increases destination
- **Validation**:
  - Outbound: Prevents if insufficient stock
  - Transfer: Prevents if insufficient stock in source warehouse
  - All: Validates product and warehouse exist
- View transaction history with filtering
- Transaction detail view with all information

#### Inventory Dashboard
- **Overview Metrics**:
  - Total products count
  - Total categories count
  - Total brands count
  - Total warehouses count
  - Total stock value (if pricing enabled)
  - Low stock items count
  - Out of stock items count
- **Stock Summary by Status**:
  - Healthy: Stock > 50% of minimum
  - Low: Stock ≤ 50% of minimum but > 0
  - Out of Stock: Stock = 0
- **Stock by Category**:
  - Breakdown by category type (FIXED vs CONSUMABLE)
  - Product count and total quantity per category
- **Low Stock Alerts**:
  - Products below minimum stock threshold
  - Urgency levels:
    - **Critical** (≤25%): Immediate action required
    - **Warning** (≤50%): Attention needed
  - Shows product name, warehouse, current vs minimum stock
  - Quick navigation to product details
- **Recent Transactions**:
  - Latest stock movements
  - Color-coded by transaction type
  - Quick view of transaction details
- **Quick Actions**:
  - Create Inbound Transaction
  - Create Outbound Transaction
  - Create Transfer
  - Create Adjustment
  - Add New Product
  - Add New Warehouse

#### Permissions
- `inventory:category:create` - Create categories
- `inventory:category:read` - View categories
- `inventory:category:update` - Update categories
- `inventory:category:delete` - Delete categories
- `inventory:brand:create` - Create brands
- `inventory:brand:read` - View brands
- `inventory:brand:update` - Update brands
- `inventory:brand:delete` - Delete brands
- `inventory:uom:create` - Create units of measure
- `inventory:uom:read` - View units of measure
- `inventory:uom:update` - Update units of measure
- `inventory:uom:delete` - Delete units of measure
- `inventory:product:create` - Create products
- `inventory:product:read` - View products
- `inventory:product:update` - Update products
- `inventory:product:delete` - Delete products
- `inventory:warehouse:create` - Create warehouses
- `inventory:warehouse:read` - View warehouses
- `inventory:warehouse:update` - Update warehouses
- `inventory:warehouse:delete` - Delete warehouses
- `inventory:stock:create` - Create stock transactions
- `inventory:stock:read` - View stock records
- `inventory:dashboard:read` - View inventory dashboard

### User Management
- Create, read, update, delete users
- Assign multiple roles to users
- Admin password reset functionality
- Search and filter users with pagination
- Soft delete for data recovery

### Role Management
- Create, read, update, delete roles
- Assign permissions to roles via permission tree UI
- Visual permission tree for easy management
- Grouped permissions by module for clarity

### Audit Trail & Compliance
- **Automatic Audit Logging**: Global interceptor captures all Create, Update, Delete operations
- **5W1H Context**: Each log records Who (user), What (action), When (timestamp), Where (module/entity), Why (description), How (old/new values)
- **Old Value Capture**: For UPDATE/DELETE operations, the system fetches and stores the entity state before the operation
- **Complete Entity Mapping**:
  - TABLE_ENTITY_MAP: Maps 43 table names to entity classes for dynamic repository lookup
  - NESTED_ROUTE_PATTERNS: Regex patterns for nested routes (e.g., `/users/:id/roles`)
  - URL_ENTITY_MAP: Base URL patterns for all entities across 6 modules
- **Audit Log Viewer**: Dedicated page with comprehensive filtering:
  - Filter by module (user-access, hr, inventory, mess, building, master-data)
  - Filter by action (CREATE, UPDATE, DELETE, SOFT_DELETE, RESTORE)
  - Filter by date range (start date, end date)
  - Search by description or user NIK
  - Server-side pagination with meta information
- **Record History**: View complete change history for any record via ViewHistoryButton component
- **Audit Detail Dialog**: Modal showing full audit log details including old/new value comparison
- **Sensitive Data Protection**: Automatic sanitization of passwords, tokens, and other sensitive fields
- **Permission-based Access**: `audit:log:read` permission required to view audit logs
- **Soft Delete Pattern**: Data recovery and compliance through soft delete
- **Async Logging**: Audit logs are created asynchronously to not block the response

## User Experience Goals

### Accessibility
- Mobile-responsive PWA for field access without app store installation
- Offline capability for areas with limited connectivity
- Fast loading times even on slower connections

### Usability
- Intuitive dashboard with clear module navigation
- Consistent UI patterns across all modules
- Fast search and filtering capabilities
- Clear visual feedback for all actions (success, error, loading states)
- Permission-based navigation - users only see what they can access

### Efficiency
- Minimal clicks to complete common tasks
- Bulk operations where applicable
- Smart defaults to reduce data entry
- Quick access to frequently used features

### Reliability
- Data validation at both frontend and backend
- Graceful error handling with user-friendly messages
- Automatic retry for failed operations
- Data synchronization when coming back online
- Automatic token refresh prevents session interruption