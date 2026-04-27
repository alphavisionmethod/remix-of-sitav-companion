// ═══════════════════════════════════════════════════════════════
// SITA OS — Proof Chain Hook (Phase 3)
// Fetches proof records with correlation_id and parent_proof_id
// for chain visualization and bundle export.
// ═══════════════════════════════════════════════════════════════

import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
export interface ProofChainNode {
  id: string;
  action_summary: string;
  category: string;
  domain: string | null;
  verification: string | null;
  result: string | null;
  correlation_id: string | null;
  parent_proof_id: string | null;
  created_at: string;
  hash: string | null;
  artifact: string | null;
}

export function useProofChain(correlationId: string | null) {
  const { user } = useAuth();

  return useQuery<ProofChainNode[]>({
    queryKey: ["proof-chain", correlationId, user?.id],
    enabled: !!user && !!correlationId,
    queryFn: async () => {
      if (!user || !correlationId) return [];
      const { data, error } = await fromTable("proof_records")
        .select("id, action_summary, category, domain, verification, result, correlation_id, parent_proof_id, created_at, hash, artifact")
        .eq("correlation_id", correlationId)
        .order("created_at", { ascending: true });
      if (error) return [];
      return data || [];
    },
  });
}

export function useProofBundle() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (correlationId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await fromTable("proof_records")
        .select("*")
        .eq("correlation_id", correlationId)
        .order("created_at", { ascending: true });
      if (error) throw error;

      const bundle = {
        bundleId: crypto.randomUUID(),
        correlationId,
        exportedAt: new Date().toISOString(),
        exportedBy: user.id,
        recordCount: (data || []).length,
        records: data || [],
        integrityHash: await computeBundleHash(data || []),
      };

      // Download as JSON
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `proof-bundle-${correlationId.slice(0, 8)}.json`;
      a.click();
      URL.revokeObjectURL(url);

      return bundle;
    },
  });
}

async function computeBundleHash(records: any[]): Promise<string> {
  const content = records.map(r => `${r.id}:${r.hash || ""}:${r.created_at}`).join("|");
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// ── Emit proof record helper ─────────────────────────────────
export async function emitProofRecord(
  userId: string,
  opts: {
    actionSummary: string;
    domain: string;
    category: string;
    correlationId?: string;
    parentProofId?: string;
    result?: string;
    verification?: string;
  }
) {
  const hash = await computeRecordHash(opts.actionSummary, new Date().toISOString());
  await fromTable("proof_records").insert({
    user_id: userId,
    action_summary: opts.actionSummary,
    domain: opts.domain,
    category: opts.category,
    correlation_id: opts.correlationId || crypto.randomUUID(),
    parent_proof_id: opts.parentProofId || null,
    result: opts.result || "completed",
    verification: opts.verification || "system-verified",
    hash,
  });
}

async function computeRecordHash(summary: string, timestamp: string): Promise<string> {
  const content = `${summary}:${timestamp}:${crypto.randomUUID()}`;
  const data = new TextEncoder().encode(content);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
}
