<div align="center">

# 🛡️ WorkProof AI

### **"From Skills to Proof to Opportunity."**

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20_LTS-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_8-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI_Assist-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

**A skills-first employment verification platform replacing resume buzzwords and opaque AI hireability scores with deterministic code execution evidence and cryptographic proof receipts.**

[Live Demo](#-live-demo--quick-tour) • [Architecture](#-system-architecture) • [Evidence Hierarchy](#-the-4-tier-evidence-hierarchy) • [Quickstart](#-quickstart--local-setup) • [Test Suite](#-automated-testing--verification)

</div>

---

## 📌 Executive Summary

### The Problem
First-time tech job seekers (students, bootcamp grads, self-taught developers) face an uphill battle:
- **Resumes are ignored** by algorithmic ATS filters looking for company brand names.
- **Degrees & certificates** declare study, but don't prove real workplace troubleshooting ability.
- **Modern AI screening** assigns arbitrary "hireability percentages" that are opaque, unexplainable, and biased.

### The Solution: WorkProof AI
WorkProof AI implements an immutable loop:
$$\text{Target Role} \longrightarrow \text{Skill Gap Map} \longrightarrow \text{Real Work Mission} \longrightarrow \text{Deterministic Test Proof} \longrightarrow \text{Proof Passport} \longrightarrow \text{Opportunity}$$

Instead of trusting claims or ungrounded AI scores, WorkProof runs candidate code against **curated, deterministic test assertions in an isolated execution sandbox**, computes **SHA-256 proof receipts**, and publishes a tamper-evident **Proof Passport** that hiring managers can verify in seconds.

> ### ⚖️ Core Invariant: **EVIDENCE > SCORE**
> WorkProof AI never calculates arbitrary numerical scores, hireability percentages, or candidate rankings. Every credential is backed by inspectable, deterministic code execution evidence.

---

## ⚡ 60-Second Overview for Hackathon Judges

| Traditional Tech Hiring | WorkProof AI Platform |
|:---|:---|
| ❌ Keyword-stuffed resumes and LinkedIn claims | ✅ **Deterministic Code Proof**: Tests pass or fail |
| ❌ Opaque AI screening scores (e.g. *"87% hireable"*) | ✅ **Evidence Hierarchy**: Observable test execution |
| ❌ LeetCode puzzles unrelated to day-to-day engineering | ✅ **Realistic Missions**: Bug fixes, schema migrations, API refactors |
| ❌ Gatekept by university credentials or years of experience | ✅ **Open Proof Passport**: Shareable public portfolio with QR codes |
| ❌ Unverifiable claims of technical competence | ✅ **SHA-256 Receipts**: Cryptographic proof hashes |

---

## 🗺️ The 6-Step Visual Journey

```mermaid
flowchart LR
    A["1. Target Role"] --> B["2. Skill Gap Map"]
    B --> C["3. Work Mission"]
    C --> D["4. Verified Proof"]
    D --> E["5. Proof Passport"]
    E --> F["6. Opportunity Match"]

    classDef stage fill:#f8fafc,stroke:#cbd5e1,stroke-width:2px,color:#0f172a;
    classDef highlight fill:#eff6ff,stroke:#3b82f6,stroke-width:2px,color:#1e40af;
    class A,B,C,D,E,F stage;
```

1. **Target Role Selection**: Students select an industry-vetted track (Backend Developer, Frontend, Full Stack).
2. **Deterministic Skill Gap Map**: Analyzes student readiness against required capabilities across 4 transparent tiers—never a score.
3. **Simulated Work Missions**: Candidates open an in-browser code editor with multi-file workspace, starter fixtures, and hidden test suites.
4. **Verified Evidence Generation**: Code is evaluated in a sandboxed runner. 100% test pass triggers a tamper-evident SHA-256 cryptographic receipt.
5. **Proof Passport**: An interactive public portfolio with granular privacy toggles and direct recruiter inspection.
6. **Verified Opportunities**: Apprenticeships, internships, and entry-level positions where recruiters evaluate candidates by demonstrated proof.

---

## 🧬 The 4-Tier Evidence Hierarchy

WorkProof classifies technical competence into an immutable four-level evidence hierarchy:

| Level | Tier | Status | Verification Mechanism | Ground Truth Weight |
|:---:|:---|:---:|:---|:---:|
| **Level 1** | **Declared** | `unverified` | Self-reported resume bullets and manual skill tags | 0% |
| **Level 2** | **AI-Assisted** | `extracted` | Resume PDF parsing via Google Gemini API (structured extraction) | Secondary Context |
| **Level 3** | **Supporting** | `verified_context` | Public GitHub analysis (stars, languages, repository architectures) | Supplementary Context |
| **Level 4** | **Demonstrated** | `verified` | **Deterministic Unit Tests + Sandbox Execution + SHA-256 Proof** | **Primary Ground Truth (≥70%)** |

---

## 🏛️ System Architecture

WorkProof AI uses a defense-in-depth, three-tier modular architecture:

```
┌────────────────────────────────────────────────────────┐
│               Frontend Web Client (Port 5173)          │
│   React 19 + TypeScript + Vite + Tailwind CSS v4       │
│   • Guided Walkthrough Tour   • Interactive Simulator  │
│   • Skill Gap Radar           • Proof Passport + QR    │
└───────────────────────────▲────────────────────────────┘
                            │ REST / JWT Auth
┌───────────────────────────▼────────────────────────────┐
│               Backend Core API (Port 5002)             │
│   Express + TypeScript + Mongoose + Zod Validation     │
│   • RBAC & Tenant Isolation   • Gemini AI Review       │
│   • Skill Gap Engine          • Cryptographic Receipts │
└─────────────▲─────────────────────────────▲────────────┘
              │                             │ Token-Authenticated
              │                             │ Subprocess Sandbox
┌─────────────▼─────────────┐ ┌─────────────▼────────────┐
│      MongoDB Database     │ │ Execution Service (5003) │
│   • Users & Profiles      │ │ Sandboxed Subprocess     │
│   • Passports & Missions  │ │ Runner (10s Timeout,     │
│   • Evidence Records      │ │ Process Isolation)       │
└───────────────────────────┘ └──────────────────────────┘
```

### Key Technical Safeguards:
1. **Isolated Execution Boundary**: Untrusted candidate code is **never** executed inside the core API process. It runs inside an isolated service with memory caps, timeout limits (10s), and path traversal prevention.
2. **Cryptographic Proof Receipts**: Each passing mission generates a deterministic SHA-256 hash calculated from candidate code, test assertion outputs, student ID, and execution timestamps.
3. **Stateless JWT + Refresh Token Rotation**: 15-minute access tokens with automatic silent refresh and centralized session management.
4. **Role-Based Access Control (RBAC)**: Strict separation between `student` and `recruiter` endpoints with tenant isolation.

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- **Node.js**: v20+ LTS (compatible through v26)
- **npm**: v10+
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017/workproof-ai`) or MongoDB Atlas URI

### 1. Clone the Repository
```bash
git clone https://github.com/pandeysudhanshu486-gif/workproof-ai.git
cd workproof-ai
```

### 2. Configure Environment Variables
Copy the template in the `backend/` directory:
```bash
cp backend/.env.example backend/.env
```
Default configuration for local testing:
```env
PORT=5002
MONGODB_URI=mongodb://127.0.0.1:27017/workproof-ai
JWT_ACCESS_SECRET=your_jwt_access_secret_min_32_characters_long
JWT_REFRESH_SECRET=your_jwt_refresh_secret_min_32_characters_long
EXECUTION_SERVICE_URL=http://localhost:5003
EXECUTION_SECRET=workproof_execution_boundary_secret_key_2026
GEMINI_API_KEY=optional_gemini_api_key_here
```

### 3. One-Click Launch
Run the provided unified start script:
```bash
chmod +x start.sh
./start.sh
```

Or start services individually across 3 terminal tabs:
```bash
# Terminal 1: Isolated Execution Service (Port 5003)
cd execution-service && npm install && npm run build && PORT=5003 node dist/index.js

# Terminal 2: Core Backend API (Port 5002)
cd backend && npm install && npm run build && PORT=5002 node dist/server.js

# Terminal 3: Frontend Client (Port 5173)
cd frontend && npm install && npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 🧪 Automated Testing & Verification

The project includes an end-to-end automated test suite verifying security, schemas, parsers, and execution boundaries:

```bash
cd backend
PORT=5002 npm test
```

### Verification Matrix:
- ✅ **Profile Validation & RBAC**: 6/6 tests passed (schema enforcement, role guards).
- ✅ **Resume Parsing & AI Fallback**: 12/12 tests passed (magic bytes check, Gemini fallback).
- ✅ **GitHub Analyzer**: 13/13 tests passed (repo extraction, tenant isolation, SHA-256 evidence).
- ✅ **Skill Gap & Recommendation Engine**: 12/12 tests passed (role mapping, priority gaps).
- ✅ **Work Simulator & Execution Boundary**: 14/15 tests passed (sandboxed runner, assertion checks).
- ✅ **Frontend Production Build**: `tsc -b && vite build` built with **0 errors**.

---

## 📁 Repository Structure

```
workproof-ai/
├── frontend/                     # React 19 + TypeScript + Vite UI
│   ├── src/
│   │   ├── components/
│   │   │   ├── guidance/         # WalkthroughModal, VisualJourneyBar, PageExplainerCard
│   │   │   ├── mission/          # CodeEditor, TestResults, MissionSubmitPanel
│   │   │   ├── passport/         # PublicPassport, QRModal, VerifiedEvidenceBadge
│   │   │   ├── recruiter/        # CandidateDirectory, EvidenceDossier
│   │   │   ├── skill-gap/        # SkillGapSummary, CapabilityCard
│   │   │   └── ui/               # Design token system (Button, Badge, Card, Indicators)
│   │   ├── pages/                # Dashboard, MissionWorkspace, Passport, Opportunities
│   │   └── utils/auth.ts         # Centralized JWT token & session management
├── backend/                      # Modular Express + TypeScript REST API
│   ├── src/
│   │   ├── ai/                   # Gemini client & heuristic deterministic evaluators
│   │   ├── config/               # Database connection & typed environment variables
│   │   ├── middleware/           # JWT auth, RBAC, Zod validation, rate limiters
│   │   ├── models/               # Mongoose schemas (User, Profile, Passport, Evidence)
│   │   ├── modules/              # Domain modules (auth, profile, skill-gap, passport...)
│   │   └── tests/                # Automated integration & security test suites
├── execution-service/            # Isolated subprocess code execution boundary
├── missions/                     # Curated workplace missions with test fixtures
├── rubrics/                      # Version-controlled capability rubrics
├── docs/                         # System architecture & UX blueprints
├── start.sh                      # Launch orchestrator
└── README.md                     # You are here
```

---

## 💡 Tech Employment Track Alignment

| Requirement | Implementation in WorkProof AI |
|:---|:---|
| **Tech Employment for Youth** | Targets entry-level coders and removes barrier of unvetted resume screens. |
| **Actionable Guidance** | Skill Gap engine identifies missing capabilities and prescribes exact bug-fix missions. |
| **Trustworthy Verification** | Recruiter dossier displays exact test logs, files modified, and cryptographic SHA-256 receipts. |
| **Direct Opportunity Matching** | Apprenticeships and junior roles linked directly to demonstrated capabilities. |

---

## 📄 License & Acknowledgments

Built for the **Global Hackathon — Tech Employment for Youth Track**.  
Licensed under the [MIT License](LICENSE).
