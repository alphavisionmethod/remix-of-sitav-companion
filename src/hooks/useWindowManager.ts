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
}

export function useWindowManager() {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [nextZ, setNextZ] = useState(1);

  const openWindow = useCallback((id: string, config: WindowConfig) => {
    setWindows(prev => {
      if (prev.find(w => w.id === id)) {
        // Focus existing
        return prev.map(w => w.id === id ? { ...w, zIndex: nextZ } : w);
      }
      return [...prev, { ...config, id, zIndex: nextZ }];
    });
    setNextZ(z => z + 1);
  }, [nextZ]);

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
  }, []);

  const focusWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: nextZ } : w));
    setNextZ(z => z + 1);
  }, [nextZ]);

  return { windows, openWindow, closeWindow, focusWindow };
}
