from celery import shared_task
from apps.uploads.models import Upload
from apps.uploads.utils import calculate_hash, extract_iocs
from apps.yara_engine.utils import scan_file_with_yara
from apps.cve.utils import match_cves
from apps.analysis.models import AnalysisResult
from apps.analysis.ml_utils import predict_threat


@shared_task
def process_file(upload_id):
    upload = Upload.objects.get(id=upload_id)

    file = upload.file

    # 🔷 Step 1: Hash
    file_hash = calculate_hash(file)

    # 🔷 Step 2: Extract IOCs
    iocs = extract_iocs(file)
    ioc_count = len(iocs)

    # 🔷 Step 3: YARA scan
    yara_matches = scan_file_with_yara(file_path)
    yara_count = len(yara_matches)

    # 🔷 Step 4: CVE matching
    cve_matches = match_cves(iocs)
    cve_count = len(cve_matches)

    # 🔷 Step 5: ML Prediction
    features = {
        "file_size": file.size,
        "ioc_count": ioc_count,
        "yara_matches": yara_count,
        "cve_matches": cve_count
    }

    ml_result = predict_threat(features)

    # 🔷 Step 6: Save Analysis
    AnalysisResult.objects.create(
        upload=upload,
        file_hash=file_hash,
        ioc_count=ioc_count,
        yara_matches=yara_count,
        cve_matches=cve_count,
        risk_score=ml_result["confidence"],
        verdict="Malicious" if ml_result["label"] == 1 else "Benign"
    )

    return "Analysis Completed"
