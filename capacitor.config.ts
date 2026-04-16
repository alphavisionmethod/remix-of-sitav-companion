// ═══════════════════════════════════════════════════════════════
// SITA OS — Capacitor Native Project Configuration
// Phase 12 — iOS & Android Deployability Closure
// ═══════════════════════════════════════════════════════════════

import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.lovable.e245cf4061cc4143bfa4f97382e8d62d",
  appName: "SITA OS",
  webDir: "dist",
  bundledWebRuntime: false,

  // Hot-reload from Lovable sandbox (development).
  // Comment out the `url` line for production store builds — the bundled
  // `dist/` will be loaded from the device.
  server: {
    url: "https://e245cf40-61cc-4143-bfa4-f97382e8d62d.lovableproject.com?forceHideBadge=true",
    cleartext: true,
  },

  ios: {
    contentInset: "always",
    limitsNavigationsToAppBoundDomains: true,
    backgroundColor: "#0b0f17",
    // Minimum iOS 16.0 — enforced by min-os-version-contract.ts
  },

  android: {
    backgroundColor: "#0b0f17",
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    // Minimum API 26 (Android 8.0) — enforced by min-os-version-contract.ts
  },

  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    App: {
      launchUrl: "sita://home",
    },
    Preferences: {
      group: "app.lovable.sita-os.secure",
    },
  },
};

export default config;
