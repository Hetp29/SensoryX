'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import LoadingOverlay from '@/components/LoadingOverlay';

export default function AnalyzePage() {
  const [symptoms, setSymptoms] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!symptoms.trim()) {
      return;
    }

    setIsLoading(true);

    // Simulate API call - replace with actual API integration
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to results page or show results
      console.log('Analyzing symptoms:', symptoms);
    }, 3000);
  };

  return (
    <>
      <LoadingOverlay isLoading={isLoading} />

      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
        {/* Navigation */}
        <nav className="fixed top-0 z-40 w-full border-b border-indigo-500/20 bg-slate-900/80 backdrop-blur-lg">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <Link href="/" className="group flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600">
                  <span className="text-sm font-bold text-white">S</span>
                </div>
                <span className="bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-xl font-bold text-transparent">
                  SensoryX
                </span>
              </Link>

              <Link
                href="/"
                className="text-sm font-medium text-indigo-300 transition-colors hover:text-white"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="relative flex min-h-screen items-center justify-center px-4 py-24">
          <div className="w-full max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              {/* Header */}
              <div className="mb-12 text-center">
                <motion.div
                  className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-950/50 px-4 py-2 text-sm font-medium text-indigo-300 backdrop-blur-sm"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500"></span>
                  </span>
                  AI-Powered Analysis
                </motion.div>

                <motion.h1
                  className="mb-4 bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl md:text-7xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  Analyze Your Symptoms
                </motion.h1>

                <motion.p
                  className="mx-auto max-w-2xl text-lg text-indigo-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  Describe your symptoms in detail and let our advanced AI provide comprehensive insights
                </motion.p>
              </div>

              {/* Input Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                {/* Textarea */}
                <div className="mb-6">
                  <textarea
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="Describe your symptoms in detail... (e.g., 'I've been experiencing sharp pain in my lower back for the past 3 days, especially when I bend forward...')"
                    className="h-64 w-full resize-none rounded-2xl border border-indigo-500/30 bg-slate-900/50 px-6 py-4 text-lg text-white placeholder-indigo-400/50 backdrop-blur-sm transition-all duration-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    maxLength={2000}
                  />
                  <div className="mt-2 flex justify-between px-2 text-sm text-indigo-400/70">
                    <span>Be as detailed as possible for accurate analysis</span>
                    <span>{symptoms.length}/2000</span>
                  </div>
                </div>

                {/* Analyze Button */}
                <motion.button
                  onClick={handleAnalyze}
                  disabled={!symptoms.trim() || isLoading}
                  className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-5 text-xl font-semibold text-white shadow-2xl shadow-indigo-500/30 transition-all duration-300 hover:shadow-indigo-500/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-indigo-500/30"
                  whileHover={{ scale: symptoms.trim() ? 1.02 : 1 }}
                  whileTap={{ scale: symptoms.trim() ? 0.98 : 1 }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <svg
                      className="h-6 w-6 transition-transform group-hover:rotate-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    Analyze My Symptoms
                  </span>

                  {/* Animated background effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600"
                    initial={{ x: '100%' }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>

                {/* Info Cards */}
                <motion.div
                  className="mt-12 grid gap-4 sm:grid-cols-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                >
                  <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/30 p-4 backdrop-blur-sm">
                    <div className="mb-2 text-3xl">🧠</div>
                    <h3 className="mb-1 font-semibold text-indigo-200">AI-Powered</h3>
                    <p className="text-sm text-indigo-400/70">
                      Advanced neural networks analyze your symptoms
                    </p>
                  </div>

                  <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/30 p-4 backdrop-blur-sm">
                    <div className="mb-2 text-3xl">⚡</div>
                    <h3 className="mb-1 font-semibold text-indigo-200">Instant Results</h3>
                    <p className="text-sm text-indigo-400/70">
                      Get comprehensive analysis in seconds
                    </p>
                  </div>

                  <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/30 p-4 backdrop-blur-sm">
                    <div className="mb-2 text-3xl">🔒</div>
                    <h3 className="mb-1 font-semibold text-indigo-200">Secure & Private</h3>
                    <p className="text-sm text-indigo-400/70">
                      Your data is encrypted and protected
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </main>
      </div>
    </>
  );
}
