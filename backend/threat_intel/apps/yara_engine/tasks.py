from celery import shared_task
# We use the correct name from your previous error message
from .utils import scan_file_with_yara
from apps.analysis.models import AnalysisResult

@shared_task
def process_yara_scan(analysis_id):
    """
    Background task to run YARA rule matching against an uploaded file.
    """
    try:
        # 1. Fetch the analysis object using the ID passed to the task
        analysis = AnalysisResult.objects.get(id=analysis_id)
        file_path = analysis.upload.file.path

        # 2. Run the scan using the correct utility function name
        # Note: If your util only takes file_path, remove 'analysis' from arguments
        yara_matches = scan_file_with_yara(file_path)

        # 3. Update risk score if matches are found
        if yara_matches:
            analysis.risk_score += 30
            analysis.save()

        return f"YARA Scan complete for Analysis {analysis_id}. Matches found: {len(yara_matches)}"

    except AnalysisResult.DoesNotExist:
        return f"Error: Analysis {analysis_id} not found."
    except Exception as e:
        return f"YARA Engine Error: {str(e)}"
