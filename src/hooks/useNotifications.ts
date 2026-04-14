// ═══════════════════════════════════════════════════════════════
// useNotifications — Persisted notification hook with realtime
// Falls back to demo data when user is not authenticated
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { LucideIcon } from "lucide-react";

export interface UnifiedNotification {
  id: string;
  domain: "business" | "finance" | "concierge" | "cross-os" | "system";
  title: string;
  body: string;
  urgency: "low" | "medium" | "high" | "critical";
  read: boolean;
  dismissed: boolean;
  targetApp?: "business" | "finance" | "concierge";
  targetModule?: string;
  signalType?: "insight" | "alert" | "action" | "info";
  iconName?: string;
  createdAt: string;
}

const URGENCY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

function sortNotifications(items: UnifiedNotification[]): UnifiedNotification[] {
  return [...items].sort((a, b) => {
    if (a.read !== b.read) return a.read ? 1 : -1;
    const urgDiff = (URGENCY_ORDER[a.urgency] ?? 3) - (URGENCY_ORDER[b.urgency] ?? 3);
    if (urgDiff !== 0) return urgDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

// Demo notifications for non-authenticated users
function getDemoNotifications(): UnifiedNotification[] {
  const now = new Date().toISOString();
  return sortNotifications([
    { id: "demo-1", domain: "business", title: "New lead scored 91", body: "Emily Park — ready for demo", urgency: "high", read: false, dismissed: false, targetApp: "business", targetModule: "leads", signalType: "alert", iconName: "Target", createdAt: now },
    { id: "demo-2", domain: "finance", title: "Invoice 90+ days overdue", body: "DataFlow Systems — $5,400 at risk", urgency: "critical", read: false, dismissed: false, targetApp: "finance", targetModule: "receivables", signalType: "alert", iconName: "AlertTriangle", createdAt: now },
    { id: "demo-3", domain: "business", title: "Proposal viewed 3×", body: "Sarah Chen — high intent signal", urgency: "medium", read: false, dismissed: false, targetApp: "business", targetModule: "quotes", signalType: "insight", iconName: "TrendingUp", createdAt: now },
    { id: "demo-4", domain: "finance", title: "Cash stress ahead", body: "Projected shortfall in 12 days", urgency: "high", read: false, dismissed: false, targetApp: "finance", targetModule: "cash-timing", signalType: "alert", iconName: "DollarSign", createdAt: now },
    { id: "demo-5", domain: "concierge", title: "Appointment prep needed", body: "Dentist Thursday — insurance cards", urgency: "medium", read: false, dismissed: false, targetApp: "concierge", targetModule: "appointments", signalType: "action", iconName: "Calendar", createdAt: now },
    { id: "demo-6", domain: "cross-os", title: "Business → Finance", body: "Large deal closing ($45K) — update cash forecast", urgency: "medium", read: false, dismissed: false, targetApp: "finance", targetModule: "cash-timing", signalType: "insight", iconName: "Zap", createdAt: now },
    { id: "demo-7", domain: "cross-os", title: "Finance → Business", body: "Overdue invoice affects client health score", urgency: "high", read: false, dismissed: false, targetApp: "business", targetModule: "crm-health", signalType: "alert", iconName: "Zap", createdAt: now },
    { id: "demo-8", domain: "business", title: "Follow-up overdue", body: "2 contacts not reached in 14+ days", urgency: "high", read: false, dismissed: false, targetApp: "business", targetModule: "follow-through", signalType: "action", iconName: "Clock", createdAt: now },
    { id: "demo-9", domain: "finance", title: "Tax payment reminder", body: "Quarterly estimate due — $4,200", urgency: "medium", read: false, dismissed: false, targetApp: "finance", targetModule: "tax", signalType: "action", iconName: "Calendar", createdAt: now },
    { id: "demo-10", domain: "concierge", title: "Errand completed", body: "Package pickup confirmed", urgency: "low", read: true, dismissed: false, targetApp: "concierge", targetModule: "errands", signalType: "info", createdAt: now },
    { id: "demo-11", domain: "cross-os", title: "Concierge → Business", body: "Client meeting tomorrow — prep CRM", urgency: "medium", read: false, dismissed: false, targetApp: "business", targetModule: "crm-contacts", signalType: "action", iconName: "Users", createdAt: now },
    { id: "demo-12", domain: "system", title: "Advisor learning update", body: "Business advisor completed 12 new observations", urgency: "low", read: true, dismissed: false, signalType: "info", createdAt: now },
  ]);
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<UnifiedNotification[]>(() => getDemoNotifications());
  const [userId, setUserId] = useState<string | null>(null);

  // Check auth
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, []);

  // Load from DB if authenticated
  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("dismissed", false)
        .order("created_at", { ascending: false })
        .limit(50);

      if (data && data.length > 0) {
        setNotifications(sortNotifications(data.map(r => ({
          id: r.id,
          domain: (r.domain || "system") as UnifiedNotification["domain"],
          title: r.title,
          body: r.body || "",
          urgency: (r.urgency || "medium") as UnifiedNotification["urgency"],
          read: r.read,
          dismissed: (r as any).dismissed ?? false,
          targetApp: (r as any).target_app as any,
          targetModule: (r as any).target_module as any,
          signalType: ((r as any).signal_type || "info") as any,
          iconName: (r as any).icon_name,
          createdAt: r.created_at,
        }))));
      }
    };
    load();

    // Realtime subscription
    const channel = supabase
      .channel("notifications-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` }, (payload) => {
        if (payload.eventType === "INSERT") {
          const r = payload.new as any;
          setNotifications(prev => sortNotifications([{
            id: r.id, domain: r.domain || "system", title: r.title, body: r.body || "",
            urgency: r.urgency || "medium", read: r.read, dismissed: r.dismissed ?? false,
            targetApp: r.target_app, targetModule: r.target_module,
            signalType: r.signal_type || "info", iconName: r.icon_name, createdAt: r.created_at,
          }, ...prev]));
        } else if (payload.eventType === "UPDATE") {
          const r = payload.new as any;
          setNotifications(prev => {
            if (r.dismissed) return prev.filter(n => n.id !== r.id);
            return sortNotifications(prev.map(n => n.id === r.id ? { ...n, read: r.read, dismissed: r.dismissed ?? false } : n));
          });
        } else if (payload.eventType === "DELETE") {
          setNotifications(prev => prev.filter(n => n.id !== (payload.old as any).id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const markRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    if (userId && !id.startsWith("demo-")) {
      supabase.from("notifications").update({ read: true }).eq("id", id).then();
    }
  }, [userId]);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    if (userId) {
      supabase.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false).then();
    }
  }, [userId]);

  const dismiss = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (userId && !id.startsWith("demo-")) {
      supabase.from("notifications").update({ dismissed: true } as any).eq("id", id).then();
    }
  }, [userId]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);
  const criticalCount = useMemo(() => notifications.filter(n => !n.read && n.urgency === "critical").length, [notifications]);

  return { notifications, unreadCount, criticalCount, markRead, markAllRead, dismiss };
}
