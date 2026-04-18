// ═══════════════════════════════════════════════════════════════
// SITA OS — internal-agent-suggestion-generator (Phase 3B)
//
// Reads canonical signals already in the DB and emits implementation
// suggestions via the propose_implementation_suggestion RPC.
// Every suggestion is keyed by (source_signal_type, source_signal_ref)
// — re-running the generator never produces duplicates.
//
// Real signal sources (no fake content, no static seeds):
//   - drift            : open error_patrol_detections, frequency >= 5
//   - repeated_failure : agents with >= 3 reflections, should_repeat=false,
//                        same pattern_tag (≥ 2 occurrences of the tag)
//   - cost_anomaly     : ai_budget_alerts in last 7d, scope-keyed
//   - cross_council    : internal_agent_consensus_sessions w/ conflict_detected
//   - policy_drift     : internal_agent_policy_drafts in pending_review > 14d
//
// Service-role only. Returns counts of suggestions proposed per source.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenResult {
  source: string;
  proposed: number;
  skipped: number;
  errors: number;
  details: Array<{ signal_ref: string; suggestion_id?: string; error?: string }>;
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function callPropose(
  admin: any,
  args: {
    source_agent_id: string;
    source_council: string;
    source_signal_type: string;
    source_signal_ref: string;
    title: string;
    summary: string;
    rationale: string;
    evidence_refs: any[];
    proposed_change_type:
      | "reliability"
      | "governance"
      | "cost"
      | "security"
      | "dependency_upgrade"
      | "ops"
      | "ux"
      | "refactor"
      | "new_feature";
    estimated_effort: "xs" | "s" | "m" | "l" | "xl" | "unknown";
    expected_value: "low" | "medium" | "high" | "critical" | "unknown";
    priority: "low" | "normal" | "high" | "urgent";
  },
): Promise<{ id?: string; error?: string }> {
  const { data, error } = await admin.rpc("propose_implementation_suggestion", {
    p_source_agent_id: args.source_agent_id,
    p_source_council: args.source_council,
    p_source_signal_type: args.source_signal_type,
    p_source_signal_ref: args.source_signal_ref,
    p_title: args.title,
    p_summary: args.summary,
    p_rationale: args.rationale,
    p_evidence_refs: args.evidence_refs,
    p_proposed_change_type: args.proposed_change_type,
    p_estimated_effort: args.estimated_effort,
    p_expected_value: args.expected_value,
    p_priority: args.priority,
  });
  if (error) return { error: error.message };
  return { id: data as string };
}

// ── Generator: drift (error_patrol_detections) ────────────────
async function generateDriftSuggestions(admin: any): Promise<GenResult> {
  const result: GenResult = { source: "drift", proposed: 0, skipped: 0, errors: 0, details: [] };
  const { data: patterns, error } = await admin
    .from("error_patrol_detections")
    .select("pattern_key,subsystem,severity,frequency,first_seen_at,last_seen_at,follow_up_recommendation")
    .in("status", ["open", "acknowledged"])
    .gte("frequency", 5)
    .order("frequency", { ascending: false })
    .limit(50);
  if (error) {
    result.errors++;
    result.details.push({ signal_ref: "<query>", error: error.message });
    return result;
  }
  for (const p of patterns ?? []) {
    const ref = `error-pattern:${p.pattern_key}`;
    const priority = p.severity === "critical" ? "urgent" : p.severity === "high" ? "high" : "normal";
    const r = await callPropose(admin, {
      source_agent_id: "ro-incident-response",
      source_council: "reliability-ops",
      source_signal_type: "error_pattern",
      source_signal_ref: ref,
      title: `Recurring error pattern in ${p.subsystem}: ${p.pattern_key}`,
      summary: `Pattern "${p.pattern_key}" has fired ${p.frequency}× in ${p.subsystem}. Recommend a structural fix or guard.`,
      rationale: p.follow_up_recommendation
        ? `Operator follow-up recommendation: ${p.follow_up_recommendation}`
        : `High-frequency error pattern (${p.frequency} occurrences) suggests a systemic gap.`,
      evidence_refs: [
        { kind: "error_patrol_detection", pattern_key: p.pattern_key, frequency: p.frequency, subsystem: p.subsystem },
      ],
      proposed_change_type: "reliability",
      estimated_effort: p.frequency > 50 ? "m" : "s",
      expected_value: p.severity === "critical" ? "critical" : "high",
      priority,
    });
    if (r.error) { result.errors++; result.details.push({ signal_ref: ref, error: r.error }); }
    else { result.proposed++; result.details.push({ signal_ref: ref, suggestion_id: r.id }); }
  }
  return result;
}

// ── Generator: repeated_failure (reflections) ─────────────────
async function generateRepeatedFailureSuggestions(admin: any): Promise<GenResult> {
  const result: GenResult = { source: "repeated_failure", proposed: 0, skipped: 0, errors: 0, details: [] };
  // Pull recent should_repeat=false reflections (last 30 days)
  const since = new Date(Date.now() - 30 * 86400_000).toISOString();
  const { data: refls, error } = await admin
    .from("internal_agent_reflections")
    .select("agent_id,pattern_tags,lesson_learned,reflected_at")
    .eq("should_repeat", false)
    .gte("reflected_at", since)
    .limit(500);
  if (error) {
    result.errors++;
    result.details.push({ signal_ref: "<query>", error: error.message });
    return result;
  }
  // Aggregate by (agent_id, tag)
  const agg = new Map<string, { agent_id: string; tag: string; count: number; lessons: Set<string> }>();
  for (const r of refls ?? []) {
    const tags: string[] = Array.isArray(r.pattern_tags) ? r.pattern_tags : [];
    for (const tag of tags) {
      const key = `${r.agent_id}::${tag}`;
      const cur = agg.get(key) ?? { agent_id: r.agent_id, tag, count: 0, lessons: new Set<string>() };
      cur.count++;
      if (r.lesson_learned) cur.lessons.add(String(r.lesson_learned).slice(0, 200));
      agg.set(key, cur);
    }
  }
  for (const [, entry] of agg) {
    if (entry.count < 3) continue; // require >= 3 occurrences
    const ref = `repeated-failure:${entry.agent_id}:${entry.tag}`;
    const r = await callPropose(admin, {
      source_agent_id: entry.agent_id,
      source_council: "knowledge-coordination",
      source_signal_type: "repeated_failure",
      source_signal_ref: ref,
      title: `Agent ${entry.agent_id} repeatedly avoids pattern: ${entry.tag}`,
      summary: `${entry.count} recent reflections marked should_repeat=false with tag "${entry.tag}".`,
      rationale: `Sustained avoid signal indicates a missing guard, an autonomy mismatch, or a missing rollback path. Lessons captured:\n- ${[...entry.lessons].slice(0, 5).join("\n- ")}`,
      evidence_refs: [{ kind: "reflection_aggregate", agent_id: entry.agent_id, tag: entry.tag, count: entry.count }],
      proposed_change_type: "governance",
      estimated_effort: "s",
      expected_value: "high",
      priority: entry.count >= 10 ? "high" : "normal",
    });
    if (r.error) { result.errors++; result.details.push({ signal_ref: ref, error: r.error }); }
    else { result.proposed++; result.details.push({ signal_ref: ref, suggestion_id: r.id }); }
  }
  return result;
}

// ── Generator: cost_anomaly (ai_budget_alerts) ────────────────
async function generateCostAnomalySuggestions(admin: any): Promise<GenResult> {
  const result: GenResult = { source: "cost_anomaly", proposed: 0, skipped: 0, errors: 0, details: [] };
  const since = new Date(Date.now() - 7 * 86400_000).toISOString();
  const { data: alerts, error } = await admin
    .from("ai_budget_alerts")
    .select("id,scope_type,scope_ref,period_class,threshold_percent,observed_cost_usd,alert_state,created_at")
    .gte("created_at", since)
    .in("alert_state", ["triggered", "active", "open"])
    .order("observed_cost_usd", { ascending: false })
    .limit(50);
  if (error) {
    // Tolerate enum diff: try without alert_state filter
    const fallback = await admin
      .from("ai_budget_alerts")
      .select("id,scope_type,scope_ref,period_class,threshold_percent,observed_cost_usd,alert_state,created_at")
      .gte("created_at", since)
      .order("observed_cost_usd", { ascending: false })
      .limit(50);
    if (fallback.error) {
      result.errors++;
      result.details.push({ signal_ref: "<query>", error: fallback.error.message });
      return result;
    }
    (alerts as any) = fallback.data;
  }
  for (const a of alerts ?? []) {
    const ref = `budget-alert:${a.id}`;
    const cost = Number(a.observed_cost_usd ?? 0);
    const r = await callPropose(admin, {
      source_agent_id: "rc-cost-sentinel",
      source_council: "runtime-cost",
      source_signal_type: "cost_anomaly",
      source_signal_ref: ref,
      title: `Budget alert on ${a.scope_type}/${a.scope_ref ?? "global"} (${a.period_class})`,
      summary: `Threshold ${a.threshold_percent ?? "?"}% reached. Observed cost ≈ $${cost.toFixed(4)}.`,
      rationale: `Recommend reviewing routing policy, fallback chain, or capability budget class to bring spend within target.`,
      evidence_refs: [
        { kind: "ai_budget_alert", id: a.id, scope_type: a.scope_type, scope_ref: a.scope_ref, observed_cost_usd: cost },
      ],
      proposed_change_type: "cost",
      estimated_effort: "s",
      expected_value: cost > 5 ? "high" : "medium",
      priority: cost > 5 ? "high" : "normal",
    });
    if (r.error) { result.errors++; result.details.push({ signal_ref: ref, error: r.error }); }
    else { result.proposed++; result.details.push({ signal_ref: ref, suggestion_id: r.id }); }
  }
  return result;
}

// ── Generator: cross_council (consensus conflicts) ────────────
async function generateConsensusConflictSuggestions(admin: any): Promise<GenResult> {
  const result: GenResult = { source: "cross_council", proposed: 0, skipped: 0, errors: 0, details: [] };
  const since = new Date(Date.now() - 30 * 86400_000).toISOString();
  const { data: sessions, error } = await admin
    .from("internal_agent_consensus_sessions")
    .select("id,session_key,topic,participating_councils,resolution_summary,conflict_detected,resolved_at,created_at")
    .eq("conflict_detected", true)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) {
    result.errors++;
    result.details.push({ signal_ref: "<query>", error: error.message });
    return result;
  }
  for (const s of sessions ?? []) {
    const ref = `consensus-conflict:${s.session_key ?? s.id}`;
    const r = await callPropose(admin, {
      source_agent_id: "kc-knowledge-coordinator",
      source_council: "knowledge-coordination",
      source_signal_type: "cross_council_conflict",
      source_signal_ref: ref,
      title: `Cross-council disagreement: ${s.topic ?? s.session_key}`,
      summary: s.resolution_summary ?? "Quorum not reached / explicit conflict among councils.",
      rationale: `Participating councils: ${(s.participating_councils ?? []).join(", ")}. Recommend a governance review to clarify ownership or update the policy that drove disagreement.`,
      evidence_refs: [{ kind: "consensus_session", id: s.id, session_key: s.session_key }],
      proposed_change_type: "governance",
      estimated_effort: "m",
      expected_value: "high",
      priority: "high",
    });
    if (r.error) { result.errors++; result.details.push({ signal_ref: ref, error: r.error }); }
    else { result.proposed++; result.details.push({ signal_ref: ref, suggestion_id: r.id }); }
  }
  return result;
}

// ── Generator: policy_drift (stale policy drafts) ─────────────
async function generatePolicyDriftSuggestions(admin: any): Promise<GenResult> {
  const result: GenResult = { source: "policy_drift", proposed: 0, skipped: 0, errors: 0, details: [] };
  const cutoff = new Date(Date.now() - 14 * 86400_000).toISOString();
  const { data: drafts, error } = await admin
    .from("internal_agent_policy_drafts")
    .select("id,draft_kind,risk_assessment,title,created_at")
    .eq("status", "pending_review")
    .lt("created_at", cutoff)
    .order("created_at", { ascending: true })
    .limit(50);
  if (error) {
    result.errors++;
    result.details.push({ signal_ref: "<query>", error: error.message });
    return result;
  }
  for (const d of drafts ?? []) {
    const ref = `policy-drift:${d.id}`;
    const ageDays = Math.round((Date.now() - new Date(d.created_at).getTime()) / 86400_000);
    const r = await callPropose(admin, {
      source_agent_id: "ar-policy-architect",
      source_council: "architecture-governance",
      source_signal_type: "policy_drift",
      source_signal_ref: ref,
      title: `Stale policy draft (${ageDays}d): ${d.title ?? d.draft_kind}`,
      summary: `Draft has been pending review for ${ageDays} days. Risk: ${d.risk_assessment ?? "unknown"}.`,
      rationale: `Long-pending policy drafts indicate governance backpressure. Decide, archive, or supersede to prevent silent acceptance.`,
      evidence_refs: [{ kind: "policy_draft", id: d.id, age_days: ageDays }],
      proposed_change_type: "governance",
      estimated_effort: "xs",
      expected_value: d.risk_assessment === "critical" ? "critical" : "medium",
      priority: d.risk_assessment === "critical" ? "urgent" : ageDays > 30 ? "high" : "normal",
    });
    if (r.error) { result.errors++; result.details.push({ signal_ref: ref, error: r.error }); }
    else { result.proposed++; result.details.push({ signal_ref: ref, suggestion_id: r.id }); }
  }
  return result;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!SUPABASE_URL || !SERVICE_KEY) {
    return jsonResponse({ ok: false, error: "missing service-role env" }, 500);
  }
  const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

  let body: any = {};
  try { body = await req.json(); } catch { /* allow empty body */ }
  const sources: string[] = Array.isArray(body?.sources) && body.sources.length > 0
    ? body.sources
    : ["drift", "repeated_failure", "cost_anomaly", "cross_council", "policy_drift"];

  const results: GenResult[] = [];
  if (sources.includes("drift")) results.push(await generateDriftSuggestions(admin));
  if (sources.includes("repeated_failure")) results.push(await generateRepeatedFailureSuggestions(admin));
  if (sources.includes("cost_anomaly")) results.push(await generateCostAnomalySuggestions(admin));
  if (sources.includes("cross_council")) results.push(await generateConsensusConflictSuggestions(admin));
  if (sources.includes("policy_drift")) results.push(await generatePolicyDriftSuggestions(admin));

  const totalProposed = results.reduce((a, r) => a + r.proposed, 0);
  const totalErrors = results.reduce((a, r) => a + r.errors, 0);

  return jsonResponse({
    ok: totalErrors === 0,
    proposed: totalProposed,
    errors: totalErrors,
    sources_run: results.map((r) => r.source),
    results,
    generated_at: new Date().toISOString(),
  });
});
