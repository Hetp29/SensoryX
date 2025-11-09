'use client';

import { useEffect, useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import jsPDF from 'jspdf';
import TwinCard from '@/components/TwinCard';
import SignatureCard from '@/components/SignatureCard';
import RecommendationCard from '@/components/RecommendationCard';
import NearbyDoctorsMap from '@/components/NearbyDoctorsMap';
import AIDoctorModal from '@/components/AIDoctorModal';
import NotificationPanel from '@/components/NotificationPanel';
import InsightsDashboard from '@/components/InsightsDashboard';

// Financial data types
interface CategoryData {
  total: number;
  count: number;
}

interface SpendingSummary {
  total_spending_12_months: number;
  monthly_average: number;
  transaction_count: number;
  spending_trend: 'increasing' | 'decreasing' | 'stable';
  categories: {
    [key: string]: CategoryData;
  };
  highest_expense_category: {
    name: string;
    total: number;
    percentage: number;
  };
  recent_transactions: Array<{
    date: string;
    merchant: string;
    category: string;
    amount: number;
  }>;
}

interface RiskAssessment {
  risk_level: 'low' | 'medium' | 'high';
  alert_message: string;
  affordable_monthly_payment: string;
  recommendations: string[];
}

// Category colors
const CATEGORY_COLORS: { [key: string]: string } = {
  hospital: '#ef4444',
  insurance: '#3b82f6',
  pharmacy: '#10b981',
  doctor_visits: '#8b5cf6',
  medical_supplies: '#f59e0b',
  dental: '#06b6d4',
  vision: '#ec4899',
};

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

function ResultPageContent() {
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
  const [spendingData, setSpendingData] = useState<SpendingSummary | null>(null);
  const [riskData, setRiskData] = useState<RiskAssessment | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isAIDoctorModalOpen, setIsAIDoctorModalOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [isInsightsDashboardOpen, setIsInsightsDashboardOpen] = useState(false);

  // Mock user ID - replace with actual user authentication
  const userId = 'user123';

  useEffect(() => {
    const fetchData = async () => {
      const analysisId = searchParams.get('analysis_id');

      if (analysisId) {
        // NEW: Fetch from backend using analysis_id
        try {
          const { getAnalysisById } = await import('@/lib/api');
          const response = await getAnalysisById(analysisId);

          console.log('Analysis data from backend:', response);

          // Set analysis data (twin, conditions, recommendations)
          setAnalysisData(response);

          // Extract patient data from analysis if available
          // For now, we'll keep user data empty since backend should have it
        } catch (error) {
          console.error('Error fetching analysis:', error);
          // Fall back to mockData if backend fails
          setAnalysisData(null);
        }
      } else {
        // FALLBACK: Get from URL params (backward compatibility)
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
      }

      // Fetch financial data
      await fetchFinancialData();

      setIsLoading(false);
    };

    fetchData();
  }, [searchParams]);

  const fetchFinancialData = async () => {
    try {
      // Fetch spending summary
      const spendingResponse = await fetch(`http://localhost:8000/api/financial/spending-summary/${userId}`);
      if (spendingResponse.ok) {
        const spendingJson = await spendingResponse.json();
        setSpendingData(spendingJson);

        // Fetch risk assessment only if spending data succeeded
        const riskResponse = await fetch('http://localhost:8000/api/financial/risk-assessment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            monthly_income: 5000,
            existing_medical_debt: 0,
            estimated_treatment_cost: 1200,
          }),
        });
        if (riskResponse.ok) {
          const riskJson = await riskResponse.json();
          setRiskData(riskJson);
        }
      } else {
        // If API fails, use mock data
        throw new Error('API not available');
      }
    } catch (err) {
      // Set mock data for demonstration when API is unavailable
      setSpendingData({
        total_spending_12_months: 15634.68,
        monthly_average: 1302.89,
        transaction_count: 74,
        spending_trend: 'increasing',
        categories: {
          pharmacy: { total: 924.03, count: 19 },
          doctor_visits: { total: 1356.75, count: 13 },
          hospital: { total: 6312.95, count: 7 },
          insurance: { total: 4782.30, count: 11 },
          medical_supplies: { total: 534.16, count: 8 },
          dental: { total: 722.68, count: 6 },
          vision: { total: 1001.81, count: 10 },
        },
        highest_expense_category: {
          name: 'hospital',
          total: 6312.95,
          percentage: 40.4,
        },
        recent_transactions: [
          { date: '2024-01-15', merchant: 'CVS Pharmacy', category: 'pharmacy', amount: 45.99 },
          { date: '2024-01-12', merchant: 'Dr. Smith Clinic', category: 'doctor_visits', amount: 150.00 },
          { date: '2024-01-08', merchant: 'Vision Care Center', category: 'vision', amount: 200.50 },
          { date: '2024-01-05', merchant: 'Dental Associates', category: 'dental', amount: 125.00 },
          { date: '2024-01-02', merchant: 'Insurance Premium', category: 'insurance', amount: 435.00 },
        ],
      });

      setRiskData({
        risk_level: 'medium',
        alert_message: 'Moderate financial burden - payment plans recommended',
        affordable_monthly_payment: '$150-200/month',
        recommendations: [
          'Contact hospital billing to discuss payment plans',
          'Check if you qualify for financial assistance programs',
          'Consider setting up a Health Savings Account (HSA)',
          'Review insurance coverage to optimize benefits',
        ],
      });
    }
  };

  const handleSetReminders = async () => {
    // Request notification permission
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        // Create reminder options
        const reminderOptions = [
          { label: 'Follow-up in 1 week', days: 7 },
          { label: 'Follow-up in 2 weeks', days: 14 },
          { label: 'Follow-up in 1 month', days: 30 },
        ];

        // Show custom reminder dialog
        const reminderDialog = document.createElement('div');
        reminderDialog.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4';
        reminderDialog.innerHTML = `
          <div class="relative max-w-md w-full rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-slate-900 to-indigo-950 p-8">
            <h3 class="text-2xl font-bold text-white mb-4">Set Medical Reminders</h3>
            <p class="text-indigo-300 mb-6">Choose when you'd like to be reminded about your follow-up:</p>
            <div class="space-y-3 mb-6">
              ${reminderOptions.map((option, index) => `
                <button
                  class="reminder-option w-full rounded-lg border border-indigo-500/30 bg-indigo-950/30 px-4 py-3 text-left text-white transition-all hover:border-indigo-500/60 hover:bg-indigo-950/50"
                  data-days="${option.days}"
                >
                  <div class="flex items-center justify-between">
                    <span class="font-medium">${option.label}</span>
                    <svg class="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              `).join('')}
            </div>
            <button class="close-dialog w-full rounded-lg border border-indigo-500/30 bg-slate-900/50 px-4 py-3 text-indigo-300 transition-all hover:bg-slate-900/70">
              Cancel
            </button>
          </div>
        `;

        document.body.appendChild(reminderDialog);

        // Handle reminder selection
        const reminderButtons = reminderDialog.querySelectorAll('.reminder-option');
        reminderButtons.forEach(button => {
          button.addEventListener('click', () => {
            const days = parseInt(button.getAttribute('data-days') || '7');
            const reminderDate = new Date();
            reminderDate.setDate(reminderDate.getDate() + days);

            // Store reminder in localStorage
            const reminders = JSON.parse(localStorage.getItem('sensoryxReminders') || '[]');
            const newReminder = {
              id: Date.now(),
              patientName: userData.name,
              date: reminderDate.toISOString(),
              message: `Follow-up reminder for your SensoryX analysis. Check your symptoms and consider consulting with your healthcare provider.`,
              created: new Date().toISOString(),
            };
            reminders.push(newReminder);
            localStorage.setItem('sensoryxReminders', JSON.stringify(reminders));

            // Show immediate confirmation notification
            new Notification('Reminder Set! 🔔', {
              body: `You'll be reminded on ${reminderDate.toLocaleDateString()} to follow up on your health analysis.`,
              icon: '/favicon.ico',
              badge: '/favicon.ico',
            });

            // Schedule reminder check (in a real app, this would be handled by a service worker)
            // For now, we'll just store it and check on page load
            alert(`✅ Reminder set for ${reminderDate.toLocaleDateString()}!\n\nWe'll notify you to follow up on your symptoms and recommendations.`);

            document.body.removeChild(reminderDialog);
          });
        });

        // Handle close button
        const closeButton = reminderDialog.querySelector('.close-dialog');
        closeButton?.addEventListener('click', () => {
          document.body.removeChild(reminderDialog);
        });

        // Handle click outside dialog
        reminderDialog.addEventListener('click', (e) => {
          if (e.target === reminderDialog) {
            document.body.removeChild(reminderDialog);
          }
        });
      } else {
        alert('Please enable notifications in your browser settings to set reminders.');
      }
    } else {
      alert('Your browser does not support notifications. Please try a modern browser like Chrome, Firefox, or Safari.');
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Helper function to add text with automatic page breaks
    const addText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
      doc.setFontSize(fontSize);
      if (isBold) {
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setFont('helvetica', 'normal');
      }

      const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
      lines.forEach((line: string) => {
        if (yPosition > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += fontSize * 0.5;
      });
      yPosition += 5;
    };

    // Title
    doc.setFillColor(79, 70, 229); // Indigo color
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('SensoryX Analysis Report', margin, 25);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, 35);

    yPosition = 50;
    doc.setTextColor(0, 0, 0);

    // Patient Information
    addText('PATIENT INFORMATION', 16, true);
    addText(`Name: ${userData.name}`);
    addText(`Age: ${userData.age} years`);
    addText(`Gender: ${userData.gender}`);
    addText(`Height: ${userData.height}`);
    addText(`Weight: ${userData.weight}`);
    addText(`Location: ${userData.location}`);
    yPosition += 5;

    // Medical History
    addText('MEDICAL HISTORY', 16, true);
    addText(`Pre-existing Conditions: ${userData.medicalHistory || 'None'}`);
    addText(`Current Medications: ${userData.medications || 'None'}`);
    addText(`Allergies: ${userData.allergyDetails || 'None'}`);
    addText(`Surgery History: ${userData.surgeryHistory || 'None'}`);
    addText(`Lifestyle Factors: ${userData.lifestyle || 'None'}`);
    addText(`Family History: ${userData.familyHistory || 'None'}`);
    yPosition += 5;

    // Symptoms
    addText('REPORTED SYMPTOMS', 16, true);
    addText(userData.symptoms);
    yPosition += 5;

    // Symptom Twin Match
    const twin = analysisData?.twin || mockData.twin;
    addText('SYMPTOM TWIN MATCH', 16, true);
    addText(`Match Similarity: ${twin.similarity}%`, 12, true);
    addText(`Demographics: ${twin.age}y, ${twin.gender}, ${twin.location}`);
    addText(`Symptom Description: "${twin.symptom_description || twin.symptomDescription}"`);
    addText(`Diagnosis: ${twin.diagnosis}`);
    addText(`Timeline: ${twin.timeline}`);
    addText(`Treatment: ${twin.treatment}`);
    addText(`Outcome: ${twin.outcome}`);
    yPosition += 5;

    // Possible Conditions
    const conditions = analysisData?.conditions || mockData.conditions;
    addText('POSSIBLE CONDITIONS (AI-ANALYZED)', 16, true);
    conditions.forEach((condition, index) => {
      addText(`${index + 1}. ${condition.name} - ${condition.probability}% probability`, 11, true);
      addText(`   ${condition.description}`);
    });
    yPosition += 5;

    // Recommendations
    const recommendations = analysisData?.recommendations || mockData.recommendations;
    addText('RECOMMENDATIONS', 16, true);
    recommendations.forEach((rec, index) => {
      addText(`${index + 1}. ${rec.title.toUpperCase()} (${rec.type})`, 11, true);
      addText(`   ${rec.description}`);
    });
    yPosition += 5;

    // Financial Impact (if available)
    if (spendingData) {
      addText('FINANCIAL IMPACT ANALYSIS', 16, true);
      addText(`Total Medical Spending (12 months): $${spendingData.total_spending_12_months.toFixed(2)}`);
      addText(`Monthly Average: $${spendingData.monthly_average.toFixed(2)}`);
      addText(`Number of Transactions: ${spendingData.transaction_count}`);
      addText(`Spending Trend: ${spendingData.spending_trend}`);

      if (riskData) {
        addText(`Financial Risk Level: ${riskData.risk_level.toUpperCase()}`, 11, true);
        addText(`${riskData.alert_message}`);
        addText(`Affordable Monthly Payment: ${riskData.affordable_monthly_payment}`);
      }
    }

    // Disclaimer
    yPosition += 10;
    doc.setFillColor(245, 158, 11); // Amber color
    doc.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 35, 'F');
    doc.setTextColor(120, 53, 15); // Dark amber text
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('IMPORTANT DISCLAIMER', margin, yPosition + 5);
    doc.setFont('helvetica', 'normal');
    const disclaimerText = 'This report is for informational purposes only and does not constitute medical advice. Always consult with a qualified healthcare professional for proper diagnosis and treatment. The symptom twin match and AI analysis are based on pattern recognition and should not replace professional medical evaluation.';
    const disclaimerLines = doc.splitTextToSize(disclaimerText, pageWidth - 2 * margin - 10);
    doc.text(disclaimerLines, margin, yPosition + 12);

    // Save the PDF
    doc.save(`SensoryX_Analysis_${userData.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

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
              <button
                onClick={() => setIsInsightsDashboardOpen(true)}
                className="rounded-lg bg-indigo-600/20 px-4 py-2 text-sm font-medium text-indigo-300 transition-colors hover:bg-indigo-600/30 hover:text-white flex items-center gap-2"
                title="Real-Time Insights"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Insights
              </button>
              <button
                onClick={() => setIsNotificationPanelOpen(true)}
                className="relative rounded-lg bg-indigo-600/20 p-2.5 text-indigo-300 transition-colors hover:bg-indigo-600/30 hover:text-white"
                title="Notifications"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                  3
                </span>
              </button>
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
                  <div className="rounded-lg border border-indigo-500/30 bg-gradient-to-br from-indigo-950/50 to-purple-950/30 p-4">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-indigo-300">Name</p>
                    <p className="text-lg font-semibold text-white">{userData.name}</p>
                  </div>
                )}
                {userData.age && (
                  <div className="rounded-lg border border-indigo-500/30 bg-gradient-to-br from-indigo-950/50 to-purple-950/30 p-4">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-indigo-300">Age</p>
                    <p className="text-lg font-semibold text-white">{userData.age}</p>
                  </div>
                )}
                {userData.gender && (
                  <div className="rounded-lg border border-indigo-500/30 bg-gradient-to-br from-indigo-950/50 to-purple-950/30 p-4">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-indigo-300">Gender</p>
                    <p className="text-lg font-semibold text-white">{userData.gender}</p>
                  </div>
                )}
                {userData.height && (
                  <div className="rounded-lg border border-indigo-500/30 bg-gradient-to-br from-indigo-950/50 to-purple-950/30 p-4">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-indigo-300">Height</p>
                    <p className="text-lg font-semibold text-white">{userData.height}</p>
                  </div>
                )}
                {userData.weight && (
                  <div className="rounded-lg border border-indigo-500/30 bg-gradient-to-br from-indigo-950/50 to-purple-950/30 p-4">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-indigo-300">Weight</p>
                    <p className="text-lg font-semibold text-white">{userData.weight}</p>
                  </div>
                )}
                {userData.location && (
                  <div className="rounded-lg border border-indigo-500/30 bg-gradient-to-br from-indigo-950/50 to-purple-950/30 p-4">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-indigo-300">Location</p>
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
            <div className="lg:col-span-2 space-y-8">
              <TwinCard twin={analysisData?.twin || mockData.twin} />
              {/* Nearby Doctors Map */}
              {userData.location && (
                <NearbyDoctorsMap location={userData.location} userData={userData} />
              )}
            </div>

            {/* Right Column - Analysis & Recommendations */}
            <div className="space-y-8">
              <SignatureCard conditions={analysisData?.conditions || mockData.conditions} />
              <RecommendationCard recommendations={analysisData?.recommendations || mockData.recommendations} />

              {/* AI Doctor Consultation Button */}
              <motion.button
                onClick={() => setIsAIDoctorModalOpen(true)}
                className="w-full rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-left transition-all hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Consult AI Doctor</h3>
                      <p className="text-sm text-indigo-200">Get personalized medical guidance instantly</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-300 border border-green-500/30">
                      FREE
                    </span>
                    <span className="text-xs text-indigo-200">24/7 Available</span>
                  </div>
                </div>
              </motion.button>
            </div>
          </div>

          {/* AI Doctor Modal */}
          <AIDoctorModal
            isOpen={isAIDoctorModalOpen}
            onClose={() => setIsAIDoctorModalOpen(false)}
            symptoms={userData.symptoms || analysisData?.twin?.symptom_description || ''}
            patientData={userData}
          />

          {/* Notification Panel */}
          <NotificationPanel
            isOpen={isNotificationPanelOpen}
            onClose={() => setIsNotificationPanelOpen(false)}
            userId={userId}
          />

          {/* Insights Dashboard */}
          <InsightsDashboard
            isOpen={isInsightsDashboardOpen}
            onClose={() => setIsInsightsDashboardOpen(false)}
          />

          {/* Financial Impact Section */}
          {spendingData && riskData && (
            <motion.div
              className="mt-12 space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {/* Section Header */}
              <div className="text-center">
                <h2 className="mb-2 bg-gradient-to-r from-emerald-300 via-emerald-200 to-emerald-400 bg-clip-text text-3xl font-bold text-transparent">
                  Financial Impact & Coverage
                </h2>
                <p className="text-indigo-300">Understanding your treatment costs and payment options</p>
              </div>

              {/* Treatment Cost Estimates */}
              <motion.div
                className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-slate-900/70 to-emerald-950/30 backdrop-blur-sm overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <div className="border-b border-emerald-500/20 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 p-6">
                  <h3 className="flex items-center gap-2 text-xl font-bold text-white">
                    <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Estimated Treatment Costs - {(analysisData?.twin || mockData.twin).diagnosis}
                  </h3>
                </div>

                <div className="p-6">
                  <div className="grid gap-6 md:grid-cols-3 mb-6">
                    <div className="rounded-lg border border-blue-500/20 bg-blue-950/20 p-4">
                      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-blue-400">Cost Range</p>
                      <p className="text-2xl font-bold text-white">$500 - $2,000</p>
                      <p className="text-xs text-blue-300 mt-1">Per treatment cycle</p>
                    </div>
                    <div className="rounded-lg border border-green-500/20 bg-green-950/20 p-4">
                      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-green-400">Insurance Coverage</p>
                      <p className="text-2xl font-bold text-white">60-80%</p>
                      <p className="text-xs text-green-300 mt-1">Typical coverage rate</p>
                    </div>
                    <div className="rounded-lg border border-amber-500/20 bg-amber-950/20 p-4">
                      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-amber-400">Your Est. Cost</p>
                      <p className="text-2xl font-bold text-white">$300 - $800</p>
                      <p className="text-xs text-amber-300 mt-1">Out-of-pocket estimate</p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-emerald-500/20 bg-slate-900/30 p-4">
                    <h4 className="mb-3 font-semibold text-emerald-300">Typical Treatment Components:</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-sm text-indigo-200">
                        <svg className="h-5 w-5 flex-shrink-0 text-emerald-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        Specialist consultation ($150-300)
                      </li>
                      <li className="flex items-start gap-2 text-sm text-indigo-200">
                        <svg className="h-5 w-5 flex-shrink-0 text-emerald-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        Diagnostic tests and imaging ($200-500)
                      </li>
                      <li className="flex items-start gap-2 text-sm text-indigo-200">
                        <svg className="h-5 w-5 flex-shrink-0 text-emerald-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        Medication (Carbamazepine): $50-150/month
                      </li>
                      <li className="flex items-start gap-2 text-sm text-indigo-200">
                        <svg className="h-5 w-5 flex-shrink-0 text-emerald-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        Physical therapy sessions: $100-200 per visit
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>

              {/* Financial Risk & Spending Grid */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Risk Assessment Card */}
                <motion.div
                  className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-slate-900/70 to-indigo-950/30 backdrop-blur-sm overflow-hidden"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="border-b border-indigo-500/20 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 p-6">
                    <h3 className="flex items-center gap-2 text-xl font-bold text-white">
                      <svg className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Financial Risk Assessment
                    </h3>
                  </div>

                  <div className="p-6">
                    <div className="mb-4">
                      <div className={`inline-block rounded-full px-4 py-2 text-sm font-semibold ${
                        riskData.risk_level === 'low' ? 'bg-green-950/50 text-green-300 border border-green-500/30' :
                        riskData.risk_level === 'medium' ? 'bg-yellow-950/50 text-yellow-300 border border-yellow-500/30' :
                        'bg-red-950/50 text-red-300 border border-red-500/30'
                      }`}>
                        {riskData.risk_level.toUpperCase()} RISK
                      </div>
                    </div>

                    <p className="mb-4 text-emerald-300">{riskData.alert_message}</p>

                    <div className="mb-4 rounded-lg border border-blue-500/20 bg-blue-950/20 p-4">
                      <div className="text-sm text-blue-400">Affordable Monthly Payment</div>
                      <div className="text-2xl font-bold text-white">{riskData.affordable_monthly_payment}</div>
                    </div>

                    <div>
                      <h4 className="mb-2 text-sm font-semibold text-indigo-400">Payment Plan Options:</h4>
                      <ul className="space-y-2">
                        {riskData.recommendations?.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-indigo-200">
                            <svg className="h-5 w-5 flex-shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>

                {/* 12-Month Spending Summary */}
                <motion.div
                  className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-slate-900/70 to-indigo-950/30 backdrop-blur-sm overflow-hidden"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 }}
                >
                  <div className="border-b border-indigo-500/20 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 p-6">
                    <h3 className="flex items-center gap-2 text-xl font-bold text-white">
                      <svg className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Your 12-Month Medical Spending
                    </h3>
                  </div>

                  <div className="p-6">
                    <div className="mb-6 grid gap-4 grid-cols-2">
                      <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-4">
                        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-emerald-400">Total Spent</p>
                        <p className="text-2xl font-bold text-white">
                          ${spendingData.total_spending_12_months.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="rounded-lg border border-blue-500/20 bg-blue-950/20 p-4">
                        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-blue-400">Monthly Avg</p>
                        <p className="text-2xl font-bold text-white">
                          ${spendingData.monthly_average.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="mb-3 text-sm font-semibold text-indigo-400">Top Categories:</h4>
                      <div className="space-y-2">
                        {Object.entries(spendingData.categories)
                          .sort((a, b) => b[1].total - a[1].total)
                          .slice(0, 5)
                          .map(([category, data]) => {
                            const percentage = (data.total / spendingData.total_spending_12_months) * 100;
                            return (
                              <div key={category} className="rounded-lg border border-indigo-500/20 bg-slate-900/30 p-3">
                                <div className="mb-1 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="h-3 w-3 rounded-full"
                                      style={{ backgroundColor: CATEGORY_COLORS[category] || '#6366f1' }}
                                    />
                                    <span className="text-sm font-medium text-white capitalize">
                                      {category.replace(/_/g, ' ')}
                                    </span>
                                  </div>
                                  <span className="text-sm font-bold text-white">${data.total.toFixed(2)}</span>
                                </div>
                                <div className="h-1.5 w-full rounded-full bg-slate-800">
                                  <div
                                    className="h-1.5 rounded-full"
                                    style={{
                                      width: `${percentage}%`,
                                      backgroundColor: CATEGORY_COLORS[category] || '#6366f1'
                                    }}
                                  />
                                </div>
                                <p className="mt-1 text-xs text-indigo-300">{data.count} transactions</p>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Additional Actions */}
          <motion.div
            className="mt-12 grid gap-4 sm:grid-cols-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <button
              onClick={() => {
                const twin = analysisData?.twin || mockData.twin;
                if (navigator.share) {
                  navigator.share({
                    title: 'My SensoryX Analysis Results',
                    text: `Check out my symptom analysis results from SensoryX - ${twin.similarity}% match found!`,
                    url: window.location.href,
                  }).catch((error) => console.log('Error sharing:', error));
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }
              }}
              className="flex items-center justify-center gap-2 rounded-lg border border-indigo-500/30 bg-slate-900/50 px-6 py-4 text-indigo-200 transition-all hover:border-indigo-500/50 hover:bg-slate-900/70"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share Results
            </button>

            <button
              onClick={handleDownloadPDF}
              className="flex items-center justify-center gap-2 rounded-lg border border-indigo-500/30 bg-slate-900/50 px-6 py-4 text-indigo-200 transition-all hover:border-indigo-500/50 hover:bg-slate-900/70"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Download PDF
            </button>

            <button
              onClick={handleSetReminders}
              className="flex items-center justify-center gap-2 rounded-lg border border-indigo-500/30 bg-slate-900/50 px-6 py-4 text-indigo-200 transition-all hover:border-indigo-500/50 hover:bg-slate-900/70"
            >
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

export default function ResultPage() {
  return (
    <Suspense fallback={
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
          <h2 className="mb-2 text-2xl font-bold text-white">Loading...</h2>
          <p className="text-indigo-300">Please wait...</p>
        </div>
      </div>
    }>
      <ResultPageContent />
    </Suspense>
  );
}
