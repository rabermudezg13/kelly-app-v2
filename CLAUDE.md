# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Kelly Education Front Desk App** — internal tool for managing info sessions, new hire orientations, recruiters, and applicant tracking for Kelly Education Miami Dade. Built as a monorepo with a FastAPI backend and React frontend, deployed on Railway via GitHub push.

## Deployment

- **Deploy**: push to `main` on GitHub → Railway auto-deploys both services
- **Frontend**: hosted on Vercel or Railway, requires env var `VITE_API_URL=https://<backend>.up.railway.app/api`
- **Backend**: Railway runs `python -m uvicorn main:app --host 0.0.0.0 --port $PORT` via `backend/Procfile`
- **No manual deploy steps** — just commit and push

## Local Development

### Backend
```bash
cd kelly-app-v2/backend
source venv/bin/activate          # or: python -m venv venv && pip install -r requirements.txt
python main.py                    # runs on port 3026
```

### Frontend
```bash
cd kelly-app-v2/frontend
npm install
npm run dev                       # runs on port 3025, proxies /api → localhost:3026
npm run build                     # production build (no type-check)
npm run build:check               # production build WITH tsc type-check
```

> There are pre-existing TypeScript errors in the codebase — `npm run build` (without `:check`) is used for production.

## Architecture

### Backend (`kelly-app-v2/backend/`)

- **Framework**: FastAPI + SQLAlchemy + Uvicorn
- **Database**: SQLite in development (`kelly_app.db`), PostgreSQL in production (auto-detected via `DATABASE_URL` env var)
- **Entry point**: `main.py` — imports all models before `Base.metadata.create_all()`, runs inline SQLite migrations on startup, registers all routers under `/api/<resource>`
- **Auth**: JWT tokens via `python-jose`. Two auth levels:
  - `get_current_user` — any authenticated user
  - `get_current_admin` — role must be `"admin"`
- **Structure**:
  - `app/models/` — SQLAlchemy ORM models
  - `app/api/` — FastAPI routers (one file per resource)
  - `app/services/` — business logic (exclusion checking, recruiter assignment, user service)
  - `app/database/` — engine + `get_db()` dependency

**Adding a new API endpoint**: add to the relevant file in `app/api/`, use `Depends(get_current_user)` for auth. No need to register routes — the router is already mounted in `main.py`.

**Adding a new model/table**: create in `app/models/`, import it in `main.py` under the "Import all models" block, and `create_all` will handle it. For new columns on existing tables, add an inline migration in `main.py` (see the existing SQLite/PostgreSQL migration pattern).

### Frontend (`kelly-app-v2/frontend/`)

- **Framework**: React 18 + TypeScript + Vite + Tailwind CSS
- **Routing**: React Router v6 — all routes defined in `src/App.tsx`
- **API calls**: all in `src/services/api.ts` — single axios instance, reads `VITE_API_URL` env var, falls back to `localhost:3026/api`
- **Types**: shared interfaces in `src/types/index.ts`

**Dashboard pattern** — each role has its own dashboard page with a tab system:

| Role | Dashboard | URL |
|------|-----------|-----|
| admin | `AdminDashboard` | `/admin/dashboard` |
| frontdesk | `FrontdeskDashboard` | `/frontdesk/dashboard` |
| management | `ManagementDashboard` | `/management/dashboard` |
| talent | `TalentDashboard` | `/talent/dashboard` |
| recruiter | `RecruiterDashboard` | `/recruiter/:recruiterId/dashboard` |
| staff | `StaffDashboard` | `/staff/dashboard` |
| user | `UserDashboard` | `/user/dashboard` |

All tab-based dashboards share the same structure:
1. `type TabType = 'tab-a' | 'tab-b' | ...` union at the top
2. `useState<TabType>` for active tab
3. Tab button bar with active style `bg-<color>-600 text-white border-b-2`
4. Content block: `{activeTab === 'tab-name' && <Component />}`

**Adding a tab to all dashboards**: update `TabType`, add the button, add the content render — in all 6 dashboard files plus `AdminDashboard` (which has a different layout — add as a section, not a tab button).

### Key domain concepts

- **Info Session** — applicant walk-in registration (new-hire or reactivation, 8:30 AM or 1:30 PM slots)
- **PC List / Exclusion List** — list of people who cannot be hired; stored in `exclusion_list` table, names stored in UPPERCASE; `exclusion_service.py` handles fuzzy matching (both first+last name must appear in the record)
- **New Hire Orientation (NHO)** — separate onboarding flow after info session
- **CHR** — background check case management
- **Recruiter** — staff member assigned to process applicants; `RecruiterDashboard` is per-recruiter (uses `:recruiterId` URL param)
- **Storage** — physical item tracking with QR codes via `StorageScanPage`
- **Row Template / KSN Tool** — generates tab-separated Excel rows from configurable templates

### Environment variables

| Variable | Where | Description |
|----------|-------|-------------|
| `DATABASE_URL` | Backend | PostgreSQL URL (Railway provides automatically) |
| `SECRET_KEY` | Backend | JWT signing key |
| `VITE_API_URL` | Frontend | Full backend URL ending in `/api` |
