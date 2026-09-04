# ChurnIQ — AI Customer Retention Intelligence
## A production-grade customer churn prediction platform

---

## Overview

ChurnIQ is a full-stack AI analytics platform that predicts the probability that a telecom customer will churn based on their subscription, billing, and service usage data. It is built with a Python/FastAPI backend (XGBoost ML pipeline) and a premium React/TypeScript frontend.

## Features

- **Real-time Churn Prediction** — XGBoost classifier via `predict_proba()`
- **SHAP Explainability** — Per-customer feature contribution bars
- **Aggregate Analytics** — Recharts visualizations across contract, internet, payment, and tenure segments
- **Model Performance Dashboard** — Accuracy, Precision, Recall, F1, ROC-AUC, Confusion Matrix, Feature Importance
- **Retention Recommendations** — Deterministic rule-based actionable suggestions
- **Customer Risk Queue** — Filterable/sortable table with click-to-analyze rows
- **Premium 3D UI** — React Three Fiber particle sphere, glassmorphism, Framer Motion animations

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| ML | Python, XGBoost, scikit-learn, SHAP, Pandas, NumPy |
| Backend | FastAPI, Pydantic, Uvicorn, Joblib |
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| Animations | Framer Motion, React Three Fiber |
| Charts | Recharts |

## Architecture

```
customer-churn-predictor/
├── backend/
│   ├── main.py                  # FastAPI app, all routes
│   ├── schemas.py               # Pydantic models (CustomerInput, PredictionResponse)
│   ├── requirements.txt
│   ├── .env.example
│   ├── services/
│   │   ├── prediction_service.py    # Pipeline loading, SHAP, inference
│   │   ├── analytics_service.py     # Dataset statistics
│   │   └── recommendation_service.py # Rule-based retention recommendations
│   ├── training/
│   │   └── train_model.py       # Full ML training pipeline
│   ├── models/                  # Generated after training
│   │   ├── churn_pipeline.joblib
│   │   ├── model_metrics.json
│   │   └── feature_metadata.json
│   └── data/
│       └── WA_Fn-UseC_-Telco-Customer-Churn.csv  # IBM Telco dataset
└── frontend/
    ├── src/
    │   ├── components/          # All UI components
    │   ├── pages/               # Home, Predictor, Analytics, Model
    │   ├── services/api.ts      # Typed API client
    │   └── types/customer.ts    # Shared TypeScript types
    ├── package.json
    └── vite.config.ts
```

## Dataset

**IBM Telco Customer Churn** — 7,043 rows, 21 columns  
Target: `Churn` (Yes/No → 0/1)  
Download: https://www.kaggle.com/datasets/blastchar/telco-customer-churn

Place the CSV at `backend/data/WA_Fn-UseC_-Telco-Customer-Churn.csv`

The training script will attempt to auto-download if not found.

## Installation

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy env file
cp .env.example .env
```

### Train the Model

```bash
# From backend/ directory
python training/train_model.py
```

This will:
1. Load / auto-download the Telco dataset
2. Train the XGBoost pipeline
3. Evaluate and print metrics
4. Save `models/churn_pipeline.joblib`, `models/model_metrics.json`, `models/feature_metadata.json`

### Start Backend

```bash
# From backend/ directory
uvicorn main:app --reload
```

API available at: http://localhost:8000  
Swagger docs: http://localhost:8000/docs

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy env file
cp .env.example .env

# Start dev server
npm run dev
```

Frontend available at: http://localhost:5173

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Status check |
| GET | `/health` | Pipeline + dataset health |
| POST | `/predict` | Run churn prediction |
| GET | `/model/metrics` | Model evaluation metrics |
| GET | `/model/feature-importance` | Global feature importance |
| GET | `/analytics/summary` | Aggregate KPIs |
| GET | `/analytics/churn-distribution` | Churn vs Retained counts |
| GET | `/analytics/contracts` | Churn by contract type |
| GET | `/analytics/internet-services` | Churn by internet service |
| GET | `/analytics/payment-methods` | Churn by payment method |
| GET | `/analytics/tenure-distribution` | Churn by tenure range |
| GET | `/analytics/monthly-charges` | Churn by monthly charge range |
| GET | `/analytics/customers` | Sample customer risk queue |

## Environment Variables

**Backend** (`.env`):
```
ALLOWED_ORIGINS=http://localhost:5173
DATASET_PATH=data/WA_Fn-UseC_-Telco-Customer-Churn.csv
```

**Frontend** (`.env`):
```
VITE_API_URL=http://localhost:8000
```

## ML Pipeline Details

The training pipeline is a single `sklearn.pipeline.Pipeline`:
```
ColumnTransformer (numeric: impute+scale, categorical: impute+one-hot)
   └── XGBClassifier (n_estimators=300, lr=0.05, max_depth=5)
```

This ensures **identical preprocessing at training and inference time** — no risk of feature mismatch.

## Future Improvements

- [ ] Model calibration (Platt scaling) for better probability estimates
- [ ] Batch prediction endpoint for CSV upload
- [ ] Customer segmentation clustering
- [ ] Email/Slack alert integration for high-risk customers
- [ ] A/B test outcome tracking for retention campaigns
- [ ] Multi-model comparison (LightGBM, CatBoost, Random Forest)
- [ ] Docker + docker-compose setup
- [ ] Authentication layer for multi-user enterprise deployment

---

*Built with XGBoost + FastAPI + React*
