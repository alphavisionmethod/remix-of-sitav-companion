import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";

// ═══════════════════════════════════════════════════════════════
// SITA OS — Window Context
// Manages OS-level window state: open, close, minimize, maximize, focus
// ═══════════════════════════════════════════════════════════════

export interface OSWindow {
  id: string;
  title: string;
  component: ReactNode;
  isMinimized: boolean;
  isMaximized: boolean;
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
}

const OSWindowContext = createContext<OSWindowContextType | null>(null);

// ── Cascade offset for new windows ──────────────────────────
const CASCADE_OFFSET = 30;
const DEFAULT_SIZE = { width: 800, height: 600 };
const BASE_POSITION = { x: 120, y: 80 };

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

        // Cascade position based on current window count
        const cascadeIndex = prev.length;
        const position = {
          x: BASE_POSITION.x + cascadeIndex * CASCADE_OFFSET,
          y: BASE_POSITION.y + cascadeIndex * CASCADE_OFFSET,
        };

        const newWindow: OSWindow = {
          id,
          title,
          component,
          isMinimized: false,
          isMaximized: false,
          zIndex: nextZ,
          position,
          size: size ?? DEFAULT_SIZE,
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
