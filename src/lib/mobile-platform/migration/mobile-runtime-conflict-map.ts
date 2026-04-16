// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Runtime Conflict Map
// Records known cross-runtime contamination risks for audits.
// ═══════════════════════════════════════════════════════════════

export interface MobileRuntimeConflict {
  symbol: string;
  /** What it claims to do on mobile. */
  claim: string;
  /** Why it's actually risky on mobile. */
  risk: string;
  /** Mitigation guidance. */
  mitigation: string;
}

export const MOBILE_RUNTIME_CONFLICTS: ReadonlyArray<MobileRuntimeConflict> = [
  {
    symbol: "useElectronBridge",
    claim: "Provides desktop bridge access.",
    risk: "If imported by mobile pages, it claims desktop authority that does not exist on iOS/Android.",
    mitigation: "Mobile pages must NOT import. Bridge is gated to DESKTOP_HOST tier.",
  },
  {
    symbol: "localStorage-as-offline-store",
    claim: "Offline persistence via localStorage.",
    risk: "Volatile under iOS Safari memory pressure; not suitable as durable mobile queue.",
    mitigation: "Use mobileSyncQueue with platform-aware persistence adapter.",
  },
  {
    symbol: "navigator.serviceWorker for native push",
    claim: "Push via service worker.",
    risk: "Conflates web push with native APNs/FCM. Different lifecycles.",
    mitigation: "Route through push-contract; SW is fallback transport only.",
  },
  {
    symbol: "window.confirm for biometric prompt",
    claim: "User confirmation = biometric proof.",
    risk: "No cryptographic binding, no hardware proof.",
    mitigation: "Use BiometricContract.prompt; never trust window.confirm in production.",
  },
] as const;
