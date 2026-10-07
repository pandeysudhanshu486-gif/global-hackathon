# WorkProof AI

> **"From Skills to Proof to Opportunity."**
>
> Tech Employment for Youth Track • Global Hackathon

---

## What is WorkProof AI?

**WorkProof AI** is a skills-first employment platform designed to close the gap between self-reported coding claims and credible hiring signals for first-time software engineers.

Instead of relying solely on keyword resumes, generic certificates, or unverifiable AI hireability scores, WorkProof AI implements an immutable **Claim → Real Task → Actual Work → Evidence → Demonstrated Capability → Opportunity** loop.

### Core Problem
First-time tech job seekers often have theoretical knowledge, certificates, and academic projects, but lack **verifiable, workplace-style evidence** demonstrating what they can actually achieve in a production software engineering environment. Employers struggle to distinguish real capabilities from self-reported claims.

### Core Solution
WorkProof AI enables candidates to:
1. Identify role requirements and skill gaps against real industry benchmarks.
2. Complete curated workplace engineering tasks (debugging, feature builds, regression suites) in an isolated Work Simulator.
3. Submit real code evaluated through deterministic automated test suites (primary ground truth) and structured AI code reviews (secondary qualitative feedback).
4. Generate tamper-proof **Evidence Records** backed by cryptographic integrity hashes.
5. Publish a **Proof-of-Work Passport** with granular privacy controls (Public, Recruiter-only, Private) that recruiters can inspect directly.

---

## Architectural Principles

1. **Evidence Over Scores**: Verification is derived strictly from observable signals (test pass rates, code metrics, debugging results, technical explanations), never from an arbitrary AI score.
2. **Deterministic Primary Ground Truth**: ≥60–70% of evaluation weight is anchored in deterministic test execution and acceptance criteria. AI-assisted analysis is strictly capped at ≤30% and provides structured qualitative observations.
3. **Curated Missions**: Task definitions, starter fixtures, and hidden test suites are expert-designed and version-controlled. AI recommends tasks and assists feedback, but does not invent unverified grading criteria.
4. **Execution Isolation**: Untrusted candidate code is never executed directly on the main API process. An isolated execution boundary service enforces strict process, memory, CPU, timeout, and filesystem sandbox limits.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React Icons |
| **Backend** | Node.js (v20 LTS / v26), Express, TypeScript, Zod, Mongoose ODM |
| **Database** | MongoDB (Atlas or local instance) |
| **Security** | JWT (15m Access, 7d Refresh), Bcrypt (12 salt rounds), Helmet, Rate-Limiters |
| **AI Layer** | Google Gemini API (assistive document parsing, structured code review) |
| **Execution** | Isolated Execution Boundary Service (token-authenticated, sandboxed) |

---

## Workspace Structure

```
workproof-ai/
├── frontend/             # Vite + React + TypeScript web application
│   ├── src/
│   │   ├── components/   # Reusable UI library (Button, Input, Card, Badge, EvidenceLevelIndicator)
│   │   │   ├── layout/   # Navbar, Sidebar, AppShell
│   │   │   └── ui/       # Atom components
│   │   ├── pages/        # LandingPage, AuthPage, StudentDashboard
│   │   └── index.css     # Design tokens and base styles
├── backend/              # Modular Express + TypeScript REST API
│   ├── src/
│   │   ├── config/       # Typed environment variables, MongoDB connection manager
│   │   ├── middleware/   # JWT authentication, RBAC, Zod validation, rate limiting, error handling
│   │   ├── models/       # User, StudentProfile, RecruiterProfile, Passport, Rubric, Evidence, Mission
│   │   ├── modules/      # Modular domains: auth, profile, skill, mission, simulator, evaluation, passport...
│   │   └── server.ts     # Express entrypoint & graceful shutdown
├── execution-service/    # Isolated execution boundary service (runs on separate port with secret)
├── missions/             # Curated version-controlled missions (manifests, starters, tests)
├── rubrics/              # Versioned evaluation rubrics (v1.0.json)
├── docs/                 # Product specifications & UI/UX design blueprints
└── README.md
```

---

## Local Development Setup

### Prerequisites
- **Node.js**: v20+ LTS
- **npm**: v10+
- **MongoDB**: Local MongoDB daemon running on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI

### 1. Environment Variables

Create `backend/.env` (a template is provided in `backend/.env.example`):
```bash
cp backend/.env.example backend/.env
```

Key variables:
- `PORT=5000`
- `MONGODB_URI=mongodb://127.0.0.1:27017/workproof-ai`
- `JWT_ACCESS_SECRET=your_jwt_access_secret_min_32_chars_long`
- `JWT_REFRESH_SECRET=your_jwt_refresh_secret_min_32_chars_long`
- `EXECUTION_SECRET=your_internal_execution_service_shared_secret`
- `EXECUTION_SERVICE_URL=http://localhost:5001`
- `GEMINI_API_KEY=your_gemini_api_key`

### 2. Install Dependencies

```bash
# Backend
cd backend && npm install

# Execution Service
cd ../execution-service && npm install

# Frontend
cd ../frontend && npm install
```

### 3. Run the Services

Open 3 terminal sessions:

```bash
# Terminal 1: Backend Core API (Port 5000)
cd backend && npm run dev

# Terminal 2: Isolated Execution Service (Port 5001)
cd execution-service && npm run dev

# Terminal 3: Frontend Web Client (Port 5173)
cd frontend && npm run dev
```

Visit **http://localhost:5173** to view the application.

---

## Current Milestone Status

### ✅ Milestone 1: Foundation (Days 1–7) — COMPLETED
- [x] Workspace structure and directory layout
- [x] TypeScript strict mode across frontend, backend, and execution service
- [x] Design token system & reusable UI components (`Button`, `Input`, `Card`, `Badge`, `EvidenceLevelIndicator`)
- [x] Color-independent 4-dot + text status indicators
- [x] Professional Landing Page, tabbed Auth Page (Candidate / Recruiter roles), and Action-oriented Student Dashboard
- [x] Modular Express backend with Zod validation, JWT authentication, and Bcrypt hashing
- [x] MongoDB Mongoose schemas (`User`, `StudentProfile`, `RecruiterProfile`, `Passport`, `EvaluationRubric`, `EvidenceRecord`, `Mission`)
- [x] Live `/api/health` endpoint reporting server and database connectivity
- [x] Isolated Execution Service boundary interface
- [x] Versioned evaluation rubric `rubrics/v1.0.json`
- [x] Curated sample mission `missions/backend-order-total-bug/` with starter fixtures and test suites

### ⏳ What is Intentionally NOT Implemented Yet (Scheduled for Next Milestones)
- **Milestone 2 (Days 8–14)**: Full Profile CRUD, Resume PDF upload & Gemini AI parsing, GitHub public repo context analyzer, declared skill inventory editor.
- **Milestone 3 (Days 15–21)**: Role Templates catalog, automated skill gap mapping engine, mission recommendation matcher.
- **Milestone 4 (Days 22–30)**: In-browser Monaco code editor, file explorer tree, live session auto-save, technical explanation submission dialog.
- **Milestone 5 (Days 31–40)**: Multi-signal evaluation engine integration, live sandbox runner, SHA-256 evidence record generation.
- **Milestone 6 (Days 41–50)**: Proof-of-Work Passport dashboard, public slug sharing (`/proof/:slug`), recruiter search & evidence inspector.
- **Milestone 7 (Days 51–60)**: Capability-driven opportunity matching, polish, E2E demo flow.
