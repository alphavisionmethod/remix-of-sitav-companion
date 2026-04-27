import { useState, useCallback, useEffect, useRef } from "react";
import type { ReactNode } from "react";

export interface WindowConfig {
  title: string;
  component: ReactNode;
  position: { x: number; y: number };
  width?: number;
  originRect?: { x: number; y: number; width: number; height: number };
}

interface WindowState extends WindowConfig {
  id: string;
  zIndex: number;
  minimized: boolean;
  maximized: boolean;
  preMaximize?: { x: number; y: number; width: number };
  originRect?: { x: number; y: number; width: number; height: number };
}

// ── Window Position Memory ──────────────────────────────────

const MEMORY_KEY = "nova-window-memory";
const MEMORY_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

interface PositionMemory {
  x: number;
  y: number;
  width?: number;
  savedAt: number;
}

function loadMemory(): Record<string, PositionMemory> {
  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw) as Record<string, PositionMemory>;
    const now = Date.now();
    // Prune old entries
    const cleaned: Record<string, PositionMemory> = {};
    for (const [id, entry] of Object.entries(data)) {
      if (now - entry.savedAt < MEMORY_MAX_AGE) cleaned[id] = entry;
    }
    return cleaned;
  } catch {
    return {};
  }
}

function saveMemory(memory: Record<string, PositionMemory>) {
  try {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
  } catch {}
}

export function useWindowManager() {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [nextZ, setNextZ] = useState(1);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  // Debounced position save
  const persistPositions = useCallback((wins: WindowState[]) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const memory = loadMemory();
      for (const w of wins) {
        memory[w.id] = { x: w.position.x, y: w.position.y, width: w.width, savedAt: Date.now() };
      }
      saveMemory(memory);
    }, 500);
  }, []);

  const openWindow = useCallback((id: string, config: WindowConfig) => {
    setWindows(prev => {
      const existing = prev.find(w => w.id === id);
      if (existing) {
        return prev.map(w => w.id === id ? { ...w, zIndex: nextZ, minimized: false } : w);
      }
      // Check memory for saved position
      const memory = loadMemory();
      const saved = memory[id];
      const position = saved ? { x: saved.x, y: saved.y } : config.position;
      const width = saved?.width || config.width;
      return [...prev, { ...config, position, width, id, zIndex: nextZ, minimized: false, maximized: false }];
    });
    setNextZ(z => z + 1);
  }, [nextZ]);

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => {
      const win = prev.find(w => w.id === id);
      if (win) {
        const memory = loadMemory();
        memory[id] = { x: win.position.x, y: win.position.y, width: win.width, savedAt: Date.now() };
        saveMemory(memory);
      }
      return prev.filter(w => w.id !== id);
    });
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

  const maximizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => {
      if (w.id !== id) return w;
      if (w.maximized) {
        // Restore from maximize
        const pre = w.preMaximize;
        return {
          ...w,
          maximized: false,
          position: pre ? { x: pre.x, y: pre.y } : w.position,
          width: pre?.width ?? w.width,
          preMaximize: undefined,
        };
      }
      // Maximize
      return {
        ...w,
        maximized: true,
        preMaximize: { x: w.position.x, y: w.position.y, width: w.width ?? 500 },
      };
    }));
  }, []);

  // ── Session serialization ──────────────────────────────────
  const getWindowStates = useCallback(() => {
    return windows.map(w => ({
      id: w.id,
      title: w.title,
      position: w.position,
      width: w.width,
      minimized: w.minimized,
    }));
  }, [windows]);

  const updateWindowPosition = useCallback((id: string, position: { x: number; y: number }, width?: number) => {
    setWindows(prev => {
      const updated = prev.map(w => w.id === id ? { ...w, position, width: width ?? w.width } : w);
      persistPositions(updated);
      return updated;
    });
  }, [persistPositions]);

  const visibleWindows = windows.filter(w => !w.minimized);
  const minimizedWindows = windows.filter(w => w.minimized);

  return { windows, visibleWindows, minimizedWindows, openWindow, closeWindow, focusWindow, minimizeWindow, restoreWindow, maximizeWindow, getWindowStates, updateWindowPosition };
}
