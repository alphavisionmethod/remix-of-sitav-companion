// ═══════════════════════════════════════════════════════════════
// SITA OS — useExplanation (Phase J)
// ═══════════════════════════════════════════════════════════════
// Given any JarvisActionItem, hydrate the full "why this, why now"
// payload by composing existing governance registries:
//   - persona boundary (advisor-persona-boundary-map)
//   - confidence gate  (advisor-confidence-policy)
//   - reversibility    (advisor-reversibility-map)
//   - council votes    (sita_council_votes)
//   - source memories  (advisor_memories)
//   - plan steps       (sita_agent_plans.plan)
// No new tables.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getPersonaBoundary } from "@/lib/advisors/advisor-persona-boundary-map";
import { evaluateConfidenceGate } from "@/lib/advisors/advisor-confidence-policy";
import { getReversibility } from "@/lib/ai-platform/runtime/advisor-reversibility-map";
import type { ActionPlan } from "@/lib/sita-agent/plan-types";
import type { JarvisActionItem, JarvisExplanation } from "./types";

function safeGate(score: number | null, actionClass: string | null): "auto" | "approval" | "block" | "unknown" {
  if (score == null || !actionClass) return "unknown";
  try {
    const { allowed, behavior } = evaluateConfidenceGate(actionClass, score);
    if (allowed) return "auto";
    if (behavior === "refuse") return "block";
    return "approval";
  } catch {
    return "unknown";
  }
}

function safePersona(advisorId: string | null): JarvisExplanation["persona"] {
  if (!advisorId) return null;
  try {
    const p = getPersonaBoundary(advisorId);
    if (!p) return null;
    return {
      advisorId,
      role: (p as { role?: string }).role ?? "advisor",
      fenced: ((p as { fenced_domains?: string[] }).fenced_domains ?? []),
    };
  } catch {
    return null;
  }
}

function safeReversibility(item: JarvisActionItem): JarvisExplanation["reversibility"] {
  // For agent plans we trust plan.reversible; for advisor actions consult registry.
  if (item.source === "sita_agent_plans") {
    const plan = item.raw.plan as Partial<ActionPlan> | undefined;
    return {
      reversible: plan?.reversible ?? item.reversible,
      rollbackEligible: !!plan?.reversible,
    };
  }
  if (item.advisorId) {
    try {
      const r = getReversibility(item.advisorId);
      const reversible = !!(r as { reversible?: boolean })?.reversible;
      return { reversible, rollbackEligible: reversible };
    } catch {
      // fall through
    }
  }
  return { reversible: item.reversible, rollbackEligible: !!item.reversible };
}

async function loadCouncilVotes(planId: string | null): Promise<JarvisExplanation["councilVotes"]> {
  if (!planId) return [];
  const { data } = await supabase
    .from("sita_council_votes" as never)
    .select("advisor_id, vote, score, rationale")
    .eq("plan_id", planId)
    .order("score", { ascending: false });
  return ((data as Array<{ advisor_id: string; vote: string; score: number; rationale: string | null }> | null) ?? [])
    .map((row) => ({
      advisorId: row.advisor_id,
      vote: row.vote,
      score: Number(row.score ?? 0),
      rationale: row.rationale,
    }));
}

async function loadAdvisorMemories(advisorId: string | null, userId: string): Promise<JarvisExplanation["memories"]> {
  if (!advisorId) return [];
  const { data } = await supabase
    .from("advisor_memories" as never)
    .select("id, content, created_at")
    .eq("advisor_id", advisorId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5);
  return ((data as Array<{ id: string; content: string; created_at: string }> | null) ?? []);
}

function extractSteps(item: JarvisActionItem): JarvisExplanation["steps"] {
  if (item.source !== "sita_agent_plans") return [];
  const plan = item.raw.plan as Partial<ActionPlan> | undefined;
  if (!plan?.steps) return [];
  return plan.steps.map((s) => ({
    id: s.id,
    summary: s.summary,
    risk: s.risk,
    reversible: s.reversible,
  }));
}

/**
 * Returns the explanation payload for a single selected action item.
 * `userId` is needed to scope advisor_memories.
 */
export function useExplanation(item: JarvisActionItem | null, userId: string | null) {
  const [data, setData] = useState<JarvisExplanation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!item || !userId) { setData(null); return; }
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const planId = item.source === "sita_agent_plans" ? item.id : null;
        const [councilVotes, memories] = await Promise.all([
          loadCouncilVotes(planId),
          loadAdvisorMemories(item.advisorId, userId),
        ]);
        if (cancelled) return;
        // Use domain as the action-class proxy for the gate (matches CONFIDENCE_GATES keys).
        const actionClass = item.domain || item.advisorId;
        const payload: JarvisExplanation = {
          item,
          persona: safePersona(item.advisorId),
          confidence: { score: item.confidence, gate: safeGate(item.confidence, actionClass) },
          reversibility: safeReversibility(item),
          councilVotes,
          memories,
          steps: extractSteps(item),
        };
        setData(payload);
      } catch (err) {
        if (!cancelled) setError(err as Error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [item, userId]);

  return { explanation: data, loading, error };
}

export const __testables = { safeGate, safePersona, safeReversibility, extractSteps };