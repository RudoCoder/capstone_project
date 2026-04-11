# apps/cve/utils.py
import re

def extract_cve_from_meta(metadata):
    """
    Extracts CVE IDs from YARA rule metadata dictionaries.
    """
    cve_pattern = r"CVE-\d{4}-\d{4,7}"
    matches = []

    # YARA metadata is usually a dict. We convert it to string to scan it.
    meta_str = str(metadata)
    found = re.findall(cve_pattern, meta_str)

    # Return unique CVE IDs
    return list(set(found))

def match_cves(file_path):
    """
    Scans the raw content of a file for CVE patterns.
    """
    matches = []
    try:
        with open(file_path, "r", errors="ignore") as f:
            content = f.read()
            cve_pattern = r"CVE-\d{4}-\d{4,7}"
            found = re.findall(cve_pattern, content)
            for cve in list(set(found)):
                matches.append({
                    "cve_id": cve,
                    "severity": 7.5  # default CVSS score until enriched from NVD
                })
    except Exception as e:
        print(f"CVE scan error: {e}")
    return matches
