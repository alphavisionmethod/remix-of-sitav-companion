import React from "react";
import { CONCIERGE_DATA } from "../demo-data";
import { Clock, Phone, User, Users, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const TYPE_ICON: Record<string, React.ElementType> = { meeting: Users, call: Phone, personal: User, family: Users };
const PRIORITY_COLOR: Record<string, string> = { high: "text-rose-400", medium: "text-amber-400", low: "text-white/40" };

export function DemoConciergeApp() {
  return (
    <div className="p-4 sm:p-5 overflow-auto space-y-4">
      <div className="rounded-2xl border border-white/[0.06] p-4 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, hsl(225 12% 10%), hsl(225 10% 8%))" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 20% 10%, hsl(285 55% 55% / 0.05), transparent 60%)" }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[hsl(285,55%,55%,0.2)] to-transparent" />
        <h3 className="text-[10px] text-white/40 uppercase tracking-widest mb-3 font-medium flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[hsl(285,55%,55%)]" /> Today's Schedule
        </h3>
        <div className="space-y-1">
          {CONCIERGE_DATA.schedule.map((s) => {
            const Icon = TYPE_ICON[s.type] ?? Clock;
            return (
              <div key={s.time} className="flex items-center gap-3 text-sm p-2 rounded-xl hover:bg-white/[0.04] transition-colors">
                <span className="text-white/30 w-16 shrink-0 text-[11px] font-mono">{s.time}</span>
                <div className="w-7 h-7 rounded-lg bg-white/[0.05] flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5 text-white/40" />
                </div>
                <span className="text-white/85 font-medium">{s.title}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="rounded-2xl border border-white/[0.06] p-4 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, hsl(225 12% 10%), hsl(225 10% 8%))" }}>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />
        <h3 className="text-[10px] text-white/40 uppercase tracking-widest mb-3 font-medium">Tasks</h3>
        <div className="space-y-1">
          {CONCIERGE_DATA.tasks.map((t) => (
            <div key={t.title} className="flex items-center gap-2.5 text-sm p-2 rounded-xl hover:bg-white/[0.04] transition-colors">
              {t.done ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <Circle className="w-4 h-4 text-white/15 shrink-0" />}
              <span className={cn("flex-1 font-medium", t.done && "line-through text-white/25", !t.done && "text-white/85")}>{t.title}</span>
              <span className={cn("text-xs", PRIORITY_COLOR[t.priority])}>{t.priority}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}