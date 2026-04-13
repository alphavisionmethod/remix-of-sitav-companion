import { DesktopWidgetCard } from "./DesktopWidgetCard";

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  app: string;
  priority: "low" | "medium" | "high";
}

const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "Collections follow-up ready",
    body: "Business prepared 3 invoice follow-ups for review.",
    time: "2m ago",
    app: "Business",
    priority: "high",
  },
  {
    id: "2",
    title: "Obligation due tomorrow",
    body: "Finance flagged a payment requiring approval.",
    time: "14m ago",
    app: "Finance",
    priority: "medium",
  },
  {
    id: "3",
    title: "Travel prep pack updated",
    body: "Concierge added required documents and reminders.",
    time: "27m ago",
    app: "Concierge",
    priority: "low",
  },
];

const priorityStyle = {
  high: "bg-rose-400/15 text-rose-200",
  medium: "bg-amber-400/15 text-amber-100",
  low: "bg-white/10 text-white/60",
};

export function DesktopNotificationsWidget() {
  return (
    <DesktopWidgetCard title="Notifications" accent="from-fuchsia-500/15 via-white/[0.05] to-amber-400/10" delay={0.15}>
      <div className="space-y-3">
        {SEED_NOTIFICATIONS.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-white/10 bg-black/15 p-4 transition hover:bg-white/[0.08]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-white">{item.title}</div>
                <div className="mt-1 text-xs leading-5 text-white/60">{item.body}</div>
              </div>
              <div className="text-[10px] text-white/40">{item.time}</div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="rounded-full border border-white/10 bg-white/[0.08] px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-white/55">
                {item.app}
              </span>
              <span className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.18em] ${priorityStyle[item.priority]} ${item.priority === "high" ? "animate-pulse" : ""}`}>
                {item.priority}
              </span>
            </div>
          </div>
        ))}
      </div>
    </DesktopWidgetCard>
  );
}
