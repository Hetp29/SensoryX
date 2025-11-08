'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LoadingOverlay from '@/components/LoadingOverlay';
import dynamic from 'next/dynamic';

// Dynamically import the 3D canvas to avoid SSR issues
const AnalyzeCanvas = dynamic(() => import('@/components/AnalyzeCanvas'), {
  ssr: false,
  loading: () => null,
});

const exampleSymptoms = [
  "Sharp pain in my lower back when bending forward...",
  "Persistent headache on the left side with sensitivity to light...",
  "Tingling sensation in my fingertips that comes and goes...",
  "Dull ache in my knee that worsens after exercise...",
  "Burning feeling in my chest after eating certain foods...",
];

export default function AnalyzePage() {
  const [symptoms, setSymptoms] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentExample, setCurrentExample] = useState(0);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const router = useRouter();

  // Cycle through example symptoms
  useEffect(() => {
    if (symptoms.trim()) {
      setShowPlaceholder(false);
      return;
    }
    setShowPlaceholder(true);
    const interval = setInterval(() => {
      setCurrentExample((prev) => (prev + 1) % exampleSymptoms.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [symptoms]);

  const handleAnalyze = async () => {
    if (!symptoms.trim()) {
      return;
    }

    setIsLoading(true);

    // Simulate API call - replace with actual API integration
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to results page with symptoms
      router.push(`/result?symptoms=${encodeURIComponent(symptoms)}`);
    }, 3000);
  };

  const wordCount = symptoms.trim().split(/\s+/).filter(Boolean).length;
  const charCount = symptoms.length;
  const quality = charCount > 100 ? 'Excellent' : charCount > 50 ? 'Good' : charCount > 20 ? 'Fair' : 'Add more details';

  return (
    <>
      <LoadingOverlay isLoading={isLoading} />

      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
        {/* 3D Background Canvas */}
        <AnalyzeCanvas />

        {/* Decorative Background Elements */}
        <div className="pointer-events-none absolute inset-0">
          {/* Gradient Orbs */}
          <div className="absolute left-1/4 top-20 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl"></div>
          <div className="absolute right-1/4 bottom-20 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl"></div>

          {/* Floating Particles */}
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute h-1 w-1 rounded-full bg-indigo-400/30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

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
          <div className="w-full max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              {/* Header */}
              <div className="mb-12 text-center">
                <motion.div
                  className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-950/50 px-5 py-2.5 text-sm font-medium text-indigo-300 shadow-lg shadow-indigo-500/10 backdrop-blur-sm"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500"></span>
                  </span>
                  AI-Powered Symptom Analysis
                </motion.div>

                <motion.h1
                  className="mb-6 bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl md:text-7xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  Share Your Experience
                </motion.h1>

                <motion.p
                  className="mx-auto max-w-2xl text-lg text-indigo-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  Describe your symptoms in detail. Our AI will analyze your experience and find others who felt the same way.
                </motion.p>
              </div>

              {/* Input Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                {/* Helpful Tips Section */}
                <div className="mb-6 grid gap-3 sm:grid-cols-3">
                  <motion.div
                    className="rounded-xl border border-indigo-500/20 bg-indigo-950/30 p-4 backdrop-blur-sm"
                    whileHover={{ scale: 1.02, borderColor: 'rgba(99, 102, 241, 0.4)' }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h4 className="font-semibold text-indigo-200">Duration</h4>
                    </div>
                    <p className="text-xs text-indigo-400/70">How long have you had these symptoms?</p>
                  </motion.div>

                  <motion.div
                    className="rounded-xl border border-indigo-500/20 bg-indigo-950/30 p-4 backdrop-blur-sm"
                    whileHover={{ scale: 1.02, borderColor: 'rgba(99, 102, 241, 0.4)' }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <h4 className="font-semibold text-indigo-200">Intensity</h4>
                    </div>
                    <p className="text-xs text-indigo-400/70">Describe the severity and patterns</p>
                  </motion.div>

                  <motion.div
                    className="rounded-xl border border-indigo-500/20 bg-indigo-950/30 p-4 backdrop-blur-sm"
                    whileHover={{ scale: 1.02, borderColor: 'rgba(99, 102, 241, 0.4)' }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <h4 className="font-semibold text-indigo-200">Location</h4>
                    </div>
                    <p className="text-xs text-indigo-400/70">Where exactly do you feel it?</p>
                  </motion.div>
                </div>

                {/* Enhanced Textarea */}
                <div className="relative mb-6">
                  <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-slate-900/70 to-indigo-950/50 backdrop-blur-sm transition-all duration-300 focus-within:border-indigo-500 focus-within:shadow-lg focus-within:shadow-indigo-500/20">
                    <textarea
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      placeholder={showPlaceholder ? exampleSymptoms[currentExample] : ''}
                      className="h-80 w-full resize-none bg-transparent px-6 py-5 text-lg text-white placeholder-indigo-400/40 focus:outline-none"
                      maxLength={2000}
                    />

                    {/* Quality Indicator */}
                    {symptoms.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute right-4 top-4"
                      >
                        <div className={`rounded-full px-3 py-1 text-xs font-medium ${
                          charCount > 100 ? 'bg-green-600/30 text-green-200' :
                          charCount > 50 ? 'bg-indigo-600/30 text-indigo-200' :
                          charCount > 20 ? 'bg-amber-600/30 text-amber-200' :
                          'bg-slate-600/30 text-slate-300'
                        }`}>
                          {quality}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between px-2 text-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-indigo-400/70">
                        <svg className="mr-1 inline h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Be as detailed as possible
                      </span>
                      {wordCount > 0 && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-indigo-300"
                        >
                          {wordCount} words
                        </motion.span>
                      )}
                    </div>
                    <span className={`font-medium ${
                      symptoms.length > 1800 ? 'text-amber-400' : 'text-indigo-400/70'
                    }`}>
                      {symptoms.length}/2000
                    </span>
                  </div>
                </div>

                {/* Enhanced Analyze Button */}
                <motion.button
                  onClick={handleAnalyze}
                  disabled={!symptoms.trim() || isLoading}
                  className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-size-200 px-8 py-6 text-xl font-bold text-white shadow-2xl shadow-indigo-500/40 transition-all duration-500 hover:bg-pos-100 hover:shadow-indigo-500/60 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-indigo-500/40"
                  style={{ backgroundSize: '200% auto' }}
                  whileHover={{ scale: symptoms.trim() ? 1.02 : 1 }}
                  whileTap={{ scale: symptoms.trim() ? 0.98 : 1 }}
                >
                  {/* Shimmer Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />

                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <motion.svg
                      className="h-7 w-7"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      animate={{
                        rotate: symptoms.trim() ? [0, 10, -10, 0] : 0,
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        repeatDelay: 2,
                      }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </motion.svg>
                    Analyze My Symptoms
                    <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </motion.button>

                {/* Enhanced Info Cards */}
                <motion.div
                  className="mt-12 grid gap-6 sm:grid-cols-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                >
                  <motion.div
                    className="group relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/50 to-purple-950/30 p-6 backdrop-blur-sm transition-all hover:border-indigo-500/40"
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-indigo-600/10 blur-2xl transition-all group-hover:bg-indigo-600/20"></div>
                    <div className="relative">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600/30 to-purple-600/30 backdrop-blur-sm">
                        <svg className="h-7 w-7 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <h3 className="mb-2 text-lg font-bold text-indigo-100">Neural AI Engine</h3>
                      <p className="text-sm leading-relaxed text-indigo-400/80">
                        Advanced deep learning models trained on millions of symptom patterns
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    className="group relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-950/50 to-indigo-950/30 p-6 backdrop-blur-sm transition-all hover:border-purple-500/40"
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-purple-600/10 blur-2xl transition-all group-hover:bg-purple-600/20"></div>
                    <div className="relative">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600/30 to-indigo-600/30 backdrop-blur-sm">
                        <svg className="h-7 w-7 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h3 className="mb-2 text-lg font-bold text-purple-100">Instant Matching</h3>
                      <p className="text-sm leading-relaxed text-purple-400/80">
                        Find your symptom twin in real-time with 95%+ accuracy matching
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    className="group relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/50 to-slate-950/30 p-6 backdrop-blur-sm transition-all hover:border-indigo-500/40"
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-indigo-600/10 blur-2xl transition-all group-hover:bg-indigo-600/20"></div>
                    <div className="relative">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600/30 to-slate-600/30 backdrop-blur-sm">
                        <svg className="h-7 w-7 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <h3 className="mb-2 text-lg font-bold text-indigo-100">Bank-Level Security</h3>
                      <p className="text-sm leading-relaxed text-indigo-400/80">
                        End-to-end encryption with HIPAA-compliant data protection
                      </p>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Trust Indicators */}
                <motion.div
                  className="mt-8 flex flex-wrap items-center justify-center gap-8 opacity-60"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="flex items-center gap-2 text-sm text-indigo-300">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    HIPAA Compliant
                  </div>
                  <div className="flex items-center gap-2 text-sm text-indigo-300">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified AI
                  </div>
                  <div className="flex items-center gap-2 text-sm text-indigo-300">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    10M+ Analyzed
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
