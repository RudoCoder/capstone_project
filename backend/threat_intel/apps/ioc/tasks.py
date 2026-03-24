from apps.ioc.models import IOC, ExtractedIOC

iocs = extract_iocs(content)

for ip in iocs.get("ips", []):
    ioc_obj, _ = IOC.objects.get_or_create(
        type="ip",
        value=ip,
        defaults={"source": "extracted"}
    )

    ExtractedIOC.objects.create(
        analysis=analysis,
        ioc=ioc_obj,
        confidence_score=0.8
    )

for url in iocs.get("urls", []):
    ioc_obj, _ = IOC.objects.get_or_create(
        type="url",
        value=url,
        defaults={"source": "extracted"}
    )

    ExtractedIOC.objects.create(
        analysis=analysis,
        ioc=ioc_obj,
        confidence_score=0.8
    )
