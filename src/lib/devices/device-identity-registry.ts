// ═══════════════════════════════════════════════════════════════
// SITA OS — Device Identity Registry
// Extends DeviceIdentityManager with ecosystem-level queries
// References: sync-engine/security/device-identity.ts
// ═══════════════════════════════════════════════════════════════

import type { DeviceTrustLevel } from "@/packages/contracts/graph/device-attestation";

// ── Device Form Factors ──────────────────────────────────────

export type DeviceFormFactor =
  | "desktop-workstation" | "laptop" | "tablet"
  | "smartphone" | "server-appliance" | "kiosk"
  | "embedded" | "unknown";

export type DeviceRole =
  | "primary-workstation" | "mobile-companion"
  | "shared-kiosk" | "server-appliance"
  | "backup-device" | "development-machine"
  | "monitoring-terminal";

export type DeviceOS =
  | "windows" | "macos" | "linux"
  | "ios" | "android" | "chromeos"
  | "embedded-linux" | "unknown";

export interface DeviceIdentityEntry {
  deviceId: string;
  formFactor: DeviceFormFactor;
  role: DeviceRole;
  os: DeviceOS;
  trustLevel: DeviceTrustLevel;
  displayName: string;
  lastSeenAt: string;
  isOnline: boolean;
  syncEnabled: boolean;
  capabilities: string[];
}

// ── Ecosystem Queries ────────────────────────────────────────

export interface DevicePopulationStats {
  total: number;
  online: number;
  offline: number;
  byFormFactor: Record<DeviceFormFactor, number>;
  byTrustLevel: Record<DeviceTrustLevel, number>;
  byOS: Record<DeviceOS, number>;
}

export function computeDevicePopulationStats(devices: DeviceIdentityEntry[]): DevicePopulationStats {
  const stats: DevicePopulationStats = {
    total: devices.length,
    online: devices.filter(d => d.isOnline).length,
    offline: devices.filter(d => !d.isOnline).length,
    byFormFactor: {} as Record<DeviceFormFactor, number>,
    byTrustLevel: {} as Record<DeviceTrustLevel, number>,
    byOS: {} as Record<DeviceOS, number>,
  };
  for (const d of devices) {
    stats.byFormFactor[d.formFactor] = (stats.byFormFactor[d.formFactor] || 0) + 1;
    stats.byTrustLevel[d.trustLevel] = (stats.byTrustLevel[d.trustLevel] || 0) + 1;
    stats.byOS[d.os] = (stats.byOS[d.os] || 0) + 1;
  }
  return stats;
}

export function filterDevicesByTrust(
  devices: DeviceIdentityEntry[],
  minTrust: DeviceTrustLevel
): DeviceIdentityEntry[] {
  const trustOrder: DeviceTrustLevel[] = ["untrusted", "basic", "verified", "hardware-attested"];
  const minIdx = trustOrder.indexOf(minTrust);
  return devices.filter(d => trustOrder.indexOf(d.trustLevel) >= minIdx);
}

export function getDevicesByRole(devices: DeviceIdentityEntry[], role: DeviceRole): DeviceIdentityEntry[] {
  return devices.filter(d => d.role === role);
}

export function getOnlineDevices(devices: DeviceIdentityEntry[]): DeviceIdentityEntry[] {
  return devices.filter(d => d.isOnline);
}
