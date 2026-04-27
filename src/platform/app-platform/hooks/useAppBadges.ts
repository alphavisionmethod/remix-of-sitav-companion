import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AppBadge {
  appId: string;
  count: number;
  urgency: "low" | "medium" | "high" | "critical";
}

const DOMAIN_APP_MAP: Record<string, string> = {
  business: "sita-business-center",
  finance: "sita-money-center",
  concierge: "sita-concierge",
  security: "sita-vault",
  health: "sita-health",
  email: "sita-email",
  calendar: "sita-daily-pulse",
  crm: "sita-crm",
  ai: "sita-ai-workforce",
};

const BADGES: AppBadge[] = [
  { appId: "sita-business-center", count: 3, urgency: "medium" },
  { appId: "sita-money-center", count: 2, urgency: "high" },
  { appId: "sita-concierge", count: 5, urgency: "low" },
  { appId: "sita-crm", count: 7, urgency: "medium" },
  { appId: "sita-email", count: 12, urgency: "low" },
  { appId: "sita-daily-pulse", count: 1, urgency: "medium" },
  { appId: "sita-vault", count: 1, urgency: "critical" },
];

const URGENCY_PRIORITY: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export function useAppBadges() {
  const [badges, setBadges] = useState<Map<string, AppBadge>>(new Map());
  const [userId, setUserId] = useState<string | null>(null);

  const fetchBadges = useCallback(async (uid: string) => {
    const { data, error } = await (supabase as any)
      .from("notifications")
      .select("domain, urgency")
      .eq("user_id", uid)
      .eq("read", false);

    if (error || !data) return;

    const grouped = new Map<string, { count: number; urgency: string }>();
    for (const row of data as any[]) {
      const domain = row.domain as string;
      if (!domain) continue;
      const existing = grouped.get(domain);
      if (existing) {
        existing.count++;
        if ((URGENCY_PRIORITY[row.urgency as string] || 0) > (URGENCY_PRIORITY[existing.urgency] || 0)) {
          existing.urgency = row.urgency as string;
        }
      } else {
        grouped.set(domain, { count: 1, urgency: (row.urgency as string) || "low" });
      }
    }

    const map = new Map<string, AppBadge>();
    for (const [domain, { count, urgency }] of grouped) {
      const appId = DOMAIN_APP_MAP[domain];
      if (appId) {
        map.set(appId, { appId, count, urgency: urgency as AppBadge["urgency"] });
      }
    }
    setBadges(map);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        fetchBadges(user.id);
      } else {
        const map = new Map<string, AppBadge>();
        BADGES.forEach(b => map.set(b.appId, b));
        setBadges(map);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        fetchBadges(session.user.id);
      } else {
        setUserId(null);
        const map = new Map<string, AppBadge>();
        BADGES.forEach(b => map.set(b.appId, b));
        setBadges(map);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchBadges]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("notification-badges")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchBadges(userId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchBadges]);

  const getBadge = useCallback((appId: string): AppBadge | undefined => {
    return badges.get(appId);
  }, [badges]);

  const clearBadge = useCallback((appId: string) => {
    setBadges(prev => {
      const next = new Map(prev);
      next.delete(appId);
      return next;
    });
  }, []);

  return { badges, getBadge, clearBadge };
}
