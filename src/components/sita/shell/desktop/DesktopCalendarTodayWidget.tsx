import { DesktopWidgetCard } from "./DesktopWidgetCard";

const EVENTS = [
  { time: "9:00 AM", title: "Team standup", domain: "business", color: "bg-violet-500" },
  { time: "11:30 AM", title: "Financial review", domain: "finance", color: "bg-emerald-500" },
  { time: "2:00 PM", title: "Client call — Acme", domain: "business", color: "bg-violet-500" },
  { time: "5:00 PM", title: "Dentist (Maya)", domain: "concierge", color: "bg-amber-500" },
];

export function DesktopCalendarTodayWidget() {
  return (
    <DesktopWidgetCard title="Today's Schedule">
      <div className="space-y-2.5">
        {EVENTS.map((e, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${e.color}`} />
            <span className="text-[10px] text-white/35 w-16 shrink-0 tabular-nums">{e.time}</span>
            <span className="text-[11px] text-white/75 truncate">{e.title}</span>
          </div>
        ))}
      </div>
    </DesktopWidgetCard>
  );
}
