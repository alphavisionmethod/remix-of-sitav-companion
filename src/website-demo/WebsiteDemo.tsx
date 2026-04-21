import React, { useCallback, useMemo, useState } from "react";
import { DemoMenuBar } from "./DemoMenuBar";
import { DemoDock } from "./DemoDock";
import { DemoDesktopIcons } from "./DemoDesktopIcons";
import { DemoWindowManager, type DemoWindow } from "./DemoWindowManager";
import { DEMO_APPS, type DemoAppId } from "./demo-data";
import { DemoBusinessApp } from "./apps/DemoBusinessApp";
import { DemoFinanceApp } from "./apps/DemoFinanceApp";
import { DemoConciergeApp } from "./apps/DemoConciergeApp";
import { DemoBoardroomApp } from "./apps/DemoBoardroomApp";
import { DemoInvestmentApp } from "./apps/DemoInvestmentApp";
import { DemoFilesApp } from "./apps/DemoFilesApp";
import { DemoNotesApp } from "./apps/DemoNotesApp";
import { DemoSettingsApp } from "./apps/DemoSettingsApp";

const APP_TITLES: Record<DemoAppId, string> = {
  business: "Business Dashboard",
  finance: "Finance Manager",
  concierge: "Concierge",
  boardroom: "Advisor Boardroom",
  investment: "Investment Tracker",
  files: "Files",
  notes: "Notes",
  settings: "Settings",
};

const APP_SIZES: Record<DemoAppId, { w: number; h: number }> = {
  business: { w: 820, h: 540 },
  finance: { w: 780, h: 520 },
  concierge: { w: 640, h: 480 },
  boardroom: { w: 860, h: 560 },
  investment: { w: 760, h: 540 },
  files: { w: 700, h: 460 },
  notes: { w: 680, h: 440 },
  settings: { w: 500, h: 440 },
};

function renderApp(appId: DemoAppId): React.ReactNode {
  switch (appId) {
    case "business": return <DemoBusinessApp />;
    case "finance": return <DemoFinanceApp />;
    case "concierge": return <DemoConciergeApp />;
    case "boardroom": return <DemoBoardroomApp />;
    case "investment": return <DemoInvestmentApp />;
    case "files": return <DemoFilesApp />;
    case "notes": return <DemoNotesApp />;
    case "settings": return <DemoSettingsApp />;
    default: return null;
  }
}

let nextZ = 10;

export function WebsiteDemo() {
  const [windows, setWindows] = useState<DemoWindow[]>([]);

  const openApps = useMemo(() => windows.map((w) => w.appId), [windows]);
  const focusedApp = useMemo(() => {
    const visible = windows.filter((w) => !w.minimized);
    if (!visible.length) return null;
    const top = visible.reduce((a, b) => (a.z > b.z ? a : b));
    return APP_TITLES[top.appId];
  }, [windows]);

  const launch = useCallback((appId: DemoAppId) => {
    const existing = windows.find((w) => w.appId === appId);
    if (existing) {
      setWindows((prev) => prev.map((w) => w.id === existing.id ? { ...w, minimized: false, z: ++nextZ } : w));
      return;
    }
    const size = APP_SIZES[appId];
    const win: DemoWindow = {
      id: `${appId}-${Date.now()}`,
      appId,
      title: APP_TITLES[appId],
      x: 80 + Math.random() * 120,
      y: 60 + Math.random() * 80,
      w: size.w,
      h: size.h,
      z: ++nextZ,
      minimized: false,
      maximized: false,
    };
    setWindows((prev) => [...prev, win]);
  }, [windows]);

  const close = useCallback((id: string) => setWindows((p) => p.filter((w) => w.id !== id)), []);
  const focus = useCallback((id: string) => setWindows((p) => p.map((w) => w.id === id ? { ...w, z: ++nextZ } : w)), []);
  const minimize = useCallback((id: string) => setWindows((p) => p.map((w) => w.id === id ? { ...w, minimized: true } : w)), []);
  const maximize = useCallback((id: string) => setWindows((p) => p.map((w) => w.id === id ? { ...w, maximized: !w.maximized } : w)), []);

  return (
    <div className="relative w-full h-screen overflow-hidden select-none"
      style={{ background: "linear-gradient(135deg, hsl(230,25%,8%) 0%, hsl(250,20%,12%) 50%, hsl(220,25%,10%) 100%)" }}>
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-[120px]"
          style={{ background: "radial-gradient(circle, hsl(210,80%,50%), transparent)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 blur-[100px]"
          style={{ background: "radial-gradient(circle, hsl(280,60%,50%), transparent)" }} />
      </div>

      <DemoMenuBar focusedApp={focusedApp} />

      <div className="relative flex-1" style={{ height: "calc(100% - 28px)" }}>
        <DemoDesktopIcons onOpen={launch} />
        <DemoWindowManager windows={windows} onClose={close} onFocus={focus}
          onMinimize={minimize} onMaximize={maximize} renderContent={renderApp} />
      </div>

      <DemoDock openApps={openApps} onLaunch={launch} />

      {/* Mobile fallback */}
      <div className="lg:hidden absolute inset-0 bg-black/90 flex items-center justify-center z-[9999] p-8">
        <div className="text-center text-white/70">
          <p className="text-lg font-semibold text-white mb-2">Best viewed on desktop</p>
          <p className="text-sm">This interactive demo requires a screen width of 1024px or wider.</p>
        </div>
      </div>
    </div>
  );
}