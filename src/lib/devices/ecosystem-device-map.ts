// ═══════════════════════════════════════════════════════════════
// SITA OS — Ecosystem Device Map
// Full device topology: form factors, roles, sync topology
// ═══════════════════════════════════════════════════════════════

import type { DeviceFormFactor, DeviceRole } from "./device-identity-registry";

// ── Types ────────────────────────────────────────────────────

export type SyncTopology = "hub-spoke" | "mesh" | "pull-only" | "push-only" | "none";
export type DataResidency = "full-replica" | "partial-cache" | "metadata-only" | "none";

export interface EcosystemDeviceEntry {
  formFactor: DeviceFormFactor;
  typicalRoles: DeviceRole[];
  syncTopology: SyncTopology;
  dataResidency: DataResidency;
  isAlwaysOn: boolean;
  typicalCount: string;
  primaryUseCases: string[];
  limitations: string[];
}

// ── Map ──────────────────────────────────────────────────────

export const ECOSYSTEM_DEVICE_MAP: EcosystemDeviceEntry[] = [
  {
    formFactor: "desktop-workstation",
    typicalRoles: ["primary-workstation", "development-machine"],
    syncTopology: "hub-spoke",
    dataResidency: "full-replica",
    isAlwaysOn: false,
    typicalCount: "1-2 per user",
    primaryUseCases: ["Full OS experience", "Multi-window workflows", "Heavy data processing", "Admin operations"],
    limitations: ["Not portable", "Requires power"],
  },
  {
    formFactor: "laptop",
    typicalRoles: ["primary-workstation", "mobile-companion"],
    syncTopology: "hub-spoke",
    dataResidency: "full-replica",
    isAlwaysOn: false,
    typicalCount: "1-2 per user",
    primaryUseCases: ["Portable full OS", "Travel workflows", "Presentations"],
    limitations: ["Battery dependent", "Smaller display"],
  },
  {
    formFactor: "smartphone",
    typicalRoles: ["mobile-companion"],
    syncTopology: "pull-only",
    dataResidency: "partial-cache",
    isAlwaysOn: true,
    typicalCount: "1 per user",
    primaryUseCases: ["Quick approvals", "Notifications", "On-the-go tasks", "Biometric auth"],
    limitations: ["Small screen", "No windowing", "Limited storage"],
  },
  {
    formFactor: "tablet",
    typicalRoles: ["mobile-companion"],
    syncTopology: "pull-only",
    dataResidency: "partial-cache",
    isAlwaysOn: false,
    typicalCount: "0-1 per user",
    primaryUseCases: ["Reading/review", "Light editing", "Presentations"],
    limitations: ["No file system", "Touch-only input"],
  },
  {
    formFactor: "server-appliance",
    typicalRoles: ["server-appliance"],
    syncTopology: "mesh",
    dataResidency: "full-replica",
    isAlwaysOn: true,
    typicalCount: "1-3 per organization",
    primaryUseCases: ["Data sovereignty", "Local processing", "Backup", "Edge compute"],
    limitations: ["No UI", "Requires network"],
  },
  {
    formFactor: "kiosk",
    typicalRoles: ["shared-kiosk"],
    syncTopology: "pull-only",
    dataResidency: "metadata-only",
    isAlwaysOn: true,
    typicalCount: "0-5 per organization",
    primaryUseCases: ["Shared access point", "Check-in", "Display"],
    limitations: ["No persistent auth", "Public exposure", "Limited trust"],
  },
  {
    formFactor: "embedded",
    typicalRoles: ["monitoring-terminal"],
    syncTopology: "push-only",
    dataResidency: "none",
    isAlwaysOn: true,
    typicalCount: "0-N per organization",
    primaryUseCases: ["Sensor data collection", "Monitoring", "Automation triggers"],
    limitations: ["No UI", "Minimal compute", "Constrained network"],
  },
];

// ── Queries ──────────────────────────────────────────────────

export function getEcosystemDevice(formFactor: DeviceFormFactor): EcosystemDeviceEntry | undefined {
  return ECOSYSTEM_DEVICE_MAP.find(d => d.formFactor === formFactor);
}

export function getDevicesBySync(topology: SyncTopology): EcosystemDeviceEntry[] {
  return ECOSYSTEM_DEVICE_MAP.filter(d => d.syncTopology === topology);
}

export function getAlwaysOnDevices(): EcosystemDeviceEntry[] {
  return ECOSYSTEM_DEVICE_MAP.filter(d => d.isAlwaysOn);
}

export function getFullReplicaDevices(): EcosystemDeviceEntry[] {
  return ECOSYSTEM_DEVICE_MAP.filter(d => d.dataResidency === "full-replica");
}
