// ═══════════════════════════════════════════════════════════════
// SITA OS — Memory: No-Hallucination: Truth Boundary
// ═══════════════════════════════════════════════════════════════

import type { RequiredSourceType } from "./grounding-report";

export interface TruthBoundaryRule {
  domain: string;
  field: string;
  requiredSource: RequiredSourceType;
  neverFromLLM: boolean;
  description?: string;
}

export type OutputClass = "observation" | "recommendation" | "draft" | "simulation" | "approval-ready";

export interface AdvisorGroundingConfig {
  advisorId: string;
  domain: string;
  requiredInputs: string[];
  optionalInputs: string[];
  confidenceThreshold: number;
  blockedActionsWhenStale: string[];
  outputClass: OutputClass;
  refusalConditions: string[];
}
