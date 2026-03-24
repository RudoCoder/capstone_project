# apps/yara_engine/admin.py

from django.contrib import admin
from .models import YaraRule, YaraMatch


@admin.register(YaraRule)
class YaraRuleAdmin(admin.ModelAdmin):
    list_display = ("name", "created_at")
    search_fields = ("name",)


@admin.register(YaraMatch)
class YaraMatchAdmin(admin.ModelAdmin):
    list_display = ("analysis", "rule", "created_at")
    list_filter = ("rule",)
