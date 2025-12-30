# UnionHub Project Structure & Architecture

## 📁 Project Overview

UnionHub is a full-stack React + Node.js web application for managing university departments, tasks, and student profiles.

### Technology Stack:
- **Frontend:** React 18 + TypeScript + Vite + shadcn/ui
- **Backend:** Node.js + Express + MongoDB/SQLite
- **UI Library:** Radix UI + Tailwind CSS
- **Routing:** React Router v6
- **Database Adapters:** PocketBase, API (Node+SQLite), Supabase

---

## 🗂️ Directory Structure

```
UnionHub/
│
├── 📄 Configuration Files
│   ├── package.json              # Frontend dependencies
│   ├── vite.config.ts            # Vite bundler config
│   ├── tsconfig.json             # TypeScript config
│   ├── tailwind.config.ts         # Tailwind CSS config
│   ├── postcss.config.js          # PostCSS plugins
│   ├── eslint.config.js           # ESLint rules
│   ├── vercel.json                # Vercel deployment config
│   ├── components.json            # shadcn/ui components config
│   └── vite-env.d.ts              # Vite environment types
│
├── 📁 src/                       # Frontend (React + TypeScript)
│   ├── main.tsx                  # App entry point
│   ├── App.tsx                   # Root component with router
│   ├── index.css                 # Global styles
│   ├── App.css                   # App-specific styles
│   │
│   ├── 📁 pages/                 # Page components (route-level)
│   │   ├── Home.tsx              # Dashboard home page
│   │   ├── Login.tsx             # Authentication page
│   │   ├── Departments.tsx       # List all departments
│   │   ├── DepartmentMembers.tsx # Members of specific department
│   │   ├── Profile.tsx           # User profile page
│   │   ├── Admin.tsx             # Admin dashboard
│   │   ├── Events.tsx            # Events listing
│   │   ├── Coins.tsx             # Coin/reward system
│   │   ├── Evaluation.tsx        # Task evaluation
│   │   ├── News.tsx              # News/announcements
│   │   ├── Index.tsx             # Index page
│   │   └── NotFound.tsx          # 404 page
│   │
│   ├── 📁 components/            # Reusable React components
│   │   ├── AppSidebar.tsx        # Navigation sidebar
│   │   ├── TopBar.tsx            # Header/top navigation
│   │   ├── DashboardLayout.tsx   # Layout wrapper
│   │   ├── ProtectedRoute.tsx    # Route guard for auth
│   │   ├── AdminRoute.tsx        # Route guard for admin
│   │   ├── AddMemberDialog.tsx   # Modal for adding members
│   │   ├── StatCard.tsx          # Stat display card
│   │   └── 📁 ui/                # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── form.tsx
│   │       ├── input.tsx
│   │       ├── table.tsx
│   │       └── ... (40+ more UI components)
│   │
│   ├── 📁 hooks/                 # Custom React hooks
│   │   ├── useAuth.tsx           # Authentication hook
│   │   ├── useProfile.tsx        # Profile data hook
│   │   ├── use-toast.ts          # Toast notifications
│   │   └── use-mobile.tsx        # Mobile detection
│   │
│   ├── 📁 integrations/          # Backend adapters
│   │   ├── client.ts             # Main client selector
│   │   ├── api-adapter.ts        # Node.js API adapter
│   │   ├── pocketbase-adapter.ts # PocketBase adapter
│   │   └── types.ts              # TypeScript types
│   │
│   ├── 📁 lib/                   # Utility functions
│   │   ├── utils.ts              # General utilities
│   │   └── departmentMetrics.ts  # Department calculations
│   │
│   └── 📁 data/                  # Mock/seed data
│       ├── departments.ts        # Department data
│       ├── members.ts            # Member data
│       └── tasks.ts              # Task data
│
├── 📁 server/                    # Backend (Node.js + Express)
│   ├── package.json              # Server dependencies
│   ├── index.js                  # Express server entry point
│   ├── test-server.js            # Testing utilities
│   ├── db.js                     # Database utilities
│   ├── debug-login.js            # Debug script
│   ├── create-user.js            # User creation script
│   ├── data.json                 # Seed data
│   │
│   ├── 📁 lib/
│   │   └── mongodb.js            # MongoDB connection
│   │
│   ├── 📁 config/
│   │   └── database.js           # Database configuration
│   │
│   ├── 📁 models/
│   │   ├── Profile.js            # Profile data model
│   │   ├── Task.js               # Task data model
│   │   ├── Department.js         # Department data model
│   │   └── models.js             # Model exports
│   │
│   ├── 📁 services/
│   │   ├── profileService.js     # Profile business logic
│   │   ├── taskService.js        # Task business logic
│   │   └── departmentService.js  # Department business logic
│   │
│   └── 📁 scripts/
│       └── migrateToMongo.js     # Data migration script
│
├── 📁 api/                       # ⚠️ DEPRECATED - Vercel API (duplicate code)
│   ├── index.js                  # API handler
│   ├── migrate-users.cjs         # Migration script
│   ├── 📁 lib/
│   │   └── mongodb.js
│   └── 📁 models/
│       ├── Profile.js
│       ├── Task.js
│       ├── Department.js
│       └── models.js
│
├── 📁 scripts/                   # Utility scripts
│   ├── seed-pocketbase.js        # PocketBase seeding
│   ├── seed-pocketbase.cjs       # PocketBase seed (CommonJS)
│   └── sync-profiles-to-users.mjs # Profile sync script
│
├── 📁 supabase/                  # Supabase configuration
│   ├── config.toml               # Supabase config
│   └── 📁 migrations/            # Database migrations
│       ├── 20251103133237_...sql
│       └── 20251103133327_...sql
│
├── 📁 docs/                      # Documentation
│   └── POCKETBASE.md             # PocketBase setup guide
│
├── 📁 dist/                      # Build output (generated)
│
├── 📁 data/                      # Local SQLite database (optional)
│   └── unionhub.db               # SQLite database file
│
├── 📄 .env                       # Environment variables (DEV)
├── 📄 .env.example               # Example env variables
├── 📄 .env.production            # Environment variables (PROD)
├── 📄 .gitignore                 # Git ignore rules
├── 📄 .vercelignore              # Vercel ignore rules
├── 📄 index.html                 # HTML entry point
├── 📄 README.md                  # Project documentation (empty)
├── 📄 departments.csv            # Department data
├── 📄 env.txt                    # Environment reference
├── 📄 gitignore.txt              # Git rules reference
│
└── 📁 .git/                      # Git history

```

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                          │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Pages (Home, Login, Departments, Profile, Admin, etc) ││
│  │ ├── Components (AppSidebar, TopBar, Cards, etc)       ││
│  │ └── hooks (useAuth, useProfile, etc)                  ││
│  └─────────────────────────────────────────────────────────┘│
│                         ↓                                     │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              Integrations Layer                         ││
│  │  ┌──────────────┬──────────────┬──────────────────┐     ││
│  │  │ API Adapter  │ PocketBase   │ Supabase Client  │     ││
│  │  │ (Node+SQL)   │ (SQLite)     │ (Cloud)          │     ││
│  │  └──────────────┴──────────────┴──────────────────┘     ││
│  └─────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────┘
              ↓ HTTP/REST API calls
┌─────────────────────────────────────────────────────────────┐
│                  Backend Options                            │
│  ┌──────────────┐   ┌──────────────┐   ┌───────────────┐  │
│  │ Node.js API  │   │ PocketBase   │   │ Supabase      │  │
│  │ + MongoDB    │   │ (SQLite)     │   │ (PostgreSQL)  │  │
│  │ or SQLite    │   │              │   │               │  │
│  └──────────────┘   └──────────────┘   └───────────────┘  │
│         ↓                  ↓                    ↓            │
│      MongoDB Atlas    PocketBase Binary    Supabase Cloud   │
│                       Local/Docker         PostgreSQL        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow

### Authentication Flow:
```
User → Login Page
  ↓
useAuth hook → /auth/login endpoint
  ↓
JWT Token generated
  ↓
Token stored in localStorage
  ↓
API calls include "Authorization: Bearer <token>"
  ↓
Protected routes verified via ProtectedRoute/AdminRoute
```

### Data Fetching:
```
React Component
  ↓
hook (useProfile, useAuth)
  ↓
Integration Layer (API/PocketBase/Supabase)
  ↓
Backend API or Direct Database
  ↓
Response cached by React Query
  ↓
UI re-renders
```

---

## 🗄️ Database Schema

### Profiles Collection/Table
```
{
  id: string (unique ID)
  email: string (unique)
  password_hash: string (bcrypt)
  first_name: string
  last_name: string
  name: string
  department_code: number
  class_name: string
  biography: string
  avatar_url: string (URL or file path)
  coins: number (reward points)
  credibility_score: number (0-100)
  created_at: timestamp
  updated_at: timestamp
}
```

### Tasks Collection/Table
```
{
  id: string (unique ID)
  title: string
  description: string
  status: string (pending|in_progress|completed)
  coins: number (reward if completed)
  department_code: number
  deadline: timestamp
  progress: {
    current: number
    target: number
    unit: string (e.g., '%')
  }
  evaluation: {
    completed: boolean
    score: number (0-100)
    feedback: string
  }
  created_at: timestamp
  updated_at: timestamp
}
```

### Departments Collection/Table
```
{
  id: number (auto-increment)
  name: string
  emoji: string
  description: string
  members: number (count)
}
```

---

## ⚙️ Environment Variables

### Required (.env)
```
# Frontend
VITE_API_URL=http://localhost:8787
VITE_USE_POCKETBASE=0 (1 to use PocketBase)
VITE_ADMIN_EMAIL=admin@example.com

# Backend
PORT=8787
NODE_ENV=development
DATABASE_TYPE=sqlite or mongodb
DATABASE_PATH=./data/unionhub.db (for SQLite)
MONGODB_URI=... (for MongoDB)
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:8080
```

### Optional
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_POCKETBASE_URL=http://127.0.0.1:8090
```

---

## 🚀 Running the Project

### Development
```bash
# Terminal 1: Frontend
npm install
npm run dev    # http://localhost:8080

# Terminal 2: Backend
cd server
npm install
npm run dev    # http://localhost:8787
```

### Production
```bash
# Build frontend
npm run build

# Start backend
cd server
npm run prod
```

### With SQLite
```bash
# Initialize database
node server/scripts/init-sqlite.js

# Start server
npm run dev
```

---

## ⚠️ Known Issues & TODOs

1. **Duplicate API Code** - `api/` and `server/` folders have same logic
   - Fix: Delete `api/`, update Vercel config
   
2. **No Password Hashing** - Passwords stored plaintext
   - Fix: Implement bcryptjs (see SECURITY_ISSUES.md)

3. **No Input Validation** - API accepts any data
   - Fix: Add express-validator middleware

4. **Empty README.md** - No documentation
   - Fix: Add project documentation

5. **Mixed Database Support** - MongoDB URI hardcoded
   - Fix: Use environment variables + SQLite adapter

---

## 📦 Dependencies

### Frontend (package.json)
- **React:** 18.3.1
- **TypeScript:** 5.8.3
- **Vite:** 5.4.19
- **UI:** Radix UI, shadcn/ui
- **Routing:** react-router-dom 6.30.1
- **Forms:** react-hook-form, zod
- **Data:** @tanstack/react-query
- **Auth:** Supabase JS, PocketBase client
- **Styling:** Tailwind CSS 3.4.17

### Backend (server/package.json)
- **Server:** Express 4.19.2
- **Database:** mongoose 8.0.3
- **Authentication:** jsonwebtoken 9.0.2
- **Security:** bcryptjs 2.4.3
- **Utilities:** dotenv, cors, uuid

---

## 🔐 Security Notes

See SECURITY_ISSUES.md for:
- Exposed credentials (FIXED)
- Weak password handling (TODO)
- Missing input validation (TODO)

---

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Vite Guide](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Express.js API](https://expressjs.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [SQLite Tutorial](https://www.sqlite.org/cli.html)

---

## 👥 Team Info

- **Repository:** [Your GitHub URL]
- **Deployment:** Vercel (Frontend) + Custom Server (Backend)
- **Last Updated:** December 30, 2025

