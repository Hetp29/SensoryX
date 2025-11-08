'use client';

import { motion } from 'framer-motion';

interface LoadingOverlayProps {
  isLoading: boolean;
}

export default function LoadingOverlay({ isLoading }: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          {/* Outer rotating ring */}
          <motion.div
            className="h-24 w-24 rounded-full border-4 border-indigo-500/30 border-t-indigo-500"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          {/* Inner pulsing circle */}
          <motion.div
            className="absolute inset-0 m-auto h-16 w-16 rounded-full bg-indigo-500/20"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        {/* Loading text with animated dots */}
        <motion.div
          className="flex items-center gap-2 text-lg font-medium text-white"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span>Analyzing your symptoms</span>
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            ...
          </motion.span>
        </motion.div>

        {/* Progress indicator */}
        <motion.div
          className="h-1 w-64 overflow-hidden rounded-full bg-indigo-950"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>

        <motion.p
          className="text-sm text-indigo-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          AI is processing your sensory data...
        </motion.p>
      </div>
    </motion.div>
  );
}
