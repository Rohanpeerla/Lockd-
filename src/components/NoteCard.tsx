import { motion } from 'framer-motion';
import { Pin, Star, Trash2, RotateCcw, Edit3, Clock, Hash, CheckSquare, Lock } from 'lucide-react';
import { Note, ThemeColors } from '../types.ts';

interface NoteCardProps {
  note: Note;
  theme: ThemeColors;
  onEdit: (note: Note) => void;
  onTogglePin: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
}

export default function NoteCard({ note, theme, onEdit, onTogglePin, onToggleFavorite, onDelete, onRestore }: NoteCardProps) {
  const timeSince = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const defaultColor = theme.noteColors[0].value;
  const hasCustomColor = note.color !== defaultColor;
  const checkedCount = note.checklistItems.filter(i => i.checked).length;
  const isPrivate = !!note.isPrivate && !!note.notePin;

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }} whileHover={{ y: -3 }} transition={{ duration: 0.2 }}
      className="group relative rounded-xl overflow-hidden cursor-pointer transition-shadow"
      style={{
        backgroundColor: hasCustomColor ? note.color : theme.bgSurface,
        border: `1px solid ${theme.border}`,
        boxShadow: 'none',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 30px ${theme.accentGlow}`; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
      onClick={() => !note.isDeleted && onEdit(note)}>
      
      {/* Pin indicator */}
      {note.isPinned && (
        <div className="absolute top-2 right-2 z-10">
          <Pin className="w-3 h-3 rotate-45" style={{ color: theme.pinColor }} fill="currentColor" />
        </div>
      )}

      {/* Private note badge */}
      {isPrivate && (
        <div className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
          style={{ backgroundColor: theme.accentGlow, color: theme.accent }}>
          <Lock className="w-2.5 h-2.5" /> PIN Note
        </div>
      )}

      {/* Mood badge */}
      {note.mood && !isPrivate && (
        <div className="absolute top-2 left-2 z-10 text-sm">{note.mood}</div>
      )}

      {/* Content */}
      <div className="p-4 relative">
        {note.title && (
          <h3 className={`font-semibold text-sm mb-2 line-clamp-2 pr-6 ${isPrivate ? 'locked-note-text' : ''}`} style={{ color: theme.textPrimary, opacity: isPrivate ? 0.75 : 1 }}>
            {note.title}
          </h3>
        )}
        
        {note.isChecklist && note.checklistItems.length > 0 ? (
          <div className={`space-y-1.5 ${isPrivate ? 'locked-note-text' : ''}`}>
            {note.checklistItems.slice(0, 5).map(item => (
              <div key={item.id} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded border flex-shrink-0 flex items-center justify-center"
                  style={{
                    borderColor: item.checked ? theme.accent : theme.border,
                    backgroundColor: item.checked ? theme.accent : 'transparent',
                  }}>
                  {item.checked && <span className="text-[8px] text-white">✓</span>}
                </div>
                <span className={`${item.checked ? 'line-through opacity-50' : ''}`}
                  style={{ color: theme.textSecondary }}>
                  {item.text}
                </span>
              </div>
            ))}
            {note.checklistItems.length > 5 && (
              <p className="text-xs" style={{ color: theme.textMuted }}>+{note.checklistItems.length - 5} more</p>
            )}
            {/* Progress */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-1 rounded-full" style={{ backgroundColor: theme.bgInput }}>
                <div className="h-full rounded-full transition-all"
                  style={{
                    width: `${(checkedCount / note.checklistItems.length) * 100}%`,
                    background: `linear-gradient(90deg, ${theme.accentGradientFrom}, ${theme.accentGradientTo})`
                  }} />
              </div>
              <span className="text-[10px]" style={{ color: theme.textMuted }}>
                {checkedCount}/{note.checklistItems.length}
              </span>
            </div>
          </div>
        ) : note.content ? (
          <p className={`text-xs line-clamp-6 whitespace-pre-wrap leading-relaxed ${isPrivate ? 'locked-note-text' : ''}`} style={{ color: theme.textSecondary }}>
            {note.content}
          </p>
        ) : null}

        {isPrivate && (
          <>
            <div className="absolute inset-x-3 top-11 bottom-14 rounded-xl pointer-events-none"
              style={{
                background: `linear-gradient(180deg, transparent, ${theme.bgSurface}66 25%, ${theme.bgSurface}99 100%)`,
                border: `1px dashed ${theme.border}`,
              }}
            />
            <div className="mt-3 inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium relative z-10"
              style={{ backgroundColor: theme.bgInput, color: theme.textMuted }}>
              <Lock className="w-3 h-3" /> Tap to unlock this note
            </div>
          </>
        )}

        {/* Tags */}
        {note.tags.length > 0 && !isPrivate && (
          <div className="flex flex-wrap gap-1 mt-3">
            {note.tags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px]"
                style={{ backgroundColor: theme.tagBg, color: theme.tagText }}>
                <Hash className="w-2 h-2" />{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/5" style={{ borderTop: `1px solid ${theme.border}` }}>
        <div className="flex items-center gap-2">
          <span className="text-[10px] flex items-center gap-1" style={{ color: theme.textMuted }}>
            <Clock className="w-2.5 h-2.5" />{timeSince(note.updatedAt)}
          </span>
          {note.isChecklist && (
            <CheckSquare className="w-2.5 h-2.5" style={{ color: theme.accent }} />
          )}
        </div>
        
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {note.isDeleted ? (
            <>
              <button onClick={(e) => { e.stopPropagation(); onRestore(note.id); }}
                className="p-1.5 rounded-lg hover:bg-green-500/20 text-green-400 transition"><RotateCcw className="w-3 h-3" /></button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
                className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition"><Trash2 className="w-3 h-3" /></button>
            </>
          ) : (
            <>
              <button onClick={(e) => { e.stopPropagation(); onTogglePin(note.id); }}
                className="p-1.5 rounded-lg transition" style={{ color: note.isPinned ? theme.pinColor : theme.textMuted }}>
                <Pin className="w-3 h-3" fill={note.isPinned ? 'currentColor' : 'none'} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(note.id); }}
                className="p-1.5 rounded-lg transition" style={{ color: note.isFavorite ? theme.favColor : theme.textMuted }}>
                <Star className="w-3 h-3" fill={note.isFavorite ? 'currentColor' : 'none'} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); onEdit(note); }}
                className="p-1.5 rounded-lg transition" style={{ color: theme.textMuted }}><Edit3 className="w-3 h-3" /></button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
                className="p-1.5 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition" style={{ color: theme.textMuted }}>
                <Trash2 className="w-3 h-3" /></button>
            </>
          )}
        </div>
      </div>

      {/* Favorite badge */}
      {note.isFavorite && !note.isDeleted && !note.mood && (
        <div className="absolute top-2 left-2"><Star className="w-3 h-3" style={{ color: theme.favColor }} fill="currentColor" /></div>
      )}
    </motion.div>
  );
}
