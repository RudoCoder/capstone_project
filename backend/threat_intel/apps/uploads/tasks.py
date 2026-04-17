from apps.uploads.models import Upload
from apps.uploads.utils import extract_iocs
from apps.yara_engine.utils import scan_file_with_yara
from apps.cve.utils import match_cves
from apps.analysis.models import AnalysisResult
from apps.analysis.ml_utils import predict_threat
from apps.ioc.models import IOC, ExtractedIOC
from apps.yara_engine.models import YaraRule, YaraMatch
from apps.cve.models import CVE, CVEMatch

# Rule names that only match generic patterns (IP addresses, domains, URLs, etc.)
# and carry no malware-specific signal on their own.
_GENERIC_RULE_NAMES = {"domain", "ip", "url", "email", "hash", "network", "dns"}

_MALWARE_KEYWORDS = {
    "malware", "exploit", "trojan", "rat", "backdoor",
    "ransomware", "rootkit", "virus", "spyware", "adware", "apt",
    "worm", "keylogger", "botnet", "dropper", "downloader",
}


def _is_high_signal(match):
    """Return True only if the YARA match name or tags suggest actual malware."""
    name = match["rule"].lower()
    tags = [t.lower() for t in (match.get("tags") or [])]
    if name in _GENERIC_RULE_NAMES:
        return False
    if any(kw in name for kw in _MALWARE_KEYWORDS):
        return True
    if any(kw in tag for tag in tags for kw in _MALWARE_KEYWORDS):
        return True
    return False


def process_file(upload_id, analysis_id):
    upload = Upload.objects.get(id=upload_id)
    analysis = AnalysisResult.objects.get(id=analysis_id)

    try:
        analysis.status = "processing"
        analysis.save()

        file = upload.file
        file_path = upload.file.path  # real filesystem path

        # Step 1: Extract IOCs from file content
        iocs = extract_iocs(file)
        ioc_count = sum(len(iocs[k]) for k in iocs)

        # Save IOCs to DB — cap each type at 50 to avoid huge inserts
        ioc_type_map = [
            ("ip",     iocs["ips"]),
            ("domain", iocs["domains"]),
            ("url",    iocs["urls"]),
            ("email",  iocs["emails"]),
            ("hash",   iocs["hashes"]),
        ]
        for ioc_type, values in ioc_type_map:
            for value in values[:50]:
                ioc_obj, _ = IOC.objects.get_or_create(value=value, defaults={"type": ioc_type})
                ExtractedIOC.objects.get_or_create(analysis=analysis, ioc=ioc_obj)

        # Step 2: YARA scan against rules repo
        yara_matches = scan_file_with_yara(file_path)

        # Separate high-signal matches (actual malware rules) from generic
        # pattern rules (e.g. "domain", "IP") which fire on almost any text
        # file and would otherwise inflate the risk score.
        high_signal_matches = [m for m in yara_matches if _is_high_signal(m)]
        yara_count = len(yara_matches)           # total — stored in summary
        high_signal_count = len(high_signal_matches)  # used for ML scoring

        # Save ALL YARA matches to DB so the user can see them
        for match in yara_matches:
            rule_obj, _ = YaraRule.objects.get_or_create(
                name=match["rule"],
                defaults={
                    "description": str(match.get("meta", "")),
                    "rule_text": "",
                }
            )
            YaraMatch.objects.get_or_create(analysis=analysis, rule=rule_obj)

        # Step 3: CVE matching — scan raw file for CVE-XXXX-XXXX patterns
        cve_matches = match_cves(file_path)
        cve_count = len(cve_matches)

        # Save CVE matches to DB
        for cve_data in cve_matches:
            cve_obj, _ = CVE.objects.get_or_create(
                cve_id=cve_data["cve_id"],
                defaults={"description": "", "severity": cve_data.get("severity", 0.0)}
            )
            CVEMatch.objects.get_or_create(analysis=analysis, cve=cve_obj)

        # Step 4: ML risk scoring — only high-signal YARA hits count
        features = {
            "file_size": upload.file.size,
            "ioc_count": ioc_count,
            "yara_matches": high_signal_count,
            "cve_matches": cve_count,
        }
        ml_result = predict_threat(features)
        risk_score = round(ml_result["confidence"] * 100, 2)

        # Map score to threat level
        if risk_score >= 75:
            threat_level = "critical"
        elif risk_score >= 50:
            threat_level = "high"
        elif risk_score >= 25:
            threat_level = "medium"
        else:
            threat_level = "low"

        # Step 5: Mark analysis complete
        analysis.status = "completed"
        analysis.risk_score = risk_score
        analysis.threat_level = threat_level
        analysis.summary = (
            f"IOCs found: {ioc_count} | YARA matches: {yara_count} | CVEs: {cve_count}"
        )
        analysis.save()

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        analysis.status = "failed"
        analysis.summary = str(e)
        analysis.save()

    return "Analysis Completed"
