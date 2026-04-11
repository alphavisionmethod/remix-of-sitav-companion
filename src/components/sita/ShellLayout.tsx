import { ReactNode, useState, useEffect, lazy, Suspense, useCallback } from "react";
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

// Lazy-load non-critical shell features (deferred until after first paint)
const AdvisorChat = lazy(() => import("./AdvisorChat").then(m => ({ default: m.AdvisorChat })));
const AdvisorFAB = lazy(() => import("./AdvisorFAB").then(m => ({ default: m.AdvisorFAB })));
const NotificationPanel = lazy(() => import("./NotificationPanel").then(m => ({ default: m.NotificationPanel })));
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


// Route-aware page transitions
const drillDownSegments = ["mission", "owner", "business", "money", "concierge"];

const getPageTransition = (pathname: string) => {
  const segment = pathname.split("/").filter(Boolean)[0] || "home";
  const depth = pathname.split("/").filter(Boolean).length;

  if (depth > 1 && drillDownSegments.includes(segment)) {
    return {
      initial: { opacity: 0, x: 20, filter: "blur(4px)" },
      animate: { opacity: 1, x: 0, filter: "blur(0px)" },
      exit: { opacity: 0, x: -10, filter: "blur(2px)" },
      transition: { type: "spring", mass: 1, stiffness: 120, damping: 16 },
    };
  }

  return {
    initial: { opacity: 0, y: 8, filter: "blur(3px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    exit: { opacity: 0, y: -4, filter: "blur(2px)" },
    transition: { type: "spring", mass: 1, stiffness: 100, damping: 15 },
  };
};

export const ShellLayout = ({ children }: { children: ReactNode }) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [wizardType, setWizardType] = useState<"lead" | "invoice" | "budget" | null>(null);
  const [showEntryCeremony, setShowEntryCeremony] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const { isCalm, isFocus } = useDisplayMode();
  const { isOpen: railOpen } = useInspector();
  useAdaptiveInterface();
  const location = useLocation();

  // Memoized callbacks for child components
  const handleNotifOpen = useCallback(() => setNotifOpen(true), []);
  const handleTimelineOpen = useCallback(() => setTimelineOpen(true), []);
  const handleCommandOpen = useCallback(() => setCommandOpen(true), []);

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
        <UniversalCommandSurface open={commandOpen} onClose={() => setCommandOpen(false)} />
        {/* Command Palette (Cmd+K) */}
        <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
        {/* Notification Center */}
        <NotificationCenterPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
      </Suspense>

      <div className={cn("relative flex flex-col min-h-screen w-full bg-surface-0", isCalm && "calm-mode", isFocus && "focus-mode")}>
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
        {!isDesktopRoute && (
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
                        initial={transition.initial}
                        animate={transition.animate}
                        exit={transition.exit}
                        transition={transition.transition}
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
        <NotificationPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
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
        <DesktopDock />
      </Suspense>

      {/* Behavioral Interaction Tracker — invisible */}
      <InteractionTracker />

      {/* Mobile Bottom Nav — critical for mobile, keep eager */}
      <MobileBottomNav />
    </SidebarProvider>
  );
};
