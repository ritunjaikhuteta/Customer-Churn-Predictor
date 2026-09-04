"""
ChurnIQ — Prediction Service
Loads the trained sklearn/XGBoost pipeline and runs inference.
Uses SHAP TreeExplainer for per-customer feature explanations.
"""
import json
import logging
import os
from functools import lru_cache
from pathlib import Path
from typing import Dict, Any, List, Tuple

import joblib
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

MODELS_DIR = Path(__file__).parent.parent / "models"
PIPELINE_PATH = MODELS_DIR / "churn_pipeline.joblib"
METRICS_PATH = MODELS_DIR / "model_metrics.json"
METADATA_PATH = MODELS_DIR / "feature_metadata.json"


@lru_cache(maxsize=1)
def _load_pipeline():
    if not PIPELINE_PATH.exists():
        raise FileNotFoundError(
            f"Model pipeline not found at '{PIPELINE_PATH}'. "
            "Please run: python training/train_model.py"
        )
    return joblib.load(PIPELINE_PATH)


@lru_cache(maxsize=1)
def _load_metrics() -> Dict:
    if not METRICS_PATH.exists():
        raise FileNotFoundError(f"Model metrics not found at '{METRICS_PATH}'.")
    with open(METRICS_PATH) as f:
        return json.load(f)


@lru_cache(maxsize=1)
def _load_metadata() -> Dict:
    if not METADATA_PATH.exists():
        return {}
    with open(METADATA_PATH) as f:
        return json.load(f)


def _risk_level(prob: float) -> str:
    if prob < 0.31:
        return "Low"
    elif prob < 0.61:
        return "Medium"
    return "High"


def _get_shap_factors(pipeline, input_df: pd.DataFrame) -> List[Dict[str, Any]]:
    """
    Compute per-customer SHAP values from the trained XGBoost model.
    Maps one-hot encoded feature names back to readable labels.
    """
    try:
        import shap

        preprocessor = pipeline.named_steps["preprocessor"]
        classifier = pipeline.named_steps["classifier"]

        # Transform input through the preprocessor
        X_transformed = preprocessor.transform(input_df)

        # Get feature names from preprocessor
        try:
            feature_names = preprocessor.get_feature_names_out()
        except Exception:
            feature_names = [f"f{i}" for i in range(X_transformed.shape[1])]

        # SHAP explainer on the booster
        explainer = shap.TreeExplainer(classifier)
        shap_values = explainer.shap_values(X_transformed)

        # shap_values for binary classification: shape (n_samples, n_features)
        # For XGBoost binary, it returns a single array
        if isinstance(shap_values, list):
            sv = shap_values[1][0]  # class 1 (churn), first sample
        else:
            sv = shap_values[0]  # first sample

        # Build factor list sorted by absolute impact
        metadata = _load_metadata()
        feature_map = metadata.get("feature_name_map", {})

        factors = []
        original_input = input_df.iloc[0].to_dict()

        for fname, sval in zip(feature_names, sv):
            readable = feature_map.get(fname, fname)
            # Try to find the original value for this feature
            orig_val = _get_original_value(fname, original_input, feature_map)
            factors.append({
                "feature": readable,
                "encoded_feature": fname,
                "value": orig_val,
                "impact": float(sval),
            })

        # Sort by absolute SHAP value, take top 6
        factors.sort(key=lambda x: abs(x["impact"]), reverse=True)
        return factors[:6]

    except Exception as e:
        logger.warning(f"SHAP computation failed, falling back to heuristics: {e}")
        return _heuristic_factors(input_df)


def _get_original_value(encoded_name: str, original_input: Dict, feature_map: Dict) -> str:
    """Map encoded feature name back to original customer value."""
    # Numeric features — direct match
    direct_features = [
        "tenure", "MonthlyCharges", "TotalCharges", "SeniorCitizen"
    ]
    for feat in direct_features:
        if encoded_name == f"num__{feat}" or encoded_name == feat:
            return str(round(float(original_input.get(feat, 0)), 2))

    # Categorical one-hot — extract base feature name and level
    # Format: "cat__FeatureName_Value"
    if encoded_name.startswith("cat__"):
        parts = encoded_name[5:]  # strip "cat__"
        for col in original_input:
            if parts.startswith(col + "_"):
                return str(original_input.get(col, ""))

    return str(original_input.get(encoded_name, "—"))


def _heuristic_factors(input_df: pd.DataFrame) -> List[Dict[str, Any]]:
    """Fallback heuristic factor scoring when SHAP fails."""
    row = input_df.iloc[0].to_dict()
    factors = []

    checks = [
        ("Contract", row.get("Contract", ""), 0.31 if row.get("Contract") == "Month-to-month" else -0.1),
        ("tenure", str(row.get("tenure", "")), -0.01 * float(row.get("tenure", 12))),
        ("MonthlyCharges", str(row.get("MonthlyCharges", "")), 0.002 * float(row.get("MonthlyCharges", 50))),
        ("InternetService", row.get("InternetService", ""), 0.15 if row.get("InternetService") == "Fiber optic" else 0.0),
        ("TechSupport", row.get("TechSupport", ""), 0.12 if row.get("TechSupport") == "No" else -0.05),
        ("PaymentMethod", row.get("PaymentMethod", ""), 0.10 if row.get("PaymentMethod") == "Electronic check" else 0.0),
        ("OnlineSecurity", row.get("OnlineSecurity", ""), 0.09 if row.get("OnlineSecurity") == "No" else -0.04),
    ]

    for feat, val, impact in checks:
        if impact != 0:
            factors.append({"feature": feat, "value": val, "impact": round(impact, 3)})

    factors.sort(key=lambda x: abs(x["impact"]), reverse=True)
    return factors[:6]


def predict(customer_data: Dict[str, Any]) -> Dict[str, Any]:
    """Run full prediction pipeline for a single customer."""
    pipeline = _load_pipeline()

    input_df = pd.DataFrame([customer_data])

    # Predict
    proba = pipeline.predict_proba(input_df)[0]
    churn_prob = float(proba[1])
    prediction = int(pipeline.predict(input_df)[0])
    risk_level = _risk_level(churn_prob)

    # SHAP / heuristic factors
    top_factors = _get_shap_factors(pipeline, input_df)

    return {
        "prediction": prediction,
        "churn_probability": round(churn_prob, 4),
        "risk_percentage": round(churn_prob * 100, 1),
        "risk_level": risk_level,
        "model_probability": round(churn_prob, 4),
        "top_risk_factors": top_factors,
    }


def get_metrics() -> Dict:
    return _load_metrics()


def get_feature_importance() -> List[Dict[str, Any]]:
    """Return global feature importance from the trained XGBoost model."""
    try:
        pipeline = _load_pipeline()
        classifier = pipeline.named_steps["classifier"]
        preprocessor = pipeline.named_steps["preprocessor"]

        try:
            feature_names = list(preprocessor.get_feature_names_out())
        except Exception:
            feature_names = [f"f{i}" for i in range(len(classifier.feature_importances_))]

        importances = classifier.feature_importances_
        metadata = _load_metadata()
        feature_map = metadata.get("feature_name_map", {})

        items = []
        for fname, imp in zip(feature_names, importances):
            readable = feature_map.get(fname, fname)
            items.append({"feature": readable, "importance": round(float(imp), 4)})

        items.sort(key=lambda x: x["importance"], reverse=True)
        return items[:15]

    except Exception as e:
        logger.error(f"Failed to get feature importance: {e}")
        return []
