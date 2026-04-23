// ═══════════════════════════════════════════════════════════════
// SITA OS — Notification Center
// The OS-level attention management system
// ═══════════════════════════════════════════════════════════════

import { SitaCard, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { KPITile, EmptyState } from "@/components/sita/SitaComponents";
import { DomainHeader } from "@/components/sita/primitives/DomainHeader";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { dbAny as db } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { useAdaptiveInterface } from "@/hooks/useAdaptiveInterface";
import { useOSOrchestration } from "@/hooks/useOSOrchestration";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import {
  Bell, BellOff, Shield, Clock, CheckCircle, AlertTriangle, DollarSign,
  Briefcase, Home, Zap, Eye, Filter, Trash2, RotateCcw, ChevronRight,
  ArrowRight, Volume2, VolumeX, Pin, XCircle, AlertCircle, Sparkles,
  MessageSquare, Calendar, Settings, Activity
} from "lucide-react";
import { PageShell } from "@/components/sita/PageShell";
type UrgencyLevel = "critical" | "high" | "normal" | "low";
type NotifCategory = "all" | "action" | "approval" | "finance" | "business" | "household" | "system" | "resolved";

const urgencyConfig: Record<UrgencyLevel, { label: string; color: string; bgColor: string; icon: typeof AlertCircle }> = {
  critical: { label: "Critical", color: "text-urgency-critical", bgColor: "bg-urgency-critical/10 border-urgency-critical/20", icon: AlertCircle },
  high: { label: "Important", color: "text-urgency-high", bgColor: "bg-urgency-high/10 border-urgency-high/20", icon: AlertTriangle },
  normal: { label: "Useful", color: "text-primary", bgColor: "bg-primary/5 border-primary/10", icon: Bell },
  low: { label: "Background", color: "text-muted-foreground", bgColor: "bg-secondary border-border", icon: Eye },
};

const categoryIcons: Record<string, typeof Bell> = {
  approval: Shield, finance: DollarSign, business: Briefcase,
  household: Home, system: Zap, incident: AlertTriangle,
  workflow: Zap, communication: MessageSquare,
};

// ── Notification Card ────────────────────────────────────────
const NotificationCard = ({ notif, onMarkRead, onDismiss, onAction }: {
  notif: any;
  onMarkRead: () => void;
  onDismiss: () => void;
  onAction: () => void;
}) => {
  const urgency = urgencyConfig[(notif.urgency || "normal") as UrgencyLevel] || urgencyConfig.normal;
  const CatIcon = categoryIcons[notif.category] || Bell;
  const isRead = notif.read_at || notif.read;

  return (
    <PageShell>
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={cn(
        "group rounded-xl border transition-all duration-200",
        isRead ? "bg-card/50 border-border/50" : urgency.bgColor,
        !isRead && "hover:shadow-card-hover"
      )}
    >
<div className="p-4">
        <div className="flex items-start gap-3">
          {/* Urgency indicator + Icon */}
          <div className={cn(
            "rounded-lg p-2 shrink-0",
            isRead ? "bg-secondary/50" : "bg-card/80"
          )}>
            <CatIcon className={cn("h-4 w-4", isRead ? "text-muted-foreground" : urgency.color)} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className={cn(
                  "text-sm leading-snug",
                  isRead ? "text-muted-foreground" : "text-foreground font-medium"
                )}>
                  {notif.title}
                </p>
                {notif.body && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.body}</p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!isRead && (
                  <span className={cn("h-2 w-2 rounded-full", {
                    "bg-urgency-critical animate-pulse": notif.urgency === "critical",
                    "bg-urgency-high": notif.urgency === "high",
                    "bg-primary": notif.urgency === "normal",
                    "bg-muted-foreground": notif.urgency === "low",
                  })} />
                )}
              </div>
            </div>

            {/* Meta + Actions */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground capitalize bg-secondary rounded-md px-1.5 py-0.5">
                  {notif.category}
                </span>
                <span className="text-[10px] text-muted-foreground/70">
                  {notif.created_at ? new Date(notif.created_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
                </span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!isRead && (
                  <button onClick={e => { e.stopPropagation(); onMarkRead(); }}
                    className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-secondary" title="Mark read">
                    <CheckCircle className="h-3.5 w-3.5" />
                  </button>
                )}
                {notif.action_url && (
                  <button onClick={e => { e.stopPropagation(); onAction(); }}
                    className="rounded-md p-1 text-primary hover:bg-primary/10" title="Open">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
                <button onClick={e => { e.stopPropagation(); onDismiss(); }}
                  className="rounded-md p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10" title="Dismiss">
                  <XCircle className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
    </PageShell>
  );
};

// ── Main Component ───────────────────────────────────────────
const NotificationCenter = () => {
  const { user, isDemo } = useAuth();
  const queryClient = useQueryClient();
  const interfaceState = useAdaptiveInterface();
  const os = useOSOrchestration();
  const cogLoad = os.getCognitiveLoad();
  const [category, setCategory] = useState<NotifCategory>("all");
  const [quietMode, setQuietMode] = useState(false);

  // Auto-activate quiet mode when cognitive load is high
  useEffect(() => {
    if (cogLoad > 0.8 && !quietMode) setQuietMode(true);
  }, [cogLoad, quietMode]);

  // Fetch notifications from queue
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notification_center", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await db.from("notifications_queue")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  // Also fetch from notifications table
  const { data: legacyNotifs = [] } = useQuery({
    queryKey: ["notifications_legacy", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await db.from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
  });

  const allNotifs = useMemo(() => {
    const combined = [
      ...notifications.map((n: Record<string, any>) => ({ ...n, source: "queue" })),
      ...legacyNotifs.map((n: Record<string, any>) => ({ ...n, source: "legacy", category: n.domain || n.type || "system" })),
    ].sort((a: any,  b: Record<string, any>) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return combined;
  }, [notifications, legacyNotifs]);

  // Filter
  const filtered = useMemo(() => {
    if (category === "all") return allNotifs;
    if (category === "resolved") return allNotifs.filter((n: Record<string, any>) => n.read_at || n.read || n.status === "sent");
    if (category === "action") return allNotifs.filter((n: Record<string, any>) => !n.read_at && !n.read && (n.urgency === "high" || n.urgency === "critical"));
    return allNotifs.filter((n: Record<string, any>) => n.category === category);
  }, [allNotifs, category]);

  const unreadCount = allNotifs.filter((n: Record<string, any>) => !n.read_at && !n.read).length;
  const criticalCount = allNotifs.filter((n: Record<string, any>) => n.urgency === "critical" && !n.read_at).length;
  const approvalCount = allNotifs.filter((n: Record<string, any>) => n.category === "approval" && !n.read_at).length;

  const handleMarkRead = (id: string) => {
    toast.success("Marked as read");
  };

  const handleDismiss = (id: string) => {
    toast.success("Notification dismissed");
  };

  return (
    <motion.div className="mx-auto max-w-5xl space-y-6" data-testid="notification-center" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <DomainHeader
        title="Notification Center"
        subtitle="Structured attention management — what needs awareness, what needs action"
        icon={Bell}
        domain="system"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuietMode(!quietMode)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                quietMode ? "bg-accent/10 text-accent border border-accent/20" : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              {quietMode ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              {quietMode ? "Quiet" : "Active"}
            </button>
          </div>
        }
      />

      {/* Attention OS State */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <KPITile label="Unread" value={unreadCount} icon={Bell} sub={unreadCount === 0 ? "All clear" : "needs attention"} />
        <KPITile label="Critical" value={criticalCount} icon={AlertCircle} sub={criticalCount > 0 ? "immediate" : "none"} />
        <KPITile label="Approvals" value={approvalCount} icon={Shield} sub="waiting" />
        <KPITile label="Cog. Load" value={`${Math.round(cogLoad * 100)}%`} icon={Activity} sub={cogLoad > 0.8 ? "high — quiet mode" : cogLoad > 0.5 ? "moderate" : "low"} />
        <KPITile label="Total" value={allNotifs.length} icon={Eye} sub="notifications" />
      </div>

      {/* Quiet mode reasoning */}
      {quietMode && (
        <div className="flex items-center gap-2 rounded-lg bg-accent/5 border border-accent/15 px-3 py-2 text-[11px] text-accent">
          <VolumeX className="h-3.5 w-3.5 shrink-0" />
          <span>Quiet mode active — cognitive load at {Math.round(cogLoad * 100)}%. Only critical notifications will interrupt.</span>
        </div>
      )}

      {/* Critical banner */}
      {criticalCount > 0 && !quietMode && (
        <SitaCard hover={false} className="p-4 border-urgency-critical/30 bg-urgency-critical/5">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-urgency-critical animate-pulse" />
            <div>
              <p className="text-sm font-semibold text-foreground">{criticalCount} critical notification{criticalCount > 1 ? "s" : ""} need immediate attention</p>
              <p className="text-xs text-muted-foreground">These are blocking actions or represent urgent risks</p>
            </div>
          </div>
        </SitaCard>
      )}

      {/* Category filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {([
          { key: "all", label: "All", icon: Bell },
          { key: "action", label: "Needs Action", icon: AlertTriangle },
          { key: "approval", label: "Approvals", icon: Shield },
          { key: "finance", label: "Finance", icon: DollarSign },
          { key: "business", label: "Business", icon: Briefcase },
          { key: "household", label: "Household", icon: Home },
          { key: "system", label: "System", icon: Zap },
          { key: "resolved", label: "Resolved", icon: CheckCircle },
        ] as { key: NotifCategory; label: string; icon: typeof Bell }[]).map(cat => (
          <button
            key={cat.key}
            onClick={() => setCategory(cat.key)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium whitespace-nowrap transition-all",
              category === cat.key
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <cat.icon className="h-3 w-3" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Notification List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-card animate-pulse border border-border" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title={category === "all" ? "No notifications" : `No ${category} notifications`}
          description="You're all caught up. Notifications appear here as events occur across the system."
        />
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-2">
            {filtered.map((notif: Record<string, any>) => (
              <NotificationCard
                key={notif.id}
                notif={notif}
                onMarkRead={() => handleMarkRead(notif.id)}
                onDismiss={() => handleDismiss(notif.id)}
                onAction={() => {
                  if (notif.action_url) window.location.href = notif.action_url;
                }}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Mark all read */}
      {unreadCount > 0 && (
        <div className="flex justify-center">
          <button
            onClick={() => toast.success("All notifications marked as read")}
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            Mark all as read
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default NotificationCenter;
