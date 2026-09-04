import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import type { RiskFactor } from '../types/customer';

interface RiskFactorsProps {
  factors: RiskFactor[];
}

/** Maps encoded backend feature names to readable labels */
function readableLabel(feature: string): string {
  const map: Record<string, string> = {
    'Contract': 'Contract Type',
    'tenure': 'Customer Tenure',
    'MonthlyCharges': 'Monthly Charges',
    'TotalCharges': 'Total Charges',
    'InternetService': 'Internet Service',
    'TechSupport': 'Tech Support',
    'OnlineSecurity': 'Online Security',
    'PaymentMethod': 'Payment Method',
    'SeniorCitizen': 'Senior Citizen',
    'Partner': 'Has Partner',
    'Dependents': 'Has Dependents',
    'PhoneService': 'Phone Service',
    'MultipleLines': 'Multiple Lines',
    'OnlineBackup': 'Online Backup',
    'DeviceProtection': 'Device Protection',
    'StreamingTV': 'Streaming TV',
    'StreamingMovies': 'Streaming Movies',
    'PaperlessBilling': 'Paperless Billing',
    'gender': 'Gender',
  };
  // Also handle "FeatureName: value" format from backend
  if (feature.includes(':')) {
    const [key] = feature.split(':');
    return map[key.trim()] ? `${map[key.trim()]} — ${feature.split(':')[1].trim()}` : feature;
  }
  return map[feature] || feature;
}

const MAX_BAR = 0.35; // normalise bars relative to this max impact

export const RiskFactors: React.FC<RiskFactorsProps> = ({ factors }) => {
  if (!factors || factors.length === 0) return null;

  const maxAbs = Math.max(...factors.map((f) => Math.abs(f.impact)), 0.01);

  return (
    <div className="space-y-4" role="region" aria-label="Top churn risk factors">
      <div className="flex items-center gap-2 mb-6">
        <AlertTriangle className="w-5 h-5 text-amber-400" aria-hidden="true" />
        <h3 className="text-base font-bold text-white">Top Churn Drivers</h3>
        <span className="ml-auto text-xs text-text-secondary">SHAP Impact</span>
      </div>

      {factors.map((factor, i) => {
        const isChurnDriver = factor.impact > 0;
        const barWidth = Math.min((Math.abs(factor.impact) / maxAbs) * 100, 100);
        const label = readableLabel(factor.feature);
        const color = isChurnDriver ? '#EF4444' : '#10B981';
        const Icon = isChurnDriver ? TrendingUp : TrendingDown;

        return (
          <motion.div
            key={`${factor.feature}-${i}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="space-y-1"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Icon className="w-3 h-3" style={{ color }} aria-hidden="true" />
                <span className="text-text-secondary font-medium">{label}</span>
                {factor.value && factor.value !== '—' && (
                  <span
                    className="px-2 py-0.5 rounded text-xs font-mono"
                    style={{ background: `${color}18`, color }}
                  >
                    {factor.value}
                  </span>
                )}
              </div>
              <span
                className="font-bold font-mono text-xs"
                style={{ color }}
                aria-label={`Impact: ${factor.impact > 0 ? '+' : ''}${factor.impact.toFixed(3)}`}
              >
                {factor.impact > 0 ? '+' : ''}{factor.impact.toFixed(3)}
              </span>
            </div>

            {/* Bar */}
            <div className="relative h-2 bg-white/06 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${barWidth}%` }}
                transition={{ delay: i * 0.1 + 0.3, duration: 0.7, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${color}80, ${color})` }}
              />
            </div>
          </motion.div>
        );
      })}

      {/* Legend */}
      <div className="flex items-center gap-6 pt-2 border-t border-white/06">
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <div className="w-3 h-3 rounded-sm bg-red-500/60" />
          Toward Churn
        </div>
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <div className="w-3 h-3 rounded-sm bg-emerald-500/60" />
          Toward Retention
        </div>
      </div>
    </div>
  );
};
