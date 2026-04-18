// ═══════════════════════════════════════════════════════════════
// SITA OS — Web Fallback Definitions
// Honest fallback strategies for capabilities under WEB_APP.
// ═══════════════════════════════════════════════════════════════

export type WebFallbackStrategy =
  | "browser-upload-picker"
  | "download-upload-roundtrip"
  | "in-app-toast"
  | "service-worker"
  | "webauthn"
  | "explain-and-block";

export interface WebFallback {
  capabilityId: string;
  strategy: WebFallbackStrategy;
  userMessage: string;
}

export const WEB_FALLBACKS: readonly WebFallback[] = [
  {
    capabilityId: "filesystem-local",
    strategy: "browser-upload-picker",
    userMessage: "Use the file picker to select a file from your device.",
  },
  {
    capabilityId: "local-backup",
    strategy: "download-upload-roundtrip",
    userMessage: "Download your backup file, then upload it to restore.",
  },
  {
    capabilityId: "notifications-native",
    strategy: "in-app-toast",
    userMessage: "We'll show you updates in-app while this tab is open.",
  },
  {
    capabilityId: "offline-mode",
    strategy: "service-worker",
    userMessage: "Cached assets and recent data remain available offline.",
  },
  {
    capabilityId: "biometric-auth",
    strategy: "webauthn",
    userMessage: "Use your device passkey to authenticate.",
  },
  {
    capabilityId: "tray-icon",
    strategy: "explain-and-block",
    userMessage: "System tray icons are only available on the desktop app.",
  },
];

export function getWebFallback(capabilityId: string): WebFallback | undefined {
  return WEB_FALLBACKS.find((f) => f.capabilityId === capabilityId);
}
