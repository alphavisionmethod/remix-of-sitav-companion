// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Memory Types (Production-Grade)
// Memory governance, layered memory model, preference/workflow/
// procedural contracts, expiry, consolidation, privacy.
// ═══════════════════════════════════════════════════════════════

export type AIMemoryLayer = "working" | "episodic" | "semantic" | "procedural" | "preference" | "contextual" | "strategic";

export type MemoryStatus = "active" | "archived" | "expired" | "pruned" | "consolidated" | "quarantined" | "migrating";

export type MemoryAccessPattern = "frequent" | "periodic" | "rare" | "one_time" | "seasonal";

export type MemoryPrivacyLevel = "public" | "workspace" | "private" | "sensitive" | "ephemeral";

// ── Core Memory Entry ──

export interface AIMemoryEntry {
  memory_id: string;
  layer: AIMemoryLayer;
  owner_id: string;
  owner_type: "user" | "agent" | "system" | "workspace" | "organization";
  content: string;
  structured_data?: Record<string, unknown>;
  embedding_id?: string;
  importance: number;
  confidence: number;
  relevance_decay_rate: number;
  access_count: number;
  access_pattern: MemoryAccessPattern;
  last_accessed_at?: string;
  status: MemoryStatus;
  privacy_level: MemoryPrivacyLevel;
  tags: string[];
  source_event_id?: string;
  source_type: "observation" | "interaction" | "inference" | "feedback" | "consolidation" | "import";
  linked_memories: string[];
  contradiction_refs?: string[];
  version: number;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  archived_at?: string;
}

// ── Governance Policy ──

export interface MemoryGovernancePolicy {
  policy_id: string;
  policy_name: string;
  layer: AIMemoryLayer;
  max_entries: number;
  max_total_size_mb: number;
  max_age_days: number;
  max_staleness_days: number;
  consolidation_threshold: number;
  consolidation_strategy: ConsolidationStrategy;
  pruning_strategy: PruningStrategy;
  auto_consolidate: boolean;
  auto_prune: boolean;
  auto_archive: boolean;
  retention_override_tags: string[];
  privacy_rules: MemoryPrivacyRule[];
  quality_gate: MemoryQualityGate;
  backup_enabled: boolean;
  backup_frequency_hours: number;
  gdpr_compliant: boolean;
  right_to_forget_enabled: boolean;
}

export type ConsolidationStrategy = "merge_similar" | "summarize_old" | "deduplicate" | "hierarchical" | "semantic_cluster" | "adaptive";

export type PruningStrategy = "oldest_first" | "least_accessed" | "lowest_importance" | "expired_first" | "lowest_confidence" | "adaptive_decay";

export interface MemoryPrivacyRule {
  rule_id: string;
  data_type: string;
  retention_days: number;
  anonymize_after_days: number;
  delete_after_days: number;
  consent_required: boolean;
  exportable: boolean;
}

export interface MemoryQualityGate {
  min_confidence: number;
  min_importance: number;
  max_contradiction_ratio: number;
  require_source: boolean;
  require_embedding: boolean;
}

// ── Consolidation ──

export interface MemoryConsolidation {
  consolidation_id: string;
  layer: AIMemoryLayer;
  strategy: ConsolidationStrategy;
  source_memory_ids: string[];
  consolidated_memory_id: string;
  consolidation_type: "merge" | "summarize" | "deduplicate" | "cluster" | "hierarchy";
  quality_before: number;
  quality_after: number;
  entries_before: number;
  entries_after: number;
  size_reduction_percent: number;
  semantic_drift: number;
  information_loss_estimate: number;
  performed_at: string;
  reversible: boolean;
  rollback_snapshot_id?: string;
}

// ── Specialized Memory Types ──

export interface PreferenceMemory {
  preference_id: string;
  user_id: string;
  category: string;
  subcategory?: string;
  key: string;
  value: unknown;
  learned_from: "explicit" | "inferred" | "feedback" | "behavioral" | "imported";
  confidence: number;
  stability: number;
  contradiction_count: number;
  last_confirmed_at?: string;
  last_contradicted_at?: string;
  override_count: number;
  active: boolean;
}

export interface WorkflowMemory {
  workflow_id: string;
  workflow_type: string;
  workflow_name: string;
  steps_completed: WorkflowStep[];
  steps_remaining: string[];
  context: Record<string, unknown>;
  decision_points: WorkflowDecisionPoint[];
  last_step_at: string;
  resumable: boolean;
  timeout_at?: string;
  priority: number;
  error_state?: string;
}

export interface WorkflowStep {
  step_id: string;
  name: string;
  status: "completed" | "skipped" | "failed";
  result?: unknown;
  duration_ms: number;
  completed_at: string;
}

export interface WorkflowDecisionPoint {
  decision_id: string;
  question: string;
  options: string[];
  chosen: string;
  reason: string;
  confidence: number;
  timestamp: string;
}

export interface ProceduralMemory {
  procedure_id: string;
  name: string;
  domain: string;
  description: string;
  steps: ProceduralStep[];
  preconditions: string[];
  postconditions: string[];
  success_rate: number;
  avg_duration_ms: number;
  execution_count: number;
  last_executed_at?: string;
  last_refined_at?: string;
  refinement_count: number;
  confidence: number;
  version: number;
  deprecated: boolean;
  successor_id?: string;
}

export interface ProceduralStep {
  step_id: string;
  order: number;
  action: string;
  parameters: Record<string, unknown>;
  expected_outcome: string;
  fallback_action?: string;
  timeout_ms: number;
  required: boolean;
}

// ── Memory Search ──

export interface MemorySearchQuery {
  query: string;
  layers?: AIMemoryLayer[];
  owner_id?: string;
  tags?: string[];
  min_importance?: number;
  min_confidence?: number;
  max_age_days?: number;
  privacy_level_max?: MemoryPrivacyLevel;
  semantic_search: boolean;
  similarity_threshold?: number;
  max_results: number;
  include_archived: boolean;
}

export interface MemorySearchResult {
  memory_id: string;
  layer: AIMemoryLayer;
  content: string;
  relevance_score: number;
  importance: number;
  confidence: number;
  created_at: string;
  source_type: string;
}

// ── Memory Health ──

export interface MemoryHealthReport {
  report_id: string;
  layer: AIMemoryLayer;
  total_entries: number;
  active_entries: number;
  stale_entries: number;
  contradicted_entries: number;
  avg_confidence: number;
  avg_importance: number;
  storage_used_mb: number;
  storage_limit_mb: number;
  consolidation_needed: boolean;
  pruning_needed: boolean;
  health_score: number;
  recommendations: string[];
  generated_at: string;
}
