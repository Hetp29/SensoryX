'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LoadingOverlay from '@/components/LoadingOverlay';
import dynamic from 'next/dynamic';

// Dynamically import the 3D canvas to avoid SSR issues
const AnalyzeCanvas = dynamic(() => import('@/components/AnalyzeCanvas'), {
  ssr: false,
  loading: () => null,
});

interface Message {
  id: string;
  type: 'ai' | 'user';
  text: string;
  timestamp: Date;
}

interface Question {
  id: string;
  question: string;
  field: string;
  placeholder: string;
  type?: 'text' | 'yesno';
  validate?: (value: string) => { isValid: boolean; error?: string };
}

// Validation functions
const validateName = (value: string) => {
  if (value.trim().length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters' };
  }
  if (!/^[a-zA-Z\s'-]+$/.test(value)) {
    return { isValid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }

  // Check for numbers in name
  if (/\d/.test(value)) {
    return { isValid: false, error: 'Name cannot contain numbers' };
  }

  // Check for excessive special characters
  if ((value.match(/[-']/g) || []).length > 3) {
    return { isValid: false, error: 'Name has too many special characters' };
  }

  // Check for proper formatting (at least one letter in each word)
  const words = value.trim().split(/\s+/);
  const hasValidWords = words.every(word => /[a-zA-Z]/.test(word));
  if (!hasValidWords) {
    return { isValid: false, error: 'Each part of the name must contain at least one letter' };
  }

  return { isValid: true };
};

const validateAge = (value: string) => {
  const age = parseInt(value);
  if (isNaN(age)) {
    return { isValid: false, error: 'Age must be a number' };
  }
  if (age < 0 || age > 150) {
    return { isValid: false, error: 'Please enter a valid age between 0 and 150' };
  }
  return { isValid: true };
};

const validateGender = (value: string) => {
  if (value.trim().length < 2) {
    return { isValid: false, error: 'Please enter your gender' };
  }
  if (!/^[a-zA-Z\s-]+$/.test(value)) {
    return { isValid: false, error: 'Gender can only contain letters, spaces, and hyphens' };
  }

  // Check for valid gender keywords
  const normalizedValue = value.toLowerCase().trim();
  const validGenders = ['male', 'female', 'non-binary', 'nonbinary', 'transgender', 'prefer not to say', 'other'];
  const commonTypos: { [key: string]: string } = {
    'maile': 'male',
    'mail': 'male',
    'mal': 'male',
    'mle': 'male',
    'femail': 'female',
    'femle': 'female',
    'femal': 'female',
    'fmale': 'female',
    'non binary': 'non-binary',
    'nonbinary': 'non-binary',
  };

  // Check if it's a common typo
  if (commonTypos[normalizedValue]) {
    return { isValid: false, error: `Did you mean "${commonTypos[normalizedValue]}"? Please enter the correct spelling.` };
  }

  // Check if it's a valid gender or starts with a valid gender
  const isValid = validGenders.some(gender =>
    normalizedValue === gender ||
    normalizedValue.startsWith(gender) ||
    normalizedValue.includes(gender)
  );

  if (!isValid) {
    return { isValid: false, error: 'Please enter a valid gender (e.g., Male, Female, Non-binary)' };
  }

  return { isValid: true };
};

const validateHeight = (value: string) => {
  // Accept formats like "175 cm", "5'9"", "5 feet 9 inches", "175", etc.
  if (value.trim().length < 2) {
    return { isValid: false, error: 'Please enter your height' };
  }
  // Check if it contains at least one number
  if (!/\d/.test(value)) {
    return { isValid: false, error: 'Height must include a number' };
  }

  const normalizedValue = value.toLowerCase().trim();
  const number = parseFloat(normalizedValue);

  // Check for valid units and reasonable ranges
  if (normalizedValue.includes('cm') || normalizedValue.includes('centimeter')) {
    if (number < 50 || number > 300) {
      return { isValid: false, error: 'Height in cm should be between 50 and 300' };
    }
  } else if (normalizedValue.includes('m') && !normalizedValue.includes('cm')) {
    if (number < 0.5 || number > 3.0) {
      return { isValid: false, error: 'Height in meters should be between 0.5 and 3.0' };
    }
  } else if (normalizedValue.includes('feet') || normalizedValue.includes('ft') || normalizedValue.includes("'")) {
    // Valid feet format, no additional validation needed
  } else if (normalizedValue.includes('inch')) {
    if (number < 20 || number > 120) {
      return { isValid: false, error: 'Height in inches should be between 20 and 120' };
    }
  } else if (!isNaN(number)) {
    // Just a number without unit - check if it's a reasonable range
    if (number < 0.5 || number > 300) {
      return { isValid: false, error: 'Please include a unit (e.g., cm, ft, inches) or enter a valid height' };
    }
  }

  return { isValid: true };
};

const validateWeight = (value: string) => {
  // Accept formats like "70 kg", "154 lbs", "70", etc.
  if (value.trim().length < 2) {
    return { isValid: false, error: 'Please enter your weight' };
  }
  // Check if it contains at least one number
  if (!/\d/.test(value)) {
    return { isValid: false, error: 'Weight must include a number' };
  }

  const normalizedValue = value.toLowerCase().trim();
  const number = parseFloat(normalizedValue);

  // Common typos for weight units - check and provide suggestions
  const typoChecks: { [key: string]: string } = {
    'kgs': 'kg',
    'kilogram': 'kg',
    'kilograms': 'kg',
    'lb ': 'lbs',
    'pound': 'lbs',
    'pounds': 'lbs',
  };

  for (const [typo, correction] of Object.entries(typoChecks)) {
    if (normalizedValue.includes(typo) && !normalizedValue.includes(correction)) {
      return { isValid: false, error: `Please use "${correction}" instead of "${typo}"` };
    }
  }

  // Check for valid units and reasonable ranges
  if (normalizedValue.includes('kg') || normalizedValue.includes('kilogram')) {
    if (number < 2 || number > 500) {
      return { isValid: false, error: 'Weight in kg should be between 2 and 500' };
    }
  } else if (normalizedValue.includes('lb') || normalizedValue.includes('pound')) {
    if (number < 5 || number > 1100) {
      return { isValid: false, error: 'Weight in lbs should be between 5 and 1100' };
    }
  } else if (!isNaN(number)) {
    // Just a number without unit
    if (number < 2 || number > 500) {
      return { isValid: false, error: 'Please include a unit (kg or lbs) or enter a valid weight' };
    }
  }

  return { isValid: true };
};

const validateLocation = (value: string) => {
  if (value.trim().length < 2) {
    return { isValid: false, error: 'Please enter your location' };
  }
  // Allow letters, spaces, commas, periods, and hyphens
  if (!/^[a-zA-Z\s,.-]+$/.test(value)) {
    return { isValid: false, error: 'Location can only contain letters, spaces, commas, periods, and hyphens' };
  }

  // Check if location has proper format (City, State or City)
  const hasComma = value.includes(',');
  if (hasComma) {
    const parts = value.split(',').map(p => p.trim());
    if (parts.length < 2 || parts.some(p => p.length < 2)) {
      return { isValid: false, error: 'Please enter location as "City, State" (e.g., "Boston, MA")' };
    }
  }

  return { isValid: true };
};

const validateTextRequired = (value: string) => {
  if (value.trim().length < 3) {
    return { isValid: false, error: 'Please provide more details (at least 3 characters)' };
  }
  return { isValid: true };
};

const chatQuestions: Question[] = [
  { id: '1', question: "Hi there! 👋 I'm here to help analyze your symptoms. Let's start with your name.", field: 'name', placeholder: 'Enter your name...', type: 'text', validate: validateName },
  { id: '2', question: "Nice to meet you! How old are you?", field: 'age', placeholder: 'e.g., 25', type: 'text', validate: validateAge },
  { id: '3', question: "What's your gender?", field: 'gender', placeholder: 'e.g., Male, Female, Non-binary...', type: 'text', validate: validateGender },
  { id: '4', question: "What's your height?", field: 'height', placeholder: 'e.g., 175 cm or 5\'9"', type: 'text', validate: validateHeight },
  { id: '5', question: "What's your weight?", field: 'weight', placeholder: 'e.g., 70 kg or 154 lbs', type: 'text', validate: validateWeight },
  { id: '6', question: "Do you have any pre-existing medical conditions or chronic illnesses?", field: 'hasMedicalHistory', placeholder: '', type: 'yesno' },
  { id: '7', question: "Please list your medical conditions in detail.", field: 'medicalHistory', placeholder: 'e.g., Diabetes Type 2, Hypertension, Asthma', type: 'text', validate: validateTextRequired },
  { id: '8', question: "Are you currently taking any medications?", field: 'hasMedications', placeholder: '', type: 'yesno' },
  { id: '9', question: "Please list your medications including names and dosages.", field: 'medications', placeholder: 'e.g., Metformin 500mg twice daily, Lisinopril 10mg daily', type: 'text', validate: validateTextRequired },
  { id: '10', question: "Do you have any allergies?", field: 'hasAllergies', placeholder: '', type: 'yesno' },
  { id: '11', question: "Please describe your allergies in detail. Include what you're allergic to and what type of reaction you experience.", field: 'allergyDetails', placeholder: 'e.g., Penicillin - causes severe rash and difficulty breathing, Peanuts - anaphylaxis, Pollen - seasonal rhinitis', type: 'text', validate: validateTextRequired },
  { id: '12', question: "Have you had any surgeries in the past?", field: 'hasSurgeryHistory', placeholder: '', type: 'yesno' },
  { id: '13', question: "Please list your past surgeries with approximate dates.", field: 'surgeryHistory', placeholder: 'e.g., Appendectomy (2018), Knee surgery (2020)', type: 'text', validate: validateTextRequired },
  { id: '14', question: "Do you smoke, drink alcohol, or use any recreational substances?", field: 'hasLifestyleFactors', placeholder: '', type: 'yesno' },
  { id: '15', question: "Please describe your lifestyle habits.", field: 'lifestyle', placeholder: 'e.g., Non-smoker, Occasional drinker (2-3 drinks per week)', type: 'text', validate: validateTextRequired },
  { id: '16', question: "Is there any family history of medical conditions?", field: 'hasFamilyHistory', placeholder: '', type: 'yesno' },
  { id: '17', question: "Please mention significant illnesses in your immediate family.", field: 'familyHistory', placeholder: 'e.g., Father - Heart disease, Mother - Diabetes', type: 'text', validate: validateTextRequired },
  { id: '18', question: "Where are you currently located? (City, State)", field: 'location', placeholder: 'e.g., Boston, MA', type: 'text', validate: validateLocation },
  { id: '19', question: "Perfect! Now I have all your medical information. Please describe your symptoms in detail below. Include when they started, how they feel, severity, frequency, and any patterns you've noticed.", field: 'symptoms', placeholder: '', type: 'text' },
];

export default function AnalyzePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [userData, setUserData] = useState({
    name: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    hasMedicalHistory: '',
    medicalHistory: '',
    hasMedications: '',
    medications: '',
    hasAllergies: '',
    allergyDetails: '',
    hasSurgeryHistory: '',
    surgeryHistory: '',
    hasLifestyleFactors: '',
    lifestyle: '',
    hasFamilyHistory: '',
    familyHistory: '',
    location: '',
    symptoms: '',
  });
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Start chat with first question
  const startChat = () => {
    setChatStarted(true);
    setIsTyping(true);
    setTimeout(() => {
      setMessages([{
        id: '0',
        type: 'ai',
        text: chatQuestions[0].question,
        timestamp: new Date(),
      }]);
      setIsTyping(false);
    }, 1000);
  };

  // Handle sending answer
  const handleSendAnswer = (answer?: string) => {
    const answerText = answer || currentAnswer;
    if (!answerText.trim()) return;

    const currentQuestion = chatQuestions[currentQuestionIndex];

    // Validate input if validation function exists
    if (currentQuestion.validate) {
      const validationResult = currentQuestion.validate(answerText);
      if (!validationResult.isValid) {
        setValidationError(validationResult.error || 'Invalid input');
        return;
      }
    }

    // Clear validation error
    setValidationError('');

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      text: answerText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    // Update user data
    setUserData(prev => ({
      ...prev,
      [currentQuestion.field]: answerText,
    }));

    // Clear input
    setCurrentAnswer('');

    // Check if we need to skip follow-up questions based on "No" answers
    let nextIndex = currentQuestionIndex + 1;

    // Skip follow-up detail questions if user answered "No" to yes/no questions
    if (currentQuestion.type === 'yesno' && answerText.toLowerCase() === 'no') {
      // Map of yes/no fields to their detail fields that should be skipped
      const skipMap: { [key: string]: string } = {
        'hasMedicalHistory': 'medicalHistory',
        'hasMedications': 'medications',
        'hasAllergies': 'allergyDetails',
        'hasSurgeryHistory': 'surgeryHistory',
        'hasLifestyleFactors': 'lifestyle',
        'hasFamilyHistory': 'familyHistory',
      };

      const fieldToSkip = skipMap[currentQuestion.field];
      if (fieldToSkip) {
        // Find and skip the next question if it's the detail question
        if (nextIndex < chatQuestions.length && chatQuestions[nextIndex].field === fieldToSkip) {
          nextIndex++;
          // Set the detail field to "None"
          setUserData(prev => ({
            ...prev,
            [fieldToSkip]: 'None',
          }));
        }
      }
    }

    // Move to next question or finish
    if (nextIndex < chatQuestions.length) {
      setIsTyping(true);
      setTimeout(() => {
        const nextQuestion = chatQuestions[nextIndex];
        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          type: 'ai',
          text: nextQuestion.question,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        setCurrentQuestionIndex(nextIndex);
        setIsTyping(false);
      }, 1500);
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    setUploadedImages(prev => [...prev, ...newFiles]);

    // Create preview URLs
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove image
  const handleRemoveImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Handle final submission
  const handleFinalSubmit = async () => {
    if (!userData.symptoms.trim()) return;

    setIsLoading(true);

    try {
      // Import API client
      const { analyzeSymptoms } = await import('@/lib/api');

      // Prepare patient data
      const patientData = {
        name: userData.name,
        age: userData.age,
        gender: userData.gender,
        height: userData.height,
        weight: userData.weight,
        medical_history: userData.medicalHistory || 'None',
        medications: userData.medications || 'None',
        allergies: userData.allergyDetails || 'None',
        surgery_history: userData.surgeryHistory || 'None',
        lifestyle: userData.lifestyle || 'None',
        family_history: userData.familyHistory || 'None',
        location: userData.location,
      };

      console.log('Sending to backend:', { patientData, symptoms: userData.symptoms, images: uploadedImages.length });

      // Send to backend
      const response = await analyzeSymptoms({
        user_id: 'user123', // TODO: Get from auth
        symptoms: userData.symptoms,
        patient_data: patientData,
        images: uploadedImages.length > 0 ? uploadedImages : undefined,
      });

      console.log('Backend response:', response);

      // Navigate to result with analysis_id
      router.push(`/result?analysis_id=${response.analysis_id}`);
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      // Fallback: pass via URL params if backend fails
      const params = new URLSearchParams({
        name: userData.name,
        age: userData.age,
        gender: userData.gender,
        height: userData.height,
        weight: userData.weight,
        medicalHistory: userData.medicalHistory || 'None',
        medications: userData.medications || 'None',
        allergyDetails: userData.allergyDetails || 'None',
        surgeryHistory: userData.surgeryHistory || 'None',
        lifestyle: userData.lifestyle || 'None',
        familyHistory: userData.familyHistory || 'None',
        location: userData.location,
        symptoms: userData.symptoms,
      });
      router.push(`/result?${params.toString()}`);
    } finally {
      setIsLoading(false);
    }
  };

  const currentQuestion = chatQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === chatQuestions.length - 1;

  return (
    <>
      <LoadingOverlay isLoading={isLoading} />

      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
        {/* 3D Background Canvas */}
        <AnalyzeCanvas />

        {/* Decorative Background Elements */}
        <div className="pointer-events-none absolute inset-0">
          {/* Gradient Orbs */}
          <div className="absolute left-1/4 top-20 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl"></div>
          <div className="absolute right-1/4 bottom-20 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl"></div>

          {/* Floating Particles */}
          {Array.from({ length: 15 }).map((_, i) => {
            // Use deterministic values based on index to avoid hydration errors
            const seed = (i + 1) * 7.919; // Use prime number for better distribution
            const left = ((seed * 31) % 100);
            const top = ((seed * 17) % 100);
            const duration = 3 + ((i * 13) % 20) / 10;
            const delay = ((i * 11) % 20) / 10;

            return (
              <motion.div
                key={`particle-${i}`}
                className="absolute h-1 w-1 rounded-full bg-indigo-400/30"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{
                  duration,
                  repeat: Infinity,
                  delay,
                }}
              />
            );
          })}
        </div>

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

              <Link
                href="/"
                className="text-sm font-medium text-indigo-300 transition-colors hover:text-white"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="relative flex min-h-screen items-center justify-center px-4 py-24">
          <div className="w-full max-w-4xl">
            {!chatStarted ? (
              /* Welcome Screen */
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <motion.div
                  className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-950/50 px-5 py-2.5 text-sm font-medium text-indigo-300 shadow-lg shadow-indigo-500/10 backdrop-blur-sm"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500"></span>
                  </span>
                  AI Health Assistant
                </motion.div>

                <motion.h1
                  className="mb-6 bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl md:text-7xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Let&apos;s Understand Your Symptoms
                </motion.h1>

                <motion.p
                  className="mx-auto mb-12 max-w-2xl text-lg text-indigo-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  I&apos;ll ask you a few quick questions to better understand your condition and find your symptom twin.
                </motion.p>

                <motion.button
                  onClick={startChat}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 px-12 py-5 text-xl font-bold text-white shadow-2xl shadow-indigo-500/40 transition-all duration-500 hover:shadow-indigo-500/60"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  />
                  <span className="relative z-10 flex items-center gap-3">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    Start Consultation
                  </span>
                </motion.button>
              </motion.div>
            ) : (
              /* Chatbot Interface */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col gap-6"
              >
                {/* Chat Messages */}
                <div className="h-[500px] overflow-y-auto rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-slate-900/70 to-indigo-950/50 p-6 backdrop-blur-sm">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex max-w-[80%] gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                          {/* Avatar */}
                          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                            message.type === 'ai'
                              ? 'bg-gradient-to-br from-indigo-600 to-purple-600'
                              : 'bg-gradient-to-br from-slate-700 to-slate-600'
                          }`}>
                            {message.type === 'ai' ? (
                              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                            ) : (
                              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            )}
                          </div>

                          {/* Message */}
                          <div className={`rounded-2xl px-5 py-3 ${
                            message.type === 'ai'
                              ? 'bg-indigo-600/20 text-indigo-100'
                              : 'bg-slate-700/50 text-white'
                          }`}>
                            <p className="text-sm leading-relaxed">{message.text}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {/* Typing Indicator */}
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                      >
                        <div className="flex gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600">
                            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                          </div>
                          <div className="flex items-center gap-1 rounded-2xl bg-indigo-600/20 px-5 py-3">
                            <motion.div className="h-2 w-2 rounded-full bg-indigo-400" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6, repeat: Infinity }} />
                            <motion.div className="h-2 w-2 rounded-full bg-indigo-400" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                            <motion.div className="h-2 w-2 rounded-full bg-indigo-400" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Input Area */}
                {!isLastQuestion ? (
                  currentQuestion?.type === 'yesno' ? (
                    /* Yes/No button selection */
                    <div className="flex gap-4">
                      <motion.button
                        onClick={() => handleSendAnswer('Yes')}
                        className="group flex-1 rounded-xl border-2 border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 to-purple-950/20 px-8 py-6 backdrop-blur-sm transition-all hover:border-indigo-500/60 hover:shadow-xl hover:shadow-indigo-500/20"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-600 to-emerald-600 shadow-lg shadow-green-500/30">
                            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-xl font-semibold text-white">Yes</span>
                        </div>
                      </motion.button>

                      <motion.button
                        onClick={() => handleSendAnswer('No')}
                        className="group flex-1 rounded-xl border-2 border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 to-purple-950/20 px-8 py-6 backdrop-blur-sm transition-all hover:border-indigo-500/60 hover:shadow-xl hover:shadow-indigo-500/20"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-rose-600 shadow-lg shadow-red-500/30">
                            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                          <span className="text-xl font-semibold text-white">No</span>
                        </div>
                      </motion.button>
                    </div>
                  ) : (
                    /* Text input for regular questions */
                    <div className="space-y-2">
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={currentAnswer}
                          onChange={(e) => {
                            setCurrentAnswer(e.target.value);
                            if (validationError) setValidationError('');
                          }}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendAnswer()}
                          placeholder={currentQuestion?.placeholder || 'Type your answer...'}
                          className={`flex-1 rounded-xl border ${
                            validationError
                              ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50'
                              : 'border-indigo-500/30 focus:border-indigo-500 focus:ring-indigo-500/50'
                          } bg-slate-900/50 px-5 py-3 text-white placeholder-indigo-400/50 backdrop-blur-sm focus:outline-none focus:ring-2`}
                        />
                        <motion.button
                          onClick={() => handleSendAnswer()}
                          disabled={!currentAnswer.trim()}
                          className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-white shadow-lg shadow-indigo-500/30 disabled:opacity-50"
                          whileHover={{ scale: currentAnswer.trim() ? 1.05 : 1 }}
                          whileTap={{ scale: currentAnswer.trim() ? 0.95 : 1 }}
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </motion.button>
                      </div>
                      {validationError && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2 rounded-lg bg-red-950/50 border border-red-500/30 px-4 py-2 text-sm text-red-300"
                        >
                          <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{validationError}</span>
                        </motion.div>
                      )}
                    </div>
                  )
                ) : (
                  /* Detailed symptoms textarea */
                  <div className="space-y-4">
                    {/* Symptoms Header */}
                    <div className="mb-2 flex items-center gap-2">
                      <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="text-lg font-semibold text-white">Describe Your Symptoms</h3>
                    </div>

                    <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-br from-slate-900/70 to-indigo-950/50 backdrop-blur-sm p-1">
                      <textarea
                        value={userData.symptoms}
                        onChange={(e) => setUserData(prev => ({ ...prev, symptoms: e.target.value }))}
                        placeholder="Describe your symptoms in detail... Include when they started, how they feel, severity, frequency, and any patterns you've noticed."
                        className="h-64 w-full resize-none bg-transparent px-5 py-4 text-white placeholder-indigo-400/50 focus:outline-none"
                        maxLength={2000}
                      />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-indigo-400/70">Be as detailed as possible</span>
                      <span className="text-indigo-300">{userData.symptoms.length}/2000</span>
                    </div>

                    {/* Image Upload Section */}
                    <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-br from-slate-900/70 to-indigo-950/50 backdrop-blur-sm p-6">
                      <div className="mb-4 flex items-center gap-2">
                        <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-white">Upload Images (Optional)</h3>
                      </div>
                      <p className="mb-4 text-sm text-indigo-300">
                        Upload images of rashes, swelling, injuries, or any visual symptoms to help with diagnosis
                      </p>

                      {/* Upload Button */}
                      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-indigo-500/30 bg-indigo-950/30 px-6 py-4 transition-all hover:border-indigo-500/50 hover:bg-indigo-950/50">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <svg className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span className="text-sm font-medium text-indigo-300">Click to upload images</span>
                      </label>

                      {/* Image Previews */}
                      {imagePreviews.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="group relative aspect-square overflow-hidden rounded-lg border border-indigo-500/30">
                              <img
                                src={preview}
                                alt={`Upload ${index + 1}`}
                                className="h-full w-full object-cover"
                              />
                              <button
                                onClick={() => handleRemoveImage(index)}
                                className="absolute right-2 top-2 rounded-full bg-red-600 p-1.5 opacity-0 transition-opacity group-hover:opacity-100"
                              >
                                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <motion.button
                      onClick={handleFinalSubmit}
                      disabled={!userData.symptoms.trim() || isLoading}
                      className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 px-8 py-5 text-xl font-bold text-white shadow-2xl shadow-indigo-500/40 disabled:opacity-50"
                      whileHover={{ scale: userData.symptoms.trim() ? 1.02 : 1 }}
                      whileTap={{ scale: userData.symptoms.trim() ? 0.98 : 1 }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                      />
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Analyze My Symptoms
                      </span>
                    </motion.button>
                    <button
                      onClick={async () => {
                        try {
                          const resp = await fetch('/api/photon/start', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ context: { user: userData } })
                          });
                          const data = await resp.json();
                          console.log('Photon session started', data);
                        } catch (err) {
                          console.error('Failed to start Photon session', err);
                        }
                      }}
                      className="mt-3 w-full rounded-xl border border-indigo-500/30 bg-transparent px-6 py-3 text-sm font-medium text-indigo-300 hover:bg-indigo-950/40"
                    >
                      Start Hybrid Session (Photon)
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
