// ═══════════════════════════════════════════════════════════════
// SITA OS — Engine Barrel Export
//
// ARCHITECTURE ROLE:
//   Page-facing pure engines. These are stateless computation
//   engines instantiated by the OSRuntimeProvider and consumed
//   via useOSRuntime() in React components.
//
//   ✅ Pages/components import from here (via useOSRuntime)
//   ❌ Engines MUST NOT import from services/ or core-services/
//   ❌ Engines MUST NOT perform I/O or side effects
//
//   For backend-ready service functions, use src/lib/services/
//   For persistence, use src/lib/persistence/
// ═══════════════════════════════════════════════════════════════

export { ActionStateMachine, isDuplicateAction, findAgingWorkflows } from "./action-state-machine";
export { EntityRoleGraph } from "./entity-role-graph";
export { MemoryGovernanceEngine } from "./memory-governance";
export { AdvisorOrchestrationEngine } from "./advisor-orchestration";
export { PolicyDepthEngine } from "./policy-depth-engine";
export { RevenueOpportunityEngine } from "./revenue-opportunity";
export { DigitalTwinEngine, BoardroomIntelligenceEngine, ScenarioIntelligenceEngine } from "./digital-twin";
export { TokenGovernanceEngine } from "./token-governance";
export { IntegrationConciergeEngine } from "./connector-concierge";
export { ReplayRecoveryEngine } from "./replay-recovery";
export {
  EnterpriseControlPlaneEngine, SupportDiagnosticsEngine, ObservabilityEngine,
  ReleaseSafetyEngine, TrustDeviceEngine, ComplianceAuditEngine,
} from "./enterprise-maturity";

// ── Meta-Governance Layer ───────────────────────────────────────
export { MetaGovernanceEngine, getMetaGovernanceEngine, createMetaGovernanceEngine } from "./meta-governance-engine";
export { TrustDebtEngine } from "./trust-debt-engine";
export { ExecutionDebtEngine } from "./execution-debt-engine";
export { DragEngine } from "./drag-engine";
export { ReadinessEngine } from "./readiness-engine";
export { InvisibleLaborEngine } from "./invisible-labor-engine";
export { FounderBottleneckEngine } from "./founder-bottleneck-engine";
export { DelegationEngine } from "./delegation-engine";
export { WorkspaceViewEngine } from "./workspace-view-engine";
export { SetupOrchestrationEngine, createSetupOrchestrationEngine } from "./setup-orchestration-engine";

