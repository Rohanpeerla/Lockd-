import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Plus, Search, StickyNote, Star, Pin, Trash2,
  Settings, LogOut, LayoutGrid, List, Filter,
  X, Hash, TrendingUp, Clock,
  Zap, Flower2, ChevronDown, Sparkles, Calendar as CalIcon
} from 'lucide-react';
import { Note, FilterType, ViewMode, AppSettings, ThemeStyle, CalendarEvent } from './types.ts';
import { loadNotes, saveNotes, loadSettings, saveSettings, isPinConfigured, generateId, loadEvents, saveEvents } from './store.ts';
import { getTheme, NOTE_TEMPLATES } from './themes.ts';
import PinLockScreen from './components/PinLockScreen.tsx';
import PinSetupScreen from './components/PinSetupScreen.tsx';
import NoteEditor from './components/NoteEditor.tsx';
import NoteCard from './components/NoteCard.tsx';
import SettingsPanel from './components/SettingsPanel.tsx';
import TemplateSelector from './components/TemplateSelector.tsx';
import CalendarView from './components/CalendarView.tsx';
import EventModal from './components/EventModal.tsx';
import NotePinModal from './components/NotePinModal.tsx';

type MainView = 'notes' | 'calendar';

export default function App() {
  const [needsSetup, setNeedsSetup] = useState(!isPinConfigured());
  const [isLocked, setIsLocked] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [settings, setSettings] = useState<AppSettings>(loadSettings());
  const [mainView, setMainView] = useState<MainView>('notes');
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [editingNote, setEditingNote] = useState<Note | null | 'new'>(null);
  const [noteUnlockRequest, setNoteUnlockRequest] = useState<Note | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [newEventDate, setNewEventDate] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const lastActivityRef = useRef(Date.now());

  const theme = useMemo(() => getTheme(settings.themeStyle), [settings.themeStyle]);
  const isBoy = settings.themeStyle === 'boy';

  useEffect(() => {
    if (!isLocked) {
      setNotes(loadNotes());
      setEvents(loadEvents());
    }
  }, [isLocked]);

  useEffect(() => {
    if (!isLocked) saveEvents(events);
  }, [events, isLocked]);

  // Auto-lock
  useEffect(() => {
    if (isLocked) return;
    const resetTimer = () => { lastActivityRef.current = Date.now(); };
    const checkLock = setInterval(() => {
      const elapsed = (Date.now() - lastActivityRef.current) / 1000 / 60;
      if (elapsed >= settings.autoLockMinutes) {
        setIsLocked(true); setEditingNote(null); setShowSettings(false);
      }
    }, 10000);
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('touchstart', resetTimer);
    return () => {
      clearInterval(checkLock);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
    };
  }, [isLocked, settings.autoLockMinutes]);

  useEffect(() => {
    if (!isLocked && notes.length >= 0) saveNotes(notes);
  }, [notes, isLocked]);

  const updateSettings = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  }, []);

  const handleSaveNote = useCallback((note: Note) => {
    setNotes(prev => {
      const exists = prev.find(n => n.id === note.id);
      if (exists) return prev.map(n => n.id === note.id ? note : n);
      return [note, ...prev];
    });
    setEditingNote(null);
  }, []);

  const handleTogglePin = useCallback((id: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, isPinned: !n.isPinned, updatedAt: Date.now() } : n));
  }, []);

  const handleToggleFavorite = useCallback((id: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, isFavorite: !n.isFavorite, updatedAt: Date.now() } : n));
  }, []);

  const handleDelete = useCallback((id: string) => {
    setNotes(prev => {
      const note = prev.find(n => n.id === id);
      if (note?.isDeleted) return prev.filter(n => n.id !== id);
      return prev.map(n => n.id === id ? { ...n, isDeleted: true, updatedAt: Date.now() } : n);
    });
  }, []);

  const handleRestore = useCallback((id: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, isDeleted: false, updatedAt: Date.now() } : n));
  }, []);

  const handleClearTrash = useCallback(() => {
    setNotes(prev => prev.filter(n => !n.isDeleted));
  }, []);

  const handleOpenNote = useCallback((note: Note) => {
    if (note.isPrivate && note.notePin) {
      setNoteUnlockRequest(note);
      return;
    }
    setEditingNote(note);
  }, []);

  // Event handlers
  const handleSaveEvent = useCallback((event: CalendarEvent) => {
    setEvents(prev => {
      const exists = prev.find(e => e.id === event.id);
      if (exists) return prev.map(e => e.id === event.id ? event : e);
      return [event, ...prev];
    });
    setEditingEvent(null);
    setNewEventDate(null);
  }, []);

  const handleDeleteEvent = useCallback((id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  }, []);

  const handleToggleEventComplete = useCallback((id: string) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, isCompleted: !e.isCompleted } : e));
  }, []);

  const handleAddEventForDate = useCallback((date: string) => {
    setNewEventDate(date);
    setEditingEvent(null);
  }, []);

  const handleTemplateSelect = useCallback((template: typeof NOTE_TEMPLATES[0]) => {
    const now = Date.now();
    const newNote: Note = {
      id: generateId(),
      title: template.title,
      content: template.content,
      color: theme.noteColors[0].value,
      tags: [],
      mood: '',
      isPinned: false,
      isFavorite: false,
      isChecklist: template.isChecklist,
      checklistItems: template.isChecklist && 'defaultItems' in template
        ? (template.defaultItems as string[]).map(text => ({ id: generateId(), text, checked: false }))
        : [],
      isPrivate: false,
      notePin: '',
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    };
    setShowTemplates(false);
    setEditingNote(newNote);
  }, [theme]);

  const filteredNotes = notes
    .filter(note => {
      if (filter === 'trash') return note.isDeleted;
      if (note.isDeleted) return false;
      if (filter === 'favorites') return note.isFavorite;
      if (filter === 'pinned') return note.isPinned;
      return true;
    })
    .filter(note => !selectedTag || note.tags.includes(selectedTag))
    .filter(note => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return note.title.toLowerCase().includes(q) || note.content.toLowerCase().includes(q) ||
        note.tags.some(t => t.toLowerCase().includes(q));
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.updatedAt - a.updatedAt;
    });

  const activeNotes = notes.filter(n => !n.isDeleted);
  const trashNotes = notes.filter(n => n.isDeleted);
  const favoriteNotes = activeNotes.filter(n => n.isFavorite);
  const pinnedNotes = activeNotes.filter(n => n.isPinned);
  const allTags = [...new Set(activeNotes.flatMap(n => n.tags))];

  // Setup handler
  const handlePinSetupComplete = (data: { pin: string; themeStyle: ThemeStyle; email: string; userName: string }) => {
    const newSettings: AppSettings = {
      ...settings, pin: data.pin, themeStyle: data.themeStyle,
      recoveryEmail: data.email, userName: data.userName, isPinSetup: true,
    };
    setSettings(newSettings);
    saveSettings(newSettings);
    setNeedsSetup(false);
    setIsLocked(false);
  };

  const handleResetPin = (newPin: string) => {
    const newSettings = { ...settings, pin: newPin };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  if (needsSetup) return <PinSetupScreen onComplete={handlePinSetupComplete} />;

  if (isLocked) {
    return (
      <PinLockScreen correctPin={settings.pin} userName={settings.userName}
        recoveryEmail={settings.recoveryEmail} theme={theme}
        onUnlock={() => setIsLocked(false)} onResetPin={handleResetPin} />
    );
  }

  const filterItems: { key: FilterType; icon: React.ReactNode; label: string; count: number }[] = [
    { key: 'all', icon: <StickyNote className="w-4 h-4" />, label: 'All Notes', count: activeNotes.length },
    { key: 'favorites', icon: <Star className="w-4 h-4" />, label: 'Favorites', count: favoriteNotes.length },
    { key: 'pinned', icon: <Pin className="w-4 h-4" />, label: 'Pinned', count: pinnedNotes.length },
    { key: 'trash', icon: <Trash2 className="w-4 h-4" />, label: 'Trash', count: trashNotes.length },
  ];

  const scrollbarClass = isBoy ? 'scrollbar-boy' : 'scrollbar-girl';
  const themeClass = isBoy ? 'theme-boy' : 'theme-girl';

  const totalWords = activeNotes.reduce((acc, n) => acc + (n.content.trim() ? n.content.trim().split(/\s+/).length : 0), 0);

  // Mood stats
  const moodCounts: Record<string, number> = {};
  activeNotes.forEach(n => { if (n.mood) moodCounts[n.mood] = (moodCounts[n.mood] || 0) + 1; });
  const topMoods = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className={`h-screen flex transition-colors duration-500 ${scrollbarClass} ${themeClass}`}
      style={{ backgroundColor: theme.bgPrimary, color: theme.textPrimary }}>

      {/* ===== SIDEBAR (Desktop) ===== */}
      <aside className="hidden md:flex flex-col w-64 flex-shrink-0"
        style={{ backgroundColor: theme.bgSecondary, borderRight: `1px solid ${theme.border}` }}>
        {/* Logo */}
        <div className="px-5 py-4" style={{ borderBottom: `1px solid ${theme.border}` }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: `linear-gradient(135deg, ${theme.accentGradientFrom}, ${theme.accentGradientTo})`,
                boxShadow: `0 4px 15px ${theme.accentGlow}` }}>
              {isBoy ? <Zap className="w-5 h-5 text-white" /> : <Flower2 className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight flex items-baseline gap-0.5" style={{ color: theme.textPrimary }}>
                Lockd<span style={{ color: theme.accent }}>.</span>
              </h1>
              <p className="text-[10px] italic" style={{ color: theme.textMuted }}>
                {settings.userName ? `Hi, ${settings.userName} ✨` : "Write like no one's reading."}
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher: Notes / Calendar */}
        <div className="px-3 pt-3 flex gap-1.5">
          {([
            { key: 'notes' as MainView, icon: <StickyNote className="w-3.5 h-3.5" />, label: 'Notes' },
            { key: 'calendar' as MainView, icon: <CalIcon className="w-3.5 h-3.5" />, label: 'Calendar', badge: events.length },
          ]).map(v => (
            <button key={v.key} onClick={() => setMainView(v.key)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all border"
              style={{
                borderColor: mainView === v.key ? theme.accent : theme.border,
                backgroundColor: mainView === v.key ? theme.tagBg : 'transparent',
                color: mainView === v.key ? theme.accent : theme.textMuted,
              }}>
              {v.icon} {v.label}
              {v.badge !== undefined && v.badge > 0 && (
                <span className="text-[9px] px-1 rounded-full" style={{ backgroundColor: theme.accent + '40' }}>
                  {v.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Filters */}
        <nav className={`flex-1 p-3 space-y-1 overflow-y-auto ${scrollbarClass}`}>
          {mainView === 'notes' ? (
            <>
              <p className="text-[10px] font-semibold uppercase tracking-wider px-3 mb-2" style={{ color: theme.textMuted }}>
                Categories
              </p>
              {filterItems.map(item => (
                <button key={item.key} onClick={() => setFilter(item.key)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all"
                  style={{
                    backgroundColor: filter === item.key ? theme.accentGlow : 'transparent',
                    color: filter === item.key ? theme.accent : theme.textMuted,
                    fontWeight: filter === item.key ? 600 : 400,
                  }}>
                  {item.icon}
                  <span className="flex-1 text-left">{item.label}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: filter === item.key ? theme.tagBg : theme.bgInput,
                      color: filter === item.key ? theme.accent : theme.textMuted,
                    }}>
                    {item.count}
                  </span>
                </button>
              ))}

              {/* Tags */}
              {allTags.length > 0 && (
                <>
                  <p className="text-[10px] font-semibold uppercase tracking-wider px-3 mt-6 mb-2" style={{ color: theme.textMuted }}>Tags</p>
                  <div className="flex flex-wrap gap-1 px-2">
                    {allTags.map(tag => (
                      <button key={tag} onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all"
                        style={{
                          backgroundColor: selectedTag === tag ? theme.tagBg : theme.bgInput,
                          color: selectedTag === tag ? theme.tagText : theme.textMuted,
                          fontWeight: selectedTag === tag ? 600 : 400,
                        }}>
                        <Hash className="w-2.5 h-2.5" />{tag}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              {/* Calendar quick stats */}
              <p className="text-[10px] font-semibold uppercase tracking-wider px-3 mb-2" style={{ color: theme.textMuted }}>
                Today
              </p>
              <div className="mx-2 p-3 rounded-xl mb-3"
                style={{ backgroundColor: theme.accent + '10', border: `1px solid ${theme.accent}30` }}>
                <p className="text-xs font-medium mb-1" style={{ color: theme.accent }}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
                </p>
                <p className="text-2xl font-bold" style={{ color: theme.textPrimary }}>
                  {new Date().getDate()}
                </p>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>

              <p className="text-[10px] font-semibold uppercase tracking-wider px-3 mb-2" style={{ color: theme.textMuted }}>
                Event Types
              </p>
              <div className="px-2 space-y-1">
                {Object.entries(events.reduce((acc, e) => {
                  acc[e.type] = (acc[e.type] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)).slice(0, 6).map(([type, count]) => {
                  const typeInfo = [
                    { type: 'birthday', emoji: '🎂', label: 'Birthdays' },
                    { type: 'anniversary', emoji: '💝', label: 'Anniversaries' },
                    { type: 'meeting', emoji: '👥', label: 'Meetings' },
                    { type: 'reminder', emoji: '🔔', label: 'Reminders' },
                    { type: 'task', emoji: '✅', label: 'Tasks' },
                    { type: 'celebration', emoji: '🎉', label: 'Celebrations' },
                    { type: 'deadline', emoji: '⚠️', label: 'Deadlines' },
                    { type: 'personal', emoji: '⭐', label: 'Personal' },
                  ].find(t => t.type === type);
                  return (
                    <div key={type} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
                      style={{ color: theme.textSecondary }}>
                      <span>{typeInfo?.emoji}</span>
                      <span className="flex-1">{typeInfo?.label}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: theme.bgInput, color: theme.textMuted }}>{count}</span>
                    </div>
                  );
                })}
                {events.length === 0 && (
                  <p className="text-xs italic px-3 py-2" style={{ color: theme.textMuted }}>
                    No events yet. Add your first one!
                  </p>
                )}
              </div>

              {events.filter(e => e.isImportant && !e.isCompleted).length > 0 && (
                <>
                  <p className="text-[10px] font-semibold uppercase tracking-wider px-3 mt-4 mb-2" style={{ color: '#facc15' }}>
                    ⭐ Important
                  </p>
                  <div className="px-2 space-y-1">
                    {events.filter(e => e.isImportant && !e.isCompleted).slice(0, 3).map(e => (
                      <button key={e.id} onClick={() => setEditingEvent(e)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-white/5 transition">
                        <div className="w-1 h-6 rounded-full flex-shrink-0" style={{ backgroundColor: e.color }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate" style={{ color: theme.textPrimary }}>{e.title}</p>
                          <p className="text-[10px]" style={{ color: theme.textMuted }}>
                            {new Date(e.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* Stats */}
          <div className="mt-6 mx-2 p-3 rounded-xl" style={{ backgroundColor: theme.bgInput, border: `1px solid ${theme.border}` }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-2 flex items-center gap-1" style={{ color: theme.textMuted }}>
              <TrendingUp className="w-3 h-3" /> Stats
            </p>
            <div className="space-y-1.5">
              {[
                { label: 'Total Notes', val: activeNotes.length },
                { label: 'Total Words', val: totalWords.toLocaleString() },
                { label: 'Tags Used', val: allTags.length },
              ].map(s => (
                <div key={s.label} className="flex justify-between">
                  <span className="text-xs" style={{ color: theme.textMuted }}>{s.label}</span>
                  <span className="text-xs font-medium" style={{ color: theme.textPrimary }}>{s.val}</span>
                </div>
              ))}
            </div>

            {/* Mood chart */}
            {topMoods.length > 0 && (
              <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${theme.border}` }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: theme.textMuted }}>Mood Tracker</p>
                <div className="flex items-end gap-1 h-10">
                  {topMoods.map(([emoji, count]) => (
                    <div key={emoji} className="flex flex-col items-center gap-0.5 flex-1">
                      <div className="w-full rounded-t transition-all"
                        style={{
                          height: `${Math.max(8, (count / Math.max(...topMoods.map(m => m[1] as number))) * 30)}px`,
                          background: `linear-gradient(to top, ${theme.accentGradientFrom}, ${theme.accentGradientTo})`,
                          opacity: 0.7,
                        }} />
                      <span className="text-xs">{emoji}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Bottom actions */}
        <div className="p-3 space-y-1" style={{ borderTop: `1px solid ${theme.border}` }}>
          <button onClick={() => setShowSettings(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition hover:opacity-80"
            style={{ color: theme.textMuted }}>
            <Settings className="w-4 h-4" /> Settings
          </button>
          <button onClick={() => setIsLocked(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition">
            <LogOut className="w-4 h-4" /> Lock App
          </button>
        </div>
      </aside>

      {/* ===== Mobile sidebar ===== */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden" onClick={() => setShowSidebar(false)}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute left-0 top-0 bottom-0 w-72 shadow-2xl flex flex-col"
              style={{ backgroundColor: theme.bgSecondary }}>
              {/* Same sidebar content — simplified */}
              <div className="px-5 py-4" style={{ borderBottom: `1px solid ${theme.border}` }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${theme.accentGradientFrom}, ${theme.accentGradientTo})` }}>
                    {isBoy ? <Zap className="w-5 h-5 text-white" /> : <Flower2 className="w-5 h-5 text-white" />}
                  </div>
                  <div>
                    <h1 className="text-base font-bold tracking-tight flex items-baseline gap-0.5" style={{ color: theme.textPrimary }}>
                      Lockd<span style={{ color: theme.accent }}>.</span>
                    </h1>
                    <p className="text-[10px] italic" style={{ color: theme.textMuted }}>
                      {settings.userName ? `Hi, ${settings.userName} ✨` : "Write like no one's reading."}
                    </p>
                  </div>
                </div>
              </div>
              {/* Mobile View Switcher */}
              <div className="px-3 pt-3 flex gap-1.5">
                {([
                  { key: 'notes' as MainView, icon: <StickyNote className="w-3.5 h-3.5" />, label: 'Notes' },
                  { key: 'calendar' as MainView, icon: <CalIcon className="w-3.5 h-3.5" />, label: 'Calendar' },
                ]).map(v => (
                  <button key={v.key} onClick={() => { setMainView(v.key); setShowSidebar(false); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all border"
                    style={{
                      borderColor: mainView === v.key ? theme.accent : theme.border,
                      backgroundColor: mainView === v.key ? theme.tagBg : 'transparent',
                      color: mainView === v.key ? theme.accent : theme.textMuted,
                    }}>
                    {v.icon} {v.label}
                  </button>
                ))}
              </div>
              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {mainView === 'notes' && filterItems.map(item => (
                  <button key={item.key} onClick={() => { setFilter(item.key); setShowSidebar(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
                    style={{
                      backgroundColor: filter === item.key ? theme.accentGlow : 'transparent',
                      color: filter === item.key ? theme.accent : theme.textMuted,
                    }}>
                    {item.icon}
                    <span className="flex-1 text-left">{item.label}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: theme.bgInput, color: theme.textMuted }}>{item.count}</span>
                  </button>
                ))}
                {mainView === 'notes' && allTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-3 px-1">
                    {allTags.map(tag => (
                      <button key={tag} onClick={() => { setSelectedTag(selectedTag === tag ? null : tag); setShowSidebar(false); }}
                        className="px-2 py-1 rounded-lg text-xs transition"
                        style={{
                          backgroundColor: selectedTag === tag ? theme.tagBg : theme.bgInput,
                          color: selectedTag === tag ? theme.tagText : theme.textMuted,
                        }}>
                        #{tag}
                      </button>
                    ))}
                  </div>
                )}
                {mainView === 'calendar' && (
                  <div className="px-2 pt-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: theme.textMuted }}>
                      Total Events
                    </p>
                    <p className="text-2xl font-bold" style={{ color: theme.accent }}>{events.length}</p>
                    {events.filter(e => e.isImportant).length > 0 && (
                      <p className="text-xs mt-1" style={{ color: '#facc15' }}>
                        ⭐ {events.filter(e => e.isImportant).length} important
                      </p>
                    )}
                  </div>
                )}
              </nav>
              <div className="p-3 space-y-1" style={{ borderTop: `1px solid ${theme.border}` }}>
                <button onClick={() => { setShowSettings(true); setShowSidebar(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm"
                  style={{ color: theme.textMuted }}>
                  <Settings className="w-4 h-4" /> Settings
                </button>
                <button onClick={() => setIsLocked(true)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition">
                  <LogOut className="w-4 h-4" /> Lock App
                </button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 md:px-6 py-3 flex-shrink-0"
          style={{ backgroundColor: theme.bgSecondary, borderBottom: `1px solid ${theme.border}` }}>
          <button onClick={() => setShowSidebar(true)} className="md:hidden p-2 rounded-lg transition"
            style={{ color: theme.textMuted }}>
            <Filter className="w-5 h-5" />
          </button>

          {mainView === 'notes' ? (
            <>
              {/* Search */}
              <div className="flex-1 flex items-center gap-2 px-4 py-2 rounded-xl transition border"
                style={{ backgroundColor: theme.bgInput, borderColor: theme.border }}>
                <Search className="w-4 h-4 flex-shrink-0" style={{ color: theme.textMuted }} />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search notes, tags..."
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-600"
                  style={{ color: theme.textPrimary }} />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="hover:text-red-400 transition" style={{ color: theme.textMuted }}>
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* View toggle */}
              <div className="hidden sm:flex items-center gap-1 rounded-xl p-1" style={{ backgroundColor: theme.bgInput }}>
                <button onClick={() => setViewMode('grid')}
                  className="p-2 rounded-lg transition"
                  style={{
                    backgroundColor: viewMode === 'grid' ? theme.accent : 'transparent',
                    color: viewMode === 'grid' ? 'white' : theme.textMuted,
                  }}>
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode('list')}
                  className="p-2 rounded-lg transition"
                  style={{
                    backgroundColor: viewMode === 'list' ? theme.accent : 'transparent',
                    color: viewMode === 'list' ? 'white' : theme.textMuted,
                  }}>
                  <List className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center gap-2 px-4 py-2">
              <CalIcon className="w-4 h-4" style={{ color: theme.accent }} />
              <h2 className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
                Calendar & Events
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: theme.tagBg, color: theme.tagText }}>
                {events.length} event{events.length !== 1 ? 's' : ''}
              </span>
              <span className="ml-auto text-xs italic" style={{ color: theme.textMuted }}>
                💡 Double-click any date to add event
              </span>
            </div>
          )}

          {/* New button (context-aware: Note or Event) */}
          {mainView === 'notes' ? (
            <div className="relative flex items-center">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setEditingNote('new')}
                className="flex items-center gap-2 px-4 py-2 rounded-l-xl text-white text-sm font-medium transition-all"
                style={{ background: `linear-gradient(135deg, ${theme.accentGradientFrom}, ${theme.accentGradientTo})`,
                  boxShadow: `0 4px 15px ${theme.accentGlow}` }}>
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New</span>
              </motion.button>
              <button onClick={() => setShowTemplates(true)}
                className="py-2 px-2 rounded-r-xl text-white border-l border-white/20"
                style={{ background: `linear-gradient(135deg, ${theme.accentGradientFrom}, ${theme.accentGradientTo})` }}>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => handleAddEventForDate(new Date().toISOString().split('T')[0])}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium transition-all"
              style={{ background: `linear-gradient(135deg, ${theme.accentGradientFrom}, ${theme.accentGradientTo})`,
                boxShadow: `0 4px 15px ${theme.accentGlow}` }}>
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Event</span>
            </motion.button>
          )}
        </header>

        {/* Filter indicators */}
        {mainView === 'notes' && (selectedTag || filter !== 'all') && (
          <div className="flex items-center gap-2 px-4 md:px-6 py-2 flex-shrink-0"
            style={{ borderBottom: `1px solid ${theme.border}` }}>
            <span className="text-xs" style={{ color: theme.textMuted }}>Showing:</span>
            {filter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                style={{ backgroundColor: theme.tagBg, color: theme.tagText }}>
                {filter}
                <button onClick={() => setFilter('all')} className="hover:opacity-70">×</button>
              </span>
            )}
            {selectedTag && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                style={{ backgroundColor: theme.tagBg, color: theme.tagText }}>
                #{selectedTag}
                <button onClick={() => setSelectedTag(null)} className="hover:opacity-70">×</button>
              </span>
            )}
          </div>
        )}

        {/* Main content area */}
        {mainView === 'calendar' ? (
          <CalendarView events={events} theme={theme}
            onAddEvent={handleAddEventForDate}
            onEditEvent={(e) => setEditingEvent(e)}
            onDeleteEvent={handleDeleteEvent}
            onToggleComplete={handleToggleEventComplete} />
        ) : (
        <div className={`flex-1 overflow-y-auto p-4 md:p-6 ${scrollbarClass}`}>
          {filteredNotes.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mb-4 animate-float"
                style={{ backgroundColor: theme.accentGlow }}>
                {filter === 'trash'
                  ? <Trash2 className="w-12 h-12" style={{ color: theme.accent, opacity: 0.4 }} />
                  : isBoy
                    ? <Zap className="w-12 h-12" style={{ color: theme.accent, opacity: 0.4 }} />
                    : <Sparkles className="w-12 h-12" style={{ color: theme.accent, opacity: 0.4 }} />
                }
              </div>
              <h3 className="text-lg font-semibold mb-1" style={{ color: theme.textPrimary }}>
                {filter === 'trash' ? 'Trash is empty' : searchQuery ? 'No results found' : 'No notes yet'}
              </h3>
              <p className="text-sm mb-4" style={{ color: theme.textMuted }}>
                {filter === 'trash' ? 'Deleted notes will appear here'
                  : searchQuery ? 'Try a different search term'
                  : 'Create your first note to get started ✨'}
              </p>
              {!searchQuery && filter !== 'trash' && (
                <div className="flex gap-3">
                  <button onClick={() => setEditingNote('new')}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-medium transition-all"
                    style={{ background: `linear-gradient(135deg, ${theme.accentGradientFrom}, ${theme.accentGradientTo})`,
                      boxShadow: `0 4px 15px ${theme.accentGlow}` }}>
                    <Plus className="w-4 h-4" /> Quick Note
                  </button>
                  <button onClick={() => setShowTemplates(true)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all border"
                    style={{ borderColor: theme.border, color: theme.textSecondary }}>
                    <Sparkles className="w-4 h-4" /> Templates
                  </button>
                </div>
              )}
            </motion.div>
          ) : viewMode === 'grid' ? (
            <div className="note-grid">
              <AnimatePresence mode="popLayout">
                {filteredNotes.map(note => (
                  <NoteCard key={note.id} note={note} theme={theme}
                    onEdit={handleOpenNote} onTogglePin={handleTogglePin}
                    onToggleFavorite={handleToggleFavorite} onDelete={handleDelete} onRestore={handleRestore} />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="space-y-2 max-w-3xl mx-auto">
              <AnimatePresence mode="popLayout">
                {filteredNotes.map(note => (
                  <motion.div key={note.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer group transition-all border"
                    style={{ backgroundColor: theme.bgSurface, borderColor: theme.border }}
                    onClick={() => !note.isDeleted && handleOpenNote(note)}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = theme.borderActive; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = theme.border; }}>
                    <div className="flex items-center gap-1">
                      {note.isPrivate && note.notePin ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
                          style={{ backgroundColor: theme.accentGlow, color: theme.accent }}>
                          🔒
                        </span>
                      ) : note.mood ? <span className="text-sm">{note.mood}</span> : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {note.isPinned && <Pin className="w-3 h-3 flex-shrink-0" style={{ color: theme.pinColor }} fill="currentColor" />}
                        {note.isFavorite && <Star className="w-3 h-3 flex-shrink-0" style={{ color: theme.favColor }} fill="currentColor" />}
                        <h3 className={`text-sm font-medium truncate ${note.isPrivate && note.notePin ? 'locked-note-text' : ''}`} style={{ color: theme.textPrimary }}>
                          {note.title || 'Untitled'}
                        </h3>
                      </div>
                      <p className={`text-xs truncate mt-0.5 ${note.isPrivate && note.notePin ? 'locked-note-text' : ''}`} style={{ color: theme.textMuted }}>
                        {note.isPrivate && note.notePin
                          ? 'PIN-protected private note • unlock to read'
                          : note.isChecklist
                          ? `${note.checklistItems.filter(i => i.checked).length}/${note.checklistItems.length} completed`
                          : note.content || 'No content'}
                      </p>
                    </div>
                    {note.tags.length > 0 && !(note.isPrivate && note.notePin) && (
                      <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
                        {note.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full"
                            style={{ backgroundColor: theme.tagBg, color: theme.tagText }}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
                      {note.isDeleted ? (
                        <>
                          <button onClick={(e) => { e.stopPropagation(); handleRestore(note.id); }}
                            className="p-1.5 rounded-lg hover:bg-green-500/20 text-green-400"><Clock className="w-3 h-3" /></button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
                            className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400"><Trash2 className="w-3 h-3" /></button>
                        </>
                      ) : (
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
                          className="p-1.5 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition"
                          style={{ color: theme.textMuted }}><Trash2 className="w-3 h-3" /></button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
        )}
      </main>

      {/* ===== MODALS ===== */}
      <AnimatePresence>
        {editingNote && (
          <NoteEditor note={editingNote === 'new' ? null : editingNote} theme={theme}
            onSave={handleSaveNote} onClose={() => setEditingNote(null)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showSettings && (
          <SettingsPanel settings={settings} theme={theme} onSave={updateSettings}
            onClose={() => setShowSettings(false)} onClearTrash={handleClearTrash} trashCount={trashNotes.length} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showTemplates && (
          <TemplateSelector theme={theme} onSelect={handleTemplateSelect} onClose={() => setShowTemplates(false)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {noteUnlockRequest && (
          <NotePinModal
            title={noteUnlockRequest.title}
            expectedPin={noteUnlockRequest.notePin}
            theme={theme}
            onUnlock={() => {
              setEditingNote(noteUnlockRequest);
              setNoteUnlockRequest(null);
            }}
            onClose={() => setNoteUnlockRequest(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {(editingEvent || newEventDate) && (
          <EventModal
            event={editingEvent}
            selectedDate={newEventDate || editingEvent?.date || new Date().toISOString().split('T')[0]}
            theme={theme}
            onSave={handleSaveEvent}
            onDelete={handleDeleteEvent}
            onClose={() => { setEditingEvent(null); setNewEventDate(null); }} />
        )}
      </AnimatePresence>
    </div>
  );
}
