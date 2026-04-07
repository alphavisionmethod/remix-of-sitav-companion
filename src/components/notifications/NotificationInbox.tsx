// ═══════════════════════════════════════════════════════════════
// SITA OS — Notification Inbox Component
// Bell icon with unread badge and dropdown notification panel
// ═══════════════════════════════════════════════════════════════

import { useState, useRef, useEffect } from "react";
import { Bell, AlertCircle, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
const urgencyDot: Record<string, string> = {
  critical: "bg-destructive animate-pulse",
  high: "bg-yellow-400",
  normal: "bg-primary",
  low: "bg-muted-foreground",
};

export function NotificationInbox() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const { data: notifications = [] } = useQuery({
    queryKey: ["notification-inbox", user?.id],
    enabled: !!user,
    refetchInterval: 30000,
    queryFn: async () => {
      const { data } = await fromTable("notifications_queue")
        .select("id, title, body, category, urgency, action_url, created_at, read_at, status")
        .order("created_at", { ascending: false })
        .limit(20);
      return data || [];
    },
  });

  const unread = notifications.filter((n: any) => !n.read_at && n.status !== "sent").length;

  const handleMarkRead = async (id: string) => {
    await fromTable("notifications_queue").update({ read_at: new Date().toISOString() }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["notification-inbox"] });
  };

  return (
    <div ref={ref} className="relative" data-testid="notification-inbox-container">
      {/* Bell Button */}
      <button
        data-testid="notification-bell"
        onClick={() => setOpen(!open)}
        className={cn(
          "relative flex items-center justify-center h-9 w-9 rounded-lg transition-colors",
          "hover:bg-accent/10 text-muted-foreground hover:text-foreground",
          open && "bg-accent/10 text-foreground"
        )}
      >
        <Bell className="h-4.5 w-4.5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            data-testid="notification-inbox"
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 max-h-[420px] overflow-y-auto rounded-xl border border-border bg-popover shadow-xl z-50"
          >
            <div className="p-3 border-b border-border flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Notifications</span>
              {unread > 0 && (
                <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                  {unread} unread
                </span>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((n: any) => {
                  const isRead = !!n.read_at || n.status === "sent";
                  return (
                    <div
                      key={n.id}
                      data-testid="notification-inbox-item"
                      className={cn(
                        "px-3 py-2.5 hover:bg-muted/50 transition-colors cursor-pointer group",
                        !isRead && "bg-primary/3"
                      )}
                      onClick={() => {
                        if (!isRead) handleMarkRead(n.id);
                        if (n.action_url) window.location.href = n.action_url;
                      }}
                    >
                      <div className="flex items-start gap-2.5">
                        {!isRead && (
                          <span className={cn("h-2 w-2 rounded-full mt-1.5 shrink-0", urgencyDot[n.urgency] || urgencyDot.normal)} />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-xs leading-snug line-clamp-1", isRead ? "text-muted-foreground" : "text-foreground font-medium")}>
                            {n.title}
                          </p>
                          {n.body && (
                            <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{n.body}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-muted-foreground/60 capitalize">{n.category}</span>
                            <span className="text-[10px] text-muted-foreground/40">
                              {n.created_at ? new Date(n.created_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) : ""}
                            </span>
                          </div>
                        </div>
                        {n.action_url && (
                          <ExternalLink className="h-3 w-3 text-muted-foreground/30 group-hover:text-primary shrink-0 mt-1" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="p-2 border-t border-border">
              <a
                href="/notifications"
                data-testid="notification-inbox-view-all"
                className="block text-center text-xs text-primary hover:text-primary/80 transition-colors py-1"
              >
                View all notifications
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
