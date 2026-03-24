
# apps/ioc/models.py

from django.db import models
from apps.analysis.models import AnalysisResult


class IOC(models.Model):

    IOC_TYPES = [
        ("ip", "IP Address"),
        ("domain", "Domain"),
        ("url", "URL"),
        ("hash", "File Hash"),
        ("email", "Email"),
    ]

    type = models.CharField(max_length=20, choices=IOC_TYPES)
    value = models.CharField(max_length=255, unique=True)

    reputation_score = models.FloatField(null=True, blank=True)
    source = models.CharField(max_length=100, blank=True)

    first_seen = models.DateTimeField(auto_now_add=True)
    last_seen = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.type}: {self.value}"


class ExtractedIOC(models.Model):
    analysis = models.ForeignKey(
        AnalysisResult,
        on_delete=models.CASCADE,
        related_name="extracted_iocs"
    )
    ioc = models.ForeignKey(
        IOC,
        on_delete=models.CASCADE,
        related_name="analysis_links"
    )
    confidence_score = models.FloatField(default=0.5)

    def __str__(self):
        return f"Analysis {self.analysis.id} → {self.ioc.value}"
