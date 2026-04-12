// ═══════════════════════════════════════════════════════════════
// SITA OS — Calendar App
// Monthly view with events, add/edit, and day detail panel
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback, useMemo } from "react";
import { AppLayout } from "@/lib/nova-sdk/ui/layout";
import { NovaText, NovaButton, NovaSectionLabel, NovaInput } from "@/lib/nova-sdk/ui/components";
import { AppStateWrapper } from "@/components/sita/shell/AppStateWrapper";
import { cn } from "@/lib/utils";
import { APP_TYPE, APP_COMPONENTS, SPACE } from "@/lib/design-system/app-window-system";
import { ChevronLeft, ChevronRight, Plus, Clock, Trash2 } from "lucide-react";

export const CALENDAR_MANIFEST = {
  id: "com.nova.calendar",
  name: "Calendar",
  version: "1.0.0",
  publisher: "SITA OS",
  icon: "📅",
  iconBg: "from-red-500 to-orange-500",
  permissions: [] as const,
  windowDefaults: { width: 580, height: 440 },
  category: "productivity",
  description: "Calendar and scheduling for SITA OS",
};

interface CalEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  color: string;
}

const EVENT_COLORS = [
  "hsl(var(--primary))",
  "hsl(0 70% 55%)",
  "hsl(120 50% 45%)",
  "hsl(38 85% 55%)",
  "hsl(200 70% 50%)",
  "hsl(280 50% 55%)",
];

const STORAGE_KEY = "sita-calendar-events";

function loadEvents(): CalEvent[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function saveEvents(events: CalEvent[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function CalendarWindow() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(toDateStr(today.getFullYear(), today.getMonth(), today.getDate()));
  const [events, setEvents] = useState<CalEvent[]>(loadEvents);
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("");
  const [colorIdx, setColorIdx] = useState(0);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  const prevMonth = useCallback(() => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }, [month]);

  const nextMonth = useCallback(() => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }, [month]);

  const goToday = useCallback(() => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelectedDate(todayStr);
  }, [todayStr]);

  const addEvent = useCallback(() => {
    if (!newTitle.trim() || !selectedDate) return;
    const ev: CalEvent = {
      id: `ev-${Date.now()}`,
      title: newTitle.trim(),
      date: selectedDate,
      time: newTime || undefined,
      color: EVENT_COLORS[colorIdx % EVENT_COLORS.length],
    };
    const updated = [...events, ev];
    setEvents(updated);
    saveEvents(updated);
    setNewTitle("");
    setNewTime("");
    setColorIdx(i => i + 1);
  }, [newTitle, newTime, selectedDate, events, colorIdx]);

  const removeEvent = useCallback((id: string) => {
    const updated = events.filter(e => e.id !== id);
    setEvents(updated);
    saveEvents(updated);
  }, [events]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalEvent[]> = {};
    for (const e of events) {
      (map[e.date] ??= []).push(e);
    }
    return map;
  }, [events]);

  const selectedEvents = selectedDate ? (eventsByDate[selectedDate] || []) : [];

  // Build calendar grid
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const sidebar = (
    <div className="flex flex-col h-full gap-3">
      <NovaSectionLabel>{selectedDate ? new Date(selectedDate + "T00:00").toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" }) : "Select a day"}</NovaSectionLabel>

      {selectedDate && (
        <>
          <div className="space-y-1.5">
            {selectedEvents.length === 0 && (
              <NovaText variant="body" muted>No events</NovaText>
            )}
            {selectedEvents.map(ev => (
              <div
                key={ev.id}
                className={cn(APP_COMPONENTS.card.base, "!p-2 flex items-start gap-2 group")}
              >
                <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ background: ev.color }} />
                <div className="flex-1 min-w-0">
                  <NovaText variant="body" className="!font-medium truncate block">{ev.title}</NovaText>
                  {ev.time && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock className="w-2.5 h-2.5 text-[hsl(var(--muted-foreground))]" />
                      <NovaText variant="label" muted>{ev.time}</NovaText>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeEvent(ev.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-[hsl(0_70%_55%/0.1)]"
                >
                  <Trash2 className="w-3 h-3 text-[hsl(0_70%_55%)]" />
                </button>
              </div>
            ))}
          </div>

          {/* Add event form */}
          <div className="mt-auto space-y-2 pt-2 border-t border-[hsl(0_0%_0%/0.06)] dark:border-[hsl(0_0%_100%/0.06)]">
            <NovaInput
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="New event..."
              onKeyDown={e => e.key === "Enter" && addEvent()}
            />
            <div className="flex items-center gap-2">
              <NovaInput
                value={newTime}
                onChange={e => setNewTime(e.target.value)}
                placeholder="Time (e.g. 2:00 PM)"
                className="flex-1"
              />
              <NovaButton variant="primary" onClick={addEvent} className="!px-2 !py-1.5">
                <Plus className="h-3 w-3" />
              </NovaButton>
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <AppStateWrapper
      state="ready"
      accentGradient="from-[hsl(0_70%_55%)] to-[hsl(15_80%_50%)]"
    >
      <AppLayout sidebar={sidebar} sidebarWidth={180} minHeight={340}>
        <div className="flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <NovaButton variant="ghost" onClick={prevMonth} className="!p-1">
                <ChevronLeft className="h-4 w-4" />
              </NovaButton>
              <NovaText variant="title" className="min-w-[140px] text-center">
                {MONTHS[month]} {year}
              </NovaText>
              <NovaButton variant="ghost" onClick={nextMonth} className="!p-1">
                <ChevronRight className="h-4 w-4" />
              </NovaButton>
            </div>
            <NovaButton variant="secondary" onClick={goToday} className="!text-[11px]">
              Today
            </NovaButton>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-px">
            {DAYS.map(d => (
              <div key={d} className="text-center py-1">
                <NovaText variant="label" muted>{d}</NovaText>
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-px">
            {cells.map((day, i) => {
              if (day === null) return <div key={`e-${i}`} className="h-10" />;
              const dateStr = toDateStr(year, month, day);
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;
              const dayEvents = eventsByDate[dateStr] || [];

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={cn(
                    "h-10 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all duration-[80ms] relative",
                    isSelected
                      ? "bg-[hsl(var(--primary)/0.15)] ring-1 ring-[hsl(var(--primary)/0.3)]"
                      : "hover:bg-[hsl(0_0%_0%/0.04)] dark:hover:bg-[hsl(0_0%_100%/0.06)]",
                    isToday && !isSelected && "ring-1 ring-[hsl(var(--primary)/0.2)]"
                  )}
                >
                  <span className={cn(
                    "text-[12px] font-medium leading-none",
                    isToday ? "text-[hsl(var(--primary))]" : "text-[hsl(0_0%_30%)] dark:text-[hsl(0_0%_70%)]",
                    isSelected && "font-semibold"
                  )}>
                    {day}
                  </span>
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5">
                      {dayEvents.slice(0, 3).map(ev => (
                        <div key={ev.id} className="w-1 h-1 rounded-full" style={{ background: ev.color }} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </AppLayout>
    </AppStateWrapper>
  );
}
