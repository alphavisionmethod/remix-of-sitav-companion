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

const STORAGE_KEY = "sita-desktop-widgets-v2";

const DEFAULT_WIDGETS: WidgetInstance[] = [
  { id: "apps-rail", type: "apps-rail", label: "Apps", description: "Quick-launch app sidebar with Business, Finance, Concierge and more", position: { x: 16, y: 200 }, visible: true, size: "md" },
  { id: "clock", type: "clock", label: "Clock", description: "Large time display with date", position: { x: 48, y: 560 }, visible: true, size: "lg" },
  { id: "quick-actions", type: "quick-actions", label: "Quick Actions", description: "Shortcut grid to open apps and tools", position: { x: 940, y: 40 }, visible: true, size: "md" },
  { id: "system", type: "system", label: "System Toggles", description: "WiFi, Bluetooth, Shield VPN and power controls", position: { x: 940, y: 320 }, visible: true, size: "md" },
  { id: "calendar", type: "calendar", label: "Calendar", description: "Date card with upcoming schedule", position: { x: 940, y: 380 }, visible: true, size: "md" },
  { id: "notifications", type: "notifications", label: "Notifications", description: "Recent alerts and notification feed", position: { x: 940, y: 600 }, visible: true, size: "md" },
  { id: "continuity", type: "continuity", label: "Continuity", description: "Resume your last workspace session", position: { x: 600, y: 600 }, visible: true, size: "md" },
  { id: "what-matters", type: "what-matters", label: "What Matters", description: "Priority items across business, finance and concierge", position: { x: 400, y: 300 }, visible: false, size: "md" },
  // New widgets — hidden by default
  { id: "notifications-feed", type: "notifications-feed", label: "Notifications Feed", description: "Latest alerts with app badges and timestamps", position: { x: 400, y: 300 }, visible: false, size: "md" },
  { id: "investment-pulse", type: "investment-pulse", label: "Investment Pulse", description: "Portfolio value, daily P&L and top holdings", position: { x: 400, y: 300 }, visible: false, size: "md" },
  { id: "crm-pipeline", type: "crm-pipeline", label: "CRM Pipeline", description: "Pipeline value, open deals and stage badges", position: { x: 400, y: 300 }, visible: false, size: "md" },
  { id: "leads-recovered", type: "leads-recovered", label: "Leads Recovered", description: "Recovered lead count, cart recovery and revenue saved", position: { x: 400, y: 300 }, visible: false, size: "md" },
  { id: "calendar-today", type: "calendar-today", label: "Today's Schedule", description: "Next events color-coded by domain", position: { x: 400, y: 300 }, visible: false, size: "md" },
  { id: "boardroom-brief", type: "boardroom-brief", label: "Boardroom Brief", description: "Next boardroom session and pending decisions", position: { x: 400, y: 300 }, visible: false, size: "md" },
  { id: "advisor-council", type: "advisor-council", label: "Advisor Council", description: "Advisor avatars with confidence scores by domain", position: { x: 400, y: 300 }, visible: false, size: "md" },
  { id: "business-kpi", type: "business-kpi", label: "Business KPIs", description: "Revenue, pipeline and conversion rate at a glance", position: { x: 400, y: 300 }, visible: false, size: "md" },
  { id: "finance-snapshot", type: "finance-snapshot", label: "Finance Snapshot", description: "Total balance, income and expenses overview", position: { x: 400, y: 300 }, visible: false, size: "md" },
  { id: "concierge-tasks", type: "concierge-tasks", label: "Concierge Tasks", description: "Pending errands with priority and due times", position: { x: 400, y: 300 }, visible: false, size: "md" },
  { id: "weather", type: "weather", label: "Weather", description: "Current temperature, conditions and forecast", position: { x: 400, y: 300 }, visible: false, size: "md" },
  { id: "portfolio-globe", type: "portfolio-globe", label: "Portfolio Map", description: "Asset allocation by sector with visual breakdown", position: { x: 400, y: 300 }, visible: false, size: "md" },
];

function loadWidgets(): WidgetInstance[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as WidgetInstance[];
      // Merge saved with defaults to pick up new widget types
      const savedTypes = new Set(parsed.map(w => w.type));
      const newDefaults = DEFAULT_WIDGETS.filter(d => !savedTypes.has(d.type));
      const migrated = parsed.map(w => {
        const def = DEFAULT_WIDGETS.find(d => d.type === w.type);
        return { ...w, description: w.description || def?.description || "" };
      });
      return [...migrated, ...newDefaults];
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
