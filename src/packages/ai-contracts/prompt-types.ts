// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Prompt Types
// Definitions, versioning, ownership, rollout, quality metadata.
// ═══════════════════════════════════════════════════════════════

export type PromptStatus = "draft" | "active" | "deprecated" | "archived" | "rollback";

export type PromptRiskTier = "low" | "medium" | "high" | "critical";

export interface PromptDefinition {
  prompt_id: string;
  family_id: string;
  version: number;
  name: string;
  description: string;
  system_prompt: string;
  user_prompt_template: string;
  variables: PromptVariable[];
  output_schema?: Record<string, unknown>;
  status: PromptStatus;
  risk_tier: PromptRiskTier;
  owner_service: string;
  created_at: string;
  updated_at: string;
}

export interface PromptVariable {
  name: string;
  type: "string" | "number" | "boolean" | "json" | "array";
  required: boolean;
  description: string;
  default_value?: unknown;
  validation?: string;
}

export interface PromptVersion {
  prompt_id: string;
  version: number;
  changelog: string;
  diff_summary: string;
  promoted_by?: string;
  promoted_at?: string;
  rollback_from?: number;
  quality_score?: number;
}

export interface PromptRollout {
  rollout_id: string;
  prompt_id: string;
  from_version: number;
  to_version: number;
  strategy: "immediate" | "canary" | "shadow";
  canary_percent?: number;
  status: "active" | "completed" | "rolled_back";
  started_at: string;
  completed_at?: string;
}

export interface PromptQualityMetadata {
  prompt_id: string;
  version: number;
  accuracy_score: number;
  hallucination_rate: number;
  avg_latency_ms: number;
  avg_cost_cents: number;
  sample_size: number;
  last_evaluated_at: string;
}
