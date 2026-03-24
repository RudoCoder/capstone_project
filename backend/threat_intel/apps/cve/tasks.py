from apps.cve.utils import match_cves

# Read file content already done earlier

# Run CVE matching
cve_matches = match_cves(content, analysis)

# Increase risk if CVEs found
if cve_matches:
    analysis.risk_score += 20
