import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Delete, Eye, EyeOff, Shield, HelpCircle, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { ThemeColors } from '../types.ts';

interface PinLockScreenProps {
  correctPin: string;
  userName: string;
  recoveryEmail: string;
  theme: ThemeColors;
  onUnlock: () => void;
  onResetPin: (newPin: string) => void;
}

export default function PinLockScreen({ correctPin, userName, recoveryEmail, theme, onUnlock, onResetPin }: PinLockScreenProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);
  const [showForgot, setShowForgot] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<'email' | 'code' | 'newpin' | 'done'>('email');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [newPin, setNewPin] = useState('');
  const [recoveryError, setRecoveryError] = useState('');

  useEffect(() => {
    if (locked && lockTimer > 0) {
      const timer = setTimeout(() => setLockTimer(lockTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (locked && lockTimer === 0) {
      setLocked(false);
      setAttempts(0);
    }
  }, [locked, lockTimer]);

  const handleSubmit = useCallback(() => {
    if (pin === correctPin) {
      onUnlock();
    } else {
      setError(true);
      setAttempts(prev => prev + 1);
      setTimeout(() => { setError(false); setPin(''); }, 600);
      if (attempts + 1 >= 5) { setLocked(true); setLockTimer(30); setPin(''); }
    }
  }, [pin, correctPin, onUnlock, attempts]);

  useEffect(() => {
    if (pin.length === 4 && !showForgot) setTimeout(handleSubmit, 200);
  }, [pin, handleSubmit, showForgot]);

  const handleKeyPress = useCallback((digit: string) => {
    if (locked || pin.length >= 4 || showForgot) return;
    setPin(prev => prev + digit);
  }, [locked, pin.length, showForgot]);

  const handleDelete = useCallback(() => {
    if (showForgot) return;
    setPin(prev => prev.slice(0, -1));
  }, [showForgot]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showForgot) return;
      if (e.key >= '0' && e.key <= '9') handleKeyPress(e.key);
      else if (e.key === 'Backspace') handleDelete();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress, handleDelete, showForgot]);

  const startRecovery = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setRecoveryStep('email');
    setShowForgot(true);
    setRecoveryError('');
    setRecoveryCode('');
    setNewPin('');
  };

  const handleSendCode = () => {
    // Simulate sending email — in a real app, this would call an API
    setRecoveryStep('code');
    // For demo, show the code (in production, it would be emailed)
    alert(`Recovery code sent to ${maskEmail(recoveryEmail)}\n\nDemo code: ${generatedCode}`);
  };

  const handleVerifyCode = () => {
    if (recoveryCode === generatedCode) {
      setRecoveryStep('newpin');
      setRecoveryError('');
    } else {
      setRecoveryError('Invalid code. Try again.');
    }
  };

  const handleResetComplete = () => {
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setRecoveryError('PIN must be exactly 4 digits');
      return;
    }
    onResetPin(newPin);
    setRecoveryStep('done');
    setTimeout(() => {
      setShowForgot(false);
      onUnlock();
    }, 1500);
  };

  const maskEmail = (email: string) => {
    if (!email) return '***';
    const [user, domain] = email.split('@');
    return user.slice(0, 2) + '***@' + domain;
  };

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden"
      style={{ background: `linear-gradient(135deg, ${theme.lockBgFrom}, ${theme.lockBgVia}, ${theme.lockBgTo})` }}>
      {/* Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div key={i} className="absolute w-1 h-1 rounded-full"
            style={{ backgroundColor: theme.particleColor }}
            initial={{ x: Math.random() * 1200, y: Math.random() * 900 }}
            animate={{ y: [null, Math.random() * -500], opacity: [0, 1, 0] }}
            transition={{ duration: Math.random() * 5 + 3, repeat: Infinity, ease: 'linear' }} />
        ))}
      </div>
      <div className="relative z-10 min-h-screen w-full flex items-center justify-center py-8 px-4">

      <AnimatePresence mode="wait">
        {!showForgot ? (
          <motion.div key="lock" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }} className="relative z-10 flex flex-col items-center">
            {/* Shield */}
            <motion.div className="mb-6" animate={error ? { rotate: [0, -10, 10, -10, 10, 0] } : {}} transition={{ duration: 0.5 }}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${theme.accentGradientFrom}, ${theme.accentGradientTo})`,
                  boxShadow: `0 0 30px ${theme.accentGlow}` }}>
                <Shield className="w-10 h-10 text-white" />
              </div>
            </motion.div>

            <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">
              Lockd<span style={{ color: theme.accent }}>.</span>
            </h1>
            <p className="text-xs mb-3 italic" style={{ color: theme.accent }}>
              "Write like no one's reading."
            </p>
            <p className="text-sm mb-1" style={{ color: theme.textSecondary }}>
              {userName ? `Welcome back, ${userName}` : 'Welcome back'}
            </p>
            <p className="text-xs mb-8" style={{ color: theme.textMuted }}>
              {locked ? `Too many attempts. Wait ${lockTimer}s` : 'Enter your PIN to unlock'}
            </p>

            {/* PIN Dots */}
            <div className="flex gap-4 mb-8">
              {[0, 1, 2, 3].map(i => (
                <motion.div key={i}
                  className="w-4 h-4 rounded-full border-2 transition-all duration-200"
                  style={{
                    borderColor: error ? '#ef4444' : pin.length > i ? theme.accent : theme.textMuted,
                    backgroundColor: error ? '#ef4444' : pin.length > i ? theme.accent : 'transparent',
                  }}
                  animate={error ? { x: [0, -4, 4, -4, 4, 0] } : pin.length > i ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: error ? 0.4 : 0.2, delay: error ? i * 0.05 : 0 }} />
              ))}
            </div>

            {/* Show PIN toggle */}
            <button onClick={() => setShowPin(!showPin)} className="flex items-center gap-1 text-xs mb-4 transition"
              style={{ color: theme.textMuted }}>
              {showPin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              {showPin ? pin.padEnd(4, '·') : ''}
            </button>

            {attempts > 0 && !locked && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs mb-4">
                {5 - attempts} attempts remaining
              </motion.p>
            )}

            {/* Number Pad */}
            <div className="grid grid-cols-3 gap-3 w-64">
              {digits.map((digit, i) => {
                if (digit === '') return <div key={i} />;
                if (digit === 'del') {
                  return (
                    <motion.button key={i} whileTap={{ scale: 0.9 }} onClick={handleDelete} disabled={locked}
                      className="w-16 h-16 mx-auto rounded-full flex items-center justify-center hover:bg-white/10 transition-all disabled:opacity-30"
                      style={{ color: theme.textSecondary }}>
                      <Delete className="w-6 h-6" />
                    </motion.button>
                  );
                }
                return (
                  <motion.button key={i} whileTap={{ scale: 0.85 }} onClick={() => handleKeyPress(digit)} disabled={locked}
                    className="w-16 h-16 mx-auto rounded-full bg-white/5 border border-white/10 text-white text-xl font-medium hover:border-white/20 transition-all disabled:opacity-30 flex items-center justify-center">
                    {digit}
                  </motion.button>
                );
              })}
            </div>

            {/* Forgot PIN */}
            {recoveryEmail && (
              <button onClick={startRecovery} className="mt-8 flex items-center gap-1 text-xs transition hover:underline"
                style={{ color: theme.accent }}>
                <HelpCircle className="w-3 h-3" /> Forgot PIN?
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div key="forgot" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }} className="relative z-10 flex flex-col items-center w-full max-w-sm px-4">
            
            {recoveryStep === 'email' && (
              <>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: `linear-gradient(135deg, ${theme.accentGradientFrom}, ${theme.accentGradientTo})` }}>
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Reset Your PIN</h2>
                <p className="text-sm text-center mb-6" style={{ color: theme.textMuted }}>
                  We'll send a recovery code to<br />
                  <span className="text-white font-medium">{maskEmail(recoveryEmail)}</span>
                </p>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSendCode}
                  className="w-full py-3 rounded-xl text-white font-semibold text-sm mb-3"
                  style={{ background: `linear-gradient(135deg, ${theme.accentGradientFrom}, ${theme.accentGradientTo})` }}>
                  Send Recovery Code
                </motion.button>
                <button onClick={() => setShowForgot(false)}
                  className="flex items-center gap-1 text-sm mt-2" style={{ color: theme.textMuted }}>
                  <ArrowLeft className="w-4 h-4" /> Back to login
                </button>
              </>
            )}

            {recoveryStep === 'code' && (
              <>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: `linear-gradient(135deg, ${theme.accentGradientFrom}, ${theme.accentGradientTo})` }}>
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Enter Recovery Code</h2>
                <p className="text-sm text-center mb-6" style={{ color: theme.textMuted }}>
                  Check your email for the 6-digit code
                </p>
                <input type="text" value={recoveryCode}
                  onChange={(e) => setRecoveryCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000" maxLength={6} autoFocus
                  className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-center text-2xl tracking-[0.5em] outline-none focus:border-white/30 transition placeholder:text-gray-600 font-mono mb-2" />
                {recoveryError && <p className="text-red-400 text-xs mb-2">{recoveryError}</p>}
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleVerifyCode}
                  disabled={recoveryCode.length !== 6}
                  className="w-full py-3 rounded-xl text-white font-semibold text-sm mt-3 disabled:opacity-30"
                  style={{ background: `linear-gradient(135deg, ${theme.accentGradientFrom}, ${theme.accentGradientTo})` }}>
                  Verify Code
                </motion.button>
                <button onClick={() => setRecoveryStep('email')}
                  className="flex items-center gap-1 text-sm mt-3" style={{ color: theme.textMuted }}>
                  <ArrowLeft className="w-4 h-4" /> Resend code
                </button>
              </>
            )}

            {recoveryStep === 'newpin' && (
              <>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: `linear-gradient(135deg, ${theme.accentGradientFrom}, ${theme.accentGradientTo})` }}>
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Set New PIN</h2>
                <p className="text-sm text-center mb-6" style={{ color: theme.textMuted }}>
                  Choose a new 4-digit PIN
                </p>
                <input type="password" value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="····" maxLength={4} autoFocus
                  className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-center text-2xl tracking-[0.5em] outline-none focus:border-white/30 transition placeholder:text-gray-600 font-mono mb-2" />
                {recoveryError && <p className="text-red-400 text-xs mb-2">{recoveryError}</p>}
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleResetComplete}
                  disabled={newPin.length !== 4}
                  className="w-full py-3 rounded-xl text-white font-semibold text-sm mt-3 disabled:opacity-30"
                  style={{ background: `linear-gradient(135deg, ${theme.accentGradientFrom}, ${theme.accentGradientTo})` }}>
                  Reset PIN
                </motion.button>
              </>
            )}

            {recoveryStep === 'done' && (
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">PIN Reset!</h2>
                <p className="text-sm" style={{ color: theme.textMuted }}>Unlocking your vault...</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
