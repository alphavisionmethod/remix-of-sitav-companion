// ═══════════════════════════════════════════════════════════════
// SITA OS — Shell Live Layer
// Live Activity, Click Ripple, Command Layer, Boot Splash,
// App Switcher, Control Center, Notifications, PiP, etc.
// ═══════════════════════════════════════════════════════════════

import { lazy, Suspense, useState, useCallback, useEffect } from "react";
import { useWindowManager } from "@/hooks/useWindowManager";
type WindowManager = ReturnType<typeof useWindowManager>;
import { useFocusMode } from "@/hooks/use-focus-mode";
import { useSitaAmbientMood } from "./sita-hud";

const UniversalCommandSurface = lazy(() => import("./UniversalCommandSurface").then(m => ({ default: m.UniversalCommandSurface })));
const ShellAmbientBackground = lazy(() => import("./ShellAmbientBackground").then(m => ({ default: m.ShellAmbientBackground })));
const DesktopDock = lazy(() => import("../DesktopDock").then(m => ({ default: m.DesktopDock })));
const AppLauncherPanelLazy = lazy(() => import("./AppLauncherPanel").then(m => ({ default: m.AppLauncherPanel })));
const CommandPalette = lazy(() => import("../CommandPalette").then(m => ({ default: m.CommandPalette })));
const NotificationCenterPanel = lazy(() => import("../NotificationCenter").then(m => ({ default: m.NotificationCenter })));
const FlowSpaceLazy = lazy(() => import("./FlowSpace").then(m => ({ default: m.FlowSpace })));
const EdgePanelsLazy = lazy(() => import("./EdgePanels").then(m => ({ default: m.EdgePanels })));
const UniversalCommandLazy = lazy(() => import("../UniversalCommand").then(m => ({ default: m.UniversalCommand })));
const AmbientSuggestionsBarLazy = lazy(() => import("../AmbientSuggestionsBar").then(m => ({ default: m.AmbientSuggestionsBar })));
const SpatialDesktopLazy = lazy(() => import("./SpatialDesktop").then(m => ({ default: m.SpatialDesktop })));
const HoldKeyOverlayLazy = lazy(() => import("./HoldKeyOverlay").then(m => ({ default: m.HoldKeyOverlay })));
const LiveActivityBarLazy = lazy(() => import("./LiveActivityBar").then(m => ({ default: m.LiveActivityBar })));
const ContextualCursorLazy = lazy(() => import("./ContextualCursor").then(m => ({ default: m.ContextualCursor })));
const BootSplashLazy = lazy(() => import("./BootSplash").then(m => ({ default: m.BootSplash })));
const AppSwitcherLazy = lazy(() => import("./AppSwitcher").then(m => ({ default: m.AppSwitcher })));
const ControlCenterLazy = lazy(() => import("./ControlCenter").then(m => ({ default: m.ControlCenter })));
const NotificationDropdownLazy = lazy(() => import("./NotificationDropdown").then(m => ({ default: m.NotificationDropdown })));
const PictureInPictureLazy = lazy(() => import("./PictureInPicture").then(m => ({ default: m.PictureInPicture })));
const IntentSuggestionsWidgetLazy = lazy(() => import("./IntentSuggestionsWidget").then(m => ({ default: m.IntentSuggestionsWidget })));
const AppRecentsStripLazy = lazy(() => import("../AppRecentsStrip").then(m => ({ default: m.AppRecentsStrip })));
// ── Sita HUD (Phase A) ──────────────────────────────────────────
const SitaPresenceOrbLazy = lazy(() => import("./sita-hud").then(m => ({ default: m.SitaPresenceOrb })));
const SitaHudStripLazy = lazy(() => import("./sita-hud").then(m => ({ default: m.SitaHudStrip })));
const SitaFirstRunRevealLazy = lazy(() => import("./sita-hud").then(m => ({ default: m.SitaFirstRunReveal })));
const SitaWhisperLazy = lazy(() => import("./sita-hud").then(m => ({ default: m.SitaWhisper })));
const SitaProactiveRunnerLazy = lazy(() => import("./sita-hud").then(m => ({ default: m.SitaProactiveRunner })));
const SitaActionPlanCardLazy = lazy(() => import("./sita-agent").then(m => ({ default: m.SitaActionPlanCard })));
const SitaAgentMountLazy = lazy(() => import("./sita-agent").then(m => ({ default: m.SitaAgentMount })));
// ── Sita Spatial (Phase F) ──────────────────────────────────────
const SitaHandoffBannerLazy = lazy(() => import("./sita-spatial").then(m => ({ default: m.SitaHandoffBanner })));
const SitaGestureLayerLazy = lazy(() => import("./sita-spatial").then(m => ({ default: m.SitaGestureLayer })));
const SitaHolographicBoardroomLazy = lazy(() => import("./sita-spatial").then(m => ({ default: m.SitaHolographicBoardroom })));
const SitaSpatialFieldLazy = lazy(() => import("./sita-spatial").then(m => ({ default: m.SitaSpatialField })));
const SitaSpatialIntentMountLazy = lazy(() => import("./sita-spatial").then(m => ({ default: m.SitaSpatialIntentMount })));
const SitaCortexMountLazy = lazy(() => import("./sita-cortex").then(m => ({ default: m.SitaCortexMount })));
const SitaSentienceMountLazy = lazy(() => import("./sita-sentience").then(m => ({ default: m.SitaSentienceMount })));
const SitaEmbodimentMountLazy = lazy(() => import("@/lib/sita-embodiment").then(m => ({ default: m.SitaEmbodimentMount })));

interface ShellLiveLayerProps {
  wm: WindowManager;
  commandOpen: boolean;
  setCommandOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
  notifOpen: boolean;
  setNotifOpen: (v: boolean) => void;
  missionControlOpen: boolean;
  setMissionControlOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
  spatialOpen: boolean;
  setSpatialOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
  controlCenterOpen: boolean;
  setControlCenterOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
  notifDropdownOpen: boolean;
  setNotifDropdownOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
  launcherOpen: boolean;
  setLauncherOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
  handleLaunchApp: (appId: string, originRect?: DOMRect) => void;
  doLaunchApp: (appId: string, originRect?: DOMRect) => void;
}

export function ShellLiveLayer({
  wm,
  commandOpen, setCommandOpen,
  notifOpen, setNotifOpen,
  missionControlOpen, setMissionControlOpen,
  spatialOpen, setSpatialOpen,
  controlCenterOpen, setControlCenterOpen,
  notifDropdownOpen, setNotifDropdownOpen,
  launcherOpen, setLauncherOpen,
  handleLaunchApp, doLaunchApp,
}: ShellLiveLayerProps) {
  const [showBootSplash, setShowBootSplash] = useState(true);
  const [pipWindows, setPipWindows] = useState<Array<{ id: string; title: string; type: "music" | "generic"; data?: any }>>([]);
  const focusMode = useFocusMode();
  const sitaMood = useSitaAmbientMood();

  return (
    <>
      {/* Universal Command Surfaces */}
      <Suspense fallback={null}>
        <UniversalCommandSurface open={commandOpen} onClose={() => setCommandOpen(false)} onSystemCommand={(cmd) => {
          if (cmd === "focus") { focusMode.active ? focusMode.stop() : focusMode.start(25); }
        }} />
        <UniversalCommandLazy
          open={commandOpen}
          onClose={() => setCommandOpen(false)}
          onSystemCommand={(cmd, args) => {
            if (cmd === "focus") { focusMode.active ? focusMode.stop() : focusMode.start(25); }
          }}
        />
        <SpatialDesktopLazy isOpen={spatialOpen} onClose={() => setSpatialOpen(false)} />
        <NotificationCenterPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
        <FlowSpaceLazy
          isOpen={missionControlOpen}
          windows={wm.windows}
          onSelectWindow={(id) => { wm.focusWindow(id); setMissionControlOpen(false); }}
          onClose={() => setMissionControlOpen(false)}
          onLaunchApp={(appId) => { doLaunchApp(appId); setMissionControlOpen(false); }}
        />
      </Suspense>

      {/* (Edge Panels removed — legacy clutter) */}

      {/* Ambient background */}
      <Suspense fallback={null}>
        <ShellAmbientBackground intensity="subtle" mood={sitaMood} className="fixed" />
      </Suspense>

      {/* Desktop Dock */}
      <Suspense fallback={null}>
        <DesktopDock onLaunchApp={handleLaunchApp} windowManager={wm} hasMaximizedWindow={wm.visibleWindows.some(w => w.position?.x === 0 && w.position?.y === 0)} onOpenLauncher={() => setLauncherOpen(true)} />
      </Suspense>

      {/* App Launcher Panel */}
      <Suspense fallback={null}>
        <AppLauncherPanelLazy open={launcherOpen} onClose={() => setLauncherOpen(false)} onLaunchApp={(id) => { handleLaunchApp(id); setLauncherOpen(false); }} />
      </Suspense>


      {/* Hold-Key Command Overlay */}
      <Suspense fallback={null}>
        <HoldKeyOverlayLazy />
      </Suspense>

      {/* Live Activity Bar */}
      <Suspense fallback={null}>
        <LiveActivityBarLazy />
      </Suspense>


      {/* Boot Splash */}
      <Suspense fallback={null}>
        {showBootSplash && <BootSplashLazy onComplete={() => setShowBootSplash(false)} />}
      </Suspense>

      {/* App Switcher */}
      <Suspense fallback={null}>
        <AppSwitcherLazy />
      </Suspense>

      {/* Control Center */}
      <Suspense fallback={null}>
        <ControlCenterLazy open={controlCenterOpen} onClose={() => setControlCenterOpen(false)} />
      </Suspense>

      {/* Notification Dropdown */}
      <Suspense fallback={null}>
        <NotificationDropdownLazy open={notifDropdownOpen} onClose={() => setNotifDropdownOpen(false)} />
      </Suspense>

      {/* Picture-in-Picture */}
      <Suspense fallback={null}>
        <PictureInPictureLazy
          windows={pipWindows}
          onClose={(id) => setPipWindows(prev => prev.filter(p => p.id !== id))}
          onExpand={(id) => {
            setPipWindows(prev => prev.filter(p => p.id !== id));
            wm.focusWindow(id);
          }}
        />
      </Suspense>

      {/* ── Sita HUD (Phase A) ─────────────────────────────────── */}
      <Suspense fallback={null}>
        <SitaHudStripLazy />
      </Suspense>
      <Suspense fallback={null}>
        <SitaPresenceOrbLazy />
      </Suspense>
      <Suspense fallback={null}>
        <SitaFirstRunRevealLazy />
      </Suspense>

      {/* ── Sita Proactive (Phase D) ───────────────────────────── */}
      <Suspense fallback={null}>
        <SitaWhisperLazy />
      </Suspense>
      <Suspense fallback={null}>
        <SitaProactiveRunnerLazy />
      </Suspense>

      {/* ── Sita Agent (Phase E) ───────────────────────────────── */}
      <Suspense fallback={null}>
        <SitaActionPlanCardLazy />
      </Suspense>
      <Suspense fallback={null}>
        <SitaAgentMountLazy />
      </Suspense>

      {/* ── Sita Spatial (Phase F) ─────────────────────────────── */}
      <Suspense fallback={null}>
        <SitaHandoffBannerLazy />
      </Suspense>
      <Suspense fallback={null}>
        <SitaGestureLayerLazy />
      </Suspense>
      <Suspense fallback={null}>
        <SitaHolographicBoardroomLazy />
      </Suspense>
      <Suspense fallback={null}>
        <SitaSpatialFieldLazy />
      </Suspense>
      <Suspense fallback={null}>
        <SitaSpatialIntentMountLazy />
      </Suspense>

      {/* ── Sita Cortex (Phase G) ──────────────────────────────── */}
      <Suspense fallback={null}>
        <SitaCortexMountLazy />
      </Suspense>

      {/* ── Sita Sentience (Phase H) ────────────────────────────── */}
      <Suspense fallback={null}>
        <SitaSentienceMountLazy />
      </Suspense>

      {/* ── Sita Embodiment (Phase I) ───────────────────────────── */}
      <Suspense fallback={null}>
        <SitaEmbodimentMountLazy />
      </Suspense>

    </>
  );
}
