import type {
  CustomerInput,
  PredictionResponse,
  AnalyticsSummary,
  ModelMetrics,
  ChurnByCategory,
  DistributionItem,
  ChurnDistributionItem,
  SampleCustomer,
  FeatureImportanceItem,
} from '../types/customer';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function fetchJSON<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      detail = err.detail || detail;
    } catch {}
    throw new Error(detail);
  }

  return res.json() as Promise<T>;
}

// ── Prediction ─────────────────────────────────────────────────────────
export async function predict(customer: CustomerInput): Promise<PredictionResponse> {
  return fetchJSON<PredictionResponse>('/predict', {
    method: 'POST',
    body: JSON.stringify(customer),
  });
}

// ── Analytics ─────────────────────────────────────────────────────────
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  return fetchJSON<AnalyticsSummary>('/analytics/summary');
}

export async function getChurnDistribution(): Promise<ChurnDistributionItem[]> {
  return fetchJSON<ChurnDistributionItem[]>('/analytics/churn-distribution');
}

export async function getChurnByContract(): Promise<ChurnByCategory[]> {
  return fetchJSON<ChurnByCategory[]>('/analytics/contracts');
}

export async function getChurnByInternet(): Promise<ChurnByCategory[]> {
  return fetchJSON<ChurnByCategory[]>('/analytics/internet-services');
}

export async function getChurnByPayment(): Promise<ChurnByCategory[]> {
  return fetchJSON<ChurnByCategory[]>('/analytics/payment-methods');
}

export async function getTenureDistribution(): Promise<DistributionItem[]> {
  return fetchJSON<DistributionItem[]>('/analytics/tenure-distribution');
}

export async function getMonthlyChargesDistribution(): Promise<DistributionItem[]> {
  return fetchJSON<DistributionItem[]>('/analytics/monthly-charges');
}

export async function getSampleCustomers(): Promise<SampleCustomer[]> {
  return fetchJSON<SampleCustomer[]>('/analytics/customers');
}

// ── Model ──────────────────────────────────────────────────────────────
export async function getModelMetrics(): Promise<ModelMetrics> {
  return fetchJSON<ModelMetrics>('/model/metrics');
}

export async function getFeatureImportance(): Promise<FeatureImportanceItem[]> {
  return fetchJSON<FeatureImportanceItem[]>('/model/feature-importance');
}

// ── Health ─────────────────────────────────────────────────────────────
export async function checkHealth(): Promise<{ status: string; pipeline_loaded: boolean; dataset_loaded: boolean }> {
  return fetchJSON('/health');
}
