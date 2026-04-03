import { ReactNode, useState } from "react";
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
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications";
import { useProactiveNotifications } from "@/hooks/use-proactive-notifications";
import { useDisplayMode } from "@/contexts/DisplayModeContext";
import { useInspector } from "@/contexts/InspectorContext";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const pageTransition = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: 0.22, ease: [0.25, 0.1, 0.25, 1] },
};

export const ShellLayout = ({ children }: { children: ReactNode }) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [wizardType, setWizardType] = useState<"lead" | "invoice" | "budget" | null>(null);
  const { isCalm, isFocus } = useDisplayMode();
  const { isOpen: railOpen } = useInspector();
  const location = useLocation();

  // Phase 4: Real-time notification toasts
  useRealtimeNotifications();
  useProactiveNotifications();

  const workspaceKey = location.pathname.split("/").filter(Boolean)[0] || "home";

  return (
    <SidebarProvider>
      <div className={cn("flex flex-col min-h-screen w-full bg-surface-0", isCalm && "calm-mode", isFocus && "focus-mode")}>
        <SitaTopBar
          onNotifOpen={() => setNotifOpen(true)}
          onTimelineOpen={() => setTimelineOpen(true)}
        />

        <div className="flex flex-1 min-w-0">
          <AppSidebar />
          <div className="flex flex-1 min-w-0">
            <div className="flex flex-1 flex-col min-w-0">
              <main className="flex-1 overflow-auto scrollbar-thin">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={workspaceKey}
                    initial={pageTransition.initial}
                    animate={pageTransition.animate}
                    exit={pageTransition.exit}
                    transition={pageTransition.transition}
                    className="p-4 md:p-6"
                  >
                    {children}
                  </motion.div>
                </AnimatePresence>
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

      {/* SITA Companion Bar — always present */}
      <SitaCompanionBar />

      {/* Mobile Bottom Nav */}
      <MobileBottomNav />

      {/* Keyboard Shortcuts Overlay */}
      <KeyboardShortcuts />
    </SidebarProvider>
  );
};
