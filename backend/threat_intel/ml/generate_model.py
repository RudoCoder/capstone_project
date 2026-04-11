"""
Run this once to regenerate model.pkl and scaler.pkl.

Features used (must match tasks.py exactly):
  file_size, ioc_count, yara_matches, cve_matches

Usage (from the threat_intel/ directory with venv active):
  python ml/generate_model.py
"""

import os
import pickle
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# ── Synthetic training data ──────────────────────────────────────────────────
# Columns: file_size, ioc_count, yara_matches, cve_matches
rng = np.random.default_rng(42)

# Clean files — small, few IOCs, no YARA/CVE hits
clean = np.column_stack([
    rng.integers(1_000, 500_000, 200),   # file_size
    rng.integers(0, 5, 200),             # ioc_count
    rng.integers(0, 1, 200),             # yara_matches
    rng.integers(0, 1, 200),             # cve_matches
])

# Malicious files — larger, many IOCs, YARA/CVE hits
malicious = np.column_stack([
    rng.integers(100_000, 10_000_000, 200),
    rng.integers(5, 50, 200),
    rng.integers(1, 10, 200),
    rng.integers(0, 5, 200),
])

X = np.vstack([clean, malicious]).astype(float)
y = np.array([0] * 200 + [1] * 200)

# ── Fit scaler & model ───────────────────────────────────────────────────────
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_scaled, y)

# ── Save ─────────────────────────────────────────────────────────────────────
model_path = os.path.join(SCRIPT_DIR, "model.pkl")
scaler_path = os.path.join(SCRIPT_DIR, "scaler.pkl")

with open(model_path, "wb") as f:
    pickle.dump(model, f)

with open(scaler_path, "wb") as f:
    pickle.dump(scaler, f)

print(f"Saved model  → {model_path}")
print(f"Saved scaler → {scaler_path}")
print("Done. 4 features: file_size, ioc_count, yara_matches, cve_matches")
