// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Journey Auto-Classifier
// Reclassifies AI-backed customer journeys based on actual
// runtime evidence from ai_usage_ledger
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import type { JourneyStatus } from "./journey-registry";

/** Maps AI capability keys to customer journey keys */
const AI_CAPABILITY_TO_JOURNEY: Record<string, string> = {
  "advisor.chat.primary": "assistant.chat_primary",
  "boardroom.weekly.summary": "boardroom.summary_view_primary",
  "daily_pulse.generate": "app.dashboard_load_primary",
  "classification.extract": "assistant.chat_primary",
  "admin.synthesis": "admin.runtime_truth.open_primary",
  "admin.ai_workforce.run": "admin.ai_team.open_primary",
};

export interface AIJourneyEvidence {
  journeyKey: string;
  capabilityKey: string;
  lastSuccess: string | null;
  lastFailure: string | null;
  successCount30d: number;
  failureCount30d: number;
  classifiedStatus: JourneyStatus;
  confidence: "high" | "medium" | "low";
}

/**
 * Queries ai_usage_ledger for recent invocations and classifies
 * each AI-backed journey based on real runtime evidence.
 */
export async function classifyAIJourneys(): Promise<AIJourneyEvidence[]> {
  const capabilityKeys = Object.keys(AI_CAPABILITY_TO_JOURNEY);

  // Get last 30 days of usage for AI capabilities
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: usageRows } = await supabase
    .from("ai_usage_ledger")
    .select("capability_key, status, created_at")
    .in("capability_key", capabilityKeys)
    .gte("created_at", thirtyDaysAgo)
    .order("created_at", { ascending: false })
    .limit(500);

  const results: AIJourneyEvidence[] = [];

  for (const [capKey, journeyKey] of Object.entries(AI_CAPABILITY_TO_JOURNEY)) {
    const rows = usageRows?.filter((r: any) => r.capability_key === capKey) ?? [];
    const successes = rows.filter((r: any) => r.status === "success");
    const failures = rows.filter((r: any) => r.status !== "success");

    const lastSuccess = successes[0]?.created_at ?? null;
    const lastFailure = failures[0]?.created_at ?? null;

    // Classification logic
    let classifiedStatus: JourneyStatus;
    let confidence: "high" | "medium" | "low";

    if (successes.length === 0 && failures.length === 0) {
      classifiedStatus = "planned";
      confidence = "low";
    } else if (successes.length > 0 && failures.length === 0) {
      classifiedStatus = "working";
      confidence = successes.length >= 5 ? "high" : "medium";
    } else if (successes.length > 0 && failures.length > 0) {
      const successRate = successes.length / rows.length;
      if (successRate >= 0.9) {
        classifiedStatus = "working";
        confidence = "medium";
      } else if (successRate >= 0.5) {
        classifiedStatus = "degraded_usable";
        confidence = "medium";
      } else {
        classifiedStatus = "partial";
        confidence = "medium";
      }
    } else {
      // Only failures
      classifiedStatus = "broken";
      confidence = failures.length >= 3 ? "high" : "medium";
    }

    results.push({
      journeyKey,
      capabilityKey: capKey,
      lastSuccess,
      lastFailure,
      successCount30d: successes.length,
      failureCount30d: failures.length,
      classifiedStatus,
      confidence,
    });
  }

  return results;
}

/**
 * Hook-friendly wrapper: returns classified AI journey evidence
 */
export { classifyAIJourneys as getAIJourneyClassifications };
