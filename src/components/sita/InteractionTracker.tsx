// ═══════════════════════════════════════════════════════════════
// SITA OS — Interaction Tracker v2
// Event-driven clipboard, form tracking, selection, behavioral signals
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

    if (dwellMs > 2000 && prevPath !== location.pathname) {
      trackInteraction({
        type: "dwell",
        surface: prevPath.split("/").filter(Boolean)[0] || "home",
        metadata: { path: prevPath, dwellMs, scrollDepth: getScrollDepth() },
      });
      ambientContext.trackDwell(prevPath, dwellMs);
    }

    const surface = location.pathname.split("/").filter(Boolean)[0] || "home";
    trackInteraction({
      type: "navigation",
      surface,
      metadata: { path: location.pathname, from: prevPath },
    });

    ambientContext.trackPageVisit(location.pathname, surface);

    lastPath.current = location.pathname;
    enterTime.current = now;
  }, [location.pathname]);

  // Track sidebar/command palette clicks via event delegation
  useEffect(() => {
    if (preferences.privacyMode) return;

    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      const sidebarLink = target.closest("[data-sidebar-item]");
      if (sidebarLink) {
        trackInteraction({
          type: "click",
          surface: "sidebar",
          metadata: { item: sidebarLink.getAttribute("data-sidebar-item") },
        });
      }

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

  // Event-driven clipboard tracking (copy/cut)
  useEffect(() => {
    if (preferences.privacyMode) return;

    const handleCopy = () => {
      const selection = window.getSelection()?.toString() || "";
      if (selection) {
        ambientContext.trackClipboardEvent(selection, location.pathname);
      }
    };

    const handleCut = () => {
      const selection = window.getSelection()?.toString() || "";
      if (selection) {
        ambientContext.trackClipboardEvent(selection, location.pathname);
      }
    };

    document.addEventListener("copy", handleCopy, { passive: true });
    document.addEventListener("cut", handleCut, { passive: true });
    return () => {
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("cut", handleCut);
    };
  }, [preferences.privacyMode, location.pathname]);

  // Form input tracking via event delegation
  useEffect(() => {
    if (preferences.privacyMode) return;

    const handleInput = (e: Event) => {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement;
      if (!target || !("value" in target)) return;
      if (target.type === "password") return; // Never track passwords

      const name = target.name || target.id || target.getAttribute("data-field") || "";
      if (!name) return;

      ambientContext.trackFormField(location.pathname, name, target.value);
    };

    // Debounced to avoid flooding
    let timeout: ReturnType<typeof setTimeout>;
    const debouncedInput = (e: Event) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => handleInput(e), 500);
    };

    document.addEventListener("input", debouncedInput, { passive: true });
    return () => {
      document.removeEventListener("input", debouncedInput);
      clearTimeout(timeout);
    };
  }, [preferences.privacyMode, location.pathname]);

  // Selection tracking
  useEffect(() => {
    if (preferences.privacyMode) return;

    const handleSelectionChange = () => {
      const text = window.getSelection()?.toString() || "";
      if (text.length >= 5) {
        ambientContext.trackSelection(location.pathname, text);
      }
    };

    let timeout: ReturnType<typeof setTimeout>;
    const debouncedSelection = () => {
      clearTimeout(timeout);
      timeout = setTimeout(handleSelectionChange, 600);
    };

    document.addEventListener("selectionchange", debouncedSelection, { passive: true });
    return () => {
      document.removeEventListener("selectionchange", debouncedSelection);
      clearTimeout(timeout);
    };
  }, [preferences.privacyMode, location.pathname]);

  return null;
};

function getScrollDepth(): number {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollHeight <= 0) return 0;
  return Math.min(1, scrollTop / scrollHeight);
}
