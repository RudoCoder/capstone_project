import os
import pickle
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

MODEL_PATH = os.path.join(BASE_DIR, "ml", "model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "ml", "scaler.pkl")


def load_model():
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    return model


def load_scaler():
    with open(SCALER_PATH, "rb") as f:
        scaler = pickle.load(f)
    return scaler


def predict_threat(features: dict):
    """
    features = {
        'file_size': int,
        'ioc_count': int,
        'yara_matches': int,
        'cve_matches': int
    }
    """

    model = load_model()
    scaler = load_scaler()

    X = np.array([[
        features.get("file_size", 0),
        features.get("ioc_count", 0),
        features.get("yara_matches", 0),
        features.get("cve_matches", 0),
    ]])

    X_scaled = scaler.transform(X)

    prediction = model.predict(X_scaled)[0]
    probability = model.predict_proba(X_scaled)[0][1]

    return {
        "label": int(prediction),
        "confidence": float(probability)
    }
