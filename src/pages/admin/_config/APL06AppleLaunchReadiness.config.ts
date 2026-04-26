// ═══════════════════════════════════════════════════════════════
// APL06AppleLaunchReadiness — UI catalog (Wave 9.2)
//
// Authored Apple-ecosystem launch surface catalog. Live readiness
// rows come from the `ambient_launch_readiness` table (filtered to
// `target_key like 'apple_%'`) and overlay this baseline.
// ═══════════════════════════════════════════════════════════════

export type LaunchStage = "alpha" | "beta" | "planned" | "ga";

export interface AppleLaunchTarget {
  key: string;
  target: string;
  stage: LaunchStage;
  readiness: number;
  demo: boolean;
  pilot: boolean;
  launch: boolean;
  critical: boolean;
  blockers: string[];
  deps: string[];
}

/** Authored Apple ecosystem launch surface catalog. */
export const APPLE_LAUNCH_TARGETS: AppleLaunchTarget[] = [
  {
    key: "apple_macos_app",
    target: "macOS Desktop App",
    stage: "alpha",
    readiness: 78,
    demo: true, pilot: true, launch: false, critical: true,
    blockers: ["Notarization certificate renewal pending", "DMG build pipeline missing in CI"],
    deps: [],
  },
  {
    key: "apple_ios_app",
    target: "iOS Companion App",
    stage: "planned",
    readiness: 22,
    demo: false, pilot: false, launch: false, critical: true,
    blockers: ["Apple Developer Program enrollment in progress", "Push entitlement not configured"],
    deps: ["apple_macos_app"],
  },
  {
    key: "apple_watch_extension",
    target: "Apple Watch Companion",
    stage: "planned",
    readiness: 8,
    demo: false, pilot: false, launch: false, critical: false,
    blockers: ["Watch entitlements pending", "Glance UI not designed"],
    deps: ["apple_ios_app"],
  },
  {
    key: "apple_handoff",
    target: "Handoff / Continuity",
    stage: "planned",
    readiness: 12,
    demo: false, pilot: false, launch: false, critical: false,
    blockers: ["NSUserActivity routing not implemented"],
    deps: ["apple_macos_app", "apple_ios_app"],
  },
  {
    key: "apple_sso",
    target: "Sign in with Apple",
    stage: "alpha",
    readiness: 64,
    demo: true, pilot: false, launch: false, critical: true,
    blockers: ["Production OAuth credentials not yet rotated"],
    deps: [],
  },
  {
    key: "apple_passkeys",
    target: "Passkeys / WebAuthn",
    stage: "beta",
    readiness: 88,
    demo: true, pilot: true, launch: false, critical: false,
    blockers: [],
    deps: ["apple_sso"],
  },
];