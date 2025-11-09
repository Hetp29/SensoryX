'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import AIDoctorAvatar from '@/components/AIDoctorAvatar';
import Link from 'next/link';

interface Message {
  id: number;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface UserData {
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
}

export default function AIConsultation() {
  const searchParams = useSearchParams();
  const [userData, setUserData] = useState<UserData | null>(null);

  const generateInitialMessage = (data: UserData | null): string => {
    if (!data || !data.name) {
      return "Hello! I'm Dr. AI, your virtual medical consultant. I'm here to help you understand your symptoms better. When did you first notice these symptoms?";
    }

    // Create a concise, conversational greeting
    let greeting = `Hello ${data.name}! I'm Dr. AI. `;

    // Mention their symptoms to show context
    const symptomPreview = data.symptoms.length > 100
      ? data.symptoms.substring(0, 100) + '...'
      : data.symptoms;

    greeting += `I see you're experiencing ${symptomPreview}\n\n`;

    // Acknowledge any important medical history
    if (data.medicalHistory && data.medicalHistory !== 'None') {
      greeting += `I've noted your medical history of ${data.medicalHistory}. `;
    }

    if (data.medications && data.medications !== 'None') {
      greeting += `I also see you're currently taking ${data.medications}. `;
    }

    greeting += `\n\nTo help you better, when did you first start experiencing these symptoms?`;

    return greeting;
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationStage, setConversationStage] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpTime, setFollowUpTime] = useState('');
  const [followUpNotes, setFollowUpNotes] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle scheduling follow-up
  const handleScheduleFollowUp = () => {
    if (!followUpDate || !followUpTime) {
      alert('Please select both date and time for your follow-up.');
      return;
    }

    const followUp = {
      date: followUpDate,
      time: followUpTime,
      notes: followUpNotes,
      symptoms: userData?.symptoms || '',
      scheduledAt: new Date().toISOString(),
    };

    // Save to localStorage
    const existingFollowUps = JSON.parse(localStorage.getItem('followUpAppointments') || '[]');
    existingFollowUps.push(followUp);
    localStorage.setItem('followUpAppointments', JSON.stringify(existingFollowUps));

    // Close modal and reset
    setShowFollowUpModal(false);
    setFollowUpDate('');
    setFollowUpTime('');
    setFollowUpNotes('');

    alert(`Follow-up scheduled for ${new Date(followUpDate).toLocaleDateString()} at ${followUpTime}. You'll receive a reminder!`);
  };

  // Text-to-Speech function
  const speakText = (text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Remove markdown formatting for better speech
    const cleanText = text
      .replace(/\*\*/g, '') // Remove bold markers
      .replace(/\*/g, '') // Remove italic markers
      .replace(/\n/g, '. ') // Replace newlines with pauses
      .replace(/- /g, '') // Remove list markers
      .replace(/\d+\. /g, ''); // Remove numbered list markers

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to use a more natural voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice =>
      voice.name.includes('Samantha') ||
      voice.name.includes('Google UK English Female') ||
      voice.name.includes('Microsoft Zira')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Stop speech
  const stopSpeech = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.lang = 'en-US';

          recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInputMessage(transcript);
            setIsListening(false);
          };

          recognition.onerror = (event: any) => {
            // Only log errors that aren't "aborted" or "no-speech"
            if (event.error !== 'aborted' && event.error !== 'no-speech') {
              console.error('Speech recognition error:', event.error);
            }
            setIsListening(false);
          };

          recognition.onend = () => {
            setIsListening(false);
          };

          recognitionRef.current = recognition;
        } catch (error) {
          console.warn('Could not initialize speech recognition:', error);
        }
      }
    }

    // Load voices for speech synthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();

      // Also add voiceschanged event listener for better browser support
      window.speechSynthesis.addEventListener('voiceschanged', () => {
        window.speechSynthesis.getVoices();
      });
    }
  }, []);

  // Start/Stop listening
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setIsListening(false);
      }
    }
  };

  // Load user data from URL params and initialize messages
  useEffect(() => {
    const data: UserData = {
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
      symptoms: searchParams.get('symptoms') || '',
    };

    setUserData(data);

    // Initialize with AI greeting
    setMessages([{
      id: 1,
      role: 'ai',
      content: generateInitialMessage(data),
      timestamp: new Date(),
    }]);
  }, [searchParams]);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Medical conversation responses based on common patient queries
  const generateDoctorResponse = (userInput: string, stage: number): string => {
    const input = userInput.toLowerCase();

    // Symptom duration questions
    if (input.includes('day') || input.includes('week') || input.includes('month') || input.includes('yesterday') || input.includes('ago')) {
      return "Thank you, that timeline is helpful. Have you noticed if the symptoms are getting worse, staying the same, or improving?";
    }

    // Progression/severity followup
    if (input.includes('worse') || input.includes('worsening') || input.includes('getting bad')) {
      return "I see. That's important to know. Have you experienced any fever, difficulty breathing, or severe pain along with this?";
    }

    if (input.includes('same') || input.includes('stable') || input.includes('unchanged')) {
      return "Okay, stable symptoms are good to note. On a scale of 1-10, how would you rate your current discomfort level?";
    }

    if (input.includes('better') || input.includes('improving')) {
      return "That's encouraging to hear! Are you doing anything specific that seems to help?";
    }

    // Treatment options inquiry
    if (input.includes('treatment') || input.includes('cure') || input.includes('fix') || input.includes('heal')) {
      return "For immediate relief, I'd recommend rest and staying well-hydrated. Over-the-counter pain relief like acetaminophen or ibuprofen can help too. Are you currently taking any medications?";
    }

    // Severity/seriousness questions
    if (input.includes('serious') || input.includes('severe') || input.includes('dangerous') || input.includes('worry') || input.includes('concerned')) {
      return "I understand your concern. Based on what you've shared, you're able to communicate clearly which is a good sign. However, if you develop a high fever over 101.5°F, severe pain, or difficulty breathing, please seek immediate medical care. What specifically worries you the most?";
    }

    // Lifestyle changes
    if (input.includes('lifestyle') || input.includes('diet') || input.includes('exercise') || input.includes('prevent')) {
      return "Great question! For recovery, focus on staying hydrated, eating nutritious foods, and getting adequate rest. Gentle exercise like walking can help, but listen to your body. Would you like specific dietary recommendations?";
    }

    // Specialist referral questions
    if (input.includes('specialist') || input.includes('doctor') || input.includes('hospital') || input.includes('appointment')) {
      return "That's a wise consideration. If your symptoms persist beyond 7-10 days or significantly impact your daily life, I'd recommend seeing a doctor in person. They can provide a thorough examination. Would you like help finding a doctor near you?";
    }

    // Medication questions
    if (input.includes('medicine') || input.includes('medication') || input.includes('pill') || input.includes('drug') || input.includes('prescription')) {
      return "For over-the-counter relief, acetaminophen (Tylenol) 500mg every 6 hours or ibuprofen (Advil) 400mg every 6-8 hours can help. Take with food and don't exceed the daily limits. Do you have any medication allergies I should know about?";
    }

    // Duration/timeline questions
    if (input.includes('long') || input.includes('how many') || input.includes('duration') || input.includes('time')) {
      return "Typically, you should see some improvement in 2-3 days with proper rest. Most symptoms resolve within 1-2 weeks. If there's no improvement after 3 days or if things worsen, definitely see a doctor. How are you feeling compared to when it first started?";
    }

    // Pain-related questions
    if (input.includes('pain') || input.includes('hurt') || input.includes('ache') || input.includes('sore')) {
      return "I'm sorry you're in pain. Can you describe it for me - is it sharp, dull, or throbbing? And on a scale of 1-10, how intense is it?";
    }

    // Fever
    if (input.includes('fever') || input.includes('temperature') || input.includes('hot')) {
      return "Have you taken your temperature? A fever over 101.5°F (38.6°C) would warrant immediate medical attention. Are you experiencing chills as well?";
    }

    // General/default response
    return "Thank you for sharing that. To help you better, could you tell me more about your main symptom - what concerns you most about it?";
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    // Simulate realistic typing delay (1.5-3 seconds based on response length)
    const responseDelay = 1500 + Math.random() * 1500;

    setTimeout(() => {
      const responseContent = generateDoctorResponse(currentInput, conversationStage);
      const aiResponse: Message = {
        id: messages.length + 2,
        role: 'ai',
        content: responseContent,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setConversationStage(prev => prev + 1);
      setIsLoading(false);

      // Speak the AI response if voice is enabled
      if (voiceEnabled) {
        speakText(responseContent);
      }
    }, responseDelay);
  };

  const quickQuestions = [
    "The symptoms started 3 days ago and are getting worse",
    "What treatment do you recommend?",
    "How serious is my condition?",
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
            <div className="mb-6 flex items-center justify-center">
              <AIDoctorAvatar size="large" showPulse={true} />
            </div>
            <h1 className="mb-2 bg-gradient-to-r from-purple-300 via-purple-200 to-pink-400 bg-clip-text text-4xl font-bold text-transparent">
              AI Doctor Consultation
            </h1>
            <p className="text-indigo-300">
              Free • Instant • Powered by Advanced AI
            </p>
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
              {/* Voice Controls Header */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  <span className="text-xs font-medium text-purple-300">Voice Mode</span>
                </div>
                <button
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                    voiceEnabled
                      ? 'bg-green-600/20 text-green-300 border border-green-500/30'
                      : 'bg-slate-700/30 text-slate-400 border border-slate-600/30'
                  }`}
                >
                  {voiceEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              <div className="flex items-center gap-2">
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
                  onClick={toggleListening}
                  disabled={isLoading}
                  className={`self-end rounded-lg p-3 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    isListening
                      ? 'bg-gradient-to-r from-red-600 to-pink-600 shadow-red-500/30 animate-pulse'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-indigo-500/30 hover:from-indigo-700 hover:to-purple-700'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title={isListening ? 'Stop listening' : 'Start voice input'}
                >
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {isListening ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    )}
                  </svg>
                </motion.button>

                {/* Stop Speaking Button (shown when AI is speaking) */}
                {isSpeaking && (
                  <motion.button
                    onClick={stopSpeech}
                    className="self-end rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 p-3 text-white shadow-lg shadow-amber-500/30 transition-all hover:from-amber-700 hover:to-orange-700"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    title="Stop speaking"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                  </motion.button>
                )}

                {/* Send Button */}
                <motion.button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="self-end rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 p-3 text-white shadow-lg shadow-purple-500/30 transition-all hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </motion.button>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-indigo-400/60">
                  {isListening ? (
                    <span className="flex items-center gap-1 text-red-400">
                      <span className="inline-block h-2 w-2 rounded-full bg-red-400 animate-pulse"></span>
                      Listening... Speak now
                    </span>
                  ) : (
                    'Press Enter to send • Shift+Enter for new line'
                  )}
                </p>
                {isSpeaking && (
                  <p className="text-xs text-amber-400/80 flex items-center gap-1">
                    <svg className="h-3 w-3 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                    </svg>
                    AI Doctor is speaking...
                  </p>
                )}
              </div>
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
            <button
              onClick={() => setShowFollowUpModal(true)}
              className="flex-1 rounded-lg border border-purple-500/30 bg-purple-950/30 px-6 py-3 text-purple-200 transition-all hover:border-purple-500/50 hover:bg-purple-950/50"
            >
              Schedule Follow-up
            </button>
          </motion.div>
        </div>
      </main>

      {/* Follow-up Schedule Modal */}
      <AnimatePresence>
        {showFollowUpModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFollowUpModal(false)}
          >
            <motion.div
              className="relative max-w-md w-full rounded-2xl border border-purple-500/30 bg-gradient-to-br from-slate-900 to-purple-950 p-6"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowFollowUpModal(false)}
                className="absolute top-4 right-4 rounded-full bg-slate-800/50 p-2 text-purple-300 transition-colors hover:bg-slate-800 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Modal Header */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-600/30">
                    <svg className="h-6 w-6 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Schedule Follow-up</h3>
                    <p className="text-sm text-purple-300">Set a reminder for your next consultation</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-4">
                {/* Date Input */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-purple-300">
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full rounded-lg border border-purple-500/30 bg-slate-900/50 px-4 py-3 text-white focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                {/* Time Input */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-purple-300">
                    Select Time
                  </label>
                  <input
                    type="time"
                    value={followUpTime}
                    onChange={(e) => setFollowUpTime(e.target.value)}
                    className="w-full rounded-lg border border-purple-500/30 bg-slate-900/50 px-4 py-3 text-white focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                {/* Notes Input */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-purple-300">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={followUpNotes}
                    onChange={(e) => setFollowUpNotes(e.target.value)}
                    placeholder="Add any notes about this follow-up..."
                    rows={3}
                    className="w-full resize-none rounded-lg border border-purple-500/30 bg-slate-900/50 px-4 py-3 text-white placeholder-indigo-400 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                {/* Info Box */}
                <div className="rounded-lg border border-indigo-500/30 bg-indigo-950/20 p-3">
                  <div className="flex items-start gap-2">
                    <svg className="h-5 w-5 flex-shrink-0 text-indigo-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-indigo-300">
                      We'll save this reminder locally on your device. You can view all your scheduled follow-ups anytime.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowFollowUpModal(false)}
                    className="flex-1 rounded-lg border border-slate-600/30 bg-slate-800/50 px-4 py-3 text-slate-300 transition-all hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleScheduleFollowUp}
                    className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 text-white transition-all hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/30"
                  >
                    Schedule
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
