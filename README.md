# Bebang Sistem Informasi (BIS)

Enterprise application for PT Prima Sarana Gemilang - Site Taliabu. This system integrates 4 main modules: HR, Inventory, Mess, and Building management.

## 🏗️ Architecture

This project uses a **Modular Monolith** architecture with clear separation between:
- **Backend**: NestJS REST API with TypeORM
- **Frontend**: Next.js 14+ with App Router and Shadcn UI
- **Database**: PostgreSQL 15
- **Containerization**: Docker & Docker Compose

## 📋 Prerequisites

- Node.js 18+ 
- npm 9+
- Docker & Docker Compose
- Git

## 🚀 Quick Start

### Option 1: Using Docker (Recommended)

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd bebang-bis-v1
   ```

2. Start all services:
   ```bash
   docker-compose up -d
   ```

3. Access the applications:
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000/api/v1
   - Swagger Docs: http://localhost:3000/api/docs

### Option 2: Local Development

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd bebang-bis-v1
   ```

2. Start PostgreSQL (using Docker):
   ```bash
   docker-compose up -d postgres
   ```

3. Setup Backend:
   ```bash
   cd backend
   cp .env.example .env
   npm install
   npm run start:dev
   ```

4. Setup Frontend (in a new terminal):
   ```bash
   cd frontend
   cp .env.example .env.local
   npm install
   npm run dev
   ```

5. Access the applications:
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000/api/v1
   - Swagger Docs: http://localhost:3000/api/docs

## 🔐 Default Credentials

For development/testing purposes:
- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Important**: Change these credentials in production!

## 📁 Project Structure

```
bebang-bis-v1/
├── backend/                 # NestJS Backend API
│   ├── src/
│   │   ├── common/         # Shared utilities, filters, interceptors
│   │   ├── config/         # Configuration files
│   │   └── modules/        # Feature modules
│   │       ├── auth/       # Authentication module
│   │       ├── hr/         # HR module (placeholder)
│   │       ├── inventory/  # Inventory module (placeholder)
│   │       ├── mess/       # Mess module (placeholder)
│   │       └── building/   # Building module (placeholder)
│   ├── Dockerfile
│   └── package.json
├── frontend/               # Next.js Frontend
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # React components
│   │   └── lib/           # Utilities, hooks, stores
│   ├── public/            # Static assets
│   ├── Dockerfile
│   └── package.json
├── docker/                 # Docker configurations
├── Planning/              # Project planning documents
├── docker-compose.yml     # Docker Compose configuration
└── README.md              # This file
```

## 🛠️ Tech Stack

### Backend
- **Framework**: NestJS 10
- **Language**: TypeScript
- **ORM**: TypeORM
- **Database**: PostgreSQL 15
- **Authentication**: JWT with Passport.js
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: Shadcn UI
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **PWA**: next-pwa

## 📝 API Documentation

API documentation is available via Swagger UI at:
- Development: http://localhost:3000/api/docs

### API Response Format

All API responses follow a consistent envelope format:

**Success Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": { ... },
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message",
  "error_code": "ERROR_CODE",
  "errors": {
    "field": ["error message"]
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/v1/endpoint"
}
```

## 🔧 Environment Variables

### Backend (.env)
| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment mode | development |
| PORT | Server port | 3000 |
| DATABASE_HOST | PostgreSQL host | localhost |
| DATABASE_PORT | PostgreSQL port | 5432 |
| DATABASE_USER | Database username | root |
| DATABASE_PASSWORD | Database password | 123456789 |
| DATABASE_NAME | Database name | bebang_db |
| JWT_SECRET | JWT signing secret | - |
| JWT_EXPIRATION | Token expiration (seconds) | 3600 |

### Frontend (.env.local)
| Variable | Description | Default |
|----------|-------------|---------|
| NEXT_PUBLIC_API_BASE_URL | Backend API URL | http://localhost:3000/api/v1 |
| NEXT_PUBLIC_APP_NAME | Application name | Bebang Sistem Informasi |

## 📜 Available Scripts

### Backend
```bash
npm run start:dev    # Start development server with hot-reload
npm run start:prod   # Start production server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run test         # Run tests
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d postgres
docker-compose up -d backend
docker-compose up -d frontend

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop all services
docker-compose down

# Rebuild containers
docker-compose up -d --build
```

## 📄 License

This project is proprietary software for PT Prima Sarana Gemilang.

## 👥 Contributors

- Development Team - PT Prima Sarana Gemilang
