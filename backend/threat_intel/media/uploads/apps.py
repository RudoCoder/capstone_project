# apps/cve/apps.py

from django.apps import AppConfig


class CVEConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.cve"
    verbose_name = "CVE Intelligence"
