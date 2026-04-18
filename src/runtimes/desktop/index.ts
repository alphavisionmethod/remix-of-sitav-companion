// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Barrel: Desktop
// Canonical import path: @/runtimes/desktop
// Re-exports all desktop runtime governance modules
// ═══════════════════════════════════════════════════════════════

export const DESKTOP_RUNTIME_ID = "desktop" as const;

// ── Detection ────────────────────────────────────────────────
export {
  isElectronRuntime,
  detectDesktopRuntime,
  hasBridgeMethod,
  getElectronBridge,
  getDesktopPlatform,
  type DesktopPlatform,
  type DesktopRuntimeInfo,
} from "@/runtimes/desktop/desktop-runtime-detection";

// ── Host Contract ────────────────────────────────────────────
export {
  DESKTOP_HOST_CONTRACT,
  DESKTOP_DEPLOYMENT_ASSUMPTIONS,
  DESKTOP_EXCLUSIVE_FEATURES,
  DESKTOP_WEB_SHARED_FEATURES,
  type DesktopPrivilege,
  type DesktopBoundary,
  type DesktopHostContractEntry,
} from "@/runtimes/desktop/desktop-host-contract";

// ── Host Capabilities ────────────────────────────────────────
export {
  DESKTOP_CAPABILITIES,
  probeDesktopCapabilities,
  getCapabilitiesByCategory,
  getCapabilitiesWithWebFallback,
  getDesktopExclusiveCapabilities,
  type DesktopCapability,
  type CapabilityStatus,
} from "@/runtimes/desktop/desktop-host-capabilities";

// ── Bridge Contract ──────────────────────────────────────────
export {
  BRIDGE_METHOD_REGISTRY,
  BRIDGE_METHOD_COUNT,
  type ElectronBridgeSurface,
  type BridgeMethodEntry,
  type BridgeMethodCategory,
  type UpdateStatusEvent,
  type SaveFileOptions,
  type ReadFileOptions,
  type BackupEntry,
  type CrashReport,
  type RendererError,
} from "@/runtimes/desktop/electron-bridge-contract";

// ── Bridge Capabilities ──────────────────────────────────────
export {
  BRIDGE_CAPABILITY_BINDINGS,
  getCapabilityForMethod,
  getAuditRequiredMethods,
  getMethodsBySecurityClass,
  type SecurityClass,
  type RuntimeConsequence,
  type BridgeCapabilityBinding,
} from "@/runtimes/desktop/electron-bridge-capabilities";

// ── Feature Gates ────────────────────────────────────────────
export {
  checkDesktopFeature,
  canAccessFilesystem,
  canAutoUpdate,
  canControlWindow,
  canLocalBackup,
  canReportCrashes,
  canSendNotifications,
  getFeatureGateSummary,
  type FeatureGateResult,
} from "@/runtimes/desktop/desktop-feature-gates";

// ── Security Boundaries ──────────────────────────────────────
export {
  DESKTOP_SECURITY_BOUNDARIES,
  getSecurityPostureSummary,
  type SecurityBoundary,
  type TrustEnforcement,
  type ThreatVector,
  type SecurityPostureSummary,
} from "@/runtimes/desktop/desktop-security-boundaries";

// ── Update Contract ──────────────────────────────────────────
export {
  UPDATE_LIFECYCLE_TRANSITIONS,
  UPDATE_SIGNING_ASSUMPTIONS,
  UPDATE_ROLLBACK_BEHAVIOR,
  UPDATE_DEGRADED_MODE,
  type UpdateLifecycleState,
  type UpdateLifecycleTransition,
} from "@/runtimes/desktop/desktop-update-contract";

// ── Release Channels ─────────────────────────────────────────
export {
  RELEASE_CHANNELS,
  getReleaseChannel,
  getCurrentReleaseChannel,
  isBelowMinimumVersion,
  type ReleaseChannelId,
  type ReleaseChannel,
  type MinimumVersionPolicy,
} from "@/runtimes/desktop/desktop-release-channel-map";

// ── Fallbacks ────────────────────────────────────────────────
export {
  DESKTOP_FALLBACKS,
  withDesktopFallback,
  getFallbackForCapability,
  getCapabilitiesByFallbackStrategy,
  type FallbackStrategy,
  type FallbackDefinition,
} from "@/runtimes/desktop/desktop-fallbacks";
