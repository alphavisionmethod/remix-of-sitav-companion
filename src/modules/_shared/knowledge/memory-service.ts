// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase 5 Memory Service
// Workspace-scoped, provenance-aware reads from pb_memories +
// memory_provenance. Writes go through the Trust authority engine.
// ═══════════════════════════════════════════════════════════════
import { supabase } from "@/integrations/supabase/client";

export type ConfidenceBand = "low" | "medium" | "high" | "verified";
export type Sensitivity = "public" | "internal" | "confidential" | "restricted";
export type ProvenanceKind =
  | "explicit_user"
  | "inferred_chat"
  | "inferred_file"
  | "inferred_behavior"
  | "system_seed";
export type ReviewStatus = "pending_review" | "accepted" | "rejected" | "expired";

export interface EffectiveMemoryRow {
  memory_id: string;
  content: string;
  category: string;
  kind: string;
  confidence: number;
  workspace_id: string | null;
  pillar: string;
  sensitivity: Sensitivity;
  provenance_kind: ProvenanceKind;
  confidence_band: ConfidenceBand;
  last_used_at: string | null;
}

export async function fetchEffectiveWorkspaceMemories(
  workspaceId: string | null,
  maxN = 25,
): Promise<EffectiveMemoryRow[]> {
  const { data, error } = await (supabase.rpc as any)(
    "effective_workspace_memories",
    { _workspace_id: workspaceId, _max_n: maxN },
  );
  if (error) throw error;
  return (data ?? []) as EffectiveMemoryRow[];
}

export async function recordMemoryUsage(memoryId: string): Promise<void> {
  const { error } = await (supabase.rpc as any)("record_memory_usage", {
    _memory_id: memoryId,
  });
  if (error) throw error;
}

export interface PendingMemoryReview {
  memory_id: string;
  content: string;
  pillar: string;
  sensitivity: Sensitivity;
  provenance_kind: ProvenanceKind;
  confidence_band: ConfidenceBand;
  workspace_id: string | null;
  created_at: string;
}

export async function fetchPendingMemoryReviews(): Promise<PendingMemoryReview[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await (supabase as any)
    .from("memory_provenance")
    .select("memory_id, pillar, sensitivity, provenance_kind, confidence_band, workspace_id, created_at, pb_memories!inner(content)")
    .eq("user_id", user.id)
    .eq("review_status", "pending_review")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    memory_id: row.memory_id,
    content: row.pb_memories?.content ?? "",
    pillar: row.pillar,
    sensitivity: row.sensitivity,
    provenance_kind: row.provenance_kind,
    confidence_band: row.confidence_band,
    workspace_id: row.workspace_id,
    created_at: row.created_at,
  }));
}

export async function resolveMemoryReview(
  memoryId: string,
  decision: "accepted" | "rejected",
): Promise<void> {
  const { error } = await (supabase as any)
    .from("memory_provenance")
    .update({ review_status: decision })
    .eq("memory_id", memoryId);
  if (error) throw error;
}