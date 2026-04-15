// ═══════════════════════════════════════════════════════════════
// SITA OS — Sync Engine Barrel Export
// Complete distributed sync ecosystem
// ═══════════════════════════════════════════════════════════════

// Core
export { syncd } from "./syncd";
export { conflictResolver } from "./conflict-resolver";
export { deltaEngine } from "./delta-engine";
export { namespaceRegistry } from "./sync-namespaces";

// Adapters
export { fileWatchAdapter } from "./adapters/file-watch-adapter";
export { settingsSyncAdapter } from "./adapters/settings-sync-adapter";
export { sessionSyncAdapter } from "./adapters/session-sync-adapter";
export { appStateSyncAdapter } from "./adapters/app-state-adapter";
export { syncCacheDB } from "./adapters/sync-cache-db";

// Security
export { syncEncryption } from "./security/sync-encryption";
export { deviceIdentity } from "./security/device-identity";
export { syncAuth } from "./security/sync-auth";
export { syncPolicy } from "./security/sync-policy";

// Transport
export { realtimeClient } from "./transport/realtime-client";
export { uploadScheduler } from "./transport/upload-scheduler";
export { nearbySync } from "./transport/nearby-sync";
export { predictiveSync } from "./transport/predictive-sync";

// SDK & UX
export { syncAppSDK } from "./app-sdk";
export { syncStateMachine } from "./sync-state-machine";
export { syncNotifications } from "./sync-notifications";

// ─── Part 2: Ecosystem Extensions ─────────────────────────────

// Collaboration
export { sharingEngine } from "./collaboration/sharing-engine";
export { versionHistory } from "./collaboration/version-history";
export { activityJournal } from "./collaboration/activity-journal";
export { contentClassifier } from "./collaboration/content-classifier";

// Ecosystem
export { syncSearch } from "./ecosystem/sync-search";
export { presenceEngine } from "./ecosystem/presence-engine";
export { pushWakeEngine } from "./ecosystem/push-wake";
export { deviceEnrollment } from "./ecosystem/device-enrollment";

// Governance
export { syncQuotas } from "./governance/sync-quotas";
export { appGovernance } from "./governance/app-governance";
export { trustScoring } from "./governance/trust-scoring";
export { complianceEngine } from "./governance/compliance-engine";

// Operations
export { transferOptimizer } from "./operations/transfer-optimizer";
export { jobEngine } from "./operations/job-engine";
export { syncHealth } from "./operations/sync-health";
export { abusePrevention } from "./operations/abuse-prevention";

// ─── Types - Core ─────────────────────────────────────────────

export type {
  SyncObject, SyncObjectType, EncryptionClass, SyncObjectState,
  ContentRef, VersionVectorEntry, SyncChangeEvent, SyncCheckpoint,
  SyncObjectPermissions,
} from "./sync-object-model";
export type { SyncNamespace, ConflictStrategy, SyncPriority, NamespacePolicyFlags } from "./sync-namespaces";
export type { SyncConflict, ConflictResolution } from "./conflict-resolver";
export type { SyncDelta, DeltaType, DeltaOperation } from "./delta-engine";
export type { SyncMode, SyncJob, SyncDaemonStatus, EnvironmentSignals } from "./syncd";

// Types - Adapters
export type { FileEvent, SyncRoot, HydrationState, FileHydrationEntry } from "./adapters/file-watch-adapter";
export type { SettingSyncConfig, SettingsSnapshot } from "./adapters/settings-sync-adapter";
export type { SessionSnapshot, HandoffCandidate, WindowLayoutDescriptor } from "./adapters/session-sync-adapter";
export type { AppSyncManifest } from "./adapters/app-state-adapter";
export type { PendingChange, TransferJob, HydrationRecord, DeviceSyncPrefs } from "./adapters/sync-cache-db";

// Types - Security
export type { EncryptionKeyMeta, EncryptedPayload, KeyRotationEvent } from "./security/sync-encryption";
export type { DeviceIdentity, DeviceTrustLevel, DeviceType, DeviceCapabilities, DeviceFleetSummary } from "./security/device-identity";
export type { SyncAuthTokens, SyncAuthSession } from "./security/sync-auth";
export type { SyncPolicyRule, PolicyEvaluation, NetworkTrustState } from "./security/sync-policy";

// Types - Transport
export type { RealtimeSyncEvent, WSConnectionState, RealtimeConnectionStats } from "./transport/realtime-client";
export type { ManagedTransfer, SchedulerStats, TransferPriority } from "./transport/upload-scheduler";
export type { NearbyDevice, NearbyTransferOffer, NearbySession, NearbyConfig } from "./transport/nearby-sync";
export type { SyncPrediction, PredictiveSyncConfig, ActivityPattern } from "./transport/predictive-sync";

// Types - SDK & UX
export type { SyncSDKRegistration, AppSyncStatus } from "./app-sdk";
export type { SyncUXState, SyncStateInfo, StateTransition } from "./sync-state-machine";
export type { SyncNotification, SyncNotificationCategory } from "./sync-notifications";

// ─── Types - Part 2 ───────────────────────────────────────────

// Types - Collaboration
export type { ShareACL, ShareLink, ShareInvite, PresenceIndicator, ObjectLock, SharedWorkspace, ShareEvent, SharePermission } from "./collaboration/sharing-engine";
export type { VersionSnapshot, RestorePoint, TombstoneRecord, RetentionPolicy, VersionComparison, DeletionWorkflow } from "./collaboration/version-history";
export type { JournalEntry, JournalCategory, JournalSeverity, JournalQuery, JournalStats, DeviceActivitySummary } from "./collaboration/activity-journal";
export type { ContentClassification, DataSensitivity, FileSemantics, DuplicateGroup, ClassificationRule, MediaStrategy } from "./collaboration/content-classifier";

// Types - Ecosystem
export type { SearchableEntry, SearchResult, SearchQuery, SearchIndexStats, RecentActivity } from "./ecosystem/sync-search";
export type { DevicePresence, DevicePresenceStatus, HandoffSuggestion, ContinuitySession, ActivityGraphEntry, DeviceCapabilitySet } from "./ecosystem/presence-engine";
export type { PushRegistration, WakeRequest, WakeReason, ThrottleConfig, PushStats } from "./ecosystem/push-wake";
export type { EnrollmentFlow, EnrollmentStep, RecoveryRequest, RecoveryKey, DeviceRevocation, HydrationPlan } from "./ecosystem/device-enrollment";

// Types - Governance
export type { StorageQuota, NamespaceQuota, QuotaWarning, CleanupRecommendation, StoragePlan } from "./governance/sync-quotas";
export type { AppSyncPolicy, SelectiveSyncRule, AppAllowlist, SettingSyncCategory, GovernanceReport } from "./governance/app-governance";
export type { TrustScore, TrustState, TrustFactor, TrustCapabilities, TrustPolicy, TrustEvent } from "./governance/trust-scoring";
export type { UserAccount, AccountType, DataExportRequest, AccountDeletionWorkflow, ConsentRecord, RegionalPolicy, WebClientCapability, ComplianceAuditEntry } from "./governance/compliance-engine";

// Types - Operations
export type { ChunkedTransfer, DeduplicationResult, TransferOptimization, PrefetchCandidate, CompressionAlgo, TransferClass } from "./operations/transfer-optimizer";
export type { SyncJobEntry, JobType, JobStatus, JobEngineStats } from "./operations/job-engine";
export type { SyncHealthReport, HealthState, RepairAction, SyncTelemetry } from "./operations/sync-health";
export type { AbuseAlert, ThreatLevel, AbuseAction, RateLimit, MassChangeDetection } from "./operations/abuse-prevention";

// Helpers
export {
  createSyncObject, generateSyncId, computeObjectHash,
  compareVersionVectors, incrementVersionVector,
  tombstoneSyncObject, isTombstoneExpired, isSyncObjectType,
} from "./sync-object-model";
