# Bebang BIS - Backend API

NestJS-based REST API for the Bebang Sistem Informasi application.

## 🏗️ Architecture

The backend follows a **Modular Monolith** architecture with feature-based modules:

```
src/
├── main.ts                 # Application entry point
├── app.module.ts           # Root module
├── config/                 # Configuration
│   ├── database.config.ts  # Database configuration
│   ├── jwt.config.ts       # JWT configuration
│   └── data-source.ts      # TypeORM data source
├── common/                 # Shared code
│   ├── decorators/         # Custom decorators
│   ├── dto/                # Shared DTOs
│   ├── filters/            # Exception filters
│   ├── guards/             # Auth guards
│   ├── interceptors/       # Response interceptors
│   └── interfaces/         # TypeScript interfaces
└── modules/                # Feature modules
    ├── auth/               # Authentication
    ├── access-control/     # RBAC (placeholder)
    ├── audit/              # Audit logs (placeholder)
    ├── hr/                 # HR module (placeholder)
    ├── inventory/          # Inventory (placeholder)
    ├── mess/               # Mess management (placeholder)
    └── building/           # Building management (placeholder)
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 15+

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. Start development server:
   ```bash
   npm run start:dev
   ```

## 📝 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/auth/login | User login |
| GET | /api/v1/auth/me | Get current user profile |

## 🔧 Adding a New Module

1. Create module folder in `src/modules/`:
   ```bash
   nest g module modules/your-module
   nest g controller modules/your-module
   nest g service modules/your-module
   ```

2. Create DTOs in `src/modules/your-module/dto/`

3. Create entities in `src/modules/your-module/entities/`

4. Import module in `app.module.ts`

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📚 Conventions

### Naming
- **Files**: kebab-case (e.g., `user-profile.dto.ts`)
- **Classes**: PascalCase (e.g., `UserProfileDto`)
- **Variables/Functions**: camelCase (e.g., `getUserProfile`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`)

### DTOs
- Use `class-validator` decorators for validation
- Use `@ApiProperty()` for Swagger documentation
- Suffix with `Dto` (e.g., `CreateUserDto`)

### Entities
- Use `@Entity()` decorator
- Define relations explicitly
- Use migrations for schema changes