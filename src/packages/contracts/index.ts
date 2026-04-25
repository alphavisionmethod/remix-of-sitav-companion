// ═══════════════════════════════════════════════════════════════
// SITA OS — Shared Platform Contracts (Root Barrel)
// Canonical entrypoint for @sita-os/contracts
//
// LAYER ARCHITECTURE:
//   _contract-scaffold  → shared primitives (DomainId, UserRole, etc.)
//   core/               → truth contracts (workflow, trust, policy, events, intent)
//   capability/          → capability definition, discovery, risk, autonomy
//   approval/            → approval request, receipt, binding, autonomy, consent
//   execution/           → execution envelope, plan, receipt, exception/recovery
//   proof/               → proof-pack, evidence, verification, simulation, refusal
//   advisor/             → advisor registry, session, voting, council
//   runtime/             → live runtime capability surfaces + trusted boot
//   memory/              → memory governance, objects, no-hallucination
//   graph/               → graph nodes/edges, device, continuity, handoff, organization
//   read-models/         → UI projections (NEVER source of truth)
//   specialized/         → boardroom, onboarding, opportunity, diagnostics, verticalization
//   admin/               → admin command, session (deprecated facade), intelligence
//
// IMPORT RULES:
//   ✅ Services import from @/packages/contracts
//   ✅ src/lib/types/ re-exports from contracts (backward compat stubs)
//   ✅ Domain types are canonical in contracts/domain-types/
//   ❌ Pages MUST NOT import truth contracts directly
//   ❌ Read-model contracts MUST NOT be imported by backend services
//   ❌ Runtime contracts MUST NOT be persisted as source-of-truth
// ═══════════════════════════════════════════════════════════════

// ── Scaffold primitives ─────────────────────────────────────
export * from "./_contract-scaffold";

// ── Schema infrastructure ───────────────────────────────────
export { SchemaRegistry } from "./schema-registry";
export type { SchemaRegistryEntry, ContractLayer } from "./schema-registry";

// ── Core truth contracts ────────────────────────────────────
export * from "./core";

// ── Capability contracts ────────────────────────────────────
export * from "./capability";

// ── Approval contracts ──────────────────────────────────────
export * from "./approval";

// ── Execution contracts ─────────────────────────────────────
export * from "./execution";

// ── Proof & verification contracts ──────────────────────────
export * from "./proof";

// ── Advisor & council contracts ─────────────────────────────
export * from "./advisor";

// ── Runtime contracts ───────────────────────────────────────
export * from "./runtime";
// Explicit claim to prevent TS2308 ambiguity with star-exports
export type { DeferredSetupItem } from "./runtime/first-boot-provisioning";

// ── Memory & no-hallucination contracts ─────────────────────
export * from "./memory";

// ── Graph, identity, continuity contracts ───────────────────
export * from "./graph";

// ── Read-model / UI projection contracts ────────────────────
export * from "./read-models";

// ── Specialized domain contracts ────────────────────────────
export * from "./specialized";

// ── Admin contracts ─────────────────────────────────────────
export * from "./admin";

// ── Kernel contracts (sacred — zero runtime deps) ───────────
export * from "./kernel";

// ── MSA (Multi-Surface Architecture) contracts ──────────────
// NOTE: RiskTier collides with _contract-scaffold, so MSA's RiskTier is excluded
export type {
  // adapter-contract
  SurfaceAdapterRecord, InteractionGrammar, NavigationGrammar, NotificationGrammar, ReceiptPresentation, TrustPresentation,
  // capability-contract (minus RiskTier)
  CapabilityDefinition, CapabilityInvocation, CapabilityResult, CapabilitySurfaceBinding, CapabilityPortabilityRecord, ActionType, PortabilityClass,
  // device-family-contract
  DeviceFamilyKey, DeviceFamilyRecord, ConnectedDeviceRecord, DeviceTrustRecord, HandoffSessionRecord, PresenceStateRecord,
  ConnectionState, DeviceRoleInOS, InteractionClass, SensorClass, SurfacePrimacy, TrustClass, WearablePrimaryRole,
  NativeRequirementLevel, DeviceRoadmapPhase, RoadmapPhaseKey, SurfaceStrategyEntry,
  // experience-grammar
  ExperienceGrammarRecord, GrammarType, GrammarValue, SurfaceRenderingRule,
  // shell-contract
  ShellManifest, ShellCapability,
  // surface-types
  SurfaceKey, SurfaceClass, ReadinessStage, ShellType, InputMode, OutputMode,
  SurfaceTypeRecord, ShellImplementationRecord, SurfaceReadinessRecord, SurfaceConstraintRecord,
} from "./msa";
export {
  DEVICE_ROADMAP, SURFACE_STRATEGY_MATRIX,
  ACTION_STATE_GRAMMAR, ALL_GRAMMARS, BOARDROOM_GRAMMAR, COMMAND_GRAMMAR,
  DEGRADED_STATE_GRAMMAR, NOTIFICATION_URGENCY_GRAMMAR, OPPORTUNITY_SCORING_GRAMMAR,
  RECEIPT_PROOF_GRAMMAR, REFUSAL_GRAMMAR, TRUST_STATE_GRAMMAR, WORKFLOW_STATE_GRAMMAR,
} from "./msa";

// ── Native (Electron/Desktop) contracts ─────────────────────
export * from "./native";

// ── API schema contracts ────────────────────────────────────
export * from "./api-schemas";

// ── Deprecated redirect stubs REMOVED ────────────────────────
// consent-contracts → approval/consent (via approval barrel)
// organization-contracts → graph/organization (via graph barrel)
// exception-contracts → execution/exception (via execution barrel)
// verticalization-contracts → specialized/verticalization (via specialized barrel)

// ── Legacy inline types (backward compat) ────────────────────
export interface EntityScope {
  entityType: string;
  entityId: string;
  domain: import("./_contract-scaffold").DomainId;
}

// ── Domain types (canonical source — migrated from src/lib/types/) ──
// NOTE: OpportunityNode and OpportunityType are canonical in runtime/opportunity-graph-runtime
// and already exported via `export * from "./runtime"`. The domain-types/os-unified also
// exports them, so we use selective re-exports to avoid collision.
export type {
  ActionState, ActionStateTransition, ActionRecord,
  OSDomain, ProofType, ProofRecord, ProofChain,
  TrustPosture, TrustIncident,
  TimelineEntryType, TimelineEntry,
  OSRuntimeContext,
  EntityScope as OSEntityScope,
  TrustState as OSTrustState,
} from "./domain-types/os-unified";

export * from "./domain-types/meta-governance";
export * from "./domain-types/mission-control";
export * from "./domain-types/admin-view-models";

// digital-twin: all types are canonical from domain-types
export * from "./domain-types/digital-twin";

// advisor-orchestration: AdvisorId collides with packages/advisor-config
export type {
  AdvisorTier, AdvisorDefinition, AdvisorCapability,
  EscalationRule, EscalationTrigger, HandoffProtocol,
  CollaborationFrame, AdvisorContribution, AdvisorConsensus,
  AdvisorDisagreement, AdvisorPerformance, AdvisorSimulationResult,
} from "./domain-types/advisor-orchestration";

export * from "./domain-types/entity-graph";

// memory-governance: MemoryForgetRequest/MemoryGovernanceConfig collide with memory/
export type {
  MemoryType, MemoryPrivacy, MemorySource,
  MemoryEntry, MemoryLineage, MemoryContradiction,
  MemoryPersistenceRule, MemoryCorrection,
  MemoryConflictResolution, MemoryAuditEntry,
} from "./domain-types/memory-governance";

export * from "./domain-types/replay-recovery";
export * from "./domain-types/revenue-engine";
export * from "./domain-types/policy-depth";
export * from "./domain-types/token-governance";

// ── Domain engine types (canonical source — migrated from domain-engines) ──
export * from "./domain-types/business-engine";
export * from "./domain-types/finance-engine";
export * from "./domain-types/concierge-engine";

// ── Wave 1.2 — App-wide cross-pillar contracts ──
// Promoted from src/platform/contracts/ to canonical home.
// Re-exported via @/contracts public barrel.
export * from "./pillar-contract";
export * from "./decision-queue";