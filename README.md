# PlaceHub — Smart Campus Placement Portal

PlaceHub is a production-grade, full-stack **Campus Placement Management Platform** designed for engineering institutions. It unifies the campus hiring lifecycle across **Students**, **Training & Placement Officers (TPO)**, and **Corporate Recruiters**.

---

## 1. Core Architecture & Tech Stack

- **Frontend**:
  - React 18 with Vite & TypeScript
  - Tailwind CSS for modern responsive styling
  - shadcn/ui-inspired primitives (Button, Modal, Input, Badge, Card)
  - TanStack Query (v5) for robust server-state management
  - Recharts for institutional placement analytics
  - Lucide React for consistent icons
  - React Router v6 for role-protected navigation

- **Backend**:
  - Node.js & Express.js with TypeScript
  - RESTful architecture with structured JSON response contracts
  - JWT Authentication persisted in secure **httpOnly cookies**
  - bcrypt password hashing (12 rounds)
  - Helmet security headers, CORS origin enforcement, and express-rate-limit
  - Multer for secure file uploads with MIME/extension whitelist and size restrictions

- **Database & ORM**:
  - Prisma ORM with 20+ models (User, StudentProfile, PlacementDrive, EligibilityCriteria, Application, StatusHistory, Interview, AuditLog, CollegeSettings, etc.)
  - **Local Development**: SQLite (`prisma/dev.db`) — zero external database dependencies
  - **Production**: PostgreSQL via provided `docker-compose.yml`

- **Deterministic Eligibility Engine**:
  - Evaluates student CGPA, Class 10/12 scores, active backlogs, backlog history, branch constraints, and graduation batch against drive criteria
  - Returns structured diagnostics: boolean eligibility, exact reasons for rejection, and satisfied requirements
  - Backend validation runs on submission to guarantee integrity even if client-side checks are bypassed

---

## 2. Demo Credentials

The database comes pre-seeded with realistic demo accounts under **Apex Institute of Technology** (College Code: `AIT`):

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Placement Officer (TPO)** | `admin@placehub.dev` | `Admin@123456` | Full admin dashboard, drive lifecycle control, candidate pipeline review, interview scheduling, policy configuration, CSV exports |
| **Student 1 (Aarav - CSE)** | `student1@example.com` | `Student@123` | High CGPA (8.92), 0 backlogs. Eligible for TechCorp SDE-I & FinTech Dynamics. Applied with scheduled technical interview. |
| **Student 2 (Priya - ECE)** | `student2@example.com` | `Student@123` | CGPA 7.40, 1 backlog. Demonstrates selective eligibility (eligible for CloudScale Intern, ineligible for strict 0-backlog drives). |
| **Recruiter (TechCorp)** | `recruiter@techcorp.com` | `Recruiter@123` | Authorized access to TechCorp drives, candidate applications, stage advances, and interview invitations. |
| **Recruiter (FinTech)** | `recruiter@fintech.io` | `Recruiter@123` | Authorized access to FinTech Dynamics candidate pipeline. |

---

## 3. Quick Start (Local Setup)

### Prerequisites
- Node.js >= 18
- npm >= 9

### Step 1: Install Dependencies
```bash
# In the project root
npm install

# In server
cd server && npm install

# In client
cd ../client && npm install
cd ..
```

### Step 2: Database Initialization & Seeding
```bash
# Generate Prisma Client
cd server && npx prisma generate --schema=../prisma/schema.prisma

# Push schema to SQLite database (prisma/dev.db)
npx prisma db push --schema=../prisma/schema.prisma

# Seed realistic demo data
npx tsx ../prisma/seed.ts
cd ..
```

### Step 3: Run Development Servers
```bash
# Option A: Run both backend and frontend concurrently from root
npm run dev

# Option B: Run separately
# Terminal 1: Backend (Runs on http://localhost:3001)
cd server && npm run dev

# Terminal 2: Frontend (Runs on http://localhost:5173)
cd client && npm run dev
```

Visit **http://localhost:5173** to access the portal. You can use the **1-Click Demo Login** buttons on the landing page or login screen to immediately sign in as any role.

---

## 4. Automated Testing

The backend includes a comprehensive Vitest test suite testing authentication, authorization, deterministic eligibility checks, duplicate application prevention, deadline enforcement, and role-based access control.

```bash
# Run backend tests
cd server && npx vitest run
```

Test coverage includes:
- `auth.test.ts`: Registration, existing email 409 conflict, self-registration as PLACEMENT_OFFICER rejection (403), login credential verification, httpOnly cookie persistence, session retrieval.
- `eligibility.test.ts`: CGPA threshold checks, active backlog limits, branch restrictions, graduation year matching.
- `application.test.ts`: Eligible candidate application submission, ineligible student rejection (bypassing client), duplicate application 409 error, candidate authorization boundaries, withdrawal rules.
- `rbac.test.ts`: Role-based route protection, student prevention from accessing admin endpoints (403), officer authorization (200), unauthenticated request rejection (401).

---

## 5. Production Build

```bash
# Build backend to dist/
cd server && npm run build

# Build frontend to dist/
cd ../client && npm run build
```

---

## 6. Docker Deployment (PostgreSQL Production)

For deployment in production with PostgreSQL:
```bash
# Start PostgreSQL container
docker compose up -d

# Run Prisma migrations for PostgreSQL
DATABASE_URL="postgresql://placehub:placehub_dev_password@localhost:5432/placehub" npx prisma migrate deploy --schema=prisma/schema.prisma
```

---

## 7. API Reference Summary

- **Authentication**:
  - `POST /api/auth/register` — Register student or recruiter
  - `POST /api/auth/login` — Sign in and receive secure session cookie
  - `POST /api/auth/logout` — Terminate session and clear cookie
  - `GET /api/auth/me` — Retrieve active user session and profile

- **Student Services**:
  - `GET /api/students/me` — Fetch complete profile with skills and projects
  - `PATCH /api/students/me` — Update academic records and contact details
  - `GET /api/students/me/eligible-drives` — Query drives with dynamic eligibility calculations
  - `GET /api/students/me/applications` — Retrieve candidate applications and recruitment stages
  - `POST /api/students/me/resumes` — Upload resume PDF/DOC variant

- **Placement Drives**:
  - `GET /api/drives` — List campus drives with query filters (branch, salary, job type)
  - `GET /api/drives/:id` — Drive specifications and eligibility engine breakdown
  - `POST /api/drives` — Create new drive with eligibility rules (Officer)
  - `PATCH /api/drives/:id/status` — Advance drive state (PUBLISHED, CLOSED, ARCHIVED)
  - `POST /api/drives/:id/applications` — Submit application with selected resume

- **Recruitment Pipeline & TPO**:
  - `GET /api/admin/overview` — Institutional metrics (placed count, placement %, CTC stats)
  - `GET /api/admin/analytics` — Branch-wise rates and salary distributions
  - `GET /api/admin/reports/csv` — Stream CSV placement report download
  - `PATCH /api/applications/:id/status` — Advance candidate through recruitment stages
  - `POST /api/applications/:id/interviews` — Schedule technical/HR interview with meeting link
  - `PATCH /api/admin/settings` — Configure offer limits and multiple offer permissions
