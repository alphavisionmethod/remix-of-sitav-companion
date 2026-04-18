// ═══════════════════════════════════════════════════════════════
// SITA OS — Backend Plane Public API (Complete)
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

// ── Canonical Orchestration Facade (4-layer authority) ──
export { OrchestrationFacade, orchestrationFacade } from "@/lib/orchestration";
export type { ProcessIntentRequest } from "@/lib/orchestration";

// Legacy compat re-export (consumers should migrate to OrchestrationFacade)
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
export { EventBus, getEventBus } from "@/platform/core-services/event-bus";

// ── Executor Service ──
export { ExecutorService } from "@/lib/core-services/executor-service";

// ── Trust Governor ──
export * from "@/lib/core-services/trust-governor";

// ── Policy Engine ──
export * from "@/lib/core-services/policy-engine";

// ── Workflow Engine ──
export { WorkflowEngine } from "@/lib/core-services/workflow-engine";

// ── Memory Service ──
export { MemoryService } from "@/lib/core-services/memory-service";

// ── Verification Engine ──
export { VerificationEngine } from "@/lib/core-services/verification-engine";

// ── Self-Healing ──
export { ImmuneController } from "@/lib/core-services/self-healing";
export { FleetHealthService } from "@/lib/core-services/self-healing";

// ── Security ──
export { IntrusionDetectionEngine } from "@/lib/core-services/security";
export { AuditTrailEngine } from "@/lib/core-services/security";
export { ResourceGovernor } from "@/lib/core-services/security";
export { ZeroTrustValidator } from "@/lib/core-services/security";
export { AITrustEnforcer } from "@/lib/core-services/security";
export { EventConsistencyEngine } from "@/lib/core-services/security";
export { UpdateSafetySystem } from "@/lib/core-services/security";

// ── Search Fabric ──
export type { SearchQuery, SearchResult, SearchFacets } from "@/lib/core-services/search-fabric";

// ── Projection Service ──
export { ProjectionService } from "@/lib/core-services/projection-service";

// ── Fraud Sentinel ──
export type { FraudSignal, FraudRule, FraudSeverity, FraudAction } from "@/lib/core-services/fraud-sentinel";

// ── Governance Simulator ──
export type { SimulationScenario, SimulationInput, SimulationResult } from "@/lib/core-services/governance-simulator";

// ── Epistemic Firewall ──
export * from "@/lib/core-services/epistemic-firewall";

// ── Conscience Gate ──
export { conscienceGate } from "@/lib/core-services/conscience-gate";

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

// ── Biometric Auth ──
export * from "@/lib/core-services/biometric-auth";

// ── Device Presence ──
export * from "@/lib/core-services/device-presence-service";

// ── Cloud Backbone ──
export {
  cloudStorageService, cloudSyncService, cloudDeviceService,
  cloudQuotaService, cloudAuditService, cloudTenantService,
  cloudWorkerService, cloudLifecycleService, cloudAbuseService,
  cloudSupportService,
} from "@/platform/cloud";
export type {
  StorageUsageRecord, StorageHealthReport, BucketStats,
  SyncHealthReport, SyncConflict, SyncJob, DelayedUser,
  CloudDevice, DeviceFleetReport,
  CloudPlan, UserPlanAssignment, QuotaOverview,
  AuditEvent, SuspiciousBehavior, SecurityAlert, AuditSeverity,
  CloudTenant, TenantMembership, TenantQuota, TenantPolicy, SharedWorkspace,
  WorkerJob, WorkerQueueStats,
  LifecycleRule, ArchiveJob, StorageTier, AccountClosureRequest, ReconciliationRun,
  AbuseEvent, AbuseSummary,
  SupportSession,
} from "@/platform/cloud";

// ── Persistence Layer ──
export {
  persistReceipt, fetchReceipts,
  persistProof, fetchProofs,
  persistMemory, fetchMemory, forgetMemory,
} from "@/data/persistence";
export type { PersistedReceipt, PersistedProof, PersistedMemoryEntry } from "@/data/persistence";

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

// ── Domain Engines ──
export * from "@/lib/domain-engines";

// ── Advisor Intelligence ──
export * from "@/lib/advisor-intelligence";

// ── Strategic Intelligence ──
export * from "@/lib/strategic-intelligence";

// ── Boardroom ──
export * from "@/lib/boardroom";

// ── Compute Governance ──
export * from "@/lib/compute-governance";

// ── No-Hallucination ──
export * from "@/lib/no-hallucination";

// ── Advisor Protocol (namespaced to avoid collision with intelligence-architecture) ──
export * as AdvisorProtocol from "@/lib/advisor-protocol";

// ── AI Engineering (namespaced — RawSignal/SignalSource overlap with intelligence-architecture) ──
export * as AIEngineering from "@/lib/ai-engineering";

// ── Dual Reality (namespaced — SurfaceClass overlaps with verification) ──
export * as DualReality from "@/lib/dual-reality";

// ── Intelligence Architecture ──
export * from "@/lib/intelligence-architecture";

// ── Detection ──
export * from "@/lib/detection";

// ── Verification (namespaced — LaunchHonestyClass overlaps with core-services/launch-readiness) ──
export * as Verification from "@/lib/verification";

// ── Sovereign AI Gateway (namespaced — AIProvider/TaskClass/CostTier overlap with services/ai-gateway) ──
export * as SovereignAIGateway from "@/lib/sovereign-ai-gateway";

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

// ── Internal Agents (namespaced — LaunchReadinessResult overlaps with core-services/launch-readiness) ──
export * as InternalAgents from "@/lib/internal-agents";

// ── Platform Law ──
export * from "@/lib/platform-law";

// ── Capabilities ──
export * from "@/lib/capabilities";

// ── Shopify ──
export * from "@/lib/shopify";

// ── Delivery Methodology ──
export * from "@/lib/delivery-methodology";

// ── Services Layer (200+ backend service implementations) ──
// Namespaced to avoid collisions with core-services re-exports above
export * as Services from "@/lib/services";

// ── AI Budget Gate ──
export * as BudgetGate from "@/lib/ai-gateway/budget-gate";
