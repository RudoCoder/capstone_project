import os
import re
import json
import glob

# ── NVD Local Clone Path ───────────────────────────────────────────────────────
# Resolves to: backend/threat_intel/yara_rules_repo/cves/
# The NVD cvelistV5 clone should be inside your yara_rules_repo folder:
#   yara_rules_repo/
#     cves/          <- clone of https://github.com/CVEProject/cvelistV5.git
#     antidebug_antivm/
#     cve_rules/
#     ...
_BACKEND_ROOT = os.path.normpath(
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..")
)
CVE_REPO_PATH = os.path.join(_BACKEND_ROOT, "yara_rules_repo", "cves")

_CVE_PATTERN = re.compile(r"CVE-\d{4}-\d{4,7}", re.IGNORECASE)


def lookup_nvd_cve(cve_id):
    """
    Look up a CVE in the local NVD cvelistV5 clone.
    Returns {'description': str, 'severity': float} or None if not found.

    The cvelistV5 repo layout is:
      cves/<year>/<bucket>/<CVE-YEAR-ID>.json
    e.g. cves/2017/11xxx/CVE-2017-11882.json
    """
    if not os.path.exists(CVE_REPO_PATH):
        return None

    parts = cve_id.upper().split("-")   # ['CVE', '2017', '11882']
    if len(parts) < 3:
        return None

    year = parts[1]
    # The cvelistV5 repo buckets IDs into folders like "11xxx"
    num  = parts[2]
    bucket = num[:-3] + "xxx" if len(num) > 3 else "0xxx"

    candidate = os.path.join(CVE_REPO_PATH, year, bucket, f"{cve_id.upper()}.json")

    # Also try a glob in case the bucket name differs
    if not os.path.exists(candidate):
        pattern = os.path.join(CVE_REPO_PATH, year, "**", f"{cve_id.upper()}.json")
        files = glob.glob(pattern, recursive=True)
        if not files:
            return None
        candidate = files[0]

    try:
        with open(candidate, encoding="utf-8") as f:
            data = json.load(f)

        containers = data.get("containers", {})
        cna        = containers.get("cna", {})

        # Description
        desc = ""
        for d in cna.get("descriptions", []):
            if d.get("lang", "").startswith("en"):
                desc = d.get("value", "")
                break

        # CVSS score — try v3.1 → v3.0 → v2.0
        score = 0.0
        for metric_block in cna.get("metrics", []):
            for key in ("cvssV3_1", "cvssV3_0", "cvssV2_0"):
                if key in metric_block:
                    score = float(metric_block[key].get("baseScore", 0.0))
                    break
            if score:
                break

        # Fallback: check adp containers
        if score == 0.0:
            for adp in containers.get("adp", []):
                for metric_block in adp.get("metrics", []):
                    for key in ("cvssV3_1", "cvssV3_0", "cvssV2_0"):
                        if key in metric_block:
                            score = float(metric_block[key].get("baseScore", 0.0))
                            break
                    if score:
                        break
                if score:
                    break

        return {"description": desc, "severity": score}

    except Exception as e:
        print(f"[CVE] NVD lookup error for {cve_id}: {e}")
        return None


def match_cves(file_path):
    """
    Scan the raw content of a file for CVE-XXXX-XXXX patterns.
    Enriches each found CVE from the local NVD clone when available.
    Returns a list of dicts: {cve_id, description, severity}.
    """
    matches = []
    try:
        with open(file_path, "r", errors="ignore") as f:
            content = f.read()

        found_ids = list({m.upper() for m in _CVE_PATTERN.findall(content)})

        for cve_id in found_ids:
            nvd_data = lookup_nvd_cve(cve_id)
            if nvd_data:
                matches.append({
                    "cve_id":      cve_id,
                    "description": nvd_data["description"],
                    "severity":    nvd_data["severity"] if nvd_data["severity"] else 7.5,
                })
            else:
                matches.append({
                    "cve_id":      cve_id,
                    "description": "",
                    "severity":    7.5,   # default CVSS score until enriched
                })

    except Exception as e:
        print(f"[CVE] File scan error: {e}")

    return matches
