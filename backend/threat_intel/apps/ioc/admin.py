# apps/ioc/admin.py

from django.contrib import admin
from .models import IOC, ExtractedIOC


@admin.register(IOC)
class IOCAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "type",
        "value",
        "reputation_score",
        "first_seen",
        "last_seen",
    )
    search_fields = ("value",)
    list_filter = ("type",)


@admin.register(ExtractedIOC)
class ExtractedIOCAdmin(admin.ModelAdmin):
    list_display = ("analysis", "ioc", "confidence_score")
    search_fields = ("ioc__value",)
