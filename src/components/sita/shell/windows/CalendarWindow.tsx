// ═══════════════════════════════════════════════════════════════
// SITA OS — Calendar App (God Tier)
// Multi-view (month/week), drag-to-create events, mini-month nav,
// event categories, timeline sidebar, animated transitions
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback, useMemo, useRef } from "react";
import { AppLayout } from "@/lib/nova-sdk/ui/layout";
import { NovaText, NovaButton, NovaSectionLabel, NovaInput, NovaBadge } from "@/lib/nova-sdk/ui/components";
import { AppStateWrapper } from "@/components/sita/shell/AppStateWrapper";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { APP_TYPE, APP_COMPONENTS } from "@/lib/design-system/app-window-system";
import {
  ChevronLeft, ChevronRight, Plus, Clock, Trash2, X,
  Calendar as CalIcon, LayoutGrid, Rows3, MapPin, Tag, Repeat,
} from "lucide-react";
import { SoundEngine } from "@/lib/sound-engine";

export const CALENDAR_MANIFEST = {
  id: "com.nova.calendar",
  name: "Calendar",
  version: "2.0.0",
  publisher: "SITA OS",
  icon: "📅",
  iconBg: "from-red-500 to-orange-500",
  permissions: [] as const,
  windowDefaults: { width: 640, height: 500 },
  category: "productivity",
  description: "Premium calendar with multi-view and smart scheduling",
  designVersion: "nova-1.0",
};

// ── Types ──────────────────────────────────────────────────

interface CalEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  time?: string;
  endTime?: string;
  color: string;
  category: string;
  location?: string;
  recurring?: "daily" | "weekly" | "monthly" | null;
}

type ViewMode = "month" | "week";

const CATEGORIES = [
  { id: "personal", label: "Personal", color: "hsl(var(--primary))" },
  { id: "work", label: "Work", color: "hsl(210 70% 50%)" },
  { id: "health", label: "Health", color: "hsl(120 50% 45%)" },
  { id: "social", label: "Social", color: "hsl(38 85% 55%)" },
  { id: "finance", label: "Finance", color: "hsl(0 70% 55%)" },
  { id: "other", label: "Other", color: "hsl(280 50% 55%)" },
];

const STORAGE_KEY = "sita-calendar-events";
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function loadEvents(): CalEvent[] { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; } }
function saveEvents(events: CalEvent[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(events)); }
function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDayOfWeek(y: number, m: number) { return new Date(y, m, 1).getDay(); }
function toDateStr(y: number, m: number, d: number) { return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`; }

// ── Mini Month (navigation) ───────────────────────────────

function MiniMonth({ year, month, selectedDate, onSelect, events }: {
  year: number; month: number; selectedDate: string | null;
  onSelect: (date: string) => void; events: Record<string, CalEvent[]>;
}) {
  const days = getDaysInMonth(year, month);
  const first = getFirstDayOfWeek(year, month);
  const today = toDateStr(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

  return (
    <div className="select-none">
      <div className="grid grid-cols-7 gap-0 mb-0.5">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[8px] font-medium text-[hsl(0_0%_50%)] py-0.5">{d[0]}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0">
        {Array.from({ length: first }, (_, i) => <div key={`e${i}`} className="h-5" />)}
        {Array.from({ length: days }, (_, i) => {
          const d = i + 1;
          const dateStr = toDateStr(year, month, d);
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;
          const hasEvents = (events[dateStr]?.length || 0) > 0;
          return (
            <button
              key={d}
              onClick={() => onSelect(dateStr)}
              className={cn(
                "h-5 w-full flex items-center justify-center rounded text-[9px] transition-all duration-75 relative",
                isSelected ? "bg-[hsl(var(--primary))] text-[hsl(0_0%_100%)] font-bold" :
                isToday ? "text-[hsl(var(--primary))] font-bold" :
                "text-[hsl(0_0%_40%)] dark:text-[hsl(0_0%_60%)] hover:bg-[hsl(0_0%_0%/0.05)] dark:hover:bg-[hsl(0_0%_100%/0.06)]",
              )}
            >
              {d}
              {hasEvents && !isSelected && (
                <span className="absolute bottom-0 w-1 h-0.5 rounded-full bg-[hsl(var(--primary))]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Add Event Form ────────────────────────────────────────

function AddEventForm({ date, onAdd, onClose }: {
  date: string; onAdd: (event: CalEvent) => void; onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [category, setCategory] = useState("personal");
  const [location, setLocation] = useState("");

  const handleSubmit = () => {
    if (!title.trim()) return;
    const cat = CATEGORIES.find(c => c.id === category)!;
    onAdd({
      id: `ev-${Date.now()}`,
      title: title.trim(),
      date,
      time: time || undefined,
      endTime: endTime || undefined,
      color: cat.color,
      category,
      location: location || undefined,
    });
    SoundEngine.approve();
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="p-3 rounded-xl bg-[hsl(0_0%_100%/0.95)] dark:bg-[hsl(0_0%_8%/0.95)] backdrop-blur-xl border border-[hsl(0_0%_0%/0.08)] dark:border-[hsl(0_0%_100%/0.08)] shadow-2xl space-y-2"
    >
      <div className="flex items-center justify-between">
        <span className={cn(APP_TYPE.label, "text-[hsl(var(--primary))]")}>
          {new Date(date + "T00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
        </span>
        <button onClick={onClose} className="p-0.5 rounded hover:bg-[hsl(0_0%_0%/0.05)]"><X className="w-3 h-3 text-[hsl(0_0%_45%)]" /></button>
      </div>

      <NovaInput value={title} onChange={e => setTitle(e.target.value)} placeholder="Event title..." onKeyDown={e => e.key === "Enter" && handleSubmit()} className="!text-[12px]" autoFocus />

      <div className="flex gap-2">
        <NovaInput value={time} onChange={e => setTime(e.target.value)} placeholder="Start" className="flex-1 !text-[11px]" />
        <span className="text-[hsl(0_0%_50%)] self-center text-[11px]">→</span>
        <NovaInput value={endTime} onChange={e => setEndTime(e.target.value)} placeholder="End" className="flex-1 !text-[11px]" />
      </div>

      <NovaInput value={location} onChange={e => setLocation(e.target.value)} placeholder="Location (optional)" icon={<MapPin className="w-2.5 h-2.5" />} className="!text-[11px]" />

      {/* Category pills */}
      <div className="flex flex-wrap gap-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-all duration-100",
              category === cat.id
                ? "ring-1 ring-offset-1 ring-[hsl(0_0%_0%/0.15)] dark:ring-[hsl(0_0%_100%/0.15)]"
                : "opacity-60 hover:opacity-100"
            )}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: cat.color }} />
            {cat.label}
          </button>
        ))}
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <NovaButton variant="ghost" onClick={onClose} className="!text-[11px] !py-1">Cancel</NovaButton>
        <NovaButton variant="primary" onClick={handleSubmit} className="!text-[11px] !py-1" icon={<Plus className="w-2.5 h-2.5" />}>Add</NovaButton>
      </div>
    </motion.div>
  );
}

// ── Main Calendar ─────────────────────────────────────────

export function CalendarWindow() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(toDateStr(today.getFullYear(), today.getMonth(), today.getDate()));
  const [events, setEvents] = useState<CalEvent[]>(loadEvents);
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [direction, setDirection] = useState(0);

  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalEvent[]> = {};
    for (const e of events) { (map[e.date] ??= []).push(e); }
    return map;
  }, [events]);

  const prevMonth = useCallback(() => {
    setDirection(-1);
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }, [month]);

  const nextMonth = useCallback(() => {
    setDirection(1);
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }, [month]);

  const goToday = useCallback(() => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelectedDate(todayStr);
  }, [todayStr]);

  const addEvent = useCallback((ev: CalEvent) => {
    const updated = [...events, ev];
    setEvents(updated);
    saveEvents(updated);
  }, [events]);

  const removeEvent = useCallback((id: string) => {
    const updated = events.filter(e => e.id !== id);
    setEvents(updated);
    saveEvents(updated);
    SoundEngine.click();
  }, [events]);

  const selectedEvents = selectedDate ? (eventsByDate[selectedDate] || []) : [];
  const upcomingEvents = useMemo(() => {
    return events
      .filter(e => e.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  }, [events, todayStr]);

  // Grid cells
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  // Week view: get days for the week containing selectedDate
  const weekDays = useMemo(() => {
    if (!selectedDate) return [];
    const d = new Date(selectedDate + "T00:00");
    const dayOfWeek = d.getDay();
    const days: string[] = [];
    for (let i = 0; i < 7; i++) {
      const dd = new Date(d);
      dd.setDate(d.getDate() - dayOfWeek + i);
      days.push(toDateStr(dd.getFullYear(), dd.getMonth(), dd.getDate()));
    }
    return days;
  }, [selectedDate]);

  const sidebar = (
    <div className="flex flex-col h-full gap-3">
      {/* Mini-month navigation */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <button onClick={prevMonth} className="p-0.5 rounded hover:bg-[hsl(0_0%_0%/0.05)] dark:hover:bg-[hsl(0_0%_100%/0.06)]"><ChevronLeft className="w-3 h-3 text-[hsl(0_0%_50%)]" /></button>
          <span className="text-[10px] font-semibold text-[hsl(0_0%_30%)] dark:text-[hsl(0_0%_70%)]">{MONTHS_SHORT[month]} {year}</span>
          <button onClick={nextMonth} className="p-0.5 rounded hover:bg-[hsl(0_0%_0%/0.05)] dark:hover:bg-[hsl(0_0%_100%/0.06)]"><ChevronRight className="w-3 h-3 text-[hsl(0_0%_50%)]" /></button>
        </div>
        <MiniMonth year={year} month={month} selectedDate={selectedDate} onSelect={setSelectedDate} events={eventsByDate} />
      </div>

      <div className="h-px bg-[hsl(0_0%_0%/0.06)] dark:bg-[hsl(0_0%_100%/0.06)]" />

      {/* Upcoming events */}
      <div className="flex-1 overflow-y-auto">
        <NovaSectionLabel className="!text-[9px]">Upcoming</NovaSectionLabel>
        <div className="space-y-1.5">
          {upcomingEvents.length === 0 && <NovaText variant="label" muted>No upcoming events</NovaText>}
          {upcomingEvents.map(ev => (
            <div key={ev.id} className="flex items-start gap-2 group px-1">
              <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: ev.color }} />
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-medium text-[hsl(0_0%_25%)] dark:text-[hsl(0_0%_75%)] truncate">{ev.title}</div>
                <div className="text-[9px] text-[hsl(0_0%_50%)] flex items-center gap-1">
                  {new Date(ev.date + "T00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  {ev.time && <> · {ev.time}</>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category legend */}
      <div className="space-y-0.5">
        <NovaSectionLabel className="!text-[9px]">Categories</NovaSectionLabel>
        {CATEGORIES.map(cat => (
          <div key={cat.id} className="flex items-center gap-1.5 px-1 py-0.5">
            <span className="w-2 h-2 rounded-sm" style={{ background: cat.color }} />
            <span className="text-[10px] text-[hsl(0_0%_45%)] dark:text-[hsl(0_0%_55%)]">{cat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <AppStateWrapper state="ready" accentGradient="from-[hsl(0_70%_55%)] to-[hsl(15_80%_50%)]">
      <AppLayout sidebar={sidebar} sidebarWidth={170} minHeight={400}>
        <div className="flex flex-col h-full gap-2">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <NovaButton variant="ghost" onClick={prevMonth} className="!p-1"><ChevronLeft className="h-4 w-4" /></NovaButton>
              <NovaText variant="title" className="min-w-[150px] text-center">{MONTHS[month]} {year}</NovaText>
              <NovaButton variant="ghost" onClick={nextMonth} className="!p-1"><ChevronRight className="h-4 w-4" /></NovaButton>
            </div>
            <div className="flex items-center gap-1.5">
              <NovaButton variant="secondary" onClick={goToday} className="!text-[10px] !py-1 !px-2">Today</NovaButton>
              <div className="flex bg-[hsl(0_0%_0%/0.04)] dark:bg-[hsl(0_0%_100%/0.06)] rounded-md p-0.5">
                <button
                  onClick={() => setViewMode("month")}
                  className={cn("p-1 rounded transition-colors", viewMode === "month" ? "bg-[hsl(0_0%_100%)] dark:bg-[hsl(0_0%_15%)] shadow-sm" : "")}
                  title="Month view"
                ><LayoutGrid className="w-3 h-3 text-[hsl(0_0%_50%)]" /></button>
                <button
                  onClick={() => setViewMode("week")}
                  className={cn("p-1 rounded transition-colors", viewMode === "week" ? "bg-[hsl(0_0%_100%)] dark:bg-[hsl(0_0%_15%)] shadow-sm" : "")}
                  title="Week view"
                ><Rows3 className="w-3 h-3 text-[hsl(0_0%_50%)]" /></button>
              </div>
              <NovaButton variant="primary" onClick={() => setShowAddForm(true)} className="!text-[10px] !py-1 !px-2" icon={<Plus className="w-2.5 h-2.5" />}>
                Event
              </NovaButton>
            </div>
          </div>

          {/* Add event form overlay */}
          <AnimatePresence>
            {showAddForm && selectedDate && (
              <AddEventForm date={selectedDate} onAdd={addEvent} onClose={() => setShowAddForm(false)} />
            )}
          </AnimatePresence>

          {/* Month View */}
          {viewMode === "month" && !showAddForm && (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${year}-${month}`}
                initial={{ opacity: 0, x: direction * 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -30 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-px mb-1">
                  {DAYS.map(d => (
                    <div key={d} className="text-center py-0.5">
                      <span className="text-[10px] font-medium text-[hsl(0_0%_45%)] dark:text-[hsl(0_0%_55%)]">{d}</span>
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-px">
                  {cells.map((day, i) => {
                    if (day === null) return <div key={`e-${i}`} className="h-16" />;
                    const dateStr = toDateStr(year, month, day);
                    const isToday = dateStr === todayStr;
                    const isSelected = dateStr === selectedDate;
                    const dayEvents = eventsByDate[dateStr] || [];

                    return (
                      <button
                        key={dateStr}
                        onClick={() => setSelectedDate(dateStr)}
                        onDoubleClick={() => { setSelectedDate(dateStr); setShowAddForm(true); }}
                        className={cn(
                          "h-16 rounded-lg flex flex-col items-start p-1 gap-0.5 transition-all duration-[80ms] relative overflow-hidden",
                          isSelected
                            ? "bg-[hsl(var(--primary)/0.08)] ring-1 ring-[hsl(var(--primary)/0.2)]"
                            : "hover:bg-[hsl(0_0%_0%/0.03)] dark:hover:bg-[hsl(0_0%_100%/0.04)]",
                        )}
                      >
                        <span className={cn(
                          "text-[11px] font-medium leading-none",
                          isToday ? "w-5 h-5 rounded-full bg-[hsl(var(--primary))] text-[hsl(0_0%_100%)] flex items-center justify-center text-[10px]" : "",
                          !isToday && isSelected ? "text-[hsl(var(--primary))] font-semibold" : "",
                          !isToday && !isSelected ? "text-[hsl(0_0%_35%)] dark:text-[hsl(0_0%_65%)]" : "",
                        )}>
                          {day}
                        </span>
                        <div className="w-full space-y-0.5 overflow-hidden">
                          {dayEvents.slice(0, 2).map(ev => (
                            <div
                              key={ev.id}
                              className="flex items-center gap-0.5 rounded px-1 py-0 text-[8px] font-medium truncate"
                              style={{ background: ev.color + "20", color: ev.color }}
                            >
                              <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: ev.color }} />
                              <span className="truncate">{ev.title}</span>
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <span className="text-[8px] text-[hsl(0_0%_50%)] pl-1">+{dayEvents.length - 2} more</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Week View */}
          {viewMode === "week" && !showAddForm && (
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-7 gap-1">
                {weekDays.map(dateStr => {
                  const d = new Date(dateStr + "T00:00");
                  const isToday = dateStr === todayStr;
                  const isSelected = dateStr === selectedDate;
                  const dayEvents = eventsByDate[dateStr] || [];

                  return (
                    <div
                      key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                      className={cn(
                        "rounded-xl p-2 min-h-[200px] cursor-pointer transition-all duration-100",
                        isSelected ? "bg-[hsl(var(--primary)/0.06)] ring-1 ring-[hsl(var(--primary)/0.15)]" : "hover:bg-[hsl(0_0%_0%/0.02)] dark:hover:bg-[hsl(0_0%_100%/0.03)]",
                      )}
                    >
                      <div className="text-center mb-2">
                        <div className="text-[9px] font-medium text-[hsl(0_0%_50%)]">{DAYS[d.getDay()]}</div>
                        <div className={cn(
                          "text-[16px] font-semibold leading-none mt-0.5",
                          isToday ? "text-[hsl(var(--primary))]" : "text-[hsl(0_0%_30%)] dark:text-[hsl(0_0%_70%)]"
                        )}>
                          {d.getDate()}
                        </div>
                      </div>
                      <div className="space-y-1">
                        {dayEvents.map(ev => (
                          <div
                            key={ev.id}
                            className="rounded-md px-1.5 py-1 text-[9px] group relative"
                            style={{ background: ev.color + "15", borderLeft: `2px solid ${ev.color}` }}
                          >
                            <div className="font-medium" style={{ color: ev.color }}>{ev.title}</div>
                            {ev.time && <div className="text-[8px] text-[hsl(0_0%_50%)] flex items-center gap-0.5"><Clock className="w-2 h-2" />{ev.time}{ev.endTime && ` – ${ev.endTime}`}</div>}
                            <button
                              onClick={(e) => { e.stopPropagation(); removeEvent(ev.id); }}
                              className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-[hsl(0_70%_55%/0.1)] transition-opacity"
                            >
                              <X className="w-2 h-2 text-[hsl(0_70%_55%)]" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected day detail strip */}
          {selectedDate && selectedEvents.length > 0 && !showAddForm && (
            <div className="border-t border-[hsl(0_0%_0%/0.06)] dark:border-[hsl(0_0%_100%/0.06)] pt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold text-[hsl(0_0%_40%)] dark:text-[hsl(0_0%_60%)]">
                  {new Date(selectedDate + "T00:00").toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
                </span>
                <span className="text-[9px] text-[hsl(0_0%_50%)]">{selectedEvents.length} event{selectedEvents.length > 1 ? "s" : ""}</span>
              </div>
              <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
                {selectedEvents.map(ev => (
                  <div
                    key={ev.id}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg flex-shrink-0 group"
                    style={{ background: ev.color + "12", borderLeft: `3px solid ${ev.color}` }}
                  >
                    <div>
                      <div className="text-[11px] font-medium text-[hsl(0_0%_20%)] dark:text-[hsl(0_0%_80%)]">{ev.title}</div>
                      <div className="text-[9px] text-[hsl(0_0%_50%)] flex items-center gap-1">
                        {ev.time && <><Clock className="w-2 h-2" />{ev.time}{ev.endTime && ` – ${ev.endTime}`}</>}
                        {ev.location && <><MapPin className="w-2 h-2 ml-1" />{ev.location}</>}
                      </div>
                    </div>
                    <button
                      onClick={() => removeEvent(ev.id)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-[hsl(0_70%_55%/0.1)] transition-opacity"
                    ><Trash2 className="w-2.5 h-2.5 text-[hsl(0_70%_55%)]" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </AppLayout>
    </AppStateWrapper>
  );
}
