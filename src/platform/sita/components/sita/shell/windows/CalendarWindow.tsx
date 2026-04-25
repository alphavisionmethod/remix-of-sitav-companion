// ═══════════════════════════════════════════════════════════════
// SITA OS — Calendar App (Unified, DB-Connected, 4-View)
// Month / Week / Day / Agenda views with multi-source integration
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback, useMemo } from "react";
import { AppLayout, VStack, HStack } from "@/platform/nova-sdk/ui/layout";
import { NovaText, NovaButton, NovaBadge, NovaInput } from "@/platform/nova-sdk/ui/components";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  ChevronLeft, ChevronRight, Plus, Clock, Trash2, X, Check,
  Calendar as CalIcon, LayoutGrid, List, MapPin, Pencil,
  Eye, EyeOff, RotateCcw,
} from "lucide-react";
import { SoundEngine } from "@/platform/runtime/sound-engine";
import {
  useUnifiedCalendar,
  useCalendarSources,
  useCreateCalendarEvent,
  useUpdateCalendarEvent,
  useDeleteCalendarEvent,
  type UnifiedCalendarEvent,
  type CalendarSource,
  type CalendarEventInput,
} from "@/hooks/use-unified-calendar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const CALENDAR_MANIFEST = {
  id: "com.nova.calendar",
  name: "Calendar",
  version: "3.0.0",
  publisher: "SITA OS",
  icon: "📅",
  iconBg: "from-red-500 to-orange-500",
  permissions: [] as const,
  windowDefaults: { width: 780, height: 560 },
  category: "productivity",
  description: "Unified calendar with cross-domain event integration",
  designVersion: "nova-1.0",
};

type ViewMode = "month" | "week" | "day" | "agenda";

const SOURCE_META: Record<CalendarSource, { label: string; color: string; dot: string }> = {
  personal: { label: "Personal", color: "hsl(265 55% 58%)", dot: "bg-[hsl(265_55%_58%)]" },
  business: { label: "Business", color: "hsl(220 70% 55%)", dot: "bg-[hsl(220_70%_55%)]" },
  finance: { label: "Finance", color: "hsl(152 55% 48%)", dot: "bg-[hsl(152_55%_48%)]" },
  concierge: { label: "Concierge", color: "hsl(38 85% 58%)", dot: "bg-[hsl(38_85%_58%)]" },
  household: { label: "Household", color: "hsl(340 65% 55%)", dot: "bg-[hsl(340_65%_55%)]" },
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 7am–9pm

const fmt2 = (n: number) => n.toString().padStart(2, "0");
const monthName = (m: number) => ["January","February","March","April","May","June","July","August","September","October","November","December"][m];

function getMonthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  let startDay = first.getDay() - 1;
  if (startDay < 0) startDay = 6;
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= last.getDate(); d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function getWeekDates(date: Date): Date[] {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(monday);
    dt.setDate(monday.getDate() + i);
    return dt;
  });
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${fmt2(d.getMonth() + 1)}-${fmt2(d.getDate())}`;
}

function parseTime(t?: string): number | null {
  if (!t) return null;
  // Handle ISO datetime or HH:MM
  const match = t.match(/(\d{2}):(\d{2})/);
  if (!match) return null;
  return parseInt(match[1]) + parseInt(match[2]) / 60;
}

function formatTimeShort(t?: string): string {
  if (!t) return "";
  const match = t.match(/(\d{2}):(\d{2})/);
  if (!match) return "";
  const h = parseInt(match[1]);
  const m = match[2];
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

function getDomainColor(domain: string): string {
  return SOURCE_META[domain as CalendarSource]?.dot || "bg-[hsl(265_55%_58%)]";
}

// ═══════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════

export function CalendarWindow() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<UnifiedCalendarEvent | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { sources, toggleSource, allSources } = useCalendarSources();
  const { events, isLoading, isDemo } = useUnifiedCalendar(viewYear, viewMonth, sources);
  const createMutation = useCreateCalendarEvent();
  const updateMutation = useUpdateCalendarEvent();
  const deleteMutation = useDeleteCalendarEvent();

  const eventsForDate = useCallback((dateStr: string) =>
    events.filter(e => e.date === dateStr), [events]);

  const navigateMonth = useCallback((delta: number) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m > 11) { m = 0; y++; }
    if (m < 0) { m = 11; y--; }
    setViewMonth(m);
    setViewYear(y);
    SoundEngine.click();
  }, [viewMonth, viewYear]);

  const goToday = useCallback(() => {
    setSelectedDate(today);
    setViewMonth(today.getMonth());
    setViewYear(today.getFullYear());
    SoundEngine.click();
  }, [today]);

  const selectedDateStr = toDateStr(selectedDate);
  const selectedEvents = eventsForDate(selectedDateStr);

  // ── Create Event Handler ──
  const handleCreateEvent = useCallback((input: CalendarEventInput) => {
    createMutation.mutate(input);
    setShowCreateDialog(false);
    SoundEngine.approve();
  }, [createMutation]);

  const handleDeleteEvent = useCallback((id: string) => {
    if (id.startsWith("demo-") || id.startsWith("apt-")) return;
    deleteMutation.mutate(id);
    setEditingEvent(null);
    SoundEngine.click();
  }, [deleteMutation]);

  return (
    <>
      <AppLayout>
        <div className="flex h-full overflow-hidden">
          {/* ── Sidebar ── */}
          {!sidebarCollapsed && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 200, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="w-[200px] shrink-0 border-r border-[hsl(0_0%_100%/0.06)] flex flex-col overflow-y-auto"
            >
              {/* Mini Calendar */}
              <div className="p-2">
                <MiniCalendar
                  year={viewYear}
                  month={viewMonth}
                  selectedDate={selectedDate}
                  events={events}
                  onSelectDate={(d) => { setSelectedDate(d); SoundEngine.click(); }}
                  onNavigate={navigateMonth}
                />
              </div>

              {/* Sources */}
              <div className="px-2 py-1">
                <NovaText variant="label" muted className="!text-[9px] uppercase tracking-wider mb-1">Sources</NovaText>
                {allSources.map(src => {
                  const meta = SOURCE_META[src];
                  const active = sources.includes(src);
                  return (
                    <button
                      key={src}
                      onClick={() => toggleSource(src)}
                      className={cn(
                        "flex items-center gap-1.5 w-full px-1.5 py-1 rounded-md text-[10px] transition-all",
                        active ? "text-foreground" : "text-[hsl(0_0%_40%)]"
                      )}
                    >
                      <div className={cn("w-2.5 h-2.5 rounded-sm shrink-0", meta.dot, !active && "opacity-30")} />
                      <span className="truncate">{meta.label}</span>
                      {active ? <Eye className="w-3 h-3 ml-auto opacity-40" /> : <EyeOff className="w-3 h-3 ml-auto opacity-30" />}
                    </button>
                  );
                })}
              </div>

              {/* Upcoming Events */}
              <div className="px-2 py-1 flex-1 overflow-y-auto">
                <NovaText variant="label" muted className="!text-[9px] uppercase tracking-wider mb-1">Upcoming</NovaText>
                <VStack spacing="micro">
                  {events.slice(0, 6).map(ev => (
                    <button
                      key={ev.id}
                      onClick={() => { setSelectedDate(new Date(ev.date)); setEditingEvent(ev); }}
                      className="flex items-center gap-1.5 px-1.5 py-1 rounded-md text-[9px] text-left w-full hover:bg-[hsl(0_0%_100%/0.04)] transition-colors"
                    >
                      <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", getDomainColor(ev.domain))} />
                      <span className="truncate text-foreground">{ev.title}</span>
                    </button>
                  ))}
                </VStack>
              </div>

              {isDemo && (
                <div className="px-2 py-1.5 border-t border-[hsl(0_0%_100%/0.06)]">
                  <NovaBadge variant="warning" className="!text-[8px] w-full justify-center">Demo Mode</NovaBadge>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Main Content ── */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-[hsl(0_0%_100%/0.06)] shrink-0">
              <HStack spacing="tight" align="center">
                <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-1 rounded hover:bg-[hsl(0_0%_100%/0.06)] transition-colors">
                  <LayoutGrid className="w-3.5 h-3.5 text-[hsl(0_0%_55%)]" />
                </button>
                <button onClick={() => navigateMonth(-1)} className="p-1 rounded hover:bg-[hsl(0_0%_100%/0.06)]">
                  <ChevronLeft className="w-3.5 h-3.5 text-[hsl(0_0%_55%)]" />
                </button>
                <NovaText variant="label" className="!text-[13px] font-semibold min-w-[140px] text-center">
                  {monthName(viewMonth)} {viewYear}
                </NovaText>
                <button onClick={() => navigateMonth(1)} className="p-1 rounded hover:bg-[hsl(0_0%_100%/0.06)]">
                  <ChevronRight className="w-3.5 h-3.5 text-[hsl(0_0%_55%)]" />
                </button>
                <button onClick={goToday} className="px-2 py-0.5 rounded text-[9px] font-medium text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.1)] transition-colors">
                  Today
                </button>
              </HStack>

              <HStack spacing="micro" align="center">
                {(["day", "week", "month", "agenda"] as ViewMode[]).map(v => (
                  <button
                    key={v}
                    onClick={() => { setViewMode(v); SoundEngine.click(); }}
                    className={cn(
                      "px-2 py-1 rounded-md text-[9px] font-medium transition-all capitalize",
                      viewMode === v
                        ? "bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))]"
                        : "text-[hsl(0_0%_55%)] hover:text-foreground"
                    )}
                  >{v}</button>
                ))}
                <button
                  onClick={() => { setShowCreateDialog(true); SoundEngine.click(); }}
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-medium bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 transition-opacity ml-1"
                >
                  <Plus className="w-3 h-3" /> New Event
                </button>
              </HStack>
            </div>

            {/* View Content */}
            <div className="flex-1 overflow-auto">
              <AnimatePresence mode="wait">
                {viewMode === "month" && (
                  <MonthView
                    key="month"
                    year={viewYear}
                    month={viewMonth}
                    selectedDate={selectedDate}
                    events={events}
                    onSelectDate={setSelectedDate}
                    onEventClick={setEditingEvent}
                  />
                )}
                {viewMode === "week" && (
                  <WeekView
                    key="week"
                    selectedDate={selectedDate}
                    events={events}
                    onSelectDate={setSelectedDate}
                    onEventClick={setEditingEvent}
                  />
                )}
                {viewMode === "day" && (
                  <DayView
                    key="day"
                    selectedDate={selectedDate}
                    events={selectedEvents}
                    onEventClick={setEditingEvent}
                  />
                )}
                {viewMode === "agenda" && (
                  <AgendaView
                    key="agenda"
                    events={events}
                    onEventClick={setEditingEvent}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Create Event Dialog */}
        <CreateEventDialog
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          onSave={handleCreateEvent}
          defaultDate={selectedDateStr}
        />

        {/* Event Detail Dialog */}
        {editingEvent && (
          <EventDetailDialog
            event={editingEvent}
            onClose={() => setEditingEvent(null)}
            onDelete={handleDeleteEvent}
          />
        )}
      </AppLayout>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// Mini Calendar (Sidebar)
// ═══════════════════════════════════════════════════════════════

function MiniCalendar({ year, month, selectedDate, events, onSelectDate, onNavigate }: {
  year: number; month: number; selectedDate: Date;
  events: UnifiedCalendarEvent[];
  onSelectDate: (d: Date) => void;
  onNavigate: (delta: number) => void;
}) {
  const cells = getMonthGrid(year, month);
  const todayStr = toDateStr(new Date());
  const selStr = toDateStr(selectedDate);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <button onClick={() => onNavigate(-1)} className="p-0.5 rounded hover:bg-[hsl(0_0%_100%/0.06)]">
          <ChevronLeft className="w-3 h-3 text-[hsl(0_0%_55%)]" />
        </button>
        <NovaText variant="label" className="!text-[10px] font-semibold">{monthName(month).slice(0, 3)} {year}</NovaText>
        <button onClick={() => onNavigate(1)} className="p-0.5 rounded hover:bg-[hsl(0_0%_100%/0.06)]">
          <ChevronRight className="w-3 h-3 text-[hsl(0_0%_55%)]" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[8px] text-[hsl(0_0%_45%)] py-0.5 font-medium">{d[0]}</div>
        ))}
        {cells.map((cell, i) => {
          if (!cell) return <div key={`e-${i}`} />;
          const ds = toDateStr(cell);
          const isToday = ds === todayStr;
          const isSel = ds === selStr;
          const hasEvents = events.some(e => e.date === ds);
          return (
            <button
              key={i}
              onClick={() => onSelectDate(cell)}
              className={cn(
                "relative w-full aspect-square flex items-center justify-center text-[9px] rounded transition-all",
                isSel && "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]",
                isToday && !isSel && "ring-1 ring-[hsl(var(--primary)/0.5)]",
                !isSel && !isToday && "hover:bg-[hsl(0_0%_100%/0.06)] text-foreground"
              )}
            >
              {cell.getDate()}
              {hasEvents && !isSel && (
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[hsl(var(--primary))]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Month View
// ═══════════════════════════════════════════════════════════════

function MonthView({ year, month, selectedDate, events, onSelectDate, onEventClick }: {
  year: number; month: number; selectedDate: Date;
  events: UnifiedCalendarEvent[];
  onSelectDate: (d: Date) => void;
  onEventClick: (e: UnifiedCalendarEvent) => void;
}) {
  const cells = getMonthGrid(year, month);
  const todayStr = toDateStr(new Date());
  const selStr = toDateStr(selectedDate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="p-2"
    >
      <div className="grid grid-cols-7 gap-px bg-[hsl(0_0%_100%/0.04)] rounded-lg overflow-hidden">
        {DAYS.map(d => (
          <div key={d} className="text-center py-1.5 text-[10px] font-medium text-[hsl(0_0%_50%)] bg-[hsl(0_0%_0%/0.2)]">{d}</div>
        ))}
        {cells.map((cell, i) => {
          if (!cell) return <div key={`e-${i}`} className="min-h-[72px] bg-[hsl(0_0%_0%/0.1)]" />;
          const ds = toDateStr(cell);
          const isToday = ds === todayStr;
          const isSel = ds === selStr;
          const dayEvents = events.filter(e => e.date === ds);

          return (
            <button
              key={i}
              onClick={() => onSelectDate(cell)}
              className={cn(
                "min-h-[72px] p-1 text-left transition-all bg-[hsl(0_0%_0%/0.15)] hover:bg-[hsl(0_0%_100%/0.04)]",
                isSel && "ring-1 ring-inset ring-[hsl(var(--primary)/0.5)] bg-[hsl(var(--primary)/0.05)]"
              )}
            >
              <span className={cn(
                "text-[10px] font-medium inline-flex items-center justify-center w-5 h-5 rounded-full",
                isToday && "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]",
                !isToday && "text-foreground"
              )}>
                {cell.getDate()}
              </span>
              <div className="mt-0.5 space-y-px">
                {dayEvents.slice(0, 3).map(ev => (
                  <div
                    key={ev.id}
                    onClick={(e) => { e.stopPropagation(); onEventClick(ev); }}
                    className={cn(
                      "flex items-center gap-1 px-1 py-0.5 rounded text-[8px] truncate cursor-pointer",
                      "hover:bg-[hsl(0_0%_100%/0.08)] transition-colors"
                    )}
                  >
                    <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", getDomainColor(ev.domain))} />
                    <span className="truncate text-foreground">{formatTimeShort(ev.startTime)} {ev.title}</span>
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <span className="text-[7px] text-[hsl(0_0%_50%)] px-1">+{dayEvents.length - 3} more</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Week View
// ═══════════════════════════════════════════════════════════════

function WeekView({ selectedDate, events, onSelectDate, onEventClick }: {
  selectedDate: Date;
  events: UnifiedCalendarEvent[];
  onSelectDate: (d: Date) => void;
  onEventClick: (e: UnifiedCalendarEvent) => void;
}) {
  const weekDates = getWeekDates(selectedDate);
  const todayStr = toDateStr(new Date());

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex flex-col h-full"
    >
      {/* Day headers */}
      <div className="grid grid-cols-[50px_repeat(7,1fr)] border-b border-[hsl(0_0%_100%/0.06)] shrink-0">
        <div />
        {weekDates.map((d, i) => {
          const ds = toDateStr(d);
          const isToday = ds === todayStr;
          return (
            <button
              key={i}
              onClick={() => onSelectDate(d)}
              className={cn(
                "text-center py-1.5 transition-colors hover:bg-[hsl(0_0%_100%/0.04)]",
                isToday && "bg-[hsl(var(--primary)/0.05)]"
              )}
            >
              <div className="text-[9px] text-[hsl(0_0%_50%)]">{DAYS[i]}</div>
              <div className={cn(
                "text-[12px] font-semibold mx-auto w-6 h-6 rounded-full flex items-center justify-center",
                isToday && "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
              )}>
                {d.getDate()}
              </div>
            </button>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-[50px_repeat(7,1fr)] relative">
          {HOURS.map(hour => (
            <div key={hour} className="contents">
              <div className="h-12 flex items-start justify-end pr-1.5 pt-0.5">
                <span className="text-[8px] text-[hsl(0_0%_40%)]">
                  {hour % 12 || 12}{hour < 12 ? "a" : "p"}
                </span>
              </div>
              {weekDates.map((d, di) => {
                const ds = toDateStr(d);
                const dayEvents = events.filter(e => {
                  if (e.date !== ds) return false;
                  const t = parseTime(e.startTime);
                  return t !== null && Math.floor(t) === hour;
                });
                return (
                  <div
                    key={`${hour}-${di}`}
                    className="h-12 border-t border-l border-[hsl(0_0%_100%/0.04)] relative"
                  >
                    {dayEvents.map(ev => (
                      <button
                        key={ev.id}
                        onClick={() => onEventClick(ev)}
                        className={cn(
                          "absolute left-0.5 right-0.5 rounded px-1 py-0.5 text-[8px] truncate z-10",
                          "bg-[hsl(var(--primary)/0.2)] border border-[hsl(var(--primary)/0.3)] text-foreground",
                          "hover:bg-[hsl(var(--primary)/0.3)] transition-colors cursor-pointer"
                        )}
                        style={{ top: `${((parseTime(ev.startTime)! % 1) * 48)}px` }}
                      >
                        <div className="flex items-center gap-0.5">
                          <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", getDomainColor(ev.domain))} />
                          <span className="truncate">{ev.title}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Day View
// ═══════════════════════════════════════════════════════════════

function DayView({ selectedDate, events, onEventClick }: {
  selectedDate: Date;
  events: UnifiedCalendarEvent[];
  onEventClick: (e: UnifiedCalendarEvent) => void;
}) {
  const dateStr = `${DAYS[(selectedDate.getDay() + 6) % 7]}, ${monthName(selectedDate.getMonth())} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex flex-col h-full"
    >
      <div className="px-3 py-2 border-b border-[hsl(0_0%_100%/0.06)]">
        <NovaText variant="label" className="!text-[12px] font-semibold">{dateStr}</NovaText>
        <NovaText variant="label" muted className="!text-[9px]">{events.length} event{events.length !== 1 ? "s" : ""}</NovaText>
      </div>
      <div className="flex-1 overflow-y-auto">
        {HOURS.map(hour => {
          const hourEvents = events.filter(e => {
            const t = parseTime(e.startTime);
            return t !== null && Math.floor(t) === hour;
          });
          return (
            <div key={hour} className="flex border-b border-[hsl(0_0%_100%/0.04)]">
              <div className="w-14 shrink-0 py-2 pr-2 text-right">
                <span className="text-[9px] text-[hsl(0_0%_40%)]">
                  {hour % 12 || 12}:00 {hour < 12 ? "AM" : "PM"}
                </span>
              </div>
              <div className="flex-1 min-h-[48px] py-1 px-1 space-y-0.5">
                {hourEvents.map(ev => (
                  <button
                    key={ev.id}
                    onClick={() => onEventClick(ev)}
                    className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md bg-[hsl(0_0%_100%/0.04)] hover:bg-[hsl(0_0%_100%/0.08)] transition-colors text-left"
                  >
                    <div className={cn("w-2 h-2 rounded-full shrink-0", getDomainColor(ev.domain))} />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-medium text-foreground truncate block">{ev.title}</span>
                      <span className="text-[8px] text-[hsl(0_0%_50%)]">
                        {formatTimeShort(ev.startTime)}{ev.endTime ? ` – ${formatTimeShort(ev.endTime)}` : ""}
                        {ev.location ? ` · ${ev.location}` : ""}
                      </span>
                    </div>
                    <NovaBadge variant="default" className="!text-[7px] shrink-0 capitalize">{ev.domain}</NovaBadge>
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        {/* All-day / no-time events */}
        {events.filter(e => !parseTime(e.startTime)).length > 0 && (
          <div className="px-3 py-2">
            <NovaText variant="label" muted className="!text-[9px] mb-1">All Day</NovaText>
            {events.filter(e => !parseTime(e.startTime)).map(ev => (
              <button
                key={ev.id}
                onClick={() => onEventClick(ev)}
                className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md bg-[hsl(0_0%_100%/0.04)] hover:bg-[hsl(0_0%_100%/0.08)] transition-colors text-left mb-0.5"
              >
                <div className={cn("w-2 h-2 rounded-full shrink-0", getDomainColor(ev.domain))} />
                <span className="text-[10px] font-medium text-foreground">{ev.title}</span>
                <NovaBadge variant="default" className="!text-[7px] ml-auto capitalize">{ev.eventType}</NovaBadge>
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Agenda View
// ═══════════════════════════════════════════════════════════════

function AgendaView({ events, onEventClick }: {
  events: UnifiedCalendarEvent[];
  onEventClick: (e: UnifiedCalendarEvent) => void;
}) {
  const grouped = useMemo(() => {
    const map = new Map<string, UnifiedCalendarEvent[]>();
    const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
    for (const ev of sorted) {
      const list = map.get(ev.date) || [];
      list.push(ev);
      map.set(ev.date, list);
    }
    return Array.from(map.entries());
  }, [events]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="p-3 overflow-y-auto h-full space-y-3"
    >
      {grouped.length === 0 && (
        <div className="text-center py-8">
          <CalIcon className="w-8 h-8 mx-auto mb-2 text-[hsl(0_0%_30%)]" />
          <NovaText variant="label" muted>No events this month</NovaText>
        </div>
      )}
      {grouped.map(([date, dayEvents]) => {
        const d = new Date(date + "T00:00:00");
        const dayLabel = `${DAYS[(d.getDay() + 6) % 7]}, ${monthName(d.getMonth())} ${d.getDate()}`;
        const isToday = date === toDateStr(new Date());
        return (
          <div key={date}>
            <div className="flex items-center gap-2 mb-1">
              <NovaText variant="label" className={cn("!text-[11px] font-semibold", isToday && "text-[hsl(var(--primary))]")}>
                {dayLabel}
              </NovaText>
              {isToday && <NovaBadge variant="info" className="!text-[7px]">Today</NovaBadge>}
            </div>
            <VStack spacing="micro">
              {dayEvents.map(ev => (
                <button
                  key={ev.id}
                  onClick={() => onEventClick(ev)}
                  className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg bg-[hsl(0_0%_100%/0.03)] border border-[hsl(0_0%_100%/0.06)] hover:bg-[hsl(0_0%_100%/0.06)] transition-colors text-left"
                >
                  <div className={cn("w-2.5 h-8 rounded-full shrink-0", getDomainColor(ev.domain))} />
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-medium text-foreground block truncate">{ev.title}</span>
                    <span className="text-[9px] text-[hsl(0_0%_50%)]">
                      {formatTimeShort(ev.startTime) || "All day"}
                      {ev.location ? ` · ${ev.location}` : ""}
                      {ev.source !== "manual" && ev.source !== "demo" ? ` · via ${ev.source}` : ""}
                    </span>
                  </div>
                  <NovaBadge variant="default" className="!text-[7px] capitalize shrink-0">{ev.domain}</NovaBadge>
                </button>
              ))}
            </VStack>
          </div>
        );
      })}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Create Event Dialog
// ═══════════════════════════════════════════════════════════════

function CreateEventDialog({ open, onClose, onSave, defaultDate }: {
  open: boolean;
  onClose: () => void;
  onSave: (input: CalendarEventInput) => void;
  defaultDate: string;
}) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [domain, setDomain] = useState("personal");
  const [eventType, setEventType] = useState("meeting");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState("medium");

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      event_date: date,
      start_time: `${date}T${startTime}:00`,
      end_time: `${date}T${endTime}:00`,
      domain,
      event_type: eventType,
      location: location || undefined,
      priority,
      notes: notes || undefined,
    });
    setTitle(""); setLocation(""); setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-background border-[hsl(0_0%_100%/0.1)] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground text-sm">New Event</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-[hsl(0_0%_50%)] mb-1 block">Title</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Event title..." className="h-8 text-xs" autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-[hsl(0_0%_50%)] mb-1 block">Date</label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-8 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-1">
              <div>
                <label className="text-[10px] text-[hsl(0_0%_50%)] mb-1 block">Start</label>
                <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="h-8 text-xs" />
              </div>
              <div>
                <label className="text-[10px] text-[hsl(0_0%_50%)] mb-1 block">End</label>
                <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="h-8 text-xs" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-[hsl(0_0%_50%)] mb-1 block">Domain</label>
              <select value={domain} onChange={e => setDomain(e.target.value)}
                className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground">
                <option value="personal">Personal</option>
                <option value="business">Business</option>
                <option value="finance">Finance</option>
                <option value="household">Household</option>
                <option value="concierge">Concierge</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-[hsl(0_0%_50%)] mb-1 block">Type</label>
              <select value={eventType} onChange={e => setEventType(e.target.value)}
                className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground">
                <option value="meeting">Meeting</option>
                <option value="task">Task</option>
                <option value="reminder">Reminder</option>
                <option value="appointment">Appointment</option>
                <option value="deadline">Deadline</option>
                <option value="travel">Travel</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-[hsl(0_0%_50%)] mb-1 block">Location</label>
              <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Optional" className="h-8 text-xs" />
            </div>
            <div>
              <label className="text-[10px] text-[hsl(0_0%_50%)] mb-1 block">Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value)}
                className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-[hsl(0_0%_50%)] mb-1 block">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes..."
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs text-foreground min-h-[60px] resize-none" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSave} disabled={!title.trim()}>Create Event</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════════
// Event Detail Dialog
// ═══════════════════════════════════════════════════════════════

function EventDetailDialog({ event, onClose, onDelete }: {
  event: UnifiedCalendarEvent;
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  const isEditable = !event.id.startsWith("demo-") && !event.id.startsWith("apt-");
  const meta = SOURCE_META[event.domain as CalendarSource];

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="bg-background border-[hsl(0_0%_100%/0.1)] max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full", meta?.dot || "bg-[hsl(265_55%_58%)]")} />
            <DialogTitle className="text-foreground text-sm">{event.title}</DialogTitle>
          </div>
        </DialogHeader>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] text-[hsl(0_0%_55%)]">
            <CalIcon className="w-3 h-3" />
            <span>{event.date}</span>
            {event.startTime && (
              <>
                <Clock className="w-3 h-3 ml-1" />
                <span>{formatTimeShort(event.startTime)}{event.endTime ? ` – ${formatTimeShort(event.endTime)}` : ""}</span>
              </>
            )}
          </div>
          {event.location && (
            <div className="flex items-center gap-2 text-[10px] text-[hsl(0_0%_55%)]">
              <MapPin className="w-3 h-3" />
              <span>{event.location}</span>
            </div>
          )}
          <div className="flex gap-1.5 flex-wrap">
            <NovaBadge variant="default" className="!text-[8px] capitalize">{event.domain}</NovaBadge>
            <NovaBadge variant="info" className="!text-[8px] capitalize">{event.eventType}</NovaBadge>
            {event.priority === "high" && <NovaBadge variant="warning" className="!text-[8px]">High Priority</NovaBadge>}
            {event.source !== "manual" && event.source !== "demo" && (
              <NovaBadge variant="default" className="!text-[8px]">via {event.source}</NovaBadge>
            )}
          </div>
          {event.notes && (
            <p className="text-[10px] text-[hsl(0_0%_60%)] leading-relaxed">{event.notes}</p>
          )}
        </div>
        <DialogFooter>
          {isEditable && (
            <Button variant="destructive" size="sm" onClick={() => onDelete(event.id)}>
              <Trash2 className="w-3 h-3 mr-1" /> Delete
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
