// ═══════════════════════════════════════════════════════════════
// SITA OS — Interaction Tracker
// Invisible shell-level component that captures behavioral signals
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAdaptivePersonalization } from "@/hooks/use-adaptive-personalization";
import { ambientContext } from "@/lib/services/ambient-context-engine";

export const InteractionTracker = () => {
  const location = useLocation();
  const { trackInteraction, preferences } = useAdaptivePersonalization();
  const lastPath = useRef(location.pathname);
  const enterTime = useRef(Date.now());

  // Track page navigation
  useEffect(() => {
    const now = Date.now();
    const dwellMs = now - enterTime.current;
    const prevPath = lastPath.current;

    // Report dwell on previous page
    if (dwellMs > 2000 && prevPath !== location.pathname) {
      trackInteraction({
        type: "dwell",
        surface: prevPath.split("/").filter(Boolean)[0] || "home",
        metadata: { path: prevPath, dwellMs, scrollDepth: getScrollDepth() },
      });
      // Feed dwell to ambient context engine
      ambientContext.trackDwell(prevPath, dwellMs);
    }

    // Report navigation to new page
    const surface = location.pathname.split("/").filter(Boolean)[0] || "home";
    trackInteraction({
      type: "navigation",
      surface,
      metadata: { path: location.pathname, from: prevPath },
    });

    // Feed navigation to ambient context engine
    ambientContext.trackPageVisit(location.pathname, surface);

    lastPath.current = location.pathname;
    enterTime.current = now;
  }, [location.pathname]);

  // Track sidebar/command palette clicks via event delegation
  useEffect(() => {
    if (preferences.privacyMode) return;

    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Detect sidebar nav clicks
      const sidebarLink = target.closest("[data-sidebar-item]");
      if (sidebarLink) {
        trackInteraction({
          type: "click",
          surface: "sidebar",
          metadata: { item: sidebarLink.getAttribute("data-sidebar-item") },
        });
      }

      // Detect command palette usage
      const cmdItem = target.closest("[data-command-item]");
      if (cmdItem) {
        trackInteraction({
          type: "command-palette",
          surface: "command",
          metadata: { item: cmdItem.getAttribute("data-command-item") },
        });
      }
    };

    document.addEventListener("click", handler, { passive: true });
    return () => document.removeEventListener("click", handler);
  }, [preferences.privacyMode, trackInteraction]);

  return null; // Invisible component
};

function getScrollDepth(): number {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollHeight <= 0) return 0;
  return Math.min(1, scrollTop / scrollHeight);
}
