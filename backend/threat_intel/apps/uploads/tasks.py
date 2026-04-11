from apps.uploads.models import Upload
from apps.uploads.utils import extract_iocs
from apps.yara_engine.utils import scan_file_with_yara
from apps.cve.utils import match_cves
from apps.analysis.models import AnalysisResult
from apps.analysis.ml_utils import predict_threat
from apps.ioc.models import IOC, ExtractedIOC
from apps.yara_engine.models import YaraRule, YaraMatch
from apps.cve.models import CVE, CVEMatch


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
        yara_count = len(yara_matches)

        # Save YARA matches to DB
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

        # Step 4: ML risk scoring
        features = {
            "file_size": upload.file.size,
            "ioc_count": ioc_count,
            "yara_matches": yara_count,
            "cve_matches": cve_count,
        }
        ml_result = predict_threat(features)
        risk_score = round(ml_result["confidence"] * 100, 2)

        # Map score to threat level
        if risk_score >= 70:
            threat_level = "critical"
        elif risk_score >= 40:
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
