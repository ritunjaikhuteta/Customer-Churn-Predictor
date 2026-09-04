import React from 'react';
import { motion } from 'framer-motion';
import { Hero } from '../components/Hero';
import { Footer } from '../components/Footer';
import { Link } from 'react-router-dom';
import { BarChart3, Brain, TrendingDown, Users, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: TrendingDown,
    title: 'Churn Prediction',
    desc: 'XGBoost classifier trained on 7,043 Telco customer records delivers per-customer churn probability in real time.',
    color: '#6366F1',
    to: '/predict',
  },
  {
    icon: BarChart3,
    title: 'Aggregate Analytics',
    desc: 'Interactive charts reveal churn patterns by contract, internet service, payment method, and tenure.',
    color: '#22D3EE',
    to: '/analytics',
  },
  {
    icon: Brain,
    title: 'SHAP Explainability',
    desc: 'Per-customer SHAP values identify which features push the model toward or away from predicting churn.',
    color: '#8B5CF6',
    to: '/predict',
  },
  {
    icon: Users,
    title: 'Retention Intelligence',
    desc: 'Deterministic rule-based recommendations provide actionable steps for at-risk customers.',
    color: '#10B981',
    to: '/predict',
  },
];

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const Home: React.FC = () => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration: 0.4 }}
  >
    {/* Hero */}
    <Hero />

    {/* Features section */}
    <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="text-center mb-16">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3"
        >
          Platform Capabilities
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-extrabold text-white"
        >
          Everything you need to{' '}
          <span className="gradient-text">retain customers</span>
        </motion.h2>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map(({ icon: Icon, title, desc, color, to }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-2xl p-6 hover:shadow-card-hover transition-shadow duration-300 group"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: `${color}18`, border: `1px solid ${color}30` }}
            >
              <Icon className="w-5 h-5" style={{ color }} aria-hidden="true" />
            </div>
            <h3 className="text-sm font-bold text-white mb-2">{title}</h3>
            <p className="text-xs text-text-secondary leading-relaxed">{desc}</p>
            <Link
              to={to}
              className="inline-flex items-center gap-1 text-xs font-semibold mt-4 transition-colors group-hover:text-white"
              style={{ color }}
              aria-label={`Go to ${title}`}
            >
              Explore <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </Link>
          </motion.div>
        ))}
      </div>
    </section>

    <div className="section-divider mx-8" />
    <Footer />
  </motion.div>
);
