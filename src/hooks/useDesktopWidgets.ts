import { useState, useCallback } from "react";

export interface WidgetInstance {
  id: string;
  type: string;
  label: string;
  position: { x: number; y: number };
  visible: boolean;
  size: "sm" | "md" | "lg";
}

const STORAGE_KEY = "sita-desktop-widgets";

const DEFAULT_WIDGETS: WidgetInstance[] = [
  { id: "clock", type: "clock", label: "Clock", position: { x: 48, y: 560 }, visible: true, size: "lg" },
  { id: "quick-actions", type: "quick-actions", label: "Quick Actions", position: { x: 940, y: 40 }, visible: true, size: "md" },
  { id: "system", type: "system", label: "System Toggles", position: { x: 940, y: 220 }, visible: true, size: "md" },
  { id: "calendar", type: "calendar", label: "Calendar", position: { x: 940, y: 380 }, visible: true, size: "md" },
  { id: "notifications", type: "notifications", label: "Notifications", position: { x: 940, y: 600 }, visible: true, size: "md" },
  { id: "continuity", type: "continuity", label: "Continuity", position: { x: 600, y: 600 }, visible: true, size: "md" },
];

function loadWidgets(): WidgetInstance[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_WIDGETS;
}

function saveWidgets(widgets: WidgetInstance[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
  } catch {}
}

export function useDesktopWidgets() {
  const [widgets, setWidgets] = useState<WidgetInstance[]>(loadWidgets);

  const moveWidget = useCallback((id: string, x: number, y: number) => {
    setWidgets(prev => {
      const next = prev.map(w => w.id === id ? { ...w, position: { x, y } } : w);
      saveWidgets(next);
      return next;
    });
  }, []);

  const removeWidget = useCallback((id: string) => {
    setWidgets(prev => {
      const next = prev.map(w => w.id === id ? { ...w, visible: false } : w);
      saveWidgets(next);
      return next;
    });
  }, []);

  const addWidget = useCallback((type: string) => {
    setWidgets(prev => {
      const existing = prev.find(w => w.type === type);
      let next: WidgetInstance[];
      if (existing) {
        next = prev.map(w => w.type === type ? { ...w, visible: true, position: { x: 400, y: 300 } } : w);
      } else {
        const defaultW = DEFAULT_WIDGETS.find(w => w.type === type);
        if (!defaultW) return prev;
        next = [...prev, { ...defaultW, visible: true, position: { x: 400, y: 300 } }];
      }
      saveWidgets(next);
      return next;
    });
  }, []);

  const resetWidgets = useCallback(() => {
    saveWidgets(DEFAULT_WIDGETS);
    setWidgets(DEFAULT_WIDGETS);
  }, []);

  const visibleWidgets = widgets.filter(w => w.visible);
  const hiddenWidgets = widgets.filter(w => !w.visible);

  return { widgets: visibleWidgets, hiddenWidgets, moveWidget, removeWidget, addWidget, resetWidgets, allTypes: DEFAULT_WIDGETS };
}
