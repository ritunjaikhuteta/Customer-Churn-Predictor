"""
ChurnIQ — Model Training Pipeline
Trains an XGBoost classifier on the IBM Telco Customer Churn dataset.
Saves the complete sklearn pipeline + evaluation metrics + feature metadata.

Run: python training/train_model.py
"""
import json
import logging
import os
import sys
import urllib.request
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from xgboost import XGBClassifier

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# ── Paths ──────────────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).parent
BACKEND_DIR = SCRIPT_DIR.parent
DATA_DIR = BACKEND_DIR / "data"
MODELS_DIR = BACKEND_DIR / "models"
DATASET_PATH = DATA_DIR / "WA_Fn-UseC_-Telco-Customer-Churn.csv"

# Public mirror for auto-download if dataset not found
DATASET_URL = (
    "https://raw.githubusercontent.com/IBM/telco-customer-churn-on-icp4d/"
    "master/data/Telco-Customer-Churn.csv"
)

# ── Feature definitions (must match schemas.py exactly) ───────────────
TARGET_COL = "Churn"
DROP_COLS = ["customerID"]

NUMERIC_FEATURES = ["tenure", "MonthlyCharges", "TotalCharges", "SeniorCitizen"]

CATEGORICAL_FEATURES = [
    "gender",
    "Partner",
    "Dependents",
    "PhoneService",
    "MultipleLines",
    "InternetService",
    "OnlineSecurity",
    "OnlineBackup",
    "DeviceProtection",
    "TechSupport",
    "StreamingTV",
    "StreamingMovies",
    "Contract",
    "PaperlessBilling",
    "PaymentMethod",
]

ALL_FEATURES = NUMERIC_FEATURES + CATEGORICAL_FEATURES


def download_dataset() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    logger.info(f"Attempting to download dataset from: {DATASET_URL}")
    try:
        urllib.request.urlretrieve(DATASET_URL, DATASET_PATH)
        logger.info(f"Dataset downloaded to: {DATASET_PATH}")
    except Exception as e:
        logger.error(
            f"Auto-download failed: {e}\n"
            f"Please manually place 'WA_Fn-UseC_-Telco-Customer-Churn.csv' "
            f"in the '{DATA_DIR}' directory.\n"
            f"Download from: https://www.kaggle.com/datasets/blastchar/telco-customer-churn"
        )
        sys.exit(1)


def load_and_clean(path: Path) -> pd.DataFrame:
    logger.info(f"Loading dataset from: {path}")
    df = pd.read_csv(path)
    logger.info(f"Dataset shape: {df.shape}")

    # Drop irrelevant columns
    df.drop(columns=[c for c in DROP_COLS if c in df.columns], inplace=True)

    # Fix TotalCharges: spaces represent new customers (tenure=0), fill with 0
    df["TotalCharges"] = pd.to_numeric(df["TotalCharges"], errors="coerce")
    n_missing = df["TotalCharges"].isna().sum()
    if n_missing:
        logger.info(f"Filling {n_missing} missing TotalCharges with 0 (new customers)")
    df["TotalCharges"] = df["TotalCharges"].fillna(0)

    # Encode target
    df[TARGET_COL] = (df[TARGET_COL] == "Yes").astype(int)
    logger.info(f"Churn distribution:\n{df[TARGET_COL].value_counts()}")

    return df


def build_pipeline(scale_pos_weight: float) -> Pipeline:
    numeric_transformer = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
    ])

    categorical_transformer = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, NUMERIC_FEATURES),
            ("cat", categorical_transformer, CATEGORICAL_FEATURES),
        ],
        remainder="drop",
    )

    classifier = XGBClassifier(
        n_estimators=300,
        learning_rate=0.05,
        max_depth=5,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        eval_metric="logloss",
        scale_pos_weight=scale_pos_weight,
        use_label_encoder=False,
        verbosity=0,
    )

    return Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", classifier),
    ])


def build_feature_name_map(pipeline: Pipeline) -> dict:
    """
    Build a mapping from encoded feature names → readable labels.
    e.g. 'cat__Contract_Month-to-month' → 'Contract: Month-to-month'
    """
    preprocessor = pipeline.named_steps["preprocessor"]
    try:
        encoded_names = list(preprocessor.get_feature_names_out())
    except Exception:
        return {}

    name_map = {}
    for name in encoded_names:
        if name.startswith("num__"):
            readable = name[5:]  # strip "num__"
        elif name.startswith("cat__"):
            parts = name[5:].split("_", 1)
            if len(parts) == 2:
                readable = f"{parts[0]}: {parts[1]}"
            else:
                readable = name[5:]
        else:
            readable = name
        name_map[name] = readable

    return name_map


def evaluate(pipeline: Pipeline, X_test: pd.DataFrame, y_test: pd.Series) -> dict:
    y_pred = pipeline.predict(X_test)
    y_proba = pipeline.predict_proba(X_test)[:, 1]

    cm = confusion_matrix(y_test, y_pred).tolist()
    report = classification_report(y_test, y_pred, output_dict=True)

    metrics = {
        "accuracy": round(accuracy_score(y_test, y_pred), 4),
        "precision": round(precision_score(y_test, y_pred, zero_division=0), 4),
        "recall": round(recall_score(y_test, y_pred, zero_division=0), 4),
        "f1": round(f1_score(y_test, y_pred, zero_division=0), 4),
        "roc_auc": round(roc_auc_score(y_test, y_proba), 4),
        "confusion_matrix": cm,
        "algorithm": "XGBoost Classifier",
        "train_size": 0.8,
        "test_size": 0.2,
        "n_estimators": 300,
    }

    logger.info(
        f"\n{'='*50}\n"
        f"Model Evaluation Results:\n"
        f"  Accuracy:  {metrics['accuracy']}\n"
        f"  Precision: {metrics['precision']}\n"
        f"  Recall:    {metrics['recall']}\n"
        f"  F1 Score:  {metrics['f1']}\n"
        f"  ROC-AUC:   {metrics['roc_auc']}\n"
        f"  Confusion Matrix: {cm}\n"
        f"{'='*50}"
    )
    return metrics


def main():
    # ── Load data ──────────────────────────────────────────────────────
    if not DATASET_PATH.exists():
        logger.warning(f"Dataset not found at '{DATASET_PATH}'")
        download_dataset()

    df = load_and_clean(DATASET_PATH)

    X = df[ALL_FEATURES]
    y = df[TARGET_COL]

    # ── Train/test split ───────────────────────────────────────────────
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    logger.info(f"Train size: {len(X_train)}, Test size: {len(X_test)}")

    # ── Class imbalance ────────────────────────────────────────────────
    n_neg = int((y_train == 0).sum())
    n_pos = int((y_train == 1).sum())
    scale_pos_weight = round(n_neg / n_pos, 2)
    logger.info(f"scale_pos_weight = {scale_pos_weight} (neg={n_neg}, pos={n_pos})")

    # ── Build & train pipeline ─────────────────────────────────────────
    pipeline = build_pipeline(scale_pos_weight)
    logger.info("Training XGBoost pipeline...")
    pipeline.fit(X_train, y_train)
    logger.info("Training complete.")

    # ── Evaluate ───────────────────────────────────────────────────────
    metrics = evaluate(pipeline, X_test, y_test)
    metrics["dataset_rows"] = len(df)
    metrics["feature_count"] = len(ALL_FEATURES)
    metrics["scale_pos_weight"] = scale_pos_weight

    # ── Save artifacts ─────────────────────────────────────────────────
    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    pipeline_path = MODELS_DIR / "churn_pipeline.joblib"
    joblib.dump(pipeline, pipeline_path)
    logger.info(f"Pipeline saved to: {pipeline_path}")

    metrics_path = MODELS_DIR / "model_metrics.json"
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)
    logger.info(f"Metrics saved to: {metrics_path}")

    # Feature metadata for SHAP label mapping
    feature_name_map = build_feature_name_map(pipeline)
    metadata = {
        "numeric_features": NUMERIC_FEATURES,
        "categorical_features": CATEGORICAL_FEATURES,
        "all_features": ALL_FEATURES,
        "feature_name_map": feature_name_map,
        "scale_pos_weight": scale_pos_weight,
    }
    metadata_path = MODELS_DIR / "feature_metadata.json"
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)
    logger.info(f"Feature metadata saved to: {metadata_path}")

    logger.info("✅ Training complete. All artifacts saved.")


if __name__ == "__main__":
    main()
