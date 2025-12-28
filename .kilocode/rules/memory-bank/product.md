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