import re

def extract_iocs(content):
    if not content:
        return {"ips": [], "urls": []}

    # Regex for IPv4
    ip_pattern = r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b'
    # Simple regex for URLs
    url_pattern = r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'

    ips = list(set(re.findall(ip_pattern, content)))
    urls = list(set(re.findall(url_pattern, content)))

    return {"ips": ips, "urls": urls}
