// ═══════════════════════════════════════════════════════════════
// SITA OS — Desktop Device Capabilities
// Desktop-specific capabilities extending DesktopHostCapabilities
// References: desktop-host-runtime.ts contracts
// ═══════════════════════════════════════════════════════════════

import type { DesktopHostCapabilities } from "@/packages/contracts/native/desktop-host-runtime";

export interface DesktopCapabilityMeta {
  id: string;
  name: string;
  category: string;
  electronOnly: boolean;
  ipcChannel: string | null;
  webFallback: string | null;
  description: string;
}

export const DESKTOP_DEVICE_CAPABILITIES: DesktopCapabilityMeta[] = [
  { id: "file-system", name: "File System Access", category: "storage", electronOnly: true, ipcChannel: "file-system-rw", webFallback: "File API (limited)", description: "Read/write local filesystem" },
  { id: "tpm", name: "TPM 2.0", category: "security", electronOnly: true, ipcChannel: "trust-attestation", webFallback: null, description: "Hardware trust module access" },
  { id: "secure-enclave", name: "Secure Enclave", category: "security", electronOnly: true, ipcChannel: "trust-attestation", webFallback: null, description: "Hardware-isolated key storage" },
  { id: "system-tray", name: "System Tray", category: "ui", electronOnly: true, ipcChannel: "tray-actions", webFallback: null, description: "OS tray icon, menu, badge" },
  { id: "auto-update", name: "Auto Update", category: "lifecycle", electronOnly: true, ipcChannel: "auto-update", webFallback: "Service Worker update", description: "Silent background application updates" },
  { id: "deep-link", name: "Deep Link Handler", category: "integration", electronOnly: true, ipcChannel: "deep-link", webFallback: "URL routing", description: "Custom protocol handler registration" },
  { id: "clipboard-rich", name: "Rich Clipboard", category: "ui", electronOnly: false, ipcChannel: null, webFallback: "Clipboard API", description: "Copy/paste with images, files, rich text" },
  { id: "notifications-native", name: "Native Notifications", category: "ui", electronOnly: true, ipcChannel: "notifications", webFallback: "Notification API", description: "OS-level notification with actions" },
  { id: "multi-monitor", name: "Multi-Monitor", category: "display", electronOnly: true, ipcChannel: "system-info", webFallback: "screen API (limited)", description: "Multi-display detection and window placement" },
  { id: "window-management", name: "Window Management", category: "ui", electronOnly: true, ipcChannel: "window-control", webFallback: "FloatingWindow simulation", description: "Native minimize, maximize, close, fullscreen" },
  { id: "biometric-desktop", name: "Desktop Biometrics", category: "security", electronOnly: true, ipcChannel: "trust-attestation", webFallback: "WebAuthn (limited)", description: "Windows Hello, Touch ID on Mac" },
  { id: "local-backup", name: "Local Backup", category: "storage", electronOnly: true, ipcChannel: "file-system-rw", webFallback: null, description: "Automated local data backup" },
  { id: "gpu-acceleration", name: "GPU Acceleration", category: "display", electronOnly: false, ipcChannel: null, webFallback: "WebGL / CSS transforms", description: "Hardware-accelerated rendering" },
  { id: "crash-reporting", name: "Crash Reporting", category: "lifecycle", electronOnly: true, ipcChannel: "system-info", webFallback: "Error boundary + cloud logging", description: "Native crash dump collection" },
];

// ── Default capabilities shape (for runtime probing) ────────

export function createDefaultDesktopCapabilities(): DesktopHostCapabilities {
  return {
    fileSystem: { available: false, readAccess: false, writeAccess: false, watchSupported: false, sandboxed: true, allowedPaths: [], maxFileSizeMB: 100 },
    biometrics: { available: false, methods: [], enrolled: false, fallbackToPassword: true },
    notifications: { available: false, supportsActions: false, supportsImages: false, maxVisible: 5, soundSupported: false },
    tray: { available: false, supportsMenu: false, supportsBadge: false, supportsProgress: false },
    autoUpdate: { available: false, channel: "stable", autoDownload: false, autoInstall: false },
    deepLink: { available: false, registeredProtocols: [], handleInForeground: true },
    hardwareProbe: { available: false, tpmAccess: false, secureEnclaveAccess: false, gpuAcceleration: true, displayInfo: false },
    clipboard: { available: true, supportsRichText: true, supportsImages: false, supportsFiles: false, historyEnabled: false },
  };
}

// ── Queries ──────────────────────────────────────────────────

export function getDesktopCapability(id: string): DesktopCapabilityMeta | undefined {
  return DESKTOP_DEVICE_CAPABILITIES.find(c => c.id === id);
}

export function getElectronOnlyCapabilities(): DesktopCapabilityMeta[] {
  return DESKTOP_DEVICE_CAPABILITIES.filter(c => c.electronOnly);
}

export function getCapabilitiesWithWebFallback(): DesktopCapabilityMeta[] {
  return DESKTOP_DEVICE_CAPABILITIES.filter(c => c.webFallback !== null);
}

export function getDesktopCapabilitiesByCategory(category: string): DesktopCapabilityMeta[] {
  return DESKTOP_DEVICE_CAPABILITIES.filter(c => c.category === category);
}
