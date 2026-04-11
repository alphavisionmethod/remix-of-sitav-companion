import { useState, useCallback } from "react";
import type { ReactNode } from "react";

export interface WindowConfig {
  title: string;
  component: ReactNode;
  position: { x: number; y: number };
  width?: number;
}

interface WindowState extends WindowConfig {
  id: string;
  zIndex: number;
  minimized: boolean;
}

export function useWindowManager() {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [nextZ, setNextZ] = useState(1);

  const openWindow = useCallback((id: string, config: WindowConfig) => {
    setWindows(prev => {
      const existing = prev.find(w => w.id === id);
      if (existing) {
        // Focus & restore if minimized
        return prev.map(w => w.id === id ? { ...w, zIndex: nextZ, minimized: false } : w);
      }
      return [...prev, { ...config, id, zIndex: nextZ, minimized: false }];
    });
    setNextZ(z => z + 1);
  }, [nextZ]);

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
  }, []);

  const focusWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: nextZ, minimized: false } : w));
    setNextZ(z => z + 1);
  }, [nextZ]);

  const minimizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, minimized: true } : w));
  }, []);

  const restoreWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, minimized: false, zIndex: nextZ } : w));
    setNextZ(z => z + 1);
  }, [nextZ]);

  const visibleWindows = windows.filter(w => !w.minimized);
  const minimizedWindows = windows.filter(w => w.minimized);

  return { windows, visibleWindows, minimizedWindows, openWindow, closeWindow, focusWindow, minimizeWindow, restoreWindow };
}
