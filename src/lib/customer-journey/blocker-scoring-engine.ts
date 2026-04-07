// ═══════════════════════════════════════════════════════════════
// SITA OS — Launch Blocker Scoring Engine
// Automated severity scoring based on journey priority, status, mode
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export interface BlockerInput {
  journey_key: string;
  launch_importance: string;
  status: string;
  mode: string;
  persona: string;
  domain: string;
  steps_failed: number;
  steps_total: number;
  actual_outcome?: string;
  recommended_fix?: string;
  verification_run_id?: string;
}

export interface BlockerResult {
  blocker_type: "launch_blocker" | "pilot_blocker" | "claim_risk" | "important_non_blocker" | "non_blocking";
  severity_score: number;
  reason_summary: string;
  affects_demo: boolean;
  affects_real: boolean;
  affects_admin: boolean;
  affects_user: boolean;
}

// Priority weight: launch_blocker = highest
const IMPORTANCE_WEIGHT: Record<string, number> = {
  launch_blocker: 40,
  pilot_blocker: 30,
  claim_risk: 20,
  important_non_blocker: 10,
  non_blocking: 5,
};

// Status severity
const STATUS_WEIGHT: Record<string, number> = {
  broken: 40,
  partial: 20,
  degraded_usable: 10,
  demo_governed: 5,
  planned: 2,
  working: 0,
  internal_only: 0,
  unverified: 15,
};

// Domain criticality bonus
const DOMAIN_CRITICALITY: Record<string, number> = {
  auth: 20,
  core: 15,
  files: 10,
  ai: 10,
  boardroom: 8,
  approvals: 5,
  connectors: 5,
  settings: 3,
  admin: 3,
};

export function computeBlockerScore(input: BlockerInput): BlockerResult {
  const importanceW = IMPORTANCE_WEIGHT[input.launch_importance] ?? 5;
  const statusW = STATUS_WEIGHT[input.status] ?? 0;
  const domainW = DOMAIN_CRITICALITY[input.domain] ?? 0;

  // Failure ratio bonus (0-10)
  const failRatio = input.steps_total > 0
    ? Math.round((input.steps_failed / input.steps_total) * 10)
    : 0;

  const rawScore = importanceW + statusW + domainW + failRatio;
  const severity_score = Math.min(100, Math.max(0, rawScore));

  // Classify blocker type
  let blocker_type: BlockerResult["blocker_type"];
  if (severity_score >= 70 && (input.status === "broken" || input.status === "partial")) {
    blocker_type = "launch_blocker";
  } else if (severity_score >= 50) {
    blocker_type = "pilot_blocker";
  } else if (input.status === "demo_governed" && input.mode === "real") {
    blocker_type = "claim_risk";
  } else if (severity_score >= 20) {
    blocker_type = "important_non_blocker";
  } else {
    blocker_type = "non_blocking";
  }

  const affects_user = input.persona === "user";
  const affects_admin = input.persona === "operator" || input.persona === "admin";
  const affects_demo = input.mode === "demo";
  const affects_real = input.mode === "real";

  const reason_summary = `${input.journey_key}: ${input.status} in ${input.mode} mode. ${input.steps_failed}/${input.steps_total} steps failed. ${input.actual_outcome || ""}`.trim();

  return { blocker_type, severity_score, reason_summary, affects_demo, affects_real, affects_admin, affects_user };
}

// Persist score to DB
export async function persistBlockerScore(input: BlockerInput): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const result = computeBlockerScore(input);

  // Only persist non-working statuses
  if (input.status === "working") return;

  await (supabase as unknown)
    .from("launch_blocker_scores")
    .upsert(
      {
        user_id: user.id,
        journey_key: input.journey_key,
        verification_run_id: input.verification_run_id || null,
        ...result,
        resolved: false,
      },
      { onConflict: "id" }
    );
}

// Compute and persist mode comparison
export async function persistModeComparison(
  journey_key: string,
  realStatus?: string,
  demoStatus?: string,
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const claim_risk = demoStatus === "working" && realStatus !== "working";

  let comparison_summary = "no_data";
  if (realStatus && demoStatus) {
    if (realStatus === "working" && demoStatus === "working") comparison_summary = "both_work";
    else if (demoStatus === "working" && realStatus !== "working") comparison_summary = "demo_works_real_broken";
    else if (realStatus === "working" && demoStatus !== "working") comparison_summary = "real_works_demo_broken";
    else comparison_summary = "both_issues";
  }

  await (supabase as unknown)
    .from("customer_journey_mode_comparisons")
    .upsert(
      {
        user_id: user.id,
        journey_key,
        real_status: realStatus || null,
        demo_status: demoStatus || null,
        comparison_summary,
        claim_risk,
      },
      { onConflict: "user_id,journey_key" }
    );
}
