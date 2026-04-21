// SITA OS — Mobile Platform Compliance Map
export type ComplianceStatus = "compliant" | "deferred" | "not-applicable" | "action-required";
export interface ComplianceRequirement { readonly requirementId: string; readonly platform: "ios" | "android" | "both"; readonly category: string; readonly label: string; readonly status: ComplianceStatus; readonly evidence: string; readonly actionRequired: string; }
export const MOBILE_COMPLIANCE_REQUIREMENTS: readonly ComplianceRequirement[] = [
  { requirementId: "mc-privacy-manifest", platform: "ios", category: "privacy", label: "iOS Privacy Manifest", status: "deferred", evidence: "Archived at archive/mobile/ios/PrivacyInfo.xcprivacy", actionRequired: "Include when native app reactivated" },
  { requirementId: "mc-data-safety", platform: "android", category: "privacy", label: "Play Data Safety Declaration", status: "deferred", evidence: "Archived at archive/mobile/store-metadata/android.data-safety.json", actionRequired: "Submit via Play Console when listing created" },
  { requirementId: "mc-ats", platform: "ios", category: "network", label: "App Transport Security", status: "deferred", evidence: "ATS-strict in archive/mobile/ios/Info.plist.template", actionRequired: "Verify no exceptions needed" },
  { requirementId: "mc-notification-perm", platform: "both", category: "permissions", label: "Notification permission disclosure", status: "compliant", evidence: "Browser-native prompt with clear context", actionRequired: "None for PWA" },
  { requirementId: "mc-background", platform: "ios", category: "behavior", label: "iOS Background Modes", status: "deferred", evidence: "Declared in archive Info.plist", actionRequired: "Include when reactivated" },
  { requirementId: "mc-target-sdk", platform: "android", category: "sdk", label: "Target SDK compliance", status: "deferred", evidence: "Policy at archive/mobile/android/TARGET_SDK_POLICY.md", actionRequired: "Set targetSdkVersion when reactivated" },
  { requirementId: "mc-payment", platform: "both", category: "payments", label: "In-app purchase policy", status: "not-applicable", evidence: "SaaS/web-based payments", actionRequired: "Re-evaluate if native app offers digital goods" },
  { requirementId: "mc-deep-links", platform: "both", category: "navigation", label: "Universal/App Links", status: "deferred", evidence: "Scheme in archive/capacitor/capacitor.config.ts", actionRequired: "Deploy verification files when reactivated" },
];
export function getDeferredCompliance(): ComplianceRequirement[] { return MOBILE_COMPLIANCE_REQUIREMENTS.filter(r => r.status === "deferred"); }
