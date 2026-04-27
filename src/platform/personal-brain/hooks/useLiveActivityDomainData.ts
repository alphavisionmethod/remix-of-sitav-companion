// ═══════════════════════════════════════════════════════════════
// SITA OS — Live Activity Domain Data Hook
// Registers domain-level activities to the LiveActivityBar
// ═══════════════════════════════════════════════════════════════

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { registerActivity, removeActivity, updateActivity } from "@/platform/sita/components/sita/shell/LiveActivityBar";
import { Briefcase, DollarSign, Headphones, FolderOpen } from "lucide-react";
import React from "react";

/** Domain activity counts — in production these come from queries */
function getDomainCounts(): Record<string, { label: string; sublabel: string; count: number }> {
  // Read from sessionStorage domain state for demo
  const biz = JSON.parse(sessionStorage.getItem("sita-app-state-business") || "{}");
  const money = JSON.parse(sessionStorage.getItem("sita-app-state-finance") || "{}");
  const concierge = JSON.parse(sessionStorage.getItem("sita-app-state-concierge") || "{}");

  return {
    business: {
      label: "Business OS",
      sublabel: biz.activePage ? `Active: ${biz.activePage}` : "8 follow-throughs due",
      count: 8,
    },
    finance: {
      label: "Money Center",
      sublabel: money.activePage ? `Active: ${money.activePage}` : "3 bills due soon",
      count: 3,
    },
    concierge: {
      label: "Concierge",
      sublabel: concierge.activePage ? `Active: ${concierge.activePage}` : "5 errands pending",
      count: 5,
    },
  };
}

const DOMAIN_ICONS: Record<string, React.ReactNode> = {
  business: React.createElement(Briefcase, { className: "w-3 h-3" }),
  finance: React.createElement(DollarSign, { className: "w-3 h-3" }),
  concierge: React.createElement(Headphones, { className: "w-3 h-3" }),
};

export function useLiveActivityDomainData() {
  const location = useLocation();

  useEffect(() => {
    // Determine current domain
    const path = location.pathname;
    let currentDomain: string | null = null;
    if (path.startsWith("/business")) currentDomain = "business";
    else if (path.startsWith("/money")) currentDomain = "finance";
    else if (path.startsWith("/concierge")) currentDomain = "concierge";

    if (!currentDomain) return;

    const counts = getDomainCounts();
    const info = counts[currentDomain];
    if (!info) return;

    // Register activity
    registerActivity({
      id: `domain-${currentDomain}`,
      type: "focus",
      label: info.label,
      sublabel: info.sublabel,
      icon: DOMAIN_ICONS[currentDomain],
      progress: undefined,
      onDismiss: () => removeActivity(`domain-${currentDomain}`),
    });

    // Update sublabel when sub-page changes
    const interval = setInterval(() => {
      const fresh = getDomainCounts();
      const freshInfo = fresh[currentDomain!];
      if (freshInfo) {
        updateActivity(`domain-${currentDomain}`, { sublabel: freshInfo.sublabel });
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      // Keep activity registered when leaving — it shows the app is "running"
    };
  }, [location.pathname]);
}
