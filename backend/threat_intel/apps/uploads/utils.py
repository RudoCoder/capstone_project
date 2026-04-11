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
    Extract IOCs (Indicators of Compromise) from file content.
    Covers: IPs, domains, URLs, emails, MD5/SHA1/SHA256 hashes.
    """
    file.seek(0)
    content = file.read().decode(errors="ignore")
    file.seek(0)

    # Extract emails first so their domains are not also captured as plain domains
    emails = list(set(re.findall(
        r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b",
        content
    )))

    # Extract URLs before domains so full URLs are not double-counted
    urls = list(set(re.findall(
        r"https?://[^\s\"'<>]{4,}",
        content
    )))

    # IPs — exclude private ranges that are almost never IOCs
    all_ips = re.findall(r"\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b", content)
    ips = list(set(
        ip for ip in all_ips
        if not (ip.startswith("127.") or ip.startswith("0.") or ip == "255.255.255.255")
    ))

    # Domains — strip out anything that looks like an email or is part of a URL
    email_domains = {e.split("@")[1] for e in emails}
    all_domains = re.findall(r"\b(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}\b", content)
    domains = list(set(
        d for d in all_domains
        if d not in email_domains and not any(d in u for u in urls)
    ))

    # File hashes: MD5 (32), SHA1 (40), SHA256 (64) hex strings
    hashes = list(set(re.findall(
        r"\b[0-9a-fA-F]{64}\b|\b[0-9a-fA-F]{40}\b|\b[0-9a-fA-F]{32}\b",
        content
    )))

    return {
        "ips": ips,
        "domains": domains,
        "urls": urls,
        "emails": emails,
        "hashes": hashes,
    }
