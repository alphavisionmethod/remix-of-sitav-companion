// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Network Snapshot Sampler
// Pure read of the current browser/Capacitor network state into a
// canonical NetworkSnapshot consumable by the degradation policy.
// ═══════════════════════════════════════════════════════════════

import type { MobileNetworkTier } from "../contracts/mobile-platform-contract";
import type { NetworkSnapshot } from "../contracts/network-degradation-contract";

interface BrowserConnection {
  effectiveType?: string;
  type?: string;
  saveData?: boolean;
  rtt?: number;
  downlink?: number;
}

function detectTier(conn: BrowserConnection | undefined, online: boolean): MobileNetworkTier {
  if (!online) return "offline";
  if (!conn?.effectiveType) return "online";
  if (conn.saveData) return "lite";
  if (conn.effectiveType === "slow-2g" || conn.effectiveType === "2g") return "degraded";
  if (conn.effectiveType === "3g") return "lite";
  return "online";
}

function detectTransport(conn: BrowserConnection | undefined, online: boolean): NetworkSnapshot["transport"] {
  if (!online) return "none";
  const t = conn?.type;
  if (t === "wifi" || t === "cellular" || t === "ethernet") return t;
  return "wifi";
}

export function sampleNetworkSnapshot(): NetworkSnapshot {
  if (typeof navigator === "undefined") {
    return {
      tier: "online",
      transport: "wifi",
      metered: false,
      rttMs: null,
      downlinkMbps: null,
      observedAt: new Date().toISOString(),
    };
  }
  const conn = (navigator as Navigator & { connection?: BrowserConnection }).connection;
  const online = navigator.onLine;
  return {
    tier: detectTier(conn, online),
    transport: detectTransport(conn, online),
    metered: !!conn?.saveData,
    rttMs: conn?.rtt ?? null,
    downlinkMbps: conn?.downlink ?? null,
    observedAt: new Date().toISOString(),
  };
}
