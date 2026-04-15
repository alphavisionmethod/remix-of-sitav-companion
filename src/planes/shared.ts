// ═══════════════════════════════════════════════════════════════
// SITA OS — Shared Plane Public API
// Contracts, schemas, design tokens, event models, auth scopes.
// This plane has ZERO dependencies on any other plane.
// ═══════════════════════════════════════════════════════════════

// ── Core Contracts ──
export * from "@/packages/contracts";

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

// ── Store Metadata ──
export * from "@/packages/store-metadata";

// ── Template Registry ──
export * from "@/packages/template-registry";

// ── Protocols (import specific types to avoid collision with contracts) ──
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

