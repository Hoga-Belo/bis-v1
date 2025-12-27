import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

// Import all entities
// Master Data Entities
import { Province } from '../entities/master-data/province.entity';
import { City } from '../entities/master-data/city.entity';
import { BloodType } from '../entities/master-data/blood-type.entity';
import { Religion } from '../entities/master-data/religion.entity';
import { EducationLevel } from '../entities/master-data/education-level.entity';
import { RelationshipType } from '../entities/master-data/relationship-type.entity';

// User Access Entities
import { Role } from '../entities/user-access/role.entity';
import { Permission } from '../entities/user-access/permission.entity';
import { RolePermission } from '../entities/user-access/role-permission.entity';
import { User } from '../entities/user-access/user.entity';
import { UserRole } from '../entities/user-access/user-role.entity';

// HR Entities
import { Division } from '../entities/hr/division.entity';
import { Department } from '../entities/hr/department.entity';
import { Position } from '../entities/hr/position.entity';
import { JobGrade } from '../entities/hr/job-grade.entity';
import { EmploymentStatus } from '../entities/hr/employment-status.entity';
import { WorkLocation } from '../entities/hr/work-location.entity';
import { Employee } from '../entities/hr/employee.entity';
import { Attendance } from '../entities/hr/attendance.entity';
import { EmployeeFamily } from '../entities/hr/employee-family.entity';
import { EmployeeEducation } from '../entities/hr/employee-education.entity';
import { EmployeeDocument } from '../entities/hr/employee-document.entity';
import { LeaveRequest } from '../entities/hr/leave-request.entity';

// Inventory Entities
import { Category } from '../entities/inventory/category.entity';
import { Brand } from '../entities/inventory/brand.entity';
import { Uom } from '../entities/inventory/uom.entity';
import { Product } from '../entities/inventory/product.entity';
import { Warehouse } from '../entities/inventory/warehouse.entity';
import { Stock } from '../entities/inventory/stock.entity';
import { StockTransaction } from '../entities/inventory/stock-transaction.entity';
import { Asset } from '../entities/inventory/asset.entity';
import { AssetAssignment } from '../entities/inventory/asset-assignment.entity';

// Building Entities
import { Building } from '../entities/building/building.entity';
import { Floor } from '../entities/building/floor.entity';
import { Room } from '../entities/building/room.entity';
import { MaintenanceLog } from '../entities/building/maintenance-log.entity';

// Mess Entities
import { MessSite } from '../entities/mess/mess-site.entity';
import { MessBlock } from '../entities/mess/mess-block.entity';
import { MessFloor } from '../entities/mess/mess-floor.entity';
import { MessRoom } from '../entities/mess/mess-room.entity';
import { MessOccupancy } from '../entities/mess/mess-occupancy.entity';

// Audit Entities
import { AuditLog } from '../entities/audit/audit-log.entity';

config();

// All entities array
const entities = [
  // Master Data
  Province,
  City,
  BloodType,
  Religion,
  EducationLevel,
  RelationshipType,
  // User Access
  Role,
  Permission,
  RolePermission,
  User,
  UserRole,
  // HR
  Division,
  Department,
  Position,
  JobGrade,
  EmploymentStatus,
  WorkLocation,
  Employee,
  Attendance,
  EmployeeFamily,
  EmployeeEducation,
  EmployeeDocument,
  LeaveRequest,
  // Inventory
  Category,
  Brand,
  Uom,
  Product,
  Warehouse,
  Stock,
  StockTransaction,
  Asset,
  AssetAssignment,
  // Building
  Building,
  Floor,
  Room,
  MaintenanceLog,
  // Mess
  MessSite,
  MessBlock,
  MessFloor,
  MessRoom,
  MessOccupancy,
  // Audit
  AuditLog,
];

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || '123456789',
  database: process.env.DATABASE_NAME || 'bebang_db',
  entities,
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
};

export const AppDataSource = new DataSource(dataSourceOptions);
