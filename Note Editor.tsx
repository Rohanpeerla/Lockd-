import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Save, Palette, Tag, Pin, Star, Hash,
  Type, AlignLeft, Clock, FileText, Smile,
  CheckSquare, Plus, Trash2, Lock
} from 'lucide-react';
import { Note, ThemeColors, ChecklistItem } from '../types';
import { generateId } from '../store';
import { MOODS, TAG_SUGGESTIONS } from '../themes';

interface NoteEditorProps {
  note: Note | null;
  theme: ThemeColors;
  onSave: (note: Note) => void;
  onClose: () => void;
}

export default function NoteEditor({ note, theme, onSave, onClose }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [color, setColor] = useState(note?.color || theme.noteColors[0].value);
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [mood, setMood] = useState(note?.mood || '');
  const [isPinned, setIsPinned] = useState(note?.isPinned || false);
  const [isFavorite, setIsFavorite] = useState(note?.isFavorite || false);
  const [isChecklist, setIsChecklist] = useState(note?.isChecklist || false);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(
    note?.checklistItems || []
  );
  const [isPrivate, setIsPrivate] = useState(note?.isPrivate || false);
  const [notePin, setNotePin] = useState(note?.notePin || '');
  const [showColors, setShowColors] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [showMood, setShowMood] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [newItemText, setNewItemText] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!note) titleRef.current?.focus();
    else contentRef.current?.focus();
  }, [note]);

  const handleSave = () => {
    if (!title.trim() && !content.trim() && checklistItems.length === 0) return;
    if (isPrivate && notePin.length !== 4) return;
    const now = Date.now();
    const newNote: Note = {
      id: note?.id || generateId(),
      title: title.trim(),
      content: content.trim(),
      color,
      tags,
      mood,
      isPinned,
      isFavorite,
      isChecklist,
      checklistItems,
      isPrivate,
      notePin: isPrivate ? notePin : '',
      isDeleted: false,
      createdAt: note?.createdAt || now,
      updatedAt: now,
    };
    onSave(newNote);
  };

  const addTag = (tag: string) => {
    const t = tag.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  const removeTag = (tag: string) => setTags(tags.filter(t => t !== tag));

  const addChecklistItem = () => {
    if (!newItemText.trim()) return;
    setChecklistItems([...checklistItems, { id: generateId(), text: newItemText.trim(), checked: false }]);
    setNewItemText('');
  };

  const toggleChecklistItem = (id: string) => {
    setChecklistItems(checklistItems.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const removeChecklistItem = (id: string) => {
    setChecklistItems(checklistItems.filter(item => item.id !== id));
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;
  const checkedCount = checklistItems.filter(i => i.checked).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }} onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ backgroundColor: theme.bgSurface, borderColor: theme.border, borderWidth: 1 }}>
        
        {/* Accent bar */}
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${theme.accentGradientFrom}, ${theme.accentGradientTo})` }} />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: `1px solid ${theme.border}` }}>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" style={{ color: theme.textMuted }} />
            <span className="text-sm font-medium" style={{ color: theme.textMuted }}>
              {note ? 'Edit Note' : 'New Note'}
            </span>
            {mood && <span className="text-lg">{mood}</span>}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setIsPinned(!isPinned)}
              className="p-2 rounded-lg transition-all" style={{ color: isPinned ? theme.pinColor : theme.textMuted }}>
              <Pin className="w-4 h-4" fill={isPinned ? 'currentColor' : 'none'} />
            </button>
            <button onClick={() => setIsFavorite(!isFavorite)}
              className="p-2 rounded-lg transition-all" style={{ color: isFavorite ? theme.favColor : theme.textMuted }}>
              <Star className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
            <button onClick={() => { setShowMood(!showMood); setShowColors(false); setShowTags(false); }}
              className="p-2 rounded-lg transition-all" style={{ color: showMood ? theme.accent : theme.textMuted }}>
              <Smile className="w-4 h-4" />
            </button>
            <button onClick={() => { setShowColors(!showColors); setShowTags(false); setShowMood(false); }}
              className="p-2 rounded-lg transition-all" style={{ color: showColors ? theme.accent : theme.textMuted }}>
              <Palette className="w-4 h-4" />
            </button>
            <button onClick={() => { setShowTags(!showTags); setShowColors(false); setShowMood(false); setShowSecurity(false); }}
              className="p-2 rounded-lg transition-all" style={{ color: showTags ? theme.accent : theme.textMuted }}>
              <Tag className="w-4 h-4" />
            </button>
            <button onClick={() => { setShowSecurity(!showSecurity); setShowColors(false); setShowTags(false); setShowMood(false); }}
              className="p-2 rounded-lg transition-all" style={{ color: showSecurity || isPrivate ? theme.accent : theme.textMuted }}>
              <Lock className="w-4 h-4" />
            </button>
            <button onClick={() => setIsChecklist(!isChecklist)}
              className="p-2 rounded-lg transition-all" style={{ color: isChecklist ? theme.accent : theme.textMuted }}>
              <CheckSquare className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 rounded-lg ml-1 hover:text-red-400 transition" style={{ color: theme.textMuted }}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mood picker */}
        <AnimatePresence>
          {showMood && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden" style={{ borderBottom: `1px solid ${theme.border}` }}>
              <div className="flex items-center gap-2 px-5 py-3 flex-wrap">
                <span className="text-xs mr-2" style={{ color: theme.textMuted }}>Mood:</span>
                {MOODS.map(m => (
                  <button key={m.emoji} onClick={() => setMood(mood === m.emoji ? '' : m.emoji)}
                    className={`text-xl p-1 rounded-lg transition-all hover:scale-110 ${mood === m.emoji ? 'bg-white/10 scale-110' : ''}`}
                    title={m.label}>
                    {m.emoji}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Color picker */}
        <AnimatePresence>
          {showColors && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden" style={{ borderBottom: `1px solid ${theme.border}` }}>
              <div className="flex items-center gap-2 px-5 py-3 flex-wrap">
                <span className="text-xs mr-2" style={{ color: theme.textMuted }}>Color:</span>
                {theme.noteColors.map(c => (
                  <button key={c.name} onClick={() => setColor(c.value)}
                    className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${color === c.value ? 'scale-110' : ''}`}
                    style={{ backgroundColor: c.value, borderColor: color === c.value ? theme.accent : 'transparent' }}
                    title={c.name} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tags panel */}
        <AnimatePresence>
          {showTags && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden" style={{ borderBottom: `1px solid ${theme.border}` }}>
              <div className="px-5 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <Hash className="w-3 h-3" style={{ color: theme.textMuted }} />
                  <input type="text" value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && tagInput.trim()) addTag(tagInput); }}
                    placeholder="Add a tag..."
                    className="text-sm bg-transparent outline-none flex-1 placeholder:text-gray-600"
                    style={{ color: theme.textPrimary }} />
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {tags.map(tag => (
                      <span key={tag} onClick={() => removeTag(tag)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs cursor-pointer hover:opacity-70 transition"
                        style={{ backgroundColor: theme.tagBg, color: theme.tagText }}>
                        #{tag} ×
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap gap-1">
                  {TAG_SUGGESTIONS.filter(t => !tags.includes(t)).slice(0, 10).map(tag => (
                    <button key={tag} onClick={() => addTag(tag)}
                      className="px-2 py-0.5 rounded-full text-xs border transition hover:opacity-80"
                      style={{ borderColor: theme.border, color: theme.textMuted }}>
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Security panel */}
        <AnimatePresence>
          {showSecurity && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden" style={{ borderBottom: `1px solid ${theme.border}` }}>
              <div className="px-5 py-3 space-y-3">
                <button
                  onClick={() => {
                    setIsPrivate(!isPrivate);
                    if (isPrivate) setNotePin('');
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border transition"
                  style={{
                    backgroundColor: isPrivate ? theme.tagBg : theme.bgInput,
                    borderColor: isPrivate ? theme.accent : theme.border,
                  }}
                >
                  <div className="text-left">
                    <p className="text-sm font-medium" style={{ color: isPrivate ? theme.accent : theme.textPrimary }}>
                      PIN-protect this note
                    </p>
                    <p className="text-[11px]" style={{ color: theme.textMuted }}>
                      Preview stays blurred and asks for a second PIN before opening.
                    </p>
                  </div>
                  <div className="w-10 h-5 rounded-full relative" style={{ backgroundColor: isPrivate ? theme.accent : theme.border }}>
                    <motion.div className="w-4 h-4 bg-white rounded-full absolute top-0.5"
                      animate={{ left: isPrivate ? '22px' : '2px' }}
                      transition={{ type: 'spring', damping: 20, stiffness: 300 }} />
                  </div>
                </button>

                {isPrivate && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: theme.textMuted }}>
                      Private note PIN
                    </label>
                    <input
                      type="password"
                      value={notePin}
                      onChange={(e) => setNotePin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="4-digit note PIN"
                      maxLength={4}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition tracking-[0.35em] border placeholder:text-gray-600"
                      style={{ backgroundColor: theme.bgInput, borderColor: notePin.length > 0 && notePin.length < 4 ? '#ef4444' : theme.border, color: theme.textPrimary }}
                    />
                    <p className="text-[11px]" style={{ color: notePin.length > 0 && notePin.length < 4 ? '#f87171' : theme.textMuted }}>
                      {notePin.length > 0 && notePin.length < 4
                        ? 'Use exactly 4 digits to secure this note.'
                        : 'You will need this PIN every time you open this note.'}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Title */}
        <div className="px-5 pt-4">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 flex-shrink-0" style={{ color: theme.textMuted }} />
            <input ref={titleRef} type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              className="w-full text-lg font-semibold bg-transparent outline-none placeholder:text-gray-600"
              style={{ color: theme.textPrimary }} />
          </div>
        </div>

        {/* Always-visible private note controls */}
        <div className="px-5 pt-3">
          <div className="rounded-xl border p-3 space-y-3"
            style={{
              borderColor: isPrivate ? theme.accent : theme.border,
              backgroundColor: isPrivate ? theme.tagBg : theme.bgInput,
            }}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: isPrivate ? theme.accentGlow : 'transparent', color: isPrivate ? theme.accent : theme.textMuted }}>
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: theme.textPrimary }}>Private note security</p>
                  <p className="text-[11px]" style={{ color: theme.textMuted }}>
                    Blur preview + ask for a separate PIN before opening.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsPrivate(!isPrivate);
                  if (isPrivate) setNotePin('');
                }}
                className="w-10 h-5 rounded-full relative flex-shrink-0"
                style={{ backgroundColor: isPrivate ? theme.accent : theme.border }}
              >
                <motion.div
                  className="w-4 h-4 bg-white rounded-full absolute top-0.5"
                  animate={{ left: isPrivate ? '22px' : '2px' }}
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                />
              </button>
            </div>

            {isPrivate && (
              <div className="grid gap-2">
                <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: theme.textMuted }}>
                  Separate note PIN
                </label>
                <input
                  type="password"
                  value={notePin}
                  onChange={(e) => setNotePin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="4-digit note PIN"
                  maxLength={4}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition tracking-[0.35em] border placeholder:text-gray-600"
                  style={{
                    backgroundColor: theme.bgSurface,
                    borderColor: notePin.length > 0 && notePin.length < 4 ? '#ef4444' : theme.border,
                    color: theme.textPrimary,
                  }}
                />
                <p className="text-[11px]" style={{ color: notePin.length > 0 && notePin.length < 4 ? '#f87171' : theme.textMuted }}>
                  {notePin.length > 0 && notePin.length < 4
                    ? 'Use exactly 4 digits.'
                    : 'This PIN is different from the app PIN and is required every time this note opens.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Content / Checklist */}
        <div className="flex-1 px-5 py-3 min-h-0 overflow-y-auto">
          {isChecklist ? (
            <div className="space-y-2">
              {checklistItems.map((item) => (
                <motion.div key={item.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  className="checklist-item flex items-center gap-3 group">
                  <input type="checkbox" checked={item.checked} onChange={() => toggleChecklistItem(item.id)}
                    style={{ borderColor: theme.border }} />
                  <span className={`flex-1 text-sm ${item.checked ? 'line-through opacity-50' : ''}`}
                    style={{ color: theme.textPrimary }}>
                    {item.text}
                  </span>
                  <button onClick={() => removeChecklistItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/10 text-red-400 transition">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
              {/* Add item */}
              <div className="flex items-center gap-2 mt-2">
                <Plus className="w-4 h-4" style={{ color: theme.accent }} />
                <input type="text" value={newItemText} onChange={(e) => setNewItemText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') addChecklistItem(); }}
                  placeholder="Add item..."
                  className="flex-1 text-sm bg-transparent outline-none placeholder:text-gray-600"
                  style={{ color: theme.textPrimary }} />
              </div>
              {checklistItems.length > 0 && (
                <div className="text-xs mt-2 flex items-center gap-2" style={{ color: theme.textMuted }}>
                  <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: theme.bgInput }}>
                    <div className="h-full rounded-full transition-all"
                      style={{
                        width: `${(checkedCount / checklistItems.length) * 100}%`,
                        background: `linear-gradient(90deg, ${theme.accentGradientFrom}, ${theme.accentGradientTo})`
                      }} />
                  </div>
                  {checkedCount}/{checklistItems.length}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-start gap-2 h-full">
              <AlignLeft className="w-4 h-4 flex-shrink-0 mt-1" style={{ color: theme.textMuted }} />
              <textarea ref={contentRef} value={content} onChange={(e) => setContent(e.target.value)}
                placeholder="Write your note here..."
                className="w-full h-full min-h-[200px] max-h-[400px] bg-transparent outline-none resize-none text-sm leading-relaxed placeholder:text-gray-600"
                style={{ color: theme.textPrimary }} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: `1px solid ${theme.border}` }}>
          <div className="flex items-center gap-4 text-xs" style={{ color: theme.textMuted }}>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {note ? new Date(note.updatedAt).toLocaleDateString() : 'Now'}
            </span>
            {!isChecklist && <><span>{wordCount} words</span><span>{charCount} chars</span></>}
            {isChecklist && <span>{checkedCount}/{checklistItems.length} done</span>}
          </div>
          <button onClick={handleSave}
            disabled={(!title.trim() && !content.trim() && checklistItems.length === 0) || (isPrivate && notePin.length !== 4)}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-white text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: `linear-gradient(135deg, ${theme.accentGradientFrom}, ${theme.accentGradientTo})`,
              boxShadow: `0 4px 15px ${theme.accentGlow}` }}>
            <Save className="w-4 h-4" /> Save
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
