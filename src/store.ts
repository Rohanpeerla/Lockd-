import { Note, AppSettings, CalendarEvent } from './types';

const NOTES_KEY = 'private_notes_data';
const SETTINGS_KEY = 'private_notes_settings';
const EVENTS_KEY = 'private_notes_events';

const defaultSettings: AppSettings = {
  pin: '',
  themeStyle: 'boy',
  autoLockMinutes: 5,
  isPinSetup: false,
  recoveryEmail: '',
  userName: '',
};

export function isPinConfigured(): boolean {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) return false;
    const parsed = JSON.parse(data);
    return parsed.isPinSetup === true && parsed.pin && parsed.pin.length >= 4;
  } catch {
    return false;
  }
}

export function loadNotes(): Note[] {
  try {
    const data = localStorage.getItem(NOTES_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data) as Partial<Note>[];
    return parsed.map((note) => ({
      id: note.id || generateId(),
      title: note.title || '',
      content: note.content || '',
      color: note.color || '#131a2e',
      tags: note.tags || [],
      mood: note.mood || '',
      isPinned: note.isPinned || false,
      isFavorite: note.isFavorite || false,
      isDeleted: note.isDeleted || false,
      isChecklist: note.isChecklist || false,
      checklistItems: note.checklistItems || [],
      isPrivate: note.isPrivate || false,
      notePin: note.notePin || '',
      createdAt: note.createdAt || Date.now(),
      updatedAt: note.updatedAt || Date.now(),
    }));
  } catch {
    return [];
  }
}

export function saveNotes(notes: Note[]): void {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

export function loadSettings(): AppSettings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function loadEvents(): CalendarEvent[] {
  try {
    const data = localStorage.getItem(EVENTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveEvents(events: CalendarEvent[]): void {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
}

export const EVENT_TYPES: { type: 'birthday' | 'anniversary' | 'meeting' | 'reminder' | 'task' | 'celebration' | 'deadline' | 'personal'; label: string; emoji: string; color: string }[] = [
  { type: 'birthday', label: 'Birthday', emoji: '🎂', color: '#f472b6' },
  { type: 'anniversary', label: 'Anniversary', emoji: '💝', color: '#ef4444' },
  { type: 'meeting', label: 'Meeting', emoji: '👥', color: '#3b82f6' },
  { type: 'reminder', label: 'Reminder', emoji: '🔔', color: '#f59e0b' },
  { type: 'task', label: 'Task', emoji: '✅', color: '#10b981' },
  { type: 'celebration', label: 'Celebration', emoji: '🎉', color: '#a855f7' },
  { type: 'deadline', label: 'Deadline', emoji: '⚠️', color: '#dc2626' },
  { type: 'personal', label: 'Personal', emoji: '⭐', color: '#06b6d4' },
];
