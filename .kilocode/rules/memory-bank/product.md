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
- Single sign-on with NIK (Employee ID) and password
- Role-based access control with 11 predefined roles
- Granular permissions for each module and action
- Session management with JWT tokens

### Module Operations
- **HR Module**: Complete employee lifecycle management from onboarding to offboarding
- **Inventory Module**: Real-time inventory and stock tracking with transaction history
- **Mess Module**: Automated mess occupancy management with availability dashboard
- **Building Module**: Centralized maintenance request system with status tracking

### Audit & Compliance
- Complete audit logging for all data changes
- 5W1H context (Who, What, When, Where, Why, How) for each action
- Soft delete pattern for data recovery and compliance

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