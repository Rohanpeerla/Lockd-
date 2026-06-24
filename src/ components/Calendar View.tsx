import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Star, Clock, Trash2, Check, CalendarDays } from 'lucide-react';
import { CalendarEvent, ThemeColors } from '../types';
import { EVENT_TYPES } from '../store';

interface CalendarViewProps {
  events: CalendarEvent[];
  theme: ThemeColors;
  onAddEvent: (date: string) => void;
  onEditEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getRecurringMatchDates(event: CalendarEvent, year: number, month: number): string[] {
  // Returns all dates this event appears on in given month
  const matches: string[] = [];
  const originalDate = new Date(event.date + 'T00:00:00');
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);

  if (event.recurring === 'none') {
    if (event.date >= formatDate(monthStart) && event.date <= formatDate(monthEnd)) {
      matches.push(event.date);
    }
    return matches;
  }

  // Iterate through every day of the month
  for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
    if (d < originalDate) continue;
    let match = false;
    if (event.recurring === 'daily') match = true;
    else if (event.recurring === 'weekly' && d.getDay() === originalDate.getDay()) match = true;
    else if (event.recurring === 'monthly' && d.getDate() === originalDate.getDate()) match = true;
    else if (event.recurring === 'yearly' && d.getDate() === originalDate.getDate() && d.getMonth() === originalDate.getMonth()) match = true;
    if (match) matches.push(formatDate(d));
  }
  return matches;
}

export default function CalendarView({ events, theme, onAddEvent, onEditEvent, onDeleteEvent, onToggleComplete }: CalendarViewProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(today));

  // Build event lookup map by date for the current month (including recurring)
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach(event => {
      const dates = getRecurringMatchDates(event, currentYear, currentMonth);
      dates.forEach(d => {
        if (!map[d]) map[d] = [];
        map[d].push(event);
      });
    });
    return map;
  }, [events, currentMonth, currentYear]);

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startOffset = firstDay.getDay();
    const days: { date: Date | null; dateStr: string; isCurrentMonth: boolean; isToday: boolean }[] = [];
    
    // Previous month padding
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth, -i);
      days.push({ date: d, dateStr: formatDate(d), isCurrentMonth: false, isToday: false });
    }
    // Current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(currentYear, currentMonth, i);
      days.push({
        date: d,
        dateStr: formatDate(d),
        isCurrentMonth: true,
        isToday: formatDate(d) === formatDate(today),
      });
    }
    // Next month padding (fill to 42 = 6 weeks)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(currentYear, currentMonth + 1, i);
      days.push({ date: d, dateStr: formatDate(d), isCurrentMonth: false, isToday: false });
    }
    return days;
  }, [currentMonth, currentYear]);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(formatDate(today));
  };

  const selectedDateEvents = eventsByDate[selectedDate] || [];
  const upcomingEvents = events
    .filter(e => {
      const eventDate = new Date(e.date + 'T00:00:00');
      return eventDate >= today || e.recurring !== 'none';
    })
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  // Stats
  const monthEvents = Object.values(eventsByDate).flat();
  const importantCount = monthEvents.filter(e => e.isImportant).length;

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 md:p-6 overflow-hidden">
      {/* Calendar */}
      <div className="flex-1 rounded-2xl overflow-hidden flex flex-col min-h-0"
        style={{ backgroundColor: theme.bgSurface, border: `1px solid ${theme.border}` }}>
        
        {/* Calendar Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${theme.border}` }}>
          <div className="flex items-center gap-3">
            <button onClick={prevMonth}
              className="p-2 rounded-lg hover:bg-white/5 transition"
              style={{ color: theme.textSecondary }}>
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold min-w-[200px] text-center" style={{ color: theme.textPrimary }}>
              {MONTHS[currentMonth]} <span style={{ color: theme.accent }}>{currentYear}</span>
            </h2>
            <button onClick={nextMonth}
              className="p-2 rounded-lg hover:bg-white/5 transition"
              style={{ color: theme.textSecondary }}>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: theme.textMuted }}>
              {monthEvents.length} events
              {importantCount > 0 && <span style={{ color: '#facc15' }}> · {importantCount} ⭐</span>}
            </span>
            <button onClick={goToToday}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition border"
              style={{ borderColor: theme.border, color: theme.textSecondary, backgroundColor: theme.bgInput }}>
              Today
            </button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 px-3 pt-3 pb-2">
          {WEEKDAYS.map((day, i) => (
            <div key={day} className="text-center text-[10px] font-semibold uppercase tracking-wider py-1"
              style={{ color: i === 0 || i === 6 ? theme.accent : theme.textMuted }}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 px-3 pb-3 flex-1 overflow-y-auto">
          {calendarDays.map((day, i) => {
            const dayEvents = eventsByDate[day.dateStr] || [];
            const hasImportant = dayEvents.some(e => e.isImportant);
            const isSelected = day.dateStr === selectedDate;
            
            return (
              <motion.button key={day.dateStr + i}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedDate(day.dateStr)}
                onDoubleClick={() => onAddEvent(day.dateStr)}
                className="relative p-2 rounded-xl min-h-[60px] flex flex-col items-stretch text-left transition-all"
                style={{
                  backgroundColor: isSelected
                    ? theme.accent + '25'
                    : day.isToday
                    ? theme.accent + '12'
                    : 'transparent',
                  border: `1px solid ${
                    isSelected ? theme.accent : day.isToday ? theme.accent + '40' : 'transparent'
                  }`,
                  opacity: day.isCurrentMonth ? 1 : 0.3,
                }}>
                {/* Day number */}
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold"
                    style={{
                      color: day.isToday ? theme.accent : isSelected ? theme.accent : theme.textPrimary,
                    }}>
                    {day.date?.getDate()}
                  </span>
                  {hasImportant && (
                    <Star className="w-2.5 h-2.5" style={{ color: '#facc15' }} fill="currentColor" />
                  )}
                </div>

                {/* Event indicators */}
                <div className="flex flex-col gap-0.5">
                  {dayEvents.slice(0, 2).map((e, idx) => (
                    <div key={idx} className="text-[9px] truncate px-1 py-0.5 rounded font-medium"
                      style={{
                        backgroundColor: e.color + '25',
                        color: e.color,
                        textDecoration: e.isCompleted ? 'line-through' : 'none',
                        opacity: e.isCompleted ? 0.5 : 1,
                      }}>
                      {EVENT_TYPES.find(t => t.type === e.type)?.emoji} {e.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <span className="text-[9px] px-1" style={{ color: theme.textMuted }}>
                      +{dayEvents.length - 2} more
                    </span>
                  )}
                </div>

                {/* Today badge */}
                {day.isToday && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: theme.accent }} />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Side Panel: Selected Date Events */}
      <div className="lg:w-80 flex flex-col gap-4 min-h-0">
        {/* Selected Date Events */}
        <div className="rounded-2xl flex flex-col overflow-hidden flex-1 min-h-0"
          style={{ backgroundColor: theme.bgSurface, border: `1px solid ${theme.border}` }}>
          <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${theme.border}` }}>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: theme.textMuted }}>
                {(() => {
                  const d = new Date(selectedDate + 'T00:00:00');
                  return d.toLocaleDateString('en-US', { weekday: 'long' });
                })()}
              </p>
              <h3 className="text-base font-bold" style={{ color: theme.textPrimary }}>
                {(() => {
                  const d = new Date(selectedDate + 'T00:00:00');
                  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                })()}
              </h3>
            </div>
            <button onClick={() => onAddEvent(selectedDate)}
              className="p-2 rounded-lg text-white transition-all"
              style={{ background: `linear-gradient(135deg, ${theme.accentGradientFrom}, ${theme.accentGradientTo})` }}>
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <AnimatePresence>
              {selectedDateEvents.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-center py-8">
                  <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-30" style={{ color: theme.textMuted }} />
                  <p className="text-xs" style={{ color: theme.textMuted }}>No events on this day</p>
                  <button onClick={() => onAddEvent(selectedDate)}
                    className="mt-3 text-xs font-medium hover:underline"
                    style={{ color: theme.accent }}>
                    + Add an event
                  </button>
                </motion.div>
              ) : (
                selectedDateEvents.sort((a, b) => (a.time || '99').localeCompare(b.time || '99')).map(e => {
                  const evType = EVENT_TYPES.find(t => t.type === e.type);
                  return (
                    <motion.div key={e.id} layout
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                      className="group p-3 rounded-xl cursor-pointer transition-all border"
                      style={{ backgroundColor: theme.bgInput, borderColor: e.color + '30' }}
                      onClick={() => onEditEvent(e)}>
                      <div className="flex items-start gap-2">
                        <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ backgroundColor: e.color }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-sm">{evType?.emoji}</span>
                            <h4 className="text-sm font-medium truncate"
                              style={{
                                color: theme.textPrimary,
                                textDecoration: e.isCompleted ? 'line-through' : 'none',
                                opacity: e.isCompleted ? 0.5 : 1,
                              }}>
                              {e.title}
                            </h4>
                            {e.isImportant && <Star className="w-3 h-3 flex-shrink-0" style={{ color: '#facc15' }} fill="currentColor" />}
                          </div>
                          {(e.time || e.recurring !== 'none') && (
                            <div className="flex items-center gap-2 text-[10px]" style={{ color: theme.textMuted }}>
                              {e.time && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-2.5 h-2.5" /> {e.time}
                                </span>
                              )}
                              {e.recurring !== 'none' && (
                                <span style={{ color: theme.accent }}>↻ {e.recurring}</span>
                              )}
                            </div>
                          )}
                          {e.description && (
                            <p className="text-xs mt-1 line-clamp-2" style={{ color: theme.textSecondary }}>
                              {e.description}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button onClick={(ev) => { ev.stopPropagation(); onToggleComplete(e.id); }}
                            className="p-1 rounded hover:bg-green-500/20 transition"
                            style={{ color: e.isCompleted ? '#10b981' : theme.textMuted }}>
                            <Check className="w-3 h-3" />
                          </button>
                          <button onClick={(ev) => { ev.stopPropagation(); if (confirm('Delete this event?')) onDeleteEvent(e.id); }}
                            className="p-1 rounded hover:bg-red-500/20 text-red-400 transition">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div className="rounded-2xl overflow-hidden flex-shrink-0"
            style={{ backgroundColor: theme.bgSurface, border: `1px solid ${theme.border}` }}>
            <div className="px-4 py-3" style={{ borderBottom: `1px solid ${theme.border}` }}>
              <p className="text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1.5" style={{ color: theme.textMuted }}>
                <Clock className="w-3 h-3" /> Upcoming
              </p>
            </div>
            <div className="p-2 space-y-1 max-h-48 overflow-y-auto">
              {upcomingEvents.map(e => {
                const evType = EVENT_TYPES.find(t => t.type === e.type);
                const d = new Date(e.date + 'T00:00:00');
                const isToday = e.date === formatDate(today);
                return (
                  <button key={e.id} onClick={() => { setSelectedDate(e.date); onEditEvent(e); }}
                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition text-left">
                    <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: e.color }} />
                    <span className="text-base flex-shrink-0">{evType?.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate" style={{ color: theme.textPrimary }}>{e.title}</p>
                      <p className="text-[10px]" style={{ color: isToday ? theme.accent : theme.textMuted }}>
                        {isToday ? 'Today' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {e.time && ` · ${e.time}`}
                      </p>
                    </div>
                    {e.isImportant && <Star className="w-3 h-3" style={{ color: '#facc15' }} fill="currentColor" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
