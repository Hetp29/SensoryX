'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface NearbyDoctorsMapProps {
  location: string;
  userData?: {
    name: string;
    age: string;
    gender: string;
    height: string;
    weight: string;
    medicalHistory: string;
    medications: string;
    allergyDetails: string;
    surgeryHistory: string;
    lifestyle: string;
    familyHistory: string;
    symptoms: string;
  };
}

// Mock doctor data - replace with actual API data
const mockDoctors = [
  {
    id: 0,
    name: 'AI Doctor',
    specialty: 'AI-Powered Medical Analysis',
    address: 'Virtual Consultation',
    distance: 'Instant Access',
    rating: 4.9,
    phone: 'Available 24/7',
    isAI: true,
  },
  {
    id: 1,
    name: 'Dr. Sarah Johnson',
    specialty: 'General Practitioner',
    address: '123 Medical Center Dr',
    distance: '0.5 miles',
    rating: 4.8,
    phone: '(555) 123-4567',
    isAI: false,
  },
  {
    id: 2,
    name: 'Dr. Michael Chen',
    specialty: 'Internal Medicine',
    address: '456 Healthcare Blvd',
    distance: '1.2 miles',
    rating: 4.9,
    phone: '(555) 234-5678',
    isAI: false,
  },
  {
    id: 3,
    name: 'Dr. Emily Rodriguez',
    specialty: 'Family Medicine',
    address: '789 Wellness Ave',
    distance: '1.8 miles',
    rating: 4.7,
    phone: '(555) 345-6789',
    isAI: false,
  },
  {
    id: 4,
    name: 'Dr. David Kim',
    specialty: 'Neurology',
    address: '321 Brain Center Rd',
    distance: '2.1 miles',
    rating: 4.9,
    phone: '(555) 456-7890',
    isAI: false,
  },
];

export default function NearbyDoctorsMap({ location, userData }: NearbyDoctorsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);

  useEffect(() => {
    // TODO: Initialize Google Maps or other mapping service here
    // For now, we'll just show a placeholder
    console.log('Location:', location);
  }, [location]);

  return (
    <motion.div
      className="overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-slate-900/70 to-indigo-950/50 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      {/* Header */}
      <div className="border-b border-indigo-500/20 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 p-6">
        <h3 className="flex items-center gap-2 text-xl font-bold text-white">
          <svg className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Nearby Doctors in {location}
        </h3>
        <p className="mt-2 text-sm text-indigo-300">
          Based on your location, here are recommended doctors you can consult
        </p>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Map Placeholder */}
        <div
          ref={mapRef}
          className="mb-6 h-[400px] overflow-hidden rounded-xl border border-indigo-500/20 bg-slate-800/50"
        >
          {/* TODO: Replace with actual map integration */}
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-800 to-indigo-900/50">
            <div className="text-center">
              <svg className="mx-auto h-20 w-20 text-indigo-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <p className="mt-4 text-indigo-400/70">Map will be integrated here</p>
              <p className="mt-1 text-sm text-indigo-500/50">Showing doctors near {location}</p>
            </div>
          </div>
        </div>

        {/* Doctors List */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">Recommended Doctors</h4>
          {mockDoctors.map((doctor, index) => (
            <motion.div
              key={doctor.id}
              className={`relative cursor-pointer rounded-lg border p-4 transition-all ${
                doctor.isAI
                  ? selectedDoctor === doctor.id
                    ? 'border-purple-500 bg-gradient-to-br from-purple-950/40 to-pink-950/30'
                    : 'border-purple-500/30 bg-gradient-to-br from-purple-950/20 to-pink-950/10 hover:border-purple-500/50 hover:from-purple-950/30 hover:to-pink-950/20'
                  : selectedDoctor === doctor.id
                  ? 'border-indigo-500 bg-indigo-950/30'
                  : 'border-indigo-500/20 bg-slate-900/30 hover:border-indigo-500/40 hover:bg-slate-900/50'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              onClick={() => setSelectedDoctor(doctor.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {doctor.isAI && (
                      <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    )}
                    <h5 className={`text-lg font-semibold ${doctor.isAI ? 'text-purple-200' : 'text-white'}`}>
                      {doctor.name}
                    </h5>
                    <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      doctor.isAI ? 'bg-purple-950/30 text-purple-300' : 'bg-amber-950/30 text-amber-300'
                    }`}>
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {doctor.rating}
                    </div>
                  </div>
                  <p className={`mt-1 text-sm ${doctor.isAI ? 'text-purple-300' : 'text-indigo-300'}`}>
                    {doctor.specialty}
                  </p>
                  <div className={`mt-2 flex flex-col gap-1 text-sm ${doctor.isAI ? 'text-purple-400/80' : 'text-indigo-400/80'}`}>
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {doctor.address} • {doctor.distance}
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {doctor.phone}
                    </div>
                  </div>
                  {doctor.isAI && (
                    <div className="mt-3 rounded-lg border border-green-500/30 bg-green-950/20 px-3 py-2">
                      <p className="text-xs text-green-300 font-medium">
                        💵 Free Consultation • Save $150-300
                      </p>
                    </div>
                  )}
                </div>
                {doctor.isAI ? (
                  <Link
                    href={{
                      pathname: '/ai-consultation',
                      query: userData ? {
                        name: userData.name,
                        age: userData.age,
                        gender: userData.gender,
                        height: userData.height,
                        weight: userData.weight,
                        medicalHistory: userData.medicalHistory,
                        medications: userData.medications,
                        allergyDetails: userData.allergyDetails,
                        surgeryHistory: userData.surgeryHistory,
                        lifestyle: userData.lifestyle,
                        familyHistory: userData.familyHistory,
                        symptoms: userData.symptoms,
                      } : {}
                    }}
                  >
                    <motion.button
                      className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/30"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Consult
                    </motion.button>
                  </Link>
                ) : (
                  <motion.button
                    onClick={() => {
                      const searchQuery = `book appointment ${doctor.name} ${doctor.specialty} ${location}`;
                      window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
                    }}
                    className="rounded-lg bg-indigo-600/20 px-4 py-2 text-sm font-medium text-indigo-300 transition-colors hover:bg-indigo-600/30"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Book
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info Note */}
        <div className="mt-6 rounded-lg border border-amber-500/20 bg-amber-950/20 p-4">
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 flex-shrink-0 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-amber-300/80">
              These are general recommendations. Please verify doctor availability and suitability for your specific condition before booking an appointment.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
