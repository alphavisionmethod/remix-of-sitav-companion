// ═══════════════════════════════════════════════════════════════
// SITA OS — Phased Rollout Plan
// Rule 27: No breadth before wedge proof.
// ═══════════════════════════════════════════════════════════════

export type RolloutPhase = "foundation" | "wedge" | "expansion" | "maturity";
export type RolloutPriority = "P0" | "P1" | "P2" | "P3";

export interface RolloutItem {
  id: string;
  phase: RolloutPhase;
  priority: RolloutPriority;
  name: string;
  description: string;
  architectureFile: string;       // which architecture file implements this
  dependencies: string[];         // other item IDs
  provenBy: string[];             // what proves this is working
}

export const ROLLOUT_PLAN: RolloutItem[] = [
  // ── PHASE 1: FOUNDATION (P0 — Must exist before anything works) ──

  { id: "identity-graph", phase: "foundation", priority: "P0", name: "Identity / Role / Relationship Graph",
    description: "Full authority model with principals, households, orgs, delegation, device trust, permissions",
    architectureFile: "identity-relationship-graph.ts", dependencies: [], provenBy: ["permission-resolution-test", "delegation-chain-test"] },

  { id: "policy-engine", phase: "foundation", priority: "P0", name: "Policy Engine Depth",
    description: "Versioned policy bundles, constitutional checks, risk-tiered evaluation, no silent weakening",
    architectureFile: "policy-versioning.ts", dependencies: ["identity-graph"], provenBy: ["policy-eval-test", "weakening-blocked-test"] },

  { id: "workflow-sm", phase: "foundation", priority: "P0", name: "Workflow State Machine",
    description: "13+ state lifecycle, policy-aware transitions, event emission, retry/escalation",
    architectureFile: "workflow-state-machine.ts", dependencies: ["policy-engine"], provenBy: ["transition-test", "replay-test"] },

  { id: "memory-gov", phase: "foundation", priority: "P0", name: "Memory Governance",
    description: "6 memory types, provenance, evidence grades, conflict detection, forget controls",
    architectureFile: "unified-memory-system.ts", dependencies: ["identity-graph"], provenBy: ["provenance-test", "conflict-detection-test"] },

  { id: "proof-layer", phase: "foundation", priority: "P0", name: "Unified Proof Layer",
    description: "Receipts, refusal receipts, evidence bundles, immutable events, replayable projections",
    architectureFile: "unified-proof-layer.ts", dependencies: [], provenBy: ["receipt-generation-test", "proof-chain-test"] },

  { id: "event-taxonomy", phase: "foundation", priority: "P0", name: "Immutable Event Taxonomy",
    description: "60+ event classes, tenant-scoped, append-only, replay support",
    architectureFile: "immutable-event-taxonomy.ts", dependencies: ["proof-layer"], provenBy: ["event-emit-test", "replay-test"] },

  { id: "capability-contracts", phase: "foundation", priority: "P0", name: "Capability Contract System",
    description: "Every action has a contract: inputs, risk, approval, evidence, retry, budget",
    architectureFile: "capability-contract-system.ts", dependencies: ["policy-engine"], provenBy: ["contract-validation-test"] },

  { id: "executor", phase: "foundation", priority: "P0", name: "Executor Service Hardening",
    description: "Sole choke point: envelope validation, signature, policy hash, approval proof, budget, receipt",
    architectureFile: "canonical-execution-chain.ts", dependencies: ["capability-contracts", "proof-layer"], provenBy: ["envelope-validation-test", "bypass-prevention-test"] },

  { id: "approval-system", phase: "foundation", priority: "P0", name: "Approval & Consent System",
    description: "Risk-tiered, policy-derived, delegated, multi-party, evidence-based approvals",
    architectureFile: "approval-tiers.ts", dependencies: ["identity-graph", "policy-engine"], provenBy: ["tier-resolution-test", "delegation-test"] },

  { id: "connector-gov", phase: "foundation", priority: "P0", name: "Connector Governance",
    description: "Certification, scoped permissions, kill switch, health monitoring, policy overlays",
    architectureFile: "connector-governance.ts", dependencies: ["executor"], provenBy: ["certification-test", "kill-switch-test"] },

  { id: "observability", phase: "foundation", priority: "P0", name: "Support / Diagnostics / Observability",
    description: "Execution traces, policy traces, advisor logs, user explanations, operator diagnostics",
    architectureFile: "observability-diagnostics.ts", dependencies: ["proof-layer", "event-taxonomy"], provenBy: ["explanation-test", "trace-test"] },

  { id: "os-unification", phase: "foundation", priority: "P0", name: "OS Unification Layer",
    description: "Surface contracts, domain contracts, platform contract standardization",
    architectureFile: "os-unification-layer.ts", dependencies: [], provenBy: ["surface-compliance-test", "domain-compliance-test"] },

  // ── PHASE 2: WEDGE (P1 — First complete trust loop) ──

  { id: "advisor-orch", phase: "wedge", priority: "P1", name: "Advisor Orchestration",
    description: "Advisor registry, council orchestrator, routing, conflict arbitration, dissent handling",
    architectureFile: "advisor-orchestration.ts", dependencies: ["identity-graph", "policy-engine"], provenBy: ["council-session-test", "dissent-test"] },

  { id: "boardroom", phase: "wedge", priority: "P1", name: "Boardroom Productization",
    description: "Governed decision sessions, proposals, dissent, simulation, minutes, follow-through → execution chain",
    architectureFile: "boardroom-architecture.ts", dependencies: ["advisor-orch", "approval-system"], provenBy: ["decision-to-action-test"] },

  { id: "exception-recovery", phase: "wedge", priority: "P1", name: "Exception Handling & Recovery",
    description: "Typed exceptions, recovery plans, compensation, rollback, postmortem receipts",
    architectureFile: "exception-recovery.ts", dependencies: ["executor", "proof-layer"], provenBy: ["recovery-plan-test", "compensation-test"] },

  { id: "cost-governance", phase: "wedge", priority: "P1", name: "Cost & Token Governance",
    description: "Per-scope budgets, model routing, hard ceilings, anomaly detection, fallback strategies",
    architectureFile: "cost-token-governance.ts", dependencies: ["executor"], provenBy: ["budget-check-test", "model-routing-test"] },

  { id: "pipeline", phase: "wedge", priority: "P1", name: "Full 16-Stage Pipeline",
    description: "Complete canonical pipeline from intent detection to governance updates",
    architectureFile: "canonical-pipeline.ts", dependencies: ["identity-graph", "policy-engine", "executor", "proof-layer", "event-taxonomy"], provenBy: ["end-to-end-pipeline-test"] },

  // ── PHASE 3: EXPANSION (P2 — Broaden after wedge is proven) ──

  { id: "trusted-device", phase: "expansion", priority: "P2", name: "Trusted Device Model",
    description: "Device registration, trust levels, hardware attestation, local execution",
    architectureFile: "identity-relationship-graph.ts", dependencies: ["identity-graph"], provenBy: ["device-trust-test"] },

  { id: "replay-simulation", phase: "expansion", priority: "P2", name: "Replay & Simulation Depth",
    description: "Full event replay, scenario simulation, projection rebuilds",
    architectureFile: "immutable-event-taxonomy.ts", dependencies: ["event-taxonomy"], provenBy: ["replay-rebuild-test"] },

  { id: "delegated-authority", phase: "expansion", priority: "P2", name: "Advanced Delegated Authority",
    description: "Multi-hop delegation chains, cascading revocation, time-bounded grants",
    architectureFile: "identity-relationship-graph.ts", dependencies: ["identity-graph", "approval-system"], provenBy: ["cascade-revocation-test"] },

  { id: "self-learning", phase: "expansion", priority: "P2", name: "Self-Learning Constraints",
    description: "Safe learning improvements, prohibited auto-mutations, human review for authority changes",
    architectureFile: "self-learning-constraints.ts", dependencies: ["policy-engine"], provenBy: ["learning-boundary-test"] },

  { id: "tenant-sovereignty", phase: "expansion", priority: "P2", name: "Multi-Tenant Sovereignty",
    description: "Tenant-scoped everything, isolation validation, redacted support views",
    architectureFile: "tenant-sovereignty.ts", dependencies: ["identity-graph"], provenBy: ["isolation-test", "cross-tenant-blocked-test"] },

  // ── PHASE 4: MATURITY (P3 — After trust loop fully proven) ──

  { id: "truth-validation", phase: "maturity", priority: "P3", name: "Truth Validation Depth",
    description: "Formal truth envelopes, fact promotion, uncertainty propagation",
    architectureFile: "truth-validation.ts", dependencies: ["memory-gov"], provenBy: ["truth-promotion-test"] },

  { id: "avatar-voice", phase: "maturity", priority: "P3", name: "Avatar / Voice / XR",
    description: "Only after policy, identity, permissions, workflow, proof, and memory are mature",
    architectureFile: "os-unification-layer.ts", dependencies: ["identity-graph", "policy-engine", "executor", "proof-layer", "memory-gov", "observability"], provenBy: ["trust-loop-maturity-gate"] },
];

// ── Rollout Queries ─────────────────────────────────────────

export function getPhaseItems(phase: RolloutPhase): RolloutItem[] {
  return ROLLOUT_PLAN.filter(i => i.phase === phase);
}

export function getP0Items(): RolloutItem[] {
  return ROLLOUT_PLAN.filter(i => i.priority === "P0");
}

export function checkDependenciesMet(itemId: string, completedIds: string[]): { met: boolean; missing: string[] } {
  const item = ROLLOUT_PLAN.find(i => i.id === itemId);
  if (!item) return { met: false, missing: [itemId] };
  const missing = item.dependencies.filter(d => !completedIds.includes(d));
  return { met: missing.length === 0, missing };
}

export function getReadinessScore(completedIds: string[]): { total: number; completed: number; pct: number } {
  return {
    total: ROLLOUT_PLAN.length,
    completed: completedIds.length,
    pct: Math.round((completedIds.length / ROLLOUT_PLAN.length) * 100),
  };
}
