import { DesktopWidgetCard } from "./DesktopWidgetCard";

const TASKS = [
  { title: "Pick up dry cleaning", due: "Today 3pm", priority: "bg-red-400" },
  { title: "Schedule vet for Bruno", due: "Tomorrow", priority: "bg-amber-400" },
  { title: "Renew parking permit", due: "Apr 18", priority: "bg-white/30" },
];

export function DesktopConciergeTasksWidget() {
  return (
    <DesktopWidgetCard title="Concierge Tasks">
      <div className="space-y-2.5">
        {TASKS.map((t, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <div className={`h-2 w-2 rounded-full shrink-0 ${t.priority}`} />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-white/80 truncate">{t.title}</p>
              <p className="text-[10px] text-white/30">{t.due}</p>
            </div>
          </div>
        ))}
      </div>
    </DesktopWidgetCard>
  );
}
