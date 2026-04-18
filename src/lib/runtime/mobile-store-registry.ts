// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Store Readiness Registry
//
// Canonical source of truth for everything the iOS App Store and
// Google Play console need to accept a SITA OS mobile build.
//
// This registry encodes the HONEST state per memory:
//   - APNs deferred (no Apple paid membership yet) → not blocking
//   - FCM blocked on FCM_SERVICE_ACCOUNT_JSON → not blocking
//   - Android pipeline can produce signed AAB once keystore present
//   - iOS pipeline is "build-able to .ipa" but signing/upload deferred
//
// Each requirement declares severity:
//   - "blocker"  → fails the gate (must be present to ship)
//   - "deferred" → emits a warning + reason (intentional)
//   - "future"   → informational, not yet planned
// ═══════════════════════════════════════════════════════════════

import { MOBILE_RUNTIME_CAPABILITIES, type MobileSurface } from "./mobile-runtime-contract";

export type MobileStoreSeverity = "blocker" | "deferred" | "future";
export type MobileStoreCategory =
  | "manifest"
  | "icons"
  | "splash"
  | "signing"
  | "privacy"
  | "store-metadata"
  | "permissions"
  | "build-pipeline"
  | "screenshots"
  | "compliance";

export interface MobileStoreRequirement {
  readonly id: string;
  readonly surface: MobileSurface | "shared";
  readonly category: MobileStoreCategory;
  readonly title: string;
  readonly description: string;
  readonly severity: MobileStoreSeverity;
  /** Files/paths that, if present, satisfy the requirement. Checked from repo root. */
  readonly satisfiedBy: readonly string[];
  /** Human-friendly remediation instruction. */
  readonly remediation: string;
  /** Honest blocker reason — surfaced in "deferred" cases. */
  readonly deferralReason?: string;
}

// ─── iOS App Store ─────────────────────────────────────────────
const IOS_REQUIREMENTS: MobileStoreRequirement[] = [
  {
    id: "ios-capacitor-config",
    surface: "ios",
    category: "manifest",
    title: "Capacitor config declares iOS",
    description: "capacitor.config.ts must declare appId, appName and ios scheme",
    severity: "blocker",
    satisfiedBy: ["capacitor.config.ts", "capacitor.config.json"],
    remediation: "Add capacitor.config.ts with ios.{contentInset, scheme}",
  },
  {
    id: "ios-app-icon-set",
    surface: "ios",
    category: "icons",
    title: "iOS AppIcon.appiconset present",
    description: "All required iOS icon sizes (20×20 → 1024×1024) declared",
    severity: "blocker",
    satisfiedBy: ["mobile/icons/ios/AppIcon.appiconset/Contents.json"],
    remediation: "Generate via npx capacitor-assets generate --ios",
  },
  {
    id: "ios-launch-storyboard",
    surface: "ios",
    category: "splash",
    title: "Launch screen storyboard",
    description: "iOS launch storyboard or splash asset",
    severity: "blocker",
    satisfiedBy: ["mobile/icons/ios/Splash.imageset/Contents.json"],
    remediation: "Generate via npx capacitor-assets generate --ios",
  },
  {
    id: "ios-info-plist-skeleton",
    surface: "ios",
    category: "manifest",
    title: "Info.plist skeleton + permissions",
    description: "Privacy usage strings (camera, biometrics, push) declared",
    severity: "blocker",
    satisfiedBy: ["mobile/ios/Info.plist.template"],
    remediation: "Author mobile/ios/Info.plist.template with NSCameraUsageDescription etc.",
  },
  {
    id: "ios-store-metadata",
    surface: "ios",
    category: "store-metadata",
    title: "App Store Connect metadata",
    description: "Store listing JSON (name, subtitle, description, keywords, support URL, privacy URL, categories)",
    severity: "blocker",
    satisfiedBy: ["mobile/store-metadata/ios.json"],
    remediation: "Fill mobile/store-metadata/ios.json from canonical template",
  },
  {
    id: "ios-privacy-manifest",
    surface: "ios",
    category: "privacy",
    title: "iOS PrivacyInfo.xcprivacy manifest",
    description: "Required privacy manifest enumerating data types collected & APIs used",
    severity: "blocker",
    satisfiedBy: ["mobile/ios/PrivacyInfo.xcprivacy"],
    remediation: "Author mobile/ios/PrivacyInfo.xcprivacy (Apple required since May 2024)",
  },
  {
    id: "ios-signing-config",
    surface: "ios",
    category: "signing",
    title: "iOS signing & provisioning config",
    description: "Match/Fastlane configuration or signing-instructions doc with team identifiers placeholder",
    severity: "deferred",
    satisfiedBy: ["mobile/ios/SIGNING.md"],
    remediation: "Provide Apple Team ID + .p8 key + provisioning profile in CI secrets",
    deferralReason: "Apple Developer Program membership not yet active",
  },
  {
    id: "ios-store-screenshots-spec",
    surface: "ios",
    category: "screenshots",
    title: "iOS screenshot specification",
    description: "Required device frames (6.7\", 6.5\", 5.5\", iPad 12.9\" gen-2/gen-6) declared",
    severity: "blocker",
    satisfiedBy: ["mobile/store-metadata/ios.screenshots.json"],
    remediation: "Author screenshot manifest declaring required device frames",
  },
];

// ─── Android Google Play ───────────────────────────────────────
const ANDROID_REQUIREMENTS: MobileStoreRequirement[] = [
  {
    id: "android-capacitor-config",
    surface: "android",
    category: "manifest",
    title: "Capacitor config declares Android",
    description: "capacitor.config.ts must declare android.{path, allowMixedContent}",
    severity: "blocker",
    satisfiedBy: ["capacitor.config.ts", "capacitor.config.json"],
    remediation: "Add capacitor.config.ts with android section",
  },
  {
    id: "android-icon-set",
    surface: "android",
    category: "icons",
    title: "Android adaptive icons (all densities)",
    description: "mipmap-mdpi → mipmap-xxxhdpi adaptive icons",
    severity: "blocker",
    satisfiedBy: ["mobile/icons/android/icon-manifest.json"],
    remediation: "Generate via npx capacitor-assets generate --android",
  },
  {
    id: "android-splash-set",
    surface: "android",
    category: "splash",
    title: "Android splash drawables",
    description: "Splash screen drawables across densities",
    severity: "blocker",
    satisfiedBy: ["mobile/icons/android/splash-manifest.json"],
    remediation: "Generate via npx capacitor-assets generate --android",
  },
  {
    id: "android-manifest-permissions",
    surface: "android",
    category: "permissions",
    title: "AndroidManifest permissions template",
    description: "Declared permissions match capability matrix (camera, biometric, internet, push)",
    severity: "blocker",
    satisfiedBy: ["mobile/android/AndroidManifest.permissions.xml"],
    remediation: "Author mobile/android/AndroidManifest.permissions.xml",
  },
  {
    id: "android-store-metadata",
    surface: "android",
    category: "store-metadata",
    title: "Google Play store listing metadata",
    description: "Title (≤30), short description (≤80), full description (≤4000), category, content rating",
    severity: "blocker",
    satisfiedBy: ["mobile/store-metadata/android.json"],
    remediation: "Fill mobile/store-metadata/android.json from canonical template",
  },
  {
    id: "android-data-safety",
    surface: "android",
    category: "privacy",
    title: "Data safety declaration",
    description: "Google Play Data Safety form payload (categories, encryption-in-transit, deletion path)",
    severity: "blocker",
    satisfiedBy: ["mobile/store-metadata/android.data-safety.json"],
    remediation: "Author mobile/store-metadata/android.data-safety.json",
  },
  {
    id: "android-signing-config",
    surface: "android",
    category: "signing",
    title: "Android signing config + Play upload key",
    description: "Keystore properties template + Play App Signing instructions",
    severity: "deferred",
    satisfiedBy: ["mobile/android/SIGNING.md"],
    remediation: "Generate upload keystore + register Play App Signing",
    deferralReason: "Awaiting Google Play Console publisher account + keystore provisioning",
  },
  {
    id: "android-target-sdk-policy",
    surface: "android",
    category: "compliance",
    title: "Target SDK policy doc (API ≥34)",
    description: "Declares targetSdkVersion ≥ 34 (Play 2024 requirement) and migration log",
    severity: "blocker",
    satisfiedBy: ["mobile/android/TARGET_SDK_POLICY.md"],
    remediation: "Author target SDK policy stating API 34 floor",
  },
  {
    id: "android-fcm-service-account",
    surface: "android",
    category: "permissions",
    title: "FCM service-account secret slot",
    description: "FCM_SERVICE_ACCOUNT_JSON secret required for push delivery",
    severity: "deferred",
    satisfiedBy: ["mobile/android/FCM.md"],
    remediation: "Provide FCM_SERVICE_ACCOUNT_JSON via supabase secrets when ready",
    deferralReason: "FCM credentials are provisioned at deploy time, not source-controlled",
  },
];

// ─── Shared (build pipeline) ───────────────────────────────────
const SHARED_REQUIREMENTS: MobileStoreRequirement[] = [
  {
    id: "shared-build-pipeline",
    surface: "shared",
    category: "build-pipeline",
    title: "CI workflow builds IPA + AAB",
    description: "GitHub Actions workflow produces signed-or-unsigned IPA + AAB artifacts",
    severity: "blocker",
    satisfiedBy: [".github/workflows/mobile-build.yml"],
    remediation: "Add .github/workflows/mobile-build.yml with macos-14 (iOS) + ubuntu-latest (Android) jobs",
  },
  {
    id: "shared-store-pipeline-doc",
    surface: "shared",
    category: "build-pipeline",
    title: "Store submission doc",
    description: "End-to-end submission steps + secret manifest",
    severity: "blocker",
    satisfiedBy: ["docs/mobile/STORE_SUBMISSION.md"],
    remediation: "Author docs/mobile/STORE_SUBMISSION.md",
  },
  {
    id: "shared-runtime-contract-honest",
    surface: "shared",
    category: "compliance",
    title: "Mobile runtime contract honest",
    description: "MOBILE_RUNTIME_CAPABILITIES enumerates capabilities for all 3 surfaces",
    severity: "blocker",
    satisfiedBy: ["src/lib/runtime/mobile-runtime-contract.ts"],
    remediation: "Existing — must contain entries for ios, android, mobile-pwa",
  },
];

export const MOBILE_STORE_REQUIREMENTS: readonly MobileStoreRequirement[] = [
  ...IOS_REQUIREMENTS,
  ...ANDROID_REQUIREMENTS,
  ...SHARED_REQUIREMENTS,
];

export function getMobileStoreRequirements(surface: MobileSurface | "shared"): readonly MobileStoreRequirement[] {
  return MOBILE_STORE_REQUIREMENTS.filter((r) => r.surface === surface);
}

/** Honesty cross-check: surfaces with app-store-distribution=false should have a deferred signing requirement. */
export function honestlyDistributable(surface: MobileSurface): boolean {
  const cap = MOBILE_RUNTIME_CAPABILITIES.find(
    (c) => c.surface === surface && c.capability === "app-store-distribution",
  );
  return cap?.available === true;
}
