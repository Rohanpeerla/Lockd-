import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ShieldAlert, X } from 'lucide-react';
import { ThemeColors } from '../types.ts';

interface NotePinModalProps {
  title: string;
  expectedPin: string;
  theme: ThemeColors;
  onUnlock: () => void;
  onClose: () => void;
}

export default function NotePinModal({ title, expectedPin, theme, onUnlock, onClose }: NotePinModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (pin.length === 4) {
      const timer = setTimeout(() => {
        if (pin === expectedPin) {
          onUnlock();
        } else {
          setError(true);
          setTimeout(() => {
            setError(false);
            setPin('');
          }, 700);
        }
      }, 180);
      return () => clearTimeout(timer);
    }
  }, [pin, expectedPin, onUnlock]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
        transition={{ type: 'spring', damping: 22, stiffness: 250 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ backgroundColor: theme.bgSurface, border: `1px solid ${theme.border}`, boxShadow: `0 10px 40px ${theme.accentGlow}` }}>
        <div className="h-1" style={{ background: `linear-gradient(90deg, ${theme.accentGradientFrom}, ${theme.accentGradientTo})` }} />

        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${theme.border}` }}>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: theme.tagBg, color: theme.accent }}>
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold" style={{ color: theme.textPrimary }}>Private note unlock</h3>
              <p className="text-[11px]" style={{ color: theme.textMuted }}>Second layer protection</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-red-500/10 transition" style={{ color: theme.textMuted }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-6 text-center">
          <p className="text-sm font-medium truncate" style={{ color: theme.textPrimary }}>{title || 'Untitled private note'}</p>
          <p className="text-xs mt-1 mb-5" style={{ color: theme.textMuted }}>
            Enter this note's personal PIN to reveal it.
          </p>

          <div className="flex justify-center gap-3 mb-5">
            {[0, 1, 2, 3].map(i => (
              <motion.div key={i}
                className="w-4 h-4 rounded-full border-2"
                style={{
                  borderColor: error ? '#ef4444' : pin.length > i ? theme.accent : theme.border,
                  backgroundColor: error ? '#ef4444' : pin.length > i ? theme.accent : 'transparent',
                }}
                animate={error ? { x: [0, -4, 4, -4, 4, 0] } : {}}
                transition={{ duration: 0.35 }}
              />
            ))}
          </div>

          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            autoFocus
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="••••"
            className="w-full px-4 py-3 rounded-xl text-center text-xl tracking-[0.5em] outline-none border placeholder:text-gray-600"
            style={{ backgroundColor: theme.bgInput, borderColor: error ? '#ef4444' : theme.border, color: theme.textPrimary }}
          />

          <div className="min-h-6 mt-2">
            {error ? (
              <p className="text-xs text-red-400 inline-flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" /> Wrong note PIN
              </p>
            ) : (
              <p className="text-[11px]" style={{ color: theme.textMuted }}>
                Locked preview stays blurred until this PIN is correct.
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
