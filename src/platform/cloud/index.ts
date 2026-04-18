// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Barrel: src/platform/cloud
// Promoted by Wave 6f to be export-complete.
// ═══════════════════════════════════════════════════════════════

export { cloudStorageService } from "./cloud-storage-service";
export { cloudSyncService } from "./cloud-sync-service";
export { cloudDeviceService } from "./cloud-device-service";
export { cloudQuotaService } from "./cloud-quota-service";
export { cloudAuditService } from "./cloud-audit-service";
export { cloudTenantService } from "./cloud-tenant-service";
export { cloudWorkerService } from "./cloud-worker-service";
export { cloudLifecycleService } from "./cloud-lifecycle-service";
export { cloudAbuseService } from "./cloud-abuse-service";
export { cloudSupportService } from "./cloud-support-service";

export type { StorageUsageRecord, StorageHealthReport, BucketStats } from "./cloud-storage-service";
export type { SyncHealthReport, SyncConflict, SyncJob, DelayedUser } from "./cloud-sync-service";
export type { CloudDevice, TrustState, DeviceFleetReport } from "./cloud-device-service";
export type { CloudPlan, UserPlanAssignment, QuotaOverview } from "./cloud-quota-service";
export type { AuditEvent, SuspiciousBehavior, SecurityAlert, AuditSeverity } from "./cloud-audit-service";
export type { CloudTenant, TenantMembership, TenantQuota, TenantPolicy, SharedWorkspace } from "./cloud-tenant-service";
export type { WorkerJob, WorkerQueueStats } from "./cloud-worker-service";
export type { LifecycleRule, ArchiveJob, StorageTier, AccountClosureRequest, ReconciliationRun } from "./cloud-lifecycle-service";
export type { AbuseEvent, AbuseSummary } from "./cloud-abuse-service";
export type { SupportSession, DiagnosticBundle } from "./cloud-support-service";
