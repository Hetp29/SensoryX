'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// Types
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

export default function FinancialDashboard() {
  const [spendingData, setSpendingData] = useState<SpendingSummary | null>(null);
  const [riskData, setRiskData] = useState<RiskAssessment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock user ID - replace with actual user authentication
  const userId = 'user123';

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch spending summary
      const spendingResponse = await fetch(`http://localhost:8000/api/financial/spending-summary/${userId}`);

      if (!spendingResponse.ok) {
        throw new Error('Failed to fetch spending data');
      }

      const spendingJson = await spendingResponse.json();
      setSpendingData(spendingJson);

      // Fetch risk assessment
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

      if (!riskResponse.ok) {
        throw new Error('Failed to fetch risk assessment');
      }

      const riskJson = await riskResponse.json();
      setRiskData(riskJson);

    } catch (err) {
      console.error('Error fetching financial data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load financial data');

      // Set mock data for demonstration
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
        risk_level: 'low',
        alert_message: '✓ Low financial burden expected',
        affordable_monthly_payment: '$750/month',
        recommendations: [
          'Maintain health insurance coverage',
          'Build emergency medical fund of $2,000',
          'Consider HSA for tax benefits',
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare pie chart data
  const pieChartData = spendingData
    ? Object.entries(spendingData.categories).map(([name, data]) => ({
        name: name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        value: data.total,
        count: data.count,
      }))
    : [];

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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </motion.div>
          <h2 className="mb-2 text-2xl font-bold text-white">Loading Financial Data...</h2>
          <p className="text-indigo-300">Please wait...</p>
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
                href="/"
                className="text-sm font-medium text-indigo-300 transition-colors hover:text-white"
              >
                Home
              </Link>
              <Link
                href="/analyze"
                className="text-sm font-medium text-indigo-300 transition-colors hover:text-white"
              >
                Analyze
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="px-4 py-24">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            className="mb-8 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="mb-4 bg-gradient-to-r from-white via-emerald-200 to-emerald-400 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl">
              Financial Dashboard
            </h1>
            <p className="mx-auto max-w-2xl text-base text-indigo-300">
              Track your healthcare spending and manage your medical expenses
            </p>
          </motion.div>

          {error && (
            <motion.div
              className="mb-6 rounded-lg border border-yellow-500/30 bg-yellow-950/20 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-sm text-yellow-300">
                ⚠️ {error} - Showing demo data
              </p>
            </motion.div>
          )}

          {spendingData && (
            <>
              {/* Top Section - Big Numbers */}
              <div className="mb-8 grid gap-6 md:grid-cols-3">
                <motion.div
                  className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-slate-900/70 to-emerald-950/30 p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="mb-2 flex items-center gap-2 text-sm text-emerald-400">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Total Spending (12 Months)
                  </div>
                  <div className="text-3xl font-bold text-white">
                    ${spendingData.total_spending_12_months.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="mt-2 text-sm text-emerald-300">
                    {spendingData.transaction_count} transactions
                  </div>
                </motion.div>

                <motion.div
                  className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-slate-900/70 to-blue-950/30 p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="mb-2 text-sm text-blue-400">Monthly Average</div>
                  <div className="text-3xl font-bold text-white">
                    ${spendingData.monthly_average.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="mt-2 text-sm text-blue-300">/month</div>
                </motion.div>

                <motion.div
                  className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-slate-900/70 to-purple-950/30 p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="mb-2 text-sm text-purple-400">Spending Trend</div>
                  <div className="flex items-center gap-2">
                    <div className="text-3xl font-bold text-white capitalize">{spendingData.spending_trend}</div>
                    {spendingData.spending_trend === 'increasing' && (
                      <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    )}
                    {spendingData.spending_trend === 'decreasing' && (
                      <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                      </svg>
                    )}
                  </div>
                  <div className="mt-2 text-sm text-purple-300">Last 12 months</div>
                </motion.div>
              </div>

              {/* Middle Section - Pie Chart & Risk Assessment */}
              <div className="mb-8 grid gap-6 lg:grid-cols-2">
                {/* Pie Chart */}
                <motion.div
                  className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-slate-900/70 to-indigo-950/30 p-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="mb-4 text-xl font-bold text-white">Spending by Category</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name.toLowerCase().replace(/ /g, '_')] || '#6366f1'} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                        formatter={(value: number) => `$${value.toFixed(2)}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </motion.div>

                {/* Risk Assessment */}
                {riskData && (
                  <motion.div
                    className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-slate-900/70 to-indigo-950/30 p-6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h3 className="mb-4 text-xl font-bold text-white">Financial Risk Assessment</h3>

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
                      <h4 className="mb-2 text-sm font-semibold text-indigo-400">Recommendations:</h4>
                      <ul className="space-y-2">
                        {(riskData.recommendations || []).map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-indigo-200">
                            <svg className="h-5 w-5 flex-shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Bottom Section - Category List & Recent Transactions */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Category Breakdown */}
                <motion.div
                  className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-slate-900/70 to-indigo-950/30 p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <h3 className="mb-4 text-xl font-bold text-white">Category Breakdown</h3>
                  <div className="space-y-3">
                    {Object.entries(spendingData.categories)
                      .sort((a, b) => b[1].total - a[1].total)
                      .map(([category, data], idx) => {
                        const isHighest = category === spendingData.highest_expense_category.name;
                        return (
                          <div
                            key={category}
                            className={`rounded-lg p-4 ${
                              isHighest
                                ? 'border border-red-500/30 bg-red-950/20'
                                : 'border border-indigo-500/20 bg-slate-900/30'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-4 w-4 rounded-full"
                                  style={{ backgroundColor: CATEGORY_COLORS[category] || '#6366f1' }}
                                />
                                <span className="font-semibold text-white capitalize">
                                  {category.replace(/_/g, ' ')}
                                </span>
                                {isHighest && (
                                  <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-300">
                                    Highest
                                  </span>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-white">
                                  ${data.total.toFixed(2)}
                                </div>
                                <div className="text-xs text-indigo-300">
                                  {data.count} visits
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </motion.div>

                {/* Recent Transactions */}
                <motion.div
                  className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-slate-900/70 to-indigo-950/30 p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <h3 className="mb-4 text-xl font-bold text-white">Recent Transactions</h3>
                  <div className="space-y-3">
                    {spendingData.recent_transactions.map((transaction, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-indigo-500/20 bg-slate-900/30 p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-white">{transaction.merchant}</div>
                            <div className="text-xs text-indigo-300">
                              {new Date(transaction.date).toLocaleDateString()} • {transaction.category.replace(/_/g, ' ')}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-white">
                              ${transaction.amount.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
