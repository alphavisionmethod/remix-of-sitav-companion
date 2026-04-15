// ═══════════════════════════════════════════════════════════════
// SITA OS — Board API Client
// Typed client for the business-board-api edge function
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

async function callBoardAPI<T = unknown>(action: string, payload: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke("business-board-api", {
    body: { action, payload },
  });
  if (error) throw new Error(error.message || "Board API error");
  return data as T;
}

// ─── Boardroom State ────────────────────────────────────────
export const BoardAPI = {
  // Summary
  getSummary: () => callBoardAPI<{
    recommendations: BoardRecommendation[];
    actions: BoardAction[];
    healthScores: HealthScore[];
    profitSignals: ProfitSignal[];
    autonomyPolicies: AutonomyPolicy[];
    timestamp: string;
  }>("boardroom.summary"),

  // Recommendations
  listRecommendations: (status = "new", limit = 50) =>
    callBoardAPI<{ recommendations: BoardRecommendation[] }>("recommendations.list", { status, limit }),

  generateRecommendations: (payload: Record<string, unknown>) =>
    callBoardAPI<{ recommendations: unknown[]; persisted: number }>("recommendations.generate", payload),

  updateRecommendation: (id: string, status: string, resolution_notes?: string) =>
    callBoardAPI("recommendations.update", { id, status, resolution_notes }),

  // Actions
  listActions: (limit = 50) =>
    callBoardAPI<{ actions: BoardAction[] }>("actions.list", { limit }),

  createAction: (payload: Partial<BoardAction>) =>
    callBoardAPI<{ action: BoardAction }>("actions.create", payload),

  updateAction: (id: string, updates: Partial<BoardAction>) =>
    callBoardAPI("actions.update", { id, ...updates }),

  // Memory
  listMemory: (filters?: { advisor_id?: string; memory_layer?: string; limit?: number }) =>
    callBoardAPI<{ memories: BoardMemory[] }>("memory.list", filters ?? {}),

  storeMemory: (payload: Partial<BoardMemory>) =>
    callBoardAPI<{ memory: BoardMemory }>("memory.store", payload),

  correctMemory: (id: string, content?: string, confidence?: number) =>
    callBoardAPI("memory.correct", { id, content, confidence }),

  archiveMemory: (id: string) =>
    callBoardAPI("memory.archive", { id }),

  resetMemorySlice: (memory_layer?: string, advisor_id?: string) =>
    callBoardAPI("memory.reset-slice", { memory_layer, advisor_id }),

  // Autonomy
  getAutonomy: () =>
    callBoardAPI<{ policies: AutonomyPolicy[] }>("autonomy.get"),

  upsertAutonomy: (payload: Partial<AutonomyPolicy>) =>
    callBoardAPI<{ policy: AutonomyPolicy }>("autonomy.upsert", payload),

  emergencyStop: () =>
    callBoardAPI("autonomy.emergency-stop"),

  resume: () =>
    callBoardAPI("autonomy.resume"),

  // Health
  getHealth: (limit = 9) =>
    callBoardAPI<{ scores: HealthScore[] }>("health.get", { limit }),

  recordHealth: (dimensions: Partial<HealthScore>[]) =>
    callBoardAPI("health.record", { dimensions }),

  // Profitability
  listProfitSignals: (limit = 50) =>
    callBoardAPI<{ signals: ProfitSignal[] }>("profitability.list", { limit }),

  recordProfitSignal: (payload: Partial<ProfitSignal>) =>
    callBoardAPI<{ signal: ProfitSignal }>("profitability.record", payload),

  resolveProfitSignal: (id: string, outcome: string, actual_impact_cents?: number) =>
    callBoardAPI("profitability.resolve", { id, outcome, actual_impact_cents }),

  // Reflections
  recordReflection: (payload: Partial<BoardReflection>) =>
    callBoardAPI<{ reflection: BoardReflection }>("reflections.record", payload),

  listReflections: (limit = 50) =>
    callBoardAPI<{ reflections: BoardReflection[] }>("reflections.list", { limit }),

  // Tool Executions
  listToolExecutions: (limit = 50) =>
    callBoardAPI<{ executions: ToolExecution[] }>("tools.list", { limit }),

  recordToolExecution: (payload: Partial<ToolExecution>) =>
    callBoardAPI<{ execution: ToolExecution }>("tools.record", payload),
};

// ─── Types ──────────────────────────────────────────────────
export interface BoardRecommendation {
  id: string;
  user_id: string;
  advisor_id: string;
  title: string;
  summary: string;
  rationale: string;
  domain: string;
  category: string;
  confidence_score: number;
  urgency_score: number;
  business_impact_score: number;
  reversibility_score: number;
  profitability_score: number;
  relationship_risk_score: number;
  operational_risk_score: number;
  clarity_score: number;
  contributing_advisors: string[];
  evidence_refs: string[];
  action_plan: Record<string, unknown>;
  status: string;
  resolved_at: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BoardAction {
  id: string;
  user_id: string;
  recommendation_id: string | null;
  advisor_id: string;
  title: string;
  description: string;
  action_type: string;
  domain: string;
  risk_tier: string;
  status: string;
  confidence: number;
  requires_approval: boolean;
  approved_by: string | null;
  approved_at: string | null;
  executed_at: string | null;
  completed_at: string | null;
  failed_at: string | null;
  reverted_at: string | null;
  error_message: string | null;
  proof_receipt: Record<string, unknown>;
  rollback_data: Record<string, unknown> | null;
  parameters: Record<string, unknown>;
  result: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface BoardMemory {
  id: string;
  user_id: string;
  advisor_id: string;
  memory_layer: string;
  category: string;
  content: string;
  context_ref: string | null;
  importance: number;
  confidence: number;
  access_count: number;
  last_accessed_at: string | null;
  expires_at: string | null;
  status: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AutonomyPolicy {
  id: string;
  user_id: string;
  domain: string;
  autonomy_level: number;
  max_financial_impact_cents: number;
  allow_communication: boolean;
  allow_scheduling: boolean;
  allow_financial: boolean;
  allow_client_facing: boolean;
  require_approval_above_confidence: number;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  emergency_stop: boolean;
  paused_at: string | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface HealthScore {
  id: string;
  user_id: string;
  dimension: string;
  score: number;
  previous_score: number | null;
  trend: string;
  contributing_signals: unknown[];
  biggest_drag: string | null;
  biggest_mover: string | null;
  improvement_opportunity: string | null;
  scored_at: string;
  created_at: string;
  updated_at: string;
}

export interface ProfitSignal {
  id: string;
  user_id: string;
  signal_type: string;
  category: string;
  title: string;
  description: string;
  estimated_impact_cents: number | null;
  confidence: number;
  urgency: string;
  source_data: Record<string, unknown>;
  status: string;
  resolved_at: string | null;
  resolution_outcome: string | null;
  actual_impact_cents: number | null;
  created_at: string;
  updated_at: string;
}

export interface BoardReflection {
  id: string;
  user_id: string;
  recommendation_id: string | null;
  advisor_id: string;
  owner_action: string;
  owner_feedback: string | null;
  outcome_observed: string | null;
  outcome_quality: number | null;
  lesson_learned: string | null;
  should_repeat: boolean | null;
  pattern_tags: string[];
  created_at: string;
  updated_at: string;
}

export interface ToolExecution {
  id: string;
  user_id: string;
  action_id: string | null;
  advisor_id: string;
  tool_category: string;
  tool_name: string;
  operation: string;
  parameters: Record<string, unknown>;
  result: Record<string, unknown> | null;
  status: string;
  approval_state: string;
  approved_by: string | null;
  approved_at: string | null;
  executed_at: string | null;
  duration_ms: number | null;
  error_message: string | null;
  rollback_capable: boolean;
  rollback_data: Record<string, unknown> | null;
  rolled_back_at: string | null;
  created_at: string;
  updated_at: string;
}
