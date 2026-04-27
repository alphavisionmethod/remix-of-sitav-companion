// ═══════════════════════════════════════════════════════════════
// SITA OS — Shell Window Layer
// All windowed apps (Finder, Notes, Terminal, etc.) rendered here
// ═══════════════════════════════════════════════════════════════

import { useCallback } from "react";
import { useWindowManager } from "@/hooks/useWindowManager";
type WindowManager = ReturnType<typeof useWindowManager>;
import { FinderWindow } from "./windows/FinderWindow";
import { SettingsWindow } from "./windows/SettingsWindow";
import { NotesWindow } from "./windows/NotesWindow";
import { TerminalWindow } from "./windows/TerminalWindow";
import { CalendarWindow } from "./windows/CalendarWindow";
import { WeatherWindow } from "./windows/WeatherWindow";
import { NovaTerminal } from "./windows/NovaTerminal";
import { SystemMonitorWindow } from "./windows/SystemMonitorWindow";
import { MusicPlayerWindow } from "./windows/MusicPlayerWindow";
import { CalculatorWindow } from "./windows/CalculatorWindow";
import { PhotoViewerWindow } from "./windows/PhotoViewerWindow";
import { CodeEditorWindow } from "./windows/CodeEditorWindow";
import { MailClientWindow } from "./windows/MailClientWindow";
import { MapsWindow } from "./windows/MapsWindow";
import { SecurityCenterWindow } from "./windows/SecurityCenterWindow";
import { AppLibraryWindow } from "./windows/AppLibraryWindow";
import { UpdateCenterWindow } from "./windows/UpdateCenterWindow";
import { CloudSyncWindow } from "./windows/CloudSyncWindow";
import { DevToolsWindow } from "./windows/DevToolsWindow";
import { ExtensionManagerWindow } from "./windows/ExtensionManagerWindow";
import { SyscallDashboardWindow } from "./windows/SyscallDashboardWindow";
import { KernelDashboardWindow } from "./windows/KernelDashboardWindow";
import { PolicyDashboardWindow } from "./windows/PolicyDashboardWindow";
import { TodoWindow } from "./windows/TodoWindow";
import { FinanceAppShell } from "../apps/finance/FinanceAppShell";
import { BusinessAppShell } from "../apps/business/BusinessAppShell";
import { ConciergeAppShell } from "../apps/concierge/ConciergeAppShell";
import { InvestmentAppShell } from "../apps/investment/InvestmentAppShell";
import { BoardroomAppShell } from "../apps/boardroom/BoardroomAppShell";
import { MissionControlAppShell } from "../apps/mission-control/MissionControlAppShell";
import { AppStoreShell } from "../apps/app-store/AppStoreShell";
import { lifecycleManager } from "@/platform/nova-sdk/runtime/lifecycle";
import { ProcessTable } from "@/platform/nova-sdk/kernel/process-manager";
import { Compositor } from "@/platform/nova-sdk/kernel/compositor";
import { MemoryManager } from "@/platform/nova-sdk/kernel/memory-manager";
import { predictiveIntentEngine } from "@/lib/services/predictive-intent";
import { routineDetector } from "@/lib/services/routine-detector";
import { useAppPlatform } from "@/platform/app-platform/contexts/AppPlatformContext";
import { AppPermissionGate, isPermissionGranted } from "./AppPermissionGate";
import { useState } from "react";

interface AppLaunchConfig {
  id: string;
  name: string;
  component: React.ReactNode;
  width: number;
  position: { x: number; y: number };
}

const APP_REGISTRY: Record<string, Omit<AppLaunchConfig, "id">> = {
  finder: { name: "Finder", component: <FinderWindow />, width: 460, position: { x: 120, y: 100 } },
  "files-app": { name: "Finder", component: <FinderWindow />, width: 460, position: { x: 120, y: 100 } },
  settings: { name: "Settings", component: <SettingsWindow />, width: 520, position: { x: 300, y: 120 } },
  "settings-app": { name: "Settings", component: <SettingsWindow />, width: 520, position: { x: 300, y: 120 } },
  notes: { name: "Notes", component: <NotesWindow />, width: 520, position: { x: 200, y: 110 } },
  "com.nova.notes": { name: "Notes", component: <NotesWindow />, width: 520, position: { x: 200, y: 110 } },
  terminal: { name: "Terminal", component: <TerminalWindow />, width: 560, position: { x: 160, y: 130 } },
  "com.nova.terminal": { name: "Terminal", component: <TerminalWindow />, width: 560, position: { x: 160, y: 130 } },
  calendar: { name: "Calendar", component: <CalendarWindow />, width: 580, position: { x: 240, y: 90 } },
  "com.nova.calendar": { name: "Calendar", component: <CalendarWindow />, width: 580, position: { x: 240, y: 90 } },
  weather: { name: "Weather", component: <WeatherWindow />, width: 420, position: { x: 340, y: 100 } },
  "com.nova.weather": { name: "Weather", component: <WeatherWindow />, width: 420, position: { x: 340, y: 100 } },
  "nova-terminal": { name: "Nova Terminal", component: <NovaTerminal />, width: 640, position: { x: 180, y: 110 } },
  "com.nova.canvas-terminal": { name: "Nova Terminal", component: <NovaTerminal />, width: 640, position: { x: 180, y: 110 } },
  "system-monitor": { name: "System Monitor", component: <SystemMonitorWindow />, width: 620, position: { x: 140, y: 80 } },
  "com.sita.monitor": { name: "System Monitor", component: <SystemMonitorWindow />, width: 620, position: { x: 140, y: 80 } },
  "music-player": { name: "Music", component: <MusicPlayerWindow />, width: 520, position: { x: 180, y: 100 } },
  calculator: { name: "Calculator", component: <CalculatorWindow />, width: 380, position: { x: 360, y: 120 } },
  "photo-viewer": { name: "Photos", component: <PhotoViewerWindow />, width: 560, position: { x: 200, y: 90 } },
  "code-editor": { name: "Code Editor", component: <CodeEditorWindow />, width: 700, position: { x: 120, y: 80 } },
  "mail-client": { name: "Mail", component: <MailClientWindow />, width: 640, position: { x: 160, y: 90 } },
  "maps-app": { name: "Maps", component: <MapsWindow />, width: 560, position: { x: 200, y: 100 } },
  "security-center": { name: "Security Center", component: <SecurityCenterWindow />, width: 540, position: { x: 180, y: 80 } },
  "com.sita.security-center": { name: "Security Center", component: <SecurityCenterWindow />, width: 540, position: { x: 180, y: 80 } },
  "app-library": { name: "App Library", component: <AppLibraryWindow />, width: 560, position: { x: 200, y: 90 } },
  "com.sita.app-library": { name: "App Library", component: <AppLibraryWindow />, width: 560, position: { x: 200, y: 90 } },
  "update-center": { name: "Update Center", component: <UpdateCenterWindow />, width: 480, position: { x: 220, y: 100 } },
  "com.sita.update-center": { name: "Update Center", component: <UpdateCenterWindow />, width: 480, position: { x: 220, y: 100 } },
  "cloud-sync": { name: "Cloud Sync", component: <CloudSyncWindow />, width: 460, position: { x: 260, y: 110 } },
  "com.sita.cloud-sync": { name: "Cloud Sync", component: <CloudSyncWindow />, width: 460, position: { x: 260, y: 110 } },
  "dev-tools": { name: "Developer Tools", component: <DevToolsWindow />, width: 640, position: { x: 140, y: 70 } },
  "com.sita.dev-tools": { name: "Developer Tools", component: <DevToolsWindow />, width: 640, position: { x: 140, y: 70 } },
  "kernel-dashboard": { name: "Kernel Dashboard", component: <KernelDashboardWindow />, width: 680, position: { x: 100, y: 60 } },
  "com.nova.kernel-dashboard": { name: "Kernel Dashboard", component: <KernelDashboardWindow />, width: 680, position: { x: 100, y: 60 } },
  "extension-manager": { name: "Extension Manager", component: <ExtensionManagerWindow />, width: 520, position: { x: 160, y: 80 } },
  "com.sita.extension-manager": { name: "Extension Manager", component: <ExtensionManagerWindow />, width: 520, position: { x: 160, y: 80 } },
  finance: { name: "Finance OS", component: <FinanceAppShell />, width: 1200, position: { x: 80, y: 50 } },
  money: { name: "Finance OS", component: <FinanceAppShell />, width: 1200, position: { x: 80, y: 50 } },
  business: { name: "Business OS", component: <BusinessAppShell />, width: 1200, position: { x: 120, y: 90 } },
  concierge: { name: "Concierge", component: <ConciergeAppShell />, width: 1200, position: { x: 160, y: 130 } },
  investment: { name: "Investment Office", component: <InvestmentAppShell />, width: 1200, position: { x: 100, y: 70 } },
  boardroom: { name: "Boardroom", component: <BoardroomAppShell />, width: 1200, position: { x: 140, y: 110 } },
  todo: { name: "Tasks", component: <TodoWindow />, width: 420, position: { x: 280, y: 100 } },
  // ── Catalog ID aliases → same window components ──
  "sita-business-center": { name: "Business OS", component: <BusinessAppShell />, width: 1200, position: { x: 120, y: 90 } },
  "sita-money-center": { name: "Finance OS", component: <FinanceAppShell />, width: 1200, position: { x: 80, y: 50 } },
  "sita-concierge": { name: "Concierge", component: <ConciergeAppShell />, width: 1200, position: { x: 160, y: 130 } },
  "sita-boardroom": { name: "Boardroom", component: <BoardroomAppShell />, width: 1200, position: { x: 140, y: 110 } },
  "sita-investment-office": { name: "Investment Office", component: <InvestmentAppShell />, width: 1200, position: { x: 100, y: 70 } },
  trust: { name: "Security Center", component: <SecurityCenterWindow />, width: 540, position: { x: 180, y: 80 } },
  "policy-center": { name: "Policy Center", component: <PolicyDashboardWindow />, width: 500, position: { x: 200, y: 90 } },
  "com.sita.policy-center": { name: "Policy Center", component: <PolicyDashboardWindow />, width: 500, position: { x: 200, y: 90 } },
  "mission-control": { name: "Mission Control", component: <MissionControlAppShell />, width: 1300, position: { x: 60, y: 40 } },
  "sita-mission-control": { name: "Mission Control", component: <MissionControlAppShell />, width: 1300, position: { x: 60, y: 40 } },
  "app-store": { name: "SITA App Store", component: <AppStoreShell />, width: 1100, position: { x: 100, y: 60 } },
  "sita-app-store": { name: "SITA App Store", component: <AppStoreShell />, width: 1100, position: { x: 100, y: 60 } },
};

// Canonical mapping: collapse catalog aliases to a single window ID
const CANONICAL_WINDOW_ID: Record<string, string> = {
  "sita-business-center": "business",
  "sita-money-center": "finance",
  "sita-concierge": "concierge",
  "sita-boardroom": "boardroom",
  "sita-investment-office": "investment",
  "sita-mission-control": "mission-control",
  "sita-app-store": "app-store",
  "money": "finance",
  "files-app": "finder",
  "settings-app": "settings",
};

function resolveWindowId(appId: string): string {
  return CANONICAL_WINDOW_ID[appId] ?? appId;
}

export function useWindowLauncher(wm: WindowManager) {
  const { apps } = useAppPlatform();
  const [permGate, setPermGate] = useState<{ appId: string; originRect?: DOMRect } | null>(null);

  const doLaunchApp = useCallback((appId: string, originRect?: DOMRect) => {
    const origin = originRect ? { x: originRect.x, y: originRect.y, width: originRect.width, height: originRect.height } : undefined;

    // Resolve catalog aliases (sita-business-center → business, etc.)
    const windowId = resolveWindowId(appId);

    // Find in registry — fallback for unregistered apps
    let config = APP_REGISTRY[appId] ?? APP_REGISTRY[windowId];
    if (!config) {
      // Check if this app has a routePath in the catalog — navigate instead of showing placeholder
      const catalogApp = apps.find(a => a.id === appId);
      if (catalogApp?.routePath) {
        window.location.hash = "";
        window.dispatchEvent(new CustomEvent("sita-navigate", { detail: catalogApp.routePath }));
        return;
      }
      if (catalogApp?.externalUrl) {
        window.open(catalogApp.externalUrl, "_blank", "noopener");
        return;
      }
      const fallbackName = appId.charAt(0).toUpperCase() + appId.slice(1);
      const cascadeX = Math.random() * 100 + 50;
      const cascadeY = Math.random() * 100 + 50;
      wm.openWindow(appId, {
        title: fallbackName,
        width: 1100,
        position: { x: cascadeX, y: cascadeY },
        component: (
          <div className="flex h-full w-full items-center justify-center bg-[#05050A]/80 backdrop-blur-3xl text-white/50 uppercase tracking-widest text-2xl border-t border-white/[0.08] rounded-b-xl shadow-inner">
            {appId} Environment Loading...
          </div>
        ),
      });
      return;
    }

    // Spawn process in kernel
    const proc = ProcessTable.spawn({
      id: windowId,
      name: config.name,
      version: "1.0.0",
      permissions: [],
      windowDefaults: { width: config.width, height: 500, resizable: true },
      designVersion: "nova-1.0",
    } as any);

    MemoryManager.allocate(proc.pid, 16, { label: `app:${windowId}:heap`, guardPages: true });
    ProcessTable.setReady(proc.pid);
    ProcessTable.setRunning(proc.pid);

    wm.openWindow(windowId, {
      title: config.name,
      component: config.component,
      position: config.position,
      width: config.width,
      originRect: origin,
    });

    Compositor.registerSurface(windowId, proc.pid, {
      x: config.position.x,
      y: config.position.y,
      width: config.width,
      height: 500,
    }, config.name);

    ProcessTable.addWindow(proc.pid, windowId);

    lifecycleManager.transition(windowId, "launching").then(() => {
      lifecycleManager.transition(windowId, "running");
    });

    predictiveIntentEngine.learnFromAction("current-user", appId, "system");
    routineDetector.recordLaunch(appId);
  }, [wm.openWindow]);

  const handleLaunchApp = useCallback((appId: string, originRect?: DOMRect) => {
    const appDef = apps.find(a => a.id === appId);
    const hasPerms = appDef?.permissions && appDef.permissions.length > 0;
    if (hasPerms && !isPermissionGranted(appId)) {
      setPermGate({ appId, originRect });
      return;
    }
    doLaunchApp(appId, originRect);
  }, [apps, doLaunchApp]);

  const PermissionGateRenderer = useCallback(() => {
    if (!permGate) return null;
    const appDef = apps.find(a => a.id === permGate.appId);
    return (
      <AppPermissionGate
        appId={permGate.appId}
        appName={appDef?.name ?? ""}
        appIcon={appDef?.icon ?? ""}
        appIconBg={appDef?.iconBg ?? ""}
        permissions={appDef?.permissions ?? []}
        open={true}
        onAllow={() => {
          const { appId, originRect } = permGate;
          setPermGate(null);
          doLaunchApp(appId, originRect);
        }}
        onDeny={() => setPermGate(null)}
      />
    );
  }, [permGate, apps, doLaunchApp]);

  return { doLaunchApp, handleLaunchApp, PermissionGateRenderer };
}
