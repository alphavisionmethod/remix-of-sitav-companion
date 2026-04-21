// SITA OS — Mobile Runtime Proof Map
export type MobileRuntimeSupport = "browser-compatible" | "pwa-enhanced" | "native-only" | "deferred" | "blocked";
export interface MobileRuntimeFeature { readonly featureId: string; readonly label: string; readonly browserMobile: MobileRuntimeSupport; readonly nativeMobile: MobileRuntimeSupport; readonly offlineSupport: boolean; readonly pushDependency: boolean; readonly evidenceSource: string; }
export const MOBILE_RUNTIME_FEATURES: readonly MobileRuntimeFeature[] = [
  { featureId: "auth", label: "Authentication", browserMobile: "browser-compatible", nativeMobile: "deferred", offlineSupport: false, pushDependency: false, evidenceSource: "src/integrations/supabase/client.ts" },
  { featureId: "dashboard", label: "Dashboard", browserMobile: "browser-compatible", nativeMobile: "deferred", offlineSupport: true, pushDependency: false, evidenceSource: "src/pages/Index.tsx" },
  { featureId: "files", label: "File Management", browserMobile: "browser-compatible", nativeMobile: "deferred", offlineSupport: true, pushDependency: false, evidenceSource: "src/pages/files/" },
  { featureId: "ai-advisors", label: "AI Advisors", browserMobile: "browser-compatible", nativeMobile: "deferred", offlineSupport: false, pushDependency: false, evidenceSource: "src/pages/advisors/" },
  { featureId: "notifications", label: "Push Notifications", browserMobile: "pwa-enhanced", nativeMobile: "deferred", offlineSupport: false, pushDependency: true, evidenceSource: "public/sw.js" },
  { featureId: "biometrics", label: "Biometric Auth", browserMobile: "browser-compatible", nativeMobile: "native-only", offlineSupport: false, pushDependency: false, evidenceSource: "src/lib/devices/biometric-capability-map.ts" },
  { featureId: "camera", label: "Camera", browserMobile: "browser-compatible", nativeMobile: "deferred", offlineSupport: false, pushDependency: false, evidenceSource: "navigator.mediaDevices" },
  { featureId: "offline-cache", label: "Offline Caching", browserMobile: "pwa-enhanced", nativeMobile: "deferred", offlineSupport: true, pushDependency: false, evidenceSource: "public/sw.js" },
  { featureId: "deep-links", label: "Deep Linking", browserMobile: "blocked", nativeMobile: "deferred", offlineSupport: false, pushDependency: false, evidenceSource: "N/A" },
  { featureId: "background-sync", label: "Background Sync", browserMobile: "pwa-enhanced", nativeMobile: "deferred", offlineSupport: true, pushDependency: false, evidenceSource: "BackgroundSyncManager" },
  { featureId: "share", label: "Native Share", browserMobile: "browser-compatible", nativeMobile: "deferred", offlineSupport: false, pushDependency: false, evidenceSource: "navigator.share" },
];
export function getBrowserCompatibleFeatures(): MobileRuntimeFeature[] { return MOBILE_RUNTIME_FEATURES.filter(f => f.browserMobile === "browser-compatible" || f.browserMobile === "pwa-enhanced"); }
export function getNativeOnlyFeatures(): MobileRuntimeFeature[] { return MOBILE_RUNTIME_FEATURES.filter(f => f.nativeMobile === "native-only"); }
