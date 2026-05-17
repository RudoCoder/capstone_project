import re

from apps.uploads.models import Upload
from apps.uploads.utils import extract_iocs
from apps.yara_engine.utils import scan_file_with_yara
from apps.cve.utils import match_cves, lookup_nvd_cve
from apps.analysis.models import AnalysisResult
from apps.analysis.ml_utils import predict_threat
from apps.ioc.models import IOC, ExtractedIOC
from apps.yara_engine.models import YaraRule, YaraMatch
from apps.cve.models import CVE, CVEMatch

# ── Signal-quality helpers ────────────────────────────────────────────────────
# Rule names that only match generic patterns (IP, domain, URL, etc.) and carry
# no malware-specific signal on their own — exclude from ML scoring.
_GENERIC_RULE_NAMES = {"domain", "ip", "url", "email", "hash", "network", "dns"}

_MALWARE_KEYWORDS = {
    "malware", "exploit", "trojan", "rat", "backdoor",
    "ransomware", "rootkit", "virus", "spyware", "adware", "apt",
    "worm", "keylogger", "botnet", "dropper", "downloader",
}

_CVE_PATTERN = re.compile(r"CVE-\d{4}-\d{4,7}", re.IGNORECASE)


def _is_high_signal(match):
    """Return True only if the YARA match name/tags suggest actual malware."""
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
    """
    Main analysis pipeline — runs synchronously in the Django dev server.
    Steps:
      1. IOC extraction
      2. YARA scanning (including cve_rules/ folder)
      3. CVE matching — YARA-based CVE rules + raw file regex scan
      4. ML risk scoring
      5. Save completed analysis
    """
    upload   = Upload.objects.get(id=upload_id)
    analysis = AnalysisResult.objects.get(id=analysis_id)

    try:
        analysis.status = "processing"
        analysis.save()

        file_path = upload.file.path

        # ── Step 1: IOC extraction ─────────────────────────────────────────────
        iocs      = extract_iocs(upload.file)   # pass file object (not path)
        ioc_count = sum(len(iocs[k]) for k in iocs)

        ioc_type_map = [
            ("ip",     iocs["ips"]),
            ("domain", iocs["domains"]),
            ("url",    iocs["urls"]),
            ("email",  iocs["emails"]),
            ("hash",   iocs["hashes"]),
        ]
        for ioc_type, values in ioc_type_map:
            for value in values[:50]:           # cap at 50 per type
                ioc_obj, _ = IOC.objects.get_or_create(
                    value=value, defaults={"type": ioc_type}
                )
                ExtractedIOC.objects.get_or_create(
                    analysis=analysis, ioc=ioc_obj
                )

        # ── Step 2: YARA scanning ──────────────────────────────────────────────
        yara_matches = scan_file_with_yara(file_path)

        high_signal_matches = [m for m in yara_matches if _is_high_signal(m)]
        yara_count          = len(yara_matches)
        high_signal_count   = len(high_signal_matches)

        # Save ALL YARA matches to DB
        for match in yara_matches:
            rule_obj, _ = YaraRule.objects.get_or_create(
                name=match["rule"],
                defaults={
                    "description": str(match.get("meta", "")),
                    "rule_text": "",
                }
            )
            YaraMatch.objects.get_or_create(analysis=analysis, rule=rule_obj)

        # ── Step 3: CVE matching ───────────────────────────────────────────────
        # 3a. Extract CVE IDs from YARA rule names (cve_rules/*.yar files)
        #     These are the most reliable hits because YARA matched binary patterns.
        yara_cve_ids = set()
        for match in yara_matches:
            if _CVE_PATTERN.match(match["rule"]):
                yara_cve_ids.add(match["rule"].upper())

        for cve_id in yara_cve_ids:
            nvd = lookup_nvd_cve(cve_id)
            cve_obj, _ = CVE.objects.get_or_create(
                cve_id=cve_id,
                defaults={
                    "description": nvd["description"] if nvd else "",
                    "severity":    nvd["severity"] if nvd and nvd["severity"] else 7.5,
                }
            )
            # Update description/severity if we now have NVD data and didn't before
            if nvd and (not cve_obj.description or cve_obj.severity == 0.0):
                cve_obj.description = nvd["description"]
                cve_obj.severity    = nvd["severity"] or 7.5
                cve_obj.save()
            CVEMatch.objects.get_or_create(analysis=analysis, cve=cve_obj)

        # 3b. Regex scan the raw file text for CVE IDs not already caught by YARA
        raw_cve_matches = match_cves(file_path)
        for cve_data in raw_cve_matches:
            cve_id = cve_data["cve_id"]
            if cve_id in yara_cve_ids:
                continue    # already added above
            cve_obj, _ = CVE.objects.get_or_create(
                cve_id=cve_id,
                defaults={
                    "description": cve_data.get("description", ""),
                    "severity":    cve_data.get("severity", 0.0),
                }
            )
            CVEMatch.objects.get_or_create(analysis=analysis, cve=cve_obj)

        cve_count = CVEMatch.objects.filter(analysis=analysis).count()

        # ── Step 4: ML risk scoring ────────────────────────────────────────────
        features = {
            "file_size":    upload.file.size,
            "ioc_count":    ioc_count,
            "yara_matches": high_signal_count,
            "cve_matches":  cve_count,
        }
        ml_result  = predict_threat(features)
        risk_score = round(ml_result["confidence"] * 100, 2)

        if risk_score >= 75:
            threat_level = "critical"
        elif risk_score >= 50:
            threat_level = "high"
        elif risk_score >= 25:
            threat_level = "medium"
        else:
            threat_level = "low"

        # ── Step 5: Mark analysis complete ────────────────────────────────────
        analysis.status       = "completed"
        analysis.risk_score   = risk_score
        analysis.threat_level = threat_level
        analysis.summary      = (
            f"IOCs found: {ioc_count} | "
            f"YARA matches: {yara_count} | "
            f"CVEs: {cve_count}"
        )
        analysis.save()

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        analysis.status  = "failed"
        analysis.summary = str(e)
        analysis.save()

    return "Analysis Completed"
