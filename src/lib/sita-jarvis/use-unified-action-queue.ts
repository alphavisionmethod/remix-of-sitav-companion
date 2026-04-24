// ═══════════════════════════════════════════════════════════════
// SITA OS — useUnifiedActionQueue (Phase J)
// ═══════════════════════════════════════════════════════════════
// Fuses three already-existing follow-through surfaces into one
// chronologically-sorted, deduplicated queue:
//   1. advisor_action_queue   (status='proposed')
//   2. sita_agent_plans       (status in 'pending'|'approved')
//   3. advisor_board_recommendations (no linked action yet)
// No new tables; this is a read-only projection.
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { ActionPlan, SitaActionRisk } from "@/lib/sita-agent/plan-types";
import type { JarvisActionItem } from "./types";

const QUEUE_LIMIT = 25;

function riskFrom(value: unknown): SitaActionRisk | null {
  if (value === "low" || value === "medium" || value === "high") return value;
  return null;
}

function fromAdvisorQueue(row: Record<string, unknown>): JarvisActionItem {
  return {
    key: `advisor_action_queue:${row.id}`,
    source: "advisor_action_queue",
    id: String(row.id),
    title: String(row.summary ?? row.action_type ?? "Advisor action"),
    summary: String(row.summary ?? ""),
    advisorId: row.advisor_id ? String(row.advisor_id) : null,
    domain: String(row.domain ?? "general"),
    confidence: row.confidence != null ? Number(row.confidence) : null,
    risk: null,
    reversible: row.rollback_payload != null ? true : null,
    requiresApproval: Boolean(row.requires_approval ?? true),
    status: String(row.status ?? "proposed"),
    createdAt: String(row.created_at ?? new Date().toISOString()),
    raw: row,
  };
}

function fromAgentPlan(row: Record<string, unknown>): JarvisActionItem {
  const plan = (row.plan as Partial<ActionPlan> | null) ?? null;
  return {
    key: `sita_agent_plans:${row.id}`,
    source: "sita_agent_plans",
    id: String(row.id),
    title: String(plan?.title ?? row.intent ?? "Agent plan"),
    summary: String(plan?.rationale ?? row.intent ?? ""),
    advisorId: null,
    domain: String(plan?.domain ?? row.domain ?? "business"),
    confidence: null,
    risk: riskFrom(plan?.risk),
    reversible: plan?.reversible ?? null,
    requiresApproval: !(plan?.canAutoRun ?? false),
    status: String(row.status ?? "pending"),
    createdAt: String(row.created_at ?? new Date().toISOString()),
    raw: row,
  };
}

function fromRecommendation(row: Record<string, unknown>): JarvisActionItem {
  const rev = Number(row.reversibility_score ?? 0);
  return {
    key: `advisor_board_recommendations:${row.id}`,
    source: "advisor_board_recommendations",
    id: String(row.id),
    title: String(row.title ?? "Recommendation"),
    summary: String(row.summary ?? row.rationale ?? ""),
    advisorId: row.advisor_id ? String(row.advisor_id) : null,
    domain: String(row.domain ?? "business"),
    confidence: row.confidence_score != null ? Number(row.confidence_score) : null,
    risk: rev >= 0.66 ? "low" : rev >= 0.33 ? "medium" : "high",
    reversible: rev >= 0.5,
    requiresApproval: true,
    status: "pending",
    createdAt: String(row.created_at ?? new Date().toISOString()),
    raw: row,
  };
}

/**
 * Dedupe by composite (source, id) and stable-sort newest first.
 * Mirrors the dedupeById pattern used by usePbInsightsSignals.
 */
function dedupeAndSort(items: JarvisActionItem[]): JarvisActionItem[] {
  const seen = new Set<string>();
  const out: JarvisActionItem[] = [];
  for (const item of items) {
    if (seen.has(item.key)) continue;
    seen.add(item.key);
    out.push(item);
  }
  return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function useUnifiedActionQueue() {
  const { user } = useAuth();
  const [items, setItems] = useState<JarvisActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [queueRes, planRes, recRes] = await Promise.all([
        supabase
          .from("advisor_action_queue" as never)
          .select("*")
          .eq("user_id", user.id)
          .in("status", ["proposed", "approved"])
          .order("created_at", { ascending: false })
          .limit(QUEUE_LIMIT),
        supabase
          .from("sita_agent_plans" as never)
          .select("*")
          .eq("user_id", user.id)
          .in("status", ["pending", "approved", "awaiting_confirmation"])
          .order("created_at", { ascending: false })
          .limit(QUEUE_LIMIT),
        supabase
          .from("advisor_board_recommendations" as never)
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(QUEUE_LIMIT),
      ]);
      const merged: JarvisActionItem[] = [
        ...((queueRes.data as Array<Record<string, unknown>> | null) ?? []).map(fromAdvisorQueue),
        ...((planRes.data as Array<Record<string, unknown>> | null) ?? []).map(fromAgentPlan),
        ...((recRes.data as Array<Record<string, unknown>> | null) ?? []).map(fromRecommendation),
      ];
      setItems(dedupeAndSort(merged).slice(0, QUEUE_LIMIT));
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { void refresh(); }, [refresh]);

  return { items, loading, error, refresh };
}

// Exposed for tests
export const __testables = { dedupeAndSort, fromAdvisorQueue, fromAgentPlan, fromRecommendation };