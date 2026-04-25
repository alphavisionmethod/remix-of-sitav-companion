// ═══════════════════════════════════════════════════════════════
// SITA OS — Unified Notification Center (Enhanced)
// Aggregates alerts from Business, Finance, and Concierge OS
// into one prioritized feed with cross-OS deep-linking
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, X, Check, CheckCheck, ChevronRight, Briefcase, DollarSign,
  Headphones, Shield, Settings, AlertTriangle, TrendingUp, Clock,
  ExternalLink, Zap, Calendar, Target, Receipt, Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { crossNavigate } from "@/domains/engines/cross-os-integration";
import { useNotifications, type UnifiedNotification } from "@/hooks/useNotifications";
import type { LucideIcon } from "lucide-react";

const DOMAIN_ICONS: Record<string, LucideIcon> = {
  business: Briefcase,
  finance: DollarSign,
  concierge: Headphones,
  security: Shield,
  system: Settings,
  "cross-os": Zap,
};

const DOMAIN_COLORS: Record<string, { badge: string; accent: string; glow: string }> = {
  business: { badge: "bg-[hsl(265_55%_58%/0.15)] text-[hsl(265_55%_65%)]", accent: "hsl(265 55% 58%)", glow: "shadow-[0_0_8px_hsl(265_55%_58%/0.2)]" },
  finance: { badge: "bg-[hsl(152_55%_48%/0.15)] text-[hsl(152_55%_58%)]", accent: "hsl(152 55% 48%)", glow: "shadow-[0_0_8px_hsl(152_55%_48%/0.2)]" },
  concierge: { badge: "bg-[hsl(285_55%_55%/0.15)] text-[hsl(285_55%_65%)]", accent: "hsl(285 55% 55%)", glow: "shadow-[0_0_8px_hsl(285_55%_55%/0.2)]" },
  security: { badge: "bg-amber-500/15 text-amber-400", accent: "hsl(38 85% 58%)", glow: "" },
  system: { badge: "bg-[hsl(0_0%_100%/0.06)] text-[hsl(0_0%_100%/0.5)]", accent: "hsl(0 0% 60%)", glow: "" },
  "cross-os": { badge: "bg-[hsl(210_60%_55%/0.15)] text-[hsl(210_60%_65%)]", accent: "hsl(210 60% 55%)", glow: "shadow-[0_0_8px_hsl(210_60%_55%/0.2)]" },
};

const ICON_MAP: Record<string, LucideIcon> = {
  Target, TrendingUp, Clock, AlertTriangle, Calendar, Users,
  DollarSign, Zap, Briefcase, Headphones, Bell, ExternalLink, Receipt,
};

const URGENCY_STYLES: Record<string, string> = {
  critical: "border-l-[hsl(0_70%_55%)] bg-[hsl(0_70%_55%/0.04)]",
  high: "border-l-[hsl(38_85%_58%)] bg-[hsl(38_85%_58%/0.02)]",
  medium: "border-l-[hsl(210_60%_55%)] bg-transparent",
  low: "border-l-transparent bg-transparent",
};

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
}

export const NotificationCenter = ({ open, onClose }: NotificationCenterProps) => {
  const { notifications, unreadCount, criticalCount, markRead, markAllRead, dismiss } = useNotifications();
  const [filter, setFilter] = useState<string | null>(null);
  const [signalFilter, setSignalFilter] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let items = notifications;
    if (filter) items = items.filter(n => n.domain === filter);
    if (signalFilter) items = items.filter(n => n.signalType === signalFilter);
    return items;
  }, [notifications, filter, signalFilter]);

  const handleAction = (n: UnifiedNotification) => {
    markRead(n.id);
    if (n.targetApp && n.targetModule) {
      window.dispatchEvent(new CustomEvent("sita-launch-app", { detail: { appId: n.targetApp } }));
      setTimeout(() => crossNavigate(n.targetApp!, n.targetModule!), 200);
      onClose();
    }
  };

  const domains = [
    { key: "business", label: "Business", icon: Briefcase },
    { key: "finance", label: "Finance", icon: DollarSign },
    { key: "concierge", label: "Concierge", icon: Headphones },
    { key: "cross-os", label: "Cross-OS", icon: Zap },
    { key: "security", label: "Security", icon: Shield },
  ];

  const signalTypes = [
    { key: "alert", label: "Alerts" },
    { key: "insight", label: "Insights" },
    { key: "action", label: "Actions" },
    { key: "info", label: "Info" },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[180] bg-black/40 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed top-0 right-0 bottom-0 z-[181] w-full max-w-[420px] bg-[hsl(220_15%_7%)] border-l border-[hsl(0_0%_100%/0.08)] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(0_0%_100%/0.06)]">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Bell className="h-5 w-5 text-[hsl(0_0%_100%/0.7)]" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 rounded-full bg-[hsl(0_70%_55%)] text-white text-[9px] font-bold flex items-center justify-center px-1">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-[13px] font-bold text-[hsl(0_0%_100%/0.85)]">Unified Notifications</h2>
                  <p className="text-[10px] text-[hsl(0_0%_100%/0.35)]">
                    {criticalCount > 0 ? `${criticalCount} critical` : "All systems nominal"} · {unreadCount} unread
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={markAllRead}
                  className="text-[10px] text-[hsl(0_0%_100%/0.4)] hover:text-[hsl(0_0%_100%/0.7)] flex items-center gap-1 px-2 py-1 rounded-md hover:bg-[hsl(0_0%_100%/0.06)] transition-colors"
                >
                  <CheckCheck className="h-3 w-3" /> All read
                </button>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[hsl(0_0%_100%/0.06)] transition-colors">
                  <X className="h-4 w-4 text-[hsl(0_0%_100%/0.4)]" />
                </button>
              </div>
            </div>

            {/* Domain filters */}
            <div className="px-4 py-2.5 border-b border-[hsl(0_0%_100%/0.04)] space-y-2">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setFilter(null)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors shrink-0",
                    !filter ? "bg-[hsl(0_0%_100%/0.12)] text-[hsl(0_0%_100%/0.8)]" : "text-[hsl(0_0%_100%/0.35)] hover:text-[hsl(0_0%_100%/0.6)]"
                  )}
                >
                  All
                </button>
                {domains.map(d => {
                  const count = notifications.filter(n => !n.read && n.domain === d.key).length;
                  return (
                    <button
                      key={d.key}
                      onClick={() => setFilter(filter === d.key ? null : d.key)}
                      className={cn(
                        "flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors shrink-0",
                        filter === d.key
                          ? `${DOMAIN_COLORS[d.key]?.badge}`
                          : "text-[hsl(0_0%_100%/0.35)] hover:text-[hsl(0_0%_100%/0.6)]"
                      )}
                    >
                      <d.icon size={10} />
                      {d.label}
                      {count > 0 && <span className="text-[8px] opacity-60">({count})</span>}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-1">
                {signalTypes.map(s => (
                  <button
                    key={s.key}
                    onClick={() => setSignalFilter(signalFilter === s.key ? null : s.key)}
                    className={cn(
                      "px-2 py-0.5 rounded text-[9px] font-medium transition-colors",
                      signalFilter === s.key
                        ? "bg-[hsl(0_0%_100%/0.1)] text-[hsl(0_0%_100%/0.7)]"
                        : "text-[hsl(0_0%_100%/0.25)] hover:text-[hsl(0_0%_100%/0.5)]"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notification list */}
            <div className="flex-1 overflow-y-auto px-3 py-2">
              {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-[hsl(0_0%_100%/0.25)]">
                  <Bell className="h-8 w-8 mb-3 opacity-30" />
                  <p className="text-[12px] font-medium">All caught up!</p>
                  <p className="text-[10px] mt-1 opacity-60">No notifications in this filter</p>
                </div>
              )}
              <AnimatePresence>
                {filtered.map(n => {
                  const DomainIcon = (n.iconName ? ICON_MAP[n.iconName] : null) || DOMAIN_ICONS[n.domain] || Bell;
                  const colors = DOMAIN_COLORS[n.domain] || DOMAIN_COLORS.system;

                  return (
                    <motion.div
                      key={n.id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 60 }}
                      className={cn(
                        "group relative flex items-start gap-3 px-3 py-3 rounded-xl mb-1.5 transition-all duration-200 cursor-pointer border-l-2",
                        URGENCY_STYLES[n.urgency],
                        n.read ? "opacity-50 hover:opacity-70" : "hover:bg-[hsl(0_0%_100%/0.03)]",
                        n.urgency === "critical" && !n.read && colors.glow
                      )}
                      onClick={() => handleAction(n)}
                    >
                      {/* Unread dot */}
                      {!n.read && <div className="absolute left-0.5 top-4 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.accent }} />}

                      {/* Domain icon */}
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: `${colors.accent}15` }}
                      >
                        <DomainIcon size={14} style={{ color: colors.accent }} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider", colors.badge)}>
                            {n.domain === "cross-os" ? "CROSS" : n.domain.slice(0, 3)}
                          </span>
                          {n.signalType && n.signalType !== "info" && (
                            <span className="text-[8px] font-medium text-[hsl(0_0%_100%/0.25)] uppercase">{n.signalType}</span>
                          )}
                        </div>
                        <p className="text-[12px] font-semibold text-[hsl(0_0%_100%/0.85)]">{n.title}</p>
                        <p className="text-[11px] text-[hsl(0_0%_100%/0.45)] mt-0.5 line-clamp-2">{n.body}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[9px] text-[hsl(0_0%_100%/0.25)]">{new Date(n.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
                          {n.targetApp && n.targetModule && (
                            <span className="text-[9px] font-medium flex items-center gap-0.5" style={{ color: colors.accent }}>
                              <ExternalLink size={8} />
                              Open in {n.targetApp}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        {!n.read && (
                          <button
                            onClick={e => { e.stopPropagation(); markRead(n.id); }}
                            className="p-1 rounded hover:bg-[hsl(0_0%_100%/0.06)]"
                            title="Mark read"
                          >
                            <Check className="h-3 w-3 text-[hsl(0_0%_100%/0.4)]" />
                          </button>
                        )}
                        <button
                          onClick={e => { e.stopPropagation(); dismiss(n.id); }}
                          className="p-1 rounded hover:bg-[hsl(0_0%_100%/0.06)]"
                          title="Dismiss"
                        >
                          <X className="h-3 w-3 text-[hsl(0_0%_100%/0.4)]" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Footer — intelligence summary */}
            <div className="px-4 py-3 border-t border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)]">
              <div className="flex items-center gap-2">
                <Zap size={11} className="text-[hsl(210_60%_55%)]" />
                <p className="text-[10px] text-[hsl(0_0%_100%/0.35)]">
                  <span className="font-semibold text-[hsl(0_0%_100%/0.5)]">Cross-OS Intelligence</span> — {
                    notifications.filter(n => n.domain === "cross-os" && !n.read).length
                  } active signals bridging your apps
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationCenter;
