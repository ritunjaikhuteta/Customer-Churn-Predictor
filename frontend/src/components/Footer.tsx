import React from 'react';
import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';

export const Footer: React.FC = () => (
  <footer className="relative z-10 mt-20 border-t border-white/06 py-12 px-4">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        {/* Brand */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-white" aria-hidden="true" />
            </div>
            <span className="font-bold text-base">
              <span className="gradient-text">Churn</span>
              <span className="text-white">IQ</span>
            </span>
          </div>
          <p className="text-xs text-text-muted italic">Predict. Understand. Retain.</p>
        </div>

        {/* Links */}
        <nav aria-label="Footer navigation">
          <div className="flex flex-wrap gap-6 text-sm text-text-secondary">
            <Link to="/model" className="hover:text-white transition-colors">Model</Link>
            <Link to="/analytics" className="hover:text-white transition-colors">Analytics</Link>
            <Link to="/predict" className="hover:text-white transition-colors">Predictor</Link>
          </div>
        </nav>
      </div>

      <div className="mt-8 pt-6 border-t border-white/04 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-xs text-text-muted">
          Built with XGBoost + FastAPI + React · IBM Telco Dataset
        </p>
        <p className="text-xs text-text-muted">
          ChurnIQ © {new Date().getFullYear()} · AI Retention Intelligence
        </p>
      </div>
    </div>
  </footer>
);
