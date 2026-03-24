# apps/ioc/apps.py

from django.apps import AppConfig


class IOCConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.ioc"
    verbose_name = "Indicators of Compromise (IOC)"
