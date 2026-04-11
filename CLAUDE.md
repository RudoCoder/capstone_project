# CLAUDE.md — Shanduko Threat Intel Platform

Capstone project. Full-stack cybersecurity file analysis platform.
Scans uploaded files for malware IOCs, YARA rule matches, CVE references, and ML-based risk scoring.

---

## Stack

| Layer     | Technology                                  |
|-----------|---------------------------------------------|
| Frontend  | React 19 + Vite, React Router v7, Recharts, Lucide-React |
| Backend   | Django 5 + Django REST Framework            |
| Auth      | JWT via `djangorestframework-simplejwt`     |
| Queue     | Celery + Redis                              |
| ML        | Scikit-learn model (`ml/model.pkl`)         |
| YARA      | `yara-python` with GitHub-cloned rule repo  |
| WebSocket | Django Channels + `daphne`                  |
| DB        | SQLite (dev)                                |

---

## Running Locally (3 WSL terminals)

```bash
# Terminal 1 — Redis
sudo service redis-server start

# Terminal 2 — Celery
cd /mnt/c/Users/bryn/Documents/coding-vault/Personal/capstone_project/backend/threat_intel
source venv/bin/activate
celery -A threat_intel worker --loglevel=info

# Terminal 3 — Django
cd /mnt/c/Users/bryn/Documents/coding-vault/Personal/capstone_project/backend/threat_intel
source venv/bin/activate
python manage.py runserver        # API at http://127.0.0.1:8000/
```

```bash
# Frontend (separate terminal — Windows or WSL)
cd frontend
npm run dev                       # http://localhost:5173
```

First time only:
```bash
python manage.py migrate
```

---

## Project Layout

```
capstone_project/
├── CLAUDE.md                    ← this file
├── frontend/                    ← React/Vite SPA
└── backend/
    └── threat_intel/            ← Django project root
        ├── manage.py
        ├── threat_intel/        ← core config (settings, urls, celery, asgi)
        ├── ml/                  ← model.pkl, scaler.pkl, feature_config.json
        ├── yara_rules_repo/     ← auto-cloned YARA rules from GitHub
        ├── media/uploads/       ← uploaded files land here
        ├── logs/                ← threat_intel.log
        └── apps/
            ├── users/           ← auth, registration
            ├── uploads/         ← file upload + Celery task trigger
            ├── analysis/        ← AnalysisResult model, ML scoring, feature extraction
            ├── ioc/             ← IOC extraction + ExtractedIOC model
            ├── yara_engine/     ← YARA scanning, YaraRule + YaraMatch models
            ├── cve/             ← CVE matching, CVEMatch model
            ├── tutorials/       ← Tutorial model (title + link_url)
            └── feedback/        ← user feedback model
```

---

## Backend API Endpoints

| Method | Endpoint                      | App          | Notes                        |
|--------|-------------------------------|--------------|------------------------------|
| POST   | `/api/auth/login/`            | users        | Returns JWT access + refresh |
| POST   | `/api/auth/register/`         | users        | —                            |
| POST   | `/api/uploads/`               | uploads      | Triggers Celery analysis     |
| GET    | `/api/analysis/`              | analysis     | List all AnalysisResults     |
| GET    | `/api/analysis/<id>/`         | analysis     | Single result                |
| GET    | `/api/analysis/risk-trend/`   | analysis     | Chart data                   |
| GET    | `/api/ioc/?analysis=<id>`     | ioc          | IOCs for a scan              |
| GET    | `/api/yara/?analysis=<id>`    | yara_engine  | YARA matches for a scan      |
| GET    | `/api/cve/?analysis=<id>`     | cve          | CVE matches for a scan       |
| GET    | `/api/tutorials/`             | tutorials    | Tutorial list                |
| POST   | `/api/feedback/`              | feedback     | Submit feedback              |

All endpoints (except auth) require `Authorization: Bearer <token>` header.

---

## Frontend Structure

```
frontend/src/
├── main.jsx                     ← app entry, BrowserRouter here
├── App.jsx                      ← wraps AppRoutes + AuthContext
├── routes.jsx                   ← all route definitions
├── services/api.js              ← axios instance + getAnalysisResults, getTutorials
├── api/                         ← per-feature axios calls
│   ├── axios.js                 ← base axios with interceptor
│   ├── analysisService.js
│   ├── authService.js
│   ├── cveService.js
│   ├── feedbackService.js
│   ├── iocService.js
│   ├── socket.js                ← WebSocket client
│   ├── tutorialService.js
│   ├── uploadService.js
│   └── yaraService.js
├── context/AuthContext.jsx      ← JWT token + user state
├── pages/
│   ├── Dashboard.jsx            ← main dashboard (see UI section below)
│   ├── LoginPage.jsx
│   ├── UploadPage.jsx
│   ├── AnalysisPage.jsx         ← detail view: IOCList, YaraMatches, CVEList
│   └── TutorialsPage.jsx
└── components/
    ├── ProtectedRoute.jsx       ← redirects to /login if no token
    ├── Navbar.jsx
    ├── Sidebar.jsx              ← stub (Dashboard has its own inline sidebar)
    ├── AnalysisCard.jsx
    ├── RiskChart.jsx
    ├── RiskIndicator.jsx
    ├── IOCList.jsx
    ├── YaraMatches.jsx
    ├── CVEList.jsx
    ├── TutorialCard.jsx
    └── UploadForm.jsx
```

### Routes

| Path              | Component       | Protected |
|-------------------|-----------------|-----------|
| `/login`          | LoginPage       | No        |
| `/`               | Dashboard       | Yes       |
| `/dashboard`      | Dashboard       | Yes       |
| `/upload`         | UploadPage      | Yes       |
| `/analysis/:id`   | AnalysisPage    | Yes       |
| `/tutorials`      | TutorialsPage   | Yes       |

---

## UI Design System — Dashboard

The Dashboard uses `position: fixed; inset: 0` to escape the narrow `#root` container defined in `index.css` (1126px centred). All other pages sit inside the normal root flow.

### Colour Palette

| Token        | Hex          | Usage                              |
|--------------|--------------|------------------------------------|
| `bg`         | `#0a0f1e`    | Page background                    |
| `surface`    | `#111827`    | Sidebar, secondary surfaces        |
| `card`       | `#1a2235`    | Cards, chart panels, table panels  |
| `border`     | `#1f2d45`    | All borders                        |
| `accent`     | `#00c2ff`    | Cyan — primary CTA, active nav, chart line |
| `accentDim`  | `rgba(0,194,255,0.12)` | Active nav background   |
| `red`        | `#f43f5e`    | Critical risk                      |
| `orange`     | `#fb923c`    | Medium risk                        |
| `green`      | `#22d3a0`    | Clean / Completed                  |
| `purple`     | `#a78bfa`    | Extra pie chart segment            |
| `textPri`    | `#e2e8f0`    | Primary text                       |
| `textSec`    | `#64748b`    | Secondary / muted text             |
| `textMuted`  | `#334155`    | Section labels                     |

### Risk Thresholds (used everywhere — badges, bar fills, pie)

| Score range | Label    | Colour    |
|-------------|----------|-----------|
| ≥ 70        | Critical | `#f43f5e` |
| 40 – 69     | Medium   | `#fb923c` |
| < 40        | Low      | `#22d3a0` |

### Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ SIDEBAR (240px fixed)    │ MAIN CONTENT (flex: 1, scrollable)   │
│                          │                                       │
│  [Shield logo]           │  Header: title + date + New Scan btn │
│   Threat Intel           │                                       │
│                          │  [4 Stat Cards — grid 4 cols]        │
│  Dashboard  (active)     │   Total | Critical | Medium | Clean  │
│  Upload File             │                                       │
│  Tutorials               │  [Charts — grid 2fr 1fr]             │
│                          │   Area Chart (trend) | Donut (dist.) │
│  ── Insights ──          │                                       │
│  Activity Log            │  [Bottom — grid 2fr 1fr]             │
│  ML Analysis             │   Scans Table | Learning Hub         │
│                          │                                       │
│  [Avg Risk pill]         │                                       │
│  [Logout button]         │                                       │
└─────────────────────────────────────────────────────────────────┘
```

### Key Components (all inline in Dashboard.jsx)

| Component     | Description                                                         |
|---------------|---------------------------------------------------------------------|
| `StatCard`    | Icon + label + big number + sub-text. Glow orb via absolute div.   |
| `NavItem`     | Sidebar link. Active state = cyan border + dim background.          |
| `RiskBadge`   | Coloured pill with dot indicator.                                   |
| `CustomTooltip` | Recharts tooltip showing file name + date + risk score.           |

### Charts (Recharts)

- **Area Chart** — `AreaChart` + `Area` with `linearGradient` fill (`#00c2ff` → transparent). Shows last 10 scans oldest-to-newest.
- **Donut Chart** — `PieChart` + `Pie` with `innerRadius=48 outerRadius=72`. Colours: red / orange / green.
- Both use `ResponsiveContainer width="100%" height="100%"` inside a fixed-height div.

### Table (Scans)

Columns: File Name | Date | Status badge | Risk progress bar + score | Details link.

Status badge: green pill if `Completed`, orange otherwise.
Risk bar: `div` filled to `risk_score%` width, coloured by threshold.

### Learning Hub

Renders `tutorials` from `/api/tutorials/`. Each card is an `<a>` tag with hover border glow. Expects `tut.title`, `tut.link_url`, optional `tut.description`.

---

## Data Models (key fields)

### AnalysisResult
```
id, file_name, status, risk_score (0–100), threat_level, created_at
```

### IOC (ExtractedIOC)
```
analysis (FK), ioc_type, value
```

### YaraMatch
```
analysis (FK), rule_name, description
```

### CVEMatch
```
analysis (FK), cve_id, severity, description
```

### Tutorial
```
id, title, link_url, description (optional)
```

---

## Auth Flow

1. `POST /api/auth/login/` → returns `{ access, refresh }`
2. Tokens stored in `localStorage` as `access_token` / `refresh_token`
3. `services/api.js` axios interceptor attaches `Authorization: Bearer <token>` automatically
4. `ProtectedRoute` checks `localStorage` for token, redirects to `/login` if absent
5. Logout: `localStorage.clear()` → redirect to `/login`

---

## Celery Task Flow (file upload)

```
POST /api/uploads/
  → saves file to media/uploads/
  → triggers Celery task
      → SHA256 hash
      → IOC extraction (regex on file content)
      → YARA scan (yara_rules_repo/)
      → ML feature extraction → model.pkl → risk_score
      → CVE matching
      → creates AnalysisResult record
      → WebSocket push to frontend
```

---

## Notes & Gotchas

- `index.css` sets `#root { width: 1126px; margin: 0 auto; }` — Dashboard overrides this with `position: fixed; inset: 0; z-index: 999`.
- `services/api.js` and `api/axios.js` are two separate axios instances — Dashboard uses `services/api.js`.
- The Sidebar component in `components/Sidebar.jsx` is a stub; Dashboard has its own full inline sidebar.
- YARA rules are cloned from GitHub on first run — needs internet access and `git` available.
- ML model must exist at `backend/threat_intel/ml/model.pkl` before uploads will score correctly.
- Redis must be running before Celery starts.
