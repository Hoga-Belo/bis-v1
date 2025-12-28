# Technology Stack

## Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| NestJS | 10.x | Node.js framework for building scalable server-side applications |
| TypeORM | 0.3.x | Object-Relational Mapping for database operations |
| PostgreSQL | 15+ | Primary relational database |
| Passport.js | 0.7.x | Authentication middleware |
| @nestjs/jwt | 10.x | JWT token generation and validation |
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
  "@nestjs/swagger": "^7.0.0",
  "@nestjs/typeorm": "^10.0.0",
  "typeorm": "^0.3.0",
  "pg": "^8.0.0",
  "passport": "^0.7.0",
  "passport-jwt": "^4.0.0",
  "bcrypt": "^5.0.0",
  "class-validator": "^0.14.0",
  "class-transformer": "^0.5.0"
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