from celery import shared_task
from .utils import match_cves
from apps.analysis.models import AnalysisResult
from apps.cve.models import CVE, CVEMatch


@shared_task
def run_cve_analysis(analysis_id, file_path):
    """
    Background Celery task to run CVE matching against an uploaded file.
    Takes analysis_id and the real filesystem file_path (not raw content).
    (Not used in the synchronous dev flow — kept for future async use.)
    """
    try:
        analysis = AnalysisResult.objects.get(id=analysis_id)

        # FIX: was incorrectly called as match_cves(content, analysis)
        # Correct signature is match_cves(file_path) — one argument only.
        cve_matches = match_cves(file_path)

        for cve_data in cve_matches:
            cve_obj, _ = CVE.objects.get_or_create(
                cve_id=cve_data["cve_id"],
                defaults={
                    "description": cve_data.get("description", ""),
                    "severity":    cve_data.get("severity", 0.0),
                }
            )
            CVEMatch.objects.get_or_create(analysis=analysis, cve=cve_obj)

        if cve_matches:
            analysis.risk_score += 20
            analysis.save()

        return (
            f"CVE analysis complete for {analysis_id}. "
            f"Matches: {len(cve_matches)}"
        )

    except AnalysisResult.DoesNotExist:
        return f"Error: Analysis {analysis_id} not found."
    except Exception as e:
        return f"CVE Task Error: {str(e)}"
