// ═══════════════════════════════════════════════════════════════
// SITA OS — Desktop Surface with Draggable Widgets
// Branded wallpaper + free-form widget canvas
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useWindowManagerContext } from "@/contexts/WindowManagerContext";
import { FloatingWindow } from "./FloatingWindow";
import { ShellAmbientBackground } from "./ShellAmbientBackground";
import { WindowCompositor } from "@/platform/sita/components/sita/os/WindowCompositor";
import { useOSWindowContext } from "@/platform/sita/components/sita/os/WindowContext";
import { useDesktopWidgets } from "@/hooks/useDesktopWidgets";
import { useWallpaper } from "@/hooks/use-wallpaper";
import { DraggableWidget } from "./desktop/DraggableWidget";
import { WidgetPicker } from "./desktop/WidgetPicker";
import { SurfaceContextMenu } from "./SurfaceContextMenu";
import {
  DesktopClockWidget,
  DesktopNotificationsWidget,
  DesktopQuickActionsWidget,
  DesktopSystemWidget,
  DesktopWhatMattersWidget,
  DesktopNotificationsFeedWidget,
  DesktopInvestmentPulseWidget,
  DesktopCRMPipelineWidget,
  DesktopLeadsRecoveredWidget,
  DesktopCalendarTodayWidget,
  DesktopBoardroomBriefWidget,
  DesktopAdvisorCouncilWidget,
  DesktopBusinessKPIWidget,
  DesktopFinanceSnapshotWidget,
  DesktopConciergeTasksWidget,
  DesktopWeatherWidget,
  DesktopPortfolioMapWidget,
} from "./desktop";
import { DesktopLeftRail } from "./desktop/DesktopLeftRail";
import type { ContinuityContext, DesktopState } from "./useShellState";

interface DesktopSurfaceProps {
  onOpenCommand?: () => void;
  desktopState?: DesktopState;
  continuity?: ContinuityContext;
  onLaunchApp?: (appId: string) => void;
}

const DEFAULT_CONTINUITY: ContinuityContext = {
  lastWorkspace: null,
  lastActivity: null,
  pendingDrafts: 0,
  unfinishedWorkflows: 0,
  whatChanged: [],
};

// ── Large Bottom-Left Clock ──────────────────────────────────
function DesktopBigClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const h = now.getHours();
  const h12 = h % 12 || 12;
  const mm = now.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const blink = now.getSeconds() % 2 === 0;
  const dateLine = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="select-none">
      <div className="flex items-baseline gap-1">
        <span className="text-7xl font-extralight tracking-tight text-white tabular-nums drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)]">
          {h12}
        </span>
        <span
          className={cn(
            "text-7xl font-extralight text-white/80 transition-opacity duration-500",
            blink ? "opacity-100" : "opacity-20"
          )}
        >
          :
        </span>
        <span className="text-7xl font-extralight tracking-tight text-white tabular-nums drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)]">
          {mm}
        </span>
        <span className="ml-2 text-xl font-light text-white/40">{ampm}</span>
      </div>
      <div className="mt-2 text-lg font-light text-white/55 tracking-wide drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
        {dateLine}
      </div>
    </div>
  );
}

// ── Compact Continuity Card ──────────────────────────────────
function ContinuityCard({ continuity, onLaunchApp }: { continuity: ContinuityContext; onLaunchApp?: (appId: string) => void }) {
  const pending = continuity.pendingDrafts + continuity.unfinishedWorkflows;
  const resumeLabel = continuity.lastWorkspace ? `Resume ${continuity.lastWorkspace}` : "Workspace ready";
  const targetApp = continuity.lastWorkspace?.toLowerCase() ?? "business";

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-[40px] overflow-hidden w-[300px] shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
      <div className="h-px bg-gradient-to-r from-violet-500/30 via-fuchsia-500/20 to-transparent" />
      <div className="p-4">
        <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/25 mb-2">Continuity</div>
        <h3 className="text-sm font-semibold text-white">{resumeLabel}</h3>
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => onLaunchApp?.(targetApp)}
            className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-900 shadow-sm transition hover:bg-white hover:scale-[1.02]"
          >
            Continue
          </button>
          {pending > 0 && <span className="text-[11px] text-white/45">{pending} pending</span>}
        </div>
      </div>
    </div>
  );
}

// ── Widget Renderer ──────────────────────────────────────────
function renderWidget(type: string, onOpenCommand?: () => void, continuity?: ContinuityContext, onLaunchApp?: (appId: string) => void) {
  switch (type) {
    case "clock":
      return <DesktopBigClock />;
    case "quick-actions":
      return (
        <div className="w-[320px]">
          <DesktopQuickActionsWidget onOpenCommand={onOpenCommand} onLaunchApp={onLaunchApp} />
        </div>
      );
    case "system":
      return (
        <div className="w-[320px]">
          <DesktopSystemWidget onLaunchApp={onLaunchApp} />
        </div>
      );
    case "calendar":
      return (
        <div className="w-[320px]">
          <DesktopClockWidget onLaunchApp={onLaunchApp} />
        </div>
      );
    case "apps-rail":
      return <DesktopLeftRail onLaunchApp={onLaunchApp} />;
    case "notifications":
      return (
        <div className="w-[320px]">
          <DesktopNotificationsWidget />
        </div>
      );
    case "continuity":
      return <ContinuityCard continuity={continuity ?? DEFAULT_CONTINUITY} onLaunchApp={onLaunchApp} />;
    case "what-matters":
      return (<div className="w-[340px]"><DesktopWhatMattersWidget onLaunchApp={onLaunchApp} /></div>);
    case "notifications-feed":
      return (<div className="w-[320px]"><DesktopNotificationsFeedWidget /></div>);
    case "investment-pulse":
      return (<div className="w-[320px]"><DesktopInvestmentPulseWidget onLaunchApp={onLaunchApp} /></div>);
    case "crm-pipeline":
      return (<div className="w-[320px]"><DesktopCRMPipelineWidget onLaunchApp={onLaunchApp} /></div>);
    case "leads-recovered":
      return (<div className="w-[320px]"><DesktopLeadsRecoveredWidget onLaunchApp={onLaunchApp} /></div>);
    case "calendar-today":
      return (<div className="w-[320px]"><DesktopCalendarTodayWidget onLaunchApp={onLaunchApp} /></div>);
    case "boardroom-brief":
      return (<div className="w-[320px]"><DesktopBoardroomBriefWidget onLaunchApp={onLaunchApp} /></div>);
    case "advisor-council":
      return (<div className="w-[320px]"><DesktopAdvisorCouncilWidget onLaunchApp={onLaunchApp} /></div>);
    case "business-kpi":
      return (<div className="w-[320px]"><DesktopBusinessKPIWidget onLaunchApp={onLaunchApp} /></div>);
    case "finance-snapshot":
      return (<div className="w-[320px]"><DesktopFinanceSnapshotWidget onLaunchApp={onLaunchApp} /></div>);
    case "concierge-tasks":
      return (<div className="w-[320px]"><DesktopConciergeTasksWidget onLaunchApp={onLaunchApp} /></div>);
    case "weather":
      return (<div className="w-[280px]"><DesktopWeatherWidget /></div>);
    case "portfolio-globe":
      return (<div className="w-[320px]"><DesktopPortfolioMapWidget onLaunchApp={onLaunchApp} /></div>);
    default:
      return null;
  }
}

export function DesktopSurface({
  onOpenCommand,
  desktopState = "quiet",
  continuity = DEFAULT_CONTINUITY,
  onLaunchApp,
}: DesktopSurfaceProps) {
  const desktopRef = useRef<HTMLDivElement>(null);
  const { activeId: wallpaperId } = useWallpaper();
  const { widgets, hiddenWidgets, allWidgets, moveWidget, removeWidget, addWidget, resizeWidget, resetWidgets, allTypes } = useDesktopWidgets();
  const [pickerOpen, setPickerOpen] = useState(false);

  // Allow other shell surfaces (Dock, Launcher, keyboard shortcuts) to open the
  // Widget Gallery via a window-level event. Single source of truth for "Widgets".
  useEffect(() => {
    const handler = () => setPickerOpen(true);
    window.addEventListener("sita-open-widget-picker", handler);
    return () => window.removeEventListener("sita-open-widget-picker", handler);
  }, []);

  // Legacy window manager
  const windowManager = useWindowManagerContext();
  const visibleWindows = windowManager?.visibleWindows ?? [];
  const maxZ = visibleWindows.reduce((max, w) => Math.max(max, w.zIndex), 0);

  // OS Window Engine
  const { openWindows } = useOSWindowContext();
  const hasAnyWindows = visibleWindows.length > 0 || openWindows.some(w => !w.isMinimized);

  // Wallpaper base gradient
  const wallpaperTheme = useWallpaper().theme;
  const baseGradient = wallpaperId === "sita-hero"
    ? "from-[hsl(230,60%,18%)] via-[hsl(260,50%,22%)] to-[hsl(280,45%,16%)]"
    : wallpaperId === "auto"
      ? "from-[hsl(265,45%,12%)] via-[hsl(280,35%,8%)] to-[hsl(220,40%,6%)]"
      : wallpaperTheme.gradient || "from-[hsl(265,45%,12%)] via-[hsl(280,35%,8%)] to-[hsl(220,40%,6%)]";

  return (
    <div ref={desktopRef} className="fixed inset-0" onDoubleClick={() => onOpenCommand?.()}>
      <SurfaceContextMenu
        surface="desktop"
        onAddWidget={() => setPickerOpen(true)}
      >
        <div className="absolute inset-0 z-0">
          {/* Layer 0: Deep gradient base (inside trigger so right-click on empty desktop works) */}
          <div className={cn("absolute inset-0 bg-gradient-to-br", baseGradient)} />
        </div>
      </SurfaceContextMenu>
      {/* Layer 0.5: Wallpaper overlay */}
      {wallpaperTheme.overlay && wallpaperId !== "sita-hero" && (
        <div className="absolute inset-0 z-[0]" style={{ background: wallpaperTheme.overlay }} />
      )}

      {/* Layer 1: Ambient Wallpaper */}
      <div className="absolute inset-0 z-[1]">
        <ShellAmbientBackground intensity="vivid" className="fixed" wallpaperId={wallpaperId} />
      </div>

      {/* Layer 2: Desktop Content — Draggable Widgets + Left Rail */}
      <div className={cn(
        "absolute inset-0 z-10 transition-all duration-700",
        hasAnyWindows && "opacity-30 blur-sm pointer-events-none"
      )}>
        {/* Left rail is now a draggable widget — registered as "apps-rail" */}
        {/* Draggable widgets */}
        {widgets.map((w) => (
          <DraggableWidget
            key={w.id}
            id={w.id}
            position={w.position}
            onMove={moveWidget}
            onRemove={removeWidget}
            dragConstraints={desktopRef}
          >
            {renderWidget(w.type, onOpenCommand, continuity, onLaunchApp)}
          </DraggableWidget>
        ))}

        {/* Add Widget FAB — labeled "Widgets" so the affordance is unmistakable */}
        {!hasAnyWindows && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            onClick={() => setPickerOpen(true)}
            className="group fixed bottom-24 left-6 z-20 flex items-center gap-2 h-10 pl-2.5 pr-3.5 rounded-full border border-white/[0.12] bg-white/[0.06] backdrop-blur-xl text-white/60 hover:text-white hover:bg-white/[0.12] hover:border-white/[0.22] transition-all shadow-lg"
            title="Widgets — add or remove desktop widgets"
            aria-label="Open widget gallery to add or remove desktop widgets"
            data-testid="desktop-add-widget-fab"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.08] group-hover:bg-white/[0.14] transition-colors">
              <Plus className="h-4 w-4" />
            </span>
            <span className="text-[12px] font-medium tracking-wide">Widgets</span>
          </motion.button>
        )}
      </div>

      {/* Widget Gallery */}
      <WidgetPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        hiddenWidgets={hiddenWidgets}
        allWidgets={allWidgets}
        allTypes={allTypes}
        onAdd={(type) => addWidget(type)}
        onRemove={(id) => removeWidget(id)}
        onReset={() => { resetWidgets(); setPickerOpen(false); }}
      />

      {/* Layer 3: Legacy Window Compositor */}
      <div className={cn("absolute inset-0 z-20", visibleWindows.length === 0 && "pointer-events-none")}>
        <AnimatePresence>
          {visibleWindows.map((w, index) => {
            const spawnOffset = index * 30;
            const cascadedPosition = w.position || { x: 100 + spawnOffset, y: 80 + spawnOffset };
            return (
              <FloatingWindow
                key={w.id}
                windowId={w.id}
                title={w.title}
                initialPosition={cascadedPosition}
                width={w.width}
                originRect={w.originRect}
                onClose={() => windowManager?.closeWindow(w.id)}
                onMinimize={() => windowManager?.minimizeWindow(w.id)}
                onMaximize={() => windowManager?.maximizeWindow(w.id)}
                onFocus={() => windowManager?.focusWindow(w.id)}
                isFocused={w.zIndex === maxZ}
                isMaximized={w.maximized}
                style={{ zIndex: 100 + w.zIndex }}
              >
                {w.component}
              </FloatingWindow>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Layer 4: OS Window Engine */}
      <WindowCompositor />
    </div>
  );
}
