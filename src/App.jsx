import { useState, useEffect } from 'react'
import { useCameraAI } from './hooks/useCameraAI'
import Dashboard from './components/Dashboard'
import Auth from './components/Auth'
import { motion, AnimatePresence } from 'framer-motion'
import { auth } from './firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'

function MainApp({ user }) {
  const { videoRef, metrics, status } = useCameraAI();

  // Determine border color for camera frame
  let cameraBorder = 'border-sky-500/40 shadow-[0_0_20px_rgba(56,189,248,0.2)]';
  if (!metrics.attention) {
    cameraBorder = 'border-red-500/50 shadow-[0_0_20px_rgba(248,113,113,0.4)]';
  } else if (status === 'active') {
    cameraBorder = 'border-emerald-500/50 shadow-[0_0_20px_rgba(52,211,153,0.4)]';
  }

  return (
    <>
      <button 
        onClick={() => signOut(auth)}
        className="fixed top-6 right-6 z-50 text-[0.65rem] uppercase tracking-widest text-white/50 hover:text-white transition-colors border border-white/10 hover:border-white/30 bg-black/50 px-4 py-2 rounded-full backdrop-blur-md"
      >
        Disconnect {user.email}
      </button>

      <Dashboard metrics={metrics} status={status} />
      
      {/* Dynamic Camera Feed UI */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="fixed bottom-8 right-8 z-20 group"
      >
        <div className="mb-3 flex justify-end">
           <motion.div 
             initial={{ opacity: 0.5 }}
             animate={{ opacity: 1 }}
             className="text-[0.65rem] uppercase tracking-[0.2em] font-bold bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2 text-white/80"
           >
              <span className={`w-1.5 h-1.5 rounded-full ${!metrics.attention ? 'bg-red-500' : 'bg-emerald-400 animate-pulse'}`}></span>
              AI Vision Active
           </motion.div>
        </div>
        
        <div className={`relative rounded-[1.5rem] overflow-hidden w-64 aspect-[4/3] bg-black/90 transition-colors duration-500 border-2 ${cameraBorder}`}>
          
          <video 
            ref={videoRef} 
            className="w-full h-full object-cover transform -scale-x-100 opacity-50 mix-blend-screen scale-110"
            playsInline
            muted
          />
          
          {/* Cyberpunk scanning line overlay */}
          <div className="absolute inset-x-0 h-8 bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent animate-[scan_3s_linear_infinite] pointer-events-none"></div>

          {/* Status Overlay */}
          {status !== 'active' && (
             <div className="absolute inset-0 flex items-center justify-center bg-[#05050f]/80 backdrop-blur-md">
                <div className="text-[0.65rem] uppercase font-mono tracking-[0.3em] text-cyan-300 animate-pulse">
                  {status === 'initializing' ? 'INITIALIZING OPTICS...' : 'SENSOR ERROR'}
                </div>
             </div>
          )}
          
          {/* Viewfinder brackets */}
          <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-white/30 rounded-tl-sm"></div>
          <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-white/30 rounded-tr-sm"></div>
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-white/30 rounded-bl-sm"></div>
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-white/30 rounded-br-sm"></div>
        </div>
      </motion.div>
    </>
  )
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#05050f] flex items-center justify-center relative">
        <div className="animated-bg"></div>
        <div className="text-sky-300 text-xs uppercase tracking-[0.3em] font-mono animate-pulse z-10">
          Establishing Secure Link...
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {user ? (
        <motion.div key="mainApp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <MainApp user={user} />
        </motion.div>
      ) : (
        <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <Auth />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;
