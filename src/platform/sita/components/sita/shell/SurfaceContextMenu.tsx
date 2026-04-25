// ═══════════════════════════════════════════════════════════════
// SITA OS — SurfaceContextMenu
// Surface-aware right-click dispatcher. Renders the correct menu
// based on `surface` prop ("desktop" | "app-window" | "widget").
// ═══════════════════════════════════════════════════════════════

import { useMemo, type ReactNode } from "react";
import { toast } from "sonner";
import {
  ContextMenu,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useDesktopWidgets } from "@/hooks/useDesktopWidgets";
import {
  useOSWindowContext,
  type OSWindow,
  type SnapDirection,
} from "@/components/sita/os/WindowContext";

import { DesktopMenuContent, type DesktopMenuHandlers } from "@/lib/context-menu/desktop-menu";
import { AppWindowMenuContent, type AppWindowMenuHandlers } from "@/lib/context-menu/app-window-menu";
import { WidgetMenuContent, type WidgetMenuHandlers } from "@/lib/context-menu/widget-menu";

type SurfaceProps =
  | {
      surface: "desktop";
      onAddWidget: () => void;
      onChangeWallpaper?: () => void;
      onOpenSettings?: () => void;
      children: ReactNode;
    }
  | {
      surface: "app-window";
      window: OSWindow;
      children: ReactNode;
    }
  | {
      surface: "widget";
      widgetId: string;
      pinned?: boolean;
      onTogglePinned?: () => void;
      onRefresh?: () => void;
      onSettings?: () => void;
      children: ReactNode;
    };

export function SurfaceContextMenu(props: SurfaceProps) {
  if (props.surface === "desktop") return <DesktopMenu {...props} />;
  if (props.surface === "app-window") return <AppWindowMenu {...props} />;
  return <WidgetMenu {...props} />;
}

/* ── Desktop ──────────────────────────────────────────────── */
function DesktopMenu({
  onAddWidget,
  onChangeWallpaper,
  onOpenSettings,
  children,
}: Extract<SurfaceProps, { surface: "desktop" }>) {
  const handlers: DesktopMenuHandlers = useMemo(
    () => ({
      onAddWidget,
      onChangeWallpaper:
        onChangeWallpaper ??
        (() => window.dispatchEvent(new CustomEvent("sita-open-app", { detail: { appId: "settings" } }))),
      onOpenSettings:
        onOpenSettings ??
        (() => window.dispatchEvent(new CustomEvent("sita-open-app", { detail: { appId: "settings" } }))),
      onPersonalize: () =>
        window.dispatchEvent(new CustomEvent("sita-open-app", { detail: { appId: "settings" } })),
      onRefresh: () => {
        window.dispatchEvent(new CustomEvent("sita-refresh-desktop"));
        toast.success("Desktop refreshed");
      },
      onNewFolder: () => toast.message("New Folder", { description: "Coming soon." }),
      onNewFile: (k) => toast.message(`New ${k}`, { description: "Coming soon." }),
      onSetIconSize: (s) => {
        window.dispatchEvent(new CustomEvent("sita-set-icon-size", { detail: { size: s } }));
        toast.success(`Icon size: ${s.toUpperCase()}`);
      },
      onSortBy: (k) => {
        window.dispatchEvent(new CustomEvent("sita-sort-desktop", { detail: { key: k } }));
        toast.success(`Sorted by ${k}`);
      },
      onOpenTerminal: () =>
        window.dispatchEvent(new CustomEvent("sita-open-app", { detail: { appId: "terminal" } })),
    }),
    [onAddWidget, onChangeWallpaper, onOpenSettings],
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <DesktopMenuContent h={handlers} />
    </ContextMenu>
  );
}

/* ── App window ───────────────────────────────────────────── */
function AppWindowMenu({
  window: win,
  children,
}: Extract<SurfaceProps, { surface: "app-window" }>) {
  const {
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    snapWindow,
    togglePinned,
  } = useOSWindowContext();

  const handlers: AppWindowMenuHandlers = useMemo(
    () => ({
      win,
      onRestore: () => { if (win.isMaximized) maximizeWindow(win.id); },
      onMinimize: () => minimizeWindow(win.id),
      onMaximize: () => maximizeWindow(win.id),
      onClose: () => closeWindow(win.id),
      onSnap: (dir: SnapDirection) => snapWindow(win.id, dir),
      onTogglePinned: () => togglePinned(win.id),
      onReload: () => {
        window.dispatchEvent(new CustomEvent("sita-reload-app", { detail: { id: win.id } }));
        toast.success(`Reloaded ${win.title}`);
      },
      onInfo: () => toast.message(win.title, { description: `Window id: ${win.id}` }),
      onMoveMode: () => toast.info("Use the title bar to drag the window."),
      onResizeMode: () => toast.info("Use the window edge handles to resize."),
    }),
    [win, closeWindow, minimizeWindow, maximizeWindow, snapWindow, togglePinned],
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <AppWindowMenuContent h={handlers} />
    </ContextMenu>
  );
}

/* ── Widget ──────────────────────────────────────────────── */
function WidgetMenu({
  widgetId,
  pinned,
  onTogglePinned,
  onRefresh,
  onSettings,
  children,
}: Extract<SurfaceProps, { surface: "widget" }>) {
  const { resizeWidget, removeWidget } = useDesktopWidgets();

  const handlers: WidgetMenuHandlers = useMemo(
    () => ({
      widgetId,
      pinned,
      onRefresh:
        onRefresh ??
        (() => {
          window.dispatchEvent(new CustomEvent("sita-refresh-widget", { detail: { id: widgetId } }));
          toast.success("Widget refreshed");
        }),
      onResize: (size) => resizeWidget(widgetId, size),
      onTogglePinned:
        onTogglePinned ??
        (() => toast.info(pinned ? "Widget unpinned" : "Widget pinned")),
      onSettings:
        onSettings ??
        (() => toast.message("Widget settings", { description: "Coming soon." })),
      onRemove: () => removeWidget(widgetId),
    }),
    [widgetId, pinned, onRefresh, onTogglePinned, onSettings, resizeWidget, removeWidget],
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <WidgetMenuContent h={handlers} />
    </ContextMenu>
  );
}
