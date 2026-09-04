import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Brain, TrendingDown, Shield, Zap, BarChart3 } from 'lucide-react';

const ThreeScene = lazy(() =>
  import('./ThreeScene').then((m) => ({ default: m.ThreeScene }))
);

const floatingLabels = [
  { label: 'Tenure', x: '75%', y: '20%', delay: 0 },
  { label: 'Contract', x: '80%', y: '40%', delay: 0.3 },
  { label: 'Charges', x: '72%', y: '60%', delay: 0.6 },
  { label: 'Internet', x: '60%', y: '75%', delay: 0.9 },
  { label: 'Support', x: '45%', y: '78%', delay: 1.2 },
  { label: 'Payment', x: '35%', y: '65%', delay: 0.4 },
];

const heroStats = [
  { icon: Brain, label: 'XGBoost Powered', color: 'text-violet-400' },
  { icon: Zap, label: 'Real-Time Predictions', color: 'text-cyan-400' },
  { icon: Shield, label: 'Risk Intelligence', color: 'text-indigo-400' },
  { icon: BarChart3, label: 'Data-Driven Retention', color: 'text-emerald-400' },
];

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    const duration = 2000;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target * 10) / 10);
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target]);

  return <>{count.toFixed(target % 1 !== 0 ? 1 : 0)}{suffix}</>;
}

export const Hero: React.FC = () => {
  return (
    <section
      className="relative min-h-screen flex items-center pt-16"
      aria-label="Hero section"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — copy */}
          <div className="space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-indigo-500/20"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-text-secondary">
                XGBoost · SHAP · FastAPI · React
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.08] tracking-tight"
            >
              Predict churn{' '}
              <span className="gradient-text block">before your</span>
              customers leave.
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-lg text-text-secondary leading-relaxed max-w-xl"
            >
              AI-powered customer retention intelligence that identifies at-risk
              subscribers and helps your team act before revenue disappears.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              <Link to="/predict" className="btn-primary text-base px-8 py-4">
                <TrendingDown className="w-5 h-5" aria-hidden="true" />
                Analyze a Customer
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link to="/model" className="btn-secondary text-base px-8 py-4">
                <BarChart3 className="w-5 h-5" aria-hidden="true" />
                View Model Performance
              </Link>
            </motion.div>

            {/* Stats pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="grid grid-cols-2 gap-3"
            >
              {heroStats.map(({ icon: Icon, label, color }, i) => (
                <div key={label} className="flex items-center gap-2 px-4 py-3 rounded-xl glass border border-white/06">
                  <Icon className={`w-4 h-4 ${color}`} aria-hidden="true" />
                  <span className="text-xs font-medium text-text-secondary">{label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — 3D orb + floating panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="relative h-[520px] hidden lg:block"
          >
            {/* 3D Sphere */}
            <div className="absolute inset-0">
              <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full border border-indigo-500/20 animate-spin-slow" />
                </div>
              }>
                <ThreeScene className="w-full h-full" />
              </Suspense>
            </div>

            {/* Floating label chips */}
            {floatingLabels.map(({ label, x, y, delay }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.85, scale: 1 }}
                transition={{ delay: delay + 0.8, duration: 0.5 }}
                className="absolute px-3 py-1.5 rounded-full glass border border-white/10 text-xs font-medium text-text-secondary backdrop-blur"
                style={{ left: x, top: y }}
                aria-hidden="true"
              >
                {label}
              </motion.div>
            ))}

            {/* Churn probability preview card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="absolute bottom-4 left-4 right-4 glass rounded-2xl p-5 border border-indigo-500/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-secondary uppercase tracking-widest mb-1">Churn Risk</p>
                  <p className="text-4xl font-extrabold gradient-text">
                    <AnimatedCounter target={23.8} suffix="%" />
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-xs text-emerald-400 font-semibold">LOW RISK</span>
                  </div>
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-emerald-500/30 flex items-center justify-center">
                  <Shield className="w-7 h-7 text-emerald-400" aria-hidden="true" />
                </div>
              </div>
              {/* Mini progress bar */}
              <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '23.8%' }}
                  transition={{ delay: 1.5, duration: 1.2, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
