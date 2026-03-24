# apps/analysis/utils.py
from apps.yara_engine.models import YaraMatch
from apps.cve.models import CVEMatch

def calculate_risk(analysis):
    yara_hits = YaraMatch.objects.filter(analysis=analysis).count()
    cve_hits = CVEMatch.objects.filter(analysis=analysis).count()

    score = (yara_hits * 30) + (cve_hits * 20)

    analysis.risk_score = score

    if score > 80:
        analysis.threat_level = "critical"
    elif score > 50:
        analysis.threat_level = "high"
    elif score > 20:
        analysis.threat_level = "medium"
    else:
        analysis.threat_level = "low"

    analysis.save()
