// ═══════════════════════════════════════════════════════════════
// SITA Delivery OS — Feature Lifecycle Methodology Engine
// Canonical lifecycle state machine for every feature
// ═══════════════════════════════════════════════════════════════

export const LIFECYCLE_STAGES = [
  "proposed", "specified", "generated", "contract-defined", "scaffolded",
  "implemented", "wired", "tested", "runtime-verified", "launch-ready",
  "monitored", "evolving", "deprecated",
] as const;

export type LifecycleStage = (typeof LIFECYCLE_STAGES)[number];

export interface LifecycleTransition {
  from: LifecycleStage;
  to: LifecycleStage;
  requiredEvidence: string[];
  autoPromotable: boolean;
  gatekeepers: string[];
}

export interface LifecycleState {
  featureId: string;
  currentStage: LifecycleStage;
  stageHistory: Array<{ stage: LifecycleStage; enteredAt: string; exitedAt?: string; actor?: string }>;
  blockers: string[];
  readinessScore: number;
}

const ALLOWED_TRANSITIONS: LifecycleTransition[] = [
  { from: "proposed", to: "specified", requiredEvidence: ["blueprint_approved"], autoPromotable: false, gatekeepers: ["product"] },
  { from: "specified", to: "generated", requiredEvidence: ["contracts_defined", "schema_needs_mapped"], autoPromotable: true, gatekeepers: [] },
  { from: "generated", to: "contract-defined", requiredEvidence: ["contract_stubs_created"], autoPromotable: true, gatekeepers: [] },
  { from: "contract-defined", to: "scaffolded", requiredEvidence: ["route_created", "shell_assigned", "manifest_registered"], autoPromotable: true, gatekeepers: [] },
  { from: "scaffolded", to: "implemented", requiredEvidence: ["components_built", "services_wired"], autoPromotable: false, gatekeepers: ["engineering"] },
  { from: "implemented", to: "wired", requiredEvidence: ["persistence_connected", "events_emitting", "interactions_registered"], autoPromotable: false, gatekeepers: ["engineering"] },
  { from: "wired", to: "tested", requiredEvidence: ["journey_tests_pass", "interaction_tests_pass"], autoPromotable: true, gatekeepers: [] },
  { from: "tested", to: "runtime-verified", requiredEvidence: ["runtime_probes_pass", "no_mock_dependencies"], autoPromotable: true, gatekeepers: [] },
  { from: "runtime-verified", to: "launch-ready", requiredEvidence: ["readiness_threshold_met", "owner_signoff"], autoPromotable: false, gatekeepers: ["product", "engineering"] },
  { from: "launch-ready", to: "monitored", requiredEvidence: ["deployed", "monitoring_active"], autoPromotable: true, gatekeepers: [] },
  { from: "monitored", to: "evolving", requiredEvidence: ["change_request_approved"], autoPromotable: false, gatekeepers: ["product"] },
  { from: "evolving", to: "deprecated", requiredEvidence: ["deprecation_approved", "migration_complete"], autoPromotable: false, gatekeepers: ["product", "engineering"] },
];

export function getStageIndex(stage: LifecycleStage): number {
  return LIFECYCLE_STAGES.indexOf(stage);
}

export function getNextStage(current: LifecycleStage): LifecycleStage | null {
  const idx = getStageIndex(current);
  return idx < LIFECYCLE_STAGES.length - 1 ? LIFECYCLE_STAGES[idx + 1] : null;
}

export function canTransition(from: LifecycleStage, to: LifecycleStage, providedEvidence: string[]): { allowed: boolean; missing: string[] } {
  const rule = ALLOWED_TRANSITIONS.find(t => t.from === from && t.to === to);
  if (!rule) return { allowed: false, missing: [`no_transition_rule_${from}_to_${to}`] };
  const missing = rule.requiredEvidence.filter(e => !providedEvidence.includes(e));
  return { allowed: missing.length === 0, missing };
}

export function computeReadiness(stage: LifecycleStage, evidence: string[]): number {
  const next = getNextStage(stage);
  if (!next) return 100;
  const rule = ALLOWED_TRANSITIONS.find(t => t.from === stage && t.to === next);
  if (!rule || rule.requiredEvidence.length === 0) return 100;
  const met = rule.requiredEvidence.filter(e => evidence.includes(e)).length;
  return Math.round((met / rule.requiredEvidence.length) * 100);
}

export function createLifecycleState(featureId: string): LifecycleState {
  return {
    featureId,
    currentStage: "proposed",
    stageHistory: [{ stage: "proposed", enteredAt: new Date().toISOString() }],
    blockers: [],
    readinessScore: 0,
  };
}

export function getTransitionRules(): LifecycleTransition[] {
  return ALLOWED_TRANSITIONS;
}

export function getStageLabel(stage: LifecycleStage): string {
  const labels: Record<LifecycleStage, string> = {
    proposed: "Proposed", specified: "Specified", generated: "Generated",
    "contract-defined": "Contract Defined", scaffolded: "Scaffolded",
    implemented: "Implemented", wired: "Wired", tested: "Tested",
    "runtime-verified": "Runtime Verified", "launch-ready": "Launch Ready",
    monitored: "Monitored", evolving: "Evolving", deprecated: "Deprecated",
  };
  return labels[stage];
}
