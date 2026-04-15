// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Memory Types
// Memory governance, preference/workflow/procedural contracts, expiry.
// ═══════════════════════════════════════════════════════════════

export type AIMemoryLayer = "working" | "episodic" | "semantic" | "procedural" | "preference";

export type MemoryStatus = "active" | "archived" | "expired" | "pruned" | "consolidated";

export interface AIMemoryEntry {
  memory_id: string;
  layer: AIMemoryLayer;
  owner_id: string;
  owner_type: "user" | "agent" | "system";
  content: string;
  structured_data?: Record<string, unknown>;
  importance: number;
  confidence: number;
  access_count: number;
  last_accessed_at?: string;
  status: MemoryStatus;
  tags: string[];
  source_event_id?: string;
  created_at: string;
  expires_at?: string;
}

export interface MemoryGovernancePolicy {
  policy_id: string;
  layer: AIMemoryLayer;
  max_entries: number;
  max_age_days: number;
  consolidation_threshold: number;
  pruning_strategy: "oldest" | "least_accessed" | "lowest_importance" | "expired_first";
  auto_consolidate: boolean;
  auto_prune: boolean;
  retention_override_tags: string[];
}

export interface MemoryConsolidation {
  consolidation_id: string;
  layer: AIMemoryLayer;
  source_memory_ids: string[];
  consolidated_memory_id: string;
  consolidation_type: "merge" | "summarize" | "deduplicate";
  entries_before: number;
  entries_after: number;
  performed_at: string;
}

export interface PreferenceMemory {
  preference_id: string;
  user_id: string;
  category: string;
  key: string;
  value: unknown;
  learned_from: "explicit" | "inferred" | "feedback";
  confidence: number;
  last_confirmed_at?: string;
}

export interface WorkflowMemory {
  workflow_id: string;
  workflow_type: string;
  steps_completed: string[];
  context: Record<string, unknown>;
  last_step_at: string;
  resumable: boolean;
}

export interface ProceduralMemory {
  procedure_id: string;
  name: string;
  domain: string;
  steps: string[];
  success_rate: number;
  last_executed_at?: string;
  refinement_count: number;
}
