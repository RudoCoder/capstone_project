import pandas as pd
import pickle

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

# ----------------------------------------
# STEP 1: CREATE SAMPLE DATASET
# ----------------------------------------

data = {
    "ioc_count": [1, 5, 10, 20, 2, 7, 15, 25, 3, 8],
    "yara_matches": [0, 2, 5, 10, 1, 3, 6, 12, 1, 4],
    "cve_matches": [0, 1, 3, 6, 0, 2, 4, 8, 1, 2],
    "file_size_kb": [50, 200, 500, 1000, 70, 300, 700, 1200, 80, 400],
    "label": [0, 1, 1, 1, 0, 1, 1, 1, 0, 1]  # 0 = low risk, 1 = high risk
}

df = pd.DataFrame(data)

# ----------------------------------------
# STEP 2: SPLIT DATA
# ----------------------------------------

X = df.drop("label", axis=1)
y = df["label"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# ----------------------------------------
# STEP 3: BUILD PIPELINE
# ----------------------------------------

pipeline = Pipeline([
    ("scaler", StandardScaler()),
    ("model", RandomForestClassifier(n_estimators=100, random_state=42))
])

# ----------------------------------------
# STEP 4: TRAIN MODEL
# ----------------------------------------

pipeline.fit(X_train, y_train)

# ----------------------------------------
# STEP 5: SAVE MODEL
# ----------------------------------------

with open("model.pkl", "wb") as f:
    pickle.dump(pipeline, f)

print("✅ Model trained and saved as model.pkl")
