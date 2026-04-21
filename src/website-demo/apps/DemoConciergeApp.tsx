import React from "react";
import { CONCIERGE_DATA } from "../demo-data";
import { Clock, Phone, User, Users, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const TYPE_ICON: Record<string, React.ElementType> = { meeting: Users, call: Phone, personal: User, family: Users };
const PRIORITY_COLOR: Record<string, string> = { high: "text-rose-400", medium: "text-amber-400", low: "text-white/40" };

export function DemoConciergeApp() {
  return (
    <div className="p-5 overflow-auto space-y-5">
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <h3 className="text-xs text-white/50 uppercase mb-3 flex items-center gap-1"><Clock className="w-3 h-3" /> Today's Schedule</h3>
        <div className="space-y-2">
          {CONCIERGE_DATA.schedule.map((s) => {
            const Icon = TYPE_ICON[s.type] ?? Clock;
            return (
              <div key={s.time} className="flex items-center gap-3 text-sm">
                <span className="text-white/40 w-16 shrink-0">{s.time}</span>
                <Icon className="w-4 h-4 text-white/30" />
                <span className="text-white/80">{s.title}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <h3 className="text-xs text-white/50 uppercase mb-3">Tasks</h3>
        <div className="space-y-2">
          {CONCIERGE_DATA.tasks.map((t) => (
            <div key={t.title} className="flex items-center gap-2 text-sm">
              {t.done ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Circle className="w-4 h-4 text-white/20" />}
              <span className={cn("flex-1", t.done && "line-through text-white/30", !t.done && "text-white/80")}>{t.title}</span>
              <span className={cn("text-xs", PRIORITY_COLOR[t.priority])}>{t.priority}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}