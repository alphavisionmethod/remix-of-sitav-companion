// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase 10 Attribution Service
// Reads `attribution_summary_v` to surface, per invocation, how
// many sources came from the operator's own workspace vs each
// federated peer workspace, with average / max similarity.
// ═══════════════════════════════════════════════════════════════
import { supabase } from "@/integrations/supabase/client";

export interface AttributionSummaryRow {
  invocation_id: string;
  user_id: string;
  /** "__own__" for the operator's own workspace, otherwise peer workspace UUID. */
  peer_workspace_id: string;
  federation_id: string | null;
  retrieval_kind: string;
  hit_count: number;
  avg_similarity: number | null;
  max_similarity: number | null;
  last_used_at: string;
}

export interface AttributionGroup {
  peerWorkspaceId: string;
  isOwn: boolean;
  totalHits: number;
  avgSimilarity: number | null;
  maxSimilarity: number | null;
  retrievalKinds: string[];
  federationIds: string[];
  lastUsedAt: string;
}

export async function fetchAttributionSummary(
  invocationId: string,
): Promise<AttributionSummaryRow[]> {
  const sb = supabase as unknown as {
    from: (t: string) => {
      select: (q: string) => {
        eq: (
          c: string,
          v: string,
        ) => Promise<{ data: AttributionSummaryRow[] | null; error: unknown }>;
      };
    };
  };
  const { data, error } = await sb
    .from("attribution_summary_v")
    .select("*")
    .eq("invocation_id", invocationId);
  if (error) throw error;
  return (data ?? []) as AttributionSummaryRow[];
}

export function groupAttributionByWorkspace(
  rows: AttributionSummaryRow[],
): AttributionGroup[] {
  const map = new Map<string, AttributionGroup>();
  for (const r of rows) {
    const g = map.get(r.peer_workspace_id);
    if (!g) {
      map.set(r.peer_workspace_id, {
        peerWorkspaceId: r.peer_workspace_id,
        isOwn: r.peer_workspace_id === "__own__",
        totalHits: r.hit_count,
        avgSimilarity: r.avg_similarity,
        maxSimilarity: r.max_similarity,
        retrievalKinds: [r.retrieval_kind],
        federationIds: r.federation_id ? [r.federation_id] : [],
        lastUsedAt: r.last_used_at,
      });
    } else {
      g.totalHits += r.hit_count;
      if (r.max_similarity != null) {
        g.maxSimilarity = Math.max(g.maxSimilarity ?? 0, r.max_similarity);
      }
      if (r.avg_similarity != null) {
        // weighted average by hit_count
        const prevWeight = g.totalHits - r.hit_count;
        g.avgSimilarity =
          ((g.avgSimilarity ?? 0) * prevWeight + r.avg_similarity * r.hit_count) /
          g.totalHits;
      }
      if (!g.retrievalKinds.includes(r.retrieval_kind)) {
        g.retrievalKinds.push(r.retrieval_kind);
      }
      if (r.federation_id && !g.federationIds.includes(r.federation_id)) {
        g.federationIds.push(r.federation_id);
      }
      if (new Date(r.last_used_at) > new Date(g.lastUsedAt)) {
        g.lastUsedAt = r.last_used_at;
      }
    }
  }
  // Own workspace first, then by total hits desc
  return Array.from(map.values()).sort((a, b) => {
    if (a.isOwn !== b.isOwn) return a.isOwn ? -1 : 1;
    return b.totalHits - a.totalHits;
  });
}