import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { ThemeColors } from '../types.ts';
import { NOTE_TEMPLATES } from '../themes.ts';

interface TemplateSelectorProps {
  theme: ThemeColors;
  onSelect: (template: typeof NOTE_TEMPLATES[0]) => void;
  onClose: () => void;
}

export default function TemplateSelector({ theme, onSelect, onClose }: TemplateSelectorProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: theme.bgSurface, border: `1px solid ${theme.border}` }}>
        
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${theme.border}` }}>
          <h2 className="text-lg font-bold" style={{ color: theme.textPrimary }}>✨ Choose a Template</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition"
            style={{ color: theme.textMuted }}><X className="w-5 h-5" /></button>
        </div>

        <div className="p-4 grid grid-cols-2 gap-3">
          {NOTE_TEMPLATES.map((template, i) => (
            <motion.button key={template.name}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(template)}
              className="p-4 rounded-xl text-left transition-all border"
              style={{
                backgroundColor: theme.bgInput,
                borderColor: theme.border,
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = theme.accent; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = theme.border; }}>
              <span className="text-2xl block mb-2">{template.name.split(' ')[0]}</span>
              <span className="text-sm font-medium block" style={{ color: theme.textPrimary }}>
                {template.name.split(' ').slice(1).join(' ')}
              </span>
              <span className="text-xs block mt-1" style={{ color: theme.textMuted }}>
                {template.isChecklist ? 'Checklist' : 'Text note'}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
