export interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  tags: string[];
  mood: string;
  isPinned: boolean;
  isFavorite: boolean;
  isDeleted: boolean;
  isChecklist: boolean;
  checklistItems: ChecklistItem[];
  isPrivate: boolean;
  notePin: string;
  createdAt: number;
  updatedAt: number;
}

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export type EventType = 'birthday' | 'anniversary' | 'meeting' | 'reminder' | 'task' | 'celebration' | 'deadline' | 'personal';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM (optional, empty if all-day)
  type: EventType;
  color: string;
  isImportant: boolean;
  isCompleted: boolean;
  recurring: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  createdAt: number;
}

export type ViewMode = 'grid' | 'list';
export type FilterType = 'all' | 'favorites' | 'pinned' | 'trash';
export type ThemeStyle = 'boy' | 'girl';

export interface AppSettings {
  pin: string;
  themeStyle: ThemeStyle;
  autoLockMinutes: number;
  isPinSetup: boolean;
  recoveryEmail: string;
  userName: string;
}

export interface ThemeColors {
  // Backgrounds
  bgPrimary: string;
  bgSecondary: string;
  bgSurface: string;
  bgHover: string;
  bgInput: string;
  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  // Accents
  accent: string;
  accentLight: string;
  accentDark: string;
  accentGlow: string;
  accentGradientFrom: string;
  accentGradientTo: string;
  // Borders
  border: string;
  borderActive: string;
  // Tags
  tagBg: string;
  tagText: string;
  // Special
  favColor: string;
  pinColor: string;
  // Lock screen
  lockBgFrom: string;
  lockBgVia: string;
  lockBgTo: string;
  particleColor: string;
  // Note colors
  noteColors: { name: string; value: string }[];
}
