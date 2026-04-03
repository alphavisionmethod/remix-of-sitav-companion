import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Audit log helper — records every mutation
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
    await supabase.from("admin_audit_logs").insert({
      actor_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      result,
      changes: changes || {},
      ip_address: req?.headers.get("x-forwarded-for") || req?.headers.get("cf-connecting-ip") || "unknown",
      user_agent: req?.headers.get("user-agent") || "unknown",
    });
  } catch (e) {
    console.error("Audit log error:", e);
  }
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
    const pathSegments = url.pathname.split("/").filter(Boolean);
    const path = pathSegments[pathSegments.length - 1] || "";
    const subPath = pathSegments.length > 1 ? pathSegments[pathSegments.length - 2] : "";

    // Parse query params
    const days = parseInt(url.searchParams.get("days") || "7");
    const since = new Date(Date.now() - days * 86400000).toISOString();

    let result: unknown;
    const method = req.method;
    let body: Record<string, unknown> = {};
    if (method === "POST" || method === "PUT" || method === "PATCH") {
      try { body = await req.json(); } catch { body = {}; }
    }

    // ══════════════════════════════════════════════
    // INCIDENTS
    // ══════════════════════════════════════════════
    if (path === "incidents" && method === "GET") {
      const status = url.searchParams.get("status");
      const severity = url.searchParams.get("severity");

      let query = supabase
        .from("admin_incidents")
        .select("*")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false })
        .limit(100);

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
    else if (path === "incidents" && method === "POST") {
      const { title, severity, impact, description } = body as any;
      if (!title || !severity) {
        return new Response(JSON.stringify({ error: "title and severity required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const incident = {
        title,
        severity,
        impact: impact || "",
        description: description || "",
        status: "open",
        created_by: user.id,
        timeline: [{ action: "created", actor: user.id, timestamp: new Date().toISOString() }],
      };

      const { data, error } = await supabase.from("admin_incidents").insert(incident).select().single();
      if (error) throw error;

      await createAuditLog(supabase, user.id, "incident.created", "incident", data.id, "success", incident, req);
      result = data;
    }
    else if (path === "acknowledge" && subPath) {
      // POST /incidents/{id}/acknowledge
      const incidentId = subPath;
      const { data: incident, error: fetchError } = await supabase
        .from("admin_incidents")
        .select("*")
        .eq("id", incidentId)
        .eq("created_by", user.id)
        .single();

      if (fetchError || !incident) {
        return new Response(JSON.stringify({ error: "Incident not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const timeline = [...(incident.timeline || []), { action: "acknowledged", actor: user.id, timestamp: new Date().toISOString() }];
      const { data, error } = await supabase
        .from("admin_incidents")
        .update({ status: "acknowledged", acknowledged_at: new Date().toISOString(), assigned_to: user.id, timeline })
        .eq("id", incidentId)
        .select()
        .single();

      if (error) throw error;
      await createAuditLog(supabase, user.id, "incident.acknowledged", "incident", incidentId, "success", {}, req);
      result = data;
    }
    else if (path === "resolve" && subPath) {
      const incidentId = subPath;
      const { root_cause, notes } = body as any;

      const { data: incident, error: fetchError } = await supabase
        .from("admin_incidents")
        .select("*")
        .eq("id", incidentId)
        .eq("created_by", user.id)
        .single();

      if (fetchError || !incident) {
        return new Response(JSON.stringify({ error: "Incident not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const timeline = [
        ...(incident.timeline || []),
        { action: "resolved", actor: user.id, timestamp: new Date().toISOString(), notes },
      ];

      const { data, error } = await supabase
        .from("admin_incidents")
        .update({ status: "resolved", resolved_at: new Date().toISOString(), root_cause: root_cause || "", timeline })
        .eq("id", incidentId)
        .select()
        .single();

      if (error) throw error;
      await createAuditLog(supabase, user.id, "incident.resolved", "incident", incidentId, "success", { root_cause, notes }, req);
      result = data;
    }

    // ══════════════════════════════════════════════
    // POLICIES
    // ══════════════════════════════════════════════
    else if (path === "policies" && method === "GET") {
      const domain = url.searchParams.get("domain");
      let query = supabase
        .from("policies")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

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
    else if (path === "policies" && method === "POST") {
      const { name, category, conditions, actions, approval_required, active } = body as any;
      if (!name || !category) {
        return new Response(JSON.stringify({ error: "name and category required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const policy = {
        name,
        category,
        conditions: conditions || {},
        actions: actions || {},
        approval_required: approval_required ?? false,
        active: active ?? true,
        user_id: user.id,
      };

      const { data, error } = await supabase.from("policies").insert(policy).select().single();
      if (error) throw error;

      await createAuditLog(supabase, user.id, "policy.created", "policy", data.id, "success", policy, req);
      result = data;
    }
    else if (path === "simulate" && method === "POST") {
      // Policy simulator — dry-run a hypothetical action against all active policies
      const { domain, action: simAction, amount, context: simContext } = body as any;

      const { data: policies } = await supabase
        .from("policies")
        .select("*")
        .eq("user_id", user.id)
        .eq("active", true);

      const matchingPolicies = (policies || []).filter((p: any) => {
        if (domain && p.category !== domain) return false;
        return true;
      });

      const results = matchingPolicies.map((p: any) => {
        const conditions = p.conditions || {};
        let effect: "allow" | "deny" | "require_approval" = "allow";
        const reasons: string[] = [];

        if (p.approval_required) {
          effect = "require_approval";
          reasons.push(`Policy "${p.name}" requires approval`);
        }

        if (conditions.max_amount && amount && amount > conditions.max_amount) {
          effect = "deny";
          reasons.push(`Amount $${amount} exceeds max $${conditions.max_amount}`);
        }

        if (conditions.blocked_actions && conditions.blocked_actions.includes(simAction)) {
          effect = "deny";
          reasons.push(`Action "${simAction}" is blocked by policy "${p.name}"`);
        }

        return {
          policy_id: p.id,
          policy_name: p.name,
          effect,
          reasons,
          category: p.category,
        };
      });

      const finalEffect = results.some((r: any) => r.effect === "deny") ? "deny"
        : results.some((r: any) => r.effect === "require_approval") ? "require_approval"
        : "allow";

      result = {
        simulation: {
          input: { domain, action: simAction, amount, context: simContext },
          final_effect: finalEffect,
          evaluated_policies: results.length,
          results,
          timestamp: new Date().toISOString(),
        },
      };
    }

    // ══════════════════════════════════════════════
    // AUDIT LOGS
    // ══════════════════════════════════════════════
    else if (path === "audit-logs" && method === "GET") {
      const action = url.searchParams.get("action");
      const limit = parseInt(url.searchParams.get("limit") || "100");
      const offset = parseInt(url.searchParams.get("offset") || "0");

      let query = supabase
        .from("admin_audit_logs")
        .select("*")
        .eq("actor_id", user.id)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (action) query = query.ilike("action", `%${action}%`);

      const { data, error } = await query;
      if (error) throw error;

      result = {
        logs: data || [],
        total: data?.length || 0,
        offset,
        limit,
      };
    }
    else if (path === "audit-export" && method === "POST") {
      const { start_date, end_date } = body as any;
      const startFilter = start_date || since;
      const endFilter = end_date || new Date().toISOString();

      const { data, error } = await supabase
        .from("admin_audit_logs")
        .select("*")
        .eq("actor_id", user.id)
        .gte("created_at", startFilter)
        .lte("created_at", endFilter)
        .order("created_at", { ascending: false })
        .limit(5000);

      if (error) throw error;

      // Generate CSV
      const headers = ["timestamp", "action", "resource_type", "resource_id", "result", "ip_address"];
      const csvRows = [headers.join(",")];
      for (const log of data || []) {
        csvRows.push([
          log.created_at,
          `"${log.action}"`,
          log.resource_type,
          log.resource_id || "",
          log.result,
          log.ip_address || "",
        ].join(","));
      }

      return new Response(csvRows.join("\n"), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="audit_${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    // ══════════════════════════════════════════════
    // FLEET / DEVICE HEALTH
    // ══════════════════════════════════════════════
    else if (path === "fleet-health" && method === "GET") {
      const { data: devices, error } = await supabase
        .from("admin_device_statuses")
        .select("*")
        .eq("owner_id", user.id);

      if (error) throw error;

      const total = devices?.length || 0;
      const online = devices?.filter((d: any) => d.connectivity === "online").length || 0;
      const degraded = devices?.filter((d: any) => d.health === "degraded").length || 0;
      const offline = devices?.filter((d: any) => d.connectivity === "offline").length || 0;

      result = {
        status: degraded > 0 || offline > 0 ? "issues" : "healthy",
        summary: `${total} devices: ${online} online, ${degraded} degraded, ${offline} offline`,
        devices: devices || [],
        kpis: { total, online, degraded, offline },
      };
    }
    else if (path === "device-restart" && method === "POST") {
      const { device_id } = body as any;
      if (!device_id) {
        return new Response(JSON.stringify({ error: "device_id required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data, error } = await supabase
        .from("admin_device_statuses")
        .update({
          health: "restarting",
          last_heartbeat: new Date().toISOString(),
          issues: [],
        })
        .eq("device_id", device_id)
        .eq("owner_id", user.id)
        .select()
        .single();

      if (error) throw error;
      await createAuditLog(supabase, user.id, "device.restart", "device", device_id, "success", {}, req);
      result = data;
    }

    // ══════════════════════════════════════════════
    // COUNCIL DECISIONS
    // ══════════════════════════════════════════════
    else if (path === "council" && method === "GET") {
      const { data, error } = await supabase
        .from("admin_council_decisions")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

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
    else if (path === "council-vote" && method === "POST") {
      const { decision_id, vote } = body as any;
      if (!decision_id || !vote) {
        return new Response(JSON.stringify({ error: "decision_id and vote required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: decision, error: fetchError } = await supabase
        .from("admin_council_decisions")
        .select("*")
        .eq("id", decision_id)
        .eq("owner_id", user.id)
        .single();

      if (fetchError || !decision) {
        return new Response(JSON.stringify({ error: "Decision not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const updates: Record<string, unknown> = {};
      if (vote === "for") updates.votes_for = (decision.votes_for || 0) + 1;
      else if (vote === "against") updates.votes_against = (decision.votes_against || 0) + 1;
      else if (vote === "abstain") updates.votes_abstained = (decision.votes_abstained || 0) + 1;

      const { data, error } = await supabase
        .from("admin_council_decisions")
        .update(updates)
        .eq("id", decision_id)
        .select()
        .single();

      if (error) throw error;
      await createAuditLog(supabase, user.id, "council.vote", "decision", decision_id, "success", { vote }, req);
      result = data;
    }

    // ══════════════════════════════════════════════
    // AGENT HEALTH (existing, enhanced)
    // ══════════════════════════════════════════════
    else if (path === "agent-health") {
      const { data: requests } = await supabase
        .from("advisor_requests")
        .select("status, intent, complexity, created_at")
        .eq("user_id", user.id)
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(500);

      const { data: responses } = await supabase
        .from("advisor_responses")
        .select("model_used, tokens_used, confidence, latency_ms, created_at")
        .eq("user_id", user.id)
        .gte("created_at", since)
        .limit(500);

      const total = requests?.length || 0;
      const completed = requests?.filter((r: any) => r.status === "completed").length || 0;
      const failed = requests?.filter((r: any) => r.status === "failed" || r.status === "error").length || 0;
      const processing = requests?.filter((r: any) => r.status === "processing").length || 0;

      const avgLatency = responses?.length
        ? Math.round(responses.reduce((s: number, r: any) => s + (r.latency_ms || 0), 0) / responses.length)
        : 0;
      const avgConfidence = responses?.length
        ? parseFloat((responses.reduce((s: number, r: any) => s + (r.confidence || 0), 0) / responses.length).toFixed(2))
        : 0;

      const byComplexity: Record<string, number> = {};
      for (const r of requests || []) { byComplexity[r.complexity || "unknown"] = (byComplexity[r.complexity || "unknown"] || 0) + 1; }

      const byModel: Record<string, { count: number; tokens: number }> = {};
      for (const r of responses || []) {
        const m = r.model_used || "unknown";
        if (!byModel[m]) byModel[m] = { count: 0, tokens: 0 };
        byModel[m].count++;
        byModel[m].tokens += r.tokens_used || 0;
      }

      result = {
        status: failed > total * 0.1 ? "degraded" : "healthy",
        summary: `${completed}/${total} completed. Avg latency: ${avgLatency}ms. Confidence: ${avgConfidence}.`,
        total_requests: total, completed, failed, processing,
        avg_latency_ms: avgLatency, avg_confidence: avgConfidence,
        by_complexity: byComplexity, by_model: byModel, period_days: days,
      };
    }

    // ══════════════════════════════════════════════
    // COSTS (existing, enhanced)
    // ══════════════════════════════════════════════
    else if (path === "costs") {
      const { data: responses } = await supabase
        .from("advisor_responses")
        .select("model_used, tokens_used, created_at")
        .eq("user_id", user.id)
        .gte("created_at", since)
        .limit(1000);

      const totalTokens = responses?.reduce((s: number, r: any) => s + (r.tokens_used || 0), 0) || 0;

      const byDay: Record<string, { tokens: number; requests: number }> = {};
      for (const r of responses || []) {
        const day = r.created_at.split("T")[0];
        if (!byDay[day]) byDay[day] = { tokens: 0, requests: 0 };
        byDay[day].tokens += r.tokens_used || 0;
        byDay[day].requests++;
      }

      const byModel: Record<string, number> = {};
      for (const r of responses || []) {
        const m = r.model_used || "unknown";
        byModel[m] = (byModel[m] || 0) + (r.tokens_used || 0);
      }

      result = {
        summary: `${totalTokens.toLocaleString()} tokens across ${responses?.length || 0} requests (${days}d).`,
        total_tokens: totalTokens,
        total_requests: responses?.length || 0,
        by_day: byDay, by_model: byModel, period_days: days,
      };
    }

    // ══════════════════════════════════════════════
    // INTELLIGENCE DASHBOARD
    // ══════════════════════════════════════════════
    else if (path === "intelligence") {
      // Aggregate multiple signals into a dashboard
      const [incidentsRes, responsesRes, workflowsRes] = await Promise.all([
        supabase.from("admin_incidents").select("severity, status, created_at").eq("created_by", user.id).gte("created_at", since),
        supabase.from("advisor_responses").select("latency_ms, tokens_used, confidence, created_at").eq("user_id", user.id).gte("created_at", since).limit(500),
        supabase.from("workflow_runs").select("status, created_at").eq("user_id", user.id).gte("created_at", since).limit(500),
      ]);

      const incidents = incidentsRes.data || [];
      const responses = responsesRes.data || [];
      const workflows = workflowsRes.data || [];

      // Anomaly detection: simple 6-sigma on latency
      const latencies = responses.map((r: any) => r.latency_ms || 0).filter((l: number) => l > 0);
      const mean = latencies.length ? latencies.reduce((a: number, b: number) => a + b, 0) / latencies.length : 0;
      const variance = latencies.length ? latencies.reduce((sum: number, val: number) => sum + Math.pow(val - mean, 2), 0) / latencies.length : 0;
      const stddev = Math.sqrt(variance);

      const anomalies = latencies
        .map((l: number, i: number) => ({ value: l, sigma: stddev > 0 ? Math.abs((l - mean) / stddev) : 0, index: i }))
        .filter((a: any) => a.sigma > 3)
        .slice(0, 5);

      // Incident forecasting: trend-based
      const recentIncidents = incidents.filter((i: any) => {
        const age = Date.now() - new Date(i.created_at).getTime();
        return age < 48 * 3600000;
      });
      const olderIncidents = incidents.filter((i: any) => {
        const age = Date.now() - new Date(i.created_at).getTime();
        return age >= 48 * 3600000;
      });

      const trendDirection = recentIncidents.length > olderIncidents.length / Math.max(1, (days - 2)) * 2 ? "increasing" : "stable";

      const forecasts = [];
      if (trendDirection === "increasing") {
        forecasts.push({
          type: "incident-spike",
          probability: 0.72,
          timeWindow: "48h",
          preventiveMeasures: ["Review recent configuration changes", "Check upstream service health", "Increase monitoring sensitivity"],
        });
      }
      if (anomalies.length > 2) {
        forecasts.push({
          type: "latency-degradation",
          probability: 0.65,
          timeWindow: "24h",
          preventiveMeasures: ["Optimize database queries", "Check connection pool usage", "Review cache hit rates"],
        });
      }

      // Cost optimization
      const totalTokens = responses.reduce((s: number, r: any) => s + (r.tokens_used || 0), 0);
      const costSuggestions = [];
      if (totalTokens > 50000) {
        costSuggestions.push({
          type: "model-routing",
          title: "Route simple queries to lighter models",
          projectedSavings: `${Math.round(totalTokens * 0.3)} tokens/period (~$${(totalTokens * 0.3 * 0.00003).toFixed(2)})`,
          confidence: 0.82,
        });
      }

      const failedWorkflows = workflows.filter((w: any) => w.status === "failed").length;
      if (failedWorkflows > 3) {
        costSuggestions.push({
          type: "workflow-optimization",
          title: "Fix failing workflows to reduce retry costs",
          projectedSavings: `${failedWorkflows} fewer retries/period`,
          confidence: 0.78,
        });
      }

      result = {
        anomalies: {
          detected: anomalies.length,
          items: anomalies.map((a: any) => ({
            metric: "latency_ms",
            value: a.value,
            sigma: parseFloat(a.sigma.toFixed(2)),
            severity: a.sigma > 6 ? "critical" : a.sigma > 4 ? "warning" : "info",
          })),
          baseline: { mean: Math.round(mean), stddev: Math.round(stddev) },
        },
        forecasts,
        cost_optimization: costSuggestions,
        system_health: {
          incident_trend: trendDirection,
          recent_incidents: recentIncidents.length,
          avg_latency_ms: Math.round(mean),
          workflow_success_rate: workflows.length > 0
            ? parseFloat(((workflows.filter((w: any) => w.status === "completed").length / workflows.length) * 100).toFixed(1))
            : 100,
        },
        period_days: days,
      };
    }

    // ══════════════════════════════════════════════
    // CONNECTOR HEALTH (existing, enhanced)
    // ══════════════════════════════════════════════
    else if (path === "connector-health") {
      const { data: connectors } = await supabase
        .from("connector_configs")
        .select("id, service, status, last_sync_at, created_at")
        .eq("user_id", user.id);

      const healthy = connectors?.filter((c: any) => c.status === "active").length || 0;
      const stale = connectors?.filter((c: any) => {
        if (!c.last_sync_at) return true;
        return (Date.now() - new Date(c.last_sync_at).getTime()) > 24 * 3600000;
      }).length || 0;

      result = {
        status: stale > 0 ? "stale_detected" : "healthy",
        summary: `${connectors?.length || 0} connectors. ${healthy} active, ${stale} stale.`,
        total: connectors?.length || 0, active: healthy, stale,
        connectors: connectors || [],
      };
    }

    // ══════════════════════════════════════════════
    // APPROVALS (existing)
    // ══════════════════════════════════════════════
    else if (path === "approvals") {
      const { data: pending } = await supabase
        .from("approval_queue")
        .select("id, action_summary, proposed_action, status, created_at")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      const { data: recent } = await supabase
        .from("approval_queue")
        .select("id, action_summary, status, decided_at, decision_reason, created_at")
        .eq("user_id", user.id)
        .neq("status", "pending")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(50);

      result = {
        summary: `${pending?.length || 0} pending. ${recent?.length || 0} decided (${days}d).`,
        pending: pending || [],
        recent_decisions: recent || [],
      };
    }

    // ══════════════════════════════════════════════
    // MEMORY (existing)
    // ══════════════════════════════════════════════
    else if (path === "memory") {
      const { data: memory } = await supabase
        .from("user_memory")
        .select("category, key, value, source, confidence, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(100);

      const byCategory: Record<string, number> = {};
      for (const m of memory || []) { byCategory[m.category] = (byCategory[m.category] || 0) + 1; }

      result = {
        summary: `${memory?.length || 0} records across ${Object.keys(byCategory).length} categories.`,
        total: memory?.length || 0, by_category: byCategory, records: memory || [],
      };
    }

    // ══════════════════════════════════════════════
    // WORKFLOW HEALTH (existing)
    // ══════════════════════════════════════════════
    else if (path === "workflow-health") {
      const { data: runs } = await supabase
        .from("workflow_runs")
        .select("status, created_at, completed_at")
        .eq("user_id", user.id)
        .gte("created_at", since)
        .limit(500);

      const byStatus: Record<string, number> = {};
      for (const r of runs || []) { byStatus[r.status] = (byStatus[r.status] || 0) + 1; }

      result = {
        status: (byStatus["failed"] || 0) > 0 ? "issues" : "healthy",
        summary: `${runs?.length || 0} workflow runs. ${byStatus["completed"] || 0} completed, ${byStatus["failed"] || 0} failed.`,
        total_runs: runs?.length || 0, by_status: byStatus, period_days: days,
      };
    }

    // ══════════════════════════════════════════════
    // DEFAULT — endpoint index
    // ══════════════════════════════════════════════
    else {
      result = {
        endpoints: [
          "incidents", "policies", "simulate", "audit-logs", "audit-export",
          "fleet-health", "device-restart", "council", "council-vote",
          "agent-health", "costs", "intelligence", "connector-health",
          "approvals", "memory", "workflow-health",
        ],
        usage: "Append endpoint name to URL path. Optional: ?days=7, ?status=open, ?severity=high",
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
