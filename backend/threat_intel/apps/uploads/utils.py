# apps/uploads/utils.py

import hashlib
import re

def calculate_hash(file):
    """
    Calculate SHA256 hash of uploaded file
    """
    sha256 = hashlib.sha256()

    for chunk in file.chunks():
        sha256.update(chunk)

    return sha256.hexdigest()
def extract_iocs(file):
    """
    Extract basic IOCs (Indicators of Compromise)
    from file content.
    """

    content = file.read().decode(errors="ignore")

    iocs = {
        "ips": [],
        "domains": [],
        "emails": [],
    }

    # Regex patterns
    ip_pattern = r"\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b"
    domain_pattern = r"\b(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}\b"
    email_pattern = r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"

    iocs["ips"] = re.findall(ip_pattern, content)
    iocs["domains"] = re.findall(domain_pattern, content)
    iocs["emails"] = re.findall(email_pattern, content)

    return iocs
