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

. Install dependencies
```
pip install -r requirements.txt
```
2. Run migrations
```
python manage.py makemigrations
python manage.py migrate
```

3. Start Redis
```
redis-server
```
4. Start Celery
```
celery -A threat_intel worker --loglevel=info
```
5. Start Django
```
python manage.py runserver
```
