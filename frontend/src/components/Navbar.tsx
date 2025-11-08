'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.nav
      className="fixed top-0 z-50 w-full"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2">
            <motion.div
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/30"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-xl font-bold text-white">S</span>
            </motion.div>
            <span className="bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-2xl font-bold text-transparent">
              SensoryX
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="#features"
              className="text-sm font-medium text-indigo-200 transition-colors hover:text-white"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-indigo-200 transition-colors hover:text-white"
            >
              How It Works
            </Link>
            <Link
              href="#about"
              className="text-sm font-medium text-indigo-200 transition-colors hover:text-white"
            >
              About
            </Link>
            <Link
              href="/result"
              className="text-sm font-medium text-indigo-200 transition-colors hover:text-white"
            >
              Results Demo
            </Link>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/analyze"
                className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-shadow hover:shadow-indigo-500/50"
              >
                Start Analysis
              </Link>
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex flex-col gap-1.5 md:hidden"
            aria-label="Toggle menu"
          >
            <motion.span
              className="h-0.5 w-6 rounded-full bg-white"
              animate={isOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
            />
            <motion.span
              className="h-0.5 w-6 rounded-full bg-white"
              animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
            />
            <motion.span
              className="h-0.5 w-6 rounded-full bg-white"
              animate={isOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
            />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-2 bg-slate-900/95 px-4 pb-6 pt-2 backdrop-blur-lg">
              <Link
                href="#features"
                className="block rounded-lg px-4 py-3 text-sm font-medium text-indigo-200 transition-colors hover:bg-indigo-950/50 hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="block rounded-lg px-4 py-3 text-sm font-medium text-indigo-200 transition-colors hover:bg-indigo-950/50 hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                How It Works
              </Link>
              <Link
                href="#about"
                className="block rounded-lg px-4 py-3 text-sm font-medium text-indigo-200 transition-colors hover:bg-indigo-950/50 hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
              <Link
                href="/result"
                className="block rounded-lg px-4 py-3 text-sm font-medium text-indigo-200 transition-colors hover:bg-indigo-950/50 hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                Results Demo
              </Link>
              <Link
                href="/analyze"
                className="mt-2 block rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-indigo-500/30"
                onClick={() => setIsOpen(false)}
              >
                Start Analysis
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
