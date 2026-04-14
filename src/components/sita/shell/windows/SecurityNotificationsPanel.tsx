// ═══════════════════════════════════════════════════════════════
// SITA OS — Security Notifications Panel
// Shows notifyd events in the Security Center
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import {
  Bell, CheckCircle, XCircle, AlertTriangle, ShieldCheck,
  Lock, Unlock, LogOut, Bug, Key, Smartphone, Shield,
  CheckCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getNotifyDaemon, type SecurityNotification, type SecurityEventType } from "@/lib/os-security/notifyd";

const TYPE_ICONS: Record<SecurityEventType, typeof Shield> = {
  "elevation-approved": ShieldCheck,
  "elevation-denied": Shield,
  "login-failed": AlertTriangle,
  "login-success": CheckCircle,
  "account-locked": Lock,
  "session-locked": Lock,
  "session-unlocked": Unlock,
  "session-terminated": LogOut,
  "threat-detected": Bug,
  "policy-violation": AlertTriangle,
  "device-untrusted": Smartphone,
  "credential-changed": Key,
};

const URGENCY_STYLES: Record<string, string> = {
  critical: "border-l-[hsl(0_70%_55%)] bg-[hsl(0_70%_55%/0.04)]",
  high:     "border-l-[hsl(38_85%_58%)] bg-[hsl(38_85%_58%/0.03)]",
  medium:   "border-l-primary bg-white/[0.02]",
  low:      "border-l-transparent bg-white/[0.01]",
};

const URGENCY_ICON_COLORS: Record<string, string> = {
  critical: "text-[hsl(0_70%_55%)] bg-[hsl(0_70%_55%/0.12)]",
  high:     "text-[hsl(38_85%_58%)] bg-[hsl(38_85%_58%/0.12)]",
  medium:   "text-primary bg-primary/10",
  low:      "text-muted-foreground bg-white/[0.06]",
};

type Filter = "all" | "critical" | "high" | "unread";

export function SecurityNotificationsPanel() {
  const [notifications, setNotifications] = useState<SecurityNotification[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const notifyd = getNotifyDaemon();
    notifyd.seedDemoEvents();
    setNotifications(notifyd.getAll());

    const unsub = notifyd.subscribe(() => {
      setNotifications(notifyd.getAll());
    });

    return unsub;
  }, []);

  const filtered = notifications.filter(n => {
    if (n.dismissed) return false;
    if (filter === "critical") return n.urgency === "critical";
    if (filter === "high") return n.urgency === "critical" || n.urgency === "high";
    if (filter === "unread") return !n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read && !n.dismissed).length;
  const criticalCount = notifications.filter(n => !n.read && !n.dismissed && n.urgency === "critical").length;

  const handleMarkRead = (id: string) => {
    getNotifyDaemon().markRead(id);
    setNotifications(getNotifyDaemon().getAll());
  };

  const handleDismiss = (id: string) => {
    getNotifyDaemon().dismiss(id);
    setNotifications(getNotifyDaemon().getAll());
  };

  const handleMarkAllRead = () => {
    getNotifyDaemon().markAllRead();
    setNotifications(getNotifyDaemon().getAll());
  };

  const filters: { key: Filter; label: string; count?: number }[] = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread", count: unreadCount },
    { key: "critical", label: "Critical", count: criticalCount },
    { key: "high", label: "High+", count: notifications.filter(n => !n.dismissed && (n.urgency === "critical" || n.urgency === "high")).length },
  ];

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold">Security Notifications</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            className="text-xs gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Elevation approvals, failed logins, and security events
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors",
              filter === f.key
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
            )}
          >
            {f.label}
            {f.count !== undefined && f.count > 0 && (
              <span className="ml-1.5 px-1 py-0.5 rounded text-[9px] bg-white/[0.08]">{f.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Notification list */}
      {filtered.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No notifications match this filter</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(n => {
            const Icon = TYPE_ICONS[n.type] || Bell;
            return (
              <div
                key={n.id}
                className={cn(
                  "group relative rounded-xl border-l-[3px] border border-white/[0.06] p-4 transition-all",
                  URGENCY_STYLES[n.urgency],
                  n.read && "opacity-50"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg shrink-0", URGENCY_ICON_COLORS[n.urgency])}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[11px] font-semibold text-foreground">{n.title}</span>
                      {!n.read && (
                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                      )}
                      <span className={cn(
                        "ml-auto text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase",
                        n.urgency === "critical" ? "bg-[hsl(0_70%_55%/0.12)] text-[hsl(0_70%_55%)]" :
                        n.urgency === "high" ? "bg-[hsl(38_85%_58%/0.12)] text-[hsl(38_85%_50%)]" :
                        "bg-white/[0.06] text-muted-foreground"
                      )}>
                        {n.urgency}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{n.body}</p>
                    <p className="text-[9px] text-muted-foreground/50 mt-1">
                      {new Date(n.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      {" · "}
                      {n.type.replace(/-/g, " ")}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    {!n.read && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="p-1 rounded hover:bg-white/[0.08]"
                        title="Mark read"
                      >
                        <CheckCircle className="h-3 w-3 text-muted-foreground" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDismiss(n.id)}
                      className="p-1 rounded hover:bg-white/[0.08]"
                      title="Dismiss"
                    >
                      <XCircle className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
