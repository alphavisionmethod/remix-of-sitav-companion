import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { KPITile } from "@/components/sita/SitaComponents";
import { ConciergeEmptyState } from "@/components/concierge/ConciergeEmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useQuery } from "@tanstack/react-query";
import { generateCalendarDemoEvents } from "@/data/fixtures/mock-data/calendar";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";
import {
  Calendar, ChevronLeft, ChevronRight, Plus, Clock, Users, MapPin, CheckSquare
} from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: "booking" | "task";
  status: string;
  provider?: string;
}

function useCalendarData(year: number, month: number) {
  const { isDemoMode } = useDataMode();
  const { user, isDemo: isDemoMode } = useAuth();

  return useQuery({
    queryKey: ["calendar-data", user?.id, year, month, isDemoMode],
    queryFn: async (): Promise<CalendarEvent[]> => {
      if (!user?.id || isDemoMode) {
        // Demo data
        return generateCalendarDemoEvents(year, month) as CalendarEvent[];
      }

      const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      const endDate = `${year}-${String(month + 2 > 12 ? 1 : month + 2).padStart(2, "0")}-01`;

      const [{ data: bookings }, { data: tasks }] = await Promise.all([
        fromTable("bookings").select("id, title, date, status, provider, type").eq("user_id", user.id).gte("date", startDate).lt("date", endDate),
        fromTable("tasks").select("id, title, due_date, status").eq("user_id", user.id).not("due_date", "is", null).gte("due_date", startDate).lt("due_date", endDate),
      ]);

      const events: CalendarEvent[] = [
        ...(bookings || []).map(b => ({ id: b.id, title: b.title, date: typeof b.date === "string" ? b.date.split("T")[0] : "", type: "booking" as const, status: b.status, provider: b.provider || undefined })),
        ...(tasks || []).map(t => ({ id: t.id, title: t.title, date: t.due_date?.split("T")[0] || "", type: "task" as const, status: t.status })),
      ];

      return events;
    },
    staleTime: 30000,
  });
}

// Moved to shared constants
import { MONTH_NAMES, DAY_NAMES } from "@/lib/constants/ui-config";
import { useDataMode } from "@/contexts/DataModeContext";


const MonthGridCalendar = () => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data: events = [], isLoading } = useCalendarData(year, month);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  // Build grid
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = lastDay.getDate();

  const cells: Array<{ day: number | null; dateStr: string }> = [];
  for (let i = 0; i < startDayOfWeek; i++) cells.push({ day: null, dateStr: "" });
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, dateStr: `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}` });
  }

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach(e => {
      const existing = map.get(e.date) || [];
      existing.push(e);
      map.set(e.date, existing);
    });
    return map;
  }, [events]);

  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const selectedEvents = selectedDate ? eventsByDate.get(selectedDate) || [] : [];

  const totalBookings = events.filter(e => e.type === "booking").length;
  const totalTasks = events.filter(e => e.type === "task").length;
  const busyDays = new Set(events.map(e => e.date)).size;

  if (events.length === 0 && !isLoading) {
    return (
      <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <ConciergeEmptyState
          domain="appointments"
          title="Your calendar is clear"
          description="No bookings or tasks this month. Add your first event to start organizing your schedule."
        />
      </motion.div>
    );
  }

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <PageTruthBanner />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Bookings" value={String(totalBookings)} icon={Calendar} />
        <KPITile label="Tasks" value={String(totalTasks)} icon={CheckSquare} />
        <KPITile label="Busy Days" value={String(busyDays)} icon={Clock} />
        <KPITile label="This Month" value={MONTH_NAMES[month].slice(0, 3)} sub={String(year)} icon={Calendar} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar Grid */}
        <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] lg:col-span-2 p-4 micro-hover-lift">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="rounded-lg p-2 hover:bg-secondary transition-colors">
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            </button>
            <h2 className="font-display text-lg font-bold text-foreground">
              {MONTH_NAMES[month]} {year}
            </h2>
            <button onClick={nextMonth} className="rounded-lg p-2 hover:bg-secondary transition-colors">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAY_NAMES.map(d => (
              <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell, i) => {
              if (cell.day === null) return <div key={`empty-${i}`} />;
              const dayEvents = eventsByDate.get(cell.dateStr) || [];
              const isToday = cell.dateStr === todayStr;
              const isSelected = cell.dateStr === selectedDate;

              return (
                <motion.button
                  key={cell.dateStr}
                  onClick={() => setSelectedDate(isSelected ? null : cell.dateStr)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative rounded-xl p-2 min-h-[60px] text-left transition-all border ${
                    isSelected
                      ? "bg-primary/10 border-primary/30 ring-1 ring-primary/20"
                      : isToday
                      ? "bg-accent/10 border-accent/20"
                      : "border-transparent hover:bg-secondary/60"
                  }`}
                >
                  <span className={`text-xs font-medium ${isToday ? "text-accent font-bold" : isSelected ? "text-primary" : "text-foreground"}`}>
                    {cell.day}
                  </span>
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 mt-1 flex-wrap">
                      {dayEvents.slice(0, 3).map((e, ei) => (
                        <div
                          key={ei}
                          className={`h-1.5 w-1.5 rounded-full ${e.type === "booking" ? "bg-primary" : "bg-accent"}`}
                          title={e.title}
                        />
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-[8px] text-muted-foreground">+{dayEvents.length - 3}</span>
                      )}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/30">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-[10px] text-muted-foreground">Booking</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-accent" />
              <span className="text-[10px] text-muted-foreground">Task</span>
            </div>
          </div>
        </div>

        {/* Selected Day Detail */}
        <div className="space-y-4">
          <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4 micro-hover-lift">
            <h4 className="text-[13px] font-semibold text-[hsl(0_0%_85%)] mb-3">
              {selectedDate
                ? new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
                : "Select a day"
              }
            </h4>

            {selectedDate && selectedEvents.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">No events this day</p>
            )}

            {selectedEvents.map(e => (
              <div key={e.id} className="flex items-start gap-3 py-2.5 border-b border-border/30 last:border-0">
                <div className={`mt-0.5 rounded-lg p-1.5 ${e.type === "booking" ? "bg-primary/10" : "bg-accent/10"}`}>
                  {e.type === "booking" ? <Calendar className="h-3.5 w-3.5 text-primary" /> : <CheckSquare className="h-3.5 w-3.5 text-accent" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{e.title}</p>
                  {e.provider && (
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="h-2.5 w-2.5" /> {e.provider}
                    </p>
                  )}
                  <span className={`inline-block mt-1 text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                    e.status === "confirmed" ? "bg-trust-safe/10 text-trust-safe"
                    : e.status === "completed" ? "bg-muted text-muted-foreground"
                    : "bg-amber-500/10 text-amber-500"
                  }`}>
                    {e.status}
                  </span>
                </div>
              </div>
            ))}

            {!selectedDate && (
              <p className="text-sm text-muted-foreground py-6 text-center">Click a day to see details</p>
            )}
          </div>

          {/* Quick stats */}
          <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4 micro-hover-lift">
            <h4 className="text-[13px] font-semibold text-[hsl(0_0%_85%)] mb-3">Month Summary</h4>
            <div className="space-y-2">
              {[
                { label: "Total events", value: events.length },
                { label: "Bookings", value: totalBookings },
                { label: "Tasks", value: totalTasks },
                { label: "Busiest day", value: (() => {
                  let max = 0; let maxDate = "";
                  eventsByDate.forEach((evts, date) => { if (evts.length > max) { max = evts.length; maxDate = date; } });
                  return maxDate ? new Date(maxDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—";
                })() },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="font-medium text-foreground">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MonthGridCalendar;
