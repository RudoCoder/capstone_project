from celery import shared_task

from .models import Upload
from apps.ioc.models import ExtractedIOC
from apps.yara_engine.models import YaraMatch
from apps.analysis.models import AnalysisResult
from apps.cve.models import CVE

from apps.yara_engine.utils import update_yara_rules, scan_file_with_yara
from apps.cve.utils import extract_cve_from_meta
from apps.analysis.ml_model import predict_threat
from apps.analysis.feature_extractor import extract_features


@shared_task
def process_file(upload_id):
    try:
        upload = Upload.objects.get(id=upload_id)

        # -------------------------
        # YARA SCAN
        # -------------------------
        update_yara_rules()
        yara_results = scan_file_with_yara(upload.file.path)

        for match in yara_results:
            yara_obj = YaraMatch.objects.create(
                upload=upload,
                rule_name=match["rule"],
                tags=",".join(match["tags"]),
                metadata=str(match["meta"])
            )

            # -------------------------
            # CVE EXTRACTION
            # -------------------------
            cves = extract_cve_from_meta(match["meta"])

            for cve in cves:
                CVE.objects.get_or_create(cve_id=cve)

        # -------------------------
        # FETCH DATA FOR ML
        # -------------------------
        iocs = ExtractedIOC.objects.filter(upload=upload)
        yara_matches = YaraMatch.objects.filter(upload=upload)

        # -------------------------
        # FEATURE EXTRACTION
        # -------------------------
        features = extract_features(upload, iocs, yara_matches)

        # -------------------------
        # ML PREDICTION
        # -------------------------
        ml_result = predict_threat(features)

        # -------------------------
        # SAVE RESULT
        # -------------------------
        AnalysisResult.objects.update_or_create(
            upload=upload,
            defaults={
                "risk_score": ml_result["risk_score"],
                "is_malicious": bool(ml_result["prediction"]),
                "summary": "Full threat analysis complete"
            }
        )

        return "Processing completed"

    except Exception as e:
        print(f"Task error: {e}")
        return "Processing failed"
