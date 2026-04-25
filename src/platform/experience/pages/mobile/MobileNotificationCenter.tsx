import { MobileShell } from "@/platform/experience/components/mobile/MobileShell";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, ShieldCheck, RefreshCw, AlertTriangle, CheckCircle2, Zap,
  ChevronRight, Clock, MessageSquare, XCircle, Info, Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NotifPriority = "critical" | "normal" | "info";
type NotifType = "approval" | "security" | "sync" | "update" | "command" | "system";

interface Notification {
  id: string;
  title: string;
  body: string;
  priority: NotifPriority;
  type: NotifType;
  time: string;
  read: boolean;
  actionable: boolean;
  actionLabel?: string;
  groupDate: string;
}

const notifications: Notification[] = [
  { id: "n1", title: "Approval Required: Revoke device trust", body: "tablet-02 trust revocation requires your confirmation", priority: "critical", type: "approval", time: "2 min ago", read: false, actionable: true, actionLabel: "Review", groupDate: "Today" },
  { id: "n2", title: "Security Alert: Unknown login attempt", body: "Login attempt from unrecognized IP 192.168.1.42 was blocked", priority: "critical", type: "security", time: "15 min ago", read: false, actionable: true, actionLabel: "Investigate", groupDate: "Today" },
  { id: "n3", title: "Sync conflict detected", body: "Budget_2025.xlsx modified on 2 devices simultaneously", priority: "normal", type: "sync", time: "45 min ago", read: false, actionable: true, actionLabel: "Resolve", groupDate: "Today" },
  { id: "n4", title: "Command completed: Force sync", body: "All 3 online devices synced successfully", priority: "normal", type: "command", time: "1 hr ago", read: true, actionable: false, groupDate: "Today" },
  { id: "n5", title: "Update v2.4.1 deployed to canary", body: "12 devices updated, 0 errors. Monitoring for 24h before stable promotion", priority: "normal", type: "update", time: "3 hr ago", read: true, actionable: true, actionLabel: "View Status", groupDate: "Today" },
  { id: "n6", title: "Home Server offline", body: "Device has been unreachable since 7:14 AM. Auto-retry in progress", priority: "normal", type: "system", time: "5 hr ago", read: true, actionable: false, groupDate: "Today" },
  { id: "n7", title: "Trust level upgraded", body: "iPhone 15 promoted to Primary trust level after 30-day verification", priority: "info", type: "security", time: "Yesterday", read: true, actionable: false, groupDate: "Yesterday" },
  { id: "n8", title: "Sync completed", body: "Full ecosystem sync completed across all devices", priority: "info", type: "sync", time: "Yesterday", read: true, actionable: false, groupDate: "Yesterday" },
  { id: "n9", title: "Update v2.4.0 rolled out", body: "Successfully deployed to all stable devices", priority: "info", type: "update", time: "2 days ago", read: true, actionable: false, groupDate: "Earlier" },
];

const priorityConfig: Record<NotifPriority, { color: string; bgColor: string; label: string }> = {
  critical: { color: "text-red-400", bgColor: "bg-red-500/10 border-red-500/30", label: "Critical" },
  normal: { color: "text-foreground", bgColor: "bg-card border-border/40", label: "Normal" },
  info: { color: "text-muted-foreground", bgColor: "bg-card border-border/40", label: "Info" },
};

const typeIcons: Record<NotifType, { icon: any; color: string }> = {
  approval: { icon: ShieldCheck, color: "text-amber-400" },
  security: { icon: AlertTriangle, color: "text-red-400" },
  sync: { icon: RefreshCw, color: "text-blue-400" },
  update: { icon: Zap, color: "text-emerald-400" },
  command: { icon: CheckCircle2, color: "text-primary" },
  system: { icon: Info, color: "text-muted-foreground" },
};

const MobileNotificationCenter = () => {
  const [filter, setFilter] = useState<NotifPriority | "all">("all");
  const [items, setItems] = useState(notifications);

  const filtered = filter === "all" ? items : items.filter((n) => n.priority === filter);
  const groups = [...new Set(filtered.map((n) => n.groupDate))];
  const unreadCount = items.filter((n) => !n.read).length;

  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <MobileShell title="Notifications">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          <span className="text-xs text-muted-foreground">{unreadCount} unread</span>
        </div>
        <button onClick={markAllRead} className="text-[10px] text-primary font-medium">
          Mark all read
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {(["all", "critical", "normal", "info"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn(
            "px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors capitalize whitespace-nowrap",
            filter === f ? "bg-primary/20 text-primary" : "text-muted-foreground"
          )}>
            {f}{f === "critical" && ` (${items.filter((n) => n.priority === "critical").length})`}
          </button>
        ))}
      </div>

      {/* Grouped Notifications */}
      {groups.map((group) => (
        <div key={group} className="mb-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">{group}</p>
          <div className="space-y-1.5">
            <AnimatePresence>
              {filtered.filter((n) => n.groupDate === group).map((notif, i) => {
                const pc = priorityConfig[notif.priority];
                const ti = typeIcons[notif.type];
                const Icon = ti.icon;
                return (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={cn("rounded-xl border p-3", pc.bgColor, !notif.read && "ring-1 ring-primary/20")}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={cn("mt-0.5 shrink-0", ti.color)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={cn("text-xs font-medium", !notif.read && "text-foreground", notif.read && "text-muted-foreground")}>{notif.title}</p>
                          {!notif.read && <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{notif.body}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Clock className="h-2.5 w-2.5 text-muted-foreground" />
                          <span className="text-[9px] text-muted-foreground">{notif.time}</span>
                          {notif.actionable && notif.actionLabel && (
                            <button className="ml-auto px-2 py-0.5 rounded-lg text-[9px] font-medium bg-primary/15 text-primary hover:bg-primary/25 transition-colors">
                              {notif.actionLabel}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      ))}
    </MobileShell>
  );
};

export default MobileNotificationCenter;
