from celery import shared_task
import logging

from apps.analysis.models import AnalysisResult
from apps.uploads.utils import extract_iocs
from apps.analysis.utils import calculate_risk

logger = logging.getLogger(__name__)

@shared_task(bind=True)
def process_file(self, upload_id, analysis_id):
    try:
        analysis = AnalysisResult.objects.get(id=analysis_id)
        analysis.status = "processing"
        analysis.save()

        file_path = analysis.upload.file.path

        with open(file_path, "r", errors="ignore") as f:
            content = f.read()

        # IOC Extraction
        iocs = extract_iocs(content)

        # (Optional) You can save IOCs later when IOC module is fully ready

        # Risk Calculation
        calculate_risk(analysis)

        analysis.status = "completed"
        analysis.save()

        logger.info(f"Analysis completed for {analysis_id}")

    except Exception as e:
        logger.error(f"Error processing file {analysis_id}: {str(e)}")

        analysis.status = "failed"
        analysis.save()
