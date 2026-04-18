// ═══════════════════════════════════════════════════════════════
// SITA OS — Device Capability Registry
// Canonical capability classes across all device form factors
// References: device-identity.ts, desktop-host-runtime.ts
// ═══════════════════════════════════════════════════════════════

import type { DeviceFormFactor } from "./device-identity-registry";

// ── Types ────────────────────────────────────────────────────

export type DetectionMethod = "api-probe" | "user-agent" | "ipc-query" | "capability-api" | "manual-config";
export type FallbackBehavior = "degrade-gracefully" | "disable-feature" | "prompt-user" | "use-cloud-proxy" | "none";

export interface DeviceCapabilityEntry {
  id: string;
  name: string;
  category: string;
  description: string;
  detectionMethod: DetectionMethod;
  fallback: FallbackBehavior;
  requiredForTrust: boolean;
  availableOn: DeviceFormFactor[];
}

// ── Registry ─────────────────────────────────────────────────

export const DEVICE_CAPABILITY_REGISTRY: DeviceCapabilityEntry[] = [
  // Storage
  { id: "file-system", name: "File System Access", category: "storage", description: "Direct file system read/write", detectionMethod: "ipc-query", fallback: "use-cloud-proxy", requiredForTrust: false, availableOn: ["desktop-workstation", "laptop", "server-appliance"] },
  { id: "indexeddb", name: "IndexedDB", category: "storage", description: "Browser-level structured storage", detectionMethod: "api-probe", fallback: "degrade-gracefully", requiredForTrust: false, availableOn: ["desktop-workstation", "laptop", "tablet", "smartphone", "kiosk"] },
  { id: "local-storage", name: "Local Storage", category: "storage", description: "Key-value browser storage", detectionMethod: "api-probe", fallback: "disable-feature", requiredForTrust: false, availableOn: ["desktop-workstation", "laptop", "tablet", "smartphone", "kiosk"] },

  // Security
  { id: "tpm", name: "TPM 2.0", category: "security", description: "Trusted Platform Module hardware", detectionMethod: "ipc-query", fallback: "degrade-gracefully", requiredForTrust: true, availableOn: ["desktop-workstation", "laptop", "server-appliance"] },
  { id: "secure-enclave", name: "Secure Enclave", category: "security", description: "Hardware-isolated secure storage", detectionMethod: "ipc-query", fallback: "degrade-gracefully", requiredForTrust: true, availableOn: ["desktop-workstation", "laptop", "smartphone", "tablet"] },
  { id: "biometric", name: "Biometric Auth", category: "security", description: "Fingerprint, Face, or Iris recognition", detectionMethod: "capability-api", fallback: "prompt-user", requiredForTrust: false, availableOn: ["desktop-workstation", "laptop", "smartphone", "tablet"] },

  // Network
  { id: "push-notifications", name: "Push Notifications", category: "network", description: "System-level push delivery", detectionMethod: "api-probe", fallback: "degrade-gracefully", requiredForTrust: false, availableOn: ["desktop-workstation", "laptop", "smartphone", "tablet", "kiosk"] },
  { id: "background-sync", name: "Background Sync", category: "network", description: "Offline queue + sync on reconnect", detectionMethod: "api-probe", fallback: "disable-feature", requiredForTrust: false, availableOn: ["desktop-workstation", "laptop", "smartphone", "tablet"] },
  { id: "websocket", name: "WebSocket", category: "network", description: "Persistent bidirectional connection", detectionMethod: "api-probe", fallback: "degrade-gracefully", requiredForTrust: false, availableOn: ["desktop-workstation", "laptop", "tablet", "smartphone", "server-appliance", "kiosk"] },

  // Display
  { id: "multi-monitor", name: "Multi-Monitor", category: "display", description: "Multiple display outputs", detectionMethod: "api-probe", fallback: "none", requiredForTrust: false, availableOn: ["desktop-workstation", "laptop"] },
  { id: "gpu-acceleration", name: "GPU Acceleration", category: "display", description: "Hardware-accelerated rendering", detectionMethod: "api-probe", fallback: "degrade-gracefully", requiredForTrust: false, availableOn: ["desktop-workstation", "laptop", "tablet", "smartphone"] },

  // System
  { id: "system-tray", name: "System Tray", category: "system", description: "OS-level tray icon and menu", detectionMethod: "ipc-query", fallback: "disable-feature", requiredForTrust: false, availableOn: ["desktop-workstation", "laptop"] },
  { id: "auto-update", name: "Auto Update", category: "system", description: "Silent background updates", detectionMethod: "ipc-query", fallback: "prompt-user", requiredForTrust: false, availableOn: ["desktop-workstation", "laptop", "server-appliance"] },
  { id: "deep-link", name: "Deep Linking", category: "system", description: "Protocol handler registration", detectionMethod: "ipc-query", fallback: "disable-feature", requiredForTrust: false, availableOn: ["desktop-workstation", "laptop", "smartphone", "tablet"] },
  { id: "clipboard-rich", name: "Rich Clipboard", category: "system", description: "Copy/paste with images and files", detectionMethod: "api-probe", fallback: "degrade-gracefully", requiredForTrust: false, availableOn: ["desktop-workstation", "laptop", "tablet"] },

  // Sensors
  { id: "camera", name: "Camera", category: "sensor", description: "Photo/video capture", detectionMethod: "capability-api", fallback: "disable-feature", requiredForTrust: false, availableOn: ["laptop", "smartphone", "tablet"] },
  { id: "gyroscope", name: "Gyroscope", category: "sensor", description: "Orientation and motion sensing", detectionMethod: "capability-api", fallback: "none", requiredForTrust: false, availableOn: ["smartphone", "tablet"] },
  { id: "nfc", name: "NFC", category: "sensor", description: "Near-field communication", detectionMethod: "capability-api", fallback: "disable-feature", requiredForTrust: false, availableOn: ["smartphone"] },
  { id: "gps", name: "GPS", category: "sensor", description: "Geolocation services", detectionMethod: "capability-api", fallback: "prompt-user", requiredForTrust: false, availableOn: ["smartphone", "tablet"] },
];

// ── Queries ──────────────────────────────────────────────────

export function getCapabilitiesForFormFactor(formFactor: DeviceFormFactor): DeviceCapabilityEntry[] {
  return DEVICE_CAPABILITY_REGISTRY.filter(c => c.availableOn.includes(formFactor));
}

export function getCapabilityById(id: string): DeviceCapabilityEntry | undefined {
  return DEVICE_CAPABILITY_REGISTRY.find(c => c.id === id);
}

export function getCapabilitiesByCategory(category: string): DeviceCapabilityEntry[] {
  return DEVICE_CAPABILITY_REGISTRY.filter(c => c.category === category);
}

export function getTrustRequiredCapabilities(): DeviceCapabilityEntry[] {
  return DEVICE_CAPABILITY_REGISTRY.filter(c => c.requiredForTrust);
}

export function getCapabilityCategories(): string[] {
  return [...new Set(DEVICE_CAPABILITY_REGISTRY.map(c => c.category))];
}
