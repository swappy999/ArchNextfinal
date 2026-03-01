import numpy as np
import pandas as pd
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score

# -----------------------------
# 1. Create Synthetic Dataset
# -----------------------------

np.random.seed(42)
n_samples = 5000

data = pd.DataFrame({
    "kyc_verified": np.random.binomial(1, 0.85, n_samples),
    "id_match_score": np.random.uniform(0.5, 1.0, n_samples),
    "registry_match": np.random.binomial(1, 0.9, n_samples),
    "ownership_match_score": np.random.uniform(0.5, 1.0, n_samples),
    "mutation_valid": np.random.binomial(1, 0.8, n_samples),
    "inside_kolkata": np.random.binomial(1, 0.95, n_samples),
    "encumbrance_flag": np.random.binomial(1, 0.2, n_samples),
    "tax_due": np.random.exponential(scale=20000, size=n_samples),
    "price_deviation": np.random.normal(0, 1, n_samples),
    "nft_registered": np.random.binomial(1, 0.3, n_samples),
    "duplicate_token": np.random.binomial(1, 0.05, n_samples),
})

# -----------------------------
# 2. Create Synthetic Target
# -----------------------------
# Fraud logic simulation

data["authentic"] = (
    (data["kyc_verified"] == 1) &
    (data["registry_match"] == 1) &
    (data["ownership_match_score"] > 0.75) &
    (data["inside_kolkata"] == 1) &
    (data["duplicate_token"] == 0)
).astype(int)

# -----------------------------
# 3. Train/Test Split
# -----------------------------

X = data.drop("authentic", axis=1)
y = data["authentic"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# -----------------------------
# 4. Train XGBoost Model
# -----------------------------

model = XGBClassifier(
    n_estimators=200,
    max_depth=5,
    learning_rate=0.1,
    subsample=0.8,
    colsample_bytree=0.8,
    eval_metric="logloss",
    random_state=42
)

model.fit(X_train, y_train)

# -----------------------------
# 5. Evaluate Model
# -----------------------------

y_pred = model.predict(X_test)
y_prob = model.predict_proba(X_test)[:,1]

print(classification_report(y_test, y_pred))
print("ROC-AUC Score:", roc_auc_score(y_test, y_prob))

# -----------------------------
# 6. Predict New Property
# -----------------------------

new_property = pd.DataFrame([{
    "kyc_verified": 1,
    "id_match_score": 0.92,
    "registry_match": 1,
    "ownership_match_score": 0.88,
    "mutation_valid": 1,
    "inside_kolkata": 1,
    "encumbrance_flag": 0,
    "tax_due": 5000,
    "price_deviation": 0.2,
    "nft_registered": 1,
    "duplicate_token": 0
}])

auth_probability = model.predict_proba(new_property)[0][1]

print("Authenticity Probability:", round(auth_probability, 4))