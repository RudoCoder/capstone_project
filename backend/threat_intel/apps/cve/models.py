# apps/cve/models.py

from django.db import models
from apps.analysis.models import AnalysisResult


class CVE(models.Model):
    cve_id = models.CharField(max_length=50, unique=True)
    description = models.TextField()
    severity = models.FloatField()  # CVSS score
    published_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.cve_id


class CVEMatch(models.Model):
    analysis = models.ForeignKey(
        AnalysisResult,
        on_delete=models.CASCADE,
        related_name="cve_matches"
    )
    cve = models.ForeignKey(CVE, on_delete=models.CASCADE)
    matched_text = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.analysis.id} → {self.cve.cve_id}"
