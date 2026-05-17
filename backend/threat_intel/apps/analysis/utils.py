from apps.yara_engine.models import YaraMatch
from apps.cve.models import CVEMatch


def calculate_risk(analysis):
    """
    Re-calculate risk score from DB counts and save.
    Used if you want to recalculate without re-running the full pipeline.
    """
    yara_hits = YaraMatch.objects.filter(analysis=analysis).count()
    cve_hits  = CVEMatch.objects.filter(analysis=analysis).count()

    score = (yara_hits * 30) + (cve_hits * 20)
    score = min(score, 100)     # cap at 100

    analysis.risk_score = score

    if score >= 75:
        analysis.threat_level = "critical"
    elif score >= 50:
        analysis.threat_level = "high"
    elif score >= 25:
        analysis.threat_level = "medium"
    else:
        analysis.threat_level = "low"

    analysis.save()
    return score
