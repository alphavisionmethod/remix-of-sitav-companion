import { useState, useEffect } from "react";

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);
  return now;
}

export function DesktopClockWidget() {
  const now = useClock();
  const dayName = now.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
  const day = now.getDate();
  const monthName = now.toLocaleDateString("en-US", { month: "long" });
  const year = now.getFullYear();

  return (
    <div className="flex gap-3">
      {/* Calendar card */}
      <div className="flex-1 rounded-2xl border border-white/[0.1] bg-white/[0.06] backdrop-blur-2xl overflow-hidden">
        <div className="bg-red-500/80 px-4 py-1.5 text-center">
          <div className="text-[10px] font-bold uppercase tracking-widest text-white">{dayName}</div>
        </div>
        <div className="px-4 py-3 text-center">
          <div className="text-4xl font-light text-white">{day}</div>
          <div className="text-[11px] text-white/45 mt-1">{monthName} {year}</div>
        </div>
        {/* Schedule */}
        <div className="border-t border-white/[0.08] px-4 py-3 space-y-2">
          <div className="flex items-start gap-2">
            <div className="mt-1.5 h-2 w-2 rounded-full bg-violet-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-medium text-white truncate">Finance review</div>
              <div className="text-[10px] text-white/35">10:30 AM</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="mt-1.5 h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-medium text-white truncate">Client follow-up</div>
              <div className="text-[10px] text-white/35">1:00 PM</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="mt-1.5 h-2 w-2 rounded-full bg-amber-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-medium text-white truncate">Board meeting</div>
              <div className="text-[10px] text-white/35">3:30 PM</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right mini cards */}
      <div className="flex flex-col gap-3 w-[100px]">
        {/* To-Do */}
        <div className="flex-1 rounded-2xl border border-white/[0.1] bg-white/[0.06] backdrop-blur-2xl p-3 text-center flex flex-col justify-center">
          <div className="text-[9px] uppercase tracking-widest text-white/35">To-Do</div>
          <div className="text-3xl font-light text-white mt-1">3</div>
        </div>
        {/* Approvals */}
        <div className="flex-1 rounded-2xl border border-white/[0.1] bg-white/[0.06] backdrop-blur-2xl p-3 text-center flex flex-col justify-center">
          <div className="text-[9px] uppercase tracking-widest text-white/35">Pending</div>
          <div className="text-3xl font-light text-amber-300 mt-1">2</div>
        </div>
      </div>
    </div>
  );
}
