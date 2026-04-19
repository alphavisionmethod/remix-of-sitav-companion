// Phase 4 — Security Council scheduled tick
// Runs all 7 security agents on real signals, persists structured findings,
// and routes high-value policy/security gaps to Phase 3 implementation suggestions.
// NEVER applies policy changes, NEVER arms kill switches, NEVER rotates secrets directly.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Severity = "low" | "medium" | "high" | "critical";

interface Finding {
  agentId: string;
  findingType: string;
  severity: Severity;
  title: string;
  summary: string;
  evidence: Record<string, unknown>;
  sourceSignalType: string;
  sourceSignalRef: string;
  routeToSuggestion?: { changeType: string; rationale: string; priority: "low" | "normal" | "high" | "urgent" };
}

const SECURITY_AGENTS = [
  "st-security-monitor",
  "st-permission-drift",
  "st-policy-review",
  "st-trust-threshold",
  "st-fraud-abuse",
  "st-audit-completeness",
  "st-privacy-boundary",
] as const;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  const allFindings: Finding[] = [];
  const errors: Array<{ agent: string; error: string }> = [];

  for (const agentId of SECURITY_AGENTS) {
    try {
      const findings = await runAgent(supabase, agentId);
      allFindings.push(...findings);
    } catch (err) {
      errors.push({ agent: agentId, error: err instanceof Error ? err.message : String(err) });
    }
  }

  const persisted: Array<{ id: string; agentId: string }> = [];
  const routed: string[] = [];

  for (const f of allFindings) {
    const { data: findingId, error } = await supabase.rpc("record_security_finding", {
      _agent_id: f.agentId,
      _finding_type: f.findingType,
      _severity: f.severity,
      _title: f.title,
      _summary: f.summary,
      _evidence: f.evidence,
      _source_signal_type: f.sourceSignalType,
      _source_signal_ref: f.sourceSignalRef,
    });
    if (error) {
      errors.push({ agent: f.agentId, error: `record_security_finding: ${error.message}` });
      continue;
    }
    persisted.push({ id: findingId as string, agentId: f.agentId });

    // Route high-severity findings to Phase 3 implementation suggestions (drafts only)
    if (f.routeToSuggestion && (f.severity === "high" || f.severity === "critical")) {
      const { data: suggestionId, error: sErr } = await supabase.rpc(
        "propose_implementation_suggestion",
        {
          p_source_agent_id: f.agentId,
          p_source_council: "security-trust",
          p_source_signal_type: `security_finding:${f.findingType}`,
          p_source_signal_ref: f.sourceSignalRef,
          p_title: f.title,
          p_summary: f.summary,
          p_rationale: f.routeToSuggestion.rationale,
          p_evidence_refs: [{ kind: "security_finding", id: findingId, agent: f.agentId }],
          p_proposed_change_type: f.routeToSuggestion.changeType,
          p_estimated_effort: "unknown",
          p_expected_value: f.severity === "critical" ? "critical" : "high",
          p_priority: f.routeToSuggestion.priority,
        },
      );
      if (!sErr && suggestionId) {
        routed.push(suggestionId as string);
      }
    }
  }

  return new Response(
    JSON.stringify({
      ok: true,
      agents_run: SECURITY_AGENTS.length,
      findings_produced: allFindings.length,
      findings_persisted: persisted.length,
      suggestions_routed: routed.length,
      errors,
      generated_at: new Date().toISOString(),
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});

// ───────────────────────────────────────────────────────────
// Per-agent observation logic
// ───────────────────────────────────────────────────────────
async function runAgent(supabase: any, agentId: string): Promise<Finding[]> {
  switch (agentId) {
    case "st-security-monitor":
      return await runSecurityMonitor(supabase);
    case "st-permission-drift":
      return await runPermissionDrift(supabase);
    case "st-policy-review":
      return await runPolicyReview(supabase);
    case "st-trust-threshold":
      return await runTrustThreshold(supabase);
    case "st-fraud-abuse":
      return await runFraudAbuse(supabase);
    case "st-audit-completeness":
      return await runAuditCompleteness(supabase);
    case "st-privacy-boundary":
      return await runPrivacyBoundary(supabase);
    default:
      return [];
  }
}

// st-security-monitor — anomalous high/critical admin actions in last hour
async function runSecurityMonitor(supabase: any): Promise<Finding[]> {
  const { data, error } = await supabase
    .from("admin_action_audit")
    .select("id, action, severity, actor_user_id, created_at, plane, target_type")
    .gte("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString())
    .in("severity", ["high", "critical"])
    .order("created_at", { ascending: false })
    .limit(50);
  if (error || !data) return [];
  return data.map((row: any) => ({
    agentId: "st-security-monitor",
    findingType: "high_severity_admin_action",
    severity: row.severity === "critical" ? ("critical" as const) : ("high" as const),
    title: `High-severity admin action: ${row.action}`,
    summary: `Plane=${row.plane} target=${row.target_type ?? "n/a"} actor=${row.actor_user_id}`,
    evidence: { audit_id: row.id, action: row.action, plane: row.plane, created_at: row.created_at },
    sourceSignalType: "admin_audit",
    sourceSignalRef: `admin_audit:${row.id}`,
  }));
}

// st-permission-drift — newly assigned admin roles in last 24h
async function runPermissionDrift(supabase: any): Promise<Finding[]> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("id, user_id, role, created_at")
    .eq("role", "admin")
    .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .order("created_at", { ascending: false })
    .limit(20);
  if (error || !data) return [];
  return data.map((row: any) => ({
    agentId: "st-permission-drift",
    findingType: "new_admin_role_grant",
    severity: "medium" as const,
    title: `New admin role granted to user ${row.user_id}`,
    summary: `Role assignment created at ${row.created_at}; verify intentional`,
    evidence: { user_role_id: row.id, user_id: row.user_id, role: row.role, created_at: row.created_at },
    sourceSignalType: "user_role_grant",
    sourceSignalRef: `user_role:${row.id}`,
  }));
}

// st-policy-review — RLS-enabled tables with no policies (governance gap)
async function runPolicyReview(supabase: any): Promise<Finding[]> {
  const { data, error } = await supabase.rpc("get_db_truth_snapshot", { _op: "drift" });
  if (error || !data) return [];
  const rlsNoPolicies = (data.rls_enabled_no_policies ?? []) as string[];
  return rlsNoPolicies.slice(0, 20).map((tableName) => ({
    agentId: "st-policy-review",
    findingType: "rls_enabled_without_policies",
    severity: "high" as const,
    title: `Table ${tableName} has RLS enabled but no policies`,
    summary: `Effectively denies all access — likely policy gap or misconfiguration`,
    evidence: { table: tableName, drift_type: "rls_enabled_no_policies" },
    sourceSignalType: "rls_drift",
    sourceSignalRef: `rls_drift:${tableName}`,
    routeToSuggestion: {
      changeType: "security",
      rationale: `Table ${tableName} has Row Level Security enabled but no policies are defined. This either denies all access or signals a configuration error. A policy review and proposal draft should be created via internal-agent-policy-architect.`,
      priority: "high" as const,
    },
  }));
}

// st-trust-threshold — agents with very low trust scores
async function runTrustThreshold(supabase: any): Promise<Finding[]> {
  const { data, error } = await supabase
    .from("internal_agent_runtime_state")
    .select("agent_id, trust_score, current_status")
    .lt("trust_score", 0.3)
    .order("trust_score", { ascending: true })
    .limit(20);
  if (error || !data) return [];
  return data.map((row: any) => ({
    agentId: "st-trust-threshold",
    findingType: "agent_trust_below_threshold",
    severity: row.trust_score < 0.15 ? ("high" as const) : ("medium" as const),
    title: `Agent ${row.agent_id} trust score ${row.trust_score.toFixed(2)} below 0.30`,
    summary: `Sustained low trust — consider autonomy demotion or human review`,
    evidence: { agent_id: row.agent_id, trust_score: row.trust_score, status: row.current_status },
    sourceSignalType: "trust_threshold_breach",
    sourceSignalRef: `trust_breach:${row.agent_id}`,
  }));
}

// st-fraud-abuse — repeated failed admin actions from same actor in last hour
async function runFraudAbuse(supabase: any): Promise<Finding[]> {
  const { data, error } = await supabase
    .from("admin_action_audit")
    .select("actor_user_id, action, created_at")
    .gte("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString())
    .order("created_at", { ascending: false })
    .limit(500);
  if (error || !data) return [];
  const counts = new Map<string, number>();
  for (const row of data) {
    const k = `${row.actor_user_id}:${row.action}`;
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const findings: Finding[] = [];
  for (const [key, count] of counts.entries()) {
    if (count >= 25) {
      const [actor, action] = key.split(":");
      findings.push({
        agentId: "st-fraud-abuse",
        findingType: "repeated_admin_action_burst",
        severity: count >= 100 ? "critical" : "high",
        title: `${count}× '${action}' by user ${actor} in last hour`,
        summary: `Burst pattern exceeds threshold — possible automation misuse or abuse`,
        evidence: { actor_user_id: actor, action, count_last_hour: count },
        sourceSignalType: "action_burst",
        sourceSignalRef: `burst:${actor}:${action}:${new Date().toISOString().slice(0, 13)}`,
      });
    }
  }
  return findings;
}

// st-audit-completeness — count action receipts vs invocations in last 24h
async function runAuditCompleteness(supabase: any): Promise<Finding[]> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: invocationCount } = await supabase
    .from("ai_invocations")
    .select("id", { count: "exact", head: true })
    .gte("created_at", since)
    .eq("status", "success");
  const { count: receiptCount } = await supabase
    .from("ai_inference_receipts")
    .select("id", { count: "exact", head: true })
    .gte("created_at", since);
  if (invocationCount == null || receiptCount == null) return [];
  if (invocationCount < 10) return [];
  const coverage = receiptCount / invocationCount;
  if (coverage >= 0.95) return [];
  return [{
    agentId: "st-audit-completeness",
    findingType: "receipt_coverage_gap",
    severity: coverage < 0.5 ? ("high" as const) : ("medium" as const),
    title: `AI receipt coverage at ${(coverage * 100).toFixed(1)}% over 24h`,
    summary: `${receiptCount} receipts for ${invocationCount} successful invocations — investigate missing receipt emission`,
    evidence: { invocations_24h: invocationCount, receipts_24h: receiptCount, coverage },
    sourceSignalType: "receipt_coverage",
    sourceSignalRef: `receipt_coverage:${new Date().toISOString().slice(0, 10)}`,
    routeToSuggestion: coverage < 0.5
      ? { changeType: "ops", rationale: "AI inference receipt coverage has fallen below 50% over the last 24 hours. Audit/compliance posture is degraded. Investigate which capability paths are not emitting receipts.", priority: "high" as const }
      : undefined,
  }];
}

// st-privacy-boundary — service-role updates with no actor on tenant-scoped tables
async function runPrivacyBoundary(supabase: any): Promise<Finding[]> {
  const { data, error } = await supabase
    .from("admin_action_audit")
    .select("id, action, target_type, target_id, actor_user_id, created_at, metadata")
    .gte("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString())
    .ilike("action", "%cross_tenant%")
    .limit(20);
  if (error || !data) return [];
  return data.map((row: any) => ({
    agentId: "st-privacy-boundary",
    findingType: "cross_tenant_action_observed",
    severity: "high" as const,
    title: `Cross-tenant action: ${row.action}`,
    summary: `Target ${row.target_type}/${row.target_id} — verify tenancy boundary respected`,
    evidence: { audit_id: row.id, action: row.action, target_type: row.target_type, actor: row.actor_user_id },
    sourceSignalType: "cross_tenant_audit",
    sourceSignalRef: `cross_tenant:${row.id}`,
  }));
}
