import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Delete, ArrowLeft, ArrowRight, Sparkles, KeyRound, Lock, CheckCircle2, Mail, User } from 'lucide-react';
import { ThemeStyle } from '../types.ts';

interface PinSetupScreenProps {
  onComplete: (data: { pin: string; themeStyle: ThemeStyle; email: string; userName: string }) => void;
}

type SetupStep = 'welcome' | 'name' | 'theme' | 'email' | 'create' | 'confirm' | 'done';

export default function PinSetupScreen({ onComplete }: PinSetupScreenProps) {
  const [step, setStep] = useState<SetupStep>('welcome');
  const [userName, setUserName] = useState('');
  const [themeStyle, setThemeStyle] = useState<ThemeStyle>('boy');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isBoy = themeStyle === 'boy';
  const accentFrom = isBoy ? '#0ea5e9' : '#ec4899';
  const accentTo = isBoy ? '#6366f1' : '#a855f7';
  const particleBg = isBoy ? 'bg-sky-400/20' : 'bg-pink-400/20';
  const dotActive = isBoy ? 'border-sky-400 bg-sky-400' : 'border-pink-400 bg-pink-400';
  const dotActiveStep = isBoy ? 'bg-sky-400' : 'bg-pink-400';
  const dotPast = isBoy ? 'bg-sky-400/60' : 'bg-pink-400/60';
  const lockBg = isBoy
    ? 'from-[#020617] via-[#0c1a3a] to-[#020617]'
    : 'from-[#1a0312] via-[#2d0a20] to-[#1a0312]';

  useEffect(() => {
    if (step === 'create' && pin.length === 4) {
      setTimeout(() => setStep('confirm'), 300);
    }
  }, [pin, step]);

  useEffect(() => {
    if (step === 'confirm' && confirmPin.length === 4) {
      setTimeout(() => {
        if (confirmPin === pin) {
          setStep('done');
          setTimeout(() => onComplete({ pin, themeStyle, email, userName: userName.trim() || 'User' }), 1800);
        } else {
          setError(true);
          setErrorMsg("PINs don't match! Try again.");
          setTimeout(() => { setError(false); setConfirmPin(''); }, 800);
        }
      }, 300);
    }
  }, [confirmPin, pin, step, onComplete, themeStyle, email, userName]);

  const activePin = step === 'create' ? pin : confirmPin;
  const setActivePin = step === 'create' ? setPin : setConfirmPin;

  const handleKeyPress = useCallback((digit: string) => {
    if (step !== 'create' && step !== 'confirm') return;
    if (activePin.length >= 4) return;
    setActivePin(prev => prev + digit);
  }, [step, activePin, setActivePin]);

  const handleDelete = useCallback(() => {
    if (step !== 'create' && step !== 'confirm') return;
    setActivePin(prev => prev.slice(0, -1));
  }, [step, setActivePin]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (step === 'create' || step === 'confirm') {
        if (e.key >= '0' && e.key <= '9') handleKeyPress(e.key);
        else if (e.key === 'Backspace') handleDelete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress, handleDelete, step]);

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];
  const allSteps: SetupStep[] = ['welcome', 'name', 'theme', 'email', 'create', 'confirm', 'done'];
  const stepIndex = allSteps.indexOf(step);
  const progressPercent = ((stepIndex + 1) / allSteps.length) * 100;
  const currentPinDisplay = step === 'create' ? pin : confirmPin;

  return (
    <div className={`fixed inset-0 bg-gradient-to-br ${lockBg} z-50 overflow-y-auto overflow-x-hidden`}>
      {/* Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full ${i % 2 === 0 ? `w-1.5 h-1.5 ${particleBg}` : `w-1 h-1 ${particleBg}`}`}
            initial={{ x: Math.random() * 1200, y: Math.random() * 900 }}
            animate={{ y: [null, Math.random() * -700], opacity: [0, 0.7, 0] }}
            transition={{ duration: Math.random() * 7 + 4, repeat: Infinity, ease: 'linear', delay: Math.random() * 3 }}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/5">
        <motion.div
          className="h-full"
          style={{ background: `linear-gradient(90deg, ${accentFrom}, ${accentTo})` }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Step dots */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {allSteps.map((s, i) => (
          <motion.div
            key={s}
            className={`h-2 rounded-full transition-all duration-300 ${
              s === step ? `${dotActiveStep} w-6` : stepIndex > i ? dotPast : 'bg-white/10'
            } ${s !== step ? 'w-2' : ''}`}
            layout
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen w-full flex items-center justify-center py-16 px-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.95 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center w-full max-w-md"
        >
          {/* WELCOME */}
          {step === 'welcome' && (
            <>
              <motion.div className="mb-4" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }}>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-2xl">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </motion.div>
              <h1 className="text-3xl font-bold text-white mb-1 text-center tracking-tight">
                Lockd<span style={{ color: accentFrom }}>.</span>
              </h1>
              <p className="text-xs mb-1 text-center font-medium italic" style={{ color: accentFrom }}>
                "Write like no one's reading."
              </p>
              <p className="text-[11px] mb-4 text-center" style={{ color: '#6b7280' }}>
                (Because no one is.) 🔐
              </p>
              <div className="grid grid-cols-2 gap-2 w-full mb-5">
                {[
                  { icon: '🔐', title: 'PIN Protected' },
                  { icon: '📧', title: 'Forgot PIN Recovery' },
                  { icon: '🎨', title: 'Choose Your Theme' },
                  { icon: '💾', title: '100% Private' },
                ].map((f, i) => (
                  <motion.div key={f.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.08 }}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-base flex-shrink-0">{f.icon}</span>
                    <p className="text-white text-[11px] font-medium leading-tight">{f.title}</p>
                  </motion.div>
                ))}
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setStep('name')}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-semibold text-sm shadow-lg"
                style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}>
                Let's Go <ArrowRight className="w-4 h-4" />
              </motion.button>
            </>
          )}

          {/* NAME */}
          {step === 'name' && (
            <>
              <motion.div className="mb-6" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }}>
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl">
                  <User className="w-10 h-10 text-white" />
                </div>
              </motion.div>
              <h1 className="text-2xl font-bold text-white mb-2 text-center">What's your name?</h1>
              <p className="text-gray-400 text-sm mb-8 text-center">So we can personalize your experience ✨</p>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name..."
                autoFocus
                className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-center text-lg outline-none focus:border-white/30 transition placeholder:text-gray-600 mb-6"
                onKeyDown={(e) => { if (e.key === 'Enter' && userName.trim()) setStep('theme'); }}
              />
              <div className="flex gap-3 w-full">
                <button onClick={() => setStep('welcome')} className="px-4 py-3 rounded-xl bg-white/5 text-gray-400 text-sm hover:bg-white/10 transition">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setStep('theme')} disabled={!userName.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-30"
                  style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}>
                  Next <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </>
          )}

          {/* THEME SELECT */}
          {step === 'theme' && (
            <>
              <h1 className="text-2xl font-bold text-white mb-2 text-center">Choose Your Vibe</h1>
              <p className="text-gray-400 text-sm mb-8 text-center">Pick a theme that matches your style 🎨</p>
              <div className="grid grid-cols-2 gap-4 w-full mb-8">
                {/* Boy Theme Card */}
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setThemeStyle('boy')}
                  className={`relative p-5 rounded-2xl border-2 transition-all overflow-hidden ${
                    themeStyle === 'boy' ? 'border-sky-400 shadow-lg shadow-sky-500/20' : 'border-white/10 hover:border-white/20'
                  }`}
                  style={{ background: 'linear-gradient(135deg, #0a0e1a, #0c1a3a)' }}>
                  <div className="text-4xl mb-3">⚡</div>
                  <h3 className="text-white font-bold text-sm mb-1">Dark Neon</h3>
                  <p className="text-gray-400 text-xs">Dark blue, cyan glow, bold & sharp</p>
                  <div className="flex gap-1 mt-3">
                    {['#0ea5e9', '#38bdf8', '#6366f1', '#1e3a5f'].map(c => (
                      <div key={c} className="w-4 h-4 rounded-full" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  {themeStyle === 'boy' && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-sky-400 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </motion.button>
                {/* Girl Theme Card */}
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setThemeStyle('girl')}
                  className={`relative p-5 rounded-2xl border-2 transition-all overflow-hidden ${
                    themeStyle === 'girl' ? 'border-pink-400 shadow-lg shadow-pink-500/20' : 'border-white/10 hover:border-white/20'
                  }`}
                  style={{ background: 'linear-gradient(135deg, #1a0a14, #2d0a20)' }}>
                  <div className="text-4xl mb-3">🌸</div>
                  <h3 className="text-white font-bold text-sm mb-1">Rose Glow</h3>
                  <p className="text-gray-400 text-xs">Pink, rose gold, soft & aesthetic</p>
                  <div className="flex gap-1 mt-3">
                    {['#ec4899', '#f9a8d4', '#a855f7', '#4a1942'].map(c => (
                      <div key={c} className="w-4 h-4 rounded-full" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  {themeStyle === 'girl' && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-pink-400 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </motion.button>
              </div>
              <div className="flex gap-3 w-full">
                <button onClick={() => setStep('name')} className="px-4 py-3 rounded-xl bg-white/5 text-gray-400 text-sm hover:bg-white/10 transition">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setStep('email')}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm"
                  style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}>
                  Next <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </>
          )}

          {/* EMAIL */}
          {step === 'email' && (
            <>
              <motion.div className="mb-6" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }}>
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl"
                  style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}>
                  <Mail className="w-10 h-10 text-white" />
                </div>
              </motion.div>
              <h1 className="text-2xl font-bold text-white mb-2 text-center">Recovery Email</h1>
              <p className="text-gray-400 text-sm mb-8 text-center max-w-xs">
                In case you forget your PIN, we'll send a recovery code to this email.
              </p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                autoFocus
                className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-center text-base outline-none focus:border-white/30 transition placeholder:text-gray-600 mb-2"
                onKeyDown={(e) => { if (e.key === 'Enter') setStep('create'); }}
              />
              <p className="text-gray-600 text-xs mb-6 text-center">Optional — but recommended for PIN recovery</p>
              <div className="flex gap-3 w-full">
                <button onClick={() => setStep('theme')} className="px-4 py-3 rounded-xl bg-white/5 text-gray-400 text-sm hover:bg-white/10 transition">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setStep('create')}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm"
                  style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}>
                  {email ? 'Next' : 'Skip'} <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </>
          )}

          {/* CREATE & CONFIRM PIN */}
          {(step === 'create' || step === 'confirm') && (
            <>
              <motion.div className="mb-6" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }}>
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl"
                  style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}>
                  {step === 'create' ? <KeyRound className="w-10 h-10 text-white" /> : <Lock className="w-10 h-10 text-white" />}
                </div>
              </motion.div>
              <h1 className="text-2xl font-bold text-white mb-2 text-center">
                {step === 'create' ? 'Create Your PIN' : 'Confirm Your PIN'}
              </h1>
              <p className="text-gray-400 text-sm mb-6 text-center">
                {step === 'create' ? 'Choose a 4-digit PIN to protect your notes' : 'Enter the same PIN again'}
              </p>

              {/* PIN Dots */}
              <div className="flex gap-4 mb-2">
                {[0, 1, 2, 3].map(i => (
                  <motion.div key={i}
                    className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                      error ? 'border-red-500 bg-red-500'
                        : currentPinDisplay.length > i ? dotActive : 'border-gray-500'
                    }`}
                    animate={error ? { x: [0, -5, 5, -5, 5, 0] } : currentPinDisplay.length > i ? { scale: [1, 1.4, 1] } : {}}
                    transition={{ duration: error ? 0.4 : 0.2, delay: error ? i * 0.05 : 0 }}
                  />
                ))}
              </div>
              <div className="h-6 flex items-center mb-4">
                {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs">{errorMsg}</motion.p>}
              </div>

              {/* Number Pad */}
              <div className="grid grid-cols-3 gap-3 w-64">
                {digits.map((digit, i) => {
                  if (digit === '') {
                    return step === 'confirm' ? (
                      <motion.button key={i} whileTap={{ scale: 0.9 }}
                        onClick={() => { setConfirmPin(''); setStep('create'); setPin(''); }}
                        className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                        <ArrowLeft className="w-5 h-5" />
                      </motion.button>
                    ) : <div key={i} />;
                  }
                  if (digit === 'del') {
                    return (
                      <motion.button key={i} whileTap={{ scale: 0.9 }} onClick={handleDelete}
                        className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                        <Delete className="w-6 h-6" />
                      </motion.button>
                    );
                  }
                  return (
                    <motion.button key={i} whileTap={{ scale: 0.85 }} whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                      onClick={() => handleKeyPress(digit)}
                      className="w-16 h-16 mx-auto rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-white text-xl font-medium hover:border-white/20 transition-all flex items-center justify-center">
                      {digit}
                    </motion.button>
                  );
                })}
              </div>
            </>
          )}

          {/* DONE */}
          {step === 'done' && (
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex flex-col items-center">
              <motion.div animate={{ rotate: [0, 10, -10, 10, 0] }} transition={{ duration: 0.5, delay: 0.2 }} className="text-7xl mb-4">
                🎉
              </motion.div>
              <h1 className="text-2xl font-bold text-white mb-2">Welcome to Lockd, {userName.trim() || 'User'}!</h1>
              <p className="text-gray-400 text-sm mb-6 text-center">Your private vault is ready. Your thoughts are locked. 🔐</p>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full border" style={{ borderColor: accentFrom + '40', backgroundColor: accentFrom + '10' }}>
                <ShieldCheck className="w-4 h-4" style={{ color: accentFrom }} />
                <span className="text-sm font-medium" style={{ color: accentFrom }}>PIN secured</span>
              </div>
              <motion.div className="mt-6 w-48 h-1 rounded-full bg-white/5 overflow-hidden">
                <motion.div className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${accentFrom}, ${accentTo})` }}
                  initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 1.5, ease: 'easeInOut' }} />
              </motion.div>
              <p className="text-gray-500 text-xs mt-2">Opening your vault...</p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
      </div>
    </div>
  );
}
