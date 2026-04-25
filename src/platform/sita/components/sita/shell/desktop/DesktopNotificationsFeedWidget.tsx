import { DesktopWidgetCard } from "./DesktopWidgetCard";
import { Bell, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { useNotificationsFeedData } from "@/hooks/useDesktopWidgetsData";

const URG_ICON: Record<string, any> = {
  high: AlertCircle,
  critical: AlertCircle,
  medium: AlertTriangle,
  low: Info,
};
const URG_COLOR: Record<string, string> = {
  high: "text-red-400",
  critical: "text-red-400",
  medium: "text-amber-400",
  low: "text-sky-400",
};

function ago(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return "just now";
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m ago`;
  if (ms < 86_400_000) return `${Math.floor(ms / 3_600_000)}h ago`;
  return `${Math.floor(ms / 86_400_000)}d ago`;
}

export function DesktopNotificationsFeedWidget() {
  const { data, isLoading, isEmpty } = useNotificationsFeedData();

  return (
    <DesktopWidgetCard title="Notifications">
      <div className="space-y-2.5" data-testid="widget-notifications-feed">
        {isLoading ? (
          <p className="text-xs text-white/40 py-4 text-center">Loading…</p>
        ) : isEmpty ? (
          <div className="text-center py-4">
            <Bell className="mx-auto h-5 w-5 text-white/30" />
            <p className="mt-2 text-xs text-white/55">No new notifications</p>
            <p className="mt-1 text-[10px] text-white/30">You're all caught up</p>
          </div>
        ) : (
          data.map((n) => {
            const Icon = URG_ICON[n.urgency] ?? Info;
            const color = URG_COLOR[n.urgency] ?? "text-white/40";
            return (
              <div key={n.id} className="flex items-start gap-2.5">
                <Icon className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-white/80 leading-tight truncate">{n.title}</p>
                  <p className="text-[10px] text-white/30">{ago(n.created_at)}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </DesktopWidgetCard>
  );
}
