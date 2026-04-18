// ═══════════════════════════════════════════════════════════════
// SITA OS — internal-agent-weekly-digest (Phase 3C)
//
// Aggregates the prior 7 days of real workforce signals into a single
// markdown digest, persisted in internal_agent_weekly_digests.
// Source agent: kc-knowledge-coordinator. Service-role only.
//
// Data sources (all real, no fake content):
//   - top error patterns      : error_patrol_detections
//   - top suggestions         : ai_implementation_suggestions
//   - top reflections         : internal_agent_reflections
//   - trust changes           : internal_agent_runtime_state (snapshot)
//   - escalations             : internal_agent_action_intents (denied/rolled_back)
//   - cost anomalies          : ai_budget_alerts
//   - consensus conflicts     : internal_agent_consensus_sessions
//
// Idempotent on (period_start, period_end).
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function startOfWeek(d: Date): Date {
  const x = new Date(d);
  const day = x.getUTCDay();
  const diff = (day + 6) % 7; // back to Monday
  x.setUTCDate(x.getUTCDate() - diff);
  x.setUTCHours(0, 0, 0, 0);
  return x;
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
  try { body = await req.json(); } catch { /* allow empty */ }

  const now = new Date();
  const periodEnd = body?.period_end ? new Date(body.period_end) : now;
  const periodStart = body?.period_start
    ? new Date(body.period_start)
    : new Date(periodEnd.getTime() - 7 * 86400_000);
  const periodStartIso = periodStart.toISOString();
  const periodEndIso = periodEnd.toISOString();

  // ── Pull real data ───────────────────────────────────────────
  const [errPats, suggs, refls, trusts, intents, alerts, conflicts] = await Promise.all([
    admin.from("error_patrol_detections")
      .select("pattern_key,subsystem,severity,frequency,status,last_seen_at")
      .gte("last_seen_at", periodStartIso)
      .order("frequency", { ascending: false })
      .limit(10),
    admin.from("ai_implementation_suggestions")
      .select("id,title,proposed_change_type,priority,status,source_council,created_at")
      .gte("created_at", periodStartIso)
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(10),
    admin.from("internal_agent_reflections")
      .select("agent_id,outcome_quality,gate_fitness_score,should_repeat,pattern_tags,lesson_learned,reflected_at")
      .gte("reflected_at", periodStartIso)
      .order("outcome_quality", { ascending: false })
      .limit(20),
    admin.from("internal_agent_runtime_state")
      .select("agent_id,trust_score,current_status,current_autonomy_level,updated_at")
      .gte("updated_at", periodStartIso)
      .order("updated_at", { ascending: false })
      .limit(50),
    admin.from("internal_agent_action_intents")
      .select("agent_id,action_class,status,denial_reason,created_at")
      .in("status", ["denied", "rolled_back", "failed"])
      .gte("created_at", periodStartIso)
      .order("created_at", { ascending: false })
      .limit(50),
    admin.from("ai_budget_alerts")
      .select("id,scope_type,scope_ref,period_class,observed_cost_usd,created_at")
      .gte("created_at", periodStartIso)
      .order("observed_cost_usd", { ascending: false })
      .limit(10),
    admin.from("internal_agent_consensus_sessions")
      .select("session_key,topic,participating_councils,resolution_summary,created_at")
      .eq("conflict_detected", true)
      .gte("created_at", periodStartIso)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const top_incidents = (errPats.data ?? []).map((p: any) => ({
    pattern: p.pattern_key, subsystem: p.subsystem, severity: p.severity,
    frequency: p.frequency, status: p.status,
  }));
  const top_suggestions = (suggs.data ?? []).map((s: any) => ({
    id: s.id, title: s.title, type: s.proposed_change_type,
    priority: s.priority, status: s.status, council: s.source_council,
  }));
  const top_cost_anomalies = (alerts.data ?? []).map((a: any) => ({
    id: a.id, scope: `${a.scope_type}/${a.scope_ref ?? "global"}`,
    period: a.period_class, observed_cost_usd: Number(a.observed_cost_usd ?? 0),
  }));
  const trust_changes = (trusts.data ?? []).map((t: any) => ({
    agent_id: t.agent_id, trust_score: Number(t.trust_score ?? 0),
    status: t.current_status, autonomy: t.current_autonomy_level,
  }));
  const escalations = (intents.data ?? []).map((i: any) => ({
    agent_id: i.agent_id, action_class: i.action_class,
    status: i.status, denial_reason: i.denial_reason,
  }));
  const consensusConflicts = (conflicts.data ?? []).map((c: any) => ({
    session_key: c.session_key, topic: c.topic, councils: c.participating_councils,
    summary: c.resolution_summary,
  }));

  // ── Build summary markdown (synthesized, prioritized) ────────
  const md: string[] = [];
  md.push(`# Internal AI Workforce — Weekly Digest`);
  md.push(``);
  md.push(`**Period:** ${periodStartIso} → ${periodEndIso}`);
  md.push(`**Generated by:** kc-knowledge-coordinator`);
  md.push(``);

  md.push(`## 1. Top error patterns`);
  if (top_incidents.length === 0) md.push(`_No new high-frequency error patterns this week._`);
  else for (const p of top_incidents) {
    md.push(`- **${p.pattern}** (${p.subsystem}, ${p.severity}) — ${p.frequency}× — ${p.status}`);
  }
  md.push(``);

  md.push(`## 2. Top implementation suggestions`);
  if (top_suggestions.length === 0) md.push(`_No new suggestions this week._`);
  else for (const s of top_suggestions) {
    md.push(`- [${s.priority}] **${s.title}** (${s.type}) — ${s.status} — ${s.council}`);
  }
  md.push(``);

  md.push(`## 3. Cost anomalies`);
  if (top_cost_anomalies.length === 0) md.push(`_No budget alerts this week._`);
  else for (const a of top_cost_anomalies) {
    md.push(`- ${a.scope} (${a.period}) — observed ≈ $${a.observed_cost_usd.toFixed(4)}`);
  }
  md.push(``);

  md.push(`## 4. Trust ladder activity`);
  if (trust_changes.length === 0) md.push(`_No agent runtime state updates this week._`);
  else {
    const top = [...trust_changes].sort((a, b) => b.trust_score - a.trust_score).slice(0, 5);
    const bot = [...trust_changes].sort((a, b) => a.trust_score - b.trust_score).slice(0, 5);
    md.push(`**Highest trust:**`);
    for (const t of top) md.push(`- \`${t.agent_id}\` — trust ${(t.trust_score * 100).toFixed(0)}% — ${t.status} — autonomy ${t.autonomy}`);
    md.push(``);
    md.push(`**Lowest trust:**`);
    for (const t of bot) md.push(`- \`${t.agent_id}\` — trust ${(t.trust_score * 100).toFixed(0)}% — ${t.status} — autonomy ${t.autonomy}`);
  }
  md.push(``);

  md.push(`## 5. Escalations & failures`);
  if (escalations.length === 0) md.push(`_No denied / failed / rolled-back intents this week._`);
  else {
    const grouped = new Map<string, number>();
    for (const e of escalations) {
      const k = `${e.agent_id} • ${e.action_class} • ${e.status}`;
      grouped.set(k, (grouped.get(k) ?? 0) + 1);
    }
    for (const [k, n] of [...grouped.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)) {
      md.push(`- ${k} — ${n}× `);
    }
  }
  md.push(``);

  md.push(`## 6. Cross-council conflicts`);
  if (consensusConflicts.length === 0) md.push(`_No consensus conflicts this week._`);
  else for (const c of consensusConflicts) {
    md.push(`- **${c.topic ?? c.session_key}** — councils: ${(c.councils ?? []).join(", ")}`);
    if (c.summary) md.push(`  - ${c.summary}`);
  }
  md.push(``);

  md.push(`---`);
  md.push(`_Counts: ${top_incidents.length} patterns • ${top_suggestions.length} suggestions • ${top_cost_anomalies.length} cost alerts • ${trust_changes.length} trust rows • ${escalations.length} escalations • ${consensusConflicts.length} conflicts_`);

  const summary_markdown = md.join("\n");

  const highlights = [
    { kind: "patterns", count: top_incidents.length },
    { kind: "suggestions", count: top_suggestions.length },
    { kind: "cost_alerts", count: top_cost_anomalies.length },
    { kind: "escalations", count: escalations.length },
    { kind: "conflicts", count: consensusConflicts.length },
  ];

  // ── Persist (idempotent on period) ───────────────────────────
  const { data: upsertRow, error: upsertErr } = await admin
    .from("internal_agent_weekly_digests")
    .upsert({
      period_start: periodStartIso,
      period_end: periodEndIso,
      generated_by: "kc-knowledge-coordinator",
      summary_markdown,
      highlights,
      top_incidents,
      top_suggestions,
      top_cost_anomalies,
      trust_changes,
      escalations,
      evidence_refs: [
        { kind: "consensus_conflicts", count: consensusConflicts.length },
      ],
      delivery_state: "persisted",
    }, { onConflict: "period_start,period_end" })
    .select("id")
    .single();

  if (upsertErr) {
    return jsonResponse({ ok: false, error: upsertErr.message }, 500);
  }

  return jsonResponse({
    ok: true,
    digest_id: upsertRow?.id,
    period_start: periodStartIso,
    period_end: periodEndIso,
    counts: {
      patterns: top_incidents.length,
      suggestions: top_suggestions.length,
      cost_alerts: top_cost_anomalies.length,
      trust_rows: trust_changes.length,
      escalations: escalations.length,
      conflicts: consensusConflicts.length,
    },
  });
});
