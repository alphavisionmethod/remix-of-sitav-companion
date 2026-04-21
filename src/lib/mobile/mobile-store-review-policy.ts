// SITA OS — Mobile Store Review Policy
export interface StoreReviewRequirement { readonly requirementId: string; readonly platform: "ios" | "android"; readonly category: string; readonly label: string; readonly met: boolean; readonly evidence: string; readonly actionIfUnmet: string; }
export const STORE_REVIEW_REQUIREMENTS: readonly StoreReviewRequirement[] = [
  { requirementId: "sr-ios-privacy", platform: "ios", category: "privacy", label: "Privacy Policy URL", met: false, evidence: "Needs public URL", actionIfUnmet: "Publish privacy policy" },
  { requirementId: "sr-ios-screenshots", platform: "ios", category: "assets", label: "App Store Screenshots", met: false, evidence: "Matrix at archive/mobile/store-metadata/ios.screenshots.json", actionIfUnmet: "Generate screenshots" },
  { requirementId: "sr-ios-description", platform: "ios", category: "metadata", label: "App description", met: false, evidence: "Draft at archive/mobile/store-metadata/ios.json", actionIfUnmet: "Finalize in App Store Connect" },
  { requirementId: "sr-ios-age-rating", platform: "ios", category: "content", label: "Age rating", met: false, evidence: "Not completed", actionIfUnmet: "Complete in App Store Connect" },
  { requirementId: "sr-ios-export", platform: "ios", category: "legal", label: "Export compliance", met: false, evidence: "HTTPS-only", actionIfUnmet: "Complete export questionnaire" },
  { requirementId: "sr-android-privacy", platform: "android", category: "privacy", label: "Privacy Policy URL", met: false, evidence: "Needs public URL", actionIfUnmet: "Publish privacy policy" },
  { requirementId: "sr-android-data-safety", platform: "android", category: "privacy", label: "Data Safety declaration", met: false, evidence: "Draft at archive/mobile/store-metadata/android.data-safety.json", actionIfUnmet: "Submit via Play Console" },
  { requirementId: "sr-android-screenshots", platform: "android", category: "assets", label: "Play Store Screenshots", met: false, evidence: "Not generated", actionIfUnmet: "Generate screenshots" },
  { requirementId: "sr-android-iarc", platform: "android", category: "content", label: "IARC Content Rating", met: false, evidence: "Not completed", actionIfUnmet: "Complete in Play Console" },
  { requirementId: "sr-android-target-api", platform: "android", category: "sdk", label: "Target API level", met: false, evidence: "Policy at archive/mobile/android/TARGET_SDK_POLICY.md", actionIfUnmet: "Set targetSdkVersion" },
];
export function getUnmetRequirements(platform?: "ios" | "android"): StoreReviewRequirement[] { return STORE_REVIEW_REQUIREMENTS.filter(r => !r.met && (!platform || r.platform === platform)); }
