import { MobileShell } from "@/platform/experience/components/mobile/MobileShell";
import { AlertCard, type AlertItem } from "@/platform/experience/components/mobile/AlertCard";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useMobileAlerts } from "@/hooks/use-domain-data";
import { Bell, AlertTriangle, Info, CheckCircle } from "lucide-react";

const MobileAlerts = () => {
  const { data: alerts = [] } = useMobileAlerts();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const filtered = filter === "unread" ? alerts.filter((a) => !a.read) : alerts;
  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <MobileShell title="Alerts">
      {/* Alert Summary */}
      <div className="mb-4 p-3 rounded-xl bg-card border border-border/40">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold text-foreground">Alert Summary</p>
          </div>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px] font-medium">
              {unreadCount} unread
            </span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4">
        {(["all", "unread"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn("px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors border", filter === f ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border/40 text-muted-foreground")}>
            {f} {f === "unread" && `(${unreadCount})`}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {filtered.map((item) => (<AlertCard key={item.id} item={item} />))}
        {filtered.length === 0 && (<p className="text-sm text-muted-foreground text-center py-8">No alerts to show</p>)}
      </div>
    </MobileShell>
  );
};

export default MobileAlerts;
