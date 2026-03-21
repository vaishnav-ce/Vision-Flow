import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AIAssistant from './AIAssistant';

export default function Dashboard({ metrics, status }) {
  // Determine global UI state from unified metrics
  const userState = metrics.userState || 'Focused';
  let glowClass = 'glow-green';
  let textGlow = 'text-glow-green';
  let textColor = 'text-emerald-400';

  if (userState === 'Distracted') {
    glowClass = 'glow-red';
    textGlow = 'text-glow-red';
    textColor = 'text-red-400';
  } else if (userState === 'Fatigued') {
    glowClass = 'glow-yellow';
    textGlow = 'text-glow-yellow';
    textColor = 'text-yellow-400';
  } else if (userState === 'Adapting') {
    glowClass = 'glow-blue';
    textGlow = 'text-glow-blue';
    textColor = 'text-sky-400';
  }

  // Apply CSS root variables for adaptive visual blur/scale
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--ui-scale', metrics.scale.toFixed(2));
    root.style.setProperty('--ui-blur', metrics.attention ? '0px' : '5px');
  }, [metrics]);

  return (
    <>
      {/* Background Ambience */}
      <div className="animated-bg"></div>
      <div className="ambient-light-ray"></div>

      <div className="dynamic-ui w-full max-w-6xl p-6 flex flex-col gap-8 relative z-10 font-sans">
        
        {/* Top Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center px-4 relative z-50"
        >
          <div className="flex items-center gap-4">
            <AIStatusIndicator status={status} userState={userState} />
            <div>
              <h1 className="text-3xl font-bold tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-sky-300 via-indigo-300 to-purple-300">
                VisionFlow
              </h1>
              <p className="opacity-60 text-sm tracking-widest font-light uppercase mt-1">
                Adaptive Human-Centric Interface
              </p>
            </div>
          </div>

          <HeaderMenu />
        </motion.header>

        {/* Main Center Section (Highlight Area) */}
        <motion.div 
          layout
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="flex justify-center my-4"
        >
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className={`glass-panel rounded-[2rem] p-12 w-full max-w-3xl flex flex-col justify-center items-center text-center transition-colors float-1 ${glowClass}`}
          >
            <h2 className="text-sm uppercase tracking-[0.3em] opacity-60 mb-6">Current User State</h2>
            <motion.div 
              key={userState}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-7xl font-light tracking-wider transition-colors uppercase ${textColor} ${textGlow}`}
            >
              {userState}
            </motion.div>
            
            <AnimatePresence mode="wait">
              <motion.p 
                key={userState}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-lg opacity-70 mt-8 font-light max-w-md"
              >
                {userState === 'Focused' && "Optimal engagement. AI vision systems stable and monitoring."}
                {userState === 'Distracted' && "Attention lost. Automatically blurring interface to preserve privacy and focus."}
                {userState === 'Fatigued' && "High cognitive load detected. Applying softer contrast and relaxing layout."}
                {userState === 'Adapting' && "Actively recalibrating optics based on environmental changes."}
              </motion.p>
            </AnimatePresence>

            <AIComfortAdvisor metrics={metrics} />
          </motion.div>
        </motion.div>

        {/* Secondary Cards Grid */}
        <motion.div 
          initial="hidden"
          animate="show"
          variants={{
             hidden: { opacity: 0 },
             show: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Interface Scale */}
          <SecondaryCard 
            title="Interface Scale" 
            value={<span>{(metrics.scale * 100).toFixed(0)}<span className="text-xl opacity-50 ml-1">%</span></span>}
            subtitle={metrics.scale > 1.1 ? "User far: Scaled UP" : metrics.scale < 0.9 ? "User close: Scaled DOWN" : "Optimal distance"}
            floatClass="float-2"
            isActive={metrics.scale !== 1}
          />
          
          {/* Environment Light */}
          <SecondaryCard 
            title="Environment Light" 
            value={metrics.isDark ? 'Dark Mode' : 'Light Mode'}
            subtitle={metrics.isDark ? "Low ambient light detected" : "High ambient light detected"}
            floatClass="float-3"
            isActive={metrics.isDark}
          />

          {/* Eye Strain Level */}
          <SecondaryCard 
            title="Eye Strain" 
            value={metrics.eyeStrain}
            subtitle={metrics.eyeStrain === 'Low' ? 'Conditions optimal' : 'Adjusting contrast'}
            floatClass="float-4"
            isActive={metrics.eyeStrain !== 'Low'}
            warning={metrics.eyeStrain === 'High'}
          />

          {/* Fatigue Level */}
          <SecondaryCard 
            title="Fatigue Level" 
            value={<span>{metrics.fatigue.toFixed(0)}<span className="text-xl opacity-50 ml-1">/100</span></span>}
            subtitle="Calculated via blink & posture"
            floatClass="float-1"
            isActive={metrics.fatigue > 50}
            warning={metrics.fatigue > 75}
          />
        </motion.div>
      </div>

      <AIAssistant metrics={metrics} />
    </>
  );
}

// Subcomponents

function SecondaryCard({ title, value, subtitle, floatClass, isActive, warning }) {
  let borderClass = 'border-white/5 hover:border-white/20 hover:glow-blue';
  if (warning) borderClass = 'border-yellow-500/30 glow-yellow';
  else if (isActive) borderClass = 'border-sky-500/30 glow-blue';

  return (
    <motion.div 
      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
      whileHover={{ scale: 1.03, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className={`glass-panel rounded-2xl p-6 flex flex-col justify-between h-[180px] ${floatClass} ${borderClass} transition-colors cursor-default`}
    >
      <div className="text-[0.65rem] uppercase tracking-widest opacity-50 font-semibold">{title}</div>
      <motion.div 
        key={String(value)}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`text-4xl font-light tracking-wide ${warning ? 'text-yellow-400' : isActive ? 'text-sky-300' : 'text-white/90'}`}
      >
        {value}
      </motion.div>
      <div className="text-xs opacity-40 font-light">{subtitle}</div>
    </motion.div>
  );
}

function AIStatusIndicator({ status, userState }) {
  let color = 'bg-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.6)]'; // Adapting/Normal
  if (status === 'initializing') {
    color = 'bg-slate-400 animate-pulse';
  } else if (userState === 'Focused') {
    color = 'bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.8)]';
  } else if (userState === 'Distracted') {
    color = 'bg-red-500 shadow-[0_0_20px_rgba(248,113,113,0.8)] animate-pulse';
  } else if (userState === 'Fatigued') {
    color = 'bg-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.8)]';
  }

  return (
    <div className="relative flex items-center justify-center w-8 h-8">
      <div className={`absolute inset-0 rounded-full opacity-30 animate-ping ${color}`}></div>
      <div className={`w-3.5 h-3.5 rounded-full z-10 transition-colors duration-500 ${color}`}></div>
    </div>
  );
}

function HeaderMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFeedback = () => {
    window.location.href = "mailto:pixelmindai2@gmail.com?subject=VisionFlow%20Feedback";
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none"
        aria-label="Menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80">
          <circle cx="12" cy="12" r="1"></circle>
          <circle cx="12" cy="5" r="1"></circle>
          <circle cx="12" cy="19" r="1"></circle>
        </svg>
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-48 rounded-xl glass-panel border border-white/10 overflow-hidden shadow-2xl flex flex-col backdrop-blur-md bg-black/40"
          >
            <button
              onClick={handleFeedback}
              className="px-4 py-3 text-sm text-left hover:bg-white/10 transition-colors flex items-center gap-3 text-white/90"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              Give Feedback
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AIComfortAdvisor({ metrics }) {
  const [suggestion, setSuggestion] = useState("✅ Optimal conditions");

  useEffect(() => {
    let targetSuggestion = "✅ Optimal conditions";

    if (metrics.fatigue > 60) {
      targetSuggestion = "⚠️ High eye strain detected. Consider increasing distance or adjusting brightness.";
    } else if (metrics.scale < 0.9) {
      targetSuggestion = "📏 You are too close to the screen. Move back for better comfort.";
    } else if (metrics.fatigue > 40) {
      targetSuggestion = "🧘 You've been active for a while. Consider taking a short break.";
    } else if (metrics.isDark) {
      targetSuggestion = "💡 Low light detected. Turn on lights to reduce eye strain.";
    }

    const timeout = setTimeout(() => {
      setSuggestion(targetSuggestion);
    }, 400);

    return () => clearTimeout(timeout);
  }, [metrics.fatigue, metrics.scale, metrics.isDark]);

  return (
    <div className="mt-8 flex justify-center w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={suggestion}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="text-sm font-light text-sky-200/80 tracking-wide px-6 py-2 rounded-full bg-white/5 border border-white/10 shadow-[0_0_15px_rgba(56,189,248,0.15)] backdrop-blur-sm"
        >
          {suggestion}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
