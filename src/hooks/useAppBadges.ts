// ═══════════════════════════════════════════════════════════════
// SITA OS — App Badge Counts Hook
// Maps domain notifications to app-level badge counts
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";

interface AppBadge {
  appId: string;
  count: number;
  urgency: "low" | "medium" | "high" | "critical";
}

// Domain → app ID mapping
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

// Demo badge data
const DEMO_BADGES: AppBadge[] = [
  { appId: "sita-business-center", count: 3, urgency: "medium" },
  { appId: "sita-money-center", count: 2, urgency: "high" },
  { appId: "sita-concierge", count: 5, urgency: "low" },
  { appId: "sita-crm", count: 7, urgency: "medium" },
  { appId: "sita-email", count: 12, urgency: "low" },
  { appId: "sita-daily-pulse", count: 1, urgency: "medium" },
  { appId: "sita-vault", count: 1, urgency: "critical" },
];

export function useAppBadges() {
  const [badges, setBadges] = useState<Map<string, AppBadge>>(new Map());

  useEffect(() => {
    // Initialize with demo data
    const map = new Map<string, AppBadge>();
    DEMO_BADGES.forEach(b => map.set(b.appId, b));
    setBadges(map);
  }, []);

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
