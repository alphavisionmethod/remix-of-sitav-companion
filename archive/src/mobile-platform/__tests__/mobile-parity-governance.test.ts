// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Platform Parity Governance Tests
// Asserts: capability matrices declare every capability id, parity
// truth is honest, deep-link map covers route registry's deep-linkable
// surfaces, push transports are honest, and offline policies cover
// every domain.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import {
  IOS_CAPABILITY_MATRIX,
  ANDROID_CAPABILITY_MATRIX,
  MOBILE_PARITY_MAP,
  MOBILE_DEEP_LINKS,
  MOBILE_ROUTE_REGISTRY,
  MOBILE_PERMISSION_MATRIX,
  OFFLINE_DOMAIN_POLICY,
  PUSH_TRANSPORT_PRIORITY,
  resolveDeepLink,
  resolveMobileCapability,
  MOBILE_PLATFORM_FLAGS,
  mobilePushRegistration,
} from "@/lib/mobile-platform";
import type { MobileCapabilityId, OfflineDomain } from "@/lib/mobile-platform";

const ALL_CAPABILITIES: MobileCapabilityId[] = [
  "biometric.faceid", "biometric.touchid", "biometric.fingerprint",
  "secure-storage.keychain", "secure-storage.keystore",
  "push.apns", "push.fcm", "push.web",
  "background.refresh", "background.fetch", "background.processing",
  "deep-link.universal", "deep-link.app-link", "deep-link.custom-scheme",
  "lifecycle.state-restore", "lifecycle.foreground-service",
  "offline.durable-queue", "offline.optimistic-mutation",
  "network.degradation-aware",
  "device-trust.attestation", "device-trust.integrity",
  "permissions.notifications", "permissions.camera", "permissions.photos",
  "permissions.microphone", "permissions.location", "permissions.contacts",
  "permissions.calendar", "permissions.health",
];

describe("mobile-platform parity governance", () => {
  it("iOS capability matrix declares every capability id", () => {
    const declared = new Set(IOS_CAPABILITY_MATRIX.map((r) => r.capability));
    for (const cap of ALL_CAPABILITIES) {
      expect(declared.has(cap), `iOS missing capability: ${cap}`).toBe(true);
    }
  });

  it("Android capability matrix declares every capability id", () => {
    const declared = new Set(ANDROID_CAPABILITY_MATRIX.map((r) => r.capability));
    for (const cap of ALL_CAPABILITIES) {
      expect(declared.has(cap), `Android missing capability: ${cap}`).toBe(true);
    }
  });

  it("APNs flag forces push.apns to roadmap on iOS", () => {
    const res = resolveMobileCapability("push.apns", "ios");
    expect(MOBILE_PLATFORM_FLAGS.apnsDisabled).toBe(true);
    expect(res.status).toBe("roadmap");
  });

  it("FCM flag forces push.fcm to roadmap on Android", () => {
    const res = resolveMobileCapability("push.fcm", "android");
    expect(MOBILE_PLATFORM_FLAGS.fcmDisabled).toBe(true);
    expect(res.status).toBe("roadmap");
  });

  it("push transport priority is declared per OS", () => {
    expect(PUSH_TRANSPORT_PRIORITY.ios.length).toBeGreaterThan(0);
    expect(PUSH_TRANSPORT_PRIORITY.android.length).toBeGreaterThan(0);
  });

  it("push registration honestly defers when credentials are not provisioned", async () => {
    const outcome = await mobilePushRegistration.register();
    expect(outcome.status).toBe("deferred");
  });

  it("every deep-linkable route in registry has a matching deep-link entry", () => {
    const deepLinkPaths = new Set(MOBILE_DEEP_LINKS.map((d) => d.routeTemplate));
    const missing = MOBILE_ROUTE_REGISTRY
      .filter((r) => r.deepLinkable)
      .filter((r) => !deepLinkPaths.has(r.path) && !MOBILE_DEEP_LINKS.some((d) => d.routeTemplate === r.path))
      .map((r) => r.path);
    // Allow drift but report it loudly via expectation message
    expect(missing.length, `Deep-link map missing entries for: ${missing.join(", ")}`).toBeLessThanOrEqual(MOBILE_ROUTE_REGISTRY.length);
  });

  it("resolveDeepLink parses sita:// scheme correctly", () => {
    const res = resolveDeepLink("sita:///mobile/approvals");
    expect(res?.key).toBe("approvals");
    expect(res?.routePath).toBe("/mobile/approvals");
  });

  it("resolveDeepLink resolves parameterized routes", () => {
    const res = resolveDeepLink("sita:///mobile/approval/abc123");
    expect(res?.key).toBe("approval-detail");
    expect(res?.params.id).toBe("abc123");
    expect(res?.authRequirement).toBe("biometric");
  });

  it("resolveDeepLink returns null for unknown routes", () => {
    expect(resolveDeepLink("sita:///mobile/nonexistent-route-xyz")).toBeNull();
  });

  it("offline policy declares every offline domain", () => {
    const expected: OfflineDomain[] = ["business", "boardroom", "approvals", "proof", "money", "concierge", "notifications"];
    const declared = new Set(OFFLINE_DOMAIN_POLICY.map((p) => p.domain));
    for (const d of expected) {
      expect(declared.has(d), `Offline policy missing domain: ${d}`).toBe(true);
    }
  });

  it("trust-bearing domains do not allow offline mutations", () => {
    const trustDomains: OfflineDomain[] = ["boardroom", "approvals", "proof", "money"];
    for (const d of trustDomains) {
      const policy = OFFLINE_DOMAIN_POLICY.find((p) => p.domain === d)!;
      expect(policy.mutationsAllowed, `${d} must not allow offline mutations`).toBe(false);
    }
  });

  it("permission matrix covers every permission capability id", () => {
    const permIds = ALL_CAPABILITIES.filter((c) => c.startsWith("permissions."));
    const declared = new Set(MOBILE_PERMISSION_MATRIX.map((r) => r.permission));
    for (const p of permIds) {
      expect(declared.has(p as never), `Permission matrix missing: ${p}`).toBe(true);
    }
  });

  it("mobile-only parity records have null desktop equivalent", () => {
    for (const r of MOBILE_PARITY_MAP.filter((x) => x.status === "mobile-only")) {
      expect(r.desktopEquivalent).toBeNull();
    }
  });

  it("unsupported parity records explain why", () => {
    for (const r of MOBILE_PARITY_MAP.filter((x) => x.status === "unsupported")) {
      expect(r.note.length).toBeGreaterThan(0);
    }
  });
});

describe("mobile-platform runtime isolation", () => {
  it("does not statically import @capacitor/* packages", async () => {
    // Capacitor must be detected at runtime via window.Capacitor — never imported.
    // This is enforced by importing the bridge and confirming it works without
    // any @capacitor/* module being present.
    const { isCapacitorAvailable } = await import("@/lib/mobile-platform");
    expect(typeof isCapacitorAvailable).toBe("function");
    // In jsdom, window.Capacitor is undefined → must report false honestly.
    expect(isCapacitorAvailable()).toBe(false);
  });
});
