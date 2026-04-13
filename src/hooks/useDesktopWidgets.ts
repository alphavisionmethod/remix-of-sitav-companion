import { useState, useCallback } from "react";

export interface WidgetInstance {
  id: string;
  type: string;
  label: string;
  description: string;
  position: { x: number; y: number };
  visible: boolean;
  size: "sm" | "md" | "lg";
}

const STORAGE_KEY = "sita-desktop-widgets";

const DEFAULT_WIDGETS: WidgetInstance[] = [
  { id: "clock", type: "clock", label: "Clock", description: "Large time display with date", position: { x: 48, y: 560 }, visible: true, size: "lg" },
  { id: "quick-actions", type: "quick-actions", label: "Quick Actions", description: "Shortcut grid to open apps and tools", position: { x: 940, y: 40 }, visible: true, size: "md" },
  { id: "system", type: "system", label: "System Toggles", description: "WiFi, Bluetooth, display and sound controls", position: { x: 940, y: 220 }, visible: true, size: "md" },
  { id: "calendar", type: "calendar", label: "Calendar", description: "Date card with upcoming schedule", position: { x: 940, y: 380 }, visible: true, size: "md" },
  { id: "notifications", type: "notifications", label: "Notifications", description: "Recent alerts and notification feed", position: { x: 940, y: 600 }, visible: true, size: "md" },
  { id: "continuity", type: "continuity", label: "Continuity", description: "Resume your last workspace session", position: { x: 600, y: 600 }, visible: true, size: "md" },
  { id: "what-matters", type: "what-matters", label: "What Matters", description: "Priority items across business, finance and concierge", position: { x: 400, y: 300 }, visible: false, size: "md" },
];

function loadWidgets(): WidgetInstance[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as WidgetInstance[];
      // Migrate old data without description field
      return parsed.map(w => {
        const def = DEFAULT_WIDGETS.find(d => d.type === w.type);
        return { ...w, description: w.description || def?.description || "" };
      });
    }
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

  const resizeWidget = useCallback((id: string, size: "sm" | "md" | "lg") => {
    setWidgets(prev => {
      const next = prev.map(w => w.id === id ? { ...w, size } : w);
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

  return { widgets: visibleWidgets, hiddenWidgets, allWidgets: widgets, moveWidget, removeWidget, addWidget, resizeWidget, resetWidgets, allTypes: DEFAULT_WIDGETS };
}
