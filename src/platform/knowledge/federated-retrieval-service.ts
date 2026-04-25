// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase 9 Federated Retrieval Service
// Client-side wrapper around semantic_*_federated RPCs so apps
// can search across own + granted peer workspaces in one call.
// ═══════════════════════════════════════════════════════════════
import { supabase } from "@/integrations/supabase/client";

export interface FederatedChunkHit {
  chunk_id: string;
  content: string;
  file_id: string | null;
  pillar: string;
  sensitivity: string;
  similarity: number;
  source_table: string;
  workspace_id: string;
  via_federation: string | null;
}

export interface FederatedMemoryHit {
  memory_id: string;
  content: string;
  category: string;
  confidence: number;
  pillar: string;
  sensitivity: string;
  provenance_kind: string;
  workspace_id: string;
  similarity: number;
  last_used_at: string | null;
  via_federation: string | null;
}

async function embedQuery(text: string): Promise<string | null> {
  const { data, error } = await supabase.functions.invoke("knowledge-embedder", {
    body: { scope: "query", query_text: text.slice(0, 4000) },
  });
  if (error || !data?.embedding) return null;
  return `[${(data.embedding as number[]).join(",")}]`;
}

export async function searchFederatedChunks(args: {
  queryText: string;
  workspaceId: string;
  maxN?: number;
  minSimilarity?: number;
}): Promise<FederatedChunkHit[]> {
  const vec = await embedQuery(args.queryText);
  if (!vec) return [];
  const { data, error } = await (supabase.rpc as unknown as (
    fn: string,
    args: Record<string, unknown>,
  ) => Promise<{ data: FederatedChunkHit[] | null; error: unknown }>)(
    "semantic_knowledge_chunks_federated",
    {
      _query_embedding: vec,
      _workspace_id: args.workspaceId,
      _max_n: args.maxN ?? 12,
      _min_similarity: args.minSimilarity ?? 0.55,
    },
  );
  if (error) throw error;
  return (data ?? []) as FederatedChunkHit[];
}

export async function searchFederatedMemories(args: {
  queryText: string;
  workspaceId: string;
  maxN?: number;
  minSimilarity?: number;
}): Promise<FederatedMemoryHit[]> {
  const vec = await embedQuery(args.queryText);
  if (!vec) return [];
  const { data, error } = await (supabase.rpc as unknown as (
    fn: string,
    args: Record<string, unknown>,
  ) => Promise<{ data: FederatedMemoryHit[] | null; error: unknown }>)(
    "semantic_workspace_memories_federated",
    {
      _query_embedding: vec,
      _workspace_id: args.workspaceId,
      _max_n: args.maxN ?? 12,
      _min_similarity: args.minSimilarity ?? 0.55,
    },
  );
  if (error) throw error;
  return (data ?? []) as FederatedMemoryHit[];
}