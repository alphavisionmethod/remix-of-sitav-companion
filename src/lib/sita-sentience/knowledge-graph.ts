// ═══════════════════════════════════════════════════════════════
// SITA OS — Personal Knowledge Graph (Phase H)
// ═══════════════════════════════════════════════════════════════
// Lightweight CRUD over `sita_knowledge_nodes` and `sita_knowledge_edges`.
// Nodes are people/places/concepts/preferences/habits. Edges are
// typed relations with weights. Used by personality + agent for
// continuity (remembering names, preferences, recurring contacts).
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export type KnowledgeKind = "person" | "place" | "concept" | "preference" | "habit" | "fact" | "event";

export interface KnowledgeNode {
  id: string;
  user_id: string;
  kind: KnowledgeKind;
  label: string;
  body?: string | null;
  confidence: number;
  source?: string | null;
  metadata: Record<string, unknown>;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeEdge {
  id: string;
  user_id: string;
  from_node_id: string;
  to_node_id: string;
  relation: string;
  weight: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

export async function upsertNode(input: {
  user_id: string;
  kind: KnowledgeKind;
  label: string;
  body?: string;
  confidence?: number;
  source?: string;
  metadata?: Record<string, unknown>;
}): Promise<KnowledgeNode> {
  // Find existing by (user_id, kind, label) for idempotency.
  const { data: existing } = await supabase
    .from("sita_knowledge_nodes" as never)
    .select("*")
    .eq("user_id", input.user_id)
    .eq("kind", input.kind)
    .eq("label", input.label)
    .maybeSingle();
  if (existing) {
    const { data, error } = await supabase
      .from("sita_knowledge_nodes" as never)
      .update({
        body: input.body ?? (existing as unknown as KnowledgeNode).body,
        confidence: input.confidence ?? (existing as unknown as KnowledgeNode).confidence,
        last_seen_at: new Date().toISOString(),
      } as never)
      .eq("id", (existing as unknown as KnowledgeNode).id)
      .select("*")
      .single();
    if (error) throw error;
    return data as unknown as KnowledgeNode;
  }
  const { data, error } = await supabase
    .from("sita_knowledge_nodes" as never)
    .insert({
      user_id: input.user_id,
      kind: input.kind,
      label: input.label,
      body: input.body ?? null,
      confidence: input.confidence ?? 0.5,
      source: input.source ?? "manual",
      metadata: input.metadata ?? {},
    } as never)
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as KnowledgeNode;
}

export async function searchNodes(userId: string, query: string, limit = 12): Promise<KnowledgeNode[]> {
  const { data, error } = await supabase
    .from("sita_knowledge_nodes" as never)
    .select("*")
    .eq("user_id", userId)
    .ilike("label", `%${query}%`)
    .order("last_seen_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as KnowledgeNode[];
}

export async function listNodesByKind(userId: string, kind: KnowledgeKind, limit = 50): Promise<KnowledgeNode[]> {
  const { data, error } = await supabase
    .from("sita_knowledge_nodes" as never)
    .select("*")
    .eq("user_id", userId)
    .eq("kind", kind)
    .order("last_seen_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as KnowledgeNode[];
}

export async function relate(input: {
  user_id: string;
  from_node_id: string;
  to_node_id: string;
  relation: string;
  weight?: number;
}): Promise<void> {
  await supabase.from("sita_knowledge_edges" as never).insert({
    user_id: input.user_id,
    from_node_id: input.from_node_id,
    to_node_id: input.to_node_id,
    relation: input.relation,
    weight: input.weight ?? 1.0,
  } as never);
}

export async function neighbours(nodeId: string, limit = 25): Promise<KnowledgeEdge[]> {
  const { data, error } = await supabase
    .from("sita_knowledge_edges" as never)
    .select("*")
    .or(`from_node_id.eq.${nodeId},to_node_id.eq.${nodeId}`)
    .order("weight", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as KnowledgeEdge[];
}