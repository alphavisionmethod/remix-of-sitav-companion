import { useState, useEffect } from "react";
import { CalendarDays, ChevronRight } from "lucide-react";

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

export function DesktopClockWidget() {
  const now = useClock();
  const h = now.getHours();
  const h12 = h % 12 || 12;
  const mm = now.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const blink = now.getSeconds() % 2 === 0;
  const dayName = now.toLocaleDateString([], { weekday: "long" }).toUpperCase();
  const day = now.getDate();
  const monthName = now.toLocaleDateString([], { month: "long" });

  return (
    <div className="flex gap-3">
      {/* Calendar card */}
      <div className="flex-1 rounded-[20px] border border-white/[0.12] bg-white/[0.08] backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden">
        <div className="bg-red-500/80 px-4 py-1.5 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-white">{dayName}</div>
        </div>
        <div className="px-4 py-3 text-center">
          <div className="text-4xl font-light text-white">{day}</div>
          <div className="text-xs text-white/50 mt-1">{monthName}</div>
        </div>
        {/* Today's schedule */}
        <div className="border-t border-white/10 px-4 py-3">
          <div className="flex items-start gap-2">
            <div className="mt-1 h-2 w-2 rounded-full bg-violet-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-medium text-white truncate">Finance review</div>
              <div className="text-[10px] text-white/40">10:30 AM</div>
            </div>
          </div>
          <div className="flex items-start gap-2 mt-2">
            <div className="mt-1 h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-medium text-white truncate">Client follow-up</div>
              <div className="text-[10px] text-white/40">1:00 PM</div>
            </div>
          </div>
        </div>
      </div>

      {/* Clock + To-Do card */}
      <div className="flex flex-col gap-3 w-[120px]">
        {/* Clock */}
        <div className="rounded-[20px] border border-white/[0.12] bg-white/[0.08] backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] p-4 text-center">
          <div className="text-3xl font-semibold text-white tabular-nums">
            {h12}
            <span className={`transition-opacity duration-300 ${blink ? "opacity-100" : "opacity-30"}`}>:</span>
            {mm}
          </div>
          <div className="text-[10px] text-white/40 mt-1">{ampm}</div>
        </div>
        {/* To-Do count */}
        <div className="rounded-[20px] border border-white/[0.12] bg-white/[0.08] backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] p-4 text-center flex-1 flex flex-col justify-center">
          <div className="text-[10px] uppercase tracking-wider text-white/40">To-Do</div>
          <div className="text-3xl font-light text-white mt-1">3</div>
        </div>
      </div>
    </div>
  );
}
