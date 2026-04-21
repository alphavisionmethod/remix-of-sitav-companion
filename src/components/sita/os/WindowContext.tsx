import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";

// ═══════════════════════════════════════════════════════════════
// SITA OS — Window Context
// Manages OS-level window state: open, close, minimize, maximize, focus
// ═══════════════════════════════════════════════════════════════

export type SnapDirection = "left" | "right" | "top" | "bottom" | "center" | "full";

export interface OSWindow {
  id: string;
  title: string;
  component: ReactNode;
  isMinimized: boolean;
  isMaximized: boolean;
  isPinned?: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

interface OSWindowContextType {
  openWindows: OSWindow[];
  openWindow: (id: string, title: string, component: ReactNode, size?: { width: number; height: number }) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowPosition: (id: string, position: { x: number; y: number }) => void;
  updateWindowGeometry: (id: string, position: { x: number; y: number }, size: { width: number; height: number }) => void;
  snapWindow: (id: string, dir: SnapDirection) => void;
  togglePinned: (id: string) => void;
}

const OSWindowContext = createContext<OSWindowContextType | null>(null);

// ── Cascade + sizing constants ──────────────────────────────
const CASCADE_OFFSET = 30;
const MENU_BAR_HEIGHT = 28;
const DOCK_RESERVED = 60; // breathing room for dock at bottom
const VIEWPORT_MARGIN = 24; // gap from screen edges so the window "fits" the desktop

// Default window size adapts to viewport so smaller-than-fullscreen
// windows always fully fit the available desktop area.
function computeDefaultSize(): { width: number; height: number } {
  const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const availW = vw - VIEWPORT_MARGIN * 2;
  const availH = vh - MENU_BAR_HEIGHT - DOCK_RESERVED - VIEWPORT_MARGIN;
  return {
    width: Math.max(640, Math.min(1100, availW)),
    height: Math.max(480, Math.min(720, availH)),
  };
}

function computeBasePosition(size: { width: number; height: number }) {
  const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  // Center initial window on screen
  return {
    x: Math.max(VIEWPORT_MARGIN, Math.round((vw - size.width) / 2)),
    y: Math.max(MENU_BAR_HEIGHT + VIEWPORT_MARGIN, Math.round((vh - size.height) / 2 - 20)),
  };
}

export function OSWindowProvider({ children }: { children: ReactNode }) {
  const [openWindows, setOpenWindows] = useState<OSWindow[]>([]);
  const [nextZ, setNextZ] = useState(100);

  const openWindow = useCallback(
    (id: string, title: string, component: ReactNode, size?: { width: number; height: number }) => {
      setOpenWindows((prev) => {
        // If already open, focus it
        const existing = prev.find((w) => w.id === id);
        if (existing) {
          const maxZ = Math.max(...prev.map((w) => w.zIndex), 0) + 1;
          return prev.map((w) =>
            w.id === id ? { ...w, isMinimized: false, zIndex: maxZ } : w
          );
        }

        // Resolve size (caller-provided or viewport-fit default), clamp to viewport
        const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
        const vh = typeof window !== "undefined" ? window.innerHeight : 800;
        const maxW = vw - VIEWPORT_MARGIN * 2;
        const maxH = vh - MENU_BAR_HEIGHT - DOCK_RESERVED - VIEWPORT_MARGIN;
        const requested = size ?? computeDefaultSize();
        const resolvedSize = {
          width: Math.min(requested.width, maxW),
          height: Math.min(requested.height, maxH),
        };

        // Cascade from a centered base position
        const base = computeBasePosition(resolvedSize);
        const cascadeIndex = prev.length;
        const position = {
          x: Math.max(VIEWPORT_MARGIN, Math.min(base.x + cascadeIndex * CASCADE_OFFSET, vw - resolvedSize.width - VIEWPORT_MARGIN)),
          y: Math.max(MENU_BAR_HEIGHT + 8, Math.min(base.y + cascadeIndex * CASCADE_OFFSET, vh - resolvedSize.height - DOCK_RESERVED)),
        };

        const newWindow: OSWindow = {
          id,
          title,
          component,
          isMinimized: false,
          isMaximized: false,
          zIndex: nextZ,
          position,
          size: resolvedSize,
        };

        setNextZ((z) => z + 1);
        return [...prev, newWindow];
      });
    },
    [nextZ]
  );

  const closeWindow = useCallback((id: string) => {
    setOpenWindows((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setOpenWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w))
    );
  }, []);

  const maximizeWindow = useCallback((id: string) => {
    setOpenWindows((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
      )
    );
  }, []);

  const focusWindow = useCallback((id: string) => {
    setOpenWindows((prev) => {
      const maxZ = Math.max(...prev.map((w) => w.zIndex), 0) + 1;
      return prev.map((w) =>
        w.id === id ? { ...w, zIndex: maxZ, isMinimized: false } : w
      );
    });
  }, []);

  const updateWindowPosition = useCallback(
    (id: string, position: { x: number; y: number }) => {
      setOpenWindows((prev) =>
        prev.map((w) => (w.id === id ? { ...w, position } : w))
      );
    },
    []
  );

  const updateWindowGeometry = useCallback(
    (id: string, position: { x: number; y: number }, size: { width: number; height: number }) => {
      setOpenWindows((prev) =>
        prev.map((w) => (w.id === id ? { ...w, position, size } : w))
      );
    },
    []
  );

  const snapWindow = useCallback((id: string, dir: SnapDirection) => {
    const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;
    const availW = vw;
    const availH = vh - MENU_BAR_HEIGHT - DOCK_RESERVED;
    const top = MENU_BAR_HEIGHT;

    const layout = (() => {
      switch (dir) {
        case "left":   return { x: 0, y: top, width: Math.floor(availW / 2), height: availH };
        case "right":  return { x: Math.floor(availW / 2), y: top, width: Math.floor(availW / 2), height: availH };
        case "top":    return { x: 0, y: top, width: availW, height: Math.floor(availH / 2) };
        case "bottom": return { x: 0, y: top + Math.floor(availH / 2), width: availW, height: Math.floor(availH / 2) };
        case "center": {
          const w = Math.min(900, availW - 80);
          const h = Math.min(640, availH - 60);
          return { x: Math.round((vw - w) / 2), y: Math.round((availH - h) / 2 + top), width: w, height: h };
        }
        case "full":   return { x: 0, y: top, width: availW, height: availH };
      }
    })();

    setOpenWindows((prev) =>
      prev.map((w) =>
        w.id === id
          ? {
              ...w,
              isMaximized: dir === "full",
              position: { x: layout.x, y: layout.y },
              size: { width: layout.width, height: layout.height },
            }
          : w,
      ),
    );
  }, []);

  const togglePinned = useCallback((id: string) => {
    setOpenWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isPinned: !w.isPinned } : w)),
    );
  }, []);

  return (
    <OSWindowContext.Provider
      value={{
        openWindows,
        openWindow,
        closeWindow,
        minimizeWindow,
        maximizeWindow,
        focusWindow,
        updateWindowPosition,
        updateWindowGeometry,
        snapWindow,
        togglePinned,
      }}
    >
      {children}
    </OSWindowContext.Provider>
  );
}

export function useOSWindowContext() {
  const ctx = useContext(OSWindowContext);
  if (!ctx) {
    throw new Error("useOSWindowContext must be used within <OSWindowProvider>");
  }
  return ctx;
}
