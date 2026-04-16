// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Platform Contract (canonical)
// First-class contract describing what mobile is and what it owns.
// Web/desktop/appliance code MUST NOT import from this file unless
// they explicitly cross the runtime boundary via runtime-context.
// ═══════════════════════════════════════════════════════════════

/** Discrete mobile OS targets. */
export type MobileOS = "ios" | "android";

/** Mobile runtime host shape (Capacitor, native shell, or web fallback). */
export type MobileHost = "capacitor" | "native" | "web-mobile";

/** Mobile release channel posture. */
export type MobileReleaseChannel = "internal" | "alpha" | "beta" | "production";

/** Mobile capability identifier — keep flat & enumerable for matrices. */
export type MobileCapabilityId =
  | "biometric.faceid"
  | "biometric.touchid"
  | "biometric.fingerprint"
  | "secure-storage.keychain"
  | "secure-storage.keystore"
  | "push.apns"
  | "push.fcm"
  | "push.web"
  | "background.refresh"
  | "background.fetch"
  | "background.processing"
  | "deep-link.universal"
  | "deep-link.app-link"
  | "deep-link.custom-scheme"
  | "lifecycle.state-restore"
  | "lifecycle.foreground-service"
  | "offline.durable-queue"
  | "offline.optimistic-mutation"
  | "network.degradation-aware"
  | "device-trust.attestation"
  | "device-trust.integrity"
  | "permissions.notifications"
  | "permissions.camera"
  | "permissions.photos"
  | "permissions.microphone"
  | "permissions.location"
  | "permissions.contacts"
  | "permissions.calendar"
  | "permissions.health";

/** Capability availability semantics — never lie about parity. */
export type MobileCapabilityStatus =
  | "supported"      // native + working
  | "fallback"       // web fallback exists, degraded but honest
  | "simulated"      // UI-only, no real native effect
  | "unsupported"    // explicitly unavailable on this OS/host
  | "roadmap";       // declared, not yet shipped

/** Permission posture per capability. */
export type MobilePermissionState =
  | "granted"
  | "denied"
  | "prompt"
  | "restricted"     // OS-level restriction (parental, MDM)
  | "unavailable";

/** Network degradation tiers — drives UI mode + sync policy. */
export type MobileNetworkTier =
  | "online"
  | "lite"        // metered / slow but usable
  | "degraded"    // intermittent, queue-only mutations
  | "offline";

/** Lifecycle phase the OS exposes to the app. */
export type MobileLifecyclePhase =
  | "cold-start"
  | "warm-resume"
  | "foreground"
  | "background"
  | "suspended"
  | "terminating";

/** Canonical mobile platform contract surface. */
export interface MobilePlatformContract {
  os: MobileOS;
  host: MobileHost;
  channel: MobileReleaseChannel;
  appVersion: string;
  osVersion: string;
  deviceModel: string | null;
  buildNumber: string;
  /** True when running on real device hardware, false in simulator/emulator. */
  isPhysicalDevice: boolean;
  /** True when the runtime can prove cryptographic key isolation (Secure Enclave / TEE). */
  hasSecureKeystore: boolean;
}

export const MOBILE_PLATFORM_CONTRACT_VERSION = "1.0.0" as const;
