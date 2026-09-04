import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { Brain, Target, AlertCircle, CheckCircle2, Database, Cpu, GitBranch, BarChart3 } from 'lucide-react';
import { getModelMetrics, getFeatureImportance } from '../services/api';
import type { ModelMetrics, FeatureImportanceItem } from '../types/customer';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass p-3 rounded-xl border border-indigo-500/20 text-xs">
      <p className="font-bold text-white mb-1">{label}</p>
      {payload.map((e: any, i: number) => (
        <p key={i} style={{ color: e.color }} className="font-semibold">
          {e.name}: {typeof e.value === 'number' ? e.value.toFixed(4) : e.value}
        </p>
      ))}
    </div>
  );
};

function MetricBadge({ label, value, color = '#6366F1' }: { label: string; value: number; color?: string }) {
  const pct = Math.round(value * 100);
  return (
    <div className="glass rounded-2xl p-5 text-center space-y-3">
      <div
        className="relative w-20 h-20 mx-auto"
        role="img"
        aria-label={`${label}: ${pct}%`}
      >
        <svg viewBox="0 0 44 44" className="w-full h-full -rotate-90">
          <circle cx="22" cy="22" r="18" stroke="rgba(255,255,255,0.08)" strokeWidth="4" fill="none" />
          <motion.circle
            cx="22" cy="22" r="18"
            stroke={color}
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 18}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 18 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 18 * (1 - value) }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 4px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-extrabold text-white">{pct}%</span>
        </div>
      </div>
      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{label}</p>
    </div>
  );
}

function ConfusionMatrix({ matrix }: { matrix: number[][] }) {
  const [tn, fp, fn, tp] = [matrix[0][0], matrix[0][1], matrix[1][0], matrix[1][1]];
  const total = tn + fp + fn + tp;

  const cells = [
    { label: 'True Negative', value: tn, sublabel: 'Correctly Not Churned', color: '#10B981' },
    { label: 'False Positive', value: fp, sublabel: 'Incorrectly Flagged', color: '#F59E0B' },
    { label: 'False Negative', value: fn, sublabel: 'Missed Churners', color: '#EF4444' },
    { label: 'True Positive', value: tp, sublabel: 'Correctly Predicted Churn', color: '#6366F1' },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-1 text-xs">
        {/* Headers */}
        <div />
        <div className="grid grid-cols-2 gap-1 text-center">
          <div className="text-text-muted py-1">Pred: No</div>
          <div className="text-text-muted py-1">Pred: Yes</div>
        </div>
        {/* Row 1 */}
        <div className="text-text-muted py-1 text-right pr-2 self-center">Actual: No</div>
        <div className="grid grid-cols-2 gap-1">
          <div
            className="rounded-lg p-3 text-center font-bold"
            style={{ background: '#10B98120', border: '1px solid #10B98140', color: '#10B981' }}
          >
            <div className="text-lg">{tn.toLocaleString()}</div>
            <div className="text-xs font-normal text-text-muted">TN</div>
          </div>
          <div
            className="rounded-lg p-3 text-center font-bold"
            style={{ background: '#F59E0B20', border: '1px solid #F59E0B40', color: '#F59E0B' }}
          >
            <div className="text-lg">{fp.toLocaleString()}</div>
            <div className="text-xs font-normal text-text-muted">FP</div>
          </div>
        </div>
        {/* Row 2 */}
        <div className="text-text-muted py-1 text-right pr-2 self-center">Actual: Yes</div>
        <div className="grid grid-cols-2 gap-1">
          <div
            className="rounded-lg p-3 text-center font-bold"
            style={{ background: '#EF444420', border: '1px solid #EF444440', color: '#EF4444' }}
          >
            <div className="text-lg">{fn.toLocaleString()}</div>
            <div className="text-xs font-normal text-text-muted">FN</div>
          </div>
          <div
            className="rounded-lg p-3 text-center font-bold"
            style={{ background: '#6366F120', border: '1px solid #6366F140', color: '#6366F1' }}
          >
            <div className="text-lg">{tp.toLocaleString()}</div>
            <div className="text-xs font-normal text-text-muted">TP</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const PIPELINE_STEPS = [
  { label: 'Customer Data', icon: Database, color: '#22D3EE' },
  { label: 'Preprocessing', icon: GitBranch, color: '#8B5CF6' },
  { label: 'Feature Encoding', icon: Cpu, color: '#6366F1' },
  { label: 'Scaling', icon: BarChart3, color: '#F59E0B' },
  { label: 'XGBoost', icon: Brain, color: '#EF4444' },
  { label: 'Probability', icon: Target, color: '#10B981' },
  { label: 'Risk Intelligence', icon: AlertCircle, color: '#22D3EE' },
];

export const ModelPerformance: React.FC = () => {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [importance, setImportance] = useState<FeatureImportanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [m, imp] = await Promise.all([getModelMetrics(), getFeatureImportance()]);
        setMetrics(m);
        setImportance(imp);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-32 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="glass rounded-2xl p-8 text-center space-y-3">
        <p className="text-red-400 font-semibold">Model metrics unavailable</p>
        <p className="text-text-muted text-sm">{error || 'Run training/train_model.py first.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Overview cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-5 col-span-full lg:col-span-1 space-y-3">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-400" aria-hidden="true" />
            <h3 className="font-bold text-white">Model Overview</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Algorithm</span>
              <span className="font-semibold text-white text-xs">{metrics.algorithm}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Estimators</span>
              <span className="font-semibold text-white">{metrics.n_estimators}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Train / Test</span>
              <span className="font-semibold text-white">{Math.round(metrics.train_size * 100)}% / {Math.round(metrics.test_size * 100)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Dataset Rows</span>
              <span className="font-semibold text-white">{metrics.dataset_rows?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Features</span>
              <span className="font-semibold text-white">{metrics.feature_count}</span>
            </div>
          </div>
        </div>

        {/* Metric badges */}
        <div className="col-span-full lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricBadge label="Accuracy" value={metrics.accuracy} color="#6366F1" />
          <MetricBadge label="Precision" value={metrics.precision} color="#8B5CF6" />
          <MetricBadge label="Recall" value={metrics.recall} color="#22D3EE" />
          <MetricBadge label="F1 Score" value={metrics.f1} color="#10B981" />
        </div>
      </div>

      {/* ROC-AUC badge */}
      <div className="glass rounded-2xl p-5 flex items-center gap-5">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-extrabold shrink-0"
          style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.3)', color: '#22D3EE' }}
        >
          {(metrics.roc_auc * 100).toFixed(0)}%
        </div>
        <div>
          <p className="text-xs text-text-secondary uppercase tracking-widest">ROC-AUC Score</p>
          <p className="text-lg font-bold text-white">{metrics.roc_auc.toFixed(4)}</p>
          <p className="text-xs text-text-muted mt-0.5">
            {metrics.roc_auc >= 0.85 ? '🟢 Excellent' : metrics.roc_auc >= 0.75 ? '🟡 Good' : '🟠 Moderate'} discriminative power
          </p>
        </div>
        {/* Simple ROC curve approximation */}
        <div className="ml-auto hidden sm:block">
          <ResponsiveContainer width={160} height={80}>
            <LineChart
              data={[
                { fpr: 0, tpr: 0 },
                { fpr: 0.05, tpr: 0.45 },
                { fpr: 0.1, tpr: 0.62 },
                { fpr: 0.2, tpr: 0.78 },
                { fpr: 0.35, tpr: 0.88 },
                { fpr: 0.5, tpr: 0.93 },
                { fpr: 0.7, tpr: 0.97 },
                { fpr: 1, tpr: 1 },
              ]}
            >
              <Line type="monotone" dataKey="tpr" stroke="#22D3EE" strokeWidth={2} dot={false} name="ROC" />
              <Line type="monotone" dataKey="fpr" stroke="rgba(255,255,255,0.15)" strokeWidth={1} dot={false} strokeDasharray="3 3" name="Random" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Confusion Matrix */}
      {metrics.confusion_matrix && (
        <div className="glass rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" aria-hidden="true" />
            Confusion Matrix
          </h3>
          <ConfusionMatrix matrix={metrics.confusion_matrix} />
        </div>
      )}

      {/* Feature Importance */}
      {importance.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-violet-400" aria-hidden="true" />
            Global Feature Importance (Top 15)
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={importance.slice(0, 12)}
              layout="vertical"
              margin={{ top: 0, right: 16, left: 140, bottom: 0 }}
            >
              <XAxis type="number" tick={{ fontSize: 10, fill: '#94A3B8' }} />
              <YAxis
                dataKey="feature"
                type="category"
                tick={{ fontSize: 10, fill: '#94A3B8' }}
                width={140}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="importance"
                name="Importance"
                fill="#6366F1"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Pipeline visualization */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-cyan-400" aria-hidden="true" />
          Pipeline Architecture
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          {PIPELINE_STEPS.map(({ label, icon: Icon, color }, i) => (
            <React.Fragment key={label}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: `${color}18`, border: `1px solid ${color}40` }}
                >
                  <Icon className="w-5 h-5" style={{ color }} aria-hidden="true" />
                </div>
                <span className="text-xs text-text-secondary text-center max-w-[70px]">{label}</span>
              </motion.div>
              {i < PIPELINE_STEPS.length - 1 && (
                <div className="text-text-muted text-lg mx-1">→</div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
