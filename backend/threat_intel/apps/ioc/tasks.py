from celery import shared_task
from .models import IOC, ExtractedIOC
from .utils import extract_iocs  # Ensure this utility exists
from apps.analysis.models import AnalysisResult

@shared_task
def run_ioc_extraction(analysis_id, content):
    """
    Background task to extract IPs and URLs from file content
    and link them to the AnalysisResult.
    """
    try:
        # 1. Get the analysis object
        analysis = AnalysisResult.objects.get(id=analysis_id)

        # 2. Run extraction utility
        found_iocs = extract_iocs(content)

        # 3. Process IPs
        for ip in found_iocs.get("ips", []):
            ioc_obj, _ = IOC.objects.get_or_create(
                type="ip",
                value=ip,
                defaults={"source": "extracted"}
            )
            ExtractedIOC.objects.create(
                analysis=analysis,
                ioc=ioc_obj,
                confidence_score=0.8
            )

        # 4. Process URLs
        for url in found_iocs.get("urls", []):
            ioc_obj, _ = IOC.objects.get_or_create(
                type="url",
                value=url,
                defaults={"source": "extracted"}
            )
            ExtractedIOC.objects.create(
                analysis=analysis,
                ioc=ioc_obj,
                confidence_score=0.8
            )

        return f"Successfully extracted IOCs for Analysis {analysis_id}"

    except AnalysisResult.DoesNotExist:
        return f"Analysis {analysis_id} not found"
    except Exception as e:
        return f"IOC Extraction Error: {str(e)}"
