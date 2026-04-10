import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";
import { requireAdmin } from "../_shared/auth.ts";
import { logSecurityEvent, getClientIP, getUserAgent } from "../_shared/audit-logger.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface InvocationRequest {
  role_key: string;
  task_key: string;
  scope_type?: string;
  scope_ref?: string;
  scope_payload?: Record<string, unknown>;
  budget_posture?: string;
  mode?: string;
}

// ── AI Gateway call ─────────────────────────────────────────────
async function callAIGateway(
  systemPrompt: string,
  userPrompt: string,
  model: string,
): Promise<{ content: string; tokens_used: number; latency_ms: number }> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY is not configured — AI features unavailable");
  }

  const start = Date.now();
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      tools: [{
        type: "function",
        function: {
          name: "workforce_output",
          description: "Return structured analysis output with findings and recommendations.",
          parameters: {
            type: "object",
            properties: {
              summary: { type: "string", description: "Executive summary of the analysis" },
              findings: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
                    description: { type: "string" },
                    evidence: { type: "string" },
                  },
                  required: ["title", "severity", "description"],
                },
              },
              recommendations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    summary: { type: "string" },
                    severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
                    risk_tier: { type: "string", enum: ["standard", "elevated", "critical"] },
                    estimated_impact: { type: "string" },
                    estimated_effort: { type: "string", enum: ["low", "medium", "high"] },
                    recommendation_type: { type: "string" },
                  },
                  required: ["title", "summary", "severity", "risk_tier"],
                },
              },
              confidence: { type: "number", minimum: 0, maximum: 1 },
            },
            required: ["summary", "findings", "recommendations", "confidence"],
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "workforce_output" } },
    }),
  });

  const latency_ms = Date.now() - start;

  if (!response.ok) {
    const errText = await response.text();
    if (response.status === 429) throw new Error("AI rate limited — try again later");
    if (response.status === 402) throw new Error("AI credits exhausted — add funds to workspace");
    throw new Error(`AI gateway error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const choice = data.choices?.[0];
  const tokens_used = (data.usage?.total_tokens) || 0;

  // Extract tool call result
  let content = "";
  if (choice?.message?.tool_calls?.[0]?.function?.arguments) {
    content = choice.message.tool_calls[0].function.arguments;
  } else if (choice?.message?.content) {
    content = choice.message.content;
  }

  return { content, tokens_used, latency_ms };
}

// ── Model selection by budget class ─────────────────────────────
function selectModel(budgetClass: string): string {
  switch (budgetClass) {
    case "premium_architecture":
    case "deep_audit":
      return "google/gemini-2.5-pro";
    case "balanced_admin":
      return "google/gemini-3-flash-preview";
    case "economy_admin":
    case "internal_diagnostics":
    default:
      return "google/gemini-2.5-flash-lite";
  }
}

// ── Cost estimation by model ────────────────────────────────────
function estimateCostCents(model: string, tokensUsed: number): number {
  const rates: Record<string, number> = {
    "google/gemini-2.5-pro": 0.003,        // $0.003 per 1k tokens
    "google/gemini-3-flash-preview": 0.001, // $0.001 per 1k tokens
    "google/gemini-2.5-flash-lite": 0.0003, // $0.0003 per 1k tokens
  };
  const rate = rates[model] || 0.001;
  return Math.ceil((tokensUsed / 1000) * rate * 100); // cents
}

// ── System prompt builder ───────────────────────────────────────
function buildSystemPrompt(role: any, task: any): string {
  return `You are the ${role.display_name} for SITA OS, an AI-powered personal operating system.

Role: ${role.display_name}
Domain: ${role.domain_family}
Purpose: ${role.purpose || role.description || "Internal analysis"}

Task: ${task.display_name}
Task Description: ${task.description || "Perform analysis"}
Task Family: ${task.task_family || "analysis"}

Instructions:
- Provide structured, actionable analysis
- Ground findings in evidence when available
- Rate severity and risk accurately — do not exaggerate
- Each recommendation must be actionable with clear next steps
- Respect launch honesty: classify what is real vs planned vs internal-only
- Be cost-aware: this analysis costs real money, make it count

Output must include findings, recommendations, and a confidence score.`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const supabaseUser = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: InvocationRequest = await req.json();
    const {
      role_key, task_key,
      scope_type = "system", scope_ref,
      scope_payload = {}, budget_posture = "auto", mode = "real",
    } = body;

    // STEP 1: Validate role
    const { data: role, error: roleErr } = await supabaseAdmin
      .from("ai_workforce_roles")
      .select("*")
      .eq("user_id", user.id)
      .eq("role_key", role_key)
      .eq("is_active", true)
      .maybeSingle();

    if (roleErr || !role) {
      return new Response(JSON.stringify({ error: `Role '${role_key}' not found or inactive` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // STEP 2: Validate task
    const { data: task, error: taskErr } = await supabaseAdmin
      .from("ai_workforce_task_types")
      .select("*")
      .eq("user_id", user.id)
      .eq("task_key", task_key)
      .eq("is_active", true)
      .maybeSingle();

    if (taskErr || !task) {
      return new Response(JSON.stringify({ error: `Task '${task_key}' not found or inactive` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // STEP 3: Check permission
    const { data: perm } = await supabaseAdmin
      .from("ai_workforce_role_task_permissions")
      .select("*")
      .eq("role_id", role.id)
      .eq("task_id", task.id)
      .eq("allowed", true)
      .maybeSingle();

    if (!perm) {
      return new Response(JSON.stringify({ error: `Role '${role_key}' not permitted for task '${task_key}'` }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // STEP 4: Resolve budget & routing
    const resolvedBudgetClass = (perm as Record<string, unknown>).preferred_budget_class || (role as Record<string, unknown>).budget_class || "balanced_admin";
    const resolvedRoutingClass = (perm as Record<string, unknown>).preferred_routing_class || (role as Record<string, unknown>).default_routing_class || "balanced_assistant";
    const selectedModel = selectModel(resolvedBudgetClass);

    // STEP 5: Budget policy check
    const { data: budgetCheck } = await supabaseAdmin.rpc("check_ai_budget_policies", {
      p_user_id: user.id,
      p_capability_key: `workforce.${role_key}.${task_key}`,
      p_estimated_cost_usd: 0.005,
    });

    if (budgetCheck?.should_block) {
      await supabaseAdmin.from("ai_workforce_invocations").insert({
        user_id: user.id, role_key, task_type: task_key,
        budget_class: resolvedBudgetClass, status: "blocked_budget",
        mode, scope_type, scope_ref, scope_payload,
        requested_budget_posture: budget_posture,
        resolved_routing_class: resolvedRoutingClass,
        invoked_by_user_id: user.id,
        cost_cents: 0, tokens_used: 0, latency_ms: 0, fallback_occurred: false,
      });

      return new Response(JSON.stringify({
        status: "blocked_budget",
        reason: budgetCheck.reason,
        policy_key: budgetCheck.policy_key,
      }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // STEP 6: Check cache
    const scopeHash = btoa(JSON.stringify({ role_key, task_key, scope_type, scope_ref, scope_payload })).slice(0, 64);
    let cachedOutput = null;
    if ((task as Record<string, unknown>).allows_cached_output !== false) {
      const { data: cached } = await supabaseAdmin
        .from("ai_workforce_cached_outputs")
        .select("*")
        .eq("scope_hash", scopeHash)
        .gt("fresh_until", new Date().toISOString())
        .maybeSingle();
      if (cached) cachedOutput = cached;
    }

    // STEP 7: Create invocation record
    const startedAt = new Date().toISOString();
    const { data: invocation, error: invErr } = await supabaseAdmin
      .from("ai_workforce_invocations")
      .insert({
        user_id: user.id, role_key, task_type: task_key,
        budget_class: resolvedBudgetClass,
        status: cachedOutput ? "success" : "running",
        mode, scope_type, scope_ref, scope_payload,
        requested_budget_posture: budget_posture,
        resolved_routing_class: resolvedRoutingClass,
        used_cached_output: !!cachedOutput,
        cached_output_ref: cachedOutput?.id || null,
        invoked_by_user_id: user.id,
        started_at: startedAt,
        cost_cents: 0, tokens_used: 0, latency_ms: 0, fallback_occurred: false,
      })
      .select().single();

    if (invErr || !invocation) {
      return new Response(JSON.stringify({ error: "Failed to create invocation" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // STEP 8: Return cached if fresh
    if (cachedOutput) {
      await supabaseAdmin.from("ai_workforce_cached_outputs")
        .update({ reuse_count: (cachedOutput.reuse_count || 0) + 1 })
        .eq("id", cachedOutput.id);

      await supabaseAdmin.from("ai_workforce_invocations")
        .update({ status: "success", completed_at: new Date().toISOString(), cost_cents: 0 })
        .eq("id", invocation.id);

      return new Response(JSON.stringify({
        status: "success", invocation_id: invocation.id,
        cached: true, cache_reuse_count: (cachedOutput.reuse_count || 0) + 1,
        output: { summary: "Cached result returned", type: "cached" },
        recommendations_count: 0, approval_items_created: 0,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // STEP 9: Call real AI gateway
    const systemPrompt = buildSystemPrompt(role, task);
    const userPrompt = `Analyze the following scope:
- Scope type: ${scope_type}
- Scope reference: ${scope_ref || "system-wide"}
- Additional context: ${JSON.stringify(scope_payload)}

Provide your structured analysis with findings and recommendations.`;

    let aiResult: { content: string; tokens_used: number; latency_ms: number };
    let fallbackOccurred = false;
    let modelUsed = selectedModel;

    try {
      aiResult = await callAIGateway(systemPrompt, userPrompt, selectedModel);
    } catch (primaryErr) {
      // Fallback to cheaper model
      const fallbackModel = "google/gemini-2.5-flash-lite";
      try {
        console.warn(`Primary model ${selectedModel} failed, falling back to ${fallbackModel}:`, primaryErr);
        aiResult = await callAIGateway(systemPrompt, userPrompt, fallbackModel);
        fallbackOccurred = true;
        modelUsed = fallbackModel;
      } catch (fallbackErr) {
        // Total failure
        await supabaseAdmin.from("ai_workforce_invocations")
          .update({
            status: "failed",
            completed_at: new Date().toISOString(),
            error_summary: (fallbackErr as Error).message,
            fallback_occurred: true,
          })
          .eq("id", invocation.id);

        // Update role health
        await supabaseAdmin.from("ai_workforce_role_health")
          .upsert({
            user_id: user.id, role_id: role.id,
            health_state: "degraded",
            health_reason: (fallbackErr as Error).message,
            last_failure_at: new Date().toISOString(),
            last_used_at: new Date().toISOString(),
          }, { onConflict: "role_id" });

        return new Response(JSON.stringify({
          status: "failed",
          invocation_id: invocation.id,
          error: (fallbackErr as Error).message,
          fallback: true,
        }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    // STEP 10: Parse structured output
    let parsed: any = { summary: "", findings: [], recommendations: [], confidence: 0.5 };
    try {
      parsed = JSON.parse(aiResult.content);
    } catch {
      parsed = { summary: aiResult.content, findings: [], recommendations: [], confidence: 0.5 };
    }

    const costCents = estimateCostCents(modelUsed, aiResult.tokens_used);
    const hasRecommendations = parsed.recommendations && parsed.recommendations.length > 0;

    // STEP 11: Persist output
    const { data: output } = await supabaseAdmin
      .from("ai_workforce_outputs")
      .insert({
        user_id: user.id,
        invocation_id: invocation.id,
        output_type: (task as Record<string, unknown>).task_family || "summary",
        title: `${role.display_name}: ${task.display_name}`,
        summary_text: parsed.summary,
        structured_payload: parsed,
        confidence_class: parsed.confidence >= 0.8 ? "high" : parsed.confidence >= 0.5 ? "medium" : "low",
        launch_honesty_class: role.launch_honesty_class || "internal_only",
        contains_recommendations: hasRecommendations,
        contains_proposed_actions: hasRecommendations,
        contains_sensitive_suggestions: false,
      })
      .select().single();

    // STEP 12: Persist recommendations
    let recsCreated = 0;
    let approvalItemsCreated = 0;
    if (hasRecommendations && output) {
      for (const rec of parsed.recommendations) {
        const { data: recRow } = await supabaseAdmin
          .from("ai_workforce_recommendations")
          .insert({
            user_id: user.id,
            invocation_id: invocation.id,
            output_id: output.id,
            role_id: role.id,
            recommendation_type: rec.recommendation_type || role.domain_family,
            title: rec.title,
            summary: rec.summary,
            severity: rec.severity || "medium",
            risk_tier: rec.risk_tier || "standard",
            estimated_impact: rec.estimated_impact || null,
            estimated_effort: rec.estimated_effort || null,
            budget_impact_class: resolvedBudgetClass,
            launch_impact_class: role.launch_honesty_class,
            evidence_refs: [],
            status: "new",
          })
          .select().single();

        recsCreated++;

        // Route high-risk to approval queue
        if (recRow && (rec.risk_tier === "critical" || rec.risk_tier === "elevated" || rec.severity === "critical")) {
          await supabaseAdmin.from("ai_workforce_approval_queue").insert({
            user_id: user.id,
            recommendation_id: recRow.id,
            invocation_id: invocation.id,
            queue_type: "recommendation",
            title: rec.title,
            summary: rec.summary,
            risk_tier: rec.risk_tier || "elevated",
            severity: rec.severity,
            impacted_domain: role.domain_family,
            budget_impact_class: resolvedBudgetClass,
            evidence_summary: rec.estimated_impact || null,
            evidence_refs: [],
            status: "new",
          });
          approvalItemsCreated++;
        }
      }
    }

    // STEP 13: Update invocation with real results
    const completedAt = new Date().toISOString();
    await supabaseAdmin.from("ai_workforce_invocations")
      .update({
        status: fallbackOccurred ? "fallback_success" : "success",
        completed_at: completedAt,
        cost_cents: costCents,
        tokens_used: aiResult.tokens_used,
        latency_ms: aiResult.latency_ms,
        output_summary: parsed.summary,
        output_data: parsed,
        provider_used: "lovable_ai_gateway",
        model_used: modelUsed,
        fallback_occurred: fallbackOccurred,
      })
      .eq("id", invocation.id);

    // STEP 14: Update role health + stats
    await supabaseAdmin.from("ai_workforce_role_health")
      .upsert({
        user_id: user.id, role_id: role.id,
        health_state: fallbackOccurred ? "degraded" : "healthy",
        health_reason: fallbackOccurred ? "Fallback model used" : null,
        last_success_at: completedAt,
        last_used_at: completedAt,
      }, { onConflict: "role_id" });

    // Increment role cost/invocation counters
    await supabaseAdmin.rpc("increment_workforce_role_stats" as unknown, {
      p_role_id: role.id,
      p_cost_cents: costCents,
    }).catch(() => {
      // RPC may not exist yet — safe to ignore
    });

    // STEP 15: Cache output
    if ((task as Record<string, unknown>).allows_cached_output !== false && output) {
      const freshUntil = new Date(Date.now() + 3600_000).toISOString();
      await supabaseAdmin.from("ai_workforce_cached_outputs")
        .upsert({
          user_id: user.id, role_id: role.id, task_id: task.id,
          scope_hash: scopeHash,
          scope_summary: `${scope_type}/${scope_ref || "all"}`,
          output_id: output.id,
          fresh_until: freshUntil,
          reuse_count: 0,
        }, { onConflict: "role_id,task_id,scope_hash" });
    }

    // STEP 16: Log to AI usage ledger
    await supabaseAdmin.from("ai_usage_ledger").insert({
      user_id: user.id,
      capability_key: `workforce.${role_key}.${task_key}`,
      provider: "lovable_ai_gateway",
      model: modelUsed,
      input_tokens: Math.floor(aiResult.tokens_used * 0.6),
      output_tokens: Math.floor(aiResult.tokens_used * 0.4),
      total_tokens: aiResult.tokens_used,
      estimated_cost_usd: costCents / 100,
      latency_ms: aiResult.latency_ms,
      status: fallbackOccurred ? "fallback" : "success",
    }).catch(console.error);

    return new Response(JSON.stringify({
      status: fallbackOccurred ? "fallback_success" : "success",
      invocation_id: invocation.id,
      output_id: output?.id,
      cached: false,
      output: {
        type: (task as Record<string, unknown>).task_family || "summary",
        title: `${role.display_name}: ${task.display_name}`,
        summary: parsed.summary,
        confidence: parsed.confidence,
        launch_honesty: role.launch_honesty_class,
        findings_count: parsed.findings?.length || 0,
      },
      cost: {
        cents: costCents,
        tokens: aiResult.tokens_used,
        model: modelUsed,
        budget_class: resolvedBudgetClass,
        routing_class: resolvedRoutingClass,
      },
      latency_ms: aiResult.latency_ms,
      recommendations_count: recsCreated,
      approval_items_created: approvalItemsCreated,
      degraded: fallbackOccurred,
      fallback: fallbackOccurred,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    console.error("Workforce run error:", err);
    return new Response(JSON.stringify({
      error: err instanceof Error ? err.message : "Internal error",
    }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
