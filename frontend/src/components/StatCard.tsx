import React, { useCallback, useRef } from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

/** Premium glass stat card with mouse-tilt interaction */
export const StatCard: React.FC<StatCardProps> = ({
  label, value, subValue, icon, color = '#6366F1', trend, className = ''
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotX = ((y - rect.height / 2) / rect.height) * -6;
    const rotY = ((x - rect.width  / 2) / rect.width)  *  6;
    card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(4px)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
    }
  }, []);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`glass rounded-2xl p-5 tilt-card cursor-default transition-shadow duration-300 hover:shadow-card-hover ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}20`, border: `1px solid ${color}30` }}
        >
          <div style={{ color }}>{icon}</div>
        </div>
        {trend && (
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              trend === 'up'
                ? 'text-emerald-400 bg-emerald-400/10'
                : trend === 'down'
                ? 'text-red-400 bg-red-400/10'
                : 'text-text-secondary bg-white/05'
            }`}
          >
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '—'}
          </span>
        )}
      </div>
      <p className="text-2xl font-extrabold text-white tracking-tight">{value}</p>
      <p className="text-xs font-medium text-text-secondary mt-0.5">{label}</p>
      {subValue && (
        <p className="text-xs text-text-muted mt-1">{subValue}</p>
      )}
    </motion.div>
  );
};
