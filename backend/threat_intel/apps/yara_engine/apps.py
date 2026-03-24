# apps/yara_engine/apps.py

from django.apps import AppConfig


class YaraEngineConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.yara_engine"
    verbose_name = "YARA Detection Engine"
