import os
import pickle
import numpy as np

# ── Paths ─────────────────────────────────────────────────────────────────────
# Both files live at: backend/threat_intel/ml/model.pkl  and  ml/scaler.pkl
_ML_DIR      = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "ml")
MODEL_PATH   = os.path.normpath(os.path.join(_ML_DIR, "model.pkl"))
SCALER_PATH  = os.path.normpath(os.path.join(_ML_DIR, "scaler.pkl"))

# ── Module-level cache — load once per process ────────────────────────────────
_model  = None
_scaler = None


def _load_artifacts():
    global _model, _scaler
    if _model is not None:
        return

    if not os.path.exists(MODEL_PATH) or not os.path.exists(SCALER_PATH):
        print(
            f"[ML] WARNING: model.pkl or scaler.pkl not found at {_ML_DIR}. "
            "Run: python ml/generate_model.py  (from the threat_intel/ directory)."
        )
        return

    try:
        with open(MODEL_PATH, "rb") as f:
            _model = pickle.load(f)
        with open(SCALER_PATH, "rb") as f:
            _scaler = pickle.load(f)
        print(f"[ML] Model and scaler loaded from {_ML_DIR}")
    except Exception as e:
        print(f"[ML] Load error: {e}")


def predict_threat(features: dict):
    """
    features = {
        'file_size':    int,
        'ioc_count':    int,
        'yara_matches': int,   # high-signal only
        'cve_matches':  int,
    }
    Returns {'label': int, 'confidence': float (0–1)}.
    Falls back to a rule-based score if the model is unavailable.
    """
    _load_artifacts()

    X = np.array([[
        features.get("file_size",    0),
        features.get("ioc_count",    0),
        features.get("yara_matches", 0),
        features.get("cve_matches",  0),
    ]], dtype=float)

    # ── Fallback: rule-based scoring if model/scaler missing ─────────────────
    if _model is None or _scaler is None:
        raw = (
            min(features.get("ioc_count",    0) * 2,  30) +
            min(features.get("yara_matches", 0) * 10, 40) +
            min(features.get("cve_matches",  0) * 10, 30)
        )
        confidence = min(raw / 100.0, 1.0)
        return {"label": int(confidence >= 0.5), "confidence": confidence}

    try:
        X_scaled    = _scaler.transform(X)
        prediction  = int(_model.predict(X_scaled)[0])
        probability = float(_model.predict_proba(X_scaled)[0][1])
        return {"label": prediction, "confidence": probability}
    except Exception as e:
        print(f"[ML] Prediction error: {e}")
        return {"label": 0, "confidence": 0.0}
