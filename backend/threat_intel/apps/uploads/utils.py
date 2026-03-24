# apps/uploads/utils.py
import re
from apps.analysis.models import AnalysisResult
from apps.ioc.models import IOC, ExtractedIOC

def extract_iocs(content):
    ip_pattern = r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b'
    urls = re.findall(r'https?://\S+', content)
    ips = re.findall(ip_pattern, content)

    return {"ips": ips, "urls": urls}

def handle_file_upload(upload_id, analysis_id):
    analysis = AnalysisResult.objects.get(id=analysis_id)
    analysis.status = "processing"
    analysis.save()

    file_path = analysis.upload.file.path

    with open(file_path, 'r', errors='ignore') as f:
        content = f.read()

    # IOC Extraction
    iocs = extract_iocs(content)

    for ip in iocs["ips"]:
        ioc_obj, _ = IOC.objects.get_or_create(type="ip", value=ip)
        ExtractedIOC.objects.create(analysis=analysis, ioc=ioc_obj)

    # YARA Scan
    run_yara_scan(content, analysis)

    # CVE Matching
    match_cves(content, analysis)

    # Risk Scoring
    calculate_risk(analysis)

    analysis.status = "completed"
    analysis.save()
