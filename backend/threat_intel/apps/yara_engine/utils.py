def handle_file_upload(upload_id, analysis_id):
    analysis = AnalysisResult.objects.get(id=analysis_id)
    analysis.status = "processing"
    analysis.save()

    file_path = analysis.upload.file.path

    with open(file_path, 'r', errors='ignore') as f:
        content = f.read()

    # IOC Extraction
    iocs = extract_iocs(content)

    for ip in iocs["ips"]:
        ioc_obj, _ = IOC.objects.get_or_create(type="ip", value=ip)
        ExtractedIOC.objects.create(analysis=analysis, ioc=ioc_obj)

    # YARA Scan
    run_yara_scan(content, analysis)

    # CVE Matching
    match_cves(content, analysis)

    # Risk Scoring
    calculate_risk(analysis)

    analysis.status = "completed"
    analysis.save()
