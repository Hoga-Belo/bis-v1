# Bebang BIS - Frontend

Next.js 14 frontend application for the Bebang Sistem Informasi.

## 🏗️ Architecture

The frontend uses Next.js App Router with the following structure:

```
src/
├── app/                    # App Router pages
│   ├── (auth)/            # Auth route group
│   │   └── login/         # Login page
│   ├── (dashboard)/       # Dashboard route group
│   │   ├── layout.tsx     # Dashboard layout
│   │   └── dashboard/     # Dashboard page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Root page (redirect)
├── components/            # React components
│   ├── ui/               # Shadcn UI components
│   ├── forms/            # Form components
│   ├── layouts/          # Layout components
│   └── shared/           # Shared components
├── lib/                  # Utilities
│   ├── api/              # API client & endpoints
│   ├── hooks/            # Custom hooks
│   ├── stores/           # Zustand stores
│   ├── types/            # TypeScript types
│   └── utils.ts          # Utility functions
└── public/               # Static assets
    ├── icons/            # PWA icons
    └── manifest.json     # PWA manifest
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your settings
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:3001

## 🎨 UI Components

This project uses [Shadcn UI](https://ui.shadcn.com/) for components.

### Adding New Components

```bash
npx shadcn@latest add <component-name>
```

Available components: https://ui.shadcn.com/docs/components

## 📱 PWA Support

The application is configured as a Progressive Web App:
- Installable on mobile devices
- Offline support (when configured)
- App-like experience

## 🔧 Adding New Pages

1. Create page in appropriate route group:
   ```
   src/app/(dashboard)/your-page/page.tsx
   ```

2. Add navigation item in `dashboard-layout.tsx`

3. Create any required components in `src/components/`

## 📚 Conventions

### File Naming
- **Components**: PascalCase (e.g., `LoginForm.tsx`)
- **Pages**: `page.tsx` (Next.js convention)
- **Utilities**: camelCase (e.g., `formatDate.ts`)

### Component Structure
```tsx
'use client'; // If client component

import { ... } from '...';

interface ComponentProps {
  // Props definition
}

export function Component({ ...props }: ComponentProps) {
  // Component logic
  return (
    // JSX
  );
}
```

### State Management
- Use Zustand for global state
- Use React hooks for local state
- Store definitions in `src/lib/stores/`
