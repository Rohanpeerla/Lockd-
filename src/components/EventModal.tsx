import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Clock, Star, Repeat, Trash2, Calendar as CalIcon, Type, AlignLeft } from 'lucide-react';
import { CalendarEvent, ThemeColors, EventType } from '../types.ts';
import { EVENT_TYPES, generateId } from '../store.ts';

interface EventModalProps {
  event: CalendarEvent | null;
  selectedDate: string;
  theme: ThemeColors;
  onSave: (event: CalendarEvent) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

export default function EventModal({ event, selectedDate, theme, onSave, onDelete, onClose }: EventModalProps) {
  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [date, setDate] = useState(event?.date || selectedDate);
  const [time, setTime] = useState(event?.time || '');
  const [type, setType] = useState<EventType>(event?.type || 'reminder');
  const [isImportant, setIsImportant] = useState(event?.isImportant || false);
  const [recurring, setRecurring] = useState<CalendarEvent['recurring']>(event?.recurring || 'none');

  useEffect(() => {
    setDate(event?.date || selectedDate);
  }, [event, selectedDate]);

  const selectedType = EVENT_TYPES.find(t => t.type === type) || EVENT_TYPES[3];

  const handleSave = () => {
    if (!title.trim()) return;
    const newEvent: CalendarEvent = {
      id: event?.id || generateId(),
      title: title.trim(),
      description: description.trim(),
      date,
      time,
      type,
      color: selectedType.color,
      isImportant,
      isCompleted: event?.isCompleted || false,
      recurring,
      createdAt: event?.createdAt || Date.now(),
    };
    onSave(newEvent);
  };

  const inputStyle = {
    backgroundColor: theme.bgInput,
    borderColor: theme.border,
    color: theme.textPrimary,
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        style={{ backgroundColor: theme.bgSurface, border: `1px solid ${theme.border}` }}>

        {/* Color accent bar */}
        <div className="h-1.5 w-full" style={{ backgroundColor: selectedType.color }} />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${theme.border}` }}>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{selectedType.emoji}</span>
            <h2 className="text-lg font-bold" style={{ color: theme.textPrimary }}>
              {event ? 'Edit Event' : 'New Event'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition"
            style={{ color: theme.textMuted }}><X className="w-5 h-5" /></button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Title */}
          <div>
            <label className="text-xs font-medium flex items-center gap-1.5 mb-2" style={{ color: theme.textMuted }}>
              <Type className="w-3 h-3" /> EVENT TITLE
            </label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="What's happening?" autoFocus
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition border"
              style={inputStyle} />
          </div>

          {/* Event Type */}
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: theme.textMuted }}>
              EVENT TYPE
            </label>
            <div className="grid grid-cols-4 gap-2">
              {EVENT_TYPES.map(t => (
                <button key={t.type} onClick={() => setType(t.type)}
                  className="p-2 rounded-xl border-2 transition-all flex flex-col items-center gap-1"
                  style={{
                    borderColor: type === t.type ? t.color : theme.border,
                    backgroundColor: type === t.type ? t.color + '15' : theme.bgInput,
                  }}>
                  <span className="text-lg">{t.emoji}</span>
                  <span className="text-[10px] font-medium"
                    style={{ color: type === t.type ? t.color : theme.textMuted }}>
                    {t.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium flex items-center gap-1.5 mb-2" style={{ color: theme.textMuted }}>
                <CalIcon className="w-3 h-3" /> DATE
              </label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition border"
                style={inputStyle} />
            </div>
            <div>
              <label className="text-xs font-medium flex items-center gap-1.5 mb-2" style={{ color: theme.textMuted }}>
                <Clock className="w-3 h-3" /> TIME (optional)
              </label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition border"
                style={inputStyle} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium flex items-center gap-1.5 mb-2" style={{ color: theme.textMuted }}>
              <AlignLeft className="w-3 h-3" /> NOTES (optional)
            </label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details, location, attendees..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition border resize-none"
              style={inputStyle} />
          </div>

          {/* Recurring */}
          <div>
            <label className="text-xs font-medium flex items-center gap-1.5 mb-2" style={{ color: theme.textMuted }}>
              <Repeat className="w-3 h-3" /> REPEATS
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {[
                { v: 'none' as const, l: 'Once' },
                { v: 'daily' as const, l: 'Daily' },
                { v: 'weekly' as const, l: 'Weekly' },
                { v: 'monthly' as const, l: 'Monthly' },
                { v: 'yearly' as const, l: 'Yearly' },
              ].map(opt => (
                <button key={opt.v} onClick={() => setRecurring(opt.v)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition border"
                  style={{
                    borderColor: recurring === opt.v ? theme.accent : theme.border,
                    backgroundColor: recurring === opt.v ? theme.tagBg : theme.bgInput,
                    color: recurring === opt.v ? theme.accent : theme.textMuted,
                  }}>
                  {opt.l}
                </button>
              ))}
            </div>
          </div>

          {/* Important toggle */}
          <button onClick={() => setIsImportant(!isImportant)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border transition"
            style={{
              backgroundColor: isImportant ? '#facc1515' : theme.bgInput,
              borderColor: isImportant ? '#facc15' : theme.border,
            }}>
            <span className="flex items-center gap-2 text-sm font-medium"
              style={{ color: isImportant ? '#facc15' : theme.textPrimary }}>
              <Star className="w-4 h-4" fill={isImportant ? 'currentColor' : 'none'} />
              Mark as important
            </span>
            <div className="w-10 h-5 rounded-full transition-colors relative"
              style={{ backgroundColor: isImportant ? '#facc15' : theme.border }}>
              <motion.div className="w-4 h-4 bg-white rounded-full absolute top-0.5"
                animate={{ left: isImportant ? '22px' : '2px' }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }} />
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: `1px solid ${theme.border}` }}>
          {event && onDelete ? (
            <button onClick={() => { if (confirm('Delete this event?')) { onDelete(event.id); onClose(); } }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition text-sm">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          ) : <div />}
          <button onClick={handleSave} disabled={!title.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-white text-sm font-medium transition disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: `linear-gradient(135deg, ${theme.accentGradientFrom}, ${theme.accentGradientTo})`,
              boxShadow: `0 4px 15px ${theme.accentGlow}` }}>
            <Save className="w-4 h-4" /> {event ? 'Update' : 'Create Event'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
