import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, CheckCircle2, Brain } from 'lucide-react';

interface RecommendationsProps {
  recommendations: string[];
  insight: string;
}

export const Recommendations: React.FC<RecommendationsProps> = ({
  recommendations,
  insight,
}) => {
  return (
    <div className="space-y-6" role="region" aria-label="Retention recommendations">
      {/* AI Retention Insight */}
      {insight && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl border border-indigo-500/20"
          style={{ background: 'rgba(99,102,241,0.06)' }}
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/20 shrink-0">
              <Brain className="w-4 h-4 text-indigo-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">
                AI Retention Insight
              </p>
              <p className="text-sm text-text-secondary leading-relaxed">{insight}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recommended Actions */}
      {recommendations.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-amber-400" aria-hidden="true" />
            <h3 className="text-base font-bold text-white">Recommended Retention Actions</h3>
          </div>
          <ul className="space-y-3" role="list">
            {recommendations.map((rec, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-3 p-3 rounded-xl border border-white/06 hover:border-amber-500/20 transition-colors"
                style={{ background: 'rgba(245,158,11,0.04)' }}
              >
                <CheckCircle2 className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" aria-hidden="true" />
                <span className="text-sm text-text-secondary leading-relaxed">{rec}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
