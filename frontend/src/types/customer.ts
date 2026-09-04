// Canonical customer feature types — must match backend schemas.py exactly

export type Gender = 'Male' | 'Female';
export type YesNo = 'Yes' | 'No';
export type YesNoNone = 'Yes' | 'No' | 'No phone service';
export type YesNoNoInternet = 'Yes' | 'No' | 'No internet service';
export type InternetService = 'DSL' | 'Fiber optic' | 'No';
export type ContractType = 'Month-to-month' | 'One year' | 'Two year';
export type PaymentMethod =
  | 'Electronic check'
  | 'Mailed check'
  | 'Bank transfer (automatic)'
  | 'Credit card (automatic)';

export interface CustomerInput {
  gender: Gender;
  SeniorCitizen: 0 | 1;
  Partner: YesNo;
  Dependents: YesNo;
  tenure: number;
  PhoneService: YesNo;
  MultipleLines: YesNoNone;
  InternetService: InternetService;
  OnlineSecurity: YesNoNoInternet;
  OnlineBackup: YesNoNoInternet;
  DeviceProtection: YesNoNoInternet;
  TechSupport: YesNoNoInternet;
  StreamingTV: YesNoNoInternet;
  StreamingMovies: YesNoNoInternet;
  Contract: ContractType;
  PaperlessBilling: YesNo;
  PaymentMethod: PaymentMethod;
  MonthlyCharges: number;
  TotalCharges: number;
}

export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface RiskFactor {
  feature: string;
  value: string;
  impact: number;
}

export interface PredictionResponse {
  prediction: number;
  churn_probability: number;
  risk_percentage: number;
  risk_level: RiskLevel;
  model_probability: number;
  top_risk_factors: RiskFactor[];
  recommendations: string[];
  retention_insight: string;
}

export interface AnalyticsSummary {
  total_customers: number;
  churn_count: number;
  retention_count: number;
  churn_rate: number;
  retention_rate: number;
  avg_monthly_charges: number;
  avg_tenure: number;
  avg_total_charges: number;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  roc_auc: number;
  confusion_matrix: number[][];
  algorithm: string;
  train_size: number;
  test_size: number;
  n_estimators: number;
  dataset_rows: number;
  feature_count: number;
}

export interface ChurnByCategory {
  contract?: string;
  service?: string;
  method?: string;
  total: number;
  churned: number;
  retained: number;
  churn_rate: number;
}

export interface DistributionItem {
  range: string;
  total: number;
  churned: number;
  retained: number;
}

export interface ChurnDistributionItem {
  label: string;
  value: number;
  color: string;
}

export interface SampleCustomer extends CustomerInput {
  id: string;
  risk_score: number;
  risk_level: RiskLevel;
  churn_actual: string;
  monthly_charges: number;
  internet_service: string;
  payment_method: string;
  contract?: string;
}

export interface FeatureImportanceItem {
  feature: string;
  importance: number;
}
