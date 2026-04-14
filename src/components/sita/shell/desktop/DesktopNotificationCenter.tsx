// ═══════════════════════════════════════════════════════════════
// SITA OS — Desktop Notification Center (Unified Cross-OS)
// Aggregates alerts from Business, Finance, Concierge into
// one prioritized feed with domain colors, urgency, deep-linking
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, CheckCheck, ChevronRight, Briefcase, DollarSign,
  Headphones, Zap, Target, TrendingUp, Clock, AlertTriangle,
  Calendar, Users, ExternalLink, Check, X, Receipt
} from "lucide-react";
import { cn } from "@/lib/utils";
import { crossNavigate } from "@/lib/engines/cross-os-integration";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import type { LucideIcon } from "lucide-react";

// ── Data model (shared with NotificationCenter) ─────────────

interface UnifiedNotification {
  id: string;
  domain: "business" | "finance" | "concierge" | "cross-os" | "system";
  title: string;
  body: string;
  time: string;
  read: boolean;
  urgency: "low" | "medium" | "high" | "critical";
  targetApp?: "business" | "finance" | "concierge";
  targetModule?: string;
  icon?: LucideIcon;
  signalType?: "insight" | "alert" | "action" | "info";
}

const URGENCY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

const DOMAIN_META: Record<string, { icon: LucideIcon; color: string; label: string }> = {
  business:  { icon: Briefcase,  color: "hsl(265 55% 58%)", label: "BIZ" },
  finance:   { icon: DollarSign, color: "hsl(152 55% 48%)", label: "FIN" },
  concierge: { icon: Headphones, color: "hsl(285 55% 55%)", label: "CON" },
  "cross-os":{ icon: Zap,        color: "hsl(210 60% 55%)", label: "X-OS" },
  system:    { icon: Bell,       color: "hsl(0 0% 50%)",    label: "SYS" },
};

const URGENCY_BORDER: Record<string, string> = {
  critical: "border-l-[hsl(0_70%_55%)]",
  high:     "border-l-[hsl(38_85%_58%)]",
  medium:   "border-l-[hsl(210_60%_55%)]",
  low:      "border-l-transparent",
};

// ── Notification generator (archetype-aware) ────────────────

function generateNotifications(_primaryMode: string): UnifiedNotification[] {
  const base: UnifiedNotification[] = [
    // Business
    { id: "dn-biz-1", domain: "business", title: "New lead scored 91", body: "Emily Park — ready for demo", time: "3m", read: false, urgency: "high", targetApp: "business", targetModule: "leads", icon: Target, signalType: "alert" },
    { id: "dn-biz-2", domain: "business", title: "Proposal viewed 3×", body: "Sarah Chen — high intent signal", time: "1h", read: false, urgency: "medium", targetApp: "business", targetModule: "quotes", icon: TrendingUp, signalType: "insight" },
    { id: "dn-biz-3", domain: "business", title: "Follow-up overdue", body: "2 contacts not reached in 14+ days", time: "2h", read: false, urgency: "high", targetApp: "business", targetModule: "follow-through", icon: Clock, signalType: "action" },

    // Finance
    { id: "dn-fin-1", domain: "finance", title: "Invoice 90+ days overdue", body: "DataFlow Systems — $5,400 at risk", time: "1h", read: false, urgency: "critical", targetApp: "finance", targetModule: "receivables", icon: AlertTriangle, signalType: "alert" },
    { id: "dn-fin-2", domain: "finance", title: "Cash stress ahead", body: "Projected shortfall in 12 days", time: "4h", read: false, urgency: "high", targetApp: "finance", targetModule: "cash-timing", icon: DollarSign, signalType: "alert" },
    { id: "dn-fin-3", domain: "finance", title: "Tax payment reminder", body: "Quarterly estimate due — $4,200", time: "1d", read: false, urgency: "medium", targetApp: "finance", targetModule: "tax", icon: Calendar, signalType: "action" },

    // Concierge
    { id: "dn-con-1", domain: "concierge", title: "Appointment prep needed", body: "Dentist Thursday — insurance cards", time: "6h", read: false, urgency: "medium", targetApp: "concierge", targetModule: "appointments", icon: Calendar, signalType: "action" },
    { id: "dn-con-2", domain: "concierge", title: "Errand completed", body: "Package pickup confirmed", time: "2h", read: true, urgency: "low", targetApp: "concierge", targetModule: "errands", signalType: "info" },

    // Cross-OS intelligence
    { id: "dn-xos-1", domain: "cross-os", title: "Business → Finance", body: "Large deal closing ($45K) — update cash forecast", time: "30m", read: false, urgency: "medium", targetApp: "finance", targetModule: "cash-timing", icon: Zap, signalType: "insight" },
    { id: "dn-xos-2", domain: "cross-os", title: "Finance → Business", body: "Overdue invoice affects client health score", time: "2h", read: false, urgency: "high", targetApp: "business", targetModule: "crm-health", icon: Zap, signalType: "alert" },
    { id: "dn-xos-3", domain: "cross-os", title: "Concierge → Business", body: "Client meeting tomorrow — prep CRM", time: "5h", read: false, urgency: "medium", targetApp: "business", targetModule: "crm-contacts", icon: Users, signalType: "action" },
  ];

  return base.sort((a, b) => {
    if (a.read !== b.read) return a.read ? 1 : -1;
    return (URGENCY_ORDER[a.urgency] ?? 3) - (URGENCY_ORDER[b.urgency] ?? 3);
  });
}

// ── Component ───────────────────────────────────────────────

const MAX_VISIBLE = 5;

interface Props {
  visible: boolean;
  onOpenFullPanel?: () => void;
}

export function DesktopNotificationCenter({ visible, onOpenFullPanel }: Props) {
  const { primaryMode } = useBusinessProfile();
  const [notifications, setNotifications] = useState(() => generateNotifications(primaryMode));
  const [filter, setFilter] = useState<string | null>(null);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);
  const criticalCount = useMemo(() => notifications.filter(n => !n.read && n.urgency === "critical").length, [notifications]);

  const filtered = useMemo(() => {
    let items = notifications;
    if (filter) items = items.filter(n => n.domain === filter);
    return items.slice(0, MAX_VISIBLE);
  }, [notifications, filter]);

  const markRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const handleAction = useCallback((n: UnifiedNotification) => {
    markRead(n.id);
    if (n.targetApp && n.targetModule) {
      window.dispatchEvent(new CustomEvent("sita-launch-app", { detail: { appId: n.targetApp } }));
      setTimeout(() => crossNavigate(n.targetApp!, n.targetModule!), 200);
    }
  }, [markRead]);

  if (!visible) return null;

  const domainFilters = [
    { key: null, label: "All" },
    { key: "business", label: "Biz", icon: Briefcase },
    { key: "finance", label: "Fin", icon: DollarSign },
    { key: "concierge", label: "Con", icon: Headphones },
    { key: "cross-os", label: "X-OS", icon: Zap },
  ];

  return (
    <div className="hidden w-[360px] shrink-0 xl:block">
      <div className="sticky top-20 rounded-[28px] border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_8%/0.75)] backdrop-blur-2xl p-5 shadow-[0_20px_80px_rgba(0,0,0,0.28)]">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Bell className="h-4 w-4 text-[hsl(0_0%_100%/0.6)]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-3.5 rounded-full bg-[hsl(0_70%_55%)] text-[hsl(0_0%_100%)] text-[8px] font-bold flex items-center justify-center px-0.5">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <div className="text-[13px] font-semibold text-[hsl(0_0%_100%/0.85)]">Notification Center</div>
              <div className="text-[9px] text-[hsl(0_0%_100%/0.35)]">
                {criticalCount > 0 ? `${criticalCount} critical · ` : ""}{unreadCount} unread across all apps
              </div>
            </div>
          </div>
          <button
            onClick={markAllRead}
            className="text-[9px] text-[hsl(0_0%_100%/0.3)] hover:text-[hsl(0_0%_100%/0.6)] flex items-center gap-1 px-1.5 py-0.5 rounded-md hover:bg-[hsl(0_0%_100%/0.06)] transition-colors"
          >
            <CheckCheck className="h-3 w-3" /> All read
          </button>
        </div>

        {/* Domain filter pills */}
        <div className="flex items-center gap-1 mb-3 overflow-x-auto scrollbar-none">
          {domainFilters.map(d => (
            <button
              key={d.key ?? "all"}
              onClick={() => setFilter(d.key)}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-semibold transition-colors shrink-0",
                filter === d.key
                  ? "bg-[hsl(0_0%_100%/0.12)] text-[hsl(0_0%_100%/0.8)]"
                  : "text-[hsl(0_0%_100%/0.3)] hover:text-[hsl(0_0%_100%/0.55)]"
              )}
            >
              {d.icon && <d.icon size={9} />}
              {d.label}
            </button>
          ))}
        </div>

        {/* Notification feed */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((n) => {
              const meta = DOMAIN_META[n.domain] || DOMAIN_META.system;
              const Icon = n.icon || meta.icon;

              return (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 40, scale: 0.95 }}
                  transition={{ type: "spring", mass: 0.6, stiffness: 200, damping: 20 }}
                  className={cn(
                    "group relative rounded-2xl border-l-[3px] border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_5%/0.5)] p-3.5 cursor-pointer transition-all duration-200",
                    "hover:bg-[hsl(0_0%_100%/0.04)] hover:border-[hsl(0_0%_100%/0.1)]",
                    URGENCY_BORDER[n.urgency],
                    n.read && "opacity-45",
                    n.urgency === "critical" && !n.read && "shadow-[0_0_12px_hsl(0_70%_55%/0.1)]"
                  )}
                  onClick={() => handleAction(n)}
                >
                  {/* Unread dot */}
                  {!n.read && (
                    <div
                      className="absolute top-3 left-[-7px] w-2 h-2 rounded-full ring-2 ring-[hsl(0_0%_8%)]"
                      style={{ backgroundColor: meta.color }}
                    />
                  )}

                  <div className="flex items-start gap-3">
                    {/* Domain icon */}
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: `${meta.color}15` }}
                    >
                      <Icon size={14} style={{ color: meta.color }} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span
                          className="text-[7px] font-bold px-1.5 py-[1px] rounded uppercase tracking-[0.15em]"
                          style={{ backgroundColor: `${meta.color}18`, color: meta.color }}
                        >
                          {meta.label}
                        </span>
                        {n.signalType && n.signalType !== "info" && (
                          <span className="text-[7px] font-medium text-[hsl(0_0%_100%/0.2)] uppercase">{n.signalType}</span>
                        )}
                        <span className="ml-auto text-[8px] text-[hsl(0_0%_100%/0.2)]">{n.time}</span>
                      </div>
                      <p className="text-[11px] font-semibold text-[hsl(0_0%_100%/0.8)] leading-snug">{n.title}</p>
                      <p className="text-[10px] text-[hsl(0_0%_100%/0.4)] mt-0.5 line-clamp-1">{n.body}</p>

                      {/* Deep-link action */}
                      {n.targetApp && n.targetModule && (
                        <div className="flex items-center gap-1 mt-1.5">
                          <ExternalLink size={8} style={{ color: meta.color }} />
                          <span className="text-[9px] font-medium" style={{ color: meta.color }}>
                            Open in {n.targetApp}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Hover actions */}
                    <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      {!n.read && (
                        <button
                          onClick={e => { e.stopPropagation(); markRead(n.id); }}
                          className="p-1 rounded hover:bg-[hsl(0_0%_100%/0.08)]"
                          title="Mark read"
                        >
                          <Check className="h-2.5 w-2.5 text-[hsl(0_0%_100%/0.35)]" />
                        </button>
                      )}
                      <button
                        onClick={e => { e.stopPropagation(); dismiss(n.id); }}
                        className="p-1 rounded hover:bg-[hsl(0_0%_100%/0.08)]"
                        title="Dismiss"
                      >
                        <X className="h-2.5 w-2.5 text-[hsl(0_0%_100%/0.35)]" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center py-8 text-[hsl(0_0%_100%/0.2)]">
              <Bell className="h-6 w-6 mb-2 opacity-30" />
              <p className="text-[10px] font-medium">All caught up</p>
            </div>
          )}
        </div>

        {/* View all footer */}
        {notifications.length > MAX_VISIBLE && (
          <button
            onClick={() => onOpenFullPanel?.()}
            className="w-full mt-3 flex items-center justify-center gap-1 text-[10px] font-semibold text-[hsl(0_0%_100%/0.35)] hover:text-[hsl(0_0%_100%/0.6)] py-2 rounded-xl hover:bg-[hsl(0_0%_100%/0.04)] transition-colors"
          >
            View all {notifications.length} notifications <ChevronRight size={10} />
          </button>
        )}
      </div>
    </div>
  );
}
