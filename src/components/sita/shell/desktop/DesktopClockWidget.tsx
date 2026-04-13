import { useState, useEffect } from "react";
import { CalendarDays, ChevronRight } from "lucide-react";
import { DesktopWidgetCard } from "./DesktopWidgetCard";

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatDate(d: Date) {
  return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

export function DesktopClockWidget() {
  const now = useClock();

  return (
    <DesktopWidgetCard title="Time" accent="from-cyan-400/20 via-white/[0.05] to-violet-500/10">
      <div className="flex h-full flex-col justify-between">
        <div className="text-6xl font-semibold tracking-tight text-white">{formatTime(now)}</div>
        <div className="mt-2 text-base text-white/65">{formatDate(now)}</div>
        <div className="mt-6 rounded-2xl border border-white/10 bg-black/15 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm text-white/75">
            <CalendarDays className="h-4 w-4" />
            Today
          </div>
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-white">Finance approval review</div>
                <div className="text-xs text-white/55">10:30 AM · Finance Board</div>
              </div>
              <ChevronRight className="mt-0.5 h-4 w-4 text-white/40" />
            </div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-white">Client collections follow-up</div>
                <div className="text-xs text-white/55">1:00 PM · Business</div>
              </div>
              <ChevronRight className="mt-0.5 h-4 w-4 text-white/40" />
            </div>
          </div>
        </div>
      </div>
    </DesktopWidgetCard>
  );
}
