// ═══════════════════════════════════════════════════════════════
// SITA OS — User Notification Center
// User-plane filtered notifications with read/dismiss
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { notificationRouter, type PlatformNotification } from "@/lib/platform-plane";
import { useAuth } from "@/contexts/AuthContext";
import {
  Bell, BellOff, Check, X, RefreshCw, Shield, HardDrive,
  AlertTriangle, Info, AlertCircle, Smartphone, Zap
} from "lucide-react";

const SEVERITY_STYLES: Record<string, { color: string; icon: typeof Info }> = {
  info: { color: "bg-primary/10 text-primary border-primary/20", icon: Info },
  warning: { color: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: AlertTriangle },
  error: { color: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertCircle },
  critical: { color: "bg-destructive/20 text-destructive border-destructive/30", icon: Shield },
};

const CATEGORY_ICONS: Record<string, typeof Zap> = {
  sync: RefreshCw,
  device: Smartphone,
  quota: HardDrive,
  security: Shield,
  repair: Zap,
  case: AlertCircle,
  account: Shield,
};

export function UserNotificationCenter() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<PlatformNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    notificationRouter.getUserNotifications(user.id, 30).then((n) => {
      setNotifications(n);
      setLoading(false);
    });
  }, [user]);

  const markRead = async (id: string) => {
    await notificationRouter.markAsRead(id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const dismiss = async (id: string) => {
    await notificationRouter.dismiss(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          Notifications
          {unreadCount > 0 && (
            <Badge variant="default" className="text-[10px] h-5 min-w-[20px] flex items-center justify-center">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-muted-foreground text-sm py-4">Loading…</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BellOff className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No notifications</p>
            <p className="text-xs mt-1">You're all caught up</p>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
            {notifications.map((n) => {
              const severity = SEVERITY_STYLES[n.severity] ?? SEVERITY_STYLES.info;
              const SevIcon = severity.icon;
              const CatIcon = CATEGORY_ICONS[n.category] ?? Info;
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-all ${
                    n.read ? "bg-transparent border-transparent opacity-60" : "bg-muted/20 border-border/40"
                  }`}
                >
                  <div className={`mt-0.5 h-6 w-6 rounded-md flex items-center justify-center shrink-0 ${severity.color}`}>
                    <CatIcon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium truncate">{n.title}</span>
                      {!n.read && <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                    </div>
                    {n.body && <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>}
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-[9px] h-4">{n.category}</Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-0.5 shrink-0">
                    {!n.read && (
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => markRead(n.id)}>
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => dismiss(n.id)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
