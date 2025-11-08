'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import TwinCard from '@/components/TwinCard';
import SignatureCard from '@/components/SignatureCard';
import RecommendationCard from '@/components/RecommendationCard';

// Mock data - replace with actual API calls
const mockData = {
  twin: {
    id: 'twin-1',
    similarity: 95,
    age: 32,
    gender: 'Female',
    location: 'Boston, MA',
    symptomDescription: 'Sharp, stabbing pain behind my left eye that gets worse when I swallow. Started 3 days ago and comes in waves throughout the day.',
    diagnosis: 'Trigeminal Neuralgia',
    timeline: 'Diagnosed after 2 weeks',
    treatment: 'Carbamazepine 200mg twice daily + Physical therapy',
    outcome: '90% reduction in symptoms after 6 weeks of treatment'
  },
  conditions: [
    {
      name: 'Trigeminal Neuralgia',
      probability: 87,
      description: 'A chronic pain condition affecting the trigeminal nerve, causing sudden, severe facial pain.'
    },
    {
      name: 'Cluster Headache',
      probability: 72,
      description: 'Severe headaches that occur in cyclical patterns, often around one eye.'
    },
    {
      name: 'Temporal Arteritis',
      probability: 45,
      description: 'Inflammation of blood vessels in the head causing headaches and jaw pain.'
    }
  ],
  recommendations: [
    {
      type: 'immediate' as const,
      title: 'Seek Medical Attention',
      description: 'Based on your symptom match, consult a neurologist within 48 hours for proper diagnosis.',
      icon: 'immediate'
    },
    {
      type: 'consult' as const,
      title: 'Specialist Consultation',
      description: 'Request referral to a facial pain specialist or neurology department.',
      icon: 'consult'
    },
    {
      type: 'monitor' as const,
      title: 'Track Symptoms',
      description: 'Keep a daily log of pain episodes, triggers, and intensity on a scale of 1-10.',
      icon: 'monitor'
    },
    {
      type: 'lifestyle' as const,
      title: 'Avoid Known Triggers',
      description: 'Based on your twin\'s experience: avoid cold air exposure, chewing hard foods, and touching the affected area.',
      icon: 'lifestyle'
    }
  ]
};

export default function ResultPage() {
  const searchParams = useSearchParams();
  const [userData, setUserData] = useState({
    name: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    medicalHistory: '',
    medications: '',
    allergyDetails: '',
    surgeryHistory: '',
    lifestyle: '',
    familyHistory: '',
    location: '',
    symptoms: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get all user data from URL params
    setUserData({
      name: searchParams.get('name') || '',
      age: searchParams.get('age') || '',
      gender: searchParams.get('gender') || '',
      height: searchParams.get('height') || '',
      weight: searchParams.get('weight') || '',
      medicalHistory: searchParams.get('medicalHistory') || '',
      medications: searchParams.get('medications') || '',
      allergyDetails: searchParams.get('allergyDetails') || '',
      surgeryHistory: searchParams.get('surgeryHistory') || '',
      lifestyle: searchParams.get('lifestyle') || '',
      familyHistory: searchParams.get('familyHistory') || '',
      location: searchParams.get('location') || '',
      symptoms: searchParams.get('symptoms') || '',
    });

    // Simulate API loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
        <div className="text-center">
          <motion.div
            className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </motion.div>
          <h2 className="mb-2 text-2xl font-bold text-white">Analyzing Your Symptoms</h2>
          <p className="text-indigo-300">Finding your symptom twin...</p>
        </div>
      </div>
    );
  }

  return (
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

            <div className="flex items-center gap-4">
              <Link
                href="/analyze"
                className="text-sm font-medium text-indigo-300 transition-colors hover:text-white"
              >
                New Analysis
              </Link>
              <button className="rounded-lg bg-indigo-600/20 px-4 py-2 text-sm font-medium text-indigo-300 transition-colors hover:bg-indigo-600/30">
                Download Report
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="px-4 py-24">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            className="mb-12 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-950/30 px-4 py-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm font-medium text-green-300">Analysis Complete</span>
            </motion.div>

            <h1 className="mb-4 bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-5xl font-bold text-transparent sm:text-6xl">
              We Found Your Match
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-indigo-300">
              Based on your symptoms, we've identified someone who experienced the exact same sensations
            </p>
          </motion.div>

          {/* Patient Information Card */}
          <motion.div
            className="mb-8 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-slate-900/70 to-indigo-950/50 backdrop-blur-sm overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Header */}
            <div className="border-b border-indigo-500/20 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 p-6">
              <h3 className="flex items-center gap-2 text-xl font-bold text-white">
                <svg className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Patient Information
              </h3>
            </div>

            {/* Content - Basic Demographics Only */}
            <div className="p-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {userData.name && (
                  <div className="rounded-lg bg-slate-900/30 p-4">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-indigo-400">Name</p>
                    <p className="text-lg font-semibold text-white">{userData.name}</p>
                  </div>
                )}
                {userData.age && (
                  <div className="rounded-lg bg-slate-900/30 p-4">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-indigo-400">Age</p>
                    <p className="text-lg font-semibold text-white">{userData.age}</p>
                  </div>
                )}
                {userData.gender && (
                  <div className="rounded-lg bg-slate-900/30 p-4">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-indigo-400">Gender</p>
                    <p className="text-lg font-semibold text-white">{userData.gender}</p>
                  </div>
                )}
                {userData.height && (
                  <div className="rounded-lg bg-slate-900/30 p-4">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-indigo-400">Height</p>
                    <p className="text-lg font-semibold text-white">{userData.height}</p>
                  </div>
                )}
                {userData.weight && (
                  <div className="rounded-lg bg-slate-900/30 p-4">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-indigo-400">Weight</p>
                    <p className="text-lg font-semibold text-white">{userData.weight}</p>
                  </div>
                )}
                {userData.location && (
                  <div className="rounded-lg bg-slate-900/30 p-4">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-indigo-400">Location</p>
                    <p className="text-lg font-semibold text-white">{userData.location}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Medical History Card */}
          {(userData.medicalHistory && userData.medicalHistory !== 'None') ||
           (userData.medications && userData.medications !== 'None') ||
           (userData.allergyDetails && userData.allergyDetails !== 'None') ||
           (userData.surgeryHistory && userData.surgeryHistory !== 'None') ||
           (userData.lifestyle && userData.lifestyle !== 'None') ||
           (userData.familyHistory && userData.familyHistory !== 'None known' && userData.familyHistory !== 'None') ? (
            <motion.div
              className="mb-8 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-slate-900/70 to-indigo-950/50 backdrop-blur-sm overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* Header */}
              <div className="border-b border-indigo-500/20 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 p-6">
                <h3 className="flex items-center gap-2 text-xl font-bold text-white">
                  <svg className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Medical History
                </h3>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {userData.medicalHistory && userData.medicalHistory !== 'None' && (
                  <div className="rounded-lg border border-indigo-500/20 bg-slate-900/30 p-4">
                    <p className="mb-2 text-sm font-medium uppercase tracking-wide text-indigo-400">Pre-existing Conditions</p>
                    <p className="text-indigo-100">{userData.medicalHistory}</p>
                  </div>
                )}
                {userData.medications && userData.medications !== 'None' && (
                  <div className="rounded-lg border border-indigo-500/20 bg-slate-900/30 p-4">
                    <p className="mb-2 text-sm font-medium uppercase tracking-wide text-indigo-400">Current Medications</p>
                    <p className="text-indigo-100">{userData.medications}</p>
                  </div>
                )}
                {userData.allergyDetails && userData.allergyDetails !== 'None' && (
                  <div className="rounded-lg border border-amber-500/20 bg-amber-950/20 p-4">
                    <p className="mb-2 text-sm font-medium uppercase tracking-wide text-amber-400">Allergies</p>
                    <p className="text-amber-100">{userData.allergyDetails}</p>
                  </div>
                )}
                {userData.surgeryHistory && userData.surgeryHistory !== 'None' && (
                  <div className="rounded-lg border border-indigo-500/20 bg-slate-900/30 p-4">
                    <p className="mb-2 text-sm font-medium uppercase tracking-wide text-indigo-400">Surgery History</p>
                    <p className="text-indigo-100">{userData.surgeryHistory}</p>
                  </div>
                )}
                {userData.lifestyle && userData.lifestyle !== 'None' && (
                  <div className="rounded-lg border border-indigo-500/20 bg-slate-900/30 p-4">
                    <p className="mb-2 text-sm font-medium uppercase tracking-wide text-indigo-400">Lifestyle</p>
                    <p className="text-indigo-100">{userData.lifestyle}</p>
                  </div>
                )}
                {userData.familyHistory && userData.familyHistory !== 'None known' && userData.familyHistory !== 'None' && (
                  <div className="rounded-lg border border-indigo-500/20 bg-slate-900/30 p-4">
                    <p className="mb-2 text-sm font-medium uppercase tracking-wide text-indigo-400">Family History</p>
                    <p className="text-indigo-100">{userData.familyHistory}</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : null}

          {/* Symptoms Card */}
          {userData.symptoms && (
            <motion.div
              className="mb-8 rounded-2xl border border-purple-500/30 bg-gradient-to-br from-slate-900/70 to-purple-950/30 backdrop-blur-sm overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {/* Header */}
              <div className="border-b border-purple-500/20 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 p-6">
                <h3 className="flex items-center gap-2 text-xl font-bold text-white">
                  <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Reported Symptoms
                </h3>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-purple-100 leading-relaxed">{userData.symptoms}</p>
              </div>
            </motion.div>
          )}

          {/* Main Grid */}
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Column - Symptom Twin */}
            <div className="lg:col-span-2">
              <TwinCard twin={mockData.twin} />
            </div>

            {/* Right Column - Analysis & Recommendations */}
            <div className="space-y-8">
              <SignatureCard conditions={mockData.conditions} />
              <RecommendationCard recommendations={mockData.recommendations} />
            </div>
          </div>

          {/* Additional Actions */}
          <motion.div
            className="mt-12 grid gap-4 sm:grid-cols-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <button className="flex items-center justify-center gap-2 rounded-lg border border-indigo-500/30 bg-slate-900/50 px-6 py-4 text-indigo-200 transition-all hover:border-indigo-500/50 hover:bg-slate-900/70">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share Results
            </button>

            <button className="flex items-center justify-center gap-2 rounded-lg border border-indigo-500/30 bg-slate-900/50 px-6 py-4 text-indigo-200 transition-all hover:border-indigo-500/50 hover:bg-slate-900/70">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Download PDF
            </button>

            <button className="flex items-center justify-center gap-2 rounded-lg border border-indigo-500/30 bg-slate-900/50 px-6 py-4 text-indigo-200 transition-all hover:border-indigo-500/50 hover:bg-slate-900/70">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Set Reminders
            </button>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
