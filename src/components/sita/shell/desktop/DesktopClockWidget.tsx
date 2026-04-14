import { useState, useEffect } from "react";

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

export function DesktopClockWidget({ onLaunchApp }: DesktopClockWidgetProps) {
  const now = useClock();
  const dayName = now.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
  const day = now.getDate();
  const monthName = now.toLocaleDateString("en-US", { month: "long" });
  const year = now.getFullYear();

  return (
    <div className="flex gap-3">
      {/* Calendar card */}
      <div className="flex-1 rounded-3xl border border-white/[0.04] bg-white/[0.03] backdrop-blur-3xl overflow-hidden">
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

      {/* Right mini cards */}
      <div className="flex flex-col gap-3 w-[100px]">
        <button
          onClick={() => onLaunchApp?.("todo")}
          className="flex-1 rounded-3xl border border-white/[0.04] bg-white/[0.02] backdrop-blur-3xl p-3 text-center flex flex-col justify-center cursor-pointer transition hover:bg-white/[0.06] hover:border-white/[0.08] hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] active:scale-[0.97]"
        >
          <div className="text-[9px] uppercase tracking-widest text-white/25">To-Do</div>
          <div className="text-3xl font-light text-white/80 mt-1">3</div>
        </button>
        <button
          onClick={() => onLaunchApp?.("concierge")}
          className="flex-1 rounded-3xl border border-white/[0.04] bg-white/[0.02] backdrop-blur-3xl p-3 text-center flex flex-col justify-center cursor-pointer transition hover:bg-white/[0.06] hover:border-white/[0.08] hover:shadow-[0_0_20px_rgba(251,191,36,0.15)] active:scale-[0.97]"
        >
          <div className="text-[9px] uppercase tracking-widest text-white/25">Pending</div>
          <div className="text-3xl font-light text-amber-300/70 mt-1">2</div>
        </button>
      </div>
    </div>
  );
}
