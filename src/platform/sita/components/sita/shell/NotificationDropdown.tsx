// ═══════════════════════════════════════════════════════════════
// SITA OS — Notification Center Dropdown
// Slide-down translucent panel from menu bar with grouped notifications
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Check, Clock, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEPTH_LAYERS } from "@/platform/design-system/nova-os";
import { NotificationService, type SystemNotification } from "@/platform/nova-sdk/services/notification-service";
import { NovaEvents } from "@/platform/nova-sdk/input/events";

interface NotificationDropdownProps {
  open: boolean;
  onClose: () => void;
}

const URGENCY_COLORS: Record<string, string> = {
  critical: "hsl(0, 70%, 55%)",
  high: "hsl(30, 80%, 55%)",
  normal: "hsl(210, 70%, 55%)",
  low: "hsl(0, 0%, 55%)",
};

const APP_ICONS: Record<string, string> = {
  "com.nova.mail": "✉️",
  "com.nova.calendar": "📅",
  "com.nova.notes": "📝",
  "com.sita.monitor": "📊",
  "com.nova.weather": "🌤️",
  system: "⚙️",
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export function NotificationDropdown({ open, onClose }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [dismissing, setDismissing] = useState<Set<string>>(new Set());

  const refresh = useCallback(() => {
    setNotifications(NotificationService.getHistory({ limit: 50 }));
  }, []);

  useEffect(() => {
    if (!open) return;
    refresh();
    const unsub = NovaEvents.on("app:state-change", (payload: any) => {
      if (payload?.event?.startsWith("notification:")) refresh();
    });
    return unsub;
  }, [open, refresh]);

  const handleDismiss = useCallback((id: string) => {
    setDismissing(prev => new Set(prev).add(id));
    setTimeout(() => {
      NotificationService.dismiss(id);
      NotificationService.markRead(id);
      setDismissing(prev => { const n = new Set(prev); n.delete(id); return n; });
      refresh();
    }, 300);
  }, [refresh]);

  const handleClearAll = useCallback(() => {
    const ids = notifications.map(n => n.id);
    // Cascade animation — stagger dismissals
    ids.forEach((id, i) => {
      setTimeout(() => handleDismiss(id), i * 60);
    });
  }, [notifications, handleDismiss]);

  const handleMarkAllRead = useCallback(() => {
    NotificationService.markAllRead();
    refresh();
  }, [refresh]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Group by app
  const grouped = notifications.reduce<Record<string, SystemNotification[]>>((acc, n) => {
    const key = n.appId || "system";
    if (!acc[key]) acc[key] = [];
    acc[key].push(n);
    return acc;
  }, {});

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0"
            style={{ zIndex: DEPTH_LAYERS.menuBar + 5 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed right-2 overflow-hidden"
            style={{
              top: 32,
              width: 360,
              maxHeight: "70vh",
              zIndex: DEPTH_LAYERS.menuBar + 10,
              background: "hsl(0 0% 8% / 0.78)",
              backdropFilter: "blur(50px) saturate(1.8)",
              WebkitBackdropFilter: "blur(50px) saturate(1.8)",
              borderRadius: 14,
              border: "1px solid hsl(0 0% 100% / 0.08)",
              boxShadow: "0 20px 60px hsl(0 0% 0% / 0.5), 0 0 0 1px hsl(0 0% 100% / 0.03) inset",
            }}
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(0_0%_100%/0.06)]">
              <div className="flex items-center gap-2">
                <Bell className="h-3.5 w-3.5 text-[hsl(0_0%_100%/0.6)]" />
                <span className="text-[13px] font-semibold text-[hsl(0_0%_100%/0.9)]">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-[hsl(210_80%_55%)] text-[9px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {notifications.length > 0 && (
                  <>
                    <button
                      onClick={handleMarkAllRead}
                      className="p-1 rounded text-[hsl(0_0%_100%/0.4)] hover:text-[hsl(0_0%_100%/0.8)] transition-colors"
                      title="Mark all read"
                    >
                      <Check className="h-3 w-3" />
                    </button>
                    <button
                      onClick={handleClearAll}
                      className="p-1 rounded text-[hsl(0_0%_100%/0.4)] hover:text-[hsl(0_80%_60%)] transition-colors"
                      title="Clear all"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </>
                )}
                <button
                  onClick={onClose}
                  className="p-1 rounded text-[hsl(0_0%_100%/0.4)] hover:text-[hsl(0_0%_100%/0.8)] transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto" style={{ maxHeight: "calc(70vh - 50px)" }}>
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-[hsl(0_0%_100%/0.3)]">
                  <Bell className="h-8 w-8 mb-2 opacity-40" />
                  <span className="text-[12px]">No notifications</span>
                </div>
              ) : (
                Object.entries(grouped).map(([appId, notifs]) => (
                  <div key={appId} className="border-b border-[hsl(0_0%_100%/0.04)] last:border-b-0">
                    {/* App group header */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-[hsl(0_0%_100%/0.02)]">
                      <span className="text-[12px]">{APP_ICONS[appId] || "📱"}</span>
                      <span className="text-[11px] font-medium text-[hsl(0_0%_100%/0.5)] uppercase tracking-wider">
                        {appId.replace("com.nova.", "").replace("com.sita.", "")}
                      </span>
                      <span className="text-[10px] text-[hsl(0_0%_100%/0.3)]">({notifs.length})</span>
                    </div>

                    {/* Notifications */}
                    <AnimatePresence>
                      {notifs.map((notif, idx) => (
                        <motion.div
                          key={notif.id}
                          layout
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: dismissing.has(notif.id) ? 0 : 1, x: dismissing.has(notif.id) ? 60 : 0 }}
                          exit={{ opacity: 0, x: 60, height: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 30, delay: idx * 0.03 }}
                          className={cn(
                            "flex items-start gap-3 px-4 py-2.5 cursor-default transition-colors",
                            "hover:bg-[hsl(0_0%_100%/0.03)]",
                            !notif.read && "bg-[hsl(210_60%_50%/0.06)]"
                          )}
                        >
                          {/* Urgency dot */}
                          <div
                            className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                            style={{ background: URGENCY_COLORS[notif.urgency] }}
                          />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2">
                              <span className={cn(
                                "text-[12px] truncate",
                                notif.read ? "text-[hsl(0_0%_100%/0.6)]" : "text-[hsl(0_0%_100%/0.9)] font-medium"
                              )}>
                                {notif.title}
                              </span>
                              <span className="text-[10px] text-[hsl(0_0%_100%/0.3)] shrink-0 flex items-center gap-0.5">
                                <Clock className="h-2.5 w-2.5" />
                                {timeAgo(notif.createdAt)}
                              </span>
                            </div>
                            {notif.body && (
                              <p className="text-[11px] text-[hsl(0_0%_100%/0.4)] mt-0.5 line-clamp-2">
                                {notif.body}
                              </p>
                            )}
                            {/* Actions */}
                            {notif.actions && notif.actions.length > 0 && (
                              <div className="flex gap-1.5 mt-1.5">
                                {notif.actions.map(action => (
                                  <button
                                    key={action.id}
                                    onClick={() => action.handler?.()}
                                    className="px-2 py-0.5 rounded text-[10px] font-medium bg-[hsl(0_0%_100%/0.08)] text-[hsl(0_0%_100%/0.7)] hover:bg-[hsl(0_0%_100%/0.14)] transition-colors"
                                  >
                                    {action.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Dismiss */}
                          <button
                            onClick={() => handleDismiss(notif.id)}
                            className="p-0.5 rounded text-[hsl(0_0%_100%/0.2)] hover:text-[hsl(0_0%_100%/0.6)] transition-colors shrink-0 mt-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
