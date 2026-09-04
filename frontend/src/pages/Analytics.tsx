import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard';
import { Footer } from '../components/Footer';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const Analytics: React.FC = () => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration: 0.4 }}
    className="relative z-10"
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      {/* Header */}
      <div className="flex items-start gap-3 mb-12">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0 mt-1">
          <BarChart3 className="w-5 h-5 text-cyan-400" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-2">
            See churn before it becomes{' '}
            <span className="gradient-text">revenue loss.</span>
          </h1>
          <p className="text-text-secondary max-w-2xl">
            Understand the behavioral and commercial patterns driving customer attrition across
            contract types, internet services, payment methods, and account tenure.
          </p>
        </div>
      </div>

      <AnalyticsDashboard />
    </div>

    <div className="section-divider mx-8" />
    <Footer />
  </motion.div>
);
