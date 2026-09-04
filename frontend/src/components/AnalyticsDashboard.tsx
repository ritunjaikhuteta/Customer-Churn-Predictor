import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import { Users, TrendingDown, DollarSign, Clock, BarChart3, PieChartIcon } from 'lucide-react';
import {
  getAnalyticsSummary, getChurnByContract, getChurnByInternet,
  getChurnByPayment, getTenureDistribution, getChurnDistribution,
  getMonthlyChargesDistribution
} from '../services/api';
import { StatCard } from './StatCard';
import type {
  AnalyticsSummary, ChurnByCategory, DistributionItem, ChurnDistributionItem
} from '../types/customer';

const COLORS = {
  churned: '#EF4444',
  retained: '#10B981',
  indigo: '#6366F1',
  violet: '#8B5CF6',
  cyan: '#22D3EE',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass p-3 rounded-xl border border-indigo-500/20 text-xs space-y-1">
      <p className="font-bold text-white mb-2">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-text-secondary capitalize">{entry.name}:</span>
          <span className="font-semibold text-white">
            {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export const AnalyticsDashboard: React.FC = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [contracts, setContracts] = useState<ChurnByCategory[]>([]);
  const [internet, setInternet] = useState<ChurnByCategory[]>([]);
  const [payments, setPayments] = useState<ChurnByCategory[]>([]);
  const [tenure, setTenure] = useState<DistributionItem[]>([]);
  const [churnDist, setChurnDist] = useState<ChurnDistributionItem[]>([]);
  const [monthly, setMonthly] = useState<DistributionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, c, i, p, t, d, m] = await Promise.all([
          getAnalyticsSummary(),
          getChurnByContract(),
          getChurnByInternet(),
          getChurnByPayment(),
          getTenureDistribution(),
          getChurnDistribution(),
          getMonthlyChargesDistribution(),
        ]);
        setSummary(s);
        setContracts(c);
        setInternet(i);
        setPayments(p);
        setTenure(t);
        setChurnDist(d);
        setMonthly(m);
      } catch (e: any) {
        setError(e.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-64 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass rounded-2xl p-8 text-center space-y-3">
        <p className="text-red-400 font-semibold">Failed to load analytics</p>
        <p className="text-text-muted text-sm">{error}</p>
        <p className="text-text-muted text-xs">Ensure the backend is running and the dataset is available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Customers"
            value={summary.total_customers.toLocaleString()}
            icon={<Users className="w-5 h-5" />}
            color="#6366F1"
          />
          <StatCard
            label="Churn Rate"
            value={`${summary.churn_rate.toFixed(1)}%`}
            subValue={`${summary.churn_count.toLocaleString()} churned`}
            icon={<TrendingDown className="w-5 h-5" />}
            color="#EF4444"
            trend="down"
          />
          <StatCard
            label="Avg Monthly Charges"
            value={`$${summary.avg_monthly_charges.toFixed(0)}`}
            icon={<DollarSign className="w-5 h-5" />}
            color="#F59E0B"
          />
          <StatCard
            label="Avg Tenure"
            value={`${summary.avg_tenure.toFixed(0)} mo`}
            icon={<Clock className="w-5 h-5" />}
            color="#10B981"
          />
        </div>
      )}

      {/* Charts row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Churn Distribution donut */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <PieChartIcon className="w-4 h-4 text-indigo-400" aria-hidden="true" />
            <h3 className="text-sm font-bold text-white">Churn Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={churnDist}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
                animationBegin={0}
                animationDuration={1000}
              >
                {churnDist.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span style={{ color: '#94A3B8', fontSize: '12px' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Churn by Contract */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-4 h-4 text-violet-400" aria-hidden="true" />
            <h3 className="text-sm font-bold text-white">Churn by Contract</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={contracts} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="contract" tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="churned" name="Churned" fill={COLORS.churned} radius={[4,4,0,0]} />
              <Bar dataKey="retained" name="Retained" fill={COLORS.retained} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Charts row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Churn by Internet Service */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="text-sm font-bold text-white mb-6">Churn by Internet Service</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={internet} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <YAxis dataKey="service" type="category" tick={{ fontSize: 11, fill: '#94A3B8' }} width={70} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="churn_rate" name="Churn Rate %" fill={COLORS.indigo} radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Payment Method Risk */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="text-sm font-bold text-white mb-6">Payment Method Risk</h3>
          <div className="space-y-3">
            {payments.map((p, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary truncate max-w-[70%]">{p.method}</span>
                  <span className="font-bold text-white">{p.churn_rate.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-white/06 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${p.churn_rate}%` }}
                    transition={{ delay: i * 0.1 + 0.5, duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${COLORS.indigo}, ${COLORS.violet})` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Charts row 3 — Tenure & Monthly Charges */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="text-sm font-bold text-white mb-6">Tenure vs Churn</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={tenure} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tenureGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.indigo} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.indigo} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#94A3B8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="churned" name="Churned" stroke={COLORS.indigo} fill="url(#tenureGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="retained" name="Retained" stroke={COLORS.retained} fill="none" strokeWidth={2} strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="text-sm font-bold text-white mb-6">Monthly Charges Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthly} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="range" tick={{ fontSize: 9, fill: '#94A3B8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="churned" name="Churned" fill={COLORS.churned} radius={[4,4,0,0]} />
              <Bar dataKey="retained" name="Retained" fill={COLORS.retained} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
};
