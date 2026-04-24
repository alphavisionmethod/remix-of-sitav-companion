// ═══════════════════════════════════════════════════════════════
// SITA OS — Council pre-execution scorer (Phase G)
// ═══════════════════════════════════════════════════════════════
// Calls the sita-council-prevote edge function to bias plan ordering.
// Never blocks user input — best-effort, fast-fail.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import type { ActionPlan } from "@/lib/sita-agent/plan-types";

export interface CouncilVote {
  advisor_id: string;
  vote: "approve" | "concern" | "reject" | "abstain";
  score: number; // 0-1
  rationale: string;
}

export interface CouncilVerdict {
  plan_id: string;
  quorum_reached: boolean;
  consensus_score: number;
  votes: CouncilVote[];
  dissent_summary?: string;
}

const COUNCIL_TIMEOUT_MS = 1500;

export async function preVoteOnPlan(plan: ActionPlan): Promise<CouncilVerdict | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), COUNCIL_TIMEOUT_MS);
    const { data, error } = await supabase.functions.invoke("sita-council-prevote", {
      body: { plan },
    });
    clearTimeout(timer);
    if (error) {
      console.warn("[council] prevote error", error);
      return null;
    }
    return data as CouncilVerdict | null;
  } catch (err) {
    console.warn("[council] prevote failed", err);
    return null;
  }
}