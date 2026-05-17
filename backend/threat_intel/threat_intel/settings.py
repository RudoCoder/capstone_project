"""
Django settings for threat_intel project.
"""

from pathlib import Path
import os
from datetime import timedelta

# ── Base paths ────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent

# ── Security ──────────────────────────────────────────────────────────────────
SECRET_KEY = 'django-insecure-n!c8@tzlzycj=5_+%h66ne+ye_k3b%_@(ewc%8rw&-&@p0h^xc'
DEBUG      = True
ALLOWED_HOSTS = ['*']

# ── Installed apps ────────────────────────────────────────────────────────────
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'channels',
    'apps.users',
    'apps.uploads',
    'apps.analysis',
    'apps.cve',
    'apps.feedback',
    'apps.ioc',
    'apps.tutorials',
    'apps.yara_engine',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',     # must be first
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'threat_intel.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'threat_intel.wsgi.application'

# ── Database ──────────────────────────────────────────────────────────────────
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# ── Auth ──────────────────────────────────────────────────────────────────────
AUTH_USER_MODEL = 'users.CustomUser'

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ── JWT / DRF ─────────────────────────────────────────────────────────────────
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    )
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME":  timedelta(hours=2),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
}

# ── CORS ──────────────────────────────────────────────────────────────────────
CORS_ALLOW_ALL_ORIGINS = True

# ── Celery (Redis broker — only needed if using async tasks) ──────────────────
CELERY_BROKER_URL = "redis://127.0.0.1:6379/0"

# ── Django Channels ───────────────────────────────────────────────────────────
ASGI_APPLICATION = "threat_intel.asgi.application"
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer",
        # Switch to Redis when you're ready:
        # "BACKEND": "channels_redis.core.RedisChannelLayer",
        # "CONFIG":  {"hosts": [("127.0.0.1", 6379)]},
    }
}

# ── Static & Media ────────────────────────────────────────────────────────────
STATIC_URL  = 'static/'
MEDIA_URL   = '/media/'
MEDIA_ROOT  = os.path.join(BASE_DIR, 'media')

# ── Machine Learning ──────────────────────────────────────────────────────────
ML_ROOT       = os.path.join(BASE_DIR, 'ml')
ML_MODEL_PATH = os.path.join(ML_ROOT, 'model.pkl')

# ── Logging ───────────────────────────────────────────────────────────────────
LOGS_DIR = os.path.join(BASE_DIR, 'logs')
os.makedirs(LOGS_DIR, exist_ok=True)   # create logs/ if it doesn't exist

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {module} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "file": {
            "level":     "INFO",
            "class":     "logging.FileHandler",
            "filename":  os.path.join(LOGS_DIR, "threat_intel.log"),
            "formatter": "verbose",
        },
        "console": {
            "class": "logging.StreamHandler",
        },
    },
    "loggers": {
        "django": {
            "handlers":  ["file", "console"],
            "level":     "INFO",
            "propagate": True,
        },
        "apps": {
            "handlers":  ["file", "console"],
            "level":     "INFO",
            "propagate": True,
        },
    },
}

# ── Internationalisation ──────────────────────────────────────────────────────
LANGUAGE_CODE = 'en-us'
TIME_ZONE     = 'UTC'
USE_I18N      = True
USE_TZ        = True

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
