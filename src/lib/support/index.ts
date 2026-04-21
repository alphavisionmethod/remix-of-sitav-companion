// ═══════════════════════════════════════════════════════════════
// SITA OS — Support Layer Barrel
// Canonical import: @/lib/support
// ═══════════════════════════════════════════════════════════════

export {
  RUNBOOK_REGISTRY,
  getRunbook,
  getRunbooksBySeverity,
  getRunbooksForService,
  getRunbooksWithKillSwitch,
  getRunbooksByOwner,
  getUntestedRunbooks,
  getRunbooksByStatus,
  getRunbookForKillSwitch,
  getRunbooksByBoundedContext,
  getRunbookForSubsystem,
} from "./runbook-registry";

export type {
  RunbookSeverity,
  RunbookStatus,
  RunbookStep,
  RunbookEntry,
  RunbookSubsystem,
} from "./runbook-types";

export {
  RUNBOOK_SUBSYSTEM_REQUIREMENTS,
  getMandatorySubsystems,
  getCriticalIncidentSubsystems,
  type RunbookSubsystemRequirement,
} from "./runbook-subsystem-map";

export {
  resolveRunbookForAlert,
  resolveRunbooksForIncident,
  describeResolution,
  type ResolveAlertInput,
  type ResolveIncidentInput,
} from "./runbook-resolver";

export {
  getLastDrillForRunbook,
  getDrillSummaries,
  triggerRunbookDrill,
  type RunbookDrillResult,
  type DrillSummary,
} from "./runbook-drill-status";

// ── Wave 20 — Supportability Platform Closure ──

export type {
  BundleType,
  BundlePack,
  SupportBundle,
  ExpiryPolicy,
  RedactionRecord,
  RedactionCategory,
  RedactionStatus,
  BundleExpiryClass,
  EscalationPackage,
  EscalationSeverity,
  EscalationTarget,
  KillSwitchSuggestion,
  SupportSession,
  SupportSessionAction,
  SupportSessionStatus,
  SupportDomainPackMap,
} from "./support-bundle-contract";

export {
  applyRedactionPolicy,
  verifyRedaction,
  COVERED_CATEGORIES,
} from "./support-redaction-policy";

export {
  resolveExpiryPolicy,
  computeExpiresAt,
  isBundleExpired,
  GOVERNED_BUNDLE_TYPES,
} from "./support-bundle-expiry-policy";

export {
  buildEnvironmentFingerprint,
  toFingerprintPack,
} from "./environment-fingerprint-builder";

export {
  buildRuntimeCrashPack,
  toCrashPack,
} from "./runtime-crash-pack-builder";

export {
  buildIntegrationHealthPack,
  toIntegrationHealthPack,
} from "./integration-health-pack-builder";

export {
  SupportBundleBuilder,
  createSupportBundle,
} from "./support-bundle-builder";

export {
  EscalationPackageBuilder,
  createEscalationPackage,
} from "./escalation-package-builder";

export {
  SupportSessionTracer,
  startSupportSession,
} from "./support-session-trace";

export {
  linkIssueToRunbooks,
} from "./support-issue-linkage";

export {
  suggestKillSwitch,
  classificationToSuggestion,
} from "./support-kill-switch-suggester";

export {
  exportForCustomer,
} from "./customer-safe-export";
