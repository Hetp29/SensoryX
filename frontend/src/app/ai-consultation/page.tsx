'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface Message {
  id: number;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export default function AIConsultation() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'ai',
      content: "Hello! I'm your AI medical assistant. I've reviewed your symptoms and analysis results. How can I help you today? Would you like to discuss your diagnosis, treatment options, or ask any specific questions about your condition?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // TODO: Integrate with ElevenLabs API and backend
    // Simulate AI response for now
    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        role: 'ai',
        content: "Based on your symptoms and the analysis, I understand your concern. Let me provide you with detailed information about your condition and the recommended next steps. Would you like me to explain the treatment options in more detail?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 2000);
  };

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    // TODO: Integrate with ElevenLabs voice input
    console.log('Voice input toggled:', !isListening);
  };

  const quickQuestions = [
    "What are my treatment options?",
    "How serious is my condition?",
    "What lifestyle changes should I make?",
    "Should I see a specialist?",
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
      <Navbar />

      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 left-1/4 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl" />
        <div className="absolute right-1/4 top-1/3 h-96 w-96 rounded-full bg-pink-600/20 blur-3xl" />
      </div>

      <main className="relative z-10 px-4 pb-8 pt-28 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <motion.div
            className="mb-8 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 flex items-center justify-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg shadow-purple-500/30">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <h1 className="mb-2 bg-gradient-to-r from-purple-300 via-purple-200 to-pink-400 bg-clip-text text-4xl font-bold text-transparent">
              AI Doctor Consultation
            </h1>
            <p className="text-indigo-300">
              Free • Instant • Powered by Advanced AI
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-950/20 px-4 py-2 text-sm text-green-300">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
              AI Doctor is online and ready to help
            </div>
          </motion.div>

          {/* Chat Container */}
          <motion.div
            className="mb-6 overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-br from-slate-900/70 to-purple-950/30 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Messages Area */}
            <div className="h-[500px] overflow-y-auto p-6 space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                          : 'border border-purple-500/30 bg-slate-900/50 text-indigo-100'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {message.role === 'ai' && (
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600">
                            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          <p className={`mt-1 text-xs ${message.role === 'user' ? 'text-indigo-200' : 'text-indigo-400'}`}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  className="flex justify-start"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="max-w-[80%] rounded-2xl border border-purple-500/30 bg-slate-900/50 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600">
                        <svg className="h-4 w-4 animate-pulse text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex gap-1">
                        <div className="h-2 w-2 animate-bounce rounded-full bg-purple-400" style={{ animationDelay: '0ms' }} />
                        <div className="h-2 w-2 animate-bounce rounded-full bg-purple-400" style={{ animationDelay: '150ms' }} />
                        <div className="h-2 w-2 animate-bounce rounded-full bg-purple-400" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            {messages.length === 1 && (
              <div className="border-t border-purple-500/20 bg-slate-900/30 p-4">
                <p className="mb-3 text-sm font-semibold text-purple-300">Quick Questions:</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {quickQuestions.map((question, index) => (
                    <motion.button
                      key={index}
                      className="rounded-lg border border-purple-500/30 bg-purple-950/20 px-4 py-2 text-left text-sm text-purple-200 transition-all hover:border-purple-500/50 hover:bg-purple-950/30"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setInputMessage(question)}
                    >
                      {question}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="border-t border-purple-500/20 bg-gradient-to-r from-purple-600/10 to-pink-600/10 p-4">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type your question or use voice input..."
                    className="w-full resize-none rounded-lg border border-purple-500/30 bg-slate-900/50 px-4 py-3 text-white placeholder-indigo-400 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    rows={2}
                  />
                </div>

                {/* Voice Input Button */}
                <motion.button
                  onClick={handleVoiceInput}
                  className={`rounded-lg p-3 transition-all ${
                    isListening
                      ? 'bg-red-600 shadow-lg shadow-red-500/30'
                      : 'border border-purple-500/30 bg-purple-950/30 hover:bg-purple-950/50'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className={`h-6 w-6 ${isListening ? 'text-white animate-pulse' : 'text-purple-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </motion.button>

                {/* Send Button */}
                <motion.button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 p-3 text-white shadow-lg shadow-purple-500/30 transition-all hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </motion.button>
              </div>

              <p className="mt-2 text-xs text-indigo-400">
                Press Enter to send • Shift+Enter for new line
              </p>
            </div>
          </motion.div>

          {/* Info Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <motion.div
              className="rounded-lg border border-green-500/30 bg-green-950/20 p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2 text-green-300">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-semibold">100% Free</p>
              </div>
              <p className="mt-1 text-xs text-green-400/80">Save $150-300 on consultation costs</p>
            </motion.div>

            <motion.div
              className="rounded-lg border border-purple-500/30 bg-purple-950/20 p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <div className="flex items-center gap-2 text-purple-300">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p className="text-sm font-semibold">Instant Responses</p>
              </div>
              <p className="mt-1 text-xs text-purple-400/80">No waiting time, available 24/7</p>
            </motion.div>

            <motion.div
              className="rounded-lg border border-indigo-500/30 bg-indigo-950/20 p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-2 text-indigo-300">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <p className="text-sm font-semibold">Based on Your Data</p>
              </div>
              <p className="mt-1 text-xs text-indigo-400/80">Personalized to your symptom analysis</p>
            </motion.div>
          </div>

          {/* Disclaimer */}
          <motion.div
            className="mt-6 rounded-lg border border-amber-500/30 bg-amber-950/20 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-start gap-3">
              <svg className="h-5 w-5 flex-shrink-0 text-amber-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-300">Medical Disclaimer</p>
                <p className="mt-1 text-xs text-amber-300/80">
                  This AI consultation is for informational purposes only and does not replace professional medical advice.
                  For serious conditions or emergencies, please consult a licensed healthcare provider immediately.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="mt-6 flex flex-col gap-4 sm:flex-row"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Link href="/result" className="flex-1">
              <button className="w-full rounded-lg border border-indigo-500/30 bg-slate-900/50 px-6 py-3 text-indigo-200 transition-all hover:border-indigo-500/50 hover:bg-slate-900/70">
                ← Back to Results
              </button>
            </Link>
            <button className="flex-1 rounded-lg border border-purple-500/30 bg-purple-950/30 px-6 py-3 text-purple-200 transition-all hover:border-purple-500/50 hover:bg-purple-950/50">
              Schedule Follow-up
            </button>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
