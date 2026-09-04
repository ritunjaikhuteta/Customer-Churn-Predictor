"""
ChurnIQ — Pydantic Schemas
Canonical customer feature schema shared between training and inference.
"""
from typing import Literal, List, Optional
from pydantic import BaseModel, Field, field_validator


class CustomerInput(BaseModel):
    gender: Literal["Male", "Female"]
    SeniorCitizen: Literal[0, 1]
    Partner: Literal["Yes", "No"]
    Dependents: Literal["Yes", "No"]
    tenure: int = Field(..., ge=0, le=100, description="Months subscribed (0-100)")
    PhoneService: Literal["Yes", "No"]
    MultipleLines: Literal["Yes", "No", "No phone service"]
    InternetService: Literal["DSL", "Fiber optic", "No"]
    OnlineSecurity: Literal["Yes", "No", "No internet service"]
    OnlineBackup: Literal["Yes", "No", "No internet service"]
    DeviceProtection: Literal["Yes", "No", "No internet service"]
    TechSupport: Literal["Yes", "No", "No internet service"]
    StreamingTV: Literal["Yes", "No", "No internet service"]
    StreamingMovies: Literal["Yes", "No", "No internet service"]
    Contract: Literal["Month-to-month", "One year", "Two year"]
    PaperlessBilling: Literal["Yes", "No"]
    PaymentMethod: Literal[
        "Electronic check",
        "Mailed check",
        "Bank transfer (automatic)",
        "Credit card (automatic)",
    ]
    MonthlyCharges: float = Field(..., ge=0, description="Monthly bill amount")
    TotalCharges: float = Field(..., ge=0, description="Total billed to date")

    @field_validator("tenure")
    @classmethod
    def tenure_non_negative(cls, v: int) -> int:
        if v < 0:
            raise ValueError("tenure must be >= 0")
        return v


class RiskFactor(BaseModel):
    feature: str
    value: str
    impact: float


class PredictionResponse(BaseModel):
    model_config = {"protected_namespaces": ()}

    prediction: int
    churn_probability: float
    risk_percentage: float
    risk_level: Literal["Low", "Medium", "High"]
    model_probability: float  # labelled accurately, not "confidence"
    top_risk_factors: List[RiskFactor]
    recommendations: List[str]
    retention_insight: str


class AnalyticsSummary(BaseModel):
    total_customers: int
    churn_count: int
    retention_count: int
    churn_rate: float
    retention_rate: float
    avg_monthly_charges: float
    avg_tenure: float
    avg_total_charges: float


class ModelMetrics(BaseModel):
    accuracy: float
    precision: float
    recall: float
    f1: float
    roc_auc: float
    confusion_matrix: List[List[int]]
    algorithm: str
    train_size: float
    test_size: float
    n_estimators: int
    dataset_rows: int
    feature_count: int
