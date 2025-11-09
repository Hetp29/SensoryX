'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SymptomSignature from './SymptomSignature';

interface TwinCardProps {
  twin: {
    id: string;
    similarity: number;
    age: number;
    gender: string;
    location: string;
    symptomDescription: string;
    diagnosis: string;
    timeline: string;
    treatment: string;
    outcome: string;
  };
}

export default function TwinCard({ twin }: TwinCardProps) {
  const [showFullStory, setShowFullStory] = useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Symptom Twin Match - SensoryX',
        text: `I found a ${twin.similarity}% symptom match on SensoryX! They were diagnosed with ${twin.diagnosis}.`,
        url: window.location.href,
      }).catch((error) => console.log('Error sharing:', error));
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <>
    <motion.div
      className="overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-slate-900/90 to-indigo-950/50 backdrop-blur-lg"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header with similarity score */}
      <div className="border-b border-indigo-500/20 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="mb-1 text-2xl font-bold text-white">Your Symptom Twin</h3>
            <p className="text-indigo-300">Someone who felt exactly what you're feeling</p>
          </div>

          {/* Similarity Badge */}
          <motion.div
            className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/40"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-3xl font-bold text-white">{twin.similarity}%</span>
            <span className="text-xs text-indigo-200">Match</span>
          </motion.div>
        </div>
      </div>

      {/* Symptom Signature Visualization */}
      <div className="border-b border-indigo-500/20 bg-slate-950/30 p-4">
        <p className="mb-2 text-center text-sm font-medium text-indigo-300">
          Symptom Signature Match
        </p>
        <SymptomSignature similarity={twin.similarity} compact />
      </div>

      {/* Twin Details */}
      <div className="p-6">
        {/* Demographics */}
        <div className="mb-6 flex flex-wrap gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-950/50 px-4 py-2">
            <svg className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-sm text-indigo-200">{twin.age}y • {twin.gender}</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-950/50 px-4 py-2">
            <svg className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm text-indigo-200">{twin.location}</span>
          </div>
        </div>

        {/* Their Symptom Description */}
        <div className="mb-6">
          <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-indigo-300">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            How They Described It
          </h4>
          <p className="rounded-lg bg-slate-900/50 p-4 text-indigo-100 italic">
            &ldquo;{twin.symptomDescription}&rdquo;
          </p>
        </div>

        {/* Journey Timeline */}
        <div className="mb-6 space-y-4">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-indigo-300">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Their Journey
          </h4>

          {/* Timeline Steps */}
          <div className="space-y-3 pl-6">
            {/* Diagnosis */}
            <div className="relative border-l-2 border-indigo-500/30 pl-4">
              <div className="absolute -left-2 top-1 h-3 w-3 rounded-full bg-indigo-500"></div>
              <p className="text-xs font-medium text-indigo-400">Diagnosis</p>
              <p className="text-sm text-white font-semibold">{twin.diagnosis}</p>
              <p className="text-xs text-indigo-300">{twin.timeline}</p>
            </div>

            {/* Treatment */}
            <div className="relative border-l-2 border-indigo-500/30 pl-4">
              <div className="absolute -left-2 top-1 h-3 w-3 rounded-full bg-purple-500"></div>
              <p className="text-xs font-medium text-indigo-400">Treatment</p>
              <p className="text-sm text-white">{twin.treatment}</p>
            </div>

            {/* Outcome */}
            <div className="relative pl-4">
              <div className="absolute -left-2 top-1 h-3 w-3 rounded-full bg-green-500"></div>
              <p className="text-xs font-medium text-indigo-400">Outcome</p>
              <p className="text-sm text-white">{twin.outcome}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <motion.button
            onClick={() => setShowFullStory(true)}
            className="flex-1 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-indigo-500/30"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            View Full Story
          </motion.button>
          <motion.button
            onClick={handleShare}
            className="rounded-lg border border-indigo-500/30 px-4 py-3 text-sm font-medium text-indigo-300 transition-all hover:border-indigo-500/50 hover:bg-indigo-950/30"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </motion.button>
        </div>
      </div>
    </motion.div>

    {/* Full Story Modal */}
    <AnimatePresence>
      {showFullStory && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowFullStory(false)}
        >
          <motion.div
            className="relative max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-slate-900 to-indigo-950 p-8"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowFullStory(false)}
              className="absolute top-4 right-4 rounded-full bg-slate-800/50 p-2 text-indigo-300 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Content */}
            <div>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-3xl font-bold text-white">Full Story</h2>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg">
                  <span className="text-2xl font-bold text-white">{twin.similarity}%</span>
                </div>
              </div>

              {/* Patient Details */}
              <div className="mb-6 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-950/50 px-4 py-2">
                  <svg className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm text-indigo-200">{twin.age}y • {twin.gender}</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-950/50 px-4 py-2">
                  <svg className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm text-indigo-200">{twin.location}</span>
                </div>
              </div>

              {/* Symptom Description */}
              <div className="mb-6">
                <h3 className="mb-3 text-xl font-semibold text-indigo-300">Initial Symptoms</h3>
                <p className="rounded-lg bg-slate-900/50 p-4 text-indigo-100 italic leading-relaxed">
                  &ldquo;{twin.symptomDescription}&rdquo;
                </p>
              </div>

              {/* Journey Timeline */}
              <div className="mb-6">
                <h3 className="mb-4 text-xl font-semibold text-indigo-300">Medical Journey</h3>
                <div className="space-y-4 pl-6">
                  {/* Diagnosis */}
                  <div className="relative border-l-2 border-indigo-500/30 pl-6">
                    <div className="absolute -left-2.5 top-2 h-4 w-4 rounded-full bg-indigo-500"></div>
                    <p className="text-sm font-medium text-indigo-400">Diagnosis</p>
                    <p className="mt-1 text-lg font-semibold text-white">{twin.diagnosis}</p>
                    <p className="mt-1 text-sm text-indigo-300">{twin.timeline}</p>
                    <p className="mt-2 text-sm text-indigo-200 leading-relaxed">
                      After experiencing the symptoms described above, they consulted with medical professionals who diagnosed them with {twin.diagnosis}. This condition matches your reported symptoms with a {twin.similarity}% similarity rate.
                    </p>
                  </div>

                  {/* Treatment */}
                  <div className="relative border-l-2 border-indigo-500/30 pl-6">
                    <div className="absolute -left-2.5 top-2 h-4 w-4 rounded-full bg-purple-500"></div>
                    <p className="text-sm font-medium text-indigo-400">Treatment Plan</p>
                    <p className="mt-1 text-lg text-white">{twin.treatment}</p>
                    <p className="mt-2 text-sm text-indigo-200 leading-relaxed">
                      The treatment was carefully monitored and adjusted based on their response. This comprehensive approach combined medication with complementary therapies for optimal results.
                    </p>
                  </div>

                  {/* Outcome */}
                  <div className="relative pl-6">
                    <div className="absolute -left-2.5 top-2 h-4 w-4 rounded-full bg-green-500"></div>
                    <p className="text-sm font-medium text-indigo-400">Outcome & Recovery</p>
                    <p className="mt-1 text-lg text-white">{twin.outcome}</p>
                    <p className="mt-2 text-sm text-indigo-200 leading-relaxed">
                      Their recovery journey shows positive progress. While individual results may vary, this provides valuable insight into what a similar symptom profile experienced.
                    </p>
                  </div>
                </div>
              </div>

              {/* Important Notice */}
              <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-4">
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 flex-shrink-0 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-amber-300">Important Notice</p>
                    <p className="mt-1 text-xs text-amber-300/80">
                      This information is for educational purposes only. Your situation may be different. Always consult with a qualified healthcare professional for proper diagnosis and treatment.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
