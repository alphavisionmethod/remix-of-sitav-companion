import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";
import { z } from "https://esm.sh/zod@3.23.8";

// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Agent Loop
// Autonomous runtime for domain advisor agents (money, business, concierge)
// Each invocation: observe → diagnose → recommend/act with 9-gate security
// ═══════════════════════════════════════════════════════════════

// --- Constants ---

const NEVER_ALLOWED_ACTIONS = [
  "delete_financial_records",
  "transfer_funds",
  "modify_auth",
  "export_all_data",
  "change_permissions",
  "delete_user_data",
];

const MUST_REQUIRE_APPROVAL = [
  "create_payment_plan",
  "send_notification",
  "modify_automation",
  "create_obligation",
  "archive_records",
];

const DOMAIN_TABLES: Record<string, string[]> = {
  money: ["grocery_items", "grocery_lists", "concierge_recurring_obligations"],
  business: ["appointments", "service_providers_list"],
  concierge: [
    "concierge_errands", "concierge_documents", "concierge_automations",
    "concierge_recurring_obligations", "school_activities",
    "travel_plans", "gift_tracker", "appointments",
  ],
};

const DOMAIN_SYSTEM_PROMPTS: Record<string, string> = {
  "money-guardian": `You are the Money Guardian advisor agent for SITA OS. You proactively monitor the user's financial health: bills, receivables, cash flow, and subscriptions. Identify overdue payments, wasteful spending, and cash flow risks. Be precise, evidence-based, and never alarming. Output JSON with: observations (array), recommendations (array of {title, summary, confidence, action_type, severity}), and health_score (0-100).`,
  "money-sentinel": `You are the Money Sentinel advisor agent for SITA OS. You watch for financial anomalies: unusual spending patterns, duplicate charges, and fraud indicators. Be vigilant but avoid false positives. Output JSON with: anomalies (array), alerts (array of {title, summary, confidence, severity}), and risk_score (0-100).`,
  "business-scout": `You are the Business Scout advisor agent for SITA OS. You proactively monitor leads, pipeline health, and follow-up cadence. Identify stale leads, missed follow-ups, and pipeline gaps. Output JSON with: observations (array), recommendations (array of {title, summary, confidence, action_type, severity}), and pipeline_score (0-100).`,
  "business-strategist": `You are the Business Strategist advisor agent for SITA OS. You analyze revenue trends, customer health, and growth forecasts. Provide weekly digest material and churn risk alerts. Output JSON with: insights (array), recommendations (array of {title, summary, confidence, action_type, severity}), and strategy_score (0-100).`,
  "concierge-pilot": `You are the Concierge Pilot advisor agent for SITA OS. You proactively manage errands, groceries, recurring tasks, and travel prep. Identify upcoming obligations, suggest optimizations, and flag overdue items. Output JSON with: observations (array), recommendations (array of {title, summary, confidence, action_type, severity}), and readiness_score (0-100).`,
  "concierge-coordinator": `You are the Concierge Coordinator advisor agent for SITA OS. You coordinate family schedules, school activities, events, and gifts. Identify scheduling conflicts, upcoming events needing prep, and gift deadlines. Output JSON with: observations (array), recommendations (array of {title, summary, confidence, action_type, severity}), and coordination_score (0-100).`,
};

// --- Helpers ---

function hashReceipt(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `rcpt_${Math.abs(hash).toString(36)}_${Date.now().toString(36)}`;
}

// --- 9-Gate Security Pipeline ---

interface GateResult {
  passed: boolean;
  gate: string;
  reason?: string;
}

function identityGate(userId: string | null): GateResult {
  return userId
    ? { passed: true, gate: "identity" }
    : { passed: false, gate: "identity", reason: "No authenticated user" };
}

function scopeGate(advisorId: string, domain: string): GateResult {
  const allowed = DOMAIN_TABLES[domain];
  if (!allowed) return { passed: false, gate: "scope", reason: `Unknown domain: ${domain}` };
  return { passed: true, gate: "scope" };
}

function budgetGate(agent: { tokens_used_today: number; budget_daily_tokens: number }): GateResult {
  if (agent.tokens_used_today >= agent.budget_daily_tokens) {
    return { passed: false, gate: "budget", reason: "Daily token budget exhausted" };
  }
  return { passed: true, gate: "budget" };
}

function rateLimitGate(agent: { invocations_today: number; max_invocations_per_hour: number }): GateResult {
  if (agent.invocations_today >= agent.max_invocations_per_hour * 24) {
    return { passed: false, gate: "rate_limit", reason: "Rate limit exceeded" };
  }
  return { passed: true, gate: "rate_limit" };
}

function policyGate(actionType: string): GateResult {
  if (NEVER_ALLOWED_ACTIONS.includes(actionType)) {
    return { passed: false, gate: "policy", reason: `Action '${actionType}' is never allowed` };
  }
  return { passed: true, gate: "policy" };
}

function confidenceGate(confidence: number, threshold: number): GateResult {
  if (confidence < threshold) {
    return { passed: false, gate: "confidence", reason: `Confidence ${confidence} below threshold ${threshold}` };
  }
  return { passed: true, gate: "confidence" };
}

function killSwitchGate(isActive: boolean): GateResult {
  return isActive
    ? { passed: true, gate: "kill_switch" }
    : { passed: false, gate: "kill_switch", reason: "Agent is deactivated" };
}

// --- Main Handler ---

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // --- Gate 1: Identity ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: claimsData, error: claimsError } = await userClient.auth.getUser();
    if (claimsError || !claimsData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.user.id;
    const idGate = identityGate(userId);
    if (!idGate.passed) {
      return new Response(JSON.stringify({ error: idGate.reason }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse optional body
    let targetAdvisorId: string | null = null;
    if (req.method === "POST") {
      try {
        const body = await req.json();
        const schema = z.object({ advisor_id: z.string().optional() });
        const parsed = schema.safeParse(body);
        if (parsed.success && parsed.data.advisor_id) {
          targetAdvisorId = parsed.data.advisor_id;
        }
      } catch (_) { /* empty body OK */ }
    }

    // Load advisor configs for user
    const serviceClient = createClient(supabaseUrl, serviceRoleKey);

    const agentQuery = serviceClient
      .from("advisor_agents")
      .select("*")
      .eq("user_id", userId);

    if (targetAdvisorId) {
      agentQuery.eq("advisor_id", targetAdvisorId);
    }

    const { data: agents, error: agentsError } = await agentQuery;
    if (agentsError) {
      return new Response(JSON.stringify({ error: "Failed to load advisor agents" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!agents || agents.length === 0) {
      return new Response(JSON.stringify({
        message: "No advisor agents configured",
        hint: "Create advisor agents via the admin dashboard first",
      }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: Array<{
      advisor_id: string;
      status: string;
      gates_passed: string[];
      gates_failed: string[];
      actions_created: number;
      receipt_hash: string | null;
    }> = [];

    // Process each active advisor
    for (const agent of agents) {
      const gatesPassed: string[] = [];
      const gatesFailed: string[] = [];

      // Gate 9: Kill switch
      const ks = killSwitchGate(agent.is_active);
      if (!ks.passed) {
        gatesFailed.push(`${ks.gate}: ${ks.reason}`);
        results.push({ advisor_id: agent.advisor_id, status: "skipped", gates_passed: gatesPassed, gates_failed: gatesFailed, actions_created: 0, receipt_hash: null });
        continue;
      }
      gatesPassed.push("kill_switch");

      // Gate 2: Scope
      const sg = scopeGate(agent.advisor_id, agent.domain);
      if (!sg.passed) {
        gatesFailed.push(`${sg.gate}: ${sg.reason}`);
        results.push({ advisor_id: agent.advisor_id, status: "scope_denied", gates_passed: gatesPassed, gates_failed: gatesFailed, actions_created: 0, receipt_hash: null });
        continue;
      }
      gatesPassed.push("scope");

      // Gate 3: Budget
      const bg = budgetGate(agent);
      if (!bg.passed) {
        gatesFailed.push(`${bg.gate}: ${bg.reason}`);
        results.push({ advisor_id: agent.advisor_id, status: "budget_exhausted", gates_passed: gatesPassed, gates_failed: gatesFailed, actions_created: 0, receipt_hash: null });
        continue;
      }
      gatesPassed.push("budget");

      // Gate 8: Rate limit
      const rl = rateLimitGate(agent);
      if (!rl.passed) {
        gatesFailed.push(`${rl.gate}: ${rl.reason}`);
        results.push({ advisor_id: agent.advisor_id, status: "rate_limited", gates_passed: gatesPassed, gates_failed: gatesFailed, actions_created: 0, receipt_hash: null });
        continue;
      }
      gatesPassed.push("rate_limit");

      // --- Observe: Gather domain data ---
      const domainTables = DOMAIN_TABLES[agent.domain] || [];
      const domainData: Record<string, unknown[]> = {};

      for (const table of domainTables) {
        const { data: tableData } = await serviceClient
          .from(table)
          .select("*")
          .eq("user_id", userId)
          .limit(50)
          .order("created_at", { ascending: false });
        domainData[table] = tableData || [];
      }

      // --- Diagnose: AI analysis ---
      const systemPrompt = DOMAIN_SYSTEM_PROMPTS[agent.advisor_id] ||
        `You are the ${agent.display_name} advisor agent. Analyze the provided data and output JSON with observations, recommendations, and a health_score.`;

      const userPrompt = `Analyze this domain data and provide observations and recommendations:\n\n${JSON.stringify(domainData, null, 2)}`;

      let aiResponse: { recommendations?: Array<{ title: string; summary: string; confidence: number; action_type: string; severity: string }> } = { recommendations: [] };

      try {
        const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
        if (lovableApiKey) {
          const aiResp = await fetch("https://ai-gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${lovableApiKey}`,
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
              ],
              response_format: { type: "json_object" },
              max_tokens: 2000,
              temperature: 0.3,
            }),
          });

          if (aiResp.ok) {
            const aiData = await aiResp.json();
            const content = aiData.choices?.[0]?.message?.content;
            if (content) {
              try {
                aiResponse = JSON.parse(content);
              } catch (_) {
                aiResponse = { recommendations: [] };
              }
            }
          }
        }
      } catch (aiErr) {
        console.error(`AI call failed for ${agent.advisor_id}:`, aiErr);
      }

      // --- Act: Process recommendations through remaining gates ---
      let actionsCreated = 0;
      const recommendations = aiResponse.recommendations || [];

      for (const rec of recommendations) {
        // Gate 4: Policy
        const pg = policyGate(rec.action_type || "recommend");
        if (!pg.passed) {
          gatesFailed.push(`${pg.gate}: ${pg.reason}`);
          continue;
        }

        // Gate 5: Confidence
        const cg = confidenceGate(rec.confidence || 0, Number(agent.confidence_threshold) || 0.8);
        const actionType = cg.passed
          ? (agent.autonomy_level >= 3 ? "draft" : "recommend")
          : "recommend";

        const requiresApproval = agent.autonomy_level < 5 ||
          MUST_REQUIRE_APPROVAL.includes(rec.action_type || "");

        const receiptHash = hashReceipt(
          `${agent.advisor_id}:${rec.title}:${Date.now()}`
        );

        // Insert action into queue
        const { error: insertError } = await serviceClient
          .from("advisor_action_queue")
          .insert({
            user_id: userId,
            advisor_id: agent.advisor_id,
            action_type: actionType,
            domain: agent.domain,
            summary: rec.summary || rec.title,
            payload: rec,
            confidence: rec.confidence || 0,
            status: requiresApproval ? "proposed" : "approved",
            requires_approval: requiresApproval,
            receipt_hash: receiptHash,
          });

        if (!insertError) actionsCreated++;
      }

      gatesPassed.push("policy", "confidence", "receipt");

      // Update agent telemetry
      await serviceClient
        .from("advisor_agents")
        .update({
          last_observation_at: new Date().toISOString(),
          invocations_today: (agent.invocations_today || 0) + 1,
          tokens_used_today: (agent.tokens_used_today || 0) + 500, // estimate
        })
        .eq("id", agent.id);

      const receipt = hashReceipt(`${agent.advisor_id}:loop:${Date.now()}`);

      results.push({
        advisor_id: agent.advisor_id,
        status: "completed",
        gates_passed: gatesPassed,
        gates_failed: gatesFailed,
        actions_created: actionsCreated,
        receipt_hash: receipt,
      });
    }

    return new Response(JSON.stringify({
      execution_summary: {
        total_agents: agents.length,
        completed: results.filter(r => r.status === "completed").length,
        skipped: results.filter(r => r.status !== "completed").length,
        total_actions: results.reduce((s, r) => s + r.actions_created, 0),
        timestamp: new Date().toISOString(),
      },
      results,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Advisor agent loop error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
