from apps.yara_engine.utils import run_yara_scan

file_path = analysis.upload.file.path

# Run YARA
yara_matches = run_yara_scan(file_path, analysis)

# Optional: increase risk if matches found
if yara_matches:
    analysis.risk_score += 30
