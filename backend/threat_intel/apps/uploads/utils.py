import hashlib
import re


def calculate_hash(file):
    """Calculate SHA-256 hash of an uploaded file object."""
    sha256 = hashlib.sha256()
    file.seek(0)
    for chunk in file.chunks():
        sha256.update(chunk)
    file.seek(0)   # reset so next consumer can read from the start
    return sha256.hexdigest()


def extract_iocs(file):
    """
    Extract IOCs from file content.
    Accepts a Django FieldFile (upload.file) or any file-like object.
    Returns dict: {ips, domains, urls, emails, hashes}.
    """
    try:
        file.seek(0)
        content = file.read().decode(errors="ignore")
        file.seek(0)
    except Exception:
        return {"ips": [], "domains": [], "urls": [], "emails": [], "hashes": []}

    # Emails first so their domains are not double-counted as plain domains
    emails = list(set(re.findall(
        r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b",
        content
    )))

    # Full URLs before plain domains
    urls = list(set(re.findall(
        r"https?://[^\s\"'<>]{4,}",
        content
    )))

    # IPs — exclude loopback/broadcast
    all_ips = re.findall(r"\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b", content)
    ips = list(set(
        ip for ip in all_ips
        if not (
            ip.startswith("127.") or
            ip.startswith("0.")   or
            ip == "255.255.255.255"
        )
    ))

    # Domains — strip email domains and anything that's part of a URL
    email_domains = {e.split("@")[1] for e in emails}
    all_domains   = re.findall(r"\b(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}\b", content)
    domains = list(set(
        d for d in all_domains
        if d not in email_domains and not any(d in u for u in urls)
    ))

    # File hashes: MD5 (32 hex), SHA1 (40 hex), SHA256 (64 hex)
    hashes = list(set(re.findall(
        r"\b[0-9a-fA-F]{64}\b|\b[0-9a-fA-F]{40}\b|\b[0-9a-fA-F]{32}\b",
        content
    )))

    return {
        "ips":     ips,
        "domains": domains,
        "urls":    urls,
        "emails":  emails,
        "hashes":  hashes,
    }
