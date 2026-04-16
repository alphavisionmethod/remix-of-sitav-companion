// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Runtime Context (React)
// Single source of truth surface consumed by mobile hooks/components.
// ═══════════════════════════════════════════════════════════════

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { MobileHost, MobileNetworkTier, MobileOS } from "../contracts/mobile-platform-contract";
import { detectMobileRuntime } from "./mobile-runtime-detection";
import { resolveMobileCapability } from "./mobile-capability-resolver";
import type { MobileCapabilityId, MobileCapabilityStatus } from "../contracts/mobile-platform-contract";

export interface MobileRuntimeContextValue {
  isMobile: boolean;
  os: MobileOS | null;
  host: MobileHost;
  isStandalonePWA: boolean;
  isCapacitor: boolean;
  network: MobileNetworkTier;
  /** True only when the runtime is mobile AND a real mobile OS is detected. */
  isFirstClassMobile: boolean;
  resolveCapability: (cap: MobileCapabilityId) => MobileCapabilityStatus;
}

const MobileRuntimeContext = createContext<MobileRuntimeContextValue | null>(null);

function detectNetworkTier(): MobileNetworkTier {
  if (typeof navigator === "undefined") return "online";
  if (!navigator.onLine) return "offline";
  const conn = (navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean } }).connection;
  if (!conn?.effectiveType) return "online";
  if (conn.saveData) return "lite";
  if (conn.effectiveType === "slow-2g" || conn.effectiveType === "2g") return "degraded";
  if (conn.effectiveType === "3g") return "lite";
  return "online";
}

export function MobileRuntimeProvider({ children }: { children: ReactNode }) {
  const [probe, setProbe] = useState(() => detectMobileRuntime());
  const [network, setNetwork] = useState<MobileNetworkTier>(() => detectNetworkTier());

  useEffect(() => {
    const onResize = () => setProbe(detectMobileRuntime());
    const onOnline = () => setNetwork(detectNetworkTier());
    const onOffline = () => setNetwork("offline");
    window.addEventListener("resize", onResize);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    const conn = (navigator as Navigator & { connection?: EventTarget }).connection;
    conn?.addEventListener?.("change", onOnline);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      conn?.removeEventListener?.("change", onOnline);
    };
  }, []);

  const value = useMemo<MobileRuntimeContextValue>(() => {
    const isFirstClassMobile = probe.os !== null && (probe.host === "capacitor" || probe.host === "native");
    return {
      isMobile: probe.isMobileViewport || probe.os !== null,
      os: probe.os,
      host: probe.host,
      isStandalonePWA: probe.isStandalonePWA,
      isCapacitor: probe.isCapacitor,
      network,
      isFirstClassMobile,
      resolveCapability: (cap) => resolveMobileCapability(cap, probe.os).status,
    };
  }, [probe, network]);

  return <MobileRuntimeContext.Provider value={value}>{children}</MobileRuntimeContext.Provider>;
}

export function useMobileRuntime(): MobileRuntimeContextValue {
  const ctx = useContext(MobileRuntimeContext);
  if (!ctx) {
    // Safe fallback for surfaces that render outside the provider
    return {
      isMobile: false,
      os: null,
      host: "web-mobile",
      isStandalonePWA: false,
      isCapacitor: false,
      network: "online",
      isFirstClassMobile: false,
      resolveCapability: () => "unsupported",
    };
  }
  return ctx;
}

export function useMobileCapability(cap: MobileCapabilityId): MobileCapabilityStatus {
  return useMobileRuntime().resolveCapability(cap);
}
