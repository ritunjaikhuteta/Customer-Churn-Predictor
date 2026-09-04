"""
ChurnIQ — Analytics Service
Loads the IBM Telco dataset and computes aggregate statistics for the dashboard.
"""
import os
import json
import logging
from functools import lru_cache
from pathlib import Path
from typing import Dict, Any, List

import pandas as pd
import numpy as np

logger = logging.getLogger(__name__)

DATASET_PATH = os.getenv("DATASET_PATH", "data/WA_Fn-UseC_-Telco-Customer-Churn.csv")


@lru_cache(maxsize=1)
def _load_dataset() -> pd.DataFrame:
    """Load and preprocess the Telco dataset once, caching the result."""
    path = Path(DATASET_PATH)
    if not path.exists():
        # Try relative to this file's directory (backend/)
        alt = Path(__file__).parent.parent / "data" / "WA_Fn-UseC_-Telco-Customer-Churn.csv"
        if alt.exists():
            path = alt
        else:
            raise FileNotFoundError(
                f"Dataset not found at '{DATASET_PATH}'. "
                "Please place 'WA_Fn-UseC_-Telco-Customer-Churn.csv' in the backend/data/ directory."
            )

    df = pd.read_csv(path)
    # Clean TotalCharges — contains spaces for new customers
    df["TotalCharges"] = pd.to_numeric(df["TotalCharges"], errors="coerce")
    df["TotalCharges"] = df["TotalCharges"].fillna(0)
    df["Churn_Binary"] = (df["Churn"] == "Yes").astype(int)
    return df


def get_summary() -> Dict[str, Any]:
    df = _load_dataset()
    total = len(df)
    churn_count = int(df["Churn_Binary"].sum())
    retention_count = total - churn_count

    return {
        "total_customers": total,
        "churn_count": churn_count,
        "retention_count": retention_count,
        "churn_rate": round(churn_count / total * 100, 2),
        "retention_rate": round(retention_count / total * 100, 2),
        "avg_monthly_charges": round(float(df["MonthlyCharges"].mean()), 2),
        "avg_tenure": round(float(df["tenure"].mean()), 1),
        "avg_total_charges": round(float(df["TotalCharges"].mean()), 2),
    }


def get_churn_by_contract() -> List[Dict[str, Any]]:
    df = _load_dataset()
    result = []
    for contract, group in df.groupby("Contract"):
        total = len(group)
        churned = int(group["Churn_Binary"].sum())
        result.append({
            "contract": contract,
            "total": total,
            "churned": churned,
            "retained": total - churned,
            "churn_rate": round(churned / total * 100, 1),
        })
    return result


def get_churn_by_internet() -> List[Dict[str, Any]]:
    df = _load_dataset()
    result = []
    for service, group in df.groupby("InternetService"):
        total = len(group)
        churned = int(group["Churn_Binary"].sum())
        result.append({
            "service": service,
            "total": total,
            "churned": churned,
            "retained": total - churned,
            "churn_rate": round(churned / total * 100, 1),
        })
    return result


def get_churn_by_payment() -> List[Dict[str, Any]]:
    df = _load_dataset()
    result = []
    for method, group in df.groupby("PaymentMethod"):
        total = len(group)
        churned = int(group["Churn_Binary"].sum())
        result.append({
            "method": method,
            "total": total,
            "churned": churned,
            "retained": total - churned,
            "churn_rate": round(churned / total * 100, 1),
        })
    # Sort by churn rate descending
    return sorted(result, key=lambda x: x["churn_rate"], reverse=True)


def get_tenure_distribution() -> List[Dict[str, Any]]:
    df = _load_dataset()
    bins = list(range(0, 73, 6))
    labels = [f"{b}-{b+5}" for b in bins[:-1]]
    df["tenure_bin"] = pd.cut(df["tenure"], bins=bins, labels=labels, right=False, include_lowest=True)
    result = []
    for label, group in df.groupby("tenure_bin", observed=True):
        total = len(group)
        churned = int(group["Churn_Binary"].sum())
        result.append({
            "range": str(label),
            "total": total,
            "churned": churned,
            "retained": total - churned,
        })
    return result


def get_monthly_charges_distribution() -> List[Dict[str, Any]]:
    df = _load_dataset()
    bins = list(range(0, 121, 15))
    labels = [f"${b}-${b+14}" for b in bins[:-1]]
    df["charge_bin"] = pd.cut(df["MonthlyCharges"], bins=bins, labels=labels, right=False, include_lowest=True)
    result = []
    for label, group in df.groupby("charge_bin", observed=True):
        total = len(group)
        churned = int(group["Churn_Binary"].sum())
        result.append({
            "range": str(label),
            "total": total,
            "churned": churned,
            "retained": total - churned,
        })
    return result


def get_churn_distribution() -> List[Dict[str, Any]]:
    df = _load_dataset()
    counts = df["Churn"].value_counts()
    return [
        {"label": "Retained", "value": int(counts.get("No", 0)), "color": "#10B981"},
        {"label": "Churned", "value": int(counts.get("Yes", 0)), "color": "#EF4444"},
    ]


def get_sample_customers(n: int = 20) -> List[Dict[str, Any]]:
    """Return n sample customer rows for the demo risk queue."""
    df = _load_dataset()
    # We don't have real prediction scores here, so we use a heuristic proxy
    # (Month-to-month + short tenure + high charges = higher risk proxy)
    df["risk_proxy"] = (
        (df["Contract"] == "Month-to-month").astype(int) * 0.4 +
        (df["tenure"] < 12).astype(int) * 0.3 +
        (df["MonthlyCharges"] > 70).astype(int) * 0.3
    )
    sample = df.nlargest(n * 2, "risk_proxy").sample(n=min(n, len(df)), random_state=42)

    result = []
    for idx, (_, row) in enumerate(sample.iterrows()):
        proxy = float(row["risk_proxy"])
        # Map proxy to rough percentage range
        risk_pct = round(min(95, max(15, proxy * 90 + (row["tenure"] < 6) * 10)), 1)
        if risk_pct >= 61:
            level = "High"
        elif risk_pct >= 31:
            level = "Medium"
        else:
            level = "Low"

        result.append({
            "id": f"CUST-{1000 + idx}",
            "tenure": int(row["tenure"]),
            "contract": row["Contract"],
            "monthly_charges": round(float(row["MonthlyCharges"]), 2),
            "internet_service": row["InternetService"],
            "payment_method": row["PaymentMethod"],
            "risk_score": risk_pct,
            "risk_level": level,
            "churn_actual": row["Churn"],
            # Pass through full customer fields for form population
            "gender": row["gender"],
            "SeniorCitizen": int(row["SeniorCitizen"]),
            "Partner": row["Partner"],
            "Dependents": row["Dependents"],
            "PhoneService": row["PhoneService"],
            "MultipleLines": row["MultipleLines"],
            "InternetService": row["InternetService"],
            "OnlineSecurity": row["OnlineSecurity"],
            "OnlineBackup": row["OnlineBackup"],
            "DeviceProtection": row["DeviceProtection"],
            "TechSupport": row["TechSupport"],
            "StreamingTV": row["StreamingTV"],
            "StreamingMovies": row["StreamingMovies"],
            "Contract": row["Contract"],
            "PaperlessBilling": row["PaperlessBilling"],
            "PaymentMethod": row["PaymentMethod"],
            "MonthlyCharges": round(float(row["MonthlyCharges"]), 2),
            "TotalCharges": round(float(row["TotalCharges"]), 2),
        })

    return sorted(result, key=lambda x: x["risk_score"], reverse=True)
