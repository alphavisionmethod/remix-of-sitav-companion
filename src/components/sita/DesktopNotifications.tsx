// ═══════════════════════════════════════════════════════════════
// SITA OS — Desktop Floating Notifications
// Glass-morphism notification toasts that auto-dismiss
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Briefcase, DollarSign, Home, Brain, ShoppingCart, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDataMode } from "@/contexts/DataModeContext";

interface DesktopNotification {
  id: string;
  domain: "business" | "money" | "household" | "advisor" | "system";
  title: string;
  message: string;
  action?: string;
  timestamp: number;
}

const DOMAIN_CONFIG: Record<string, { icon: React.ElementType; accent: string }> = {
  business: { icon: Briefcase, accent: "border-l-[hsl(265_55%_58%)]" },
  money: { icon: DollarSign, accent: "border-l-[hsl(140_50%_45%)]" },
  household: { icon: Home, accent: "border-l-[hsl(35_80%_55%)]" },
  advisor: { icon: Brain, accent: "border-l-[hsl(265_55%_70%)]" },
  system: { icon: Users, accent: "border-l-[hsl(190_60%_50%)]" },
};

const DEMO_NOTIFICATIONS: DesktopNotification[] = [
  { id: "1", domain: "advisor", title: "Business Advisor", message: "3 leads are cooling — re-engage before Friday", action: "View Leads", timestamp: Date.now() },
  { id: "2", domain: "money", title: "Money Center", message: "Insurance renewal due in 12 days", action: "Review Options", timestamp: Date.now() + 2000 },
  { id: "3", domain: "household", title: "Concierge", message: "Grocery list ready for approval", action: "Review List", timestamp: Date.now() + 5000 },
];

const AUTO_DISMISS_MS = 6000;
const MAX_VISIBLE = 3;
const STAGGER_DELAY_MS = 3000;

export function DesktopNotifications() {
  const location = useLocation();
  const isDesktop = location.pathname === "/" || location.pathname === "/home" || location.pathname === "/desktop";
  const [notifications, setNotifications] = useState<DesktopNotification[]>([]);

  // Stagger demo notifications
  useEffect(() => {
    if (!isDesktop) return;
    const timers = (isDemoMode ? DEMO_NOTIFICATIONS : [] as typeof DEMO_NOTIFICATIONS).map((notif, i) =>
      setTimeout(() => {
        setNotifications(prev => [notif, ...prev].slice(0, MAX_VISIBLE + 2));
      }, 2000 + i * STAGGER_DELAY_MS)
    );
    return () => timers.forEach(clearTimeout);
  }, [isDesktop]);

  // Auto-dismiss
  useEffect(() => {
    if (!isDesktop || notifications.length === 0) return;
    const id = setTimeout(() => {
      setNotifications(prev => prev.slice(0, -1));
    }, AUTO_DISMISS_MS);
    return () => clearTimeout(id);
  }, [notifications, isDesktop]);

  const dismiss = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  if (!isDesktop) return null;

  return (
    <div className="fixed top-16 right-4 z-[200] flex flex-col gap-2 max-w-sm pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.slice(0, MAX_VISIBLE).map((notif, i) => {
          const config = DOMAIN_CONFIG[notif.domain] || DOMAIN_CONFIG.system;
          const Icon = config.icon;
          return (
            <motion.div
              key={notif.id}
              layout
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.95 }}
              transition={{ type: "spring", mass: 0.8, stiffness: 200, damping: 20 }}
              className={cn(
                "pointer-events-auto rounded-2xl border-l-[3px] px-4 py-3.5",
                "bg-[hsl(0_0%_8%/0.75)] backdrop-blur-2xl border border-[hsl(0_0%_100%/0.08)]",
                "shadow-2xl shadow-black/30",
                config.accent
              )}
            >
              {/* Progress bar */}
              <motion.div
                className="absolute top-0 left-0 h-[2px] bg-[hsl(0_0%_100%/0.15)] rounded-full"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: AUTO_DISMISS_MS / 1000, ease: "linear" }}
              />

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-[hsl(0_0%_100%/0.08)] p-2 shrink-0 mt-0.5">
                  <Icon className="h-4 w-4 text-[hsl(0_0%_100%/0.7)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[hsl(0_0%_100%/0.8)]">{notif.title}</p>
                  <p className="text-[11px] text-[hsl(0_0%_100%/0.5)] mt-0.5 leading-relaxed">{notif.message}</p>
                  {notif.action && (
                    <button className="text-[10px] font-semibold text-[hsl(265_55%_70%)] mt-1.5 hover:text-[hsl(265_55%_80%)] transition-colors">
                      {notif.action} →
                    </button>
                  )}
                </div>
                <button
                  onClick={() => dismiss(notif.id)}
                  className="rounded-full p-1 hover:bg-[hsl(0_0%_100%/0.1)] transition-colors shrink-0"
                >
                  <X className="h-3 w-3 text-[hsl(0_0%_100%/0.3)]" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
