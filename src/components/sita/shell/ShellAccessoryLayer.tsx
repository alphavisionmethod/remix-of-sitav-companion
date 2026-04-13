// ═══════════════════════════════════════════════════════════════
// SITA OS — Shell Accessory Layer
// Advisor, Timeline, Inspector, Companion, and deferred UI
// ═══════════════════════════════════════════════════════════════

import { lazy, Suspense, useState } from "react";
import { SectionSkeleton } from "../PageSkeleton";

const AdvisorChat = lazy(() => import("../AdvisorChat").then(m => ({ default: m.AdvisorChat })));
const AdvisorFAB = lazy(() => import("../AdvisorFAB").then(m => ({ default: m.AdvisorFAB })));
const UniversalTimeline = lazy(() => import("../UniversalTimeline").then(m => ({ default: m.UniversalTimeline })));
const InspectorPanel = lazy(() => import("../InspectorPanel").then(m => ({ default: m.InspectorPanel })));
const ContextualRail = lazy(() => import("../ContextualRail").then(m => ({ default: m.ContextualRail })));
const SitaCompanionBar = lazy(() => import("../SitaCompanionBar").then(m => ({ default: m.SitaCompanionBar })));
const KeyboardShortcuts = lazy(() => import("../KeyboardShortcuts").then(m => ({ default: m.KeyboardShortcuts })));
const WelcomeTour = lazy(() => import("../WelcomeTour").then(m => ({ default: m.WelcomeTour })));
const InteractiveTutorial = lazy(() => import("../InteractiveTutorial").then(m => ({ default: m.InteractiveTutorial })));
const QuickAddWizard = lazy(() => import("../QuickAddWizard").then(m => ({ default: m.QuickAddWizard })));
const QuickAddFAB = lazy(() => import("../QuickAddWizard").then(m => ({ default: m.QuickAddFAB })));
const CopilotBar = lazy(() => import("../CopilotBar").then(m => ({ default: m.CopilotBar })));
const DevicePresenceIndicator = lazy(() => import("../DevicePresenceIndicator").then(m => ({ default: m.DevicePresenceIndicator })));
const SuccessCelebration = lazy(() => import("../SuccessCelebration").then(m => ({ default: m.SuccessCelebration })));
const DesktopEntryCeremony = lazy(() => import("../DesktopEntryCeremony").then(m => ({ default: m.DesktopEntryCeremony })));
const PWAInstallPrompt = lazy(() => import("../PWAInstallPrompt").then(m => ({ default: m.PWAInstallPrompt })));
const ContinuityBanner = lazy(() => import("../ContinuityBanner").then(m => ({ default: m.ContinuityBanner })));
const UpdateBanner = lazy(() => import("../UpdateBanner").then(m => ({ default: m.UpdateBanner })));
const ModeResolutionBanner = lazy(() => import("@/components/reality/ModeResolutionBanner").then(m => ({ default: m.ModeResolutionBanner })));

interface ShellAccessoryLayerProps {
  chatOpen: boolean;
  setChatOpen: (v: boolean) => void;
  timelineOpen: boolean;
  setTimelineOpen: (v: boolean) => void;
  wizardType: "lead" | "invoice" | "budget" | null;
  setWizardType: (v: "lead" | "invoice" | "budget" | null) => void;
  showEntryCeremony: boolean;
  setShowEntryCeremony: (v: boolean) => void;
  isDesktopRoute: boolean;
}

export function ShellAccessoryLayer({
  chatOpen, setChatOpen,
  timelineOpen, setTimelineOpen,
  wizardType, setWizardType,
  showEntryCeremony, setShowEntryCeremony,
  isDesktopRoute,
}: ShellAccessoryLayerProps) {
  return (
    <>
      {/* Desktop Entry Ceremony */}
      <Suspense fallback={null}>
        {showEntryCeremony && (
          <DesktopEntryCeremony onComplete={() => setShowEntryCeremony(false)} />
        )}
      </Suspense>

      {/* Banners */}
      <Suspense fallback={null}>
        <UpdateBanner />
        <ContinuityBanner />
      </Suspense>

      {/* Deferred shell features */}
      <Suspense fallback={null}>
        {/* Mobile overlay fallback for inspector */}
        <div className="lg:hidden">
          <InspectorPanel />
        </div>

        {/* Panels */}
        <UniversalTimeline isOpen={timelineOpen} onClose={() => setTimelineOpen(false)} />
        <AdvisorChat isOpen={chatOpen} onClose={() => setChatOpen(false)} />

        {/* Welcome Tour */}
        <WelcomeTour />
        <InteractiveTutorial />

        {/* Quick-Add Wizard */}
        {wizardType && <QuickAddWizard type={wizardType} onClose={() => setWizardType(null)} />}

        {/* Floating buttons */}
        <AdvisorFAB isOpen={chatOpen} onToggle={() => setChatOpen(!chatOpen)} />

        {/* PWA Install Prompt */}
        <PWAInstallPrompt />

        {/* (Companion Bar & Copilot Bar removed — legacy clutter) */}

        {/* Keyboard Shortcuts Overlay */}
        <KeyboardShortcuts />

        {/* (Device Presence Indicator removed — legacy clutter) */}

        {/* Mode Resolution Banner */}
        <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-1 pointer-events-none">
          <div className="max-w-md mx-auto pointer-events-auto">
            <ModeResolutionBanner />
          </div>
        </div>

        {/* Success Celebration overlay */}
        <SuccessCelebration show={false} />
      </Suspense>

      {/* Contextual Rail (desktop only, not on home) */}
      {!isDesktopRoute && (
        <Suspense fallback={<div className="hidden lg:block w-72 p-4"><SectionSkeleton lines={5} /></div>}>
          <ContextualRail />
        </Suspense>
      )}
    </>
  );
}
