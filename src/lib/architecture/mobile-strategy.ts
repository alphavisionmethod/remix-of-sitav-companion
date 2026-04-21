// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Strategy Declaration
// Truthful mobile capability map: what exists now vs future
// ═══════════════════════════════════════════════════════════════

export type MobileCapabilityStatus = "active-production" | "active-optional" | "planned" | "deferred" | "not-planned";

export interface MobileCapability {
  capability: string;
  status: MobileCapabilityStatus;
  surface: string;
  description: string;
  availableNow: boolean;
}

export const MOBILE_CAPABILITY_MAP: readonly MobileCapability[] = [
  {
    capability: "Responsive Web Access",
    status: "active-production",
    surface: "Mobile Browser",
    description: "Full SITA OS web experience optimized for mobile viewports",
    availableNow: true,
  },
  {
    capability: "PWA Install",
    status: "active-optional",
    surface: "Home Screen (PWA)",
    description: "Add-to-home-screen via browser PWA support (Chrome, Edge, Safari)",
    availableNow: true,
  },
  {
    capability: "Web Push Notifications",
    status: "planned",
    surface: "Browser / PWA",
    description: "Push notifications via VAPID web push (no APNs/FCM required)",
    availableNow: false,
  },
  {
    capability: "Offline Access",
    status: "planned",
    surface: "PWA",
    description: "Service worker caching for core screens when offline",
    availableNow: false,
  },
  {
    capability: "Native iOS App",
    status: "deferred",
    surface: "App Store",
    description: "Native iOS application — requires Apple Developer Program, signing, and store review",
    availableNow: false,
  },
  {
    capability: "Native Android App",
    status: "deferred",
    surface: "Play Store",
    description: "Native Android application — requires Play Console, signing, and store review",
    availableNow: false,
  },
  {
    capability: "APNs Push (iOS Native)",
    status: "deferred",
    surface: "iOS Native",
    description: "Apple Push Notification service — requires native app and APNs credentials",
    availableNow: false,
  },
  {
    capability: "FCM Push (Android Native)",
    status: "deferred",
    surface: "Android Native",
    description: "Firebase Cloud Messaging — requires native app and FCM project",
    availableNow: false,
  },
  {
    capability: "Mobile Companion (Approvals)",
    status: "planned",
    surface: "PWA / Future Native",
    description: "Lightweight approval and notification interface for operators on mobile",
    availableNow: false,
  },
  {
    capability: "Biometric Auth",
    status: "deferred",
    surface: "Native Only",
    description: "Face ID / fingerprint authentication — requires native app",
    availableNow: false,
  },
] as const;

export const MOBILE_STRATEGY = {
  currentApproach: "PWA-first",
  pushTransport: "VAPID web push",
  nativeAppsStatus: "deferred",
  truthStatement: "SITA OS works on mobile through the responsive web and installable PWA. There is no native iOS or Android app. Native mobile is deferred pending a strategic decision with named owner.",
  reactivationRequirements: [
    "Signed strategic decision with named program owner",
    "Apple Developer Program membership active",
    "Google Play Console enrollment active",
    "Production signing material provisioned in CI",
    "Real-device QA and accessibility audits passing",
    "Push transport truth (APNs + FCM) resolved end-to-end",
    "Native app quality review complete",
  ],
} as const;

export function getActiveCapabilities(): readonly MobileCapability[] {
  return MOBILE_CAPABILITY_MAP.filter((c) => c.availableNow);
}

export function getDeferredCapabilities(): readonly MobileCapability[] {
  return MOBILE_CAPABILITY_MAP.filter((c) => c.status === "deferred");
}