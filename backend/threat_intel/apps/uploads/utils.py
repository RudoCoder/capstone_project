# apps/uploads/utils.py

import hashlib
import re

def calculate_hash(file):
    """
    Calculate SHA256 hash of uploaded file
    """
    sha256 = hashlib.sha256()

    # Reset pointer just in case
    file.seek(0)

    for chunk in file.chunks():
        sha256.update(chunk)

    # CRITICAL: Reset the pointer back to the start so the
    # next function (like saving to disk) can read it!
    file.seek(0)

    return sha256.hexdigest()

def extract_iocs(file):
    """
    Extract basic IOCs (Indicators of Compromise)
    from file content.
    """
    file.seek(0) # Ensure we start at the beginning
    content = file.read().decode(errors="ignore")
    file.seek(0) # Reset again after reading

    iocs = {
        "ips": list(set(re.findall(r"\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b", content))),
        "domains": list(set(re.findall(r"\b(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}\b", content))),
        "emails": list(set(re.findall(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b", content))),
    }

    return iocs
