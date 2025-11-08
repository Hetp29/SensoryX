'use client';

import { motion } from 'framer-motion';
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
  return (
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
            <span className="text-sm text-indigo-200">{twin.age}y " {twin.gender}</span>
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
            "{twin.symptomDescription}"
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
          <button className="flex-1 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-indigo-500/30">
            View Full Story
          </button>
          <button className="rounded-lg border border-indigo-500/30 px-4 py-3 text-sm font-medium text-indigo-300 transition-all hover:border-indigo-500/50 hover:bg-indigo-950/30">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
