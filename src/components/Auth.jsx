import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInAnonymously 
} from 'firebase/auth';
import { auth } from '../firebase';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    }
  };

  const handleAnonymousSignIn = async () => {
    setError('');
    try {
      await signInAnonymously(auth);
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative z-20 p-4 font-sans">
      <div className="animated-bg"></div>
      <div className="ambient-light-ray"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="glass-panel w-full max-w-md p-10 rounded-3xl relative glow-blue float-slight flex flex-col items-center"
      >
        <div className="text-center mb-8 w-full relative">
          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
             <div className="w-16 h-16 rounded-full bg-black/50 border-2 border-indigo-500/50 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                <div className="w-8 h-8 rounded-full bg-indigo-500/80 animate-pulse"></div>
             </div>
          </div>
          <h1 className="text-4xl mt-4 font-bold tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-sky-300 via-indigo-300 to-purple-300">
            VisionFlow
          </h1>
          <p className="opacity-60 text-[0.65rem] tracking-[0.2em] font-light uppercase mt-2">
            Secure Terminal Access
          </p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }}
              className="w-full overflow-hidden"
            >
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono tracking-wide text-center">
                [ERROR] {error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
          <div>
            <label className="text-[0.65rem] uppercase tracking-widest opacity-60 ml-2 mb-2 block">Authentication Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3 text-white/90 placeholder-white/20 focus:outline-none focus:border-sky-500/50 focus:shadow-[0_0_15px_rgba(56,189,248,0.2)] transition-all font-light tracking-wide"
              placeholder="sysadmin@visionflow.ai"
            />
          </div>
          <div>
            <label className="text-[0.65rem] uppercase tracking-widest opacity-60 ml-2 mb-2 block">Security Passkey</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3 text-white/90 placeholder-white/20 focus:outline-none focus:border-purple-500/50 focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all font-light tracking-wide"
              placeholder="••••••••"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-indigo-600/80 to-purple-600/80 hover:from-indigo-500/90 hover:to-purple-500/90 border border-indigo-400/30 py-4 rounded-2xl text-white font-semibold tracking-widest uppercase transition-colors"
          >
            {loading ? 'Authenticating...' : (isLogin ? 'Initialize Session' : 'Register Identity')}
          </motion.button>
        </form>

        <div className="w-full flex items-center justify-between mt-6 opacity-40">
           <div className="h-px bg-white w-full"></div>
           <span className="text-[0.65rem] uppercase tracking-[0.2em] px-4">OR</span>
           <div className="h-px bg-white w-full"></div>
        </div>

        <div className="flex flex-col gap-3 w-full mt-6">
          <motion.button
            whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.15)' }}
            whileTap={{ scale: 0.99 }}
            onClick={handleGoogleSignIn}
            className="w-full bg-white/5 border border-white/10 py-3 rounded-2xl text-white font-medium tracking-wide flex items-center justify-center gap-3 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
               <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
               <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
               <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
               <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.1)' }}
            whileTap={{ scale: 0.99 }}
            onClick={handleAnonymousSignIn}
            className="w-full bg-transparent border border-white/5 hover:border-white/20 py-3 rounded-2xl text-white/70 font-medium tracking-wide transition-colors"
          >
            Enter Anonymously (Guest Access)
          </motion.button>
        </div>

        <div className="mt-8 text-center bg-black/20 w-full py-4 rounded-2xl border border-white/5">
          <button 
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-[0.65rem] opacity-60 hover:opacity-100 hover:text-sky-400 transition-colors uppercase tracking-[0.2em]"
          >
            {isLogin ? 'Create New Identity' : 'Return to Login'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
