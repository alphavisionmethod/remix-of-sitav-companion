// ═══════════════════════════════════════════════════════════════
// Capacitor Capability Contract Test (Checklist 24.4)
// Asserts every declared mobile capability has both an iOS adapter
// and an Android adapter implementation present in the barrel.
// ═══════════════════════════════════════════════════════════════
import { describe, it, expect } from "vitest";
import * as MobilePlatform from "@/lib/mobile-platform";

const REQUIRED_ADAPTERS = [
  // iOS
  "iosRuntimeAdapter",
  "iosPushAdapter",
  "iosSecureStorage",
  "iosBiometricAdapter",
  "iosDeepLinkAdapter",
  "iosBackgroundTasksAdapter",
  "iosLifecycleAdapter",
  // Android
  "androidRuntimeAdapter",
  "androidPushAdapter",
  "androidSecureStorage",
  "androidBiometricAdapter",
  "androidDeepLinkAdapter",
  "androidBackgroundTasksAdapter",
  "androidLifecycleAdapter",
] as const;

const REQUIRED_RUNTIME_PRIMITIVES = [
  "mobileSyncQueue",
  "mobileOfflineSyncEngine",
  "MobileRuntimeProvider",
  "useMobileRuntime",
  "useMobileCapability",
] as const;

describe("Capacitor capability contract", () => {
  it("every declared adapter is exported by @/lib/mobile-platform", () => {
    const exported = new Set(Object.keys(MobilePlatform));
    const missing = REQUIRED_ADAPTERS.filter((a) => !exported.has(a));
    expect(missing, `Missing adapters: ${missing.join(", ")}`).toHaveLength(0);
  });

  it("every required runtime primitive is exported", () => {
    const exported = new Set(Object.keys(MobilePlatform));
    const missing = REQUIRED_RUNTIME_PRIMITIVES.filter((p) => !exported.has(p));
    expect(missing, `Missing primitives: ${missing.join(", ")}`).toHaveLength(0);
  });

  it("ios + android release channel registries exist", () => {
    const exported = MobilePlatform as Record<string, unknown>;
    expect(exported.IOS_RELEASE_CHANNELS).toBeTruthy();
    expect(exported.ANDROID_RELEASE_CHANNELS).toBeTruthy();
  });
});
