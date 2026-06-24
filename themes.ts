import { ThemeColors, ThemeStyle } from './types';

export const BOY_THEME: ThemeColors = {
  bgPrimary: '#0a0e1a',
  bgSecondary: '#0f1629',
  bgSurface: '#131a2e',
  bgHover: 'rgba(56, 189, 248, 0.05)',
  bgInput: 'rgba(255,255,255,0.04)',
  textPrimary: '#e2e8f0',
  textSecondary: '#94a3b8',
  textMuted: '#475569',
  accent: '#38bdf8',
  accentLight: '#7dd3fc',
  accentDark: '#0284c7',
  accentGlow: 'rgba(56, 189, 248, 0.3)',
  accentGradientFrom: '#0ea5e9',
  accentGradientTo: '#6366f1',
  border: 'rgba(56, 189, 248, 0.1)',
  borderActive: 'rgba(56, 189, 248, 0.3)',
  favColor: '#facc15',
  pinColor: '#fb923c',
  tagBg: 'rgba(56, 189, 248, 0.12)',
  tagText: '#7dd3fc',
  lockBgFrom: '#020617',
  lockBgVia: '#0c1a3a',
  lockBgTo: '#020617',
  particleColor: 'rgba(56, 189, 248, 0.2)',
  noteColors: [
    { name: 'Default', value: '#131a2e' },
    { name: 'Navy', value: '#0c1a3a' },
    { name: 'Slate', value: '#1e293b' },
    { name: 'Storm', value: '#172032' },
    { name: 'Ocean', value: '#0a2540' },
    { name: 'Steel', value: '#1c2536' },
    { name: 'Midnight', value: '#0f172a' },
    { name: 'Charcoal', value: '#1a1f2e' },
  ],
};

export const GIRL_THEME: ThemeColors = {
  bgPrimary: '#1a0a14',
  bgSecondary: '#1f0e19',
  bgSurface: '#261320',
  bgHover: 'rgba(244, 114, 182, 0.05)',
  bgInput: 'rgba(255,255,255,0.04)',
  textPrimary: '#fce7f3',
  textSecondary: '#f9a8d4',
  textMuted: '#9d5c80',
  accent: '#f472b6',
  accentLight: '#f9a8d4',
  accentDark: '#db2777',
  accentGlow: 'rgba(244, 114, 182, 0.3)',
  accentGradientFrom: '#ec4899',
  accentGradientTo: '#a855f7',
  border: 'rgba(244, 114, 182, 0.1)',
  borderActive: 'rgba(244, 114, 182, 0.3)',
  favColor: '#f472b6',
  pinColor: '#c084fc',
  tagBg: 'rgba(244, 114, 182, 0.12)',
  tagText: '#f9a8d4',
  lockBgFrom: '#1a0312',
  lockBgVia: '#2d0a20',
  lockBgTo: '#1a0312',
  particleColor: 'rgba(244, 114, 182, 0.2)',
  noteColors: [
    { name: 'Default', value: '#261320' },
    { name: 'Blush', value: '#2d1525' },
    { name: 'Mauve', value: '#2a1428' },
    { name: 'Rose', value: '#301828' },
    { name: 'Plum', value: '#261230' },
    { name: 'Berry', value: '#2c1020' },
    { name: 'Dusty', value: '#28161e' },
    { name: 'Wine', value: '#2a1018' },
  ],
};

export function getTheme(style: ThemeStyle): ThemeColors {
  return style === 'boy' ? BOY_THEME : GIRL_THEME;
}

export const MOODS = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😡', label: 'Angry' },
  { emoji: '😴', label: 'Tired' },
  { emoji: '🤔', label: 'Thinking' },
  { emoji: '😍', label: 'In Love' },
  { emoji: '🥳', label: 'Excited' },
  { emoji: '😰', label: 'Anxious' },
  { emoji: '😌', label: 'Calm' },
  { emoji: '💪', label: 'Motivated' },
  { emoji: '🎯', label: 'Focused' },
  { emoji: '✨', label: 'Inspired' },
];

export const NOTE_TEMPLATES = [
  {
    name: '📝 Quick Note',
    title: '',
    content: '',
    isChecklist: false,
  },
  {
    name: '✅ To-Do List',
    title: 'To-Do',
    content: '',
    isChecklist: true,
    defaultItems: ['Task 1', 'Task 2', 'Task 3'],
  },
  {
    name: '💡 Idea',
    title: 'New Idea',
    content: '💡 Idea:\n\n🎯 Goal:\n\n📋 Steps:\n1. \n2. \n3. ',
    isChecklist: false,
  },
  {
    name: '📔 Diary',
    title: `Diary - ${new Date().toLocaleDateString()}`,
    content: `📅 Date: ${new Date().toLocaleDateString()}\n\n🌤️ How was my day:\n\n💭 Thoughts:\n\n🙏 Grateful for:\n`,
    isChecklist: false,
  },
  {
    name: '🎯 Goals',
    title: 'My Goals',
    content: '',
    isChecklist: true,
    defaultItems: ['Goal 1', 'Goal 2', 'Goal 3'],
  },
  {
    name: '📚 Study Notes',
    title: 'Study Notes',
    content: '📖 Subject:\n\n📝 Key Points:\n• \n• \n• \n\n❓ Questions:\n\n💡 Summary:\n',
    isChecklist: false,
  },
];

export const TAG_SUGGESTIONS = [
  'Personal', 'Work', 'Ideas', 'Todo', 'Important',
  'Shopping', 'Health', 'Finance', 'Study', 'Creative',
  'Travel', 'Recipes', 'Goals', 'Diary', 'Projects'
];
