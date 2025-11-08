'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import AIDoctorAvatar from '@/components/AIDoctorAvatar';
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
      content: "Good day! I'm Dr. AI, your virtual medical consultant. I've reviewed your symptom analysis from our system. Before we proceed, I'd like to gather some additional information to provide you with the most accurate guidance.\n\nCould you please tell me:\n1. When did you first notice these symptoms?\n2. Have the symptoms been getting worse, staying the same, or improving?\n3. Are you currently taking any medications or have any known allergies?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationStage, setConversationStage] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Medical conversation responses based on common patient queries
  const generateDoctorResponse = (userInput: string, stage: number): string => {
    const input = userInput.toLowerCase();

    // Symptom duration questions
    if (input.includes('day') || input.includes('week') || input.includes('month') || input.includes('yesterday') || input.includes('ago')) {
      return "Thank you for that information. Understanding the timeline helps me assess the severity.\n\nBased on the duration you've mentioned, let me ask: Have you experienced any of the following:\n- Fever or chills?\n- Changes in appetite or weight?\n- Difficulty sleeping?\n- Any recent injuries or accidents?\n\nAlso, on a scale of 1-10, how would you rate your current discomfort level?";
    }

    // Treatment options inquiry
    if (input.includes('treatment') || input.includes('cure') || input.includes('fix') || input.includes('heal')) {
      return "I understand you're looking for treatment options. Based on your symptoms, here are the recommended approaches:\n\n**Immediate Steps:**\n1. Rest and adequate hydration (8-10 glasses of water daily)\n2. Over-the-counter pain relief if needed (acetaminophen or ibuprofen)\n3. Monitor your symptoms closely\n\n**When to Seek Immediate Care:**\n- If symptoms worsen significantly\n- Development of high fever (>101.5°F/38.6°C)\n- Severe pain or difficulty breathing\n- Any concerning new symptoms\n\nWould you like me to explain any specific treatment in more detail, or do you have questions about medication dosages?";
    }

    // Severity/seriousness questions
    if (input.includes('serious') || input.includes('severe') || input.includes('dangerous') || input.includes('worry') || input.includes('concerned')) {
      return "I understand your concern about the severity of your condition. Let me provide you with an honest assessment:\n\nBased on the symptoms you've described, this appears to be **[specify severity level based on context]**. However, several factors can influence this:\n\n**Positive indicators:**\n- You're able to communicate and describe your symptoms clearly\n- No mention of severe warning signs so far\n\n**Things to monitor:**\n- Any sudden changes in symptoms\n- Development of new symptoms\n- Your body's response to rest and basic care\n\n**My recommendation:** While this doesn't appear to be immediately life-threatening, I would advise monitoring closely. If you experience any of the warning signs I mentioned earlier, please seek in-person medical care promptly.\n\nDoes this help address your concerns? What specific aspect worries you most?";
    }

    // Lifestyle changes
    if (input.includes('lifestyle') || input.includes('diet') || input.includes('exercise') || input.includes('prevent')) {
      return "Excellent question! Lifestyle modifications can significantly impact your recovery and prevent recurrence. Here are my recommendations:\n\n**Diet Modifications:**\n- Increase intake of fruits and vegetables (aim for 5-7 servings daily)\n- Stay well-hydrated (water is best)\n- Reduce processed foods and excess sugar\n- Consider anti-inflammatory foods (berries, fatty fish, leafy greens)\n\n**Physical Activity:**\n- Light to moderate exercise as tolerated\n- Start with 15-20 minutes of walking daily\n- Avoid strenuous activity until symptoms improve\n- Listen to your body and rest when needed\n\n**Sleep & Stress:**\n- Aim for 7-9 hours of quality sleep\n- Practice stress-reduction techniques (deep breathing, meditation)\n- Maintain consistent sleep schedule\n\n**Other Recommendations:**\n- Avoid smoking and limit alcohol\n- Practice good hygiene\n- Keep follow-up appointments\n\nWould you like more specific guidance on any of these areas?";
    }

    // Specialist referral questions
    if (input.includes('specialist') || input.includes('doctor') || input.includes('hospital') || input.includes('appointment')) {
      return "That's a very prudent question. Let me help you determine if a specialist consultation is necessary:\n\n**I would recommend seeing a specialist if:**\n- Your symptoms persist beyond 7-10 days despite treatment\n- Symptoms are significantly impacting your daily activities\n- You have underlying health conditions that may complicate treatment\n- You're not responding to initial treatment approaches\n\n**Type of specialist to consider:**\nBased on your symptoms, you might benefit from consulting:\n- A General Practitioner (for initial evaluation)\n- [Specific specialist based on symptoms]\n\n**In the meantime:**\n- Continue monitoring your symptoms\n- Keep a symptom diary (timing, severity, triggers)\n- Note any questions you want to ask the doctor\n\nWould you like me to help you prepare questions for your specialist visit? Or would you like to explore other treatment options first?";
    }

    // Medication questions
    if (input.includes('medicine') || input.includes('medication') || input.includes('pill') || input.includes('drug') || input.includes('prescription')) {
      return "Good question about medications. Let me provide you with guidance:\n\n**Over-the-Counter Options:**\n- **Pain/Fever:** Acetaminophen (Tylenol) 500mg every 6 hours, or Ibuprofen (Advil) 400mg every 6-8 hours\n- **Important:** Don't exceed maximum daily doses (Acetaminophen: 3000mg, Ibuprofen: 1200mg)\n\n**Precautions:**\n- Take with food to prevent stomach upset\n- Avoid if you have liver/kidney problems or certain allergies\n- Don't combine multiple pain relievers without medical guidance\n- Stay hydrated while taking medications\n\n**When prescription medication may be needed:**\n- If symptoms don't improve in 3-5 days\n- If symptoms worsen despite treatment\n- If you develop complications\n\n**Important Note:** This is general guidance. Always read medication labels and consult a pharmacist or doctor if you have specific health conditions or take other medications.\n\nAre you currently taking any other medications I should be aware of?";
    }

    // Duration/timeline questions
    if (input.includes('long') || input.includes('how many') || input.includes('duration') || input.includes('time')) {
      return "Understanding the expected timeline is important for managing your expectations and recovery:\n\n**Typical Recovery Timeline:**\n- **Initial improvement:** 2-3 days with proper rest and care\n- **Significant relief:** 5-7 days for most symptoms\n- **Full recovery:** 1-2 weeks depending on severity\n\n**Factors affecting recovery time:**\n- Overall health and immune system strength\n- Adherence to treatment recommendations\n- Adequate rest and nutrition\n- Underlying health conditions\n\n**Progress milestones to watch for:**\n- Day 2-3: Slight improvement in symptoms\n- Day 5: Noticeable reduction in severity\n- Day 7: Most symptoms should be manageable\n- Day 10-14: Near complete resolution\n\n**Red flags - See a doctor if:**\n- No improvement after 3 days\n- Symptoms worsen at any point\n- New concerning symptoms develop\n\nDoes this timeline align with what you're experiencing? How are you feeling today compared to when symptoms started?";
    }

    // Pain-related questions
    if (input.includes('pain') || input.includes('hurt') || input.includes('ache') || input.includes('sore')) {
      return "I understand you're experiencing pain, which can be quite distressing. Let me help you manage this:\n\n**Pain Assessment:**\nYou mentioned pain - could you describe it for me?\n- Is it sharp, dull, throbbing, or burning?\n- Does it radiate to other areas?\n- What makes it better or worse?\n- On a scale of 1-10, what's the intensity?\n\n**Immediate Pain Management:**\n1. **Rest** the affected area\n2. **Ice/Heat:** Ice for acute pain (first 48 hours), heat for chronic aches\n3. **Over-the-counter pain relief:** As mentioned earlier\n4. **Positioning:** Find comfortable positions that reduce pressure\n\n**When pain requires urgent attention:**\n- Sudden, severe pain (8-10/10)\n- Pain with fever, confusion, or difficulty breathing\n- Pain that prevents normal activities completely\n- Progressive worsening despite treatment\n\n**Non-medication approaches:**\n- Deep breathing exercises\n- Gentle stretching (if appropriate)\n- Distraction techniques\n- Proper sleep positioning\n\nCan you tell me more about your pain so I can provide more specific guidance?";
    }

    // General/default response
    return "Thank you for sharing that information. I'm here to help you understand your condition better and guide you toward appropriate care.\n\nBased on what you've told me so far, I'd like to gather a bit more detail:\n\n**Could you please describe:**\n- Your primary symptom that concerns you most?\n- Any factors that make it better or worse?\n- How it's affecting your daily activities?\n\n**Also helpful to know:**\n- Any relevant medical history (chronic conditions, past surgeries)?\n- Recent changes in your routine, diet, or stress levels?\n- Family history of similar conditions?\n\nThe more details you can provide, the better I can tailor my recommendations to your specific situation. What would you like to discuss first?";
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
      const aiResponse: Message = {
        id: messages.length + 2,
        role: 'ai',
        content: generateDoctorResponse(currentInput, conversationStage),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setConversationStage(prev => prev + 1);
      setIsLoading(false);
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

              <p className="mt-2 text-xs text-indigo-400/60">
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
