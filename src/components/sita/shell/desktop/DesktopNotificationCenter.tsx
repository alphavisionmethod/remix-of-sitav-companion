import { Bell } from "lucide-react";

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  app: string;
}

const notifications: NotificationItem[] = [
  { id: "1", title: "Collections follow-up ready", body: "Business prepared 3 invoice follow-ups for review.", time: "2m ago", app: "Business" },
  { id: "2", title: "Obligation due tomorrow", body: "Finance flagged a payment requiring approval.", time: "14m ago", app: "Finance" },
  { id: "3", title: "Travel prep pack updated", body: "Concierge added required documents and reminders.", time: "27m ago", app: "Concierge" },
];

interface Props {
  visible: boolean;
}

export function DesktopNotificationCenter({ visible }: Props) {
  if (!visible) return null;

  return (
    <div className="hidden w-[360px] shrink-0 xl:block">
      <div className="sticky top-20 rounded-[28px] border border-white/10 bg-white/[0.08] p-5 backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.28)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-white">Notification Center</div>
            <div className="text-xs text-white/50">Calm, grouped, reviewable</div>
          </div>
          <Bell className="h-4 w-4 text-white/50" />
        </div>
        <div className="space-y-3">
          {notifications.map((item) => (
            <div key={item.id} className="rounded-2xl border border-white/10 bg-black/15 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-white">{item.title}</div>
                  <div className="mt-1 text-xs leading-5 text-white/60">{item.body}</div>
                </div>
                <span className="text-[10px] text-white/40">{item.time}</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[11px] text-white/45">{item.app}</span>
                <button className="text-[11px] text-cyan-300 hover:text-cyan-200">Review</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
