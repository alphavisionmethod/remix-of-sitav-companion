// ═══════════════════════════════════════════════════════════════
// SITA OS — os-services barrel (Layer 3 OS daemons)
// Namespaced per-module to avoid cross-daemon name collisions
// (e.g. DiagnosticBundle exported by both crashd and diagnostic-bundle).
// ═══════════════════════════════════════════════════════════════
export * as abiVersioning from "./abi-versioning";
export * as accessibilityd from "./accessibilityd";
export * as appLifecycle from "./app-lifecycle";
export * as audiod from "./audiod";
export * as automationd from "./automationd";
export * as btd from "./btd";
export * as capabilityCatalog from "./capability-catalog";
export * as crashd from "./crashd";
export * as deviced from "./deviced";
export * as diagnosticBundle from "./diagnostic-bundle";
export * as entityIdentity from "./entity-identity";
export * as healthGraph from "./health-graph";
export * as healthd from "./healthd";
export * as helpEngine from "./help-engine";
export * as localizationInfra from "./localization-infra";
export * as migrationEngine from "./migration-engine";
export * as networkPolicyMatrix from "./network-policy-matrix";
export * as notificationClassifier from "./notification-classifier";
export * as osEventSystem from "./os-event-system";
export * as platformIpcBus from "./platform-ipc-bus";
export * as policyResolver from "./policy-resolver";
export * as powerd from "./powerd";
export * as quotaGovernor from "./quota-governor";
export * as recommendationRanker from "./recommendation-ranker";
export * as recoveryLevels from "./recovery-levels";
export * as releaseLifecycle from "./release-lifecycle";
export * as searchIndexer from "./search-indexer";
export * as settingsd from "./settingsd";
export * as signingTrustChain from "./signing-trust-chain";
export * as sloTargets from "./slo-targets";
export * as storageStrategy from "./storage-strategy";
export * as timed from "./timed";
export * as wifid from "./wifid";
