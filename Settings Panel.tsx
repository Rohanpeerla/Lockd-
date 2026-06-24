import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Lock, Timer, Save, Check, AlertTriangle, Trash2, Mail, Palette, User } from 'lucide-react';
import { AppSettings, ThemeColors, ThemeStyle } from '../types';

interface SettingsPanelProps {
  settings: AppSettings;
  theme: ThemeColors;
  onSave: (settings: AppSettings) => void;
  onClose: () => void;
  onClearTrash: () => void;
  trashCount: number;
}

export default function SettingsPanel({ settings, theme, onSave, onClose, onClearTrash, trashCount }: SettingsPanelProps) {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);
  const [autoLock, setAutoLock] = useState(settings.autoLockMinutes);
  const [email, setEmail] = useState(settings.recoveryEmail);
  const [emailSaved, setEmailSaved] = useState(false);
  const [name, setName] = useState(settings.userName);
  const [nameSaved, setNameSaved] = useState(false);

  const handleChangePin = () => {
    setPinError(''); setPinSuccess(false);
    if (currentPin !== settings.pin) { setPinError('Current PIN is incorrect'); return; }
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) { setPinError('New PIN must be exactly 4 digits'); return; }
    if (newPin !== confirmPin) { setPinError('PINs do not match'); return; }
    onSave({ ...settings, pin: newPin });
    setPinSuccess(true); setCurrentPin(''); setNewPin(''); setConfirmPin('');
    setTimeout(() => setPinSuccess(false), 3000);
  };

  const inputStyle = {
    backgroundColor: theme.bgInput,
    borderColor: theme.border,
    color: theme.textPrimary,
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: theme.bgSurface, border: `1px solid ${theme.border}` }}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${theme.border}` }}>
          <h2 className="text-lg font-bold" style={{ color: theme.textPrimary }}>⚙️ Settings</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition"
            style={{ color: theme.textMuted }}><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Name */}
          <div>
            <label className="text-sm font-medium flex items-center gap-2 mb-3" style={{ color: theme.textPrimary }}>
              <User className="w-4 h-4" /> Display Name
            </label>
            <div className="flex gap-2">
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Your name" className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition border"
                style={inputStyle} />
              <button onClick={() => { onSave({ ...settings, userName: name }); setNameSaved(true); setTimeout(() => setNameSaved(false), 2000); }}
                className="px-3 rounded-xl transition"
                style={{ backgroundColor: theme.tagBg, color: theme.accent }}>
                {nameSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Theme Style */}
          <div>
            <label className="text-sm font-medium flex items-center gap-2 mb-3" style={{ color: theme.textPrimary }}>
              <Palette className="w-4 h-4" /> Theme Style
            </label>
            <div className="flex gap-2">
              {([{ key: 'boy' as ThemeStyle, label: '⚡ Dark Neon', colors: ['#0ea5e9', '#38bdf8'] },
                 { key: 'girl' as ThemeStyle, label: '🌸 Rose Glow', colors: ['#ec4899', '#f9a8d4'] }])
                .map(t => (
                <button key={t.key} onClick={() => onSave({ ...settings, themeStyle: t.key })}
                  className="flex-1 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 border-2"
                  style={{
                    borderColor: settings.themeStyle === t.key ? t.colors[0] : theme.border,
                    backgroundColor: settings.themeStyle === t.key ? t.colors[0] + '15' : theme.bgInput,
                    color: settings.themeStyle === t.key ? t.colors[0] : theme.textMuted,
                  }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recovery Email */}
          <div>
            <label className="text-sm font-medium flex items-center gap-2 mb-3" style={{ color: theme.textPrimary }}>
              <Mail className="w-4 h-4" /> Recovery Email
            </label>
            <div className="flex gap-2">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com" className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition border"
                style={inputStyle} />
              <button onClick={() => { onSave({ ...settings, recoveryEmail: email }); setEmailSaved(true); setTimeout(() => setEmailSaved(false), 2000); }}
                className="px-3 rounded-xl transition"
                style={{ backgroundColor: theme.tagBg, color: theme.accent }}>
                {emailSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs mt-1" style={{ color: theme.textMuted }}>Used for "Forgot PIN" recovery</p>
          </div>

          {/* Auto Lock */}
          <div>
            <label className="text-sm font-medium flex items-center gap-2 mb-3" style={{ color: theme.textPrimary }}>
              <Timer className="w-4 h-4" /> Auto Lock ({autoLock} min)
            </label>
            <div className="flex items-center gap-3">
              <input type="range" min="1" max="30" value={autoLock} onChange={(e) => setAutoLock(parseInt(e.target.value))}
                className="flex-1" style={{ accentColor: theme.accent }} />
              <span className="text-sm font-mono w-8 text-center" style={{ color: theme.textPrimary }}>{autoLock}</span>
              <button onClick={() => onSave({ ...settings, autoLockMinutes: autoLock })}
                className="p-2 rounded-lg transition" style={{ backgroundColor: theme.tagBg, color: theme.accent }}>
                <Save className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Change PIN */}
          <div>
            <label className="text-sm font-medium flex items-center gap-2 mb-3" style={{ color: theme.textPrimary }}>
              <Lock className="w-4 h-4" /> Change PIN
            </label>
            <div className="space-y-2">
              {[
                { val: currentPin, set: setCurrentPin, ph: 'Current PIN' },
                { val: newPin, set: setNewPin, ph: 'New PIN (4 digits)' },
                { val: confirmPin, set: setConfirmPin, ph: 'Confirm new PIN' },
              ].map(inp => (
                <input key={inp.ph} type="password" value={inp.val}
                  onChange={(e) => inp.set(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder={inp.ph} maxLength={4}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition tracking-widest border"
                  style={inputStyle} />
              ))}
              {pinError && <p className="text-red-400 text-xs flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {pinError}</p>}
              {pinSuccess && <p className="text-green-400 text-xs flex items-center gap-1"><Check className="w-3 h-3" /> PIN changed!</p>}
              <button onClick={handleChangePin}
                className="w-full py-2.5 rounded-xl text-white text-sm font-medium transition-all"
                style={{ background: `linear-gradient(135deg, ${theme.accentGradientFrom}, ${theme.accentGradientTo})` }}>
                Update PIN
              </button>
            </div>
          </div>

          {/* Clear Trash */}
          {trashCount > 0 && (
            <div>
              <label className="text-sm font-medium flex items-center gap-2 mb-3" style={{ color: theme.textPrimary }}>
                <Trash2 className="w-4 h-4" /> Trash ({trashCount} notes)
              </label>
              <button onClick={() => { if (confirm('Permanently delete all trashed notes?')) onClearTrash(); }}
                className="w-full py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-all">
                Empty Trash
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
