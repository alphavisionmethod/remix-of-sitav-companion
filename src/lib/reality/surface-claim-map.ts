// ═══════════════════════════════════════════════════════════════
// SITA OS — Surface Claim Map
// Each surface declares the marketing/UI claims it is allowed to make.
// Bound to launch-honesty-rules.ts.
// ═══════════════════════════════════════════════════════════════

import type { SurfaceId } from "./feature-reality-types";

export interface SurfaceClaimSet {
  readonly surface: SurfaceId;
  readonly allowedClaims: readonly string[];
  readonly forbiddenClaims: readonly string[];
}

export const SURFACE_CLAIM_MAP: readonly SurfaceClaimSet[] = [
  {
    surface: "web",
    allowedClaims: [
      "Browser-first SPA",
      "Installable web application",
      "Real-time multi-user collaboration",
      "Sandbox-bound storage",
    ],
    forbiddenClaims: [
      "Replaces your operating system",
      "Direct kernel access",
      "Hardware-attested authority",
      "Bespoke kernel",
    ],
  },
  {
    surface: "electron",
    allowedClaims: [
      "Desktop host wrapper",
      "Native window controls",
      "Auto-updates via host bridge",
      "Local file integration",
    ],
    forbiddenClaims: [
      "Bespoke operating system",
      "Replaces macOS / Windows / Linux",
      "Direct ring-0 access",
    ],
  },
  {
    surface: "appliance",
    allowedClaims: [
      "Managed runtime authority",
      "First-boot ceremony",
      "OTA update agent",
      "Backup & restore service",
      "Self-contained appliance image",
    ],
    forbiddenClaims: [
      "Bespoke kernel", // until real
      "Hardware-isolated TEE", // until real
    ],
  },
  {
    surface: "ios",
    allowedClaims: [
      "Native iOS application",
      "Biometric authentication",
      "Offline-first sync",
      "Web push notifications",
    ],
    forbiddenClaims: [
      "App Store distributed", // until paid Apple membership
      "APNs push", // deferred
    ],
  },
  {
    surface: "android",
    allowedClaims: [
      "Native Android application",
      "Biometric authentication",
      "FCM push notifications",
      "Play Store distributable",
    ],
    forbiddenClaims: [
      "Replaces Android system services",
    ],
  },
  {
    surface: "mobile-pwa",
    allowedClaims: [
      "Installable PWA",
      "Add to home screen",
      "Web push notifications",
      "Offline service worker",
    ],
    forbiddenClaims: [
      "App Store distributed",
      "Hardware-backed secure storage",
    ],
  },
  {
    surface: "admin",
    allowedClaims: [
      "Operator control plane",
      "Audit & receipts",
      "Kill-switch authority",
      "Approval workflows",
    ],
    forbiddenClaims: [
      "Mobile-native admin",
    ],
  },
];

export function getClaimsForSurface(surface: SurfaceId): SurfaceClaimSet | undefined {
  return SURFACE_CLAIM_MAP.find((s) => s.surface === surface);
}

export function isClaimAllowed(surface: SurfaceId, claim: string): boolean {
  const set = getClaimsForSurface(surface);
  if (!set) return false;
  if (set.forbiddenClaims.some((c) => claim.toLowerCase().includes(c.toLowerCase()))) return false;
  return set.allowedClaims.some((c) => claim.toLowerCase().includes(c.toLowerCase()));
}
