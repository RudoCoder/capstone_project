# apps/analysis/admin.py

from django.contrib import admin
from .models import AnalysisResult, RiskScoreDetail


@admin.register(AnalysisResult)
class AnalysisAdmin(admin.ModelAdmin):
    list_display = ("id", "status", "risk_score", "threat_level", "created_at")
    list_filter = ("status", "threat_level")
    search_fields = ("id",)


@admin.register(RiskScoreDetail)
class RiskDetailAdmin(admin.ModelAdmin):
    list_display = ("analysis", "factor", "score", "weight")
