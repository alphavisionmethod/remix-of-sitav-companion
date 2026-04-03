// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Trusted Device: Alerts
// ═══════════════════════════════════════════════════════════════

import { MobileShell } from "@/components/mobile/MobileShell";
import { AlertCard, type AlertItem } from "@/components/mobile/AlertCard";
import { useState } from "react";
import { cn } from "@/lib/utils";

const mockAlerts: AlertItem[] = [
  { id: "alt-001", severity: "critical", title: "Collections escalation required", message: "Invoice #892 is 92 days overdue. $8,400 outstanding — requires immediate action.", domain: "business", createdAt: new Date(Date.now() - 900000).toISOString(), read: false },
  { id: "alt-002", severity: "urgent", title: "Subscription auto-renewing in 3 days", message: "Notion Teams ($200/mo) will auto-renew. Usage score: 12%. Consider cancellation.", domain: "finance", createdAt: new Date(Date.now() - 3600000).toISOString(), read: false },
  { id: "alt-003", severity: "warning", title: "Calendar conflict detected", message: "Client meeting and school pickup overlap on Thursday 3:30 PM. Needs resolution.", domain: "concierge", createdAt: new Date(Date.now() - 5400000).toISOString(), read: false },
  { id: "alt-004", severity: "warning", title: "Reserve funding below target", message: "Emergency reserve at 67% of target. Monthly contribution may need increase.", domain: "finance", createdAt: new Date(Date.now() - 7200000).toISOString(), read: true },
  { id: "alt-005", severity: "info", title: "4 leads promoted to qualified", message: "Lead scoring batch completed. 4 leads crossed qualification threshold.", domain: "business", createdAt: new Date(Date.now() - 10800000).toISOString(), read: true },
  { id: "alt-006", severity: "info", title: "Travel prep checklist generated", message: "NYC trip Mar 15-17: 6 prep items created. 0/6 completed.", domain: "concierge", createdAt: new Date(Date.now() - 14400000).toISOString(), read: true },
];

const MobileAlerts = () => {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const filtered = filter === "unread" ? mockAlerts.filter((a) => !a.read) : mockAlerts;

  return (
    <MobileShell title="Alerts">
      <div className="flex items-center gap-2 mb-4">
        {(["all", "unread"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors border",
              filter === f
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border/40 text-muted-foreground"
            )}
          >
            {f} {f === "unread" && `(${mockAlerts.filter((a) => !a.read).length})`}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((item) => (
          <AlertCard key={item.id} item={item} />
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No alerts to show</p>
        )}
      </div>
    </MobileShell>
  );
};

export default MobileAlerts;
