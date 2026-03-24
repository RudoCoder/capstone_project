# apps/yara_engine/models.py

from django.db import models
from apps.analysis.models import AnalysisResult


class YaraRule(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    rule_text = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class YaraMatch(models.Model):
    analysis = models.ForeignKey(
        AnalysisResult,
        on_delete=models.CASCADE,
        related_name="yara_matches"
    )
    rule = models.ForeignKey(YaraRule, on_delete=models.CASCADE)
    matched_string = models.CharField(max_length=255, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.analysis.id} → {self.rule.name}"
