// ═══════════════════════════════════════════════════════════════
// SITA OS — Shell Layout (Decomposed)
// Frame + Sidebar + TopBar + lazy sub-layers
// ═══════════════════════════════════════════════════════════════

import { ReactNode, useState, useEffect, Suspense, useCallback } from "react";
import { useWindowManager } from "@/hooks/useWindowManager";
import { WindowManagerContext } from "@/contexts/WindowManagerContext";
import { OSWindowProvider } from "@/platform/sita/components/sita/os/WindowContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SkipToContent } from "./SkipToContent";
import { RouteAnnouncer } from "./RouteAnnouncer";
import { AppSidebar } from "./AppSidebar";
import { SitaTopBar } from "./SitaTopBar";
import { MobileBottomNav } from "./MobileBottomNav";
import { InteractionTracker } from "./InteractionTracker";
import { ErrorBoundary } from "./ErrorBoundary";
import { TrustTransitionIndicator } from "./TrustTransitionIndicator";
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications";
import { useProactiveNotifications } from "@/hooks/use-proactive-notifications";
import { useDisplayMode } from "@/contexts/AppearanceContext";
import { useAdaptiveInterface } from "@/hooks/useAdaptiveInterface";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { PageTransition } from "./PageTransition";
import { SectionSkeleton } from "./PageSkeleton";
import { useZeroLatency } from "@/hooks/use-zero-latency";
import { useSessionRestore } from "@/hooks/use-session-restore";
import { persistSession } from "@/lib/services/session-persistence";
import { useCalmMode } from "@/hooks/use-calm-mode";
import { useAdaptiveVisuals } from "@/lib/services/adaptive-visual-system";
import { useBackgroundIntelligence } from "@/lib/services/background-intelligence";
import { useAppTransitions } from "@/platform/sita/components/sita/shell/AppTransitionLayer";
import { useGestureEngine } from "@/hooks/use-gesture-engine";
import { useFocusMode } from "@/hooks/use-focus-mode";
import { registerActivity, removeActivity, updateActivity } from "@/platform/sita/components/sita/shell/LiveActivityBar";
import { useSitaVoiceBridge } from "@/lib/sita-voice/useSitaVoiceBridge";
import { useLiveActivityDomainData } from "@/hooks/useLiveActivityDomainData";
import { lazy } from "react";

// Sub-layers
import { useWindowLauncher } from "./shell/ShellWindowLayer";
import { ShellAccessoryLayer } from "./shell/ShellAccessoryLayer";
import { ShellLiveLayer } from "./shell/ShellLiveLayer";
import { SecurePromptProvider } from "./shell/SecurePromptProvider";
import { FilePickerProvider } from "./shell/FilePickerService";
import { SecurePrompt } from "./shell/SecurePrompt";
import { AppLaunchBridge } from "./app-platform/AppLaunchBridge";
import { DemoGovernanceBanner } from "./DemoGovernanceBanner";
import { useDemoModeRuntimeEnforcement } from "@/hooks/useDemoModeRuntimeEnforcement";
import { AboutDialog } from "./shell/AboutDialog";
import { ShortcutsDialog } from "./shell/ShortcutsDialog";
import { LockScreenOverlay } from "./shell/LockScreenOverlay";
import { useGlobalShortcuts } from "@/hooks/useGlobalShortcuts";
import { initZoomFromStorage } from "@/lib/system-menu/menu-actions";
import { useRoutePerformance } from "@/hooks/useRoutePerformance";
import { StandaloneAppFrame } from "./shell/StandaloneAppFrame";

const SystemMenuBarLazy = lazy(() => import("./shell/SystemMenuBar").then(m => ({ default: m.SystemMenuBar })));

export const ShellLayout = ({ children }: { children: ReactNode }) => {
  // Runtime mode enforcement — tags <body>, window globals, analytics
  useDemoModeRuntimeEnforcement();
  // Performance measurement — tracks cold start + route navigation latency
  useRoutePerformance();
  const [chatOpen, setChatOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [wizardType, setWizardType] = useState<"lead" | "invoice" | "budget" | null>(null);
  const [showEntryCeremony, setShowEntryCeremony] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [missionControlOpen, setMissionControlOpen] = useState(false);
  const [spatialOpen, setSpatialOpen] = useState(false);
  const [controlCenterOpen, setControlCenterOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [launcherOpen, setLauncherOpen] = useState(false);

  const wm = useWindowManager();
  const { isCalm, isFocus } = useDisplayMode();
  const { doLaunchApp, handleLaunchApp, PermissionGateRenderer } = useWindowLauncher(wm);

  // Listen for sita-open-business events (from BusinessCenter redirect shim)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const module = detail?.module || "crm-home";
      (window as any).__businessInitialModule = module;
      doLaunchApp("business");
      window.dispatchEvent(new CustomEvent("sita-business-navigate", { detail: { module } }));
    };
    window.addEventListener("sita-open-business", handler);
    return () => window.removeEventListener("sita-open-business", handler);
  }, [doLaunchApp]);

  // Listen for sita-open-finance events (from MoneyCenter redirect shim)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const module = detail?.module || "overview";
      (window as any).__financeInitialModule = module;
      doLaunchApp("finance");
      window.dispatchEvent(new CustomEvent("sita-finance-navigate", { detail: { module } }));
    };
    window.addEventListener("sita-open-finance", handler);
    return () => window.removeEventListener("sita-open-finance", handler);
  }, [doLaunchApp]);

  // Listen for sita-open-concierge events (from ConciergeCenter redirect shim)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const module = detail?.module || "overview";
      (window as any).__conciergeInitialModule = module;
      doLaunchApp("concierge");
      window.dispatchEvent(new CustomEvent("sita-concierge-navigate", { detail: { module } }));
    };
    window.addEventListener("sita-open-concierge", handler);
    return () => window.removeEventListener("sita-open-concierge", handler);
  }, [doLaunchApp]);

  // Listen for sita-open-mission-control events (from AdminCenter redirect shim)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const module = detail?.module || "dashboard";
      (window as any).__missionControlInitialModule = module;
      doLaunchApp("mission-control");
      window.dispatchEvent(new CustomEvent("sita-mission-control-navigate", { detail: { module } }));
    };
    window.addEventListener("sita-open-mission-control", handler);
    return () => window.removeEventListener("sita-open-mission-control", handler);
  }, [doLaunchApp]);

  // Listen for sita-open-app-store events (from AppStoreCenter redirect shim)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const module = detail?.module || "store";
      (window as any).__appStoreInitialModule = module;
      doLaunchApp("app-store");
      window.dispatchEvent(new CustomEvent("sita-app-store-navigate", { detail: { module } }));
    };
    window.addEventListener("sita-open-app-store", handler);
    return () => window.removeEventListener("sita-open-app-store", handler);
  }, [doLaunchApp]);

  // Generic open-app launcher (used by SystemMenuBar items like New Window, Help, Settings)
  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent).detail?.appId;
      if (id) doLaunchApp(id);
    };
    window.addEventListener("sita-open-app", handler);
    return () => window.removeEventListener("sita-open-app", handler);
  }, [doLaunchApp]);

  // Restore persisted shell zoom on mount
  useEffect(() => { initZoomFromStorage(); }, []);

  // Hooks
  useAdaptiveInterface();
  useZeroLatency();
  useAdaptiveVisuals();
  useBackgroundIntelligence();
  useAppTransitions();
  const { calmLevel } = useCalmMode();
  const focusMode = useFocusMode();
  const location = useLocation();
  useLiveActivityDomainData();

  // Gesture engine
  useGestureEngine(useCallback((gesture) => {
    if (gesture.type === "swipe-up" || gesture.type === "pinch-out") setMissionControlOpen(true);
    else if (gesture.type === "swipe-down" || gesture.type === "pinch-in") setMissionControlOpen(false);
  }, []));

  // Focus mode → Live Activity
  useEffect(() => {
    if (focusMode.active) {
      registerActivity({
        id: "focus-timer", type: "focus",
        label: `Focus ${focusMode.formatRemaining()}`, sublabel: "Deep work session",
        progress: focusMode.progress, onDismiss: () => focusMode.stop(),
      });
    } else { removeActivity("focus-timer"); }
  }, [focusMode.active, focusMode.remaining]);

  useEffect(() => {
    if (focusMode.active) {
      updateActivity("focus-timer", { label: `Focus ${focusMode.formatRemaining()}`, progress: focusMode.progress });
    }
  }, [focusMode.remaining]);

  // Session restore
  useSessionRestore({
    onRestoreWindows: useCallback((windows) => {
      for (const w of windows) {
        if (["finder", "settings", "notes", "terminal", "calendar", "weather", "nova-terminal"].includes(w.id)) {
          doLaunchApp(w.id);
        }
      }
    }, [doLaunchApp]),
  });

  // Persist session on beforeunload
  useEffect(() => {
    const handler = () => {
      persistSession({
        windows: wm.getWindowStates(),
        route: location.pathname,
        scrollPositions: { [location.pathname]: window.scrollY },
        sidebarOpen: true,
      });
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [wm, location.pathname]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setCommandOpen(o => !o); }
      if (e.key === "F3") { e.preventDefault(); setMissionControlOpen(o => !o); }
      if (e.key === " " && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setLauncherOpen(o => !o); }
      if (e.key === "F4" || (e.key === "g" && (e.metaKey || e.ctrlKey) && e.shiftKey)) { e.preventDefault(); setSpatialOpen(o => !o); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Realtime notifications
  useRealtimeNotifications();
  useProactiveNotifications();

  useEffect(() => {
    if (sessionStorage.getItem("sita-desktop-entry") === "true") {
      sessionStorage.removeItem("sita-desktop-entry");
      setShowEntryCeremony(true);
    }
  }, []);

  const handleNotifOpen = useCallback(() => setNotifDropdownOpen(o => !o), []);
  const handleControlCenterOpen = useCallback(() => setControlCenterOpen(o => !o), []);
  const handleTimelineOpen = useCallback(() => setTimelineOpen(true), []);
  const handleCommandOpen = useCallback(() => setCommandOpen(true), []);

  // ── Sita voice bridge (Phase B) — wires global voice intents to host actions.
  useSitaVoiceBridge({
    launchApp: handleLaunchApp,
    focus: { active: focusMode.active, start: focusMode.start, stop: focusMode.stop },
    setLauncherOpen,
    setCommandOpen,
    setControlCenterOpen,
    setNotifDropdownOpen,
  });

  const isDesktopRoute = location.pathname === "/" || location.pathname === "/home" || location.pathname === "/desktop";
  // Control Room is the ONLY route that shows the multi-app aggregated sidebar.
  const isControlRoomRoute = location.pathname === "/owner" || location.pathname.startsWith("/owner/");
  const showGlobalSidebar = isControlRoomRoute;
  // Mobile routes manage their own chrome; skip the standalone frame there too.
  const isMobileRoute = location.pathname.startsWith("/mobile");
  const useStandaloneFrame = !isDesktopRoute && !isControlRoomRoute && !isMobileRoute;

  return (
    <OSWindowProvider>
    <WindowManagerContext.Provider value={wm}>
    <SecurePromptProvider>
    <FilePickerProvider>
    <SidebarProvider>
      <SkipToContent />
      <RouteAnnouncer />

      {/* Live Layer — command surfaces, dock, boot, ambient */}
      <ShellLiveLayer
        wm={wm}
        commandOpen={commandOpen} setCommandOpen={setCommandOpen}
        notifOpen={notifOpen} setNotifOpen={setNotifOpen}
        missionControlOpen={missionControlOpen} setMissionControlOpen={setMissionControlOpen}
        spatialOpen={spatialOpen} setSpatialOpen={setSpatialOpen}
        controlCenterOpen={controlCenterOpen} setControlCenterOpen={setControlCenterOpen}
        notifDropdownOpen={notifDropdownOpen} setNotifDropdownOpen={setNotifDropdownOpen}
        launcherOpen={launcherOpen} setLauncherOpen={setLauncherOpen}
        handleLaunchApp={handleLaunchApp} doLaunchApp={doLaunchApp}
      />

      {/* App Platform — global webview/native launch bridge */}
      <AppLaunchBridge />

      <div className={cn("relative flex flex-col min-h-screen w-full bg-surface-0", isCalm && "calm-mode", isFocus && "focus-mode")}>

        {/* Persistent honesty banner — only renders in demo mode */}
        <DemoGovernanceBanner />

        {isDesktopRoute ? (
          <Suspense fallback={null}>
            <SystemMenuBarLazy onSearchOpen={handleCommandOpen} onNotifOpen={handleNotifOpen} onControlCenterOpen={handleControlCenterOpen} activeApp="Desktop" />
          </Suspense>
        ) : (
          <SitaTopBar onNotifOpen={handleNotifOpen} onTimelineOpen={handleTimelineOpen} onCommandOpen={handleCommandOpen} />
        )}

        <div className="relative z-10 flex flex-1 min-w-0">
          {showGlobalSidebar && <AppSidebar />}
          <div className="flex flex-1 min-w-0">
            <div className="flex flex-1 flex-col min-w-0">
              <main id="main-content" role="main" aria-label="Page content"
                className={cn("flex-1 overflow-auto scrollbar-thin", isDesktopRoute ? "" : "pb-28 md:pb-16")}>
                <ErrorBoundary>
                  {isDesktopRoute ? (
                    children
                  ) : useStandaloneFrame ? (
                    <StandaloneAppFrame>
                      <PageTransition>{children}</PageTransition>
                    </StandaloneAppFrame>
                  ) : (
                    <PageTransition>{children}</PageTransition>
                  )}
                </ErrorBoundary>
              </main>
            </div>
            {/* Contextual Rail from accessory layer */}
          </div>
        </div>
      </div>

      {/* Accessory Layer — advisor, timeline, tour, companions */}
      <ShellAccessoryLayer
        chatOpen={chatOpen} setChatOpen={setChatOpen}
        timelineOpen={timelineOpen} setTimelineOpen={setTimelineOpen}
        wizardType={wizardType} setWizardType={setWizardType}
        showEntryCeremony={showEntryCeremony} setShowEntryCeremony={setShowEntryCeremony}
        isDesktopRoute={isDesktopRoute}
      />

      {/* Permission Gate */}
      <PermissionGateRenderer />

      {/* Trust Transition Indicator */}
      <TrustTransitionIndicator />

      {/* Interaction Tracker */}
      <InteractionTracker />

      {/* Mobile Bottom Nav — only on non-mobile-route pages */}
      {!location.pathname.startsWith("/mobile") && <MobileBottomNav />}

      {/* Secure Elevation Prompt (trusted path) */}
      <SecurePrompt />

      {/* System menu dialogs + lock screen */}
      <AboutDialog />
      <ShortcutsDialog />
      <LockScreenOverlay />

      {/* Global keyboard shortcuts (must live inside WindowManagerContext) */}
      <ShellShortcutsMount onSearchOpen={handleCommandOpen} />
    </SidebarProvider>
    </FilePickerProvider>
    </SecurePromptProvider>
    </WindowManagerContext.Provider>
    </OSWindowProvider>
  );
};

/** Internal: mounts global keyboard shortcuts inside the WindowManagerContext. */
function ShellShortcutsMount({ onSearchOpen }: { onSearchOpen: () => void }) {
  useGlobalShortcuts({ onSearchOpen });
  return null;
}
