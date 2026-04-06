from celery import shared_task
from .utils import match_cves
# Ensure you import your AnalysisResult model to update the score
from apps.analysis.models import AnalysisResult

@shared_task
def run_cve_analysis(analysis_id, content):
    """
    This task is called by the main upload pipeline.
    It takes the analysis_id and the file content to find matches.
    """
    try:
        # 1. Fetch the existing analysis record from the database
        analysis = AnalysisResult.objects.get(id=analysis_id)

        # 2. Run your CVE matching logic
        cve_matches = match_cves(content, analysis)

        # 3. Increase risk if CVEs are found
        if cve_matches:
            analysis.risk_score += 20
            analysis.verdict = "Malicious" # Optional: auto-flag if CVEs exist
            analysis.save()

        return f"CVE Analysis complete for {analysis_id}. Matches: {len(cve_matches)}"

    except AnalysisResult.DoesNotExist:
        return f"Error: Analysis {analysis_id} not found."
