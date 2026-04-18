// ═══════════════════════════════════════════════════════════════
// SITA OS — internal-agent-reflect (Phase 3)
// Reflection & learning loop for the internal AI workforce.
//
// For every settled intent in the lookback window (executed | denied |
// failed | rolled_back) without a reflection yet:
//   1. Compute outcome_quality + gate_fitness from intent + receipt
//   2. Detect pattern tags (rate_limit_pressure, autonomy_block, …)
//   3. Decide should_repeat / avoid signal
//   4. Persist via record_internal_agent_reflection RPC (which also
//      rolls trust_score on runtime_state via EWMA)
//
// Service-role only. Idempotent (RPC upserts by intent_id).
// Invocable: directly, by cron (recommended every 30min), or by the
// internal-agent-loop after each pass.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface IntentRow {
  id: string;
  agent_id: string;
  action_class: string;
  status: string;
  confidence: number;
  precondition_check_passed: boolean;
  rollback_capable: boolean;
  rollback_plan: any;
  gate_results: any[];
  approval_request_id: string | null;
  receipt_id: string | null;
  rolled_back_at: string | null;
  denial_reason: string | null;
  error_message: string | null;
  execution_result: any;
  created_at: string;
  executed_at: string | null;
}

interface ReflectionResult {
  intent_id: string;
  agent_id: string;
  action_class: string;
  outcome_quality: number;
  gate_fitness: number;
  should_repeat: boolean | null;
  pattern_tags: string[];
  lesson: string;
  recommendation: string;
  ok: boolean;
  error?: string;
}

function safeArr<T = any>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

function computeGateFitness(intent: IntentRow): number {
  const gates = safeArr<any>(intent.gate_results);
  if (gates.length === 0) return 0;
  const passed = gates.filter((g) => g?.passed === true || g?.result === "pass").length;
  return Number((passed / gates.length).toFixed(4));
}

function detectPatterns(intent: IntentRow): string[] {
  const tags = new Set<string>();
  const gates = safeArr<any>(intent.gate_results);

  for (const g of gates) {
    if (g?.passed === false || g?.result === "fail") {
      const gate = String(g?.gate ?? "").toLowerCase();
      if (gate.includes("rate")) tags.add("rate_limit_pressure");
      else if (gate.includes("autonomy")) tags.add("autonomy_block");
      else if (gate.includes("kill")) tags.add("kill_switch_active");
      else if (gate.includes("rollback")) tags.add("rollback_unavailable");
      else if (gate.includes("precondition")) tags.add("missing_evidence");
      else if (gate.includes("whitelist")) tags.add("class_not_whitelisted");
      else if (gate.includes("approval")) tags.add("required_approval");
      else if (gate.includes("suspension")) tags.add("agent_suspended");
      else tags.add(`gate_failed:${gate || "unknown"}`);
    }
  }

  if (intent.status === "rolled_back") tags.add("rolled_back");
  if (intent.status === "failed") tags.add("execution_failure");
  if (intent.status === "denied") tags.add("denied_at_gate");
  if (intent.status === "executed" && intent.confidence < 0.7) {
    tags.add("low_confidence_success");
  }
  if (intent.status === "executed" && intent.confidence >= 0.9) {
    tags.add("high_confidence_success");
  }
  if (intent.error_message?.toLowerCase().includes("timeout")) tags.add("timeout");
  if (intent.error_message?.toLowerCase().includes("permission")) tags.add("permission_error");

  return Array.from(tags);
}

function scoreOutcome(intent: IntentRow): { quality: number; lesson: string; recommendation: string; should_repeat: boolean | null } {
  // executed AND not rolled back AND no error → strong positive signal
  if (intent.status === "executed" && !intent.rolled_back_at && !intent.error_message) {
    return {
      quality: Math.min(1, 0.7 + intent.confidence * 0.3),
      lesson: `Action ${intent.action_class} executed cleanly through all gates with ${(intent.confidence * 100).toFixed(0)}% confidence.`,
      recommendation: intent.confidence >= 0.85
        ? "Pattern is reliable — keep within current autonomy."
        : "Pattern works but confidence was modest — consider raising precondition strictness before increasing autonomy.",
      should_repeat: true,
    };
  }
  // executed but rolled back later → mixed
  if (intent.status === "executed" && intent.rolled_back_at) {
    return {
      quality: 0.35,
      lesson: `Action ${intent.action_class} executed but was reversed — preconditions may not match operator intent.`,
      recommendation: "Strengthen precondition_evidence requirements before re-attempting this class.",
      should_repeat: false,
    };
  }
  if (intent.status === "rolled_back") {
    return {
      quality: 0.3,
      lesson: `Action ${intent.action_class} was rolled back automatically — likely incorrect target selection.`,
      recommendation: "Tighten target discovery RPC or raise confidence threshold.",
      should_repeat: false,
    };
  }
  if (intent.status === "denied") {
    const why = intent.denial_reason ?? "unknown";
    return {
      quality: 0.2,
      lesson: `Action denied at safety brain: ${why}.`,
      recommendation: why.includes("rate_limit")
        ? "Reduce per-hour invocation rate at the agent bridge level."
        : why.includes("autonomy")
        ? "Autonomy of agent is below required level — operator must promote agent first."
        : why.includes("kill_switch")
        ? "Master kill-switch active — no remediation path until lifted."
        : "Review precondition evidence and re-evaluate.",
      should_repeat: false,
    };
  }
  if (intent.status === "failed") {
    return {
      quality: 0.1,
      lesson: `Execution failed: ${(intent.error_message ?? "no error message").slice(0, 200)}.`,
      recommendation: "Inspect handler logic for the action class — failure is a downstream defect, not a gate decision.",
      should_repeat: false,
    };
  }
  return {
    quality: 0.5,
    lesson: `Status ${intent.status} — neutral signal.`,
    recommendation: "Insufficient evidence for repeat/avoid decision.",
    should_repeat: null,
  };
}

async function reflectOnIntent(
  supabase: any,
  intent: IntentRow,
): Promise<ReflectionResult> {
  const gateFitness = computeGateFitness(intent);
  const patterns = detectPatterns(intent);
  const { quality, lesson, recommendation, should_repeat } = scoreOutcome(intent);

  // confidence calibration: |predicted - observed|
  const observed = quality;
  const calibration = Number(Math.abs(intent.confidence - observed).toFixed(4));

  const evidence = {
    intent_status: intent.status,
    confidence: intent.confidence,
    gate_count: safeArr(intent.gate_results).length,
    rolled_back: !!intent.rolled_back_at,
    has_receipt: !!intent.receipt_id,
    has_approval_request: !!intent.approval_request_id,
    error_summary: intent.error_message?.slice(0, 200) ?? null,
    denial_reason: intent.denial_reason ?? null,
  };

  const { error } = await supabase.rpc("record_internal_agent_reflection", {
    _intent_id: intent.id,
    _outcome_quality: quality,
    _gate_fitness_score: gateFitness,
    _confidence_calibration: calibration,
    _lesson_learned: lesson,
    _pattern_tags: patterns,
    _should_repeat: should_repeat,
    _recommendation: recommendation,
    _evidence: evidence,
  });

  return {
    intent_id: intent.id,
    agent_id: intent.agent_id,
    action_class: intent.action_class,
    outcome_quality: quality,
    gate_fitness: gateFitness,
    should_repeat,
    pattern_tags: patterns,
    lesson,
    recommendation,
    ok: !error,
    error: error?.message,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
  const lookbackHours: number = Math.min(168, Math.max(1, Number(body?.lookback_hours ?? 24)));
  const maxBatch: number = Math.min(200, Math.max(1, Number(body?.max_batch ?? 50)));

  // Pull settled intents without a reflection yet
  const { data: intents, error: intentsError } = await supabase
    .from("internal_agent_action_intents")
    .select("id,agent_id,action_class,status,confidence,precondition_check_passed,rollback_capable,rollback_plan,gate_results,approval_request_id,receipt_id,rolled_back_at,denial_reason,error_message,execution_result,created_at,executed_at")
    .in("status", ["executed", "denied", "failed", "rolled_back"])
    .gte("created_at", new Date(Date.now() - lookbackHours * 3600_000).toISOString())
    .order("created_at", { ascending: false })
    .limit(maxBatch);

  if (intentsError) {
    return new Response(
      JSON.stringify({ ok: false, stage: "select_intents", error: intentsError.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const candidates = (intents ?? []) as IntentRow[];
  if (candidates.length === 0) {
    return new Response(
      JSON.stringify({ ok: true, processed: 0, results: [], lookback_hours: lookbackHours }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // Skip ones already reflected on
  const ids = candidates.map((i) => i.id);
  const { data: existing } = await supabase
    .from("internal_agent_reflections")
    .select("intent_id")
    .in("intent_id", ids);
  const reflected = new Set((existing ?? []).map((r: any) => r.intent_id));
  const toProcess = candidates.filter((i) => !reflected.has(i.id));

  const results: ReflectionResult[] = [];
  for (const intent of toProcess) {
    try {
      results.push(await reflectOnIntent(supabase, intent));
    } catch (e: any) {
      results.push({
        intent_id: intent.id,
        agent_id: intent.agent_id,
        action_class: intent.action_class,
        outcome_quality: 0,
        gate_fitness: 0,
        should_repeat: null,
        pattern_tags: ["reflection_error"],
        lesson: `reflection failed: ${e?.message ?? String(e)}`,
        recommendation: "investigate reflect handler",
        ok: false,
        error: e?.message ?? String(e),
      });
    }
  }

  const succeeded = results.filter((r) => r.ok).length;
  return new Response(
    JSON.stringify({
      ok: true,
      lookback_hours: lookbackHours,
      candidates: candidates.length,
      already_reflected: reflected.size,
      processed: results.length,
      succeeded,
      failed: results.length - succeeded,
      results,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
