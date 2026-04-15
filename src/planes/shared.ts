// ═══════════════════════════════════════════════════════════════
// SITA OS — Shared Plane Public API (Complete)
// Contracts, schemas, design tokens, event models, auth scopes.
// This plane has ZERO dependencies on any other plane.
// ═══════════════════════════════════════════════════════════════

// ── Core Contracts ──
export * from "@/packages/contracts";

// ── Business Contracts ──
export * as BusinessContracts from "@/packages/business-contracts";

// ── Finance Contracts ──
export * as FinanceContracts from "@/packages/finance-contracts";

// ── Concierge Contracts ──
export * as ConciergeContracts from "@/packages/concierge-contracts";

// ── Boardroom Contracts ──
export * as BoardroomContracts from "@/packages/boardroom-contracts";

// ── Enterprise Contracts ──
export * as EnterpriseContracts from "@/packages/enterprise-contracts";

// ── Moat Contracts ──
export * as MoatContracts from "@/packages/moat-contracts";

// ── Policy Contracts ──
export * as PolicyContracts from "@/packages/policy-contracts";

// ── Proof Model ──
export * as ProofModel from "@/packages/proof-model";

// ── Reality Contracts ──
export * as RealityContracts from "@/packages/reality-contracts";

// ── Audit Contracts ──
export * as AuditContracts from "@/packages/audit-contracts";

// ── Event Types ──
export * as EventTypes from "@/packages/event-types";

// ── Design Tokens ──
export * from "@/packages/design-tokens";

// ── Shell Grammar ──
export * from "@/packages/shell-grammar";

// ── Workflow Primitives ──
export * from "@/packages/workflow-primitives";

// ── Auth ──
export * from "@/packages/auth";

// ── Feature Flags ──
export * from "@/packages/feature-flags";

// ── Entitlements ──
export * from "@/packages/entitlements";

// ── Database Schemas ──
export * from "@/packages/database-schemas";

// ── Client SDK ──
export * as ClientSDK from "@/packages/client-sdk";

// ── Telemetry ──
export * as Telemetry from "@/packages/telemetry";

// ── Advisor Config ──
export * as AdvisorConfig from "@/packages/advisor-config";

// ── Feature Governance ──
export * as FeatureGovernance from "@/packages/feature-governance";

// ── Internal Agent Config ──
export * as InternalAgentConfig from "@/packages/internal-agent-config";

// ── Store Metadata ──
export * from "@/packages/store-metadata";

// ── Template Registry ──
export * from "@/packages/template-registry";

// ── Microinteraction Engine ──
export * as MicrointeractionEngine from "@/packages/microinteraction-engine";

// ── Pack Manifests ──
export * as PackManifests from "@/packages/pack-manifests";

// ── Protocols (specific types to avoid collision with contracts) ──
export type {
  CommandEnvelope, CommandPhase, CommandReceipt, CommandSideEffect,
} from "@/packages/protocols/command-lifecycle";
export type {
  AgentIdentity, AgentHeartbeat, AgentCommand, AgentCommandAck,
  AgentProgress, AgentResult, AgentTelemetry,
} from "@/packages/protocols/agent-communication";
export type {
  RolloutPlan, RolloutGate, RolloutCanaryMetrics, RolloutDecision, RollbackRecord,
} from "@/packages/protocols/rollout-protocol";
export type {
  TrustClaim, TrustEvidence, TrustGrading, TrustDecision, TrustReceipt, TrustGrade,
} from "@/packages/protocols/trust-evaluation";
