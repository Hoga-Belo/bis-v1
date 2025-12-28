# Bebang BIS - Business Information System

## Project Overview

Bebang BIS is an enterprise-grade Progressive Web Application (PWA) for PT Prima Sarana Gemilang (Site Taliabu), designed to streamline internal operations through integrated management of HR, Inventory, Mess (employee housing), and Building facilities.

## Main Objectives

- Centralize employee data management and HR operations
- Track inventory, assets, and stock movements
- Manage employee housing (mess) allocation and occupancy
- Monitor building facilities and maintenance schedules
- Provide role-based access control with comprehensive audit trails

## Key Features

- **HR Module**: Employee management, attendance tracking, leave requests, family/education records
- **Inventory Module**: Product catalog, stock management, asset tracking, warehouse operations
- **Mess Module**: Housing site/block/floor/room management, occupancy tracking
- **Building Module**: Facility management, room allocation, maintenance logging
- **Access Control**: Role-based permissions with 11 predefined roles
- **Audit Trail**: Complete activity logging with 5W1H context

## Technology Stack

| Layer | Technology |
|-------|------------|
| Backend | NestJS, TypeORM, PostgreSQL 15 |
| Frontend | Next.js 14+ (App Router), React, Shadcn UI, Tailwind CSS |
| Authentication | JWT with Passport.js |
| API Documentation | Swagger/OpenAPI |
| Containerization | Docker, Docker Compose |
| PWA | next-pwa with offline support |

## Database

- **43 tables** across 8 entity groups
- **23 PostgreSQL enum types** for type safety
- UUID primary keys, soft delete pattern, audit columns
- Comprehensive indexing including partial unique indexes

## Project Structure

```
bebang-bis-v1/
├── backend/          # NestJS API server
├── frontend/         # Next.js PWA client
├── docker/           # Docker configurations
└── Planning/         # Design documents
```

## Default Credentials

- **NIK**: ADMIN001
- **Password**: Admin@123