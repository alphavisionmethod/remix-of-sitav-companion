// SITA OS — Mobile Readiness Contract
export type MobileHonestyState = "DEFERRED" | "PARTIAL_RUNTIME_ONLY" | "INTERNAL_ONLY" | "DISTRIBUTION_BLOCKED" | "STORE_PENDING" | "PRODUCTION_READY";
export type MobileDimensionStatus = "implemented" | "partial" | "deferred" | "not-applicable" | "blocked";
export interface MobileReadinessDimension { readonly dimension: string; readonly status: MobileDimensionStatus; readonly evidence: string; readonly blockers: string[]; }
export interface MobileReadinessContract { readonly honestyState: MobileHonestyState; readonly overallReadiness: string; readonly activeSurfaces: string[]; readonly archivedSurfaces: string[]; readonly dimensions: readonly MobileReadinessDimension[]; readonly distributionBlockers: string[]; readonly closurePath: string[]; readonly reactivationDoc: string; readonly honestyDoc: string; }
export const MOBILE_READINESS: MobileReadinessContract = {
  honestyState: "DEFERRED",
  overallReadiness: "archived-with-pwa-fallback",
  activeSurfaces: ["web-spa-responsive", "pwa-installable", "web-push-vapid"],
  archivedSurfaces: ["native-ios-app", "native-android-app", "app-store-listing", "play-store-listing", "apns-push", "fcm-push", "capacitor-wrapper"],
  dimensions: [
    { dimension: "code-readiness", status: "partial", evidence: "PWA implemented; native Capacitor shell archived", blockers: ["Native shell not in active codebase"] },
    { dimension: "runtime-readiness", status: "partial", evidence: "Responsive web works on mobile browsers", blockers: ["No native runtime active"] },
    { dimension: "distribution-readiness", status: "blocked", evidence: "No store accounts enrolled", blockers: ["Apple Developer Program not enrolled", "Google Play Console not enrolled"] },
    { dimension: "store-readiness", status: "blocked", evidence: "Store metadata archived", blockers: ["No active store listings"] },
    { dimension: "signing-readiness", status: "blocked", evidence: "Signing docs archived", blockers: ["No signing certificates provisioned"] },
    { dimension: "push-readiness", status: "partial", evidence: "Web Push (VAPID) active; APNs/FCM deferred", blockers: ["APNs not provisioned", "FCM not provisioned"] },
    { dimension: "compliance-readiness", status: "partial", evidence: "Privacy manifest archived", blockers: ["No active store compliance review"] },
    { dimension: "supportability-readiness", status: "partial", evidence: "Web support covers mobile browser", blockers: ["No native crash reporting"] },
    { dimension: "offline-readiness", status: "partial", evidence: "PWA service worker provides basic offline", blockers: ["No native offline sync"] },
    { dimension: "release-channel-readiness", status: "blocked", evidence: "No active mobile release channels", blockers: ["No TestFlight/Play Console configured"] },
  ],
  distributionBlockers: ["Apple Developer Program not enrolled", "Google Play Console not enrolled", "No native shell active", "No signing credentials", "No APNs/FCM credentials", "No store listings"],
  closurePath: ["1. Enroll Apple Developer Program", "2. Enroll Google Play Console", "3. Restore Capacitor from archive/", "4. Provision signing certs", "5. Provision push certs", "6. Create store listings", "7. Submit for review", "8. Pass all mobile validators"],
  reactivationDoc: "generated/mobile-scope-closure/MOBILE_REACTIVATION_CONDITIONS.md",
  honestyDoc: "docs/MOBILE_HONESTY.md",
};
export function getMobileHonestyState(): MobileHonestyState { return MOBILE_READINESS.honestyState; }
export function isMobileProductionReady(): boolean { return MOBILE_READINESS.honestyState === "PRODUCTION_READY"; }
export function getMobileBlockers(): string[] { return MOBILE_READINESS.distributionBlockers; }
export function getMobileBlockedDimensions(): MobileReadinessDimension[] { return MOBILE_READINESS.dimensions.filter(d => d.status === "blocked"); }
