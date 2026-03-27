def extract_features(upload, iocs, yara_matches):
    """
    Convert system data into ML features
    """

    try:
        features = {
            "file_size": upload.file.size if upload.file else 0,
            "ioc_count": len(iocs),
            "yara_matches": len(yara_matches),

            "ip_count": sum(1 for i in iocs if getattr(i, "type", "") == "ip"),
            "domain_count": sum(1 for i in iocs if getattr(i, "type", "") == "domain"),
            "hash_count": sum(1 for i in iocs if getattr(i, "type", "") == "hash"),

            "high_risk_rules": sum(
                1 for y in yara_matches if "malware" in (y.tags or "").lower()
            ),
        }

        return list(features.values())

    except Exception as e:
        print(f"Feature extraction error: {e}")
        return [0, 0, 0, 0, 0, 0, 0]
