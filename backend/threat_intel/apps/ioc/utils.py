# apps/ioc/utils.py
# NOTE: The primary IOC extraction used by the pipeline is in apps/uploads/utils.py.
# This file keeps a minimal version for the IOCExtractionView endpoint.
import re


def extract_iocs(content):
    """
    Extract IPs and URLs from a raw text string.
    Used by the manual extraction API endpoint.
    """
    if not content:
        return {"ips": [], "urls": []}

    ips  = list(set(re.findall(r"\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b", content)))
    urls = list(set(re.findall(r"https?://[^\s\"'<>]{4,}", content)))

    return {"ips": ips, "urls": urls}
