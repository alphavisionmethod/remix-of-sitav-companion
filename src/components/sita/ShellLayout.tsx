import { ReactNode, useState, useEffect, lazy, Suspense, useCallback, useRef } from "react";
import { useWindowManager } from "@/hooks/useWindowManager";
import { WindowManagerContext } from "@/contexts/WindowManagerContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SkipToContent } from "./SkipToContent";
import { RouteAnnouncer } from "./RouteAnnouncer";
import { AppSidebar } from "./AppSidebar";
import { SitaTopBar } from "./SitaTopBar";
import { MobileBottomNav } from "./MobileBottomNav";
import { InteractionTracker } from "./InteractionTracker";
import { ErrorBoundary } from "./ErrorBoundary";
import { ModeResolutionBanner } from "@/components/reality/ModeResolutionBanner";
import { DemoStateBanner } from "@/components/reality/DemoStateBanner";
import { DemoGovernanceBanner } from "./DemoGovernanceBanner";
import { RealityStateBadge } from "@/components/reality/RealityStateBadge";
import { NetworkStatusBar } from "./NetworkStatusBar";
import { TrustTransitionIndicator } from "./TrustTransitionIndicator";
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications";
import { useProactiveNotifications } from "@/hooks/use-proactive-notifications";
import { useDisplayMode } from "@/contexts/AppearanceContext";
import { useInspector } from "@/contexts/InspectorContext";
import { useAdaptiveInterface } from "@/hooks/useAdaptiveInterface";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { SectionSkeleton } from "./PageSkeleton";
import { FinderWindow } from "./shell/windows/FinderWindow";
import { SettingsWindow } from "./shell/windows/SettingsWindow";
import { NotesWindow } from "./shell/windows/NotesWindow";
import { TerminalWindow } from "./shell/windows/TerminalWindow";
import { CalendarWindow } from "./shell/windows/CalendarWindow";
import { WeatherWindow } from "./shell/windows/WeatherWindow";
import { NovaTerminal } from "./shell/windows/NovaTerminal";
import { SystemMonitorWindow } from "./shell/windows/SystemMonitorWindow";
import { MusicPlayerWindow } from "./shell/windows/MusicPlayerWindow";
import { CalculatorWindow } from "./shell/windows/CalculatorWindow";
import { PhotoViewerWindow } from "./shell/windows/PhotoViewerWindow";
import { CodeEditorWindow } from "./shell/windows/CodeEditorWindow";
import { MailClientWindow } from "./shell/windows/MailClientWindow";
import { MapsWindow } from "./shell/windows/MapsWindow";
import { NovaSDKProvider } from "@/contexts/NovaSDKContext";
import { lifecycleManager } from "@/lib/nova-sdk/runtime/lifecycle";
import { ProcessTable } from "@/lib/nova-sdk/kernel/process-manager";
import { Compositor } from "@/lib/nova-sdk/kernel/compositor";
import { MemoryManager } from "@/lib/nova-sdk/kernel/memory-manager";
import { CommandLayer } from "./shell/CommandLayer";
import { ClickRipple } from "./shell/ClickRipple";
import { AppPermissionGate, isPermissionGranted } from "./shell/AppPermissionGate";
import { useAppPlatform } from "@/contexts/AppPlatformContext";
import { useZeroLatency } from "@/hooks/use-zero-latency";
import { useSessionRestore } from "@/hooks/use-session-restore";
import { persistSession } from "@/lib/services/session-persistence";
import { useCalmMode } from "@/hooks/use-calm-mode";
import { routineDetector } from "@/lib/services/routine-detector";
import { useAdaptiveVisuals } from "@/lib/services/adaptive-visual-system";
import { useBackgroundIntelligence } from "@/lib/services/background-intelligence";
import { useAppTransitions } from "@/components/sita/shell/AppTransitionLayer";
import { useGestureEngine } from "@/hooks/use-gesture-engine";
import { useFocusMode } from "@/hooks/use-focus-mode";
import { registerActivity, removeActivity, updateActivity } from "@/components/sita/shell/LiveActivityBar";

// Lazy-load non-critical shell features (deferred until after first paint)
const AdvisorChat = lazy(() => import("./AdvisorChat").then(m => ({ default: m.AdvisorChat })));
const AdvisorFAB = lazy(() => import("./AdvisorFAB").then(m => ({ default: m.AdvisorFAB })));
const SystemMenuBarLazy = lazy(() => import("./shell/SystemMenuBar").then(m => ({ default: m.SystemMenuBar })));
const UniversalTimeline = lazy(() => import("./UniversalTimeline").then(m => ({ default: m.UniversalTimeline })));
const InspectorPanel = lazy(() => import("./InspectorPanel").then(m => ({ default: m.InspectorPanel })));
const ContextualRail = lazy(() => import("./ContextualRail").then(m => ({ default: m.ContextualRail })));
const SitaCompanionBar = lazy(() => import("./SitaCompanionBar").then(m => ({ default: m.SitaCompanionBar })));
const KeyboardShortcuts = lazy(() => import("./KeyboardShortcuts").then(m => ({ default: m.KeyboardShortcuts })));
const WelcomeTour = lazy(() => import("./WelcomeTour").then(m => ({ default: m.WelcomeTour })));
const InteractiveTutorial = lazy(() => import("./InteractiveTutorial").then(m => ({ default: m.InteractiveTutorial })));
const QuickAddWizard = lazy(() => import("./QuickAddWizard").then(m => ({ default: m.QuickAddWizard })));
const QuickAddFAB = lazy(() => import("./QuickAddWizard").then(m => ({ default: m.QuickAddFAB })));
const CopilotBar = lazy(() => import("./CopilotBar").then(m => ({ default: m.CopilotBar })));
const DevicePresenceIndicator = lazy(() => import("./DevicePresenceIndicator").then(m => ({ default: m.DevicePresenceIndicator })));
const SuccessCelebration = lazy(() => import("./SuccessCelebration").then(m => ({ default: m.SuccessCelebration })));
const AIGate = lazy(() => import("./AIGate").then(m => ({ default: m.AIGate })));
const DesktopEntryCeremony = lazy(() => import("./DesktopEntryCeremony").then(m => ({ default: m.DesktopEntryCeremony })));
const PWAInstallPrompt = lazy(() => import("./PWAInstallPrompt").then(m => ({ default: m.PWAInstallPrompt })));
const ContinuityBanner = lazy(() => import("./ContinuityBanner").then(m => ({ default: m.ContinuityBanner })));
const UpdateBanner = lazy(() => import("./UpdateBanner").then(m => ({ default: m.UpdateBanner })));
const UniversalCommandSurface = lazy(() => import("./shell/UniversalCommandSurface").then(m => ({ default: m.UniversalCommandSurface })));
const ShellAmbientBackground = lazy(() => import("./shell/ShellAmbientBackground").then(m => ({ default: m.ShellAmbientBackground })));
const DesktopDock = lazy(() => import("./DesktopDock").then(m => ({ default: m.DesktopDock })));
const CommandPalette = lazy(() => import("./CommandPalette").then(m => ({ default: m.CommandPalette })));
const NotificationCenterPanel = lazy(() => import("./NotificationCenter").then(m => ({ default: m.NotificationCenter })));
const AppRecentsStripLazy = lazy(() => import("./AppRecentsStrip").then(m => ({ default: m.AppRecentsStrip })));
const FlowSpaceLazy = lazy(() => import("./shell/FlowSpace").then(m => ({ default: m.FlowSpace })));
const EdgePanelsLazy = lazy(() => import("./shell/EdgePanels").then(m => ({ default: m.EdgePanels })));
const UniversalCommandLazy = lazy(() => import("./UniversalCommand").then(m => ({ default: m.UniversalCommand })));
const AmbientSuggestionsBarLazy = lazy(() => import("./AmbientSuggestionsBar").then(m => ({ default: m.AmbientSuggestionsBar })));
const SpatialDesktopLazy = lazy(() => import("./shell/SpatialDesktop").then(m => ({ default: m.SpatialDesktop })));
const HoldKeyOverlayLazy = lazy(() => import("./shell/HoldKeyOverlay").then(m => ({ default: m.HoldKeyOverlay })));
const LiveActivityBarLazy = lazy(() => import("./shell/LiveActivityBar").then(m => ({ default: m.LiveActivityBar })));
const ContextualCursorLazy = lazy(() => import("./shell/ContextualCursor").then(m => ({ default: m.ContextualCursor })));
const BootSplashLazy = lazy(() => import("./shell/BootSplash").then(m => ({ default: m.BootSplash })));
const AppSwitcherLazy = lazy(() => import("./shell/AppSwitcher").then(m => ({ default: m.AppSwitcher })));
const ControlCenterLazy = lazy(() => import("./shell/ControlCenter").then(m => ({ default: m.ControlCenter })));
const NotificationDropdownLazy = lazy(() => import("./shell/NotificationDropdown").then(m => ({ default: m.NotificationDropdown })));
const PictureInPictureLazy = lazy(() => import("./shell/PictureInPicture").then(m => ({ default: m.PictureInPicture })));

// Route-aware page transitions
const drillDownSegments = ["mission", "owner", "business", "money", "concierge"];

const getPageTransition = (pathname: string) => {
  const segment = pathname.split("/").filter(Boolean)[0] || "home";
  const depth = pathname.split("/").filter(Boolean).length;

  // Drill-down sub-page: slide in from right
  if (depth > 1 && drillDownSegments.includes(segment)) {
    return {
      initial: { opacity: 0, x: 24, scale: 0.98, filter: "blur(6px)" },
      animate: { opacity: 1, x: 0, scale: 1, filter: "blur(0px)" },
      exit: { opacity: 0, x: -16, scale: 0.99, filter: "blur(3px)" },
      transition: { type: "spring", mass: 0.6, stiffness: 140, damping: 18 },
    };
  }

  // Top-level center switch: premium entrance with scale + blur
  return {
    initial: { opacity: 0, y: 12, scale: 0.97, filter: "blur(8px)" },
    animate: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
    exit: { opacity: 0, y: -6, scale: 0.99, filter: "blur(4px)" },
    transition: { type: "spring", mass: 0.5, stiffness: 130, damping: 17 },
  };
};

export const ShellLayout = ({ children }: { children: ReactNode }) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [wizardType, setWizardType] = useState<"lead" | "invoice" | "budget" | null>(null);
  const [showEntryCeremony, setShowEntryCeremony] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [missionControlOpen, setMissionControlOpen] = useState(false);
  const [spatialOpen, setSpatialOpen] = useState(false);
  const [permGate, setPermGate] = useState<{ appId: string; originRect?: DOMRect } | null>(null);
  const wm = useWindowManager();
  const { isCalm, isFocus } = useDisplayMode();
  const { isOpen: railOpen } = useInspector();
  const { apps } = useAppPlatform();
  useAdaptiveInterface();
  useZeroLatency();
  useAdaptiveVisuals();
  useBackgroundIntelligence();
  useAppTransitions();
  const { calmLevel } = useCalmMode();
  const focusMode = useFocusMode();
  const location = useLocation();

  // Gesture engine — workspace switching & FlowSpace
  useGestureEngine(useCallback((gesture) => {
    if (gesture.type === "swipe-up" || gesture.type === "pinch-out") {
      setMissionControlOpen(true);
    } else if (gesture.type === "swipe-down" || gesture.type === "pinch-in") {
      setMissionControlOpen(false);
    } else if (gesture.type === "edge-swipe-right") {
      // Could wire to sidebar toggle
    }
  }, []));

  // Focus mode → Live Activity integration
  useEffect(() => {
    if (focusMode.active) {
      registerActivity({
        id: "focus-timer",
        type: "focus",
        label: `Focus ${focusMode.formatRemaining()}`,
        sublabel: "Deep work session",
        progress: focusMode.progress,
        onDismiss: () => focusMode.stop(),
      });
    } else {
      removeActivity("focus-timer");
    }
  }, [focusMode.active, focusMode.remaining]);

  // Update focus activity progress
  useEffect(() => {
    if (focusMode.active) {
      updateActivity("focus-timer", {
        label: `Focus ${focusMode.formatRemaining()}`,
        progress: focusMode.progress,
      });
    }
  }, [focusMode.remaining]);

  // Session restore on mount
  useSessionRestore({
    onRestoreWindows: useCallback((windows) => {
      for (const w of windows) {
        if (["finder", "settings", "notes", "terminal", "calendar", "weather", "nova-terminal"].includes(w.id)) {
          doLaunchApp(w.id);
        }
      }
    }, []),
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

  // Memoized callbacks for child components
  const handleNotifOpen = useCallback(() => setNotifOpen(true), []);
  const handleTimelineOpen = useCallback(() => setTimelineOpen(true), []);
  const handleCommandOpen = useCallback(() => setCommandOpen(true), []);

  const doLaunchApp = useCallback((appId: string, originRect?: DOMRect) => {
    const origin = originRect ? { x: originRect.x, y: originRect.y, width: originRect.width, height: originRect.height } : undefined;

    const launchWithKernel = (windowId: string, opts: Parameters<typeof wm.openWindow>[1], manifest: { id: string; name: string }) => {
      // 1. Spawn process in kernel
      const proc = ProcessTable.spawn({
        id: manifest.id,
        name: manifest.name,
        version: "1.0.0",
        permissions: [],
        windowDefaults: { width: opts.width ?? 400, height: 500, resizable: true },
      } as any);

      // 2. Allocate memory for process
      MemoryManager.allocate(proc.pid, 16, { label: `app:${manifest.id}:heap`, guardPages: true });
      ProcessTable.setReady(proc.pid);
      ProcessTable.setRunning(proc.pid);

      // 3. Open window in window manager
      wm.openWindow(windowId, opts);

      // 4. Register compositor surface
      Compositor.registerSurface(windowId, proc.pid, {
        x: opts.position?.x ?? 120,
        y: opts.position?.y ?? 100,
        width: opts.width ?? 400,
        height: 500,
      }, opts.title);

      // 5. Add window to process
      ProcessTable.addWindow(proc.pid, windowId);

      // 6. Lifecycle: launching → running
      lifecycleManager.transition(windowId, "launching").then(() => {
        lifecycleManager.transition(windowId, "running");
      });
    };

    if (appId === "finder" || appId === "files-app") {
      launchWithKernel("finder", {
        title: "Finder",
        component: <FinderWindow />,
        position: { x: 120, y: 100 },
        width: 460,
        originRect: origin,
      }, { id: "finder", name: "Finder" });
    } else if (appId === "settings" || appId === "settings-app") {
      launchWithKernel("settings", {
        title: "Settings",
        component: <SettingsWindow />,
        position: { x: 300, y: 120 },
        width: 520,
        originRect: origin,
      }, { id: "settings", name: "Settings" });
    } else if (appId === "notes" || appId === "com.nova.notes") {
      launchWithKernel("notes", {
        title: "Notes",
        component: <NotesWindow />,
        position: { x: 200, y: 110 },
        width: 520,
        originRect: origin,
      }, { id: "notes", name: "Notes" });
    } else if (appId === "terminal" || appId === "com.nova.terminal") {
      launchWithKernel("terminal", {
        title: "Terminal",
        component: <TerminalWindow />,
        position: { x: 160, y: 130 },
        width: 560,
        originRect: origin,
      }, { id: "terminal", name: "Terminal" });
    } else if (appId === "calendar" || appId === "com.nova.calendar") {
      launchWithKernel("calendar", {
        title: "Calendar",
        component: <CalendarWindow />,
        position: { x: 240, y: 90 },
        width: 580,
        originRect: origin,
      }, { id: "calendar", name: "Calendar" });
    } else if (appId === "weather" || appId === "com.nova.weather") {
      launchWithKernel("weather", {
        title: "Weather",
        component: <WeatherWindow />,
        position: { x: 340, y: 100 },
        width: 420,
        originRect: origin,
      }, { id: "weather", name: "Weather" });
    } else if (appId === "nova-terminal" || appId === "com.nova.canvas-terminal") {
      launchWithKernel("nova-terminal", {
        title: "Nova Terminal",
        component: <NovaTerminal />,
        position: { x: 180, y: 110 },
        width: 640,
        originRect: origin,
      }, { id: "nova-terminal", name: "Nova Terminal" });
    } else if (appId === "system-monitor" || appId === "com.sita.monitor") {
      launchWithKernel("system-monitor", {
        title: "System Monitor",
        component: <SystemMonitorWindow />,
        position: { x: 140, y: 80 },
        width: 620,
        originRect: origin,
      }, { id: "system-monitor", name: "System Monitor" });
    } else if (appId === "music-player") {
      launchWithKernel("music-player", {
        title: "Music",
        component: <MusicPlayerWindow />,
        position: { x: 180, y: 100 },
        width: 520,
        originRect: origin,
      }, { id: "music-player", name: "Music" });
    } else if (appId === "calculator") {
      launchWithKernel("calculator", {
        title: "Calculator",
        component: <CalculatorWindow />,
        position: { x: 360, y: 120 },
        width: 380,
        originRect: origin,
      }, { id: "calculator", name: "Calculator" });
    } else if (appId === "photo-viewer") {
      launchWithKernel("photo-viewer", {
        title: "Photos",
        component: <PhotoViewerWindow />,
        position: { x: 200, y: 90 },
        width: 560,
        originRect: origin,
      }, { id: "photo-viewer", name: "Photos" });
    } else if (appId === "code-editor") {
      launchWithKernel("code-editor", {
        title: "Code Editor",
        component: <CodeEditorWindow />,
        position: { x: 120, y: 80 },
        width: 700,
        originRect: origin,
      }, { id: "code-editor", name: "Code Editor" });
    } else if (appId === "mail-client") {
      launchWithKernel("mail-client", {
        title: "Mail",
        component: <MailClientWindow />,
        position: { x: 160, y: 90 },
        width: 640,
        originRect: origin,
      }, { id: "mail-client", name: "Mail" });
    } else if (appId === "maps-app") {
      launchWithKernel("maps-app", {
        title: "Maps",
        component: <MapsWindow />,
        position: { x: 200, y: 100 },
        width: 560,
        originRect: origin,
      }, { id: "maps-app", name: "Maps" });
    }
  }, [wm.openWindow]);

  // G1: Permission gate wired into launch flow
  const handleLaunchApp = useCallback((appId: string, originRect?: DOMRect) => {
    const appDef = apps.find(a => a.id === appId);
    const hasPerms = appDef?.permissions && appDef.permissions.length > 0;
    if (hasPerms && !isPermissionGranted(appId)) {
      setPermGate({ appId, originRect });
      return;
    }
    doLaunchApp(appId, originRect);
  }, [apps, doLaunchApp]);

  useEffect(() => {
    if (sessionStorage.getItem("sita-desktop-entry") === "true") {
      sessionStorage.removeItem("sita-desktop-entry");
      setShowEntryCeremony(true);
    }
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen(o => !o);
      }
      if (e.key === "F3" || (e.key === " " && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        setMissionControlOpen(o => !o);
      }
      if (e.key === "F4" || (e.key === "g" && (e.metaKey || e.ctrlKey) && e.shiftKey)) {
        e.preventDefault();
        setSpatialOpen(o => !o);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Phase 4: Real-time notification toasts
  useRealtimeNotifications();
  useProactiveNotifications();

  const workspaceKey = location.pathname.split("/").filter(Boolean)[0] || "home";
  const transition = getPageTransition(location.pathname);
  const isDesktopRoute = location.pathname === "/" || location.pathname === "/home" || location.pathname === "/desktop";

  return (
    <NovaSDKProvider>
    <WindowManagerContext.Provider value={wm}>
    <SidebarProvider>
      {/* WCAG: Skip to content link */}
      <SkipToContent />

      {/* WCAG: Route change announcer for screen readers */}
      <RouteAnnouncer />

      {/* Desktop Entry Ceremony */}
      <Suspense fallback={null}>
        {showEntryCeremony && (
          <DesktopEntryCeremony onComplete={() => setShowEntryCeremony(false)} />
        )}

        {/* Universal Command Surface */}
        <UniversalCommandSurface open={commandOpen} onClose={() => setCommandOpen(false)} onSystemCommand={(cmd) => {
          if (cmd === "focus") { focusMode.active ? focusMode.stop() : focusMode.start(25); }
        }} />
        {/* Universal Command Layer (Cmd+K) — replaces basic CommandPalette */}
        <UniversalCommandLazy
          open={commandOpen}
          onClose={() => setCommandOpen(false)}
          onSystemCommand={(cmd, args) => {
            if (cmd === "lock") {
              // Could wire to shell lock state
            }
            if (cmd === "mute") {
              // Could wire to notification mute state
            }
            if (cmd === "focus") {
              if (focusMode.active) {
                focusMode.stop();
              } else {
                focusMode.start(25);
              }
            }
            if (cmd === "window_tile" || cmd === "window_minimize_all") {
              // Window management commands
            }
          }}
        />
        {/* Spatial Desktop (F4 / Cmd+Shift+G) */}
        <SpatialDesktopLazy isOpen={spatialOpen} onClose={() => setSpatialOpen(false)} />
        {/* Notification Center */}
        <NotificationCenterPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
        {/* FlowSpace (F3 / Cmd+Space) */}
        <FlowSpaceLazy
          isOpen={missionControlOpen}
          windows={wm.windows}
          onSelectWindow={(id) => { wm.focusWindow(id); setMissionControlOpen(false); }}
          onClose={() => setMissionControlOpen(false)}
          onLaunchApp={(appId) => { doLaunchApp(appId); setMissionControlOpen(false); }}
        />
      </Suspense>

      <div className={cn("relative flex flex-col min-h-screen w-full bg-surface-0", isCalm && "calm-mode", isFocus && "focus-mode")}>
        {/* Edge Panels (Weather, Notes, System Monitor) */}
        <Suspense fallback={null}>
          <EdgePanelsLazy />
        </Suspense>
        {/* Ambient background — subtle, always present */}
        <Suspense fallback={null}>
          <ShellAmbientBackground intensity="subtle" className="fixed" />
        </Suspense>

        <DemoGovernanceBanner />
        <DemoStateBanner />
        <NetworkStatusBar />
        <Suspense fallback={null}>
          <UpdateBanner />
          <ContinuityBanner />
        </Suspense>
        {isDesktopRoute ? (
          <Suspense fallback={null}>
            <SystemMenuBarLazy onSearchOpen={handleCommandOpen} onNotifOpen={handleNotifOpen} activeApp="Desktop" />
          </Suspense>
        ) : (
          <SitaTopBar
            onNotifOpen={handleNotifOpen}
            onTimelineOpen={handleTimelineOpen}
            onCommandOpen={handleCommandOpen}
          />
        )}

        <div className="relative z-10 flex flex-1 min-w-0">
          {!isDesktopRoute && <AppSidebar />}
          <div className="flex flex-1 min-w-0">
            <div className="flex flex-1 flex-col min-w-0">
              {/* Main content with bottom padding for mobile nav + companion bar */}
              <main
                id="main-content"
                role="main"
                aria-label="Page content"
                className={cn("flex-1 overflow-auto scrollbar-thin", isDesktopRoute ? "" : "pb-28 md:pb-16")}
              >
                <ErrorBoundary>
                  {isDesktopRoute ? (
                    children
                  ) : (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={workspaceKey}
                        initial={{ opacity: 0, scale: 0.97, filter: "blur(4px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 0.98, filter: "blur(2px)" }}
                        transition={{ type: "spring", mass: 0.8, stiffness: 150, damping: 18 }}
                        className="p-3 sm:p-4 md:p-6"
                      >
                        {children}
                      </motion.div>
                    </AnimatePresence>
                  )}
                </ErrorBoundary>
              </main>
            </div>
            {/* Persistent Contextual Rail — desktop only, not on home */}
            {!isDesktopRoute && (
              <Suspense fallback={<div className="hidden lg:block w-72 p-4"><SectionSkeleton lines={5} /></div>}>
                <ContextualRail />
              </Suspense>
            )}
          </div>
        </div>
      </div>

      {/* Deferred shell features — loaded after first paint */}
      <Suspense fallback={null}>
        {/* Mobile overlay fallback for inspector */}
        <div className="lg:hidden">
          <InspectorPanel />
        </div>

        {/* Panels */}
        <UniversalTimeline isOpen={timelineOpen} onClose={() => setTimelineOpen(false)} />
        <AdvisorChat isOpen={chatOpen} onClose={() => setChatOpen(false)} />

        {/* Phase 3: Welcome Tour */}
        <WelcomeTour />
        <InteractiveTutorial />

        {/* Phase 3: Quick-Add Wizard */}
        {wizardType && <QuickAddWizard type={wizardType} onClose={() => setWizardType(null)} />}

        {/* Floating buttons */}
        <QuickAddFAB onAdd={(type) => setWizardType(type)} />
        <AdvisorFAB isOpen={chatOpen} onToggle={() => setChatOpen(!chatOpen)} />

        {/* PWA Install Prompt */}
        <PWAInstallPrompt />

        {/* SITA Companion Bar — always present */}
        <SitaCompanionBar />

        {/* AI Copilot Bar — always-on assistant */}
        <CopilotBar />

        {/* Keyboard Shortcuts Overlay */}
        <KeyboardShortcuts />

        {/* Trust Transition Indicator */}
        <TrustTransitionIndicator />

        {/* Device Presence Indicator — status bar (visible on all screens) */}
        <div className="fixed bottom-20 left-4 z-50 hidden sm:block">
          <DevicePresenceIndicator />
        </div>

        {/* Mode Resolution Banner — reality mode info */}
        <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-1 pointer-events-none">
          <div className="max-w-md mx-auto pointer-events-auto">
            <ModeResolutionBanner />
          </div>
        </div>

        {/* Success Celebration overlay — triggered via events */}
        <SuccessCelebration show={false} />

        {/* AI Gate */}
        
      </Suspense>

      {/* Desktop Dock — floating app launcher */}
      <Suspense fallback={null}>
        <DesktopDock onLaunchApp={handleLaunchApp} windowManager={wm} hasMaximizedWindow={wm.visibleWindows.some(w => w.position?.x === 0 && w.position?.y === 0)} />
      </Suspense>

      {/* G1: Permission Gate Modal */}
      <AppPermissionGate
        appId={permGate?.appId ?? ""}
        appName={apps.find(a => a.id === permGate?.appId)?.name ?? ""}
        appIcon={apps.find(a => a.id === permGate?.appId)?.icon ?? ""}
        appIconBg={apps.find(a => a.id === permGate?.appId)?.iconBg ?? ""}
        permissions={apps.find(a => a.id === permGate?.appId)?.permissions ?? []}
        open={!!permGate}
        onAllow={() => {
          if (permGate) {
            const { appId, originRect } = permGate;
            setPermGate(null);
            doLaunchApp(appId, originRect);
          }
        }}
        onDeny={() => setPermGate(null)}
      />

      {/* Command Layer — hold Meta key */}
      <CommandLayer onAction={(actionId) => {
        if (actionId === "search") setCommandOpen(true);
        else if (actionId === "finder") handleLaunchApp("finder");
        else if (actionId === "settings") handleLaunchApp("settings");
        else if (actionId === "mission") setMissionControlOpen(true);
      }} />

      {/* Click Ripple — micro-detail */}
      <ClickRipple />

      {/* Hold-Key Command Overlay — Alt hold for action map */}
      <Suspense fallback={null}>
        <HoldKeyOverlayLazy />
      </Suspense>

      {/* Live Activity Bar — Dynamic Island */}
      <Suspense fallback={null}>
        <LiveActivityBarLazy />
      </Suspense>

      {/* Contextual Cursor — intelligent cursor with trail */}
      <Suspense fallback={null}>
        <ContextualCursorLazy />
      </Suspense>

      {/* Behavioral Interaction Tracker — invisible */}
      <InteractionTracker />

      {/* Ambient Suggestions Bar — floating contextual intelligence */}
      <Suspense fallback={null}>
        <AmbientSuggestionsBarLazy />
      </Suspense>

      {/* Mobile Bottom Nav — critical for mobile, keep eager */}
      <MobileBottomNav />
    </SidebarProvider>
    </WindowManagerContext.Provider>
    </NovaSDKProvider>
  );
};
