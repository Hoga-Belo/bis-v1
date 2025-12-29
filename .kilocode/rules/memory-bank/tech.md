
# Technology Stack

## Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| NestJS | 10.x | Node.js framework for building scalable server-side applications |
| TypeORM | 0.3.x | Object-Relational Mapping for database operations |
| PostgreSQL | 15+ | Primary relational database |
| Passport.js | 0.7.x | Authentication middleware |
| @nestjs/jwt | 10.x | JWT token generation and validation |
| @nestjs/schedule | 4.x | Cron jobs and task scheduling |
| class-validator | 0.14.x | DTO validation decorators |
| class-transformer | 0.5.x | Object transformation and serialization |
| bcrypt | 5.x | Password hashing |
| Swagger | 7.x | API documentation generation |

## Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14+ | React framework with App Router |
| React | 18.x | UI component library |
| TypeScript | 5.x | Type-safe JavaScript |
| Shadcn UI | latest | Component library built on Radix UI |
| Tailwind CSS | 3.x | Utility-first CSS framework |
| Zustand | 4.x | Lightweight state management |
| React Hook Form | 7.x | Form handling and validation |
| Zod | 3.x | Schema validation |
| Axios | 1.x | HTTP client |
| next-pwa | 5.x | PWA support for Next.js |

## Development Tools

| Tool | Version | Purpose |
|------|---------|---------|
| Docker | latest | Containerization |
| Docker Compose | latest | Multi-container orchestration |
| ESLint | 9.x | Code linting (CommonJS flat config format) |
| Prettier | 3.x | Code formatting |
| TypeScript | 5.x | Static type checking |

## ESLint 9.x Configuration

Both backend and frontend use ESLint 9.x with the flat config format. **Important**: CommonJS format (`.js`) is used instead of ESM (`.mjs`) due to module resolution issues on Windows.

### Why CommonJS Instead of ESM?

ESM module resolution with `import.meta.dirname` and dynamic imports can cause issues on Windows environments. Using CommonJS format with `__dirname` provides better cross-platform compatibility.

### Backend ESLint Configuration
```javascript
// backend/eslint.config.js (CommonJS format)
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const prettierPlugin = require('eslint-plugin-prettier');

module.exports = [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'prettier/prettier': 'error',
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', 'eslint.config.js'],
  },
];
```

### Frontend ESLint Configuration
```javascript
// frontend/eslint.config.js (CommonJS format)
const { FlatCompat } = require('@eslint/eslintrc');
const path = require('path');

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: ['.next/**', 'out/**', 'build/**', 'next-env.d.ts'],
  },
];
```

### Linting Commands
```bash
# Backend
cd backend
npm run lint        # Run ESLint
npm run lint:fix    # Run ESLint with auto-fix

# Frontend
cd frontend
npm run lint        # Run ESLint
```

## Development Setup

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm or yarn
- Docker and Docker Compose
- PostgreSQL 15+ (or use Docker)

### Initial Setup

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd bebang-bis-v1
   ```

2. **Backend setup**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your database credentials
   npm install
   ```

3. **Frontend setup**
   ```bash
   cd frontend
   cp .env.example .env.local
   # Edit .env.local with your API URL
   npm install
   ```

4. **Database setup (Docker)**
   ```bash
   docker-compose up -d postgres
   ```

5. **Run migrations**
   ```bash
   cd backend
   npm run migration:run
   ```

6. **Seed initial data**
   ```bash
   cd backend
   npm run seed
   ```

7. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run start:dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

### Environment Variables

#### Backend (.env)
```
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=bebang_bis

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d

# App
PORT=3001
NODE_ENV=development
```

#### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Technical Constraints

### Database Requirements
- PostgreSQL 15+ required for:
  - JSONB column support with proper indexing
  - Partial unique indexes for business rules
  - UUID generation functions
  - Advanced constraint features

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- PWA features require HTTPS in production
- Service worker for offline support

### Performance Considerations
- Pagination required for lists > 100 items
- Image optimization via Next.js Image component
- Lazy loading for non-critical components
- Database indexes on frequently queried columns

## Key Dependencies

### Backend Core
```json
{
  "@nestjs/common": "^10.0.0",
  "@nestjs/core": "^10.0.0",
  "@nestjs/jwt": "^10.0.0",
  "@nestjs/passport": "^10.0.0",
  "@nestjs/schedule": "^4.0.0",
  "@nestjs/swagger": "^7.0.0",
  "@nestjs/typeorm": "^10.0.0",
  "typeorm": "^0.3.0",
  "pg": "^8.0.0",
  "passport": "^0.7.0",
  "passport-jwt": "^4.0.0",
  "bcrypt": "^5.0.0",
  "class-validator": "^0.14.0",
  "class-transformer": "^0.5.0",
  "exceljs": "^4.4.0"
}
```

### Frontend Core
```json
{
  "next": "^14.0.0",
  "react": "^18.0.0",
  "react-dom": "^18.0.0",
  "@radix-ui/react-*": "latest",
  "tailwindcss": "^3.0.0",
  "zustand": "^4.0.0",
  "react-hook-form": "^7.0.0",
  "zod": "^3.0.0",
  "@hookform/resolvers": "^3.0.0",
  "axios": "^1.0.0",
  "next-pwa": "^5.0.0"
}
```

## Tool Usage Patterns

### TypeORM Migrations
```bash
# Generate migration from entity changes
npm run migration:generate -- -n MigrationName

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

### Database Seeding
```bash
# Run all seeders
npm run seed

# Seeders run in order:
# 1. master-data.seeder.ts
# 2. user-access.seeder.ts
# 3. hr.seeder.ts
```

### API Documentation
- Swagger UI available at `http://localhost:3001/api/docs`
- Auto-generated from controller decorators
- Includes request/response schemas

### PWA Development
- Service worker generated on build
- Manifest at `/manifest.json`
- Icons in `/public/icons/`
- Offline fallback page supported

### Excel Processing

The system uses `exceljs` library for Excel file operations in the Employee Import feature.

**Template Generation** ([`excel-template.service.ts`](backend/src/modules/hr/employees/excel-template.service.ts)):
- Creates workbook with 4 sheets (READ_ME, KARYAWAN_HEAD, KELUARGA_DETAIL, PENDIDIKAN_DETAIL)
- Adds data validation dropdowns using cell references
- Pre-populates master data (departments, positions, job grades, etc.) from database
- Sets column widths and formats for usability
- Locks header rows with protection

**Import Processing** ([`excel-import.service.ts`](backend/src/modules/hr/employees/excel-import.service.ts)):
- Parses uploaded Excel files using exceljs
- Loads master data into Maps for O(1) lookup performance
- Extracts data from multiple sheets (employees, family, education)
- Links family and education records to employees via NIK (supports both new and existing employees)
- Row-by-row validation with detailed error collection (includes row number for error tracking)
- Uses TypeORM transactions for atomic inserts (all-or-nothing per valid row)
- Performs database lookup for existing employees when attaching family/education records
- Tracks separate success counts: `employeeSuccessCount`, `familySuccessCount`, `educationSuccessCount`
- Cleans up temporary files after processing

**Gender Code Mapping**:
```typescript
// Accepts multiple formats for gender input
const genderMap = {
  'L': Gender.MALE,
  'LAKI-LAKI': Gender.MALE,
  'MALE': Gender.MALE,
  'P': Gender.FEMALE,
  'PEREMPUAN': Gender.FEMALE,
  'FEMALE': Gender.FEMALE,
};
```

**Error Report Generation**:
- Creates new workbook with ERRORS sheet
- Includes columns: Row Number, NIK, Field, Error Message, Original Value
- Reports unknown employee NIK errors for family/education sheets
- Returns as downloadable buffer for user review
- Enables users to fix errors and re-import

**File Upload Configuration** ([`upload.config.ts`](backend/src/config/upload.config.ts)):
```typescript
export const excelUploadConfig = {
  storage: diskStorage({
    destination: './uploads/temp',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `import-${uniqueSuffix}${extname(file.originalname)}`);
    },
  }),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(xlsx|xls)$/)) {
      cb(new BadRequestException('Only Excel files are allowed'), false);
    }
    cb(null, true);
  },
};
```

### Geolocation API (Attendance Module)

The Attendance module uses the browser's Geolocation API to capture employee location during clock-in/out operations.

**Frontend Implementation** ([`clock-in-out-card.tsx`](frontend/src/components/hr/attendance/clock-in-out-card.tsx)):
```typescript
// Request geolocation permission and capture coordinates
const getLocation = (): Promise<{ latitude: number; longitude: number } | null> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => resolve(null), // Fallback if permission denied
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
};
```

**Backend Storage**:
- Geolocation stored as JSONB fields in Attendance entity
- Fields: `clockInLocation`, `clockOutLocation` (both contain `{ lat, lng, address? }`)
- All fields are nullable (geolocation is optional)

### Attendance Field Mapping Pattern

The Attendance module uses a field mapping pattern to transform entity fields to frontend-friendly names.

**Backend Field Mapping** ([`attendance.service.ts`](backend/src/modules/hr/attendance/attendance.service.ts)):
```typescript
// Entity fields → Frontend fields mapping
private mapAttendance(attendance: Attendance, includeEmployee = false): MappedAttendance {
  const mapped: MappedAttendance = {
    id: attendance.id,
    employeeId: attendance.employeeId,
    date: attendance.attendanceDate?.toISOString().split('T')[0] || '',  // attendanceDate → date
    clockIn: attendance.clockInTime ? attendance.clockInTime.toISOString() : null,  // clockInTime → clockIn
    clockOut: attendance.clockOutTime ? attendance.clockOutTime.toISOString() : null,  // clockOutTime → clockOut
    status: attendance.status,
    workHours: attendance.workHours,
    clockInLocation: attendance.clockInLocation,
    clockOutLocation: attendance.clockOutLocation,
    clockInMethod: attendance.clockInMethod,
    notes: attendance.notes,
    qrCode: attendance.qrCode,
  };
  
  if (includeEmployee && attendance.employee) {
    mapped.employee = attendance.employee;
  }
  
  return mapped;
}
```

**Field Mapping Summary**:
| Entity Field | Frontend Field | Format |
|--------------|----------------|--------|
| `attendanceDate` | `date` | YYYY-MM-DD string |
| `clockInTime` | `clockIn` | ISO timestamp string or null |
| `clockOutTime` | `clockOut` | ISO timestamp string or null |

**Frontend Type Definition** ([`attendance.ts`](frontend/src/lib/types/attendance.ts)):
```typescript
export interface Attendance {
  id: string;
  employeeId: string;
  date: string;           // YYYY-MM-DD format (mapped from attendanceDate)
  clockIn: string | null; // ISO timestamp (mapped from clockInTime)
  clockOut: string | null; // ISO timestamp (mapped from clockOutTime)
  status: AttendanceStatus;
  workHours: number | null;
  clockInLocation: { lat: number; lng: number; address?: string } | null;
  clockOutLocation: { lat: number; lng: number; address?: string } | null;
  clockInMethod: ClockInMethod;
  notes: string | null;
  qrCode: string | null;
  employee?: Employee;
}
```

### QR Code Clock-In Support

The Attendance module supports QR code scanning for clock-in operations.

**ClockInMethod Enum** ([`attendance.entity.ts`](backend/src/entities/hr/attendance.entity.ts)):
```typescript
export enum ClockInMethod {
  QR = 'QR',           // Clock-in via QR code scan
  MANUAL = 'MANUAL',   // Manual clock-in by HR
  LOCATION = 'LOCATION' // Clock-in with geolocation
}
```

**Clock-In DTO** ([`clock-in.dto.ts`](backend/src/modules/hr/attendance/dto/clock-in.dto.ts)):
```typescript
export class ClockInDto {
  @IsEnum(ClockInMethod)
  method: ClockInMethod;  // Required: LOCATION or QR

  @IsOptional()
  @IsNumber()
  latitude?: number;      // Optional: for LOCATION method

  @IsOptional()
  @IsNumber()
  longitude?: number;     // Optional: for LOCATION method

  @IsOptional()
  @IsString()
  qrCode?: string;        // Optional: for QR method
}
```

**QR Code Storage**:
- QR code value stored in `qrCode` field of Attendance entity
- Used for verification and audit purposes
- Frontend can display QR code for employee identification

### Late Detection Logic

The Attendance module implements late detection based on Asia/Jakarta timezone (UTC+7).

**Backend Implementation** ([`attendance.service.ts`](backend/src/modules/hr/attendance/attendance.service.ts)):
```typescript
// Late threshold: 08:00 local time (Asia/Jakarta)
const LATE_THRESHOLD_HOUR = 8;

// Check if clock-in is late
const clockInTime = new Date();
const jakartaTime = new Date(clockInTime.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
const isLate = jakartaTime.getHours() >= LATE_THRESHOLD_HOUR;
const status = isLate ? AttendanceStatus.LATE : AttendanceStatus.PRESENT;
```

**Work Hours Calculation**:
```typescript
// Calculate work hours when clocking out
const clockInTime = attendance.clockInTime;
const clockOutTime = new Date();
const diffMs = clockOutTime.getTime() - clockInTime.getTime();
const workHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100; // Round to 2 decimals
```

### Cron Jobs and Task Scheduling

The system uses `@nestjs/schedule` for automated background tasks.

**Leave Request Escalation** ([`leave-requests.service.ts`](backend/src/modules/hr/leave-requests/leave-requests.service.ts)):
```typescript
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class LeaveRequestsService {
  // Runs daily at midnight to escalate pending requests
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleEscalation(): Promise<void> {
    const escalatedCount = await this.approvalService.escalatePendingApprovals(3);
    this.logger.log(`Escalated ${escalatedCount} pending leave requests`);
  }
}
```

**Escalation Logic** ([`approval.service.ts`](backend/src/modules/hr/approval/approval.service.ts)):
```typescript
async escalatePendingApprovals(slaDays: number): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - slaDays);

  // Find pending requests older than SLA
  const pendingRequests = await this.leaveRequestRepository.find({
    where: {
      status: LeaveStatus.PENDING,
      createdAt: LessThan(cutoffDate),
      delegateApproverId: IsNull(),
    },
    relations: ['approver'],
  });

  let escalatedCount = 0;
  for (const request of pendingRequests) {
    const delegate = await this.findDelegateApprover(request.approverId);
    if (delegate) {
      request.delegateApproverId = delegate.id;
      await this.leaveRequestRepository.save(request);
      escalatedCount++;
    }
  }

  return escalatedCount;
}
```

**Module Configuration** ([`leave-requests.module.ts`](backend/src/modules/hr/leave-requests/leave-requests.module.ts)):
```typescript
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    TypeOrmModule.forFeature([LeaveRequest, Employee, Attendance]),
    ScheduleModule.forRoot(),
    ApprovalModule,
  ],
  // ...
})
export class LeaveRequestsModule {}
```

### Approval Workflow Service

The Approval module provides reusable approval workflow logic for leave requests and future approval-based features.

**Service Methods** ([`approval.service.ts`](backend/src/modules/hr/approval/approval.service.ts)):
```typescript
@Injectable()
export class ApprovalService {
  // Detect approver from employee's manager hierarchy
  async detectApprover(employeeId: string): Promise<Employee | null> {
    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId },
      relations: ['manager'],
    });
    return employee?.manager || null;
  }

  // Check if approver has overlapping approved leave
  async checkApproverAvailability(
    approverId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<boolean> {
    const overlappingLeave = await this.leaveRequestRepository.findOne({
      where: {
        employeeId: approverId,
        status: LeaveStatus.APPROVED,
        startDate: LessThanOrEqual(endDate),
        endDate: MoreThanOrEqual(startDate),
      },
    });
    return !overlappingLeave; // Available if no overlapping leave
  }

  // Get skip-level manager (approver's manager)
  async findDelegateApprover(approverId: string): Promise<Employee | null> {
    const approver = await this.employeeRepository.findOne({
      where: { id: approverId },
      relations: ['manager'],
    });
    return approver?.manager || null;
  }

  // Get effective approver with automatic delegation
  async findAvailableApprover(
    employeeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{ approver: Employee | null; isDelegate: boolean }> {
    const directApprover = await this.detectApprover(employeeId);
    if (!directApprover) {
      return { approver: null, isDelegate: false };
    }

    const isAvailable = await this.checkApproverAvailability(
      directApprover.id,
      startDate,
      endDate,
    );

    if (isAvailable) {
      return { approver: directApprover, isDelegate: false };
    }

    // Direct approver is on leave, find delegate
    const delegate = await this.findDelegateApprover(directApprover.id);
    return { approver: delegate, isDelegate: true };
  }
}
```

### Working Days Calculation

The Leave module calculates working days excluding weekends.

**Implementation** ([`leave-requests.service.ts`](backend/src/modules/hr/leave-requests/leave-requests.service.ts)):
```typescript
private calculateWorkingDays(startDate: Date, endDate: Date): number {
  let count = 0;
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    // Exclude Saturday (6) and Sunday (0)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}
```

**Usage**:
- Called when creating leave request to calculate `totalDays`
- Used for leave balance deduction
- Ensures accurate leave tracking

### Leave Balance Tracking

The system tracks annual and sick leave balances per employee per year.

**Default Allocations**:
- Annual Leave: 12 days per year
- Sick Leave: 12 days per year

**Balance Calculation** ([`leave-requests.service.ts`](backend/src/modules/hr/leave-requests/leave-requests.service.ts)):
```typescript
async getBalance(employeeId: string): Promise<LeaveBalance> {
  const year = new Date().getFullYear();
  
  // Get approved leave requests for current year
  const approvedRequests = await this.leaveRequestRepository.find({
    where: {
      employeeId,
      status: LeaveStatus.APPROVED,
      startDate: MoreThanOrEqual(new Date(`${year}-01-01`)),
      endDate: LessThanOrEqual(new Date(`${year}-12-31`)),
    },
  });

  // Calculate used days by type
  const annualUsed = approvedRequests
    .filter(r => r.leaveType === LeaveType.ANNUAL)
    .reduce((sum, r) => sum + r.totalDays, 0);
  
  const sickUsed = approvedRequests
    .filter(r => r.leaveType === LeaveType.SICK)
    .reduce((sum, r) => sum + r.totalDays, 0);

  return {
    annualLeave: { total: 12, used: annualUsed, remaining: 12 - annualUsed },
    sickLeave: { total: 12, used: sickUsed, remaining: 12 - sickUsed },
  };
}
```

### Attendance Record Auto-Creation on Leave Approval

When a leave request is approved, attendance records are automatically created for the leave period.

**Implementation** ([`leave-requests.service.ts`](backend/src/modules/hr/leave-requests/leave-requests.service.ts)):
```typescript
async approve(id: string, approverId: string, notes?: string): Promise<LeaveRequest> {
  const request = await this.findOne(id);
  
  // Update request status
  request.status = LeaveStatus.APPROVED;
  request.approvedAt = new Date();
  request.approvalNotes = notes;
  await this.leaveRequestRepository.save(request);

  // Create attendance records for leave period
  const current = new Date(request.startDate);
  while (current <= request.endDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Determine attendance status based on leave type
      let status: AttendanceStatus;
      switch (request.leaveType) {
        case LeaveType.SICK:
          status = AttendanceStatus.SICK;
          break;
        case LeaveType.PERMIT:
          status = AttendanceStatus.PERMIT;
          break;
        default:
          status = AttendanceStatus.LEAVE;
      }

      await this.attendanceRepository.save({
        employeeId: request.employeeId,
        attendanceDate: new Date(current),
        status,
        notes: `Leave request: ${request.reason}`,
      });
    }
    current.setDate(current.getDate() + 1);
  }

  return request;
}
```

### Inventory Module Technical Implementation

The Inventory module provides comprehensive stock and product management with the following technical patterns.

#### Product Photo Upload Configuration

Product photos are stored in `uploads/products/` directory with unique filenames.

**Configuration** ([`upload.config.ts`](backend/src/config/upload.config.ts)):
```typescript
export const productPhotoUploadConfig = {
  storage: diskStorage({
    destination: './uploads/products',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `product-${uniqueSuffix}${extname(file.originalname)}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
      cb(new BadRequestException('Only image files are allowed'), false);
    }
    cb(null, true);
  },
};
```

**Usage in Controller** ([`products.controller.ts`](backend/src/modules/inventory/products/products.controller.ts)):
```typescript
@Post(':id/photo')
@UseInterceptors(FileInterceptor('file', productPhotoUploadConfig))
async uploadPhoto(
  @Param('id') id: string,
  @UploadedFile() file: Express.Multer.File,
): Promise<Product> {
  return this.productsService.uploadPhoto(id, file);
}
```

#### Stock Transaction Logic

The stock transaction service handles four types of transactions with automatic stock updates.

**Transaction Number Generation** ([`stock-transactions.service.ts`](backend/src/modules/inventory/stock-transactions/stock-transactions.service.ts)):
```typescript
private async generateTransactionNumber(type: TransactionType): Promise<string> {
  const prefix = {
    [TransactionType.INBOUND]: 'IN',
    [TransactionType.OUTBOUND]: 'OUT',
    [TransactionType.ADJUSTMENT]: 'ADJ',
    [TransactionType.TRANSFER]: 'TRF',
  }[type];
  
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  
  // Get count of transactions today for sequence
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

**Inbound Transaction** - Creates or updates stock, increases quantity:
```typescript
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
  
  // Create transaction record
  const transactionNumber = await this.generateTransactionNumber(TransactionType.INBOUND);
  return this.stockTransactionRepository.save({
    transactionNumber,
    transactionType: TransactionType.INBOUND,
    productId: dto.productId,
    warehouseId: dto.warehouseId,
    quantity: dto.quantity,
    referenceNumber: dto.referenceNumber,
    notes: dto.notes,
  });
}
```

**Outbound Transaction** - Validates stock, decreases quantity:
```typescript
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
```

**Adjustment Transaction** - Sets quantity to new value:
```typescript
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
```

**Transfer Transaction** - Moves stock between warehouses:
```typescript
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

#### Warehouse-HR Integration

Warehouses can be linked to HR entities for better management and accountability.

**Entity Definition** ([`warehouse.entity.ts`](backend/src/entities/inventory/warehouse.entity.ts)):
```typescript
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

**Benefits of HR Integration**:
- **WorkLocation Link**: Associates warehouse with a physical work location from HR module
- **PIC Employee Link**: Assigns responsibility to a specific employee
- **Audit Trail**: Changes tracked with employee context
- **Reporting**: Generate reports by location or responsible person

#### Inventory Dashboard Metrics

The dashboard service calculates real-time metrics for inventory overview.

**Overview Metrics** ([`dashboard.service.ts`](backend/src/modules/inventory/dashboard/dashboard.service.ts)):
```typescript
async getOverview(): Promise<DashboardOverview> {
  const [
    totalProducts,
    totalCategories,
    totalBrands,
    totalWarehouses,
    lowStockCount,
    outOfStockCount,
  ] = await Promise.all([
    this.productRepository.count({ where: { deletedAt: IsNull() } }),
    this.categoryRepository.count({ where: { deletedAt: IsNull() } }),
    this.brandRepository.count({ where: { deletedAt: IsNull() } }),
    this.warehouseRepository.count({ where: { deletedAt: IsNull() } }),
    this.getLowStockCount(),
    this.getOutOfStockCount(),
  ]);

  return {
    totalProducts,
    totalCategories,
    totalBrands,
    totalWarehouses,
    lowStockCount,
    outOfStockCount,
  };
}
```

**Low Stock Alert Logic**:
```typescript
async getLowStockAlerts(): Promise<LowStockAlert[]> {
  const stocks = await this.stockRepository
    .createQueryBuilder('stock')
    .innerJoinAndSelect('stock.product', 'product')
    .innerJoinAndSelect('stock.warehouse', 'warehouse')
    .where('product.minimumStock > 0')
    .andWhere('stock.quantity <= product.minimumStock')
    .andWhere('product.deletedAt IS NULL')
    .getMany();

  return stocks.map(stock => {
    const percentage = (stock.quantity / stock.product.minimumStock) * 100;
    return {
      productId: stock.productId,
      productCode: stock.product.code,
      productName: stock.product.name,
      warehouseId: stock.warehouseId,
      warehouseName: stock.warehouse.name,
      currentStock: stock.quantity,
      minimumStock: stock.product.minimumStock,
      percentage,
      urgency: percentage <= 25 ? 'critical' : 'warning',
    };
  });
}
```

#### Category Type Enum

Categories are classified into two types for different handling.

**Enum Definition** ([`category.entity.ts`](backend/src/entities/inventory/category.entity.ts)):
```typescript
export enum CategoryType {
  FIXED = 'FIXED',           // Aset Tetap (Fixed Assets) - long-term assets
  CONSUMABLE = 'CONSUMABLE', // Barang Habis Pakai (Consumables) - items that are used up
}
```

**Usage**:
- **FIXED**: Equipment, vehicles, machinery - tracked as assets with depreciation
- **CONSUMABLE**: Office supplies, cleaning materials - tracked by quantity only

#### Frontend Inventory Types

**Type Definitions** ([`inventory.ts`](frontend/src/lib/types/inventory.ts)):
```typescript
export enum CategoryType {
  FIXED = 'FIXED',
  CONSUMABLE = 'CONSUMABLE',
}

export enum TransactionType {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
  ADJUSTMENT = 'ADJUSTMENT',
  TRANSFER = 'TRANSFER',
}

export interface Product {
  id: string;
  code: string;
  name: string;
  description?: string;
  categoryId: string;
  category?: Category;
  brandId?: string;
  brand?: Brand;
  uomId: string;
  uom?: Uom;
  minimumStock: number;
  photoUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StockTransaction {
  id: string;
  transactionNumber: string;
  transactionType: TransactionType;
  productId: string;
  product?: Product;
  warehouseId: string;
  warehouse?: Warehouse;
  sourceWarehouseId?: string;
  sourceWarehouse?: Warehouse;
  destinationWarehouseId?: string;
  destinationWarehouse?: Warehouse;
  quantity: number;
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
  createdBy?: string;
}
```

#### Inventory API Client

The Inventory API client uses **type-specific endpoints** for stock transactions instead of a generic `create` method. This pattern ensures proper validation and business logic is applied for each transaction type.

**API Endpoint Pattern** (Stock Transactions):
- `POST /inventory/stock-transactions/inbound` - Inbound transactions (receiving stock)
- `POST /inventory/stock-transactions/outbound` - Outbound transactions (issuing stock)
- `POST /inventory/stock-transactions/adjustment` - Adjustment transactions (correcting stock)
- `POST /inventory/stock-transactions/transfer` - Transfer transactions (moving between warehouses)
- `GET /inventory/stock-transactions/warehouse/:warehouseId` - Get transactions by warehouse

**API Endpoints** ([`inventory.ts`](frontend/src/lib/api/endpoints/inventory.ts)):
```typescript
export const inventoryApi = {
  // Categories
  categories: {
    getAll: (params?: CategoryQueryParams) =>
      client.get<PaginatedResponse<Category>>('/inventory/categories', { params }),
    getById: (id: string) =>
      client.get<Category>(`/inventory/categories/${id}`),
    create: (data: CreateCategoryDto) =>
      client.post<Category>('/inventory/categories', data),
    update: (id: string, data: UpdateCategoryDto) =>
      client.patch<Category>(`/inventory/categories/${id}`, data),
    delete: (id: string) =>
      client.delete(`/inventory/categories/${id}`),
  },
  
  // Products - includes stock breakdown endpoint
  products: {
    getAll: (params?: ProductQueryParams) =>
      client.get<PaginatedResponse<Product>>('/inventory/products', { params }),
    getById: (id: string) =>
      client.get<Product>(`/inventory/products/${id}`),
    create: (data: CreateProductDto) =>
      client.post<Product>('/inventory/products', data),
    update: (id: string, data: UpdateProductDto) =>
      client.patch<Product>(`/inventory/products/${id}`, data),
    delete: (id: string) =>
      client.delete(`/inventory/products/${id}`),
    uploadPhoto: (id: string, file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return client.post<Product>(`/inventory/products/${id}/photo`, formData);
    },
    // Returns { totalStock: number, breakdown: Stock[] }
    getStock: (id: string) =>
      client.get<ProductStockResponse>(`/inventory/products/${id}/stock`),
    getMovementHistory: (id: string, params?: MovementHistoryParams) =>
      client.get<PaginatedResponse<StockTransaction>>(`/inventory/products/${id}/movement-history`, { params }),
  },
  
  // Stock Transactions - uses type-specific endpoints
  stockTransactions: {
    getAll: (params?: StockTransactionQueryParams) =>
      client.get<PaginatedResponse<StockTransaction>>('/inventory/stock-transactions', { params }),
    getById: (id: string) =>
      client.get<StockTransaction>(`/inventory/stock-transactions/${id}`),
    // Get transactions by warehouse
    getByWarehouse: (warehouseId: string, params?: StockTransactionQueryParams) =>
      client.get<PaginatedResponse<StockTransaction>>(`/inventory/stock-transactions/warehouse/${warehouseId}`, { params }),
    // Type-specific creation endpoints (not generic create)
    createInbound: (data: CreateInboundDto) =>
      client.post<StockTransaction>('/inventory/stock-transactions/inbound', data),
    createOutbound: (data: CreateOutboundDto) =>
      client.post<StockTransaction>('/inventory/stock-transactions/outbound', data),
    createAdjustment: (data: CreateAdjustmentDto) =>
      client.post<StockTransaction>('/inventory/stock-transactions/adjustment', data),
    createTransfer: (data: CreateTransferDto) =>
      client.post<StockTransaction>('/inventory/stock-transactions/transfer', data),
  },
  
  // Dashboard
  dashboard: {
    getOverview: () =>
      client.get<DashboardOverview>('/inventory/dashboard/overview'),
    getStockSummary: () =>
      client.get<StockSummary>('/inventory/dashboard/stock-summary'),
    getRecentTransactions: (limit?: number) =>
      client.get<StockTransaction[]>('/inventory/dashboard/recent-transactions', { params: { limit } }),
    getLowStockAlerts: () =>
      client.get<LowStockAlert[]>('/inventory/dashboard/low-stock-alerts'),
  },
};
```

#### Product Stock Response Shape

The product stock endpoint returns a structured response with total stock and breakdown by warehouse:

```typescript
// GET /inventory/products/:id/stock response
interface ProductStockResponse {
  totalStock: number;      // Sum of all stock across warehouses
  breakdown: Stock[];      // Stock records per warehouse
}

// Stock record structure
interface Stock {
  id: string;
  productId: string;
  warehouseId: string;
  warehouse?: Warehouse;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}
```

**Usage**:
- `totalStock`: Quick access to total quantity across all warehouses
- `breakdown`: Detailed stock per warehouse for inventory management

#### Stock Adjustment DTO

The adjustment transaction uses `newQuantity` field which allows both increase and decrease of stock:

```typescript
// CreateAdjustmentDto
interface CreateAdjustmentDto {
  productId: string;
  warehouseId: string;
  newQuantity: number;      // Target quantity (can be higher or lower than current)
  transactionDate?: Date;   // Optional transaction date
  referenceNumber?: string;
  notes?: string;
}
```

**Adjustment Logic**:
- If `newQuantity > currentStock`: Stock increases (positive adjustment)
- If `newQuantity < currentStock`: Stock decreases (negative adjustment)
- The `adjustmentQuantity` is calculated as `newQuantity - currentStock`