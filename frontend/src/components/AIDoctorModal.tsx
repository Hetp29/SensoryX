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
  const [isRecording, setIsRecording] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    console.log('AIDoctorModal effect triggered:', { isOpen, sessionId });
    if (isOpen && !sessionId) {
      console.log('Starting consultation from useEffect...');
      startConsultation();
    }

    // Cleanup when modal closes
    if (!isOpen) {
      console.log('Modal closed, resetting state...');
      setMessages([]);
      setSessionId(null);
      setInputMessage('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const startConsultation = async () => {
    console.log('Starting AI consultation...');
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

      console.log('AI consultation started:', response);
      // API returns data nested in 'data' object
      const consultationData = (response as any).data || response;
      setSessionId(consultationData.session_id);
      setMessages([{
        role: 'assistant',
        content: consultationData.message,
        timestamp: new Date().toISOString(),
      }]);
    } catch (error) {
      console.error('Error starting consultation, using fallback:', error);
      // Always set a fallback session and greeting message
      const fallbackSessionId = 'mock-session-' + Date.now();
      const fallbackMessage = {
        role: 'assistant' as const,
        content: "Hello! I'm your AI medical assistant. I'll help you understand your symptoms better. What would you like to know?",
        timestamp: new Date().toISOString(),
      };

      setSessionId(fallbackSessionId);
      setMessages([fallbackMessage]);
      console.log('Fallback session created:', fallbackSessionId);
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

      // API returns data nested in 'data' object
      const responseData = (response as any).data || response;
      const assistantMessage: Message = {
        role: 'assistant',
        content: responseData.message,
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await sendVoiceMessage(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendVoiceMessage = async (audioBlob: Blob) => {
    if (!sessionId) return;
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const endpoint = voiceEnabled
        ? `/api/ai-doctor/voice-consultation-full?session_id=${sessionId}&tier=${tier}`
        : `/api/ai-doctor/voice-question?session_id=${sessionId}&tier=${tier}`;

      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        const data = result.data;

        // Add user's transcribed message
        const userMessage: Message = {
          role: 'user',
          content: data.transcription?.text || data.user_question?.text || 'Voice message',
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, userMessage]);

        // Add AI response
        const aiResponseText = data.ai_response?.text || data.ai_response;
        const assistantMessage: Message = {
          role: 'assistant',
          content: aiResponseText,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, assistantMessage]);

        // Play audio response if voice is enabled
        if (voiceEnabled && data.ai_response?.audio_base64) {
          playAudioResponse(data.ai_response.audio_base64);
        }
      }
    } catch (error) {
      console.error('Error sending voice message:', error);
      alert('Failed to send voice message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const playAudioResponse = (audioBase64: string) => {
    try {
      const audioData = atob(audioBase64);
      const audioArray = new Uint8Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        audioArray[i] = audioData.charCodeAt(i);
      }
      const audioBlob = new Blob([audioArray], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
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
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    voiceEnabled
                      ? 'bg-green-600/30 text-green-300 hover:bg-green-600/40'
                      : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700/70'
                  }`}
                  title={voiceEnabled ? 'Voice responses enabled' : 'Voice responses disabled'}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  {voiceEnabled ? 'Voice On' : 'Voice Off'}
                </button>
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
                  placeholder={isRecording ? "Recording..." : "Ask the AI doctor anything or use voice..."}
                  className="w-full resize-none rounded-lg border border-indigo-500/30 bg-slate-800/50 px-4 py-3 text-white placeholder-indigo-400/50 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  rows={3}
                  disabled={isLoading || !sessionId || isRecording}
                />
              </div>
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isLoading || !sessionId}
                className={`rounded-lg px-6 py-3 font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isRecording
                    ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
                title={isRecording ? 'Stop recording' : 'Start voice recording'}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isRecording ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  )}
                </svg>
              </button>
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
              <p>💡 {voiceEnabled ? 'Voice responses enabled - Click mic to speak' : 'Click mic for voice input, or type your message'}</p>
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
