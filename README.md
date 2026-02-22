# Talos HVAC Hiring Platform

An AI-powered hiring platform for HVAC companies. Recruiters post jobs, candidates apply publicly, and resumes are scored automatically by Claude AI.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js 20, Express |
| Database | PostgreSQL (AWS RDS) / SQLite (local dev) |
| Frontend | React 18, TypeScript |
| AI | Anthropic Claude (resume analysis) |
| Auth | JWT + Google OAuth |
| Hosting | AWS Elastic Beanstalk (backend), S3 + CloudFront (frontend) |
| Domain | gotalos.io |

---

## Project Structure

```
talos-website/
├── backend-node/               # Node.js/Express API server
│   ├── config/
│   │   ├── database.js         # SQLite adapter (local dev)
│   │   └── database-pg.js      # PostgreSQL adapter (production)
│   ├── database/
│   │   ├── schema-jobs-talent-pool.sql
│   │   └── migrations/
│   │       └── run-all-migrations.js
│   ├── routes/
│   │   ├── authRoutes.js       # Register/login (JWT)
│   │   ├── googleAuthRoutes.js # Google OAuth
│   │   ├── jobRoutes.js        # Job CRUD + manual candidate add
│   │   ├── resumeRoutes.js     # Resume upload + batch analysis
│   │   ├── candidatePipelineRoutes.js  # Talent pool management
│   │   └── applyRoutes.js      # Public job application (no auth)
│   ├── services/
│   │   ├── databaseService.js  # All DB queries
│   │   ├── resumeAnalyzer.js   # Claude AI integration
│   │   ├── scoringService.js   # Tier/star rating logic
│   │   ├── logger.js           # Structured logging
│   │   └── auditService.js     # Audit trail logging
│   ├── server.js               # Express app entry point
│   └── .env.example            # Required environment variables (see below)
└── frontend/                   # React TypeScript app
    ├── src/
    │   ├── App.tsx
    │   └── components/
    │       ├── JobsManagement.tsx
    │       ├── AddJobForm.tsx
    │       ├── PublicApply.tsx
    │       └── ContactRejectionModal.tsx
    └── public/
```

---

## Local Development Setup

### Prerequisites

- Node.js 20+
- npm

No local PostgreSQL needed — the backend uses SQLite automatically in dev mode.

### Backend

```bash
cd backend-node
npm install
cp .env.example .env
# Fill in JWT_SECRET and ANTHROPIC_API_KEY in .env
npm run dev
```

Backend runs at `http://localhost:8080`.

### Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs at `http://localhost:3000`. API calls go to `http://localhost:8080` in dev.

---

## Environment Variables

All required variables are documented in `backend-node/.env.example`.

**Required in all environments:**
- `JWT_SECRET` — Secret key for signing JWTs (use a long random string)
- `ANTHROPIC_API_KEY` — API key for Claude resume analysis

**Required in production only:**
- `DB_HOST` / `DB_PASSWORD` (or AWS RDS equivalents)

See `.env.example` for the full list with descriptions.

---

## API Endpoints

All authenticated routes require `Authorization: Bearer <token>`.

### Auth — `/api/auth`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create recruiter account |
| POST | `/api/auth/login` | No | Login, returns JWT |
| POST | `/api/auth/google/callback` | No | Google OAuth login |
| GET | `/api/auth/google/url` | No | Get Google OAuth URL |
| GET | `/api/auth/google/status` | Yes | Check auth status |

### Jobs — `/api/jobs`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/jobs` | Yes | List all jobs |
| GET | `/api/jobs/:id` | Yes | Get job details |
| POST | `/api/jobs` | Yes | Create job |
| PUT | `/api/jobs/:id` | Yes | Update job |
| DELETE | `/api/jobs/:id` | Yes | Soft-delete job |
| POST | `/api/jobs/:id/candidates/:candidateId` | Yes | Manually add candidate to pipeline |

### Resumes — `/api/resume`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/resume/upload` | Yes | Upload + AI-analyze single resume |
| POST | `/api/resume/upload-batch` | Yes | Upload + AI-analyze up to 10 resumes |

### Talent Pool / Pipeline — `/api/pipeline`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/pipeline/talent-pool` | Yes | List candidates with filters |
| GET | `/api/pipeline/talent-pool/stats` | Yes | Dashboard stats |
| PUT | `/api/pipeline/:id/status` | Yes | Update candidate status |
| POST | `/api/pipeline/bulk-update` | Yes | Bulk status update |
| POST | `/api/pipeline/:id/message` | Yes | Send SMS/email to candidate |
| POST | `/api/pipeline/bulk-message` | Yes | Bulk message candidates |
| POST | `/api/pipeline/:id/reject` | Yes | Reject with templated message |
| GET | `/api/pipeline/:id/communications` | Yes | Communication history |
| PUT | `/api/pipeline/:id/contact-status` | Yes | Update contact status |
| GET | `/api/pipeline/candidate/:candidateId/job-matches` | Yes | Job matches for candidate |

### Public Apply — `/api/apply`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/apply` | No | Submit job application (public-facing) |

### System
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | No | Health check — pings DB, returns status |

---

## Candidate Pipeline Status Machine

Candidate statuses follow strict allowed transitions:

```
new → approved, backup, rejected
approved → contacted, backup, rejected
contacted → approved, backup, rejected
backup → contacted, approved, rejected
rejected → (terminal)
```

---

## AWS Deployment

**Backend** is deployed to AWS Elastic Beanstalk (`Talos-backend-prod` environment) running Node.js 20 on Amazon Linux 2023. The app listens on port 8080 (required by EB's Nginx proxy).

**Database** is AWS RDS PostgreSQL. Schema is managed by `database/migrations/run-all-migrations.js`.

**Frontend** is built with `npm run build` and served from S3 behind CloudFront.

To deploy the backend:
```bash
cd backend-node
# Zip and upload via AWS EB console or CLI
# See Documents/Talos/AWS-DEPLOYMENT-SUMMARY.txt for detailed steps
```

To deploy the frontend:
```bash
cd frontend
npm run build
# Upload build/ to the S3 bucket
```

---

## Key Design Decisions

- **Dual DB support**: `USE_POSTGRES=false` uses SQLite for zero-config local dev; production always uses PostgreSQL.
- **AI scoring**: Resumes are parsed and scored 0–100 by Claude. Scores map to tiers (green ≥ 80, yellow ≥ 50, red < 50) and 1–5 star ratings.
- **Audit log**: All status changes, job updates, and deletes are written to `audit_log` for compliance.
- **Port 8080**: Hardcoded to match AWS Elastic Beanstalk's Nginx proxy expectation.
