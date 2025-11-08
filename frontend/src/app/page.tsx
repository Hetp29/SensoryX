'use client';

import { motion } from 'framer-motion';
import SensoryCanvas from '@/components/SensoryCanvas';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function Home() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: 'easeOut' },
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <>
      <SensoryCanvas />
      <Navbar />

      <main className="relative">
        {/* Hero Section */}
        <section className="flex min-h-screen items-center justify-center px-4 py-32">
          <div className="w-full max-w-6xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              {/* Badge */}
              <motion.div
                className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-950/50 px-5 py-2.5 text-sm font-medium text-indigo-300 backdrop-blur-sm"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500"></span>
                </span>
                Revolutionizing Healthcare with AI
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                className="mb-6 bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-6xl font-bold tracking-tight text-transparent sm:text-7xl md:text-8xl lg:text-9xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                SensoryX
              </motion.h1>

              {/* Tagline */}
              <motion.p
                className="mb-12 text-2xl font-light text-indigo-200 sm:text-3xl md:text-4xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                AI That Experiences Your Symptoms
              </motion.p>

              {/* Description */}
              <motion.p
                className="mx-auto mb-12 max-w-3xl text-lg leading-relaxed text-indigo-300/80 sm:text-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                Experience the future of symptom analysis. Our advanced AI doesn't just process data—it
                understands your sensations, providing unprecedented insights into your health.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                className="flex flex-col items-center justify-center gap-4 sm:flex-row"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/analyze"
                    className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-10 py-5 text-lg font-semibold text-white shadow-2xl shadow-indigo-500/40 transition-all hover:shadow-indigo-500/60"
                  >
                    <span className="relative z-10">Try SensoryX Now</span>
                    <svg
                      className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="#how-it-works"
                    className="inline-flex items-center gap-3 rounded-full border-2 border-indigo-500/30 bg-transparent px-10 py-5 text-lg font-semibold text-indigo-200 backdrop-blur-sm transition-all hover:border-indigo-500/50 hover:bg-indigo-950/30"
                  >
                    Learn More
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="relative px-4 py-32">
          <div className="mx-auto max-w-7xl">
            <motion.div className="mb-16 text-center" {...fadeInUp}>
              <h2 className="mb-4 text-4xl font-bold text-white sm:text-5xl md:text-6xl">
                Cutting-Edge Technology
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-indigo-300">
                Powered by the most advanced AI models, delivering accuracy and insights that matter
              </p>
            </motion.div>

            <motion.div
              className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
              variants={staggerChildren}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {/* Feature 1 */}
              <motion.div
                className="group rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/40 to-purple-950/20 p-8 backdrop-blur-sm transition-all hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/10"
                variants={fadeInUp}
              >
                <div className="mb-6 inline-flex rounded-xl bg-indigo-500/10 p-4">
                  <svg
                    className="h-8 w-8 text-indigo-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h3 className="mb-3 text-2xl font-semibold text-white">Neural Understanding</h3>
                <p className="text-indigo-300/80">
                  Our AI doesn't just read symptoms—it comprehends the nuances of your sensory experiences
                  using advanced neural networks.
                </p>
              </motion.div>

              {/* Feature 2 */}
              <motion.div
                className="group rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/40 to-purple-950/20 p-8 backdrop-blur-sm transition-all hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/10"
                variants={fadeInUp}
              >
                <div className="mb-6 inline-flex rounded-xl bg-indigo-500/10 p-4">
                  <svg
                    className="h-8 w-8 text-indigo-400"
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
                </div>
                <h3 className="mb-3 text-2xl font-semibold text-white">Instant Analysis</h3>
                <p className="text-indigo-300/80">
                  Get comprehensive health insights in seconds. Our real-time processing delivers results
                  faster than traditional methods.
                </p>
              </motion.div>

              {/* Feature 3 */}
              <motion.div
                className="group rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/40 to-purple-950/20 p-8 backdrop-blur-sm transition-all hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/10"
                variants={fadeInUp}
              >
                <div className="mb-6 inline-flex rounded-xl bg-indigo-500/10 p-4">
                  <svg
                    className="h-8 w-8 text-indigo-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="mb-3 text-2xl font-semibold text-white">Privacy First</h3>
                <p className="text-indigo-300/80">
                  Your health data is encrypted end-to-end. We prioritize your privacy with industry-leading
                  security measures.
                </p>
              </motion.div>

              {/* Feature 4 */}
              <motion.div
                className="group rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/40 to-purple-950/20 p-8 backdrop-blur-sm transition-all hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/10"
                variants={fadeInUp}
              >
                <div className="mb-6 inline-flex rounded-xl bg-indigo-500/10 p-4">
                  <svg
                    className="h-8 w-8 text-indigo-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="mb-3 text-2xl font-semibold text-white">Precision Insights</h3>
                <p className="text-indigo-300/80">
                  Receive detailed analysis backed by medical knowledge and pattern recognition across
                  millions of data points.
                </p>
              </motion.div>

              {/* Feature 5 */}
              <motion.div
                className="group rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/40 to-purple-950/20 p-8 backdrop-blur-sm transition-all hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/10"
                variants={fadeInUp}
              >
                <div className="mb-6 inline-flex rounded-xl bg-indigo-500/10 p-4">
                  <svg
                    className="h-8 w-8 text-indigo-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="mb-3 text-2xl font-semibold text-white">24/7 Availability</h3>
                <p className="text-indigo-300/80">
                  Access SensoryX anytime, anywhere. Get the insights you need whenever symptoms arise, day
                  or night.
                </p>
              </motion.div>

              {/* Feature 6 */}
              <motion.div
                className="group rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/40 to-purple-950/20 p-8 backdrop-blur-sm transition-all hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/10"
                variants={fadeInUp}
              >
                <div className="mb-6 inline-flex rounded-xl bg-indigo-500/10 p-4">
                  <svg
                    className="h-8 w-8 text-indigo-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="mb-3 text-2xl font-semibold text-white">Global Reach</h3>
                <p className="text-indigo-300/80">
                  Available worldwide with support for multiple languages and healthcare systems, making AI
                  health insights accessible to all.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="relative px-4 py-32">
          <div className="mx-auto max-w-7xl">
            <motion.div className="mb-20 text-center" {...fadeInUp}>
              <h2 className="mb-4 text-4xl font-bold text-white sm:text-5xl md:text-6xl">
                How It Works
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-indigo-300">
                Three simple steps to understanding your symptoms
              </p>
            </motion.div>

            <div className="grid gap-12 lg:grid-cols-3">
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className="mb-6 flex justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-3xl font-bold text-white shadow-lg shadow-indigo-500/40">
                    1
                  </div>
                </div>
                <h3 className="mb-4 text-2xl font-semibold text-white">Describe Your Symptoms</h3>
                <p className="text-indigo-300/80">
                  Share your sensory experiences in natural language. Our AI understands context and nuance.
                </p>
              </motion.div>

              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <div className="mb-6 flex justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-3xl font-bold text-white shadow-lg shadow-indigo-500/40">
                    2
                  </div>
                </div>
                <h3 className="mb-4 text-2xl font-semibold text-white">AI Analysis</h3>
                <p className="text-indigo-300/80">
                  Advanced neural networks process your input, cross-referencing with vast medical databases.
                </p>
              </motion.div>

              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
              >
                <div className="mb-6 flex justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-3xl font-bold text-white shadow-lg shadow-indigo-500/40">
                    3
                  </div>
                </div>
                <h3 className="mb-4 text-2xl font-semibold text-white">Get Insights</h3>
                <p className="text-indigo-300/80">
                  Receive comprehensive analysis with actionable recommendations and next steps.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="relative px-4 py-32">
          <div className="mx-auto max-w-5xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="mb-8 text-4xl font-bold text-white sm:text-5xl md:text-6xl">
                The Future of Healthcare is Here
              </h2>
              <p className="mb-8 text-lg leading-relaxed text-indigo-300 sm:text-xl">
                SensoryX represents a paradigm shift in how we understand and analyze health symptoms. By
                combining cutting-edge artificial intelligence with deep medical knowledge, we've created a
                platform that truly understands what you're experiencing.
              </p>
              <p className="mb-12 text-lg leading-relaxed text-indigo-300 sm:text-xl">
                Our mission is to democratize access to advanced health insights, empowering individuals to
                make informed decisions about their wellbeing with the support of AI technology.
              </p>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/analyze"
                  className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-10 py-5 text-lg font-semibold text-white shadow-2xl shadow-indigo-500/40 transition-all hover:shadow-indigo-500/60"
                >
                  Experience SensoryX
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative border-t border-indigo-500/20 px-4 py-12">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600">
                  <span className="text-sm font-bold text-white">S</span>
                </div>
                <span className="text-lg font-bold text-white">SensoryX</span>
              </div>

              <p className="text-sm text-indigo-400">
                © 2025 SensoryX. Revolutionizing healthcare with AI.
              </p>

              <div className="flex gap-6">
                <Link href="#" className="text-sm text-indigo-400 hover:text-white">
                  Privacy
                </Link>
                <Link href="#" className="text-sm text-indigo-400 hover:text-white">
                  Terms
                </Link>
                <Link href="#" className="text-sm text-indigo-400 hover:text-white">
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
