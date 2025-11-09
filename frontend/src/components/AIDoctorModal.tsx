'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AIDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  symptoms: string;
  patientData?: any;
}

export default function AIDoctorModal({ isOpen, onClose, symptoms, patientData }: AIDoctorModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [tier, setTier] = useState<'free' | 'premium'>('free');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !sessionId) {
      startConsultation();
    }
  }, [isOpen]);

  const startConsultation = async () => {
    setIsLoading(true);
    try {
      const { startAIConsultation } = await import('@/lib/api');

      const response = await startAIConsultation({
        user_id: 'user123', // TODO: Get from auth
        symptom_data: {
          symptoms: symptoms,
          severity: 5,
        },
        patient_data: patientData,
      });

      setSessionId(response.session_id);
      setMessages([{
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
      }]);
    } catch (error) {
      console.error('Error starting consultation:', error);
      setMessages([{
        role: 'assistant',
        content: "Hello! I'm your AI medical assistant. I'll help you understand your symptoms better. What would you like to know?",
        timestamp: new Date().toISOString(),
      }]);
      setSessionId('mock-session-' + Date.now());
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !sessionId) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const { continueAIConsultation } = await import('@/lib/api');

      const response = await continueAIConsultation(sessionId, inputMessage);

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Fallback mock response
      const mockResponse: Message = {
        role: 'assistant',
        content: "I understand your concern. Based on your symptoms, I recommend scheduling an appointment with a healthcare provider for a proper evaluation. In the meantime, make sure to rest and stay hydrated.",
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, mockResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-4xl h-[80vh] rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-slate-900 to-indigo-950 overflow-hidden flex flex-col"
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">AI Doctor Consultation</h3>
                  <p className="text-sm text-indigo-300">
                    {tier === 'free' ? 'Free Tier - General Guidance' : 'Premium Tier - Detailed Analysis'}
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

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={`max-w-[80%] rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800/50 border border-indigo-500/20 text-indigo-100'
                }`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p className="mt-2 text-xs opacity-60">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl p-4 bg-slate-800/50 border border-indigo-500/20">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse"></div>
                    <div className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-indigo-500/20 bg-slate-900/50 p-6">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask the AI doctor anything..."
                  className="w-full resize-none rounded-lg border border-indigo-500/30 bg-slate-800/50 px-4 py-3 text-white placeholder-indigo-400/50 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  rows={3}
                  disabled={isLoading || !sessionId}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading || !sessionId}
                className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-indigo-400">
              <p>💡 Press Enter to send, Shift+Enter for new line</p>
              <button
                onClick={() => setTier(tier === 'free' ? 'premium' : 'free')}
                className="text-indigo-300 hover:text-white transition-colors"
              >
                {tier === 'free' ? 'Upgrade to Premium ($35)' : 'Using Premium'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
