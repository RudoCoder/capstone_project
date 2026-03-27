import joblib
import os

MODEL_PATH = os.path.join("ml", "model.pkl")

# Load model once (DO NOT reload per request)
try:
    model = joblib.load(MODEL_PATH)
except Exception as e:
    model = None
    print(f"ML Model load error: {e}")


def predict_threat(features):
    """
    Predict risk using ML model
    """

    if model is None:
        return {
            "prediction": 0,
            "risk_score": 0
        }

    try:
        prediction = model.predict([features])[0]

        if hasattr(model, "predict_proba"):
            prob = model.predict_proba([features])[0][1]
            risk_score = int(prob * 100)
        else:
            risk_score = int(prediction * 100)

        return {
            "prediction": int(prediction),
            "risk_score": risk_score
        }

    except Exception as e:
        print(f"Prediction error: {e}")
        return {
            "prediction": 0,
            "risk_score": 0
        }
