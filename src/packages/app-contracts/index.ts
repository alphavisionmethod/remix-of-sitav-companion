// ═══════════════════════════════════════════════════════════════
// SITA OS — App Contracts Package
// Barrel re-exporting all typed app platform contracts for
// external consumers, edge functions, and packages.
// ═══════════════════════════════════════════════════════════════

// Lifecycle state machine
export type {
  AppLifecycleState,
  LifecycleTransitionDef,
} from "@/lib/app-platform/app-lifecycle-state-machine";
export {
  LIFECYCLE_TRANSITIONS,
  ALL_LIFECYCLE_STATES,
  isValidTransition,
  getTransition,
  getNextStates,
  validateTransition,
} from "@/lib/app-platform/app-lifecycle-state-machine";

// Lifecycle manager
export type { LifecycleReceipt } from "@/lib/app-platform/app-lifecycle-manager";
export { appLifecycleManager } from "@/lib/app-platform/app-lifecycle-manager";

// Install registry
export type {
  InstallRecord,
  AppHealthSummary,
  SystemHealthSummary,
} from "@/lib/app-platform/app-install-registry";
export { appInstallRegistry } from "@/lib/app-platform/app-install-registry";

// Permission ledger
export type {
  PermissionAction,
  PermissionLedgerEntry,
  PermissionAuditExport,
} from "@/lib/app-platform/app-permission-ledger";
export {
  recordGrant,
  recordDenial,
  recordRevocation,
  getHistory,
  getEffectiveGrants,
  exportAudit,
} from "@/lib/app-platform/app-permission-ledger";

// Trust tier policy
export type { TrustTier, TrustTierPolicy } from "@/lib/app-platform/app-trust-tier-policy";
export {
  getTrustTierPolicy,
  badgeToTier,
  shouldAutoGrantPermission,
  canInstallWithoutApproval,
  getAllTrustTierPolicies,
} from "@/lib/app-platform/app-trust-tier-policy";

// Upgrade policy
export type { UpdateChannel, UpgradeCompatibility, AutoUpdateRule } from "@/lib/app-platform/app-upgrade-policy";
export {
  canUpgrade,
  requiresDataMigration,
  isAutoUpdateAllowed,
  getUpgradeRuleMatrix,
} from "@/lib/app-platform/app-upgrade-policy";

// Window policy
export type { AppWindowClass, WindowPolicy } from "@/lib/app-platform/app-window-policy";
export {
  getWindowPolicy,
  deriveWindowClass,
  getAllWindowPolicies,
} from "@/lib/app-platform/app-window-policy";

// Uninstall cleanup
export type { CleanupResult } from "@/lib/app-platform/app-uninstall-cleanup";
export { performFullCleanup } from "@/lib/app-platform/app-uninstall-cleanup";

// Observability
export type { AppMetrics, AppDiagnostics } from "@/lib/app-platform/app-observability";
export { getAppMetrics, getSystemHealth, exportDiagnostics } from "@/lib/app-platform/app-observability";

// Support bundle
export type { AppSupportBundle, SystemSupportBundle } from "@/lib/app-platform/app-support-bundle";
export { generateBundle, generateSystemBundle } from "@/lib/app-platform/app-support-bundle";