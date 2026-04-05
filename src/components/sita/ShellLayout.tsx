import { ReactNode, useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { SitaTopBar } from "./SitaTopBar";
import { AdvisorChat } from "./AdvisorChat";
import { AdvisorFAB } from "./AdvisorFAB";
import { NotificationPanel } from "./NotificationPanel";
import { UniversalTimeline } from "./UniversalTimeline";
import { InspectorPanel } from "./InspectorPanel";
import { ContextualRail } from "./ContextualRail";
import { MobileBottomNav } from "./MobileBottomNav";
import { SitaCompanionBar } from "./SitaCompanionBar";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { WelcomeTour } from "./WelcomeTour";
import { InteractiveTutorial } from "./InteractiveTutorial";
import { QuickAddWizard, QuickAddFAB } from "./QuickAddWizard";
import { CopilotBar } from "./CopilotBar";
import { InteractionTracker } from "./InteractionTracker";
import { ErrorBoundary } from "./ErrorBoundary";
import { DesktopEntryCeremony } from "./DesktopEntryCeremony";
import { PWAInstallPrompt } from "./PWAInstallPrompt";
import { ContinuityBanner } from "./ContinuityBanner";
import { UpdateBanner } from "./UpdateBanner";
import { UniversalCommandSurface } from "./shell/UniversalCommandSurface";
import { ShellAmbientBackground } from "./shell/ShellAmbientBackground";
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications";
import { useProactiveNotifications } from "@/hooks/use-proactive-notifications";
import { useDisplayMode } from "@/contexts/DisplayModeContext";
import { useInspector } from "@/contexts/InspectorContext";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Route-aware page transitions
const drillDownSegments = ["mission", "owner", "business", "money", "concierge"];

const getPageTransition = (pathname: string) => {
  const segment = pathname.split("/").filter(Boolean)[0] || "home";
  const depth = pathname.split("/").filter(Boolean).length;

  if (depth > 1 && drillDownSegments.includes(segment)) {
    return {
      initial: { opacity: 0, x: 24 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -12 },
      transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] },
    };
  }

  return {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -4 },
    transition: { duration: 0.22, ease: [0.25, 0.1, 0.25, 1] },
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
  const location = useLocation();

  // Check for desktop entry ceremony trigger
  useEffect(() => {
    if (sessionStorage.getItem("sita-desktop-entry") === "true") {
      sessionStorage.removeItem("sita-desktop-entry");
      setShowEntryCeremony(true);
    }
  }, []);

  // Global command shortcut
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

  return (
    <SidebarProvider>
      {/* Desktop Entry Ceremony */}
      {showEntryCeremony && (
        <DesktopEntryCeremony onComplete={() => setShowEntryCeremony(false)} />
      )}

      {/* Universal Command Surface */}
      <UniversalCommandSurface open={commandOpen} onClose={() => setCommandOpen(false)} />

      <div className={cn("relative flex flex-col min-h-screen w-full bg-surface-0", isCalm && "calm-mode", isFocus && "focus-mode")}>
        {/* Ambient background — subtle, always present */}
        <ShellAmbientBackground intensity="subtle" className="fixed" />

        <UpdateBanner />
        <ContinuityBanner />
        <SitaTopBar
          onNotifOpen={() => setNotifOpen(true)}
          onTimelineOpen={() => setTimelineOpen(true)}
          onCommandOpen={() => setCommandOpen(true)}
        />

        <div className="relative z-10 flex flex-1 min-w-0">
          <AppSidebar />
          <div className="flex flex-1 min-w-0">
            <div className="flex flex-1 flex-col min-w-0">
              <main className="flex-1 overflow-auto scrollbar-thin">
                <ErrorBoundary>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={workspaceKey}
                      initial={transition.initial}
                      animate={transition.animate}
                      exit={transition.exit}
                      transition={transition.transition}
                      className="p-4 md:p-6"
                    >
                      {children}
                    </motion.div>
                  </AnimatePresence>
                </ErrorBoundary>
              </main>
            </div>
            {/* Persistent Contextual Rail — desktop only */}
            <ContextualRail />
          </div>
        </div>
      </div>

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

      {/* Mobile Bottom Nav */}
      <MobileBottomNav />

      {/* Keyboard Shortcuts Overlay */}
      <KeyboardShortcuts />

      {/* Behavioral Interaction Tracker — invisible */}
      <InteractionTracker />
    </SidebarProvider>
  );
};
