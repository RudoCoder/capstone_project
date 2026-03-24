# apps/cve/admin.py

from django.contrib import admin
from .models import CVE, CVEMatch


@admin.register(CVE)
class CVEAdmin(admin.ModelAdmin):
    list_display = ("cve_id", "severity", "published_date")
    search_fields = ("cve_id",)
    list_filter = ("severity",)


@admin.register(CVEMatch)
class CVEMatchAdmin(admin.ModelAdmin):
    list_display = ("analysis", "cve", "created_at")
    list_filter = ("cve",)
