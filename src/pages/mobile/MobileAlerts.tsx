import { MobileShell } from "@/components/mobile/MobileShell";
import { AlertCard, type AlertItem } from "@/components/mobile/AlertCard";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useMobileAlerts } from "@/hooks/use-domain-data";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

const MobileAlerts = () => {
  const { isDemoMode } = useDataMode();
  const { data: alerts = [] } = useMobileAlerts();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const filtered = filter === "unread" ? alerts.filter((a) => !a.read) : alerts;

  return (
    <MobileShell title="Alerts">
      <DemoModeBadge />
      <div className="flex items-center gap-2 mb-4">
        {(["all", "unread"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn("px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors border", filter === f ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border/40 text-muted-foreground")}>
            {f} {f === "unread" && `(${alerts.filter((a) => !a.read).length})`}
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
