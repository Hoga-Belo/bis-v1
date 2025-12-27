import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Initial Schema Migration
 *
 * This migration sets up the initial database schema for Bebang BIS.
 *
 * For development: Use TypeORM's synchronize: true feature
 * For production: Run this migration with: npm run migration:run
 *
 * The schema includes 43 tables across these modules:
 * - Master Data: provinces, cities, blood_types, religions, education_levels, relationship_types
 * - User Access: roles, permissions, role_permissions, users, user_roles
 * - HR Core: divisions, departments, positions, job_grades, employment_statuses, work_locations
 * - Employees: employees, attendances, employee_families, employee_educations, employee_documents, leave_requests
 * - Inventory: categories, brands, uoms, products, warehouses, stocks, stock_transactions, assets, asset_assignments
 * - Building: buildings, floors, rooms, maintenance_logs
 * - Mess: mess_sites, mess_blocks, mess_floors, mess_rooms, mess_occupancies
 * - Audit: audit_logs
 */
export class InitialSchema1703635200000 implements MigrationInterface {
  name = 'InitialSchema1703635200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable uuid-ossp extension
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // Create enum types
    await this.createEnumTypes(queryRunner);

    // Create all tables
    await this.createMasterDataTables(queryRunner);
    await this.createUserAccessTables(queryRunner);
    await this.createHRCoreTables(queryRunner);
    await this.createEmployeesTable(queryRunner);
    await this.createHRExtendedTables(queryRunner);
    await this.createInventoryTables(queryRunner);
    await this.createBuildingTables(queryRunner);
    await this.createMessTables(queryRunner);
    await this.createAuditTable(queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop partial unique indexes for mess_occupancies
    await queryRunner.query('DROP INDEX IF EXISTS "idx_mess_occupancies_employee_active"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_mess_occupancies_room_active"');

    // Drop all tables in reverse order
    const tables = [
      'audit_logs',
      'mess_occupancies',
      'mess_rooms',
      'mess_floors',
      'mess_blocks',
      'mess_sites',
      'maintenance_logs',
      'rooms',
      'floors',
      'buildings',
      'asset_assignments',
      'assets',
      'stock_transactions',
      'stocks',
      'warehouses',
      'products',
      'uoms',
      'brands',
      'categories',
      'leave_requests',
      'employee_documents',
      'employee_educations',
      'employee_families',
      'attendances',
      'employees',
      'work_locations',
      'employment_statuses',
      'job_grades',
      'positions',
      'departments',
      'divisions',
      'user_roles',
      'users',
      'role_permissions',
      'permissions',
      'roles',
      'cities',
      'relationship_types',
      'education_levels',
      'religions',
      'blood_types',
      'provinces',
    ];

    for (const table of tables) {
      await queryRunner.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
    }

    // Drop enum types
    const enums = [
      'audit_action_enum',
      'occupancy_status_enum',
      'mess_room_status_enum',
      'mess_room_type_enum',
      'maintenance_status_enum',
      'maintenance_priority_enum',
      'maintenance_type_enum',
      'room_status_enum',
      'room_type_enum',
      'assignment_type_enum',
      'location_type_enum',
      'asset_condition_enum',
      'asset_status_enum',
      'transaction_type_enum',
      'category_type_enum',
      'leave_status_enum',
      'leave_type_enum',
      'document_type_enum',
      'clock_in_method_enum',
      'attendance_status_enum',
      'employee_status_enum',
      'marital_status_enum',
      'gender_enum',
    ];

    for (const enumType of enums) {
      await queryRunner.query(`DROP TYPE IF EXISTS "${enumType}"`);
    }
  }

  private async createEnumTypes(qr: QueryRunner): Promise<void> {
    const enums = [
      "CREATE TYPE gender_enum AS ENUM ('L', 'P')",
      "CREATE TYPE marital_status_enum AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED')",
      "CREATE TYPE employee_status_enum AS ENUM ('ACTIVE', 'ON_LEAVE', 'RESIGNED', 'TERMINATED')",
      "CREATE TYPE attendance_status_enum AS ENUM ('PRESENT', 'LATE', 'ABSENT', 'LEAVE', 'SICK', 'PERMIT')",
      "CREATE TYPE clock_in_method_enum AS ENUM ('QR', 'MANUAL', 'LOCATION')",
      "CREATE TYPE document_type_enum AS ENUM ('KTP', 'KK', 'IJAZAH', 'SERTIFIKAT', 'KONTRAK', 'SK', 'OTHER')",
      "CREATE TYPE leave_type_enum AS ENUM ('ANNUAL', 'SICK', 'MATERNITY', 'PATERNITY', 'UNPAID', 'PERMIT')",
      "CREATE TYPE leave_status_enum AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')",
      "CREATE TYPE category_type_enum AS ENUM ('FIXED', 'CONSUMABLE')",
      "CREATE TYPE transaction_type_enum AS ENUM ('INBOUND', 'OUTBOUND', 'ADJUSTMENT', 'TRANSFER')",
      "CREATE TYPE asset_status_enum AS ENUM ('NEW', 'AVAILABLE', 'IN_USE', 'BROKEN', 'MAINTENANCE', 'SCRAP')",
      "CREATE TYPE asset_condition_enum AS ENUM ('EXCELLENT', 'GOOD', 'FAIR', 'POOR')",
      "CREATE TYPE location_type_enum AS ENUM ('WAREHOUSE', 'EMPLOYEE', 'ROOM', 'MESS')",
      "CREATE TYPE assignment_type_enum AS ENUM ('EMPLOYEE', 'ROOM', 'MESS')",
      "CREATE TYPE room_type_enum AS ENUM ('OFFICE', 'MEETING', 'STORAGE', 'SERVER', 'TOILET', 'PANTRY', 'OTHER')",
      "CREATE TYPE room_status_enum AS ENUM ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'CLOSED')",
      "CREATE TYPE maintenance_type_enum AS ENUM ('BUILDING', 'ROOM', 'FACILITY')",
      "CREATE TYPE maintenance_priority_enum AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT')",
      "CREATE TYPE maintenance_status_enum AS ENUM ('REPORTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')",
      "CREATE TYPE mess_room_type_enum AS ENUM ('SINGLE', 'DOUBLE', 'SHARED', 'VIP')",
      "CREATE TYPE mess_room_status_enum AS ENUM ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED')",
      "CREATE TYPE occupancy_status_enum AS ENUM ('ACTIVE', 'CHECKED_OUT', 'CANCELLED')",
      "CREATE TYPE audit_action_enum AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'SOFT_DELETE', 'RESTORE', 'LOGIN', 'LOGOUT', 'EXPORT', 'IMPORT')",
    ];
    for (const sql of enums) {
      await qr.query(sql);
    }
  }

  private async createMasterDataTables(qr: QueryRunner): Promise<void> {
    await qr.query(
      'CREATE TABLE provinces (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), code varchar(2) NOT NULL UNIQUE, name varchar(100) NOT NULL, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), created_by uuid, updated_by uuid, deleted_at TIMESTAMPTZ)',
    );
    await qr.query(
      'CREATE TABLE blood_types (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), code varchar(3) NOT NULL UNIQUE, name varchar(50) NOT NULL, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), created_by uuid, updated_by uuid, deleted_at TIMESTAMPTZ)',
    );
    await qr.query(
      'CREATE TABLE religions (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), code varchar(20) NOT NULL UNIQUE, name varchar(50) NOT NULL, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), created_by uuid, updated_by uuid, deleted_at TIMESTAMPTZ)',
    );
    await qr.query(
      'CREATE TABLE education_levels (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), code varchar(10) NOT NULL UNIQUE, name varchar(50) NOT NULL, level int DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), created_by uuid, updated_by uuid, deleted_at TIMESTAMPTZ)',
    );
    await qr.query(
      'CREATE TABLE relationship_types (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), code varchar(20) NOT NULL UNIQUE, name varchar(50) NOT NULL, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), created_by uuid, updated_by uuid, deleted_at TIMESTAMPTZ)',
    );
    await qr.query(
      'CREATE TABLE cities (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), province_id uuid NOT NULL REFERENCES provinces(id), code varchar(4) NOT NULL, name varchar(100) NOT NULL, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), created_by uuid, updated_by uuid, deleted_at TIMESTAMPTZ)',
    );
  }

  private async createUserAccessTables(qr: QueryRunner): Promise<void> {
    await qr.query(
      'CREATE TABLE roles (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), code varchar(50) NOT NULL UNIQUE, name varchar(100) NOT NULL, description text, is_system boolean DEFAULT false, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), created_by uuid, updated_by uuid, deleted_at TIMESTAMPTZ)',
    );
    await qr.query(
      'CREATE TABLE permissions (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), module varchar(50) NOT NULL, feature varchar(50) NOT NULL, action varchar(20) NOT NULL, field varchar(50), code varchar(100) NOT NULL UNIQUE, description text, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), created_by uuid, updated_by uuid, deleted_at TIMESTAMPTZ)',
    );
    await qr.query('CREATE INDEX idx_permissions_mfa ON permissions (module, feature, action)');
    await qr.query(
      'CREATE TABLE role_permissions (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE, permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), created_by uuid, updated_by uuid, deleted_at TIMESTAMPTZ, UNIQUE(role_id, permission_id))',
    );
    await qr.query(
      'CREATE TABLE users (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), nik varchar(20) NOT NULL UNIQUE, password_hash varchar(255) NOT NULL, is_first_login boolean DEFAULT true, is_active boolean DEFAULT true, last_login_at TIMESTAMPTZ, employee_id uuid, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), created_by uuid, updated_by uuid, deleted_at TIMESTAMPTZ)',
    );
    await qr.query('CREATE INDEX idx_users_nik ON users (nik)');
    await qr.query(
      'CREATE TABLE user_roles (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE, assigned_at TIMESTAMPTZ DEFAULT now(), assigned_by uuid, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), created_by uuid, updated_by uuid, deleted_at TIMESTAMPTZ, UNIQUE(user_id, role_id))',
    );
  }

  private async createHRCoreTables(qr: QueryRunner): Promise<void> {
    await qr.query(
      'CREATE TABLE divisions (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), code varchar(20) NOT NULL UNIQUE, name varchar(100) NOT NULL, description text, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), created_by uuid, updated_by uuid, deleted_at TIMESTAMPTZ)',
    );
    await qr.query(
      'CREATE TABLE departments (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), division_id uuid NOT NULL REFERENCES divisions(id), code varchar(20) NOT NULL UNIQUE, name varchar(100) NOT NULL, manager_id uuid, description text, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), created_by uuid, updated_by uuid, deleted_at TIMESTAMPTZ)',
    );
    await qr.query(
      'CREATE TABLE positions (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), code varchar(20) NOT NULL UNIQUE, name varchar(100) NOT NULL, level int DEFAULT 1, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), created_by uuid, updated_by uuid, deleted_at TIMESTAMPTZ)',
    );
    await qr.query(
      'CREATE TABLE job_grades (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), code varchar(10) NOT NULL UNIQUE, name varchar(50) NOT NULL, min_salary decimal(15,2), max_salary decimal(15,2), created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), created_by uuid, updated_by uuid, deleted_at TIMESTAMPTZ)',
    );
    await qr.query(
      'CREATE TABLE employment_statuses (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), code varchar(20) NOT NULL UNIQUE, name varchar(100) NOT NULL, description text, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), created_by uuid, updated_by uuid, deleted_at TIMESTAMPTZ)',
    );
    await qr.query(
      'CREATE TABLE work_locations (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), code varchar(20) NOT NULL UNIQUE, name varchar(100) NOT NULL, address text, city_id uuid REFERENCES cities(id), created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), created_by uuid, updated_by uuid, deleted_at TIMESTAMPTZ)',
    );
  }

  private async createEmployeesTable(qr: QueryRunner): Promise<void> {
    await qr.query(
      "CREATE TABLE employees (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), nik varchar(20) NOT NULL UNIQUE, full_name varchar(200) NOT NULL, nickname varchar(100), id_card_number varchar(16) NOT NULL UNIQUE, birth_place varchar(100) NOT NULL, birth_date date NOT NULL, gender gender_enum NOT NULL, blood_type_id uuid REFERENCES blood_types(id), religion_id uuid REFERENCES religions(id), marital_status marital_status_enum DEFAULT 'SINGLE', phone_number varchar(20), email varchar(100), photo_url varchar(255), address text, city_id uuid REFERENCES cities(id), postal_code varchar(10), current_address text, current_city_id uuid REFERENCES cities(id), division_id uuid REFERENCES divisions(id), department_id uuid REFERENCES departments(id), position_id uuid REFERENCES positions(id), job_grade_id uuid REFERENCES job_grades(id), employment_status_id uuid REFERENCES employment_statuses(id), work_location_id uuid REFERENCES work_locations(id), manager_id uuid, join_date date, permanent_date date, contract_start_date date, contract_end_date date, resign_date date, resign_reason text, employee_status employee_status_enum DEFAULT 'ACTIVE', basic_salary decimal(15,2), bank_name varchar(100), bank_account_number varchar(50), bank_account_holder varchar(200), tax_number varchar(30), bpjs_kesehatan varchar(30), bpjs_ketenagakerjaan varchar(30), annual_leave_balance int DEFAULT 12, sick_leave_balance int DEFAULT 12, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), created_by uuid, updated_by uuid, deleted_at TIMESTAMPTZ)",
    );
    await qr.query('CREATE INDEX idx_employees_nik ON employees (nik)');
    await qr.query('CREATE INDEX idx_employees_idc ON employees (id_card_number)');
    await qr.query('ALTER TABLE employees ADD FOREIGN KEY (manager_id) REFERENCES employees(id)');
    await qr.query('ALTER TABLE departments ADD FOREIGN KEY (manager_id) REFERENCES employees(id)');
    await qr.query('ALTER TABLE users ADD FOREIGN KEY (employee_id) REFERENCES employees(id)');
  }

  private async createHRExtendedTables(qr: QueryRunner): Promise<void> {
    await qr.query(
      "CREATE TABLE attendances (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE, attendance_date date NOT NULL, clock_in_time TIMESTAMPTZ, clock_in_location jsonb, clock_in_method clock_in_method_enum, clock_out_time TIMESTAMPTZ, clock_out_location jsonb, work_hours decimal(4,2), status attendance_status_enum DEFAULT 'PRESENT', notes text, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), created_by uuid, updated_by uuid, deleted_at TIMESTAMPTZ, UNIQUE(employee_id, attendance_date))",
    );
    await qr.query('CREATE INDEX idx_attendances_date ON attendances (attendance_date)');
    await qr.query(
      'CREATE TABLE employee_families (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE, relationship_type_id uuid NOT NULL REFERENCES relationship_types(id), full_name varchar(200) NOT NULL, birth_date date, gender gender_enum, education_level_id uuid REFERENCES education_levels(id), occupation varchar(100), is_emergency_contact boolean DEFAULT false, phone_number varchar(20), created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), created_by uuid, updated_by uuid, deleted_at TIMESTAMPTZ)',
    );
    await qr.query(
      'CREATE TABLE employee_educations (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE, education_level_id uuid NOT NULL REFERENCES education_levels(id), institution_name varchar(200) NOT NULL, major varchar(100), start_year int NOT NULL, end_year int, gpa decimal(3,2), certificate_number varchar(100), certificate_url varchar(255), created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), created_by uuid, updated_by uuid, deleted_at TIMESTAMPTZ)',
    );
    await qr.query(
      'CREATE TABLE employee_documents (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE, document_type document_type_enum NOT NULL, document_name varchar(200) NOT NULL, file_url varchar(255) NOT NULL, file_size int NOT NULL, uploaded_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), created_by uuid, updated_by uuid, deleted_at TIMESTAMPTZ)',
    );
    await qr.query(
      "CREATE TABLE leave_requests (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE, leave_type leave_type_enum NOT NULL, start_date date NOT NULL, end_date date NOT NULL, total_days int NOT NULL, reason text NOT NULL, attachment_url varchar(255), status leave_status_enum DEFAULT 'PENDING', approver_id uuid REFERENCES employees(id), approved_at TIMESTAMPTZ, approval_notes text, delegate_approver_id uuid REFERENCES employees(id), created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), created_by uuid, updated_by uuid, deleted_at TIMESTAMPTZ)",
    );
  }

  private async createInventoryTables(qr: QueryRunner): Promise<void> {
    await qr.query(
      'CREATE TABLE categories (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), code varchar(20) NOT NULL UNIQUE, name varchar(100) NOT NULL, type category_type_enum NOT NULL, description text, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), created_by uuid, updated_by uuid, deleted_at TIMESTAMPTZ)',
    );
    await qr.query(
      'CREATE TABLE brands (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), code varchar(20) NOT NULL UNIQUE, name varchar(100) NOT NULL, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), created_by uuid, updated_by uuid, deleted_at TIMESTAMPTZ)',
    );
    await qr.query(
      'CREATE TABLE uoms (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), code varchar(10) NOT NULL UNIQUE, name varchar(50) NOT NULL, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), created_by uuid, updated_by uuid, deleted_at TIMESTAMPTZ)',
    );
    await qr.query(
      'CREATE TABLE products (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), sku varchar(50) NOT NULL UNIQUE, name varchar(200) NOT NULL, category_id uuid NOT NULL REFERENCES categories(id), brand_id uuid REFERENCES brands(id), uom_id uuid NOT NULL REFERENCES uoms(id), description text, specifications jsonb, is_asset boolean DEFAULT false, min_stock int DEFAULT 0, photo_url varchar(255), created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), created_by uuid, updated_by uuid, deleted_at TIMESTAMPTZ)',
    );
    await qr.query('CREATE INDEX idx_products_sku ON products (sku)');
    await qr.query(
      'CREATE TABLE warehouses (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), code varchar(20) NOT NULL UNIQUE, name varchar(100) NOT NULL, work_location_id uuid REFERENCES work_locations(id), address text, pic_employee_id uuid REFERENCES employees(id), created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), created_by uuid, updated_by uuid, deleted_at TIMESTAMPTZ)',
    );
    await qr.query(
      'CREATE TABLE stocks (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE, warehouse_id uuid NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE, quantity int DEFAULT 0, last_stock_opname_date date, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), created_by uuid, updated_by uuid, deleted_at TIMESTAMPTZ, UNIQUE(product_id, warehouse_id))',
    );
    await qr.query(
      'CREATE TABLE stock_transactions (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), transaction_number varchar(50) NOT NULL UNIQUE, transaction_type transaction_type_enum NOT NULL, transaction_date date NOT NULL, product_id uuid NOT NULL REFERENCES products(id), warehouse_id uuid NOT NULL REFERENCES warehouses(id), quantity int NOT NULL, from_warehouse_id uuid REFERENCES warehouses(id), to_warehouse_id uuid REFERENCES warehouses(id), reference_number varchar(100), notes text, approved_by uuid REFERENCES employees(id), created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), created_by uuid, updated_by uuid, deleted_at TIMESTAMPTZ)',
    );
    await qr.query('CREATE INDEX idx_stock_tx_num ON stock_transactions (transaction_number)');
    await qr.query(
      "CREATE TABLE assets (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), asset_code varchar(50) NOT NULL UNIQUE, product_id uuid NOT NULL REFERENCES products(id), serial_number varchar(100), purchase_date date, purchase_price decimal(15,2), warranty_end_date date, qr_code varchar(255) NOT NULL UNIQUE, status asset_status_enum DEFAULT 'NEW', condition asset_condition_enum DEFAULT 'EXCELLENT', current_location_type location_type_enum, current_location_id uuid, notes text, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), created_by uuid, updated_by uuid, deleted_at TIMESTAMPTZ)",
    );
    await qr.query('CREATE INDEX idx_assets_code ON assets (asset_code)');
    await qr.query('CREATE INDEX idx_assets_serial ON assets (serial_number)');
    await qr.query(
      'CREATE TABLE asset_assignments (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), asset_id uuid NOT NULL REFERENCES assets(id) ON DELETE CASCADE, assignment_type assignment_type_enum NOT NULL, assigned_to_id uuid NOT NULL, assigned_date date NOT NULL, return_date date, handover_document_url varchar(255), condition_on_handover asset_condition_enum NOT NULL, condition_on_return asset_condition_enum, notes text, is_active boolean DEFAULT true, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), created_by uuid, updated_by uuid, deleted_at TIMESTAMPTZ)',
    );
  }

  private async createBuildingTables(qr: QueryRunner): Promise<void> {
    await qr.query(
      'CREATE TABLE buildings (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), code varchar(20) NOT NULL UNIQUE, name varchar(100) NOT NULL, work_location_id uuid REFERENCES work_locations(id), address text, total_floors int DEFAULT 1, pic_employee_id uuid REFERENCES employees(id), description text, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), created_by uuid, updated_by uuid, deleted_at TIMESTAMPTZ)',
    );
    await qr.query(
      'CREATE TABLE floors (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), building_id uuid NOT NULL REFERENCES buildings(id) ON DELETE CASCADE, floor_number int NOT NULL, floor_name varchar(50) NOT NULL, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), created_by uuid, updated_by uuid, deleted_at TIMESTAMPTZ, UNIQUE(building_id, floor_number))',
    );
    await qr.query(
      "CREATE TABLE rooms (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), floor_id uuid NOT NULL REFERENCES floors(id) ON DELETE CASCADE, room_number varchar(20) NOT NULL, room_name varchar(100) NOT NULL, room_type room_type_enum DEFAULT 'OFFICE', capacity int, area_sqm decimal(8,2), pic_employee_id uuid REFERENCES employees(id), status room_status_enum DEFAULT 'AVAILABLE', facilities jsonb, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), created_by uuid, updated_by uuid, deleted_at TIMESTAMPTZ)",
    );
    await qr.query(
      "CREATE TABLE maintenance_logs (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), maintenance_type maintenance_type_enum NOT NULL, reference_id uuid NOT NULL, issue_description text NOT NULL, reported_by uuid NOT NULL REFERENCES employees(id), reported_date date NOT NULL, priority maintenance_priority_enum DEFAULT 'MEDIUM', status maintenance_status_enum DEFAULT 'REPORTED', assigned_to uuid REFERENCES employees(id), completion_date date, completion_notes text, cost decimal(15,2), created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), created_by uuid, updated_by uuid, deleted_at TIMESTAMPTZ)",
    );
  }

  private async createMessTables(qr: QueryRunner): Promise<void> {
    await qr.query(
      'CREATE TABLE mess_sites (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), code varchar(20) NOT NULL UNIQUE, name varchar(100) NOT NULL, work_location_id uuid REFERENCES work_locations(id), address text, pic_employee_id uuid REFERENCES employees(id), description text, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), created_by uuid, updated_by uuid, deleted_at TIMESTAMPTZ)',
    );
    await qr.query(
      'CREATE TABLE mess_blocks (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), mess_site_id uuid NOT NULL REFERENCES mess_sites(id) ON DELETE CASCADE, block_code varchar(20) NOT NULL, block_name varchar(100) NOT NULL, total_floors int DEFAULT 1, description text, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), created_by uuid, updated_by uuid, deleted_at TIMESTAMPTZ, UNIQUE(mess_site_id, block_code))',
    );
    await qr.query(
      'CREATE TABLE mess_floors (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), mess_block_id uuid NOT NULL REFERENCES mess_blocks(id) ON DELETE CASCADE, floor_number int NOT NULL, floor_name varchar(50) NOT NULL, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), created_by uuid, updated_by uuid, deleted_at TIMESTAMPTZ, UNIQUE(mess_block_id, floor_number))',
    );
    await qr.query(
      "CREATE TABLE mess_rooms (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), mess_floor_id uuid NOT NULL REFERENCES mess_floors(id) ON DELETE CASCADE, room_number varchar(20) NOT NULL, room_type mess_room_type_enum DEFAULT 'SINGLE', capacity int DEFAULT 1, status mess_room_status_enum DEFAULT 'AVAILABLE', facilities jsonb, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), created_by uuid, updated_by uuid, deleted_at TIMESTAMPTZ, UNIQUE(mess_floor_id, room_number))",
    );
    await qr.query(
      "CREATE TABLE mess_occupancies (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), mess_room_id uuid NOT NULL REFERENCES mess_rooms(id) ON DELETE CASCADE, employee_id uuid NOT NULL REFERENCES employees(id), check_in_date date NOT NULL, check_out_date date, expected_check_out_date date, status occupancy_status_enum DEFAULT 'ACTIVE', notes text, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), created_by uuid, updated_by uuid, deleted_at TIMESTAMPTZ)",
    );
    await qr.query('CREATE INDEX idx_mess_occ_room ON mess_occupancies (mess_room_id, status)');
    await qr.query('CREATE INDEX idx_mess_occ_emp ON mess_occupancies (employee_id, status)');

    // Partial unique index: one active occupancy per employee
    await qr.query(
      `CREATE UNIQUE INDEX "idx_mess_occupancies_employee_active" ON "mess_occupancies" ("employee_id") WHERE "status" = 'ACTIVE'`,
    );

    // Partial index for room active occupancies (for capacity queries)
    await qr.query(
      `CREATE INDEX "idx_mess_occupancies_room_active" ON "mess_occupancies" ("mess_room_id") WHERE "status" = 'ACTIVE'`,
    );
  }

  private async createAuditTable(qr: QueryRunner): Promise<void> {
    await qr.query(
      'CREATE TABLE audit_logs (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), table_name varchar(100) NOT NULL, record_id uuid, action audit_action_enum NOT NULL, old_value jsonb, new_value jsonb, user_id uuid REFERENCES users(id), ip_address varchar(45), user_agent text, created_at TIMESTAMPTZ DEFAULT now())',
    );
    await qr.query('CREATE INDEX idx_audit_table_record ON audit_logs (table_name, record_id)');
    await qr.query('CREATE INDEX idx_audit_user_date ON audit_logs (user_id, created_at)');
    await qr.query('CREATE INDEX idx_audit_action_date ON audit_logs (action, created_at)');
  }
}
