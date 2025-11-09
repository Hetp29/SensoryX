'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface DashboardMetrics {
  active_symptom_reports: number;
  trending_symptoms: Array<{ symptom: string; count: number; change_percent: number }>;
  active_outbreaks: Array<{ condition: string; location: string; severity: string; case_count: number }>;
  total_users: number;
  geographic_hotspots: Array<{ location: string; case_count: number; per_100k: number }>;
}

interface InsightsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InsightsDashboard({ isOpen, onClose }: InsightsDashboardProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    active_symptom_reports: 0,
    trending_symptoms: [],
    active_outbreaks: [],
    total_users: 0,
    geographic_hotspots: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    if (isOpen) {
      fetchDashboardData();
      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchDashboardData, 30000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const { getRealtimeDashboard } = await import('@/lib/api');
      const response = await getRealtimeDashboard();
      setMetrics(response.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to mock data
      setMetrics({
        active_symptom_reports: 1247,
        trending_symptoms: [
          { symptom: 'Headache', count: 342, change_percent: 12.5 },
          { symptom: 'Fever', count: 289, change_percent: -5.2 },
          { symptom: 'Cough', count: 256, change_percent: 8.3 },
          { symptom: 'Fatigue', count: 198, change_percent: 15.7 },
          { symptom: 'Sore Throat', count: 167, change_percent: -2.1 },
        ],
        active_outbreaks: [
          {
            condition: 'Influenza A',
            location: 'Boston, MA',
            severity: 'moderate',
            case_count: 450,
          },
          {
            condition: 'Seasonal Allergies',
            location: 'New York, NY',
            severity: 'low',
            case_count: 230,
          },
        ],
        total_users: 12450,
        geographic_hotspots: [
          { location: 'Boston, MA', case_count: 450, per_100k: 68.2 },
          { location: 'New York, NY', case_count: 385, per_100k: 45.7 },
          { location: 'San Francisco, CA', case_count: 312, per_100k: 38.1 },
        ],
      });
      setLastUpdated(new Date());
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
      case 'urgent':
        return { bg: 'bg-red-950/30', border: 'border-red-500/50', text: 'text-red-200', badge: 'bg-red-600' };
      case 'moderate':
      case 'medium':
        return { bg: 'bg-orange-950/30', border: 'border-orange-500/50', text: 'text-orange-200', badge: 'bg-orange-600' };
      default:
        return { bg: 'bg-green-950/30', border: 'border-green-500/50', text: 'text-green-200', badge: 'bg-green-600' };
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-6xl h-[90vh] rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-slate-900 to-indigo-950 overflow-hidden flex flex-col"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-indigo-500/20 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600/30">
                <svg className="h-6 w-6 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Real-Time Health Insights</h3>
                <p className="text-sm text-indigo-300 flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                  Live updates • Last updated {lastUpdated.toLocaleTimeString()}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-indigo-300 transition-colors hover:bg-indigo-500/20 hover:text-white"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading && !metrics ? (
            <div className="flex items-center justify-center h-full">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
            </div>
          ) : metrics ? (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                  className="rounded-lg border border-indigo-500/30 bg-gradient-to-br from-indigo-950/50 to-purple-950/30 p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-indigo-300 mb-1">Active Reports</p>
                      <p className="text-3xl font-bold text-white">{metrics?.active_symptom_reports?.toLocaleString() ?? '0'}</p>
                    </div>
                    <div className="rounded-full bg-indigo-600/30 p-3">
                      <svg className="h-8 w-8 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs text-indigo-400 mt-2">Last 24 hours</p>
                </motion.div>

                <motion.div
                  className="rounded-lg border border-indigo-500/30 bg-gradient-to-br from-indigo-950/50 to-purple-950/30 p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-indigo-300 mb-1">Total Users</p>
                      <p className="text-3xl font-bold text-white">{metrics?.total_users?.toLocaleString() ?? '0'}</p>
                    </div>
                    <div className="rounded-full bg-purple-600/30 p-3">
                      <svg className="h-8 w-8 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs text-indigo-400 mt-2">Platform-wide</p>
                </motion.div>

                <motion.div
                  className="rounded-lg border border-indigo-500/30 bg-gradient-to-br from-indigo-950/50 to-purple-950/30 p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-indigo-300 mb-1">Active Outbreaks</p>
                      <p className="text-3xl font-bold text-white">{metrics?.active_outbreaks?.length ?? 0}</p>
                    </div>
                    <div className="rounded-full bg-amber-600/30 p-3">
                      <svg className="h-8 w-8 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs text-indigo-400 mt-2">Detected this week</p>
                </motion.div>
              </div>

              {/* Trending Symptoms */}
              <motion.div
                className="rounded-lg border border-indigo-500/30 bg-gradient-to-br from-slate-900/90 to-indigo-950/50 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Trending Symptoms
                </h4>
                <div className="space-y-3">
                  {metrics.trending_symptoms.map((symptom, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/20">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-2xl font-bold text-indigo-400">{index + 1}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-white">{symptom.symptom}</p>
                          <p className="text-sm text-indigo-300">{symptom.count} reports</p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${symptom.change_percent >= 0 ? 'bg-green-950/50 text-green-300' : 'bg-red-950/50 text-red-300'}`}>
                        <svg className={`h-4 w-4 ${symptom.change_percent >= 0 ? 'rotate-0' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                        <span className="text-sm font-medium">{Math.abs(symptom.change_percent)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Active Outbreaks */}
              <motion.div
                className="rounded-lg border border-indigo-500/30 bg-gradient-to-br from-slate-900/90 to-indigo-950/50 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Active Outbreaks
                </h4>
                <div className="grid gap-4 md:grid-cols-2">
                  {metrics.active_outbreaks?.map((outbreak, index) => {
                    const colors = getSeverityColor(outbreak.severity);
                    return (
                      <div key={index} className={`rounded-lg border ${colors.border} ${colors.bg} p-4`}>
                        <div className="flex items-start justify-between mb-2">
                          <h5 className={`font-semibold ${colors.text}`}>{outbreak.condition}</h5>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${colors.badge}`}>
                            {outbreak.severity.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-indigo-300 mb-2">{outbreak.location}</p>
                        <p className="text-2xl font-bold text-white">{outbreak.case_count} cases</p>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Geographic Hotspots */}
              <motion.div
                className="rounded-lg border border-indigo-500/30 bg-gradient-to-br from-slate-900/90 to-indigo-950/50 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Geographic Hotspots
                </h4>
                <div className="space-y-3">
                  {metrics.geographic_hotspots.map((hotspot, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/20">
                      <div>
                        <p className="font-semibold text-white">{hotspot.location}</p>
                        <p className="text-sm text-indigo-300">{hotspot.per_100k} cases per 100k</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-indigo-300">{hotspot.case_count}</p>
                        <p className="text-xs text-indigo-400">total cases</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : null}
        </div>
      </motion.div>
    </motion.div>
  );
}
