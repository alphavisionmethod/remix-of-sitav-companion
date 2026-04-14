// ═══════════════════════════════════════════════════════════════
// SITA OS — Desktop Surface with Draggable Widgets
// Branded wallpaper + free-form widget canvas
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useWindowManagerContext } from "@/contexts/WindowManagerContext";
import { FloatingWindow } from "./FloatingWindow";
import { ShellAmbientBackground } from "./ShellAmbientBackground";
import { WindowCompositor } from "@/components/sita/os/WindowCompositor";
import { useOSWindowContext } from "@/components/sita/os/WindowContext";
import { useDesktopWidgets } from "@/hooks/useDesktopWidgets";
import { useWallpaper } from "@/hooks/use-wallpaper";
import { DraggableWidget } from "./desktop/DraggableWidget";
import { WidgetPicker } from "./desktop/WidgetPicker";
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
function ContinuityCard({ continuity }: { continuity: ContinuityContext }) {
  const navigate = useNavigate();
  const pending = continuity.pendingDrafts + continuity.unfinishedWorkflows;
  const resumeLabel = continuity.lastWorkspace ? `Resume ${continuity.lastWorkspace}` : "Workspace ready";

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-[40px] overflow-hidden w-[300px] shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
      <div className="h-px bg-gradient-to-r from-violet-500/30 via-fuchsia-500/20 to-transparent" />
      <div className="p-4">
        <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/25 mb-2">Continuity</div>
        <h3 className="text-sm font-semibold text-white">{resumeLabel}</h3>
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => navigate(continuity.lastWorkspace ? `/${continuity.lastWorkspace.toLowerCase()}` : "/business")}
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
          <DesktopSystemWidget />
        </div>
      );
    case "calendar":
      return (
        <div className="w-[320px]">
          <DesktopClockWidget />
        </div>
      );
    case "notifications":
      return (
        <div className="w-[320px]">
          <DesktopNotificationsWidget />
        </div>
      );
    case "continuity":
      return <ContinuityCard continuity={continuity ?? DEFAULT_CONTINUITY} />;
    case "what-matters":
      return (<div className="w-[340px]"><DesktopWhatMattersWidget /></div>);
    case "notifications-feed":
      return (<div className="w-[320px]"><DesktopNotificationsFeedWidget /></div>);
    case "investment-pulse":
      return (<div className="w-[320px]"><DesktopInvestmentPulseWidget /></div>);
    case "crm-pipeline":
      return (<div className="w-[320px]"><DesktopCRMPipelineWidget /></div>);
    case "leads-recovered":
      return (<div className="w-[320px]"><DesktopLeadsRecoveredWidget /></div>);
    case "calendar-today":
      return (<div className="w-[320px]"><DesktopCalendarTodayWidget /></div>);
    case "boardroom-brief":
      return (<div className="w-[320px]"><DesktopBoardroomBriefWidget /></div>);
    case "advisor-council":
      return (<div className="w-[320px]"><DesktopAdvisorCouncilWidget /></div>);
    case "business-kpi":
      return (<div className="w-[320px]"><DesktopBusinessKPIWidget /></div>);
    case "finance-snapshot":
      return (<div className="w-[320px]"><DesktopFinanceSnapshotWidget /></div>);
    case "concierge-tasks":
      return (<div className="w-[320px]"><DesktopConciergeTasksWidget /></div>);
    case "weather":
      return (<div className="w-[280px]"><DesktopWeatherWidget /></div>);
    case "portfolio-globe":
      return (<div className="w-[320px]"><DesktopPortfolioMapWidget /></div>);
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
  const navigate = useNavigate();
  const desktopRef = useRef<HTMLDivElement>(null);
  const { activeId: wallpaperId } = useWallpaper();
  const { widgets, hiddenWidgets, allWidgets, moveWidget, removeWidget, addWidget, resizeWidget, resetWidgets, allTypes } = useDesktopWidgets();
  const [pickerOpen, setPickerOpen] = useState(false);

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

  // Right-click context menu handler
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setPickerOpen(true);
  };

  return (
    <div ref={desktopRef} className="fixed inset-0" onDoubleClick={() => onOpenCommand?.()} onContextMenu={handleContextMenu}>
      {/* Layer 0: Deep gradient base */}
      <div className={cn("absolute inset-0 z-0 bg-gradient-to-br", baseGradient)} />

      {/* Layer 0.5: Wallpaper overlay */}
      {wallpaperTheme.overlay && wallpaperId !== "sita-hero" && (
        <div className="absolute inset-0 z-[0]" style={{ background: wallpaperTheme.overlay }} />
      )}

      {/* Layer 1: Ambient Wallpaper */}
      <div className="absolute inset-0 z-[1]">
        <ShellAmbientBackground intensity="vivid" className="fixed" wallpaperId={wallpaperId} />
      </div>

      {/* Layer 2: Desktop Content — Draggable Widgets */}
      <div className={cn(
        "absolute inset-0 z-10 transition-all duration-700",
        hasAnyWindows && "opacity-30 blur-sm pointer-events-none"
      )}>
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

        {/* Add Widget FAB */}
        {!hasAnyWindows && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            onClick={() => setPickerOpen(true)}
            className="fixed bottom-24 left-6 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.05] backdrop-blur-xl text-white/40 hover:text-white/80 hover:bg-white/[0.1] transition-all shadow-lg"
            title="Edit Widgets"
          >
            <Plus className="h-5 w-5" />
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
