import React from 'react';
import { motion } from 'framer-motion';
import type { RiskLevel } from '../types/customer';

interface RiskGaugeProps {
  percentage: number;
  riskLevel: RiskLevel;
  size?: number;
}

const RISK_COLORS: Record<RiskLevel, { stroke: string; text: string; glow: string }> = {
  Low:    { stroke: '#10B981', text: 'text-emerald-400', glow: '0 0 30px rgba(16,185,129,0.4)' },
  Medium: { stroke: '#F59E0B', text: 'text-amber-400',   glow: '0 0 30px rgba(245,158,11,0.4)' },
  High:   { stroke: '#EF4444', text: 'text-red-400',     glow: '0 0 30px rgba(239,68,68,0.4)'  },
};

const RISK_LABELS: Record<RiskLevel, string> = {
  Low: 'Safe',
  Medium: 'Moderate',
  High: 'Critical',
};

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  percentage,
  riskLevel,
  size = 220,
}) => {
  const cx = size / 2;
  const cy = size / 2;
  const radius = (size - 36) / 2;

  // Arc goes from 225° to 315° (270° sweep = ¾ circle)
  const startAngle = 225;
  const totalAngle = 270;
  const circumference = (Math.PI * totalAngle / 180) * radius;
  const progress = Math.min(Math.max(percentage, 0), 100) / 100;
  const strokeDash = circumference * progress;

  const polarToXY = (angleDeg: number) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  };

  const arcPath = (start: number, sweep: number) => {
    const s = polarToXY(start);
    const e = polarToXY(start + sweep);
    const large = sweep > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${large} 1 ${e.x} ${e.y}`;
  };

  const colors = RISK_COLORS[riskLevel];
  const trackPath = arcPath(startAngle, totalAngle);

  return (
    <div
      className="flex flex-col items-center"
      role="img"
      aria-label={`Churn risk gauge: ${percentage.toFixed(1)}% — ${riskLevel} risk`}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          aria-hidden="true"
        >
          {/* Track */}
          <path
            d={trackPath}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={10}
            strokeLinecap="round"
          />
          {/* Danger zone gradient definition */}
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#10B981" />
              <stop offset="45%"  stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
          </defs>
          {/* Value arc */}
          <motion.path
            d={trackPath}
            fill="none"
            stroke={colors.stroke}
            strokeWidth={10}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: progress }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 6px ${colors.stroke})` }}
          />

          {/* Zone markers */}
          {[0, 30, 60, 100].map((val) => {
            const angle = startAngle + (val / 100) * totalAngle;
            const inner = polarToXY(angle);
            const outerR = radius + 8;
            const outer = {
              x: cx + outerR * Math.cos(((angle - 90) * Math.PI) / 180),
              y: cy + outerR * Math.sin(((angle - 90) * Math.PI) / 180),
            };
            return (
              <line
                key={val}
                x1={inner.x} y1={inner.y}
                x2={outer.x} y2={outer.y}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth={1}
              />
            );
          })}

          {/* Zone text labels */}
          {[
            { val: 15, text: 'Safe' },
            { val: 45, text: 'Moderate' },
            { val: 80, text: 'Critical' },
          ].map(({ val, text }) => {
            const angle = startAngle + (val / 100) * totalAngle;
            const r2 = radius + 22;
            const pos = {
              x: cx + r2 * Math.cos(((angle - 90) * Math.PI) / 180),
              y: cy + r2 * Math.sin(((angle - 90) * Math.PI) / 180),
            };
            return (
              <text
                key={text}
                x={pos.x} y={pos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="rgba(148,163,184,0.7)"
                fontSize={8}
                fontFamily="Inter, sans-serif"
              >
                {text}
              </text>
            );
          })}
        </svg>

        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.p
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className={`text-5xl font-extrabold ${colors.text}`}
            style={{ textShadow: colors.glow }}
          >
            {percentage.toFixed(1)}%
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className={`text-sm font-bold uppercase tracking-widest mt-1 ${colors.text}`}
          >
            {RISK_LABELS[riskLevel]}
          </motion.p>
        </div>
      </div>

      {/* Risk level badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className={`mt-2 px-6 py-2 rounded-full text-sm font-bold border risk-bg-${riskLevel.toLowerCase()}`}
        style={{ color: colors.stroke }}
      >
        {riskLevel.toUpperCase()} RISK
      </motion.div>
    </div>
  );
};
