"""
ChurnIQ — FastAPI Main Application
REST API for the Customer Churn Predictor.
"""
import logging
import os
from contextlib import asynccontextmanager
from typing import Any, Dict, List

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from schemas import CustomerInput, PredictionResponse, RiskFactor
from services import prediction_service, analytics_service
from services.recommendation_service import generate_recommendations, generate_retention_insight

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

ALLOWED_ORIGINS = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",") if o.strip()]


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: eagerly load model and dataset to surface errors immediately."""
    logger.info("ChurnIQ API starting up...")
    try:
        prediction_service._load_pipeline()
        logger.info("✅ Prediction pipeline loaded.")
    except FileNotFoundError as e:
        logger.warning(f"⚠️  {e}")

    try:
        analytics_service._load_dataset()
        logger.info("✅ Dataset loaded.")
    except FileNotFoundError as e:
        logger.warning(f"⚠️  {e}")

    yield
    logger.info("ChurnIQ API shutting down.")


app = FastAPI(
    title="ChurnIQ API",
    description="AI Customer Retention Intelligence — XGBoost-powered churn prediction",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────────────────────────────────────
# Health & Status
# ──────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "online", "service": "ChurnIQ API", "version": "1.0.0"}


@app.get("/health")
def health():
    pipeline_ok = prediction_service.PIPELINE_PATH.exists()
    dataset_ok = True
    try:
        analytics_service._load_dataset()
    except Exception:
        dataset_ok = False

    return {
        "status": "healthy" if pipeline_ok and dataset_ok else "degraded",
        "pipeline_loaded": pipeline_ok,
        "dataset_loaded": dataset_ok,
    }


# ──────────────────────────────────────────────
# Prediction
# ──────────────────────────────────────────────

@app.post("/predict", response_model=PredictionResponse)
def predict(customer: CustomerInput):
    try:
        customer_dict = customer.model_dump()
        result = prediction_service.predict(customer_dict)

        top_factors = [
            RiskFactor(
                feature=f["feature"],
                value=str(f["value"]),
                impact=f["impact"],
            )
            for f in result["top_risk_factors"]
        ]

        recommendations = generate_recommendations(
            customer_dict,
            result["risk_level"],
            result["churn_probability"],
        )
        insight = generate_retention_insight(
            customer_dict,
            result["risk_level"],
            result["churn_probability"],
            result["top_risk_factors"],
        )

        return PredictionResponse(
            prediction=result["prediction"],
            churn_probability=result["churn_probability"],
            risk_percentage=result["risk_percentage"],
            risk_level=result["risk_level"],
            model_probability=result["model_probability"],
            top_risk_factors=top_factors,
            recommendations=recommendations,
            retention_insight=insight,
        )
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.exception("Prediction failed")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


# ──────────────────────────────────────────────
# Model
# ──────────────────────────────────────────────

@app.get("/model/metrics")
def model_metrics():
    try:
        return prediction_service.get_metrics()
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))


@app.get("/model/feature-importance")
def feature_importance():
    try:
        return prediction_service.get_feature_importance()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ──────────────────────────────────────────────
# Analytics
# ──────────────────────────────────────────────

@app.get("/analytics/summary")
def analytics_summary():
    try:
        return analytics_service.get_summary()
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))


@app.get("/analytics/churn-distribution")
def churn_distribution():
    try:
        return analytics_service.get_churn_distribution()
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))


@app.get("/analytics/contracts")
def contracts():
    try:
        return analytics_service.get_churn_by_contract()
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))


@app.get("/analytics/internet-services")
def internet_services():
    try:
        return analytics_service.get_churn_by_internet()
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))


@app.get("/analytics/payment-methods")
def payment_methods():
    try:
        return analytics_service.get_churn_by_payment()
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))


@app.get("/analytics/tenure-distribution")
def tenure_distribution():
    try:
        return analytics_service.get_tenure_distribution()
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))


@app.get("/analytics/monthly-charges")
def monthly_charges():
    try:
        return analytics_service.get_monthly_charges_distribution()
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))


@app.get("/analytics/customers")
def sample_customers():
    try:
        return analytics_service.get_sample_customers(n=25)
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
