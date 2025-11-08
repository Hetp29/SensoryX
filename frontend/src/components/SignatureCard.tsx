'use client';

import { motion } from 'framer-motion';

interface Condition {
  name: string;
  probability: number;
  description: string;
}

interface SignatureCardProps {
  conditions: Condition[];
}

export default function SignatureCard({ conditions }: SignatureCardProps) {
  return (
    <motion.div
      className="overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-slate-900/90 to-indigo-950/50 backdrop-blur-lg"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {/* Header */}
      <div className="border-b border-indigo-500/20 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600/30">
            <svg className="h-6 w-6 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">AI Analysis</h3>
            <p className="text-sm text-indigo-300">Potential conditions ranked by similarity</p>
          </div>
        </div>
      </div>

      {/* Conditions List */}
      <div className="p-6">
        <div className="space-y-4">
          {conditions.map((condition, index) => (
            <motion.div
              key={index}
              className="group rounded-lg border border-indigo-500/20 bg-slate-900/30 p-4 transition-all hover:border-indigo-500/40 hover:bg-slate-900/50"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-lg font-semibold text-white">{condition.name}</h4>
                <span className="rounded-full bg-indigo-600/30 px-3 py-1 text-sm font-medium text-indigo-200">
                  {condition.probability}%
                </span>
              </div>

              {/* Probability Bar */}
              <div className="mb-3 h-2 overflow-hidden rounded-full bg-slate-800">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${condition.probability}%` }}
                  transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                />
              </div>

              <p className="text-sm text-indigo-300">{condition.description}</p>

              {/* Action Button */}
              <button className="mt-3 text-sm font-medium text-indigo-400 transition-colors hover:text-indigo-300">
                Learn more
              </button>
            </motion.div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="mt-6 rounded-lg bg-amber-950/30 border border-amber-500/30 p-4">
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-amber-200">Medical Disclaimer</p>
              <p className="mt-1 text-xs text-amber-300/80">
                This AI analysis is for informational purposes only and should not replace professional medical advice. Please consult with a healthcare provider for proper diagnosis and treatment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
