// ═══════════════════════════════════════════════════════════════
// SITA OS — Notification Center
// Slide-out panel with grouped, dismissable notifications
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Check, CheckCheck, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: string;
  domain: "business" | "finance" | "concierge" | "security" | "system";
  title: string;
  body: string;
  time: string;
  read: boolean;
  actionPath?: string;
  urgency: "low" | "medium" | "high" | "critical";
}

const DEMO_NOTIFICATIONS: Notification[] = [
  { id: "n1", domain: "business", title: "New lead scored 91", body: "Emily Park from Park & Associates is ready for a demo", time: "3m ago", read: false, actionPath: "/business/leads", urgency: "high" },
  { id: "n2", domain: "finance", title: "Overdue invoice", body: "Bloom Studio — $1,200 overdue by 5 days", time: "1h ago", read: false, actionPath: "/money", urgency: "critical" },
  { id: "n3", domain: "concierge", title: "Errand completed", body: "Package pickup confirmed at FedEx", time: "2h ago", read: false, urgency: "low" },
  { id: "n4", domain: "business", title: "Proposal viewed", body: "Sarah Chen opened your proposal 3 times", time: "4h ago", read: true, actionPath: "/business/quotes", urgency: "medium" },
  { id: "n5", domain: "security", title: "Vault item expiring", body: "SSL certificate expires in 7 days", time: "6h ago", read: false, actionPath: "/app-platform/vault", urgency: "high" },
  { id: "n6", domain: "system", title: "App update available", body: "SITA Business Center v1.2.0 ready", time: "1d ago", read: true, urgency: "low" },
  { id: "n7", domain: "finance", title: "Tax payment reminder", body: "Quarterly estimate due Apr 15 — $4,200", time: "1d ago", read: false, actionPath: "/money", urgency: "medium" },
  { id: "n8", domain: "concierge", title: "Grocery delivery", body: "Scheduled for tomorrow 10am–12pm", time: "1d ago", read: true, urgency: "low" },
];

const DOMAIN_COLORS: Record<string, string> = {
  business: "bg-primary/15 text-primary",
  finance: "bg-[hsl(var(--sita-gold))]/15 text-[hsl(var(--sita-gold))]",
  concierge: "bg-[hsl(var(--trust-safe))]/15 text-[hsl(var(--trust-safe))]",
  security: "bg-amber-500/15 text-amber-500",
  system: "bg-muted text-muted-foreground",
};

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
}

export const NotificationCenter = ({ open, onClose }: NotificationCenterProps) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);
  const [filter, setFilter] = useState<string | null>(null);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);
  const filtered = useMemo(() => {
    if (!filter) return notifications;
    return notifications.filter(n => n.domain === filter);
  }, [notifications, filter]);

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const dismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const domains = ["business", "finance", "concierge", "security", "system"];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[180] bg-black/30"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 z-[181] w-full max-w-sm bg-card border-l border-border/50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold">Notifications</h2>
                {unreadCount > 0 && (
                  <span className="min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center px-1">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={markAllRead}
                  className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-muted transition-colors"
                >
                  <CheckCheck className="h-3 w-3" /> Mark all read
                </button>
                <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Domain filters */}
            <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto scrollbar-thin">
              <button
                onClick={() => setFilter(null)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors shrink-0",
                  !filter ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                All
              </button>
              {domains.map(d => (
                <button
                  key={d}
                  onClick={() => setFilter(filter === d ? null : d)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors capitalize shrink-0",
                    filter === d ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Notifications list */}
            <div className="flex-1 overflow-y-auto px-2 py-1">
              {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Bell className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-sm">All caught up!</p>
                </div>
              )}
              <AnimatePresence>
                {filtered.map(n => (
                  <motion.div
                    key={n.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 60 }}
                    className={cn(
                      "group relative flex items-start gap-3 px-3 py-3 rounded-xl mb-1 transition-colors cursor-pointer",
                      n.read ? "opacity-60 hover:opacity-80" : "hover:bg-muted/40",
                      n.urgency === "critical" && !n.read && "bg-destructive/5 border border-destructive/20"
                    )}
                    onClick={() => {
                      markRead(n.id);
                      if (n.actionPath) { navigate(n.actionPath); onClose(); }
                    }}
                  >
                    {!n.read && <div className="absolute left-1 top-4 w-1.5 h-1.5 rounded-full bg-primary" />}
                    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider mt-0.5 shrink-0", DOMAIN_COLORS[n.domain])}>
                      {n.domain.slice(0, 3)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground">{n.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                      <p className="text-[10px] text-muted-foreground/50 mt-1">{n.time}</p>
                    </div>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      {!n.read && (
                        <button
                          onClick={e => { e.stopPropagation(); markRead(n.id); }}
                          className="p-1 rounded hover:bg-muted"
                          title="Mark read"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                      )}
                      <button
                        onClick={e => { e.stopPropagation(); dismiss(n.id); }}
                        className="p-1 rounded hover:bg-muted"
                        title="Dismiss"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      {n.actionPath && <ChevronRight className="h-3 w-3 text-muted-foreground/40" />}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationCenter;
