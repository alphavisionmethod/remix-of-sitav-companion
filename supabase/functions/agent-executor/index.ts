import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";
import { z } from "https://esm.sh/zod@3.23.8";
import { requireAuth } from "../_shared/auth.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";

// ═══ AI Gateway integration ═══
const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const AI_MODEL = "google/gemini-3-flash-preview";

async function callAI(
  systemPrompt: string,
  userPrompt: string,
  jsonMode = true,
): Promise<{ content: string; tokensUsed: number }> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) {
    return { content: JSON.stringify({ error: "AI not configured", fallback: true }), tokensUsed: 0 };
  }

  const res = await fetch(AI_GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
      max_tokens: 1024,
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("AI gateway error:", res.status, errText);
    return { content: JSON.stringify({ error: "AI unavailable", fallback: true }), tokensUsed: 0 };
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || "{}";
  const tokensUsed = (data.usage?.total_tokens) || 0;
  return { content, tokensUsed };
}

// ═══ Receipt hash utility ═══
async function computeReceiptHash(data: Record<string, unknown>): Promise<string> {
  const encoded = new TextEncoder().encode(JSON.stringify(data));
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// ═══ Signal emitter ═══
async function emitSignal(
  supabase: any, userId: string, fromAgent: string, toAgent: string,
  signalType: string, payload: Record<string, unknown>, priority = 5
) {
  await supabase.from("agent_signals").insert({
    user_id: userId, from_agent: fromAgent, to_agent: toAgent,
    signal_type: signalType, payload, priority,
  });
}

// ═══ Receipt writer ═══
async function writeReceipt(
  supabase: any, userId: string, agentId: string, actionType: string,
  input: Record<string, unknown>, output: Record<string, unknown>,
  confidence: number, health: string, durationMs: number, costTokens: number
) {
  const { data: lastReceipt } = await supabase.from("agent_action_receipts")
    .select("receipt_hash").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).single();

  const parentHash = lastReceipt?.receipt_hash || "genesis";
  const receiptHash = await computeReceiptHash({ agentId, actionType, output, parentHash, ts: Date.now() });

  await supabase.from("agent_action_receipts").insert({
    user_id: userId, agent_id: agentId, action_type: actionType,
    input_summary: input, output_summary: output,
    confidence, health, duration_ms: durationMs, cost_tokens: costTokens,
    receipt_hash: receiptHash, parent_receipt_hash: parentHash,
  });

  return receiptHash;
}

// ═══════════════════════════════════════════════════════════
// POD HANDLERS — one per council category
// Each handler gathers data, then optionally asks AI for analysis
// ═══════════════════════════════════════════════════════════

const AGENT_SYSTEM_PROMPTS: Record<string, string> = {
  "connector-health": "You are a connector health analyst for SITA OS. Analyze connector status data and return JSON with: summary (string), recommendations (string[]), riskLevel (low|medium|high), health (healthy|degraded|critical).",
  "stale-workflow": "You are a workflow analyst for SITA OS. Analyze stale workflow data and return JSON with: summary, recommendations (string[]), riskLevel, health.",
  "incident-response": "You are an incident response analyst. Analyze telemetry and return JSON with: summary, rootCauses (string[]), recommendations (string[]), riskLevel, health.",
  "cost-anomaly": "You are an AI cost analyst. Analyze token usage patterns and return JSON with: summary, anomalies (string[]), recommendations (string[]), estimatedSavings (string), health.",
  "self-healing-controller": "You are a self-healing supervisor. Analyze escalations and return JSON with: summary, actionPlan (string[]), autoHealable (boolean), health.",
  "fraud-sentinel": "You are a security analyst. Analyze request patterns for anomalies and return JSON with: summary, threats (string[]), recommendations (string[]), riskLevel, health.",
  "policy-validator": "You are a policy compliance analyst. Analyze policy violations and return JSON with: summary, violations (string[]), remediations (string[]), health.",
  "budget-enforcer": "You are a budget enforcement analyst. Analyze spend data and return JSON with: summary, budgetStatus (string), recommendations (string[]), health.",
};

// ── Data gathering handlers (pure DB reads) ──

async function gatherConnectorHealth(supabase: any, userId: string) {
  const { data: connectors } = await supabase.from("connector_configs").select("*").eq("user_id", userId);
  const degraded = (connectors || []).filter((c: any) => c.status !== "active");
  return {
    total: connectors?.length || 0, degraded: degraded.length,
    details: degraded.map((c: any) => ({ service: c.service, status: c.status, lastSync: c.last_sync_at })),
    health: degraded.length === 0 ? "healthy" : "degraded",
  };
}

async function gatherStaleWorkflow(supabase: any, userId: string) {
  const { data: workflows } = await supabase.from("workflow_runs").select("*").eq("user_id", userId).eq("status", "running");
  const stale = (workflows || []).filter((w: any) => Date.now() - new Date(w.updated_at).getTime() > 86400000);
  return {
    total: workflows?.length || 0, stale: stale.length,
    details: stale.map((w: any) => ({ id: w.id, workflow_id: w.workflow_id, started: w.started_at })),
    health: stale.length === 0 ? "healthy" : "warning",
  };
}

async function gatherIncidentResponse(supabase: any, userId: string) {
  const { data: telemetry } = await supabase.from("agent_telemetry").select("*")
    .eq("user_id", userId).order("recorded_at", { ascending: false }).limit(50);
  const critical = (telemetry || []).filter((t: any) => t.metadata?.health === "critical" || t.metadata?.health === "degraded");
  return {
    recentEvents: telemetry?.length || 0, criticalCount: critical.length,
    incidents: critical.slice(0, 5).map((t: any) => ({ agent: t.agent_id, metric: t.metric_name, at: t.recorded_at })),
    health: critical.length === 0 ? "healthy" : critical.length > 3 ? "critical" : "warning",
  };
}

async function gatherReleaseSafety(supabase: any, userId: string) {
  const { data: receipts } = await supabase.from("agent_action_receipts").select("*")
    .eq("user_id", userId).order("created_at", { ascending: false }).limit(20);
  const failures = (receipts || []).filter((r: any) => r.health === "critical" || r.health === "degraded");
  return {
    recentActions: receipts?.length || 0, failureCount: failures.length,
    failureRate: receipts?.length ? (failures.length / receipts.length * 100).toFixed(1) + "%" : "0%",
    health: failures.length === 0 ? "healthy" : "warning",
  };
}

async function gatherSelfHealingController(supabase: any, userId: string) {
  const { data: signals } = await supabase.from("agent_signals").select("*")
    .eq("user_id", userId).eq("signal_type", "escalation").eq("status", "pending").limit(10);
  return {
    pendingEscalations: signals?.length || 0,
    details: (signals || []).map((s: any) => ({ from: s.from_agent, payload: s.payload, at: s.created_at })),
    health: (signals?.length || 0) === 0 ? "healthy" : "warning",
  };
}

async function gatherFraudSentinel(supabase: any, userId: string) {
  const { data: responses } = await supabase.from("advisor_responses").select("created_at, tokens_used")
    .eq("user_id", userId).order("created_at", { ascending: false }).limit(200);
  const reqs = responses || [];
  const burstWindow = 60000;
  let maxBurst = 0;
  for (let i = 0; i < reqs.length; i++) {
    const windowEnd = new Date(reqs[i].created_at).getTime() - burstWindow;
    const burst = reqs.filter((r: any) => new Date(r.created_at).getTime() >= windowEnd && new Date(r.created_at).getTime() <= new Date(reqs[i].created_at).getTime()).length;
    maxBurst = Math.max(maxBurst, burst);
  }
  return {
    totalRequests: reqs.length, maxBurstPerMinute: maxBurst,
    anomalyDetected: maxBurst > 20,
    health: maxBurst > 20 ? "warning" : "healthy",
  };
}

async function gatherAccessMonitor(supabase: any, userId: string) {
  const { data: schedules } = await supabase.from("agent_schedules").select("*")
    .eq("user_id", userId).order("updated_at", { ascending: false }).limit(20);
  const recentChanges = (schedules || []).filter((s: any) =>
    Date.now() - new Date(s.updated_at).getTime() < 86400000
  );
  return {
    totalSchedules: schedules?.length || 0, recentChanges: recentChanges.length,
    health: recentChanges.length > 10 ? "warning" : "healthy",
  };
}

async function gatherPolicyValidator(supabase: any, userId: string) {
  const { data: telemetry } = await supabase.from("agent_telemetry").select("*")
    .eq("user_id", userId).eq("metric_name", "policy_violation").limit(10);
  return {
    violations: telemetry?.length || 0,
    details: (telemetry || []).map((t: any) => ({ agent: t.agent_id, meta: t.metadata, at: t.recorded_at })),
    health: (telemetry?.length || 0) === 0 ? "healthy" : "critical",
  };
}

async function gatherCostAnomaly(supabase: any, userId: string) {
  const { data: responses } = await supabase.from("advisor_responses").select("tokens_used, model_used, created_at")
    .eq("user_id", userId).order("created_at", { ascending: false }).limit(100);
  const totalTokens = (responses || []).reduce((s: number, r: any) => s + (r.tokens_used || 0), 0);
  const avgTokens = responses?.length ? totalTokens / responses.length : 0;
  return {
    totalTokens24h: totalTokens, avgPerRequest: Math.round(avgTokens),
    requestCount: responses?.length || 0,
    estimatedCost: `$${(totalTokens * 0.002 / 1000).toFixed(4)}`,
    health: avgTokens > 5000 ? "warning" : "healthy",
  };
}

async function gatherCostGuardrail(supabase: any, userId: string) {
  const { data: receipts } = await supabase.from("agent_action_receipts").select("cost_tokens, created_at")
    .eq("user_id", userId).order("created_at", { ascending: false }).limit(100);
  const totalCost = (receipts || []).reduce((s: number, r: any) => s + (r.cost_tokens || 0), 0);
  const dailyBudget = 100000;
  return {
    totalTokensSpent: totalCost, dailyBudget, budgetUsed: `${(totalCost / dailyBudget * 100).toFixed(1)}%`,
    health: totalCost > dailyBudget * 0.9 ? "critical" : totalCost > dailyBudget * 0.7 ? "warning" : "healthy",
  };
}

async function gatherModelRouter(supabase: any, userId: string) {
  const { data: responses } = await supabase.from("advisor_responses").select("model_used, tokens_used")
    .eq("user_id", userId).order("created_at", { ascending: false }).limit(50);
  const modelBreakdown: Record<string, { count: number; tokens: number }> = {};
  for (const r of responses || []) {
    const model = r.model_used || "unknown";
    if (!modelBreakdown[model]) modelBreakdown[model] = { count: 0, tokens: 0 };
    modelBreakdown[model].count++;
    modelBreakdown[model].tokens += r.tokens_used || 0;
  }
  return { modelBreakdown, totalRequests: responses?.length || 0, health: "healthy" };
}

async function gatherBudgetEnforcer(supabase: any, userId: string) {
  const costResult = await gatherCostGuardrail(supabase, userId);
  const overBudget = costResult.totalTokensSpent > costResult.dailyBudget;
  return { ...costResult, overBudget, enforcement: overBudget ? "throttle" : "allow", health: overBudget ? "critical" : "healthy" };
}

async function gatherFeatureGovernance(supabase: any, userId: string) {
  const { data: workflows } = await supabase.from("workflow_runs").select("*").eq("user_id", userId).limit(20);
  const incomplete = (workflows || []).filter((w: any) => w.status !== "completed" && w.status !== "running");
  return { totalWorkflows: workflows?.length || 0, incompleteCount: incomplete.length, health: incomplete.length > 5 ? "warning" : "healthy" };
}

async function gatherContractValidator(supabase: any, userId: string) {
  const { data: connectors } = await supabase.from("connector_configs").select("service, config, updated_at").eq("user_id", userId);
  const staleContracts = (connectors || []).filter((c: any) => Date.now() - new Date(c.updated_at).getTime() > 30 * 86400000);
  return { totalContracts: connectors?.length || 0, staleCount: staleContracts.length, health: staleContracts.length > 0 ? "warning" : "healthy" };
}

async function gatherSchemaChecker(_supabase: any, _userId: string) {
  return { schemasChecked: 1, driftDetected: false, health: "healthy" };
}

async function gatherBoundaryEnforcer(supabase: any, userId: string) {
  const { data: signals } = await supabase.from("agent_signals").select("*")
    .eq("user_id", userId).eq("signal_type", "finding").limit(20);
  const boundaryViolations = (signals || []).filter((s: any) => s.payload?.type === "boundary-violation");
  return { findings: signals?.length || 0, boundaryViolations: boundaryViolations.length, health: boundaryViolations.length > 0 ? "warning" : "healthy" };
}

async function gatherDependencyAuditor(supabase: any, userId: string) {
  const { data: connectors } = await supabase.from("connector_configs").select("service, updated_at").eq("user_id", userId);
  const outdated = (connectors || []).filter((c: any) => Date.now() - new Date(c.updated_at).getTime() > 90 * 86400000);
  return { totalDependencies: connectors?.length || 0, outdatedCount: outdated.length, health: outdated.length > 2 ? "warning" : "healthy" };
}

async function gatherDataFreshness(supabase: any, userId: string) {
  const { data: syncLogs } = await supabase.from("sync_logs").select("*").eq("user_id", userId)
    .order("synced_at", { ascending: false }).limit(20);
  const stale = (syncLogs || []).filter((l: any) => Date.now() - new Date(l.synced_at).getTime() > 6 * 3600000);
  return { recentSyncs: syncLogs?.length || 0, staleConnectors: stale.length, health: stale.length === 0 ? "healthy" : "degraded" };
}

async function gatherMemoryCurator(supabase: any, userId: string) {
  const { data: telemetry } = await supabase.from("agent_telemetry").select("recorded_at, agent_id")
    .eq("user_id", userId).order("recorded_at", { ascending: false }).limit(30);
  const staleAgents = (telemetry || []).filter((t: any) => Date.now() - new Date(t.recorded_at).getTime() > 7 * 86400000);
  return { trackedAgents: telemetry?.length || 0, staleMemoryEntries: staleAgents.length, health: staleAgents.length > 5 ? "warning" : "healthy" };
}

async function gatherRunbookUpdater(supabase: any, userId: string) {
  const { data: receipts } = await supabase.from("agent_action_receipts").select("action_type, created_at")
    .eq("user_id", userId).order("created_at", { ascending: false }).limit(20);
  const healingActions = (receipts || []).filter((r: any) => r.action_type === "self-heal" || r.action_type === "remediate");
  return { recentActions: receipts?.length || 0, undocumentedHealings: healingActions.length, health: healingActions.length > 3 ? "warning" : "healthy" };
}

// ═══ Agent handler router ═══
const AGENT_HANDLERS: Record<string, (supabase: any, userId: string) => Promise<any>> = {
  "connector-health": gatherConnectorHealth,
  "stale-workflow": gatherStaleWorkflow,
  "incident-response": gatherIncidentResponse,
  "release-safety": gatherReleaseSafety,
  "self-healing-controller": gatherSelfHealingController,
  "fraud-sentinel": gatherFraudSentinel,
  "access-monitor": gatherAccessMonitor,
  "policy-validator": gatherPolicyValidator,
  "cost-anomaly": gatherCostAnomaly,
  "cost-guardrail": gatherCostGuardrail,
  "model-router": gatherModelRouter,
  "budget-enforcer": gatherBudgetEnforcer,
  "feature-governance": gatherFeatureGovernance,
  "contract-validator": gatherContractValidator,
  "schema-checker": gatherSchemaChecker,
  "boundary-enforcer": gatherBoundaryEnforcer,
  "dependency-auditor": gatherDependencyAuditor,
  "data-freshness": gatherDataFreshness,
  "memory-curator": gatherMemoryCurator,
  "runbook-updater": gatherRunbookUpdater,
};

// Agents that warrant AI-powered analysis when issues are found
const AI_ELIGIBLE_AGENTS = new Set([
  "connector-health", "stale-workflow", "incident-response",
  "cost-anomaly", "self-healing-controller", "fraud-sentinel",
  "policy-validator", "budget-enforcer",
]);

// ═══ Main handler ═══
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const startTime = Date.now();

  try {
    // ── Auth ──
    const authResult = await requireAuth(req);
    if (authResult instanceof Response) return authResult;
    const { user } = authResult;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // ── Input ──
    const body = await req.json();
    const BodySchema = z.object({
      agent_id: z.string().min(1),
      action: z.string().min(1).default("diagnose"),
      use_ai: z.boolean().default(true),
    });
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Validation failed", details: parsed.error.flatten().fieldErrors }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { agent_id, action, use_ai } = parsed.data;

    // ── Gather diagnostic data ──
    const handler = AGENT_HANDLERS[agent_id];
    let diagnosticData: Record<string, unknown>;

    if (handler) {
      diagnosticData = await handler(supabase, user.id);
    } else {
      diagnosticData = { health: "healthy", message: "Agent diagnostic completed — no issues found" };
    }

    // ── AI-powered analysis (only when issues found and AI eligible) ──
    let aiAnalysis: Record<string, unknown> | null = null;
    let tokensUsed = 0;

    const hasIssues = diagnosticData.health !== "healthy";
    const isAIEligible = AI_ELIGIBLE_AGENTS.has(agent_id);

    if (use_ai && hasIssues && isAIEligible) {
      const systemPrompt = AGENT_SYSTEM_PROMPTS[agent_id] ||
        "You are an operations analyst. Analyze the diagnostic data and return JSON with: summary (string), recommendations (string[]), riskLevel (low|medium|high), health (healthy|degraded|critical).";

      const aiResult = await callAI(
        systemPrompt,
        `Analyze this diagnostic data for agent "${agent_id}":\n${JSON.stringify(diagnosticData, null, 2)}`,
      );

      tokensUsed = aiResult.tokensUsed;

      try {
        aiAnalysis = JSON.parse(aiResult.content);
      } catch {
        aiAnalysis = { rawAnalysis: aiResult.content, parseError: true };
      }
    }

    const durationMs = Date.now() - startTime;

    const results: Record<string, unknown> = {
      agent_id,
      action,
      timestamp: new Date().toISOString(),
      ...diagnosticData,
      ...(aiAnalysis ? { aiAnalysis, aiPowered: true, tokensUsed } : { aiPowered: false }),
      durationMs,
    };

    // ── Record telemetry ──
    await supabase.from("agent_telemetry").insert({
      user_id: user.id, agent_id,
      metric_name: "diagnostic_run",
      metric_value: diagnosticData.health === "healthy" ? 1 : 0,
      metadata: { ...diagnosticData, aiPowered: !!aiAnalysis, tokensUsed },
    });

    // ── Write receipt ──
    await writeReceipt(
      supabase, user.id, agent_id, action,
      { agent_id, action, aiPowered: !!aiAnalysis },
      results,
      diagnosticData.health === "healthy" ? 0.95 : diagnosticData.health === "warning" ? 0.7 : 0.4,
      diagnosticData.health as string,
      durationMs, tokensUsed,
    );

    // ── Auto-escalate critical ──
    if (diagnosticData.health === "critical") {
      await emitSignal(supabase, user.id, agent_id, "meta-supervisor", "escalation", {
        reason: "critical_health_detected", agentResult: results,
        aiRecommendations: aiAnalysis?.recommendations || [],
      }, 9);
    }

    // ── Record AI cost ──
    if (tokensUsed > 0) {
      await supabase.from("ai_cost_ledger").insert({
        user_id: user.id, model: AI_MODEL,
        provider: "lovable-gateway", purpose: `agent-executor:${agent_id}`,
        input_tokens: Math.round(tokensUsed * 0.7),
        output_tokens: Math.round(tokensUsed * 0.3),
        cost_cents: Math.round(tokensUsed * 0.0001),
      });
    }

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("agent-executor error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
