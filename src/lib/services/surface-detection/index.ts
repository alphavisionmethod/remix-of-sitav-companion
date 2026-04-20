// ═══════════════════════════════════════════════════════════════
// SITA OS — Surface Detection Service
// Detects the current runtime surface (Electron, PWA, Capacitor, Web)
// and provides a React hook for consuming surface info
// ═══════════════════════════════════════════════════════════════
// @persistence: none — stateless module, no durable state to persist

import { useState, useEffect } from "react";
import type { SurfaceType, ActiveSurface } from "@/packages/contracts/runtime/os-unification-runtime";
import { isElectronRuntime } from "@/runtimes/desktop/desktop-runtime-detection";
import { isMobileSurface, getDeviceLabel, getOSVersionString } from "@/runtimes/runtime-platform";

// ── Surface detection ───────────────────────────────────────────

// Window augmentation removed — using vite-env.d.ts global declarations

export type ExtendedSurfaceType = SurfaceType | "pwa" | "electron" | "capacitor";

export function detectSurfaceType(): ExtendedSurfaceType {
  if (typeof window === "undefined") return "api";

  // Electron — registry-routed
  if (isElectronRuntime()) {
    return "electron";
  }

  // Capacitor native
  if (window.Capacitor?.isNativePlatform?.()) {
    return "capacitor";
  }

  // PWA standalone
  if (
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    (navigator as unknown as Record<string, unknown>).standalone === true
  ) {
    return "pwa";
  }

  // Mobile browser — registry-routed
  if (isMobileSurface()) return "mobile";

  // Default web
  return "web";
}

export function mapToCoreSurface(extended: ExtendedSurfaceType): SurfaceType {
  switch (extended) {
    case "electron":
    case "pwa":
      return "web";
    case "capacitor":
      return "mobile";
    default:
      return extended as SurfaceType;
  }
}

// ── Device ID ───────────────────────────────────────────────────

const DEVICE_ID_KEY = "sita-device-id";

export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = `dev_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export function getDeviceName(): string {
  // Registry-routed via runtime-platform helper
  return getDeviceLabel();
}

// ── Build ActiveSurface ─────────────────────────────────────────

export function buildActiveSurface(userId: string): ActiveSurface {
  const extended = detectSurfaceType();
  return {
    surfaceId: `${getDeviceId()}_${extended}`,
    type: mapToCoreSurface(extended),
    userId,
    deviceId: getDeviceId(),
    connectedAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    currentContext: {
      extendedType: extended,
      deviceName: getDeviceName(),
      // ActiveSurface contract historically carries an opaque UA string
      // for downstream telemetry. We delegate to the runtime registry's
      // canonical OS version helper so no raw UA parsing lives here.
      userAgent: getOSVersionString(),
      screenWidth: window.screen?.width,
      screenHeight: window.screen?.height,
      online: navigator.onLine,
    },
  };
}

// ── React hooks ─────────────────────────────────────────────────

export function useSurfaceType(): ExtendedSurfaceType {
  const [surface, setSurface] = useState<ExtendedSurfaceType>(() => detectSurfaceType());

  useEffect(() => {
    // Re-detect on display-mode change (PWA install)
    const mq = window.matchMedia?.("(display-mode: standalone)");
    const handler = () => setSurface(detectSurfaceType());
    mq?.addEventListener?.("change", handler);
    return () => mq?.removeEventListener?.("change", handler);
  }, []);

  return surface;
}

