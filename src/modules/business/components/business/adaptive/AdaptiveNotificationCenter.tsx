// ═══════════════════════════════════════════════════════════════
// Adaptive Notification Center
// Archetype-aware notification panel that ranks and displays
// notifications based on business relevance. Lives in the
// BusinessAppShell header.
// ═══════════════════════════════════════════════════════════════

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, X, ShoppingCart, Phone, Calendar, Receipt,
  FileText, TrendingUp, Users, AlertTriangle, Target,
  CheckCircle, Star, Bot, Crown, Activity, Clock,
  Heart, Package, RefreshCw, Mail, Shield, Zap,
} from "lucide-react";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { getIdentityLayer } from "@/domains/engines/business-identity-layers";
import {
  rankNotifications,
  generateDemoNotifications,
  type RankedNotification,
} from "@/domains/engines/adaptive-notification-engine";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  cart_abandoned: ShoppingCart, order_placed: Package, payment_received: CheckCircle,
  payment_failed: AlertTriangle, lead_new: Users, lead_stale: Clock,
  follow_up_due: Phone, deal_won: Star, deal_lost: TrendingUp, deal_stalled: Activity,
  appointment_upcoming: Calendar, appointment_noshow: AlertTriangle, appointment_cancelled: X,
  task_overdue: Target, task_completed: CheckCircle, task_assigned: Users,
  contact_at_risk: Heart, contact_churned: AlertTriangle, contact_reactivated: RefreshCw,
  invoice_overdue: Receipt, proposal_viewed: FileText, proposal_expired: Clock,
  review_new: Star, support_ticket: Mail, team_alert: Users,
  advisor_insight: Bot, boardroom_decision: Crown, profile_drift: Activity,
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-[hsl(var(--destructive))]/15 border-[hsl(var(--destructive))]/20",
  high: "bg-[hsl(var(--sita-gold))]/10 border-[hsl(var(--sita-gold))]/15",
  medium: "bg-[hsl(0_0%_100%/0.03)] border-[hsl(0_0%_100%/0.06)]",
  low: "bg-[hsl(0_0%_100%/0.02)] border-[hsl(0_0%_100%/0.04)]",
};

interface Props {
  onNavigate?: (action: string) => void;
}

export default function AdaptiveNotificationCenter({ onNavigate }: Props) {
  const { primaryMode, operatingFlags } = useBusinessProfile();
  const identity = getIdentityLayer(primaryMode);
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const rankedNotifications = useMemo(() => {
    const demos = generateDemoNotifications(primaryMode);
    const withReadState = demos.map(n => ({ ...n, read: readIds.has(n.id) }));
    return rankNotifications(withReadState, primaryMode, operatingFlags);
  }, [primaryMode, operatingFlags, readIds]);

  const unreadCount = rankedNotifications.filter(n => !n.read).length;

  const markRead = (id: string) => {
    setReadIds(prev => new Set([...prev, id]));
  };

  const markAllRead = () => {
    setReadIds(new Set(rankedNotifications.map(n => n.id)));
  };

  const timeAgo = (ts: string) => {
    const hours = (Date.now() - new Date(ts).getTime()) / (1000 * 60 * 60);
    if (hours < 1) return `${Math.round(hours * 60)}m ago`;
    if (hours < 24) return `${Math.round(hours)}h ago`;
    return `${Math.round(hours / 24)}d ago`;
  };

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative p-1.5 rounded-md hover:bg-[hsl(0_0%_100%/0.05)] transition-colors"
      >
        <Bell size={14} className="text-foreground/40" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-bold"
            style={{
              backgroundColor: `hsl(${identity.accentColor})`,
              color: "hsl(220 15% 6%)",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Notification panel */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[998]"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-[380px] max-h-[480px] z-[999] rounded-xl overflow-hidden"
              style={{
                background: "hsl(220 15% 8%)",
                border: `1px solid hsl(${identity.accentColor} / 0.12)`,
                boxShadow: `0 20px 50px -12px hsl(${identity.accentColor} / 0.1)`,
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(0_0%_100%/0.06)]">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-semibold text-foreground/70">Notifications</span>
                  {unreadCount > 0 && (
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `hsl(${identity.accentColor} / 0.15)`,
                        color: `hsl(${identity.accentColor})`,
                      }}
                    >
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="text-[9px] text-foreground/30 hover:text-foreground/60 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification list */}
              <div className="overflow-y-auto max-h-[420px] py-1">
                {rankedNotifications.map((notification, idx) => {
                  const Icon = CATEGORY_ICONS[notification.category] || Activity;
                  const severityClass = SEVERITY_COLORS[notification.severity] || SEVERITY_COLORS.low;

                  return (
                    <motion.button
                      key={notification.id}
                      type="button"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.02 }}
                      onClick={() => {
                        markRead(notification.id);
                        if (notification.actionUrl && onNavigate) {
                          onNavigate(notification.actionUrl);
                        }
                        setOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 flex gap-3 hover:bg-[hsl(0_0%_100%/0.03)] transition-colors ${
                        notification.read ? "opacity-50" : ""
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${severityClass}`}
                      >
                        <Icon size={12} className="text-foreground/60" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          {!notification.read && (
                            <div
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: `hsl(${identity.accentColor})` }}
                            />
                          )}
                          <span className="text-[11px] font-semibold text-foreground/70 truncate">
                            {notification.title}
                          </span>
                        </div>
                        <p className="text-[9px] text-foreground/30 truncate mt-0.5">
                          {notification.body}
                        </p>
                      </div>

                      <div className="flex flex-col items-end shrink-0">
                        <span className="text-[8px] text-foreground/20">
                          {timeAgo(notification.timestamp)}
                        </span>
                        {notification.archetypeBoost > 2 && (
                          <span
                            className="text-[7px] font-bold mt-0.5 px-1 rounded"
                            style={{
                              color: `hsl(${identity.accentColor})`,
                              backgroundColor: `hsl(${identity.accentColor} / 0.1)`,
                            }}
                          >
                            PRIORITY
                          </span>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
