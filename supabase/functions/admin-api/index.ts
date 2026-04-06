import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { handleCors, corsHeaders, corsResponse, corsError } from "../_shared/cors.ts";
import { EdgeLogger } from "../_shared/logger.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";
import { z } from "https://esm.sh/zod@3.23.8";

// ── Enhanced Audit log helper ──
async function createAuditLog(
  supabase: any,
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string | null,
  result: "success" | "failure",
  changes?: Record<string, unknown>,
  req?: Request
) {
  try {
    await supabase.from("audit_logs").insert({
      actor_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      result,
      changes: changes || {},
      ip_address: req?.headers.get("x-forwarded-for") || req?.headers.get("cf-connecting-ip") || "unknown",
      user_agent: req?.headers.get("user-agent") || "unknown",
      correlation_id: req?.headers.get("x-correlation-id") || crypto.randomUUID(),
    });
  } catch (e) {
    console.error("Audit log error:", e);
  }
}

// Helper: parse endpoint + sub-resource from URL or body
function parseEndpoint(req: Request, body: Record<string, unknown>): { endpoint: string; subId: string | null; subAction: string | null } {
  const headerEndpoint = req.headers.get("x-admin-endpoint") || "";
  const bodyEndpoint = (body._endpoint as string) || "";
  const raw = headerEndpoint.split("?")[0] || bodyEndpoint;

  // Pattern: "incidents/{id}/acknowledge" or "policies/{id}"
  const parts = raw.split("/").filter(Boolean);
  if (parts.length === 3) return { endpoint: parts[0], subId: parts[1], subAction: parts[2] };
  if (parts.length === 2) return { endpoint: parts[0], subId: parts[1], subAction: null };
  return { endpoint: parts[0] || "", subId: null, subAction: null };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;

    // ── Auth check ──
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUser = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const url = new URL(req.url);
    const method = req.method;
    let body: Record<string, unknown> = {};
    if (method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE") {
      try { body = await req.json(); } catch { body = {}; }
    }

    const { endpoint, subId, subAction } = parseEndpoint(req, body);
    const days = parseInt(url.searchParams.get("days") || "7");
    const since = new Date(Date.now() - days * 86400000).toISOString();

    let result: unknown;

    // ══════════════════════════════════════════════
    // INCIDENTS
    // ══════════════════════════════════════════════
    if (endpoint === "incidents" && !subId && method === "GET") {
      const status = url.searchParams.get("status");
      const severity = url.searchParams.get("severity");
      let query = supabase.from("incidents").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100);
      if (status) query = query.eq("status", status);
      if (severity) query = query.eq("severity", severity);
      const { data, error } = await query;
      if (error) throw error;
      result = {
        incidents: data || [],
        summary: {
          total: data?.length || 0,
          open: data?.filter((i: any) => i.status === "open").length || 0,
          acknowledged: data?.filter((i: any) => i.status === "acknowledged").length || 0,
          resolved: data?.filter((i: any) => i.status === "resolved").length || 0,
        },
      };
    }
    else if (endpoint === "incidents" && !subId && method === "POST") {
      const { title, severity, impact, description } = body as any;
      if (!title || !severity) {
        return new Response(JSON.stringify({ error: "title and severity required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const incident = {
        title, severity, impact: impact || "", description: description || "",
        status: "open", user_id: user.id,
        timeline: [{ action: "created", actor: user.id, timestamp: new Date().toISOString() }],
      };
      const { data, error } = await supabase.from("incidents").insert(incident).select().single();
      if (error) throw error;
      await createAuditLog(supabase, user.id, "incident.created", "incident", data.id, "success", incident, req);
      result = data;
    }
    else if (endpoint === "incidents" && subId && !subAction && method === "GET") {
      const { data, error } = await supabase.from("incidents").select("*").eq("id", subId).eq("user_id", user.id).single();
      if (error) throw error;
      result = data;
    }
    else if (endpoint === "incidents" && subId && !subAction && method === "PUT") {
      const { data: before } = await supabase.from("incidents").select("*").eq("id", subId).eq("user_id", user.id).single();
      const { title, severity, impact, description, status: newStatus, assigned_to } = body as any;
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (title) updates.title = title;
      if (severity) updates.severity = severity;
      if (impact !== undefined) updates.impact = impact;
      if (description !== undefined) updates.description = description;
      if (newStatus) updates.status = newStatus;
      if (assigned_to !== undefined) updates.assigned_to = assigned_to;
      const { data, error } = await supabase.from("incidents").update(updates).eq("id", subId).eq("user_id", user.id).select().single();
      if (error) throw error;
      await createAuditLog(supabase, user.id, "incident.updated", "incident", subId, "success", { before, after: data }, req);
      result = data;
    }
    else if (endpoint === "incidents" && subId && !subAction && method === "DELETE") {
      const { error } = await supabase.from("incidents").delete().eq("id", subId).eq("user_id", user.id);
      if (error) throw error;
      await createAuditLog(supabase, user.id, "incident.deleted", "incident", subId, "success", {}, req);
      result = { deleted: true };
    }
    else if (endpoint === "incidents" && subId && subAction === "acknowledge") {
      const { data: incident, error: fetchError } = await supabase.from("incidents").select("*").eq("id", subId).eq("user_id", user.id).single();
      if (fetchError || !incident) return new Response(JSON.stringify({ error: "Incident not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const timeline = [...(incident.timeline || []), { action: "acknowledged", actor: user.id, timestamp: new Date().toISOString() }];
      const { data, error } = await supabase.from("incidents").update({ status: "acknowledged", acknowledged_at: new Date().toISOString(), assigned_to: user.id, timeline }).eq("id", subId).select().single();
      if (error) throw error;
      await createAuditLog(supabase, user.id, "incident.acknowledged", "incident", subId, "success", { before: { status: incident.status }, after: { status: "acknowledged" } }, req);
      result = data;
    }
    else if (endpoint === "incidents" && subId && subAction === "resolve") {
      const { root_cause, notes } = body as any;
      const { data: incident, error: fetchError } = await supabase.from("incidents").select("*").eq("id", subId).eq("user_id", user.id).single();
      if (fetchError || !incident) return new Response(JSON.stringify({ error: "Incident not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const timeline = [...(incident.timeline || []), { action: "resolved", actor: user.id, timestamp: new Date().toISOString(), notes }];
      const { data, error } = await supabase.from("incidents").update({ status: "resolved", resolved_at: new Date().toISOString(), root_cause: root_cause || "", timeline }).eq("id", subId).select().single();
      if (error) throw error;
      await createAuditLog(supabase, user.id, "incident.resolved", "incident", subId, "success", { root_cause, notes, before: { status: incident.status }, after: { status: "resolved" } }, req);
      result = data;
    }

    // ══════════════════════════════════════════════
    // POLICIES
    // ══════════════════════════════════════════════
    else if (endpoint === "policies" && !subId && method === "GET") {
      const domain = url.searchParams.get("domain");
      let query = supabase.from("policies").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (domain) query = query.eq("category", domain);
      const { data, error } = await query;
      if (error) throw error;
      result = {
        policies: data || [],
        summary: {
          total: data?.length || 0,
          active: data?.filter((p: any) => p.active).length || 0,
          require_approval: data?.filter((p: any) => p.approval_required).length || 0,
        },
      };
    }
    else if (endpoint === "policies" && !subId && method === "POST") {
      const { name, category, conditions, actions, approval_required, active } = body as any;
      if (!name || !category) return new Response(JSON.stringify({ error: "name and category required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const policy = { name, category, conditions: conditions || {}, actions: actions || {}, approval_required: approval_required ?? false, active: active ?? true, user_id: user.id };
      const { data, error } = await supabase.from("policies").insert(policy).select().single();
      if (error) throw error;
      await createAuditLog(supabase, user.id, "policy.created", "policy", data.id, "success", policy, req);
      result = data;
    }
    else if (endpoint === "policies" && subId && !subAction && method === "GET") {
      const { data, error } = await supabase.from("policies").select("*").eq("id", subId).eq("user_id", user.id).single();
      if (error) throw error;
      result = data;
    }
    else if (endpoint === "policies" && subId && !subAction && method === "PUT") {
      const { data: before } = await supabase.from("policies").select("*").eq("id", subId).eq("user_id", user.id).single();
      const { name, category, conditions, actions, approval_required, active, description } = body as any;
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (name) updates.name = name;
      if (category) updates.category = category;
      if (conditions !== undefined) updates.conditions = conditions;
      if (actions !== undefined) updates.actions = actions;
      if (approval_required !== undefined) updates.approval_required = approval_required;
      if (active !== undefined) updates.active = active;
      if (description !== undefined) updates.description = description;
      const { data, error } = await supabase.from("policies").update(updates).eq("id", subId).eq("user_id", user.id).select().single();
      if (error) throw error;
      await createAuditLog(supabase, user.id, "policy.updated", "policy", subId, "success", { before, after: data }, req);
      result = data;
    }
    else if (endpoint === "policies" && subId && !subAction && method === "DELETE") {
      const { error } = await supabase.from("policies").delete().eq("id", subId).eq("user_id", user.id);
      if (error) throw error;
      await createAuditLog(supabase, user.id, "policy.deleted", "policy", subId, "success", {}, req);
      result = { deleted: true };
    }
    else if (endpoint === "simulate" && method === "POST") {
      const { domain, action: simAction, amount, context: simContext } = body as any;
      const { data: policies } = await supabase.from("policies").select("*").eq("user_id", user.id).eq("active", true);
      const matchingPolicies = (policies || []).filter((p: any) => !domain || p.category === domain);
      const results = matchingPolicies.map((p: any) => {
        const conditions = p.conditions || {};
        let effect: "allow" | "deny" | "require_approval" = "allow";
        const reasons: string[] = [];
        if (p.approval_required) { effect = "require_approval"; reasons.push(`Policy "${p.name}" requires approval`); }
        if (conditions.max_amount && amount && amount > conditions.max_amount) { effect = "deny"; reasons.push(`Amount $${amount} exceeds max $${conditions.max_amount}`); }
        if (conditions.blocked_actions && conditions.blocked_actions.includes(simAction)) { effect = "deny"; reasons.push(`Action "${simAction}" is blocked by policy "${p.name}"`); }
        return { policy_id: p.id, policy_name: p.name, effect, reasons, category: p.category };
      });
      const finalEffect = results.some((r: any) => r.effect === "deny") ? "deny" : results.some((r: any) => r.effect === "require_approval") ? "require_approval" : "allow";
      result = { simulation: { input: { domain, action: simAction, amount, context: simContext }, final_effect: finalEffect, evaluated_policies: results.length, results, timestamp: new Date().toISOString() } };
    }

    // ══════════════════════════════════════════════
    // AUDIT LOGS
    // ══════════════════════════════════════════════
    else if (endpoint === "audit-logs" && method === "GET") {
      const action = url.searchParams.get("action");
      const limit = parseInt(url.searchParams.get("limit") || "100");
      const offset = parseInt(url.searchParams.get("offset") || "0");
      let query = supabase.from("audit_logs").select("*").eq("actor_id", user.id).order("created_at", { ascending: false }).range(offset, offset + limit - 1);
      if (action) query = query.ilike("action", `%${action}%`);
      const { data, error } = await query;
      if (error) throw error;
      result = { logs: data || [], total: data?.length || 0, offset, limit };
    }
    else if (endpoint === "audit-export" && method === "POST") {
      const { start_date, end_date } = body as any;
      const startFilter = start_date || since;
      const endFilter = end_date || new Date().toISOString();
      const { data, error } = await supabase.from("audit_logs").select("*").eq("actor_id", user.id).gte("created_at", startFilter).lte("created_at", endFilter).order("created_at", { ascending: false }).limit(5000);
      if (error) throw error;
      const headers = ["timestamp", "action", "resource_type", "resource_id", "result", "ip_address"];
      const csvRows = [headers.join(",")];
      for (const log of data || []) {
        csvRows.push([log.created_at, `"${log.action}"`, log.resource_type, log.resource_id || "", log.result, log.ip_address || ""].join(","));
      }
      return new Response(csvRows.join("\n"), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "text/csv", "Content-Disposition": `attachment; filename="audit_${new Date().toISOString().split("T")[0]}.csv"` },
      });
    }

    // ══════════════════════════════════════════════
    // FLEET / DEVICE HEALTH
    // ══════════════════════════════════════════════
    else if (endpoint === "fleet-health" && method === "GET") {
      const { data: devices, error } = await supabase.from("device_statuses").select("*").eq("user_id", user.id);
      if (error) throw error;
      const total = devices?.length || 0;
      const online = devices?.filter((d: any) => d.connectivity === "online").length || 0;
      const degraded = devices?.filter((d: any) => d.health === "degraded").length || 0;
      const offline = devices?.filter((d: any) => d.connectivity === "offline").length || 0;
      result = { status: degraded > 0 || offline > 0 ? "issues" : "healthy", summary: `${total} devices: ${online} online, ${degraded} degraded, ${offline} offline`, devices: devices || [], kpis: { total, online, degraded, offline } };
    }
    else if (endpoint === "device-restart" && method === "POST") {
      const { device_id } = body as any;
      if (!device_id) return new Response(JSON.stringify({ error: "device_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const { data, error } = await supabase.from("device_statuses").update({ health: "restarting", last_heartbeat: new Date().toISOString(), issues: [] }).eq("device_id", device_id).eq("user_id", user.id).select().single();
      if (error) throw error;
      await createAuditLog(supabase, user.id, "device.restart", "device", device_id, "success", {}, req);
      result = data;
    }

    // ══════════════════════════════════════════════
    // COUNCILS
    // ══════════════════════════════════════════════
    else if (endpoint === "council" && !subId && method === "GET") {
      const { data, error } = await supabase.from("council_decisions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      result = {
        decisions: data || [],
        summary: {
          total: data?.length || 0,
          pending: data?.filter((d: any) => d.status === "pending").length || 0,
          approved: data?.filter((d: any) => d.status === "approved").length || 0,
          rejected: data?.filter((d: any) => d.status === "rejected").length || 0,
        },
      };
    }
    else if (endpoint === "councils" && !subId && method === "GET") {
      // List distinct councils with member counts
      const { data, error } = await supabase.from("council_decisions").select("council_id, domain").eq("user_id", user.id);
      if (error) throw error;
      const councilMap = new Map<string, { id: string; domain: string; decisions: number }>();
      for (const d of data || []) {
        const existing = councilMap.get(d.council_id);
        if (existing) existing.decisions++;
        else councilMap.set(d.council_id, { id: d.council_id, domain: d.domain || "general", decisions: 1 });
      }
      result = { councils: Array.from(councilMap.values()) };
    }
    else if (endpoint === "councils" && subId && !subAction && method === "GET") {
      const { data, error } = await supabase.from("council_decisions").select("*").eq("council_id", subId).eq("user_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      result = { council_id: subId, decisions: data || [], total: data?.length || 0 };
    }
    else if (endpoint === "councils" && subId && subAction === "pending-approvals") {
      const { data, error } = await supabase.from("council_decisions").select("*").eq("council_id", subId).eq("user_id", user.id).eq("status", "pending").order("created_at", { ascending: false });
      if (error) throw error;
      result = { council_id: subId, pending: data || [] };
    }
    else if (endpoint === "councils" && subId && subAction === "decisions" && method === "POST") {
      const { topic, description, domain, quorum } = body as any;
      if (!topic) return new Response(JSON.stringify({ error: "topic required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const decision = { council_id: subId, topic, description: description || "", domain: domain || "general", quorum: quorum || 3, user_id: user.id, status: "pending" };
      const { data, error } = await supabase.from("council_decisions").insert(decision).select().single();
      if (error) throw error;
      await createAuditLog(supabase, user.id, "council.decision_created", "council_decision", data.id, "success", decision, req);
      result = data;
    }
    else if (endpoint === "council-vote" && method === "POST") {
      const { decision_id, vote } = body as any;
      if (!decision_id || !vote) return new Response(JSON.stringify({ error: "decision_id and vote required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const { data: decision, error: fetchError } = await supabase.from("council_decisions").select("*").eq("id", decision_id).eq("user_id", user.id).single();
      if (fetchError || !decision) return new Response(JSON.stringify({ error: "Decision not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });

      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      const existingVotes = Array.isArray(decision.votes) ? decision.votes : [];
      existingVotes.push({ voter_id: user.id, vote, timestamp: new Date().toISOString() });
      updates.votes = existingVotes;
      if (vote === "for") updates.votes_for = (decision.votes_for || 0) + 1;
      else if (vote === "against") updates.votes_against = (decision.votes_against || 0) + 1;
      else if (vote === "abstain") updates.votes_abstained = (decision.votes_abstained || 0) + 1;

      // Check quorum and auto-resolve
      const totalVotes = ((updates.votes_for as number) || decision.votes_for || 0) + ((updates.votes_against as number) || decision.votes_against || 0) + ((updates.votes_abstained as number) || decision.votes_abstained || 0);
      if (totalVotes >= (decision.quorum || 3)) {
        const votesFor = (updates.votes_for as number) || decision.votes_for || 0;
        const votesAgainst = (updates.votes_against as number) || decision.votes_against || 0;
        updates.status = votesFor > votesAgainst ? "approved" : votesAgainst > votesFor ? "rejected" : "tie";
        updates.decided_at = new Date().toISOString();
        updates.resolution = `${updates.status} with ${votesFor} for, ${votesAgainst} against`;
      }

      const { data, error } = await supabase.from("council_decisions").update(updates).eq("id", decision_id).select().single();
      if (error) throw error;
      await createAuditLog(supabase, user.id, "council.vote", "decision", decision_id, "success", { vote, before: { votes_for: decision.votes_for, votes_against: decision.votes_against }, after: updates }, req);
      result = data;
    }

    // ══════════════════════════════════════════════
    // COUNCIL AUTO-ESCALATION
    // ══════════════════════════════════════════════
    else if (endpoint === "council-auto-escalate" && method === "POST") {
      const { event_type, severity, services_affected, threat_score, amount, domain } = body as any;
      const escalations: Array<{ council: string; reason: string; priority: string }> = [];

      // Build Council rules
      if (severity === "SEV-1" && (services_affected || []).some((s: string) => s.includes("brain-core"))) {
        escalations.push({ council: "build", reason: "SEV-1 incident affecting brain-core", priority: "critical" });
      }
      // Ops Council rules
      if ((services_affected || []).length > 2) {
        escalations.push({ council: "ops", reason: `Incident affects ${services_affected.length} services`, priority: "high" });
      }
      // Security Council rules
      if (threat_score && threat_score > 7.5) {
        escalations.push({ council: "security", reason: `Threat score ${threat_score} exceeds 7.5 threshold`, priority: "critical" });
      }
      if (event_type === "unauthorized_access") {
        escalations.push({ council: "security", reason: "Unauthorized access attempt detected", priority: "critical" });
      }
      // Financial Council rules
      if (amount && amount > 10000) {
        escalations.push({ council: "financial", reason: `Transaction $${amount} exceeds dual approval threshold`, priority: "high" });
      }

      // Create council decisions for each escalation
      const created = [];
      for (const esc of escalations) {
        const { data } = await supabase.from("council_decisions").insert({
          council_id: esc.council,
          topic: esc.reason,
          description: `Auto-escalated: ${event_type || "system event"} (${esc.priority})`,
          domain: domain || "ops",
          status: "pending",
          user_id: user.id,
          metadata: { auto_escalated: true, priority: esc.priority, source_event: body },
        }).select().single();
        if (data) created.push(data);
      }

      await createAuditLog(supabase, user.id, "council.auto_escalate", "escalation", null, "success", { escalations, created_decisions: created.length }, req);
      result = { escalations, decisions_created: created };
    }

    // ══════════════════════════════════════════════
    // AGENT GOVERNANCE CHECK
    // ══════════════════════════════════════════════
    else if (endpoint === "agent-governance" && method === "POST") {
      const { agent_id, action: agentAction, autonomy_level_required, risk_score, estimated_tokens } = body as any;
      if (!agent_id) return new Response(JSON.stringify({ error: "agent_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

      const checks: Array<{ check: string; passed: boolean; detail: string }> = [];
      let allowed = true;
      let escalatedTo: string | null = null;

      // Check 1: Autonomy ceiling
      const autonomyOrder = ["L0-observe", "L1-suggest", "L2-draft", "L3-simulate", "L4-auto-reversible", "L5-auto-irreversible", "L6-constrained-action"];
      const maxLevel = "L4-auto-reversible"; // Default ceiling
      const requiredIdx = autonomyOrder.indexOf(autonomy_level_required || "L0-observe");
      const maxIdx = autonomyOrder.indexOf(maxLevel);
      const ceilingPassed = requiredIdx <= maxIdx;
      checks.push({ check: "autonomy_ceiling", passed: ceilingPassed, detail: ceilingPassed ? `Level ${autonomy_level_required} within ceiling ${maxLevel}` : `Level ${autonomy_level_required} exceeds ceiling ${maxLevel}` });
      if (!ceilingPassed) allowed = false;

      // Check 2: Token budget
      const { data: costData } = await supabase.from("ai_cost_ledger").select("tokens_in, tokens_out").eq("user_id", user.id).eq("agent_id", agent_id).gte("created_at", new Date(Date.now() - 3600000).toISOString());
      const hourlyTokens = (costData || []).reduce((s: number, c: any) => s + (c.tokens_in || 0) + (c.tokens_out || 0), 0);
      const tokenLimit = 100000; // hourly limit
      const budgetPassed = (hourlyTokens + (estimated_tokens || 0)) <= tokenLimit;
      checks.push({ check: "token_budget", passed: budgetPassed, detail: budgetPassed ? `${hourlyTokens + (estimated_tokens || 0)}/${tokenLimit} tokens this hour` : `Would exceed hourly limit: ${hourlyTokens + (estimated_tokens || 0)}/${tokenLimit}` });
      if (!budgetPassed) allowed = false;

      // Check 3: Simulation gate for L3+
      if (requiredIdx >= 3) {
        const simPassed = (risk_score || 0) <= 7.5;
        checks.push({ check: "simulation_gate", passed: simPassed, detail: simPassed ? `Risk score ${risk_score} within threshold 7.5` : `Risk score ${risk_score} exceeds 7.5 — simulation required` });
        if (!simPassed) allowed = false;
      }

      // Check 4: Council escalation for high risk
      if ((risk_score || 0) > 7.5) {
        allowed = false;
        escalatedTo = "security";
        checks.push({ check: "council_escalation", passed: false, detail: `Risk score ${risk_score} > 7.5 — escalated to security council` });

        // Auto-create council decision
        await supabase.from("council_decisions").insert({
          council_id: "security", topic: `Agent ${agent_id} high-risk action: ${agentAction}`,
          description: `Risk score: ${risk_score}. Action: ${agentAction}. Auto-escalated by governance.`,
          domain: "security", status: "pending", user_id: user.id,
          metadata: { auto_escalated: true, agent_id, risk_score, action: agentAction },
        });
      }

      // Record governance decision
      await supabase.from("agent_action_receipts").insert({
        user_id: user.id, agent_id, action_type: agentAction || "unknown",
        risk_score: risk_score || 0, autonomy_level: autonomy_level_required || "L0-observe",
        governance_checks: checks, status: allowed ? "approved" : "blocked",
        tokens_used: estimated_tokens || 0,
      });

      await createAuditLog(supabase, user.id, "agent.governance_check", "agent", agent_id, allowed ? "success" : "failure", { checks, allowed, escalatedTo }, req);
      result = { allowed, reason: allowed ? "All governance checks passed" : checks.filter(c => !c.passed).map(c => c.detail).join("; "), checks, escalatedTo };
    }

    // ══════════════════════════════════════════════
    // AGENT HEALTH
    // ══════════════════════════════════════════════
    else if (endpoint === "agent-health") {
      const { data: requests } = await supabase.from("advisor_requests").select("status, intent, complexity, created_at").eq("user_id", user.id).gte("created_at", since).order("created_at", { ascending: false }).limit(500);
      const { data: responses } = await supabase.from("advisor_responses").select("model_used, tokens_used, confidence, latency_ms, created_at").eq("user_id", user.id).gte("created_at", since).limit(500);
      const total = requests?.length || 0;
      const completed = requests?.filter((r: any) => r.status === "completed").length || 0;
      const failed = requests?.filter((r: any) => r.status === "failed" || r.status === "error").length || 0;
      const processing = requests?.filter((r: any) => r.status === "processing").length || 0;
      const avgLatency = responses?.length ? Math.round(responses.reduce((s: number, r: any) => s + (r.latency_ms || 0), 0) / responses.length) : 0;
      const avgConfidence = responses?.length ? parseFloat((responses.reduce((s: number, r: any) => s + (r.confidence || 0), 0) / responses.length).toFixed(2)) : 0;
      const byComplexity: Record<string, number> = {};
      for (const r of requests || []) { byComplexity[r.complexity || "unknown"] = (byComplexity[r.complexity || "unknown"] || 0) + 1; }
      const byModel: Record<string, { count: number; tokens: number }> = {};
      for (const r of responses || []) { const m = r.model_used || "unknown"; if (!byModel[m]) byModel[m] = { count: 0, tokens: 0 }; byModel[m].count++; byModel[m].tokens += r.tokens_used || 0; }
      result = { status: failed > total * 0.1 ? "degraded" : "healthy", summary: `${completed}/${total} completed. Avg latency: ${avgLatency}ms. Confidence: ${avgConfidence}.`, total_requests: total, completed, failed, processing, avg_latency_ms: avgLatency, avg_confidence: avgConfidence, by_complexity: byComplexity, by_model: byModel, period_days: days };
    }

    // ══════════════════════════════════════════════
    // COSTS
    // ══════════════════════════════════════════════
    else if (endpoint === "costs") {
      const { data: responses } = await supabase.from("advisor_responses").select("model_used, tokens_used, created_at").eq("user_id", user.id).gte("created_at", since).limit(1000);
      const totalTokens = responses?.reduce((s: number, r: any) => s + (r.tokens_used || 0), 0) || 0;
      const byDay: Record<string, { tokens: number; requests: number }> = {};
      for (const r of responses || []) { const day = r.created_at.split("T")[0]; if (!byDay[day]) byDay[day] = { tokens: 0, requests: 0 }; byDay[day].tokens += r.tokens_used || 0; byDay[day].requests++; }
      const byModel: Record<string, number> = {};
      for (const r of responses || []) { const m = r.model_used || "unknown"; byModel[m] = (byModel[m] || 0) + (r.tokens_used || 0); }
      result = { summary: `${totalTokens.toLocaleString()} tokens across ${responses?.length || 0} requests (${days}d).`, total_tokens: totalTokens, total_requests: responses?.length || 0, by_day: byDay, by_model: byModel, period_days: days };
    }

    // ══════════════════════════════════════════════
    // INTELLIGENCE DASHBOARD
    // ══════════════════════════════════════════════
    else if (endpoint === "intelligence") {
      const [incidentsRes, responsesRes, workflowsRes] = await Promise.all([
        supabase.from("incidents").select("severity, status, created_at").eq("user_id", user.id).gte("created_at", since),
        supabase.from("advisor_responses").select("latency_ms, tokens_used, confidence, created_at").eq("user_id", user.id).gte("created_at", since).limit(500),
        supabase.from("workflow_runs").select("status, created_at").eq("user_id", user.id).gte("created_at", since).limit(500),
      ]);
      const incidents = incidentsRes.data || [];
      const responses = responsesRes.data || [];
      const workflows = workflowsRes.data || [];

      // 6-sigma anomaly detection on latency
      const latencies = responses.map((r: any) => r.latency_ms || 0).filter((l: number) => l > 0);
      const mean = latencies.length ? latencies.reduce((a: number, b: number) => a + b, 0) / latencies.length : 0;
      const variance = latencies.length ? latencies.reduce((sum: number, val: number) => sum + Math.pow(val - mean, 2), 0) / latencies.length : 0;
      const stddev = Math.sqrt(variance);
      const anomalies = latencies.map((l: number, i: number) => ({ value: l, sigma: stddev > 0 ? Math.abs((l - mean) / stddev) : 0, index: i })).filter((a: any) => a.sigma > 3).slice(0, 5);

      // Trend-based incident forecasting
      const recentIncidents = incidents.filter((i: any) => Date.now() - new Date(i.created_at).getTime() < 48 * 3600000);
      const olderIncidents = incidents.filter((i: any) => Date.now() - new Date(i.created_at).getTime() >= 48 * 3600000);
      const trendDirection = recentIncidents.length > olderIncidents.length / Math.max(1, (days - 2)) * 2 ? "increasing" : "stable";
      const forecasts: any[] = [];
      if (trendDirection === "increasing") forecasts.push({ type: "incident-spike", probability: 0.72, timeWindow: "48h", preventiveMeasures: ["Review recent configuration changes", "Check upstream service health", "Increase monitoring sensitivity"] });
      if (anomalies.length > 2) forecasts.push({ type: "latency-degradation", probability: 0.65, timeWindow: "24h", preventiveMeasures: ["Optimize database queries", "Check connection pool usage", "Review cache hit rates"] });

      // Cost optimization
      const totalTokens = responses.reduce((s: number, r: any) => s + (r.tokens_used || 0), 0);
      const costSuggestions: any[] = [];
      if (totalTokens > 50000) costSuggestions.push({ type: "model-routing", title: "Route simple queries to lighter models", projectedSavings: `${Math.round(totalTokens * 0.3)} tokens/period (~$${(totalTokens * 0.3 * 0.00003).toFixed(2)})`, confidence: 0.82 });
      const failedWorkflows = workflows.filter((w: any) => w.status === "failed").length;
      if (failedWorkflows > 3) costSuggestions.push({ type: "workflow-optimization", title: "Fix failing workflows to reduce retry costs", projectedSavings: `${failedWorkflows} fewer retries/period`, confidence: 0.78 });

      result = {
        anomalies: {
          detected: anomalies.length,
          items: anomalies.map((a: any) => ({ metric: "latency_ms", value: a.value, sigma: parseFloat(a.sigma.toFixed(2)), severity: a.sigma > 6 ? "critical" : a.sigma > 4 ? "warning" : "info" })),
          baseline: { mean: Math.round(mean), stddev: Math.round(stddev) },
        },
        forecasts,
        cost_optimization: costSuggestions,
        system_health: {
          incident_trend: trendDirection,
          recent_incidents: recentIncidents.length,
          avg_latency_ms: Math.round(mean),
          workflow_success_rate: workflows.length > 0 ? parseFloat(((workflows.filter((w: any) => w.status === "completed").length / workflows.length) * 100).toFixed(1)) : 100,
        },
        period_days: days,
      };
    }

    // ══════════════════════════════════════════════
    // CONNECTOR HEALTH
    // ══════════════════════════════════════════════
    else if (endpoint === "connector-health") {
      const { data: connectors } = await supabase.from("connector_configs").select("id, service, status, last_sync_at, created_at").eq("user_id", user.id);
      const healthy = connectors?.filter((c: any) => c.status === "active").length || 0;
      const stale = connectors?.filter((c: any) => !c.last_sync_at || (Date.now() - new Date(c.last_sync_at).getTime()) > 24 * 3600000).length || 0;
      result = { status: stale > 0 ? "stale_detected" : "healthy", summary: `${connectors?.length || 0} connectors. ${healthy} active, ${stale} stale.`, total: connectors?.length || 0, active: healthy, stale, connectors: connectors || [] };
    }

    // ══════════════════════════════════════════════
    // APPROVALS
    // ══════════════════════════════════════════════
    else if (endpoint === "approvals") {
      const { data: pending } = await supabase.from("approval_queue").select("id, action_summary, proposed_action, status, created_at").eq("user_id", user.id).eq("status", "pending").order("created_at", { ascending: false });
      const { data: recent } = await supabase.from("approval_queue").select("id, action_summary, status, decided_at, decision_reason, created_at").eq("user_id", user.id).neq("status", "pending").gte("created_at", since).order("created_at", { ascending: false }).limit(50);
      result = { summary: `${pending?.length || 0} pending. ${recent?.length || 0} decided (${days}d).`, pending: pending || [], recent_decisions: recent || [] };
    }

    // ══════════════════════════════════════════════
    // MEMORY
    // ══════════════════════════════════════════════
    else if (endpoint === "memory") {
      const { data: memory } = await supabase.from("user_memory").select("category, key, value, source, confidence, updated_at").eq("user_id", user.id).order("updated_at", { ascending: false }).limit(100);
      const byCategory: Record<string, number> = {};
      for (const m of memory || []) { byCategory[m.category] = (byCategory[m.category] || 0) + 1; }
      result = { summary: `${memory?.length || 0} records across ${Object.keys(byCategory).length} categories.`, total: memory?.length || 0, by_category: byCategory, records: memory || [] };
    }

    // ══════════════════════════════════════════════
    // WORKFLOW HEALTH
    // ══════════════════════════════════════════════
    else if (endpoint === "workflow-health") {
      const { data: runs } = await supabase.from("workflow_runs").select("status, created_at, completed_at").eq("user_id", user.id).gte("created_at", since).limit(500);
      const byStatus: Record<string, number> = {};
      for (const r of runs || []) { byStatus[r.status] = (byStatus[r.status] || 0) + 1; }
      result = { status: (byStatus["failed"] || 0) > 0 ? "issues" : "healthy", summary: `${runs?.length || 0} workflow runs. ${byStatus["completed"] || 0} completed, ${byStatus["failed"] || 0} failed.`, total_runs: runs?.length || 0, by_status: byStatus, period_days: days };
    }

    // ══════════════════════════════════════════════
    // TRUST CENTER
    // ══════════════════════════════════════════════
    else if (endpoint === "trust-center") {
      const { data: trustEvents } = await supabase.from("trust_state_events").select("*").eq("user_id", user.id).gte("created_at", since).order("created_at", { ascending: false }).limit(200);
      const { data: proofs } = await supabase.from("proof_records").select("id, action, domain, created_at").eq("user_id", user.id).gte("created_at", since).limit(100);
      const { data: trustState } = await supabase.from("trust_state").select("*").eq("user_id", user.id).limit(50);
      const events = trustEvents || [];
      const verifications = events.filter((e: any) => e.event_type === "verification");
      const flags = events.filter((e: any) => e.event_type === "flag");
      const totalScore = trustState?.length ? trustState.reduce((s: number, t: any) => s + (t.score || 0), 0) / trustState.length : 85;
      result = {
        overallScore: Math.round(totalScore),
        status: totalScore >= 80 ? "healthy" : totalScore >= 60 ? "degraded" : "critical",
        verifications: { total: verifications.length, recent: verifications.slice(0, 10) },
        flags: { total: flags.length, active: flags.filter((f: any) => !f.metadata?.resolved).length, items: flags.slice(0, 10) },
        proofRecords: proofs || [],
        entities: (trustState || []).map((t: any) => ({ entityId: t.entity_id, entityType: t.entity_type, score: t.score, trustLevel: t.trust_level, updatedAt: t.updated_at })),
        period_days: days,
      };
    }

    // ══════════════════════════════════════════════
    // RELEASES
    // ══════════════════════════════════════════════
    else if (endpoint === "releases") {
      const { data: runs } = await supabase.from("workflow_runs").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
      const releaseRuns = (runs || []).filter((r: any) => r.workflow_type === "release" || r.metadata?.type === "release");
      const allRuns = runs || [];
      result = {
        releases: releaseRuns.map((r: any) => ({ id: r.id, version: r.metadata?.version || `v${r.id.slice(0, 8)}`, status: r.status, createdAt: r.created_at, completedAt: r.completed_at, metadata: r.metadata })),
        summary: { total: releaseRuns.length, successful: releaseRuns.filter((r: any) => r.status === "completed").length, failed: releaseRuns.filter((r: any) => r.status === "failed").length, pending: releaseRuns.filter((r: any) => r.status === "pending" || r.status === "running").length },
        recentBuilds: allRuns.slice(0, 10).map((r: any) => ({ id: r.id, status: r.status, type: r.workflow_type || "build", createdAt: r.created_at })),
      };
    }

    // ══════════════════════════════════════════════
    // MODEL ROUTING
    // ══════════════════════════════════════════════
    else if (endpoint === "model-routing") {
      const { data: responses } = await supabase.from("advisor_responses").select("model_used, tokens_used, latency_ms, confidence, created_at").eq("user_id", user.id).gte("created_at", since).limit(1000);
      const byModel: Record<string, { requests: number; tokens: number; avgLatency: number; avgConfidence: number; latencies: number[]; confidences: number[] }> = {};
      for (const r of responses || []) {
        const m = r.model_used || "unknown";
        if (!byModel[m]) byModel[m] = { requests: 0, tokens: 0, avgLatency: 0, avgConfidence: 0, latencies: [], confidences: [] };
        byModel[m].requests++;
        byModel[m].tokens += r.tokens_used || 0;
        byModel[m].latencies.push(r.latency_ms || 0);
        byModel[m].confidences.push(r.confidence || 0);
      }
      const models = Object.entries(byModel).map(([name, data]) => ({
        model: name, requests: data.requests, totalTokens: data.tokens,
        avgLatency: Math.round(data.latencies.reduce((a, b) => a + b, 0) / data.latencies.length),
        avgConfidence: parseFloat((data.confidences.reduce((a, b) => a + b, 0) / data.confidences.length).toFixed(3)),
        efficiency: data.tokens > 0 ? parseFloat((data.confidences.reduce((a, b) => a + b, 0) / data.confidences.length / (data.tokens / data.requests) * 1000).toFixed(2)) : 0,
      }));
      result = { models: models.sort((a, b) => b.requests - a.requests), totalRequests: responses?.length || 0, totalTokens: (responses || []).reduce((s: number, r: any) => s + (r.tokens_used || 0), 0), period_days: days };
    }

    // ══════════════════════════════════════════════
    // KNOWLEDGE HEALTH
    // ══════════════════════════════════════════════
    else if (endpoint === "knowledge-health") {
      const { data: memory } = await supabase.from("user_memory").select("category, key, source, confidence, updated_at, created_at").eq("user_id", user.id).order("updated_at", { ascending: false }).limit(500);
      const records = memory || [];
      const byCategory: Record<string, { count: number; avgConfidence: number; newest: string; oldest: string }> = {};
      for (const m of records) {
        if (!byCategory[m.category]) byCategory[m.category] = { count: 0, avgConfidence: 0, newest: m.updated_at, oldest: m.updated_at };
        byCategory[m.category].count++;
        byCategory[m.category].avgConfidence += m.confidence || 0;
        if (m.updated_at > byCategory[m.category].newest) byCategory[m.category].newest = m.updated_at;
        if (m.updated_at < byCategory[m.category].oldest) byCategory[m.category].oldest = m.updated_at;
      }
      for (const cat of Object.values(byCategory)) { cat.avgConfidence = cat.count > 0 ? parseFloat((cat.avgConfidence / cat.count).toFixed(3)) : 0; }
      const staleThreshold = Date.now() - 7 * 86400000;
      const stale = records.filter(m => new Date(m.updated_at).getTime() < staleThreshold).length;
      const avgConfidence = records.length > 0 ? records.reduce((s, m) => s + (m.confidence || 0), 0) / records.length : 0;
      result = {
        status: stale > records.length * 0.3 ? "stale" : avgConfidence < 0.6 ? "low-confidence" : "healthy",
        totalRecords: records.length, staleRecords: stale, avgConfidence: parseFloat(avgConfidence.toFixed(3)),
        categories: byCategory, sources: [...new Set(records.map(m => m.source))],
      };
    }

    // ══════════════════════════════════════════════
    // SUPPORT CASES
    // ══════════════════════════════════════════════
    else if (endpoint === "support-cases") {
      const { data: incidents } = await supabase.from("incidents").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(200);
      const cases = (incidents || []).filter((i: any) => i.metadata?.type === "support" || i.severity === "low" || i.severity === "medium");
      const open = cases.filter((c: any) => c.status === "open");
      const resolved = cases.filter((c: any) => c.status === "resolved");
      const avgResolutionMs = resolved.length > 0 ? resolved.reduce((s: number, c: any) => s + (c.resolved_at ? new Date(c.resolved_at).getTime() - new Date(c.created_at).getTime() : 0), 0) / resolved.length : 0;
      result = {
        cases: cases.slice(0, 50),
        summary: { total: cases.length, open: open.length, resolved: resolved.length, avgResolutionHours: Math.round(avgResolutionMs / 3600000) },
      };
    }

    // ══════════════════════════════════════════════
    // CHANGE REVIEW
    // ══════════════════════════════════════════════
    else if (endpoint === "change-review") {
      const { data: logs } = await supabase.from("audit_logs").select("*").eq("actor_id", user.id).gte("created_at", since).order("created_at", { ascending: false }).limit(500);
      const mutations = (logs || []).filter((l: any) => l.action && !l.action.startsWith("view") && !l.action.startsWith("read"));
      const byResource: Record<string, { count: number; lastChange: string; actions: string[] }> = {};
      for (const l of mutations) {
        const key = l.resource_type || "unknown";
        if (!byResource[key]) byResource[key] = { count: 0, lastChange: l.created_at, actions: [] };
        byResource[key].count++;
        if (!byResource[key].actions.includes(l.action)) byResource[key].actions.push(l.action);
        if (l.created_at > byResource[key].lastChange) byResource[key].lastChange = l.created_at;
      }
      result = {
        changes: mutations.slice(0, 100).map((l: any) => ({ id: l.id, action: l.action, resourceType: l.resource_type, resourceId: l.resource_id, result: l.result, changes: l.changes, createdAt: l.created_at })),
        summary: { totalChanges: mutations.length, byResource, period_days: days },
      };
    }

    // ══════════════════════════════════════════════
    // ROLLBACK CENTER
    // ══════════════════════════════════════════════
    else if (endpoint === "rollback-center") {
      const { data: rollbackLogs } = await supabase.from("audit_logs").select("*").eq("actor_id", user.id).ilike("action", "%rollback%").order("created_at", { ascending: false }).limit(50);
      const { data: failedIncidents } = await supabase.from("incidents").select("id, title, root_cause, severity, created_at, resolved_at").eq("user_id", user.id).eq("status", "resolved").not("root_cause", "is", null).order("created_at", { ascending: false }).limit(30);
      result = {
        rollbacks: (rollbackLogs || []).map((l: any) => ({ id: l.id, action: l.action, resourceType: l.resource_type, resourceId: l.resource_id, changes: l.changes, createdAt: l.created_at, result: l.result })),
        incidentsWithRootCause: failedIncidents || [],
        summary: { totalRollbacks: rollbackLogs?.length || 0, incidentsAnalyzed: failedIncidents?.length || 0 },
      };
    }

    // ══════════════════════════════════════════════
    // SERVICE MAP
    // ══════════════════════════════════════════════
    else if (endpoint === "service-map") {
      const { data: devices } = await supabase.from("device_statuses").select("device_id, device_name, device_type, health, connectivity, last_heartbeat, cpu_pct, memory_pct").eq("user_id", user.id);
      const { data: connectors } = await supabase.from("connector_configs").select("id, service, status, last_sync_at").eq("user_id", user.id);
      const { data: capabilities } = await supabase.from("capabilities").select("id, name, domain, enabled, risk_tier");
      const services = [
        { id: "brain-core", name: "Brain Core", type: "core", status: "active", dependencies: ["memory", "advisor-pipeline", "policy-engine"] },
        { id: "advisor-pipeline", name: "Advisor Pipeline", type: "core", status: "active", dependencies: ["model-routing", "memory"] },
        { id: "policy-engine", name: "Policy Engine", type: "core", status: "active", dependencies: [] },
        { id: "workflow-engine", name: "Workflow Engine", type: "core", status: "active", dependencies: ["executor", "receipt-service"] },
        { id: "memory", name: "Memory Service", type: "core", status: "active", dependencies: [] },
        { id: "trust-engine", name: "Trust Engine", type: "core", status: "active", dependencies: ["receipt-service", "verification-engine"] },
        { id: "connector-hub", name: "Connector Hub", type: "integration", status: connectors?.length ? "active" : "idle", dependencies: [] },
      ];
      result = { services, devices: devices || [], connectors: connectors || [], capabilities: capabilities || [], topology: { coreServices: services.filter(s => s.type === "core").length, integrations: connectors?.length || 0, devices: devices?.length || 0, capabilities: capabilities?.length || 0 } };
    }

    // ══════════════════════════════════════════════
    // SLOs
    // ══════════════════════════════════════════════
    else if (endpoint === "slos") {
      const { data: responses } = await supabase.from("advisor_responses").select("latency_ms, confidence, created_at").eq("user_id", user.id).gte("created_at", since).limit(1000);
      const { data: runs } = await supabase.from("workflow_runs").select("status, created_at").eq("user_id", user.id).gte("created_at", since).limit(1000);
      const { data: snapshots } = await supabase.from("metrics_snapshots").select("*").eq("user_id", user.id).order("recorded_at", { ascending: false }).limit(100);
      const latencies = (responses || []).map((r: any) => r.latency_ms || 0).filter((l: number) => l > 0);
      const avgLatency = latencies.length ? latencies.reduce((a: number, b: number) => a + b, 0) / latencies.length : 0;
      const p99Latency = latencies.length ? latencies.sort((a: number, b: number) => a - b)[Math.floor(latencies.length * 0.99)] : 0;
      const totalRuns = runs?.length || 0;
      const successRuns = runs?.filter((r: any) => r.status === "completed").length || 0;
      const successRate = totalRuns > 0 ? successRuns / totalRuns : 1;
      const slos = [
        { id: "api-latency-p99", name: "API Latency P99", target: 500, current: Math.round(p99Latency), unit: "ms", isMet: p99Latency <= 500, burnRate: p99Latency > 0 ? (500 - p99Latency) / 500 : 0 },
        { id: "workflow-success", name: "Workflow Success Rate", target: 0.95, current: parseFloat(successRate.toFixed(4)), unit: "%", isMet: successRate >= 0.95, burnRate: (0.95 - successRate) / 0.95 },
        { id: "avg-latency", name: "Avg Response Time", target: 200, current: Math.round(avgLatency), unit: "ms", isMet: avgLatency <= 200, burnRate: avgLatency > 0 ? (200 - avgLatency) / 200 : 0 },
      ];
      result = { slos, breached: slos.filter(s => !s.isMet), summary: { total: slos.length, met: slos.filter(s => s.isMet).length, breached: slos.filter(s => !s.isMet).length }, snapshots: snapshots || [], period_days: days };
    }

    // ══════════════════════════════════════════════
    // ARCH GATES
    // ══════════════════════════════════════════════
    else if (endpoint === "arch-gates") {
      const { data: policies } = await supabase.from("policies").select("id, name, category, active, approval_required, created_at").eq("user_id", user.id);
      const { data: runs } = await supabase.from("workflow_runs").select("status, metadata, created_at").eq("user_id", user.id).gte("created_at", since).limit(200);
      const totalPolicies = policies?.length || 0;
      const activePolicies = policies?.filter((p: any) => p.active).length || 0;
      const totalRuns = runs?.length || 0;
      const compliantRuns = runs?.filter((r: any) => r.status === "completed").length || 0;
      const gates = [
        { id: "policy-coverage", name: "Policy Coverage", status: activePolicies >= 5 ? "passing" : activePolicies >= 2 ? "warning" : "failing", detail: `${activePolicies}/${totalPolicies} policies active` },
        { id: "workflow-compliance", name: "Workflow Compliance", status: totalRuns > 0 && compliantRuns / totalRuns >= 0.9 ? "passing" : "warning", detail: `${compliantRuns}/${totalRuns} compliant runs` },
        { id: "approval-gates", name: "Approval Gates", status: policies?.some((p: any) => p.approval_required) ? "passing" : "warning", detail: `${policies?.filter((p: any) => p.approval_required).length || 0} policies require approval` },
      ];
      result = { gates, summary: { total: gates.length, passing: gates.filter(g => g.status === "passing").length, warning: gates.filter(g => g.status === "warning").length, failing: gates.filter(g => g.status === "failing").length } };
    }

    // ══════════════════════════════════════════════
    // DEPLOYMENT RINGS
    // ══════════════════════════════════════════════
    else if (endpoint === "deployment-rings") {
      const { data: devices } = await supabase.from("device_statuses").select("*").eq("user_id", user.id);
      const rings: Record<string, { devices: any[]; health: string }> = { canary: { devices: [], health: "healthy" }, staging: { devices: [], health: "healthy" }, production: { devices: [], health: "healthy" } };
      for (const d of devices || []) {
        const ring = (d.metadata as any)?.ring || (d.device_type === "canary" ? "canary" : d.device_type === "staging" ? "staging" : "production");
        if (!rings[ring]) rings[ring] = { devices: [], health: "healthy" };
        rings[ring].devices.push(d);
        if (d.health === "degraded" || d.health === "critical") rings[ring].health = d.health;
      }
      result = { rings: Object.entries(rings).map(([name, data]) => ({ name, deviceCount: data.devices.length, health: data.health, devices: data.devices })), totalDevices: devices?.length || 0 };
    }

    // ══════════════════════════════════════════════
    // TEST COVERAGE
    // ══════════════════════════════════════════════
    else if (endpoint === "test-coverage") {
      const { data: runs } = await supabase.from("workflow_runs").select("status, metadata, workflow_type, created_at").eq("user_id", user.id).gte("created_at", since).limit(500);
      const { data: steps } = await supabase.from("workflow_steps").select("status, step_type, created_at").eq("user_id", user.id).gte("created_at", since).limit(1000);
      const totalRuns = runs?.length || 0;
      const passedRuns = runs?.filter((r: any) => r.status === "completed").length || 0;
      const totalSteps = steps?.length || 0;
      const passedSteps = steps?.filter((s: any) => s.status === "completed" || s.status === "passed").length || 0;
      const byType: Record<string, { total: number; passed: number }> = {};
      for (const s of steps || []) {
        const t = s.step_type || "unknown";
        if (!byType[t]) byType[t] = { total: 0, passed: 0 };
        byType[t].total++;
        if (s.status === "completed" || s.status === "passed") byType[t].passed++;
      }
      result = {
        overall: { runPassRate: totalRuns > 0 ? parseFloat((passedRuns / totalRuns * 100).toFixed(1)) : 100, stepPassRate: totalSteps > 0 ? parseFloat((passedSteps / totalSteps * 100).toFixed(1)) : 100 },
        runs: { total: totalRuns, passed: passedRuns, failed: totalRuns - passedRuns },
        steps: { total: totalSteps, passed: passedSteps, failed: totalSteps - passedSteps },
        byType,
        period_days: days,
      };
    }

    // ══════════════════════════════════════════════
    // DEFAULT — endpoint index
    // ══════════════════════════════════════════════
    else {
      result = {
        endpoints: [
          "incidents", "incidents/{id}", "incidents/{id}/acknowledge", "incidents/{id}/resolve",
          "policies", "policies/{id}", "simulate",
          "audit-logs", "audit-export",
          "fleet-health", "device-restart",
          "council", "councils", "councils/{id}", "councils/{id}/pending-approvals", "councils/{id}/decisions",
          "council-vote", "council-auto-escalate", "agent-governance",
          "agent-health", "costs", "intelligence", "connector-health",
          "approvals", "memory", "workflow-health",
          "trust-center", "releases", "model-routing", "knowledge-health",
          "support-cases", "change-review", "rollback-center", "service-map",
          "slos", "arch-gates", "deployment-rings", "test-coverage",
        ],
        usage: "Pass endpoint via x-admin-endpoint header or _endpoint body field. Supports sub-resources like incidents/{id}/acknowledge.",
      };
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("Admin API error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
