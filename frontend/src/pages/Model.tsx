import React from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { ModelPerformance } from '../components/ModelPerformance';
import { Footer } from '../components/Footer';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const Model: React.FC = () => (
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
        <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0 mt-1">
          <Brain className="w-5 h-5 text-violet-400" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-2">
            Model{' '}
            <span className="gradient-text">Intelligence</span>
          </h1>
          <p className="text-text-secondary max-w-2xl">
            Evaluate the XGBoost classifier's performance, understand feature contributions,
            and inspect the full preprocessing pipeline.
          </p>
        </div>
      </div>

      <ModelPerformance />
    </div>

    <div className="section-divider mx-8" />
    <Footer />
  </motion.div>
);
