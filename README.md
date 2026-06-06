This is the backend file tree

```
threat_intel/
│
├── manage.py
│
├── threat_intel/                  # Core project config
│   ├── __init__.py               # Celery app import
│   ├── settings.py               # Includes JWT, Celery, Logging
│   ├── urls.py                  # Root API routing
│   ├── asgi.py
│   ├── wsgi.py
│   └── celery.py                # Celery configuration
│
├── logs/                         # Logging output directory
│   └── threat_intel.log
│
├── apps/
│
│   ├── users/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── admin.py
│
│   ├── uploads/
│   │   ├── models.py            # Upload model (file + hash)
│   │   ├── serializers.py
│   │   ├── views.py             # Upload API (triggers Celery)
│   │   ├── urls.py
│   │   ├── utils.py             # File hashing + IOC extraction
│   │   ├── tasks.py             # Celery async tasks
│   │   └── admin.py
│
│   ├── analysis/
│   │   ├── models.py            # AnalysisResult + RiskScore
│   │   ├── serializers.py
│   │   ├── views.py             # Fetch results APIs
│   │   ├── urls.py
│   │   ├── utils.py             # Risk scoring logic
│   │   └── admin.py
│
│   ├── ioc/
│   │   ├── models.py            # IOC + ExtractedIOC
│   │   ├── serializers.py
│   │   ├── views.py             # IOC retrieval APIs
│   │   ├── urls.py
│   │   └── admin.py
│
│   ├── yara_engine/
│   │   ├── models.py            # YaraRule + YaraMatch
│   │   ├── utils.py             # YARA scanning logic
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── admin.py
│
│   ├── cve/
│   │   ├── models.py            # CVE + CVEMatch
│   │   ├── utils.py             # CVE matching logic
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── admin.py
│
│   ├── tutorials/
│   │   ├── models.py            # Docs + YouTube links
│   │   ├── serializers.py
│   │   ├── views.py             # Tutorial APIs
│   │   ├── urls.py
│   │   └── admin.py
│
│   ├── feedback/
│   │   ├── models.py            # Feedback system
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── admin.py
│
├── media/                        # Uploaded files
│   └── uploads/
│
├── requirements.txt
│
└── README.md
```

UPDATED TREE FILE

```
threat_intel/
│
├── manage.py
│
├── threat_intel/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   ├── wsgi.py
│   └── celery.py
│
├── logs/
│   └── threat_intel.log
│
├── ml/                                ⭐ NEW (ML MODELS FOLDER)
│   ├── model.pkl                      ⭐ Kaggle trained model
│   ├── scaler.pkl                     ⭐ Optional
│   └── feature_config.json            ⭐ Optional
│
├── yara_rules_repo/                   ⭐ NEW (GitHub cloned repo)
│   └── ... (auto-downloaded YARA rules)
│
├── apps/
│
│   ├── users/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── admin.py
│
│   ├── uploads/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── utils.py
│   │   ├── tasks.py                  ⭐ UPDATED (ML + YARA)
│   │   └── admin.py
│
│   ├── analysis/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── utils.py
│   │   ├── ml_model.py              ⭐ NEW
│   │   ├── feature_extractor.py     ⭐ NEW
│   │   └── admin.py
│
│   ├── ioc/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── admin.py
│
│   ├── yara_engine/
│   │   ├── models.py
│   │   ├── utils.py                 ⭐ UPDATED (GitHub integration)
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── admin.py
│
│   ├── cve/
│   │   ├── models.py
│   │   ├── utils.py                 ⭐ UPDATED (CVE extraction)
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── admin.py
│
│   ├── tutorials/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── admin.py
│
│   ├── feedback/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── admin.py
│
├── media/
│   └── uploads/
│
├── requirements.txt                ⭐ UPDATED
│
└── README.md
```
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


## Clone the Repo
```
git clone https://github.com/RudoCoder/capstone_project.git

```

### Redis on Windows

Redis does not run natively on Windows. You need WSL 2.

1. Install WSL 2 — open PowerShell as Administrator and run:
   ```
   wsl --install
   ```
2. Restart your PC, then open the WSL terminal and run:
   ```bash
   sudo apt update && sudo apt install redis-server -y
   ```
3. Create a virtual environment
```
python -m venv .venv
```
4. Activate virtual environment
#### In Windows
```
source .venv/Scripts/activate
```
#### In Kali
```
source .venv/bin/activate
```


---
## Backend
1. Install dependencies (cd backend/threat_intel/)
```
pip install -r requirements.txt
```
2. Run migrations
```
python manage.py makemigrations
python manage.py migrate
```
3. Create Superuser
```
python manage.py createsuperuser
```

4. Start Redis
```
redis-server
```
5. Start Celery
```
celery -A threat_intel worker --loglevel=info
```
6. Start Django
```
python manage.py runserver
```
## Frontend

1. Install Nodejs in your PC 

https://nodejs.org/en

2. In .venv environment (cd frontend)
```
npm install

```
3. Start server
```
npm run dev
```

## Malware samples

https://github.com/rshipp/awesome-malware-analysis.git

https://bazaar.abuse.ch/

