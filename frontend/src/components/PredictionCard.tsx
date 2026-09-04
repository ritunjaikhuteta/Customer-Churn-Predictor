import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Clock, DollarSign, Wifi, CreditCard, FileText,
  AlertCircle, CheckCircle2, Activity
} from 'lucide-react';
import { RiskGauge } from './RiskGauge';
import { RiskFactors } from './RiskFactors';
import { Recommendations } from './Recommendations';
import type { PredictionResponse, CustomerInput, RiskLevel } from '../types/customer';

interface PredictionCardProps {
  result: PredictionResponse | null;
  customer: CustomerInput | null;
  isLoading: boolean;
  loadingStep: string;
}

const LOADING_STEPS = [
  'Processing customer profile...',
  'Analyzing behavior patterns...',
  'Running XGBoost model...',
  'Calculating churn probability...',
  'Generating retention insights...',
];

const RISK_MESSAGES: Record<RiskLevel, { msg: string; color: string }> = {
  Low:    { msg: 'Customer appears relatively stable.', color: 'text-emerald-400' },
  Medium: { msg: 'Customer shows several churn indicators.', color: 'text-amber-400' },
  High:   { msg: 'Customer requires retention attention.', color: 'text-red-400' },
};

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-white/06 last:border-0">
      <div className="text-text-secondary w-4 h-4 shrink-0">{icon}</div>
      <span className="text-xs text-text-secondary flex-1">{label}</span>
      <span className="text-xs font-semibold text-white">{value}</span>
    </div>
  );
}

export const PredictionCard: React.FC<PredictionCardProps> = ({
  result, customer, isLoading, loadingStep
}) => {
  // Empty state
  if (!result && !isLoading) {
    return (
      <div className="glass rounded-2xl p-8 flex flex-col items-center justify-center min-h-[500px] text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
          <Activity className="w-8 h-8 text-indigo-400" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-bold text-white">No Prediction Yet</h3>
        <p className="text-sm text-text-secondary max-w-xs">
          Fill in the customer details on the left and click{' '}
          <strong className="text-white">Run Churn Analysis</strong> to see results.
        </p>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="glass rounded-2xl p-8 flex flex-col items-center justify-center min-h-[500px] space-y-6">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping" />
          <div className="absolute inset-2 rounded-full border-4 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <Activity className="absolute inset-0 m-auto w-8 h-8 text-indigo-400" aria-hidden="true" />
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={loadingStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm font-medium text-text-secondary text-center"
          >
            {loadingStep}
          </motion.p>
        </AnimatePresence>
        {/* Skeleton bars */}
        <div className="w-full space-y-3 mt-4">
          {[80, 60, 70, 50].map((w, i) => (
            <div key={i} className="skeleton h-4 rounded" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (!result) return null;

  const riskMsg = RISK_MESSAGES[result.risk_level];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`space-y-6`}
      role="region"
      aria-label="Prediction results"
      aria-live="polite"
    >
      {/* ── Main result card ──────────────────────────────────────────── */}
      <div
        className={`glass rounded-2xl p-6 border glow-${result.risk_level.toLowerCase()} risk-bg-${result.risk_level.toLowerCase()}`}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          {result.risk_level === 'High' ? (
            <AlertCircle className="w-5 h-5 text-red-400" aria-hidden="true" />
          ) : result.risk_level === 'Medium' ? (
            <AlertCircle className="w-5 h-5 text-amber-400" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" aria-hidden="true" />
          )}
          <h2 className="text-base font-bold text-white">Churn Risk Analysis</h2>
          <div className="ml-auto text-xs text-text-muted">
            Model prob: {(result.model_probability * 100).toFixed(1)}%
          </div>
        </div>

        {/* Gauge */}
        <div className="flex justify-center mb-4">
          <RiskGauge
            percentage={result.risk_percentage}
            riskLevel={result.risk_level}
            size={200}
          />
        </div>

        {/* Risk message */}
        <p className={`text-center text-sm font-medium ${riskMsg.color}`}>
          {riskMsg.msg}
        </p>
      </div>

      {/* ── Customer Profile Summary ──────────────────────────────────── */}
      {customer && (
        <div className="glass rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-400" aria-hidden="true" />
            Customer Risk Profile
          </h3>
          <InfoRow icon={<Clock className="w-4 h-4" />} label="Tenure" value={`${customer.tenure} months`} />
          <InfoRow icon={<FileText className="w-4 h-4" />} label="Contract" value={customer.Contract} />
          <InfoRow icon={<DollarSign className="w-4 h-4" />} label="Monthly Charges" value={`$${customer.MonthlyCharges.toFixed(2)}`} />
          <InfoRow icon={<Wifi className="w-4 h-4" />} label="Internet" value={customer.InternetService} />
          <InfoRow icon={<CreditCard className="w-4 h-4" />} label="Payment" value={customer.PaymentMethod} />
          <InfoRow icon={<AlertCircle className="w-4 h-4" />} label="Predicted Risk" value={result.risk_level} />
        </div>
      )}

      {/* ── Risk Factors ─────────────────────────────────────────────── */}
      {result.top_risk_factors.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <RiskFactors factors={result.top_risk_factors} />
        </div>
      )}

      {/* ── Recommendations ──────────────────────────────────────────── */}
      {(result.recommendations.length > 0 || result.retention_insight) && (
        <div className="glass rounded-2xl p-6">
          <Recommendations
            recommendations={result.recommendations}
            insight={result.retention_insight}
          />
        </div>
      )}
    </motion.div>
  );
};

