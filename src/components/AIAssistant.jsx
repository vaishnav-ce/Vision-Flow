import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function detectIntent(text) {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('strain') || lowerText.includes('eye')) return 'eye_strain';
  if (lowerText.includes('fatigue') || lowerText.includes('tired')) return 'fatigue';
  if (lowerText.includes('focus') || lowerText.includes('distract')) return 'focus';
  if (lowerText.includes('distance') || lowerText.includes('close') || lowerText.includes('far')) return 'distance';
  if (lowerText.includes('light') || lowerText.includes('dark') || lowerText.includes('bright')) return 'lighting';
  return 'general';
}

function generateResponse(intent, metrics) {
  switch (intent) {
    case 'eye_strain':
      return metrics.eyeStrain === 'High' 
        ? "Your eye strain is high. Try using the 20-20-20 rule to rest your eyes."
        : "Your current eye strain is low. Keep up the good habits!";
    case 'fatigue':
      return metrics.fatigue > 50 
        ? `Fatigue is elevated (${metrics.fatigue.toFixed(0)}/100). Consider taking a 5-minute break soon.`
        : "You look fresh! Fatigue levels are normal right now.";
    case 'focus':
      return metrics.userState === 'Focused'
        ? "You're doing great! Keep your focus."
        : "You seem distracted. Try adjusting your posture or removing background noise.";
    case 'distance':
      if (metrics.scale < 0.9) return "You are too close. Move back to arm's length (about 20-24 inches).";
      if (metrics.scale > 1.2) return "You are a bit far. Move closer for optimal posture.";
      return "Your screen distance is perfect right now.";
    case 'lighting':
      return metrics.isDark 
        ? "It's quite dark here. Turn on a desk lamp to reduce eye strain."
        : "Lighting conditions look excellent for working.";
    default:
      return "I'm your VisionFlow AI. Ask me about your focus, fatigue, lighting, or screen distance!";
  }
}

export default function AIAssistant({ metrics }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ text: "Hi! How can I help optimize your workspace today?", isBot: true }]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  const handleSend = (text) => {
    if (!text.trim()) return;
    
    // Add user message
    const newMessages = [...messages, { text, isBot: false }];
    setMessages(newMessages);
    setInputMessage('');

    // Instant bot response
    const intent = detectIntent(text);
    const response = generateResponse(intent, metrics);
    
    setTimeout(() => {
      setMessages([...newMessages, { text: response, isBot: true }]);
    }, 50); // slight visual delay for realism without frustrating latency
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  return (
    <>
      {/* Floating Button */}
      <motion.button
        className="fixed bottom-6 right-6 bg-black/60 hover:bg-black/80 w-16 h-16 rounded-full shadow-[0_0_20px_rgba(56,189,248,0.4)] z-[60] flex items-center justify-center transition-colors border border-sky-400/50 backdrop-blur-md overflow-hidden p-0"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
      >
        <img src="/logo.png" alt="VisionFlow AI Assistant" className="w-full h-full object-cover" />
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-80 h-96 glass-panel rounded-2xl flex flex-col overflow-hidden shadow-2xl z-[60] border border-white/10 backdrop-blur-xl bg-black/60"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-3 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
                <h3 className="text-sky-300 font-semibold tracking-wide text-sm uppercase">VisionFlow AI</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col no-scrollbar">
              {messages.map((msg, i) => (
                <div key={i} className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${msg.isBot ? 'bg-white/10 border border-white/5 text-white/90 self-start rounded-tl-sm' : 'bg-sky-500/80 border border-sky-400/20 text-white self-end rounded-tr-sm'}`}>
                  {msg.text}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions (Scrollable horizontal) */}
            <div className="px-3 pb-3 flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
              {['Reduce eye strain', 'Improve focus', 'Why am I fatigued?'].map((action, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(action)}
                  className="shrink-0 whitespace-nowrap text-[0.7rem] bg-white/5 hover:bg-sky-500/30 border border-white/10 text-white/80 hover:text-white px-3 py-1.5 rounded-full transition-colors"
                >
                  {action}
                </button>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-white/10 bg-black/40 flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend(inputMessage)}
                placeholder="Ask about strain, focus..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500/50 focus:bg-white/10 transition-all placeholder:text-white/30"
              />
              <button 
                onClick={() => handleSend(inputMessage)}
                className="bg-sky-500 hover:bg-sky-400 text-white p-2 rounded-xl transition-colors shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </>
  );
}
