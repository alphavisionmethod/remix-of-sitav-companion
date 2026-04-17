import { useState, useEffect, MouseEvent } from "react";
import { X } from "lucide-react";

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);
  return now;
}

interface DesktopClockWidgetProps {
  onLaunchApp?: (appId: string) => void;
}

// ── Per-card dismiss state ───────────────────────────────────
// Each of the three sub-cards (calendar, todo, pending) can be
// independently closed. State persists per-user in localStorage so
// dismissed cards stay hidden across reloads.

type SubCard = "calendar" | "todo" | "pending";
const STORAGE_KEY = "sita-clock-widget-dismissed";

function loadDismissed(): Record<SubCard, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { calendar: false, todo: false, pending: false };
    const parsed = JSON.parse(raw);
    return {
      calendar: !!parsed.calendar,
      todo: !!parsed.todo,
      pending: !!parsed.pending,
    };
  } catch {
    return { calendar: false, todo: false, pending: false };
  }
}

function saveDismissed(state: Record<SubCard, boolean>) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

const closeBtnClass =
  "absolute top-1.5 right-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-black/40 text-white/70 opacity-0 group-hover:opacity-100 hover:bg-black/60 hover:text-white transition-all backdrop-blur-md";

export function DesktopClockWidget({ onLaunchApp }: DesktopClockWidgetProps) {
  const now = useClock();
  const dayName = now.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
  const day = now.getDate();
  const monthName = now.toLocaleDateString("en-US", { month: "long" });
  const year = now.getFullYear();

  const [dismissed, setDismissed] = useState<Record<SubCard, boolean>>(loadDismissed);

  const dismiss = (card: SubCard) => (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setDismissed(prev => {
      const next = { ...prev, [card]: true };
      saveDismissed(next);
      return next;
    });
  };

  // If everything is dismissed, render nothing — the widget itself can be removed via the parent picker
  if (dismissed.calendar && dismissed.todo && dismissed.pending) {
    return null;
  }

  return (
    <div className="flex gap-3">
      {/* Calendar card */}
      {!dismissed.calendar && (
        <div className="group relative flex-1 rounded-3xl border border-white/[0.04] bg-white/[0.03] backdrop-blur-3xl overflow-hidden">
          <button
            type="button"
            aria-label="Remove calendar card"
            onClick={dismiss("calendar")}
            className={closeBtnClass}
          >
            <X className="h-3 w-3" />
          </button>
          <div className="bg-red-500/50 px-4 py-1.5 text-center">
            <div className="text-[10px] font-bold uppercase tracking-widest text-white/90">{dayName}</div>
          </div>
          <div className="px-4 py-3 text-center">
            <div className="text-4xl font-light text-white/90">{day}</div>
            <div className="text-[11px] text-white/35 mt-1">{monthName} {year}</div>
          </div>
          {/* Schedule */}
          <div className="border-t border-white/[0.04] px-4 py-3 space-y-2">
            <div className="flex items-start gap-2">
              <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-violet-400/70 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-medium text-white/80 truncate">Finance review</div>
                <div className="text-[10px] text-white/25">10:30 AM</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400/70 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-medium text-white/80 truncate">Client follow-up</div>
                <div className="text-[10px] text-white/25">1:00 PM</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-400/70 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-medium text-white/80 truncate">Board meeting</div>
                <div className="text-[10px] text-white/25">3:30 PM</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Right mini cards */}
      {(!dismissed.todo || !dismissed.pending) && (
        <div className="flex flex-col gap-3 w-[100px]">
          {!dismissed.todo && (
            <div className="group relative flex-1">
              <button
                type="button"
                aria-label="Remove To-Do card"
                onClick={dismiss("todo")}
                className={closeBtnClass}
              >
                <X className="h-3 w-3" />
              </button>
              <button
                onClick={() => onLaunchApp?.("todo")}
                className="h-full w-full rounded-3xl border border-white/[0.04] bg-white/[0.02] backdrop-blur-3xl p-3 text-center flex flex-col justify-center cursor-pointer transition hover:bg-white/[0.06] hover:border-white/[0.08] hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] active:scale-[0.97]"
              >
                <div className="text-[9px] uppercase tracking-widest text-white/25">To-Do</div>
                <div className="text-3xl font-light text-white/80 mt-1">3</div>
              </button>
            </div>
          )}
          {!dismissed.pending && (
            <div className="group relative flex-1">
              <button
                type="button"
                aria-label="Remove Pending card"
                onClick={dismiss("pending")}
                className={closeBtnClass}
              >
                <X className="h-3 w-3" />
              </button>
              <button
                onClick={() => onLaunchApp?.("concierge")}
                className="h-full w-full rounded-3xl border border-white/[0.04] bg-white/[0.02] backdrop-blur-3xl p-3 text-center flex flex-col justify-center cursor-pointer transition hover:bg-white/[0.06] hover:border-white/[0.08] hover:shadow-[0_0_20px_rgba(251,191,36,0.15)] active:scale-[0.97]"
              >
                <div className="text-[9px] uppercase tracking-widest text-white/25">Pending</div>
                <div className="text-3xl font-light text-amber-300/70 mt-1">2</div>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
