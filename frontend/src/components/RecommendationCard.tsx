'use client';

import { motion } from 'framer-motion';

interface Recommendation {
  type: 'immediate' | 'consult' | 'lifestyle' | 'monitor';
  title: string;
  description: string;
  icon: string;
}

interface RecommendationCardProps {
  recommendations: Recommendation[];
}

const iconPaths: Record<string, string> = {
  immediate: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  consult: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
  lifestyle: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  monitor: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
};

const typeColors: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  immediate: { bg: 'bg-red-950/30', border: 'border-red-500/30', text: 'text-red-200', badge: 'bg-red-600/30 text-red-200' },
  consult: { bg: 'bg-indigo-950/30', border: 'border-indigo-500/30', text: 'text-indigo-200', badge: 'bg-indigo-600/30 text-indigo-200' },
  lifestyle: { bg: 'bg-green-950/30', border: 'border-green-500/30', text: 'text-green-200', badge: 'bg-green-600/30 text-green-200' },
  monitor: { bg: 'bg-amber-950/30', border: 'border-amber-500/30', text: 'text-amber-200', badge: 'bg-amber-600/30 text-amber-200' },
};

export default function RecommendationCard({ recommendations }: RecommendationCardProps) {
  return (
    <motion.div
      className="overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-slate-900/90 to-indigo-950/50 backdrop-blur-lg"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      {/* Header */}
      <div className="border-b border-indigo-500/20 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600/30">
            <svg className="h-6 w-6 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Recommendations</h3>
            <p className="text-sm text-indigo-300">Personalized next steps based on AI analysis</p>
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="p-6">
        <div className="space-y-4">
          {recommendations.map((rec, index) => {
            const colors = typeColors[rec.type];
            return (
              <motion.div
                key={index}
                className={`rounded-lg border ${colors.border} ${colors.bg} p-4`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${colors.badge}`}>
                    <svg className={`h-5 w-5 ${colors.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPaths[rec.icon] || iconPaths.consult} />
                    </svg>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className={`font-semibold ${colors.text}`}>{rec.title}</h4>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${colors.badge}`}>
                        {rec.type.charAt(0).toUpperCase() + rec.type.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-indigo-300">{rec.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Financial Impact (Capital One Track) */}
        <motion.div
          className="mt-4 rounded-lg border border-green-500/30 bg-green-950/20 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-200">Financial Protection Available</p>
              <p className="mt-1 text-xs text-green-300/80">
                Early detection could save up to $15,000 in medical costs and prevent potential financial hardship.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
