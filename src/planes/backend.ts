// ═══════════════════════════════════════════════════════════════
// SITA OS — Backend Plane Public API
// All consumer code MUST import backend capabilities from here.
// Direct imports from @/lib/core-services/ are forbidden.
// ═══════════════════════════════════════════════════════════════

// ── Trust & Approval ──
export * from "@/lib/core-services/approval-engine";
export { ReceiptService } from "@/lib/core-services/receipt-service";
export type { Receipt, ProofPack } from "@/lib/core-services/receipt-service";

// ── AI Gateway ──
export { invokeAICapability, invokeSynthesis, invokeUtility } from "@/lib/ai/ai-capability-client";
export type { TrustEnrichedResponse } from "@/lib/ai/ai-capability-client";

// ── Canonical Execution ──
export { CANONICAL_EXECUTION_STAGES } from "@/lib/core-services/canonical-execution-path";
export type { CanonicalStage, ExecutionPathRecord } from "@/lib/core-services/canonical-execution-path";
export { CanonicalChainOrchestrator, createCanonicalChain } from "@/lib/core-services/canonical-chain-orchestrator";

// ── Brain Core ──
export * from "@/lib/core-services/brain-core";

// ── Capability Router ──
export { CapabilityRouter } from "@/lib/core-services/capability-router";

// ── API Gateway ──
export type { GatewayRoute, GatewayRequest } from "@/lib/core-services/api-gateway";

// ── Analytics ──
export type { Metric, MetricAggregation, UsageReport } from "@/lib/core-services/analytics-service";

// ── Billing ──
export type { BillingAccount, BillingLimits } from "@/lib/core-services/billing-service";

// ── Event Bus ──
export { EventBus, getEventBus } from "@/lib/core-services/event-bus";

// ── Executor Service ──
export { ExecutorService, getExecutorService } from "@/lib/core-services/executor-service";

// ── Trust Governor ──
export * from "@/lib/core-services/trust-governor";

// ── Policy Engine ──
export * from "@/lib/core-services/policy-engine";

// ── Workflow Engine ──
export * from "@/lib/core-services/workflow-engine";

// ── Memory Service ──
export * from "@/lib/core-services/memory-service";

// ── Verification Engine ──
export * from "@/lib/core-services/verification-engine";

// ── Self-Healing ──
export * from "@/lib/core-services/self-healing";

// ── Security ──
export * from "@/lib/core-services/security";

// ── Search Fabric ──
export { searchFabric } from "@/lib/core-services/search-fabric";

// ── Projection Service ──
export * from "@/lib/core-services/projection-service";

// ── Fraud Sentinel ──
export { fraudSentinel } from "@/lib/core-services/fraud-sentinel";

// ── Governance Simulator ──
export { governanceSimulator } from "@/lib/core-services/governance-simulator";

// ── Epistemic Firewall ──
export * from "@/lib/core-services/epistemic-firewall";

// ── Conscience Gate ──
export * from "@/lib/core-services/conscience-gate";

// ── Service Registry ──
export * from "@/lib/core-services/service-registry";

// ── Flagship Loops ──
export * from "@/lib/core-services/flagship-loops";

// ── Launch Readiness ──
export * from "@/lib/core-services/launch-readiness";

// ── Canonical Pipeline ──
export * from "@/lib/core-services/canonical-pipeline";

// ── Recommendation Execution ──
export * from "@/lib/core-services/recommendation-execution";

// ── Identity & Auth ──
export * from "@/lib/core-services/identity-auth";

// ── Handoff ──
export * from "@/lib/core-services/handoff";

// ── Cloud Backbone ──
export {
  cloudStorageService, cloudSyncService, cloudDeviceService,
  cloudQuotaService, cloudAuditService, cloudTenantService,
  cloudWorkerService, cloudLifecycleService, cloudAbuseService,
  cloudSupportService,
} from "@/lib/cloud-backbone";
export type {
  StorageUsageRecord, StorageHealthReport, BucketStats,
  SyncHealthReport, SyncConflict, SyncJob, DelayedUser,
  CloudDevice, TrustState, DeviceFleetReport,
  CloudPlan, UserPlanAssignment, QuotaOverview,
  AuditEvent, SuspiciousBehavior, SecurityAlert, AuditSeverity,
  CloudTenant, TenantMembership, TenantQuota, TenantPolicy, SharedWorkspace,
  WorkerJob, WorkerQueueStats,
  LifecycleRule, ArchiveJob, StorageTier, AccountClosureRequest, ReconciliationRun,
  AbuseEvent, AbuseSummary,
  SupportSession, DiagnosticBundle,
} from "@/lib/cloud-backbone";

// ── Persistence Layer ──
export {
  persistReceipt, fetchReceipts,
  persistProof, fetchProofs,
  persistMemory, fetchMemory, forgetMemory,
} from "@/lib/persistence";
export type { PersistedReceipt, PersistedProof, PersistedMemoryEntry } from "@/lib/persistence";

// ── Observability ──
export {
  logger, setMinLogLevel, setCorrelationId, getLogBuffer, clearLogBuffer,
  recordAICost, getCostSummary, checkBudget,
  probeSupabase, probeAuth, probeStorage, runAllProbes, getOverallHealth,
  telemetry, computeHealthIndex, useObservability,
} from "@/lib/observability";
export type {
  LogLevel, LogEntry, CostRecord, CostSummary, ProbeResult,
  CompositeHealthIndex, SubsystemHealth, HealthGrade,
  UseObservabilityReturn,
} from "@/lib/observability";

// ── AI Services Gateway ──
export * from "@/lib/services/ai-gateway";

// ── Sovereign AI Gateway (Compute Governance) ──
export * from "@/lib/sovereign-ai-gateway";

// ── Domain Engines ──
export * from "@/lib/domain-engines";

// ── Advisor Intelligence ──
export * from "@/lib/advisor-intelligence";

// ── Strategic Intelligence ──
export * from "@/lib/strategic-intelligence";

// ── Boardroom ──
export * from "@/lib/boardroom";

// ── Intelligence Architecture ──
export * from "@/lib/intelligence-architecture";

// ── Compute Governance ──
export * from "@/lib/compute-governance";

// ── No-Hallucination ──
export * from "@/lib/no-hallucination";

// ── Advisor Protocol ──
export * from "@/lib/advisor-protocol";

// ── Detection ──
export * from "@/lib/detection";

// ── AI Engineering ──
export * from "@/lib/ai-engineering";

// ── Platform Plane Services ──
export { environmentConfig } from "@/lib/platform-plane/environment-config";
export { planeRegistry } from "@/lib/platform-plane/plane-registry";
export { serviceAuth } from "@/lib/platform-plane/service-auth";
export { adminBFF } from "@/lib/platform-plane/admin-bff";
export { userBFF } from "@/lib/platform-plane/user-bff";
export { notificationRouter } from "@/lib/platform-plane/notification-router";
export { supportWorkflow } from "@/lib/platform-plane/support-workflow";
export { adminRbacEngine } from "@/lib/platform-plane/admin-rbac-engine";
export { adminSafety } from "@/lib/platform-plane/admin-safety";

// ── Verification ──
export * from "@/lib/verification";
