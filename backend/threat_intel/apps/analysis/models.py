# apps/analysis/models.py
# apps/analysis/models.py

from django.db import models
from apps.uploads.models import Upload


class AnalysisResult(models.Model):

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("completed", "Completed"),
        ("failed", "Failed"),
    ]

    THREAT_LEVELS = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
        ("critical", "Critical"),
    ]

    upload = models.ForeignKey(Upload, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    risk_score = models.FloatField(default=0)
    threat_level = models.CharField(max_length=20, choices=THREAT_LEVELS, default="low")
    summary = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Analysis {self.id} - {self.threat_level}"


class RiskScoreDetail(models.Model):
    analysis = models.ForeignKey(AnalysisResult, on_delete=models.CASCADE)
    factor = models.CharField(max_length=50)  # YARA, CVE, IOC, ML
    score = models.FloatField()
    weight = models.FloatField(default=1.0)

    def __str__(self):
        return f"{self.factor} → {self.score}"
