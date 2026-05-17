from celery import shared_task
from .utils import scan_file_with_yara
from apps.analysis.models import AnalysisResult
from apps.yara_engine.models import YaraRule, YaraMatch


@shared_task
def process_yara_scan(analysis_id):
    """
    Background Celery task to run YARA rule matching against an uploaded file.
    (Not used in the synchronous dev flow — kept for future async use.)
    """
    try:
        analysis  = AnalysisResult.objects.get(id=analysis_id)
        file_path = analysis.upload.file.path

        yara_matches = scan_file_with_yara(file_path)

        for match in yara_matches:
            rule_obj, _ = YaraRule.objects.get_or_create(
                name=match["rule"],
                defaults={
                    "description": str(match.get("meta", "")),
                    "rule_text": "",
                }
            )
            YaraMatch.objects.get_or_create(analysis=analysis, rule=rule_obj)

        return (
            f"YARA scan complete for Analysis {analysis_id}. "
            f"Matches: {len(yara_matches)}"
        )

    except AnalysisResult.DoesNotExist:
        return f"Error: Analysis {analysis_id} not found."
    except Exception as e:
        return f"YARA Engine Error: {str(e)}"
