# apps/cve/utils.py

import re
from .models import CVE, CVEMatch


def match_cves(content, analysis):
    matches_found = []

    # Find CVE patterns in content
    found_ids = re.findall(r"CVE-\d{4}-\d{4,7}", content)

    for cve_id in found_ids:
        try:
            cve_obj = CVE.objects.get(cve_id=cve_id)

            CVEMatch.objects.create(
                analysis=analysis,
                cve=cve_obj,
                matched_text=cve_id
            )

            matches_found.append(cve_id)

        except CVE.DoesNotExist:
            continue

    return matches_found
