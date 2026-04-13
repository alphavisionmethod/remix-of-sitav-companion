import { DesktopWidgetCard } from "./DesktopWidgetCard";
import { Bell, CreditCard, Plane, FileText } from "lucide-react";

const DEMO_ALERTS = [
  { icon: CreditCard, text: "Collections follow-up overdue", time: "12m ago", color: "text-red-400" },
  { icon: FileText, text: "Insurance renewal due Friday", time: "1h ago", color: "text-amber-400" },
  { icon: Plane, text: "Flight to NYC confirmed", time: "3h ago", color: "text-sky-400" },
];

export function DesktopNotificationsFeedWidget() {
  return (
    <DesktopWidgetCard title="Notifications">
      <div className="space-y-2.5">
        {DEMO_ALERTS.map((a, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <a.icon className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${a.color}`} />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-white/80 leading-tight truncate">{a.text}</p>
              <p className="text-[10px] text-white/30">{a.time}</p>
            </div>
          </div>
        ))}
      </div>
    </DesktopWidgetCard>
  );
}
