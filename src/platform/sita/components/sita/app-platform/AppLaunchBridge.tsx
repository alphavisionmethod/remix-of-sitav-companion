// ═══════════════════════════════════════════════════════════════
// SITA OS — Global App Launch Bridge
// Listens for `sita-open-webview` events fired by launch.service.ts
// and opens a windowed WebAppWindow via the WindowManager.
// Mounted once inside ShellLayout.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { useWindowManagerContext } from "@/contexts/WindowManagerContext";
import { WebAppWindow } from "./WebAppWindow";
import { DesktopOnlyFallback } from "./DesktopOnlyFallback";

interface DesktopFallbackState {
  open: boolean;
  appName: string;
  iconUrl?: string;
  fallbackUrl?: string;
  webAlternativeUrl?: string;
  webAlternativeName?: string;
}

export function AppLaunchBridge() {
  const wm = useWindowManagerContext();
  const [fallback, setFallback] = useState<DesktopFallbackState>({
    open: false,
    appName: "",
  });

  useEffect(() => {
    const handleWebview = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        appId: string;
        url: string;
        name?: string;
        iconUrl?: string;
        publisher?: string;
        window?: { width?: number; height?: number };
      };
      if (!detail?.url || !detail.appId) return;

      const cascadeX = Math.random() * 80 + 80;
      const cascadeY = Math.random() * 80 + 80;
      wm.openWindow(detail.appId, {
        title: detail.name ?? detail.appId,
        width: detail.window?.width ?? 1100,
        position: { x: cascadeX, y: cascadeY },
        component: (
          <WebAppWindow
            appId={detail.appId}
            name={detail.name ?? detail.appId}
            url={detail.url}
            iconUrl={detail.iconUrl}
            publisher={detail.publisher}
          />
        ),
      });
    };

    const handleDesktopOnly = (e: Event) => {
      const detail = (e as CustomEvent).detail as DesktopFallbackState;
      if (!detail) return;
      setFallback({ ...detail, open: true });
    };

    window.addEventListener("sita-open-webview", handleWebview);
    window.addEventListener("sita-desktop-only-fallback", handleDesktopOnly);
    return () => {
      window.removeEventListener("sita-open-webview", handleWebview);
      window.removeEventListener("sita-desktop-only-fallback", handleDesktopOnly);
    };
  }, [wm]);

  return (
    <DesktopOnlyFallback
      open={fallback.open}
      onOpenChange={(o) => setFallback((s) => ({ ...s, open: o }))}
      appName={fallback.appName}
      iconUrl={fallback.iconUrl}
      fallbackUrl={fallback.fallbackUrl}
      webAlternativeUrl={fallback.webAlternativeUrl}
      webAlternativeName={fallback.webAlternativeName}
    />
  );
}

export default AppLaunchBridge;
