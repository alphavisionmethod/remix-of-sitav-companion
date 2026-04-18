// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Orchestration Types
// Defines the 4-layer orchestration hierarchy
// ═══════════════════════════════════════════════════════════════

export type OrchestrationLayer = "intent" | "planning" | "execution" | "proof";

export const LAYER_ORDER: OrchestrationLayer[] = ["intent", "planning", "execution", "proof"];

export type OrchestrationDomain =
  | "business" | "finance" | "concierge" | "platform"
  | "boardroom" | "admin" | "setup" | "cross-domain";

export type OrchestrationPriority = "critical" | "high" | "medium" | "low" | "background";

export type OrchestrationStatus =
  | "pending" | "in_progress" | "awaiting_approval"
  | "approved" | "executing" | "completed"
  | "failed" | "rolled_back" | "refused";

export interface OrchestrationClassEntry {
  classId: string;
  name: string;
  layer: OrchestrationLayer;
  owner: string;
  allowedResponsibilities: string[];
  forbiddenResponsibilities: string[];
  allowedDependencies: string[];
}

export const ORCHESTRATION_CLASSES: OrchestrationClassEntry[] = [
  {
    classId: "intent-orchestrator",
    name: "Intent Orchestrator",
    layer: "intent",
    owner: "src/lib/orchestration/intent/intent-orchestrator.ts",
    allowedResponsibilities: [
      "intent-parsing", "decision-framing", "recommendation-ranking",
      "issue-selection", "opportunity-selection", "escalation-routing",
    ],
    forbiddenResponsibilities: ["side-effects", "connector-calls", "proof-writing"],
    allowedDependencies: ["shared", "brain-core-helpers", "orchestration-pipeline-signals"],
  },
  {
    classId: "planning-orchestrator",
    name: "Planning Orchestrator",
    layer: "planning",
    owner: "src/lib/orchestration/planning/planning-orchestrator.ts",
    allowedResponsibilities: [
      "workflow-construction", "action-sequencing", "simulation",
      "dependency-resolution", "approval-packaging", "contingency-planning",
    ],
    forbiddenResponsibilities: ["side-effects", "connector-calls", "proof-writing", "intent-parsing"],
    allowedDependencies: ["shared", "workflow-engine", "simulation-engine"],
  },
  {
    classId: "execution-orchestrator",
    name: "Execution Orchestrator",
    layer: "execution",
    owner: "src/lib/orchestration/execution/execution-orchestrator.ts",
    allowedResponsibilities: [
      "connector-invocation", "command-execution", "job-dispatch",
      "workflow-step-execution", "retries", "rollback", "postconditions",
    ],
    forbiddenResponsibilities: ["decision-framing", "recommendation-ranking", "workflow-construction"],
    allowedDependencies: ["shared", "executor-service", "agent-orchestrator", "connectors"],
  },
  {
    classId: "proof-orchestrator",
    name: "Proof Orchestrator",
    layer: "proof",
    owner: "src/lib/orchestration/proof/proof-orchestrator.ts",
    allowedResponsibilities: [
      "receipt-creation", "audit-trail", "event-lineage",
      "approval-records", "reversibility-metadata", "truth-records",
    ],
    forbiddenResponsibilities: ["decision-framing", "side-effects", "connector-calls", "workflow-construction"],
    allowedDependencies: ["shared", "receipt-service", "canonical-chain-persistence"],
  },
];

export function getClassForLayer(layer: OrchestrationLayer): OrchestrationClassEntry | undefined {
  return ORCHESTRATION_CLASSES.find(c => c.layer === layer);
}

export function isLayerTransitionValid(from: OrchestrationLayer, to: OrchestrationLayer): boolean {
  return LAYER_ORDER.indexOf(to) >= LAYER_ORDER.indexOf(from);
}
