// ═══════════════════════════════════════════════════════════════
// SITA OS — Desktop Page Wrapper
// Thin page wrapper wiring DesktopSurface to shell state
// ═══════════════════════════════════════════════════════════════

import { DesktopSurface } from "@/components/sita/shell/DesktopSurface";
import { useWindowLauncher } from "@/components/sita/shell/ShellWindowLayer";
import { useShellState } from "@/components/sita/shell/useShellState";
import { useAuth } from "@/contexts/AuthContext";
import { EnterpriseFlow } from "@/components/sita/EnterpriseFlow";
import { RestoreFlow } from "@/components/sita/RestoreFlow";
import { FirstWeekCalibration } from "@/components/sita/FirstWeekCalibration";
import { ContextualWelcomeTour } from "@/components/sita/onboarding/ContextualWelcomeTour";
import { DesktopNotifications } from "@/components/sita/DesktopNotifications";
import { CalmEngineProvider } from "@/contexts/CalmEngineContext";
import { useWindowManagerContext } from "@/contexts/WindowManagerContext";
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { ListChecks } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/** Read a simple JSON object from user_memory in localStorage (demo-safe). */
function useUserMemory(key: string): string | null {
  const [val, setVal] = useState<string | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("sita-user-memory");
      if (raw) {
        const parsed = JSON.parse(raw);
        setVal(parsed[key] ?? null);
      }
    } catch { /* noop */ }
  }, [key]);
  return val;
}

function setUserMemoryFlag(key: string, value: string) {
  try {
    const raw = localStorage.getItem("sita-user-memory") || "{}";
    const parsed = JSON.parse(raw);
    parsed[key] = value;
    localStorage.setItem("sita-user-memory", JSON.stringify(parsed));
  } catch { /* noop */ }
}

export default function DesktopPage() {
  const { user } = useAuth();
  const { state, openCommand } = useShellState();
  const [showEnterprise, setShowEnterprise] = useState(false);

  // S30 — First Desktop Welcome Tour
  const tourShown = useUserMemory("welcome_tour_shown");
  const onboardingDone = !!localStorage.getItem("sita-post-arrival-seen");
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    if (onboardingDone && tourShown !== "true") {
      // Small delay so desktop settles first
      const t = setTimeout(() => setShowTour(true), 1200);
      return () => clearTimeout(t);
    }
  }, [onboardingDone, tourShown]);

  const handleTourComplete = () => {
    setShowTour(false);
    setUserMemoryFlag("welcome_tour_shown", "true");
  };

  // S31 — Deferred items indicator
  const deferredRaw = useUserMemory("deferred_connections");
  const hasDeferredItems = deferredRaw && deferredRaw !== "[]" && deferredRaw !== "";

  // Build tour preferences from persisted setup state
  const tourPreferences = (() => {
    try {
      const raw = localStorage.getItem("sita-setup-state");
      if (raw) {
        const s = JSON.parse(raw);
        return {
          enabledDomains: s.enabledDomains || [],
          trustLevel: s.trustLevel || "balanced",
          painPoints: s.painPoints || s.quickIdentity?.painPoints || [],
          rituals: s.rituals || [],
          homeComposition: s.homeComposition || "",
        };
      }
    } catch { /* noop */ }
    return { enabledDomains: [], trustLevel: "balanced", painPoints: [], rituals: [], homeComposition: "" };
  })();

  // ── Calm Engine wiring (before early returns) ──────────────
  const wm = useWindowManagerContext();
  const { handleLaunchApp } = useWindowLauncher(wm as Parameters<typeof useWindowLauncher>[0]);
  const visibleWindows = wm?.visibleWindows ?? [];
  const maxZ = visibleWindows.reduce((max, w) => Math.max(max, w.zIndex), 0);

  const calmWindows = useMemo(() =>
    visibleWindows.map(w => ({
      id: w.id,
      x: w.position?.x ?? 120,
      y: w.position?.y ?? 80,
      width: w.width ?? 500,
      height: 400,
      isFocused: w.zIndex === maxZ,
      lastInteraction: Date.now(),
    })),
    [visibleWindows, maxZ]
  );

  const calmLayerState = useMemo(() => ({
    hasOverlay: false,
    hasNotification: (state.notifications?.urgent ?? 0) > 0,
    hasWindows: visibleWindows.length > 0,
  }), [visibleWindows.length, state.notifications?.urgent]);

  if (showEnterprise) {
    return (
      <EnterpriseFlow
        onBack={() => setShowEnterprise(false)}
        onComplete={() => setShowEnterprise(false)}
      />
    );
  }

  return (
    <CalmEngineProvider windows={calmWindows} layerState={calmLayerState}>
      <h1 className="sr-only">Desktop</h1>
      {/* Honest narrow-width disclosure — gated to <md (<768px). Desktop view is
          intentionally desktop-oriented; this banner avoids silent breakage on phones. */}
      <div
        role="note"
        aria-label="Narrow viewport notice"
        className="md:hidden fixed top-2 left-2 right-2 z-[200] rounded-md border border-border bg-card/95 backdrop-blur-sm px-3 py-2 text-[11px] text-muted-foreground shadow-sm"
      >
        <span className="font-medium text-foreground">Desktop view</span> — open on a wider screen for the full SITA workspace.
      </div>
      <FirstWeekCalibration />
      {/* Notifications now integrated in desktop widget column */}
      <DesktopSurface
        onOpenCommand={openCommand}
        desktopState={state.desktopState}
        continuity={state.continuity}
        onLaunchApp={handleLaunchApp}
      />

      {/* S30 — Contextual Welcome Tour (first visit only) */}
      <AnimatePresence>
        {showTour && (
          <ContextualWelcomeTour
            preferences={tourPreferences}
            onComplete={handleTourComplete}
          />
        )}
      </AnimatePresence>

      {/* S31 — Deferred Completion Center indicator */}
      <AnimatePresence>
        {hasDeferredItems && !showTour && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-6 right-6 z-[150]"
          >
            <Link
              to="/learn-later"
              className="flex items-center gap-2 rounded-xl border border-border bg-card/90 backdrop-blur-sm px-4 py-2.5 shadow-lg hover:bg-secondary/50 transition-colors"
            >
              <ListChecks className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-foreground">Finish setup</span>
              <span className="text-[10px] text-muted-foreground">Items deferred</span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </CalmEngineProvider>
  );
}
