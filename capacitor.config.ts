import type { CapacitorConfig } from "@capacitor/cli";

// ═══════════════════════════════════════════════════════════════
// SITA OS — Capacitor Configuration
//
// Bridges the SITA OS web SPA into native iOS/Android shells.
// Honors the mobile runtime contract (mobile-runtime-contract.ts).
// ═══════════════════════════════════════════════════════════════

const config: CapacitorConfig = {
  appId: "com.sita.os",
  appName: "SITA OS",
  webDir: "dist",
  bundledWebRuntime: false,

  // Live-reload from the Lovable preview during development.
  // Production builds bundle dist/ and ignore this block.
  server: {
    url: "https://e245cf40-61cc-4143-bfa4-f97382e8d62d.lovableproject.com?forceHideBadge=true",
    cleartext: true,
  },

  ios: {
    contentInset: "always",
    scheme: "sita",
    backgroundColor: "#0a0a0f",
    limitsNavigationsToAppBoundDomains: true,
  },

  android: {
    path: "android",
    allowMixedContent: false,
    backgroundColor: "#0a0a0f",
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: "#0a0a0f",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0a0a0f",
      overlaysWebView: false,
    },
    Keyboard: {
      resize: "body",
      style: "DARK",
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
