import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";
import { requireAdmin } from "../_shared/auth.ts";
import { logSecurityEvent, getClientIP, getUserAgent } from "../_shared/audit-logger.ts";
import { checkAIBudget } from "../_shared/ai-budget-check.ts";

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
    // ── ADMIN AUTH (canonical via _shared/auth.ts) ────────────────
    const adminAuth = await requireAdmin(req);
    if (adminAuth instanceof Response) return adminAuth;
    const user = adminAuth.user;

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);


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

    // STEP 5: Budget policy check (canonical, strict — fail-closed)
    const budgetDecision = await checkAIBudget(
      supabaseAdmin,
      user.id,
      `workforce.${role_key}.${task_key}`,
      0.005,
      { strict: true },
    );

    if (budgetDecision.shouldBlock) {
      await supabaseAdmin.from("ai_workforce_invocations").insert({
        user_id: user.id, role_key, task_key,
        budget_posture: budget_posture || "normal",
        status: "blocked_budget",
        mode, scope_type, scope_ref, scope_payload,
        cost_cents: 0, tokens_in: 0, tokens_out: 0, duration_ms: 0,
        error_message: budgetDecision.reason || "Budget policy blocked invocation",
      });

      return new Response(JSON.stringify({
        status: "blocked_budget",
        reason: budgetDecision.reason,
        policy_key: budgetDecision.policyKey,
      }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // STEP 6: Check cache
    const scopeHash = btoa(JSON.stringify({ role_key, task_key, scope_type, scope_ref, scope_payload })).slice(0, 64);
    let cachedOutput = null;
    if ((task as Record<string, unknown>).allows_cached_output !== false) {
      const { data: cached } = await supabaseAdmin
        .from("ai_workforce_cached_outputs")
        .select("*")
        .eq("cache_key", scopeHash)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();
      if (cached) cachedOutput = cached;
    }

    // STEP 7: Create invocation record
    const { data: invocation, error: invErr } = await supabaseAdmin
      .from("ai_workforce_invocations")
      .insert({
        user_id: user.id, role_key, task_key,
        budget_posture: budget_posture || "normal",
        status: cachedOutput ? "success" : "running",
        mode, scope_type, scope_ref, scope_payload,
        model_used: cachedOutput?.model_used ?? null,
        cost_cents: 0, tokens_in: 0, tokens_out: 0, duration_ms: 0,
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
        .update({ hit_count: (cachedOutput.hit_count || 0) + 1 })
        .eq("id", cachedOutput.id);

      await supabaseAdmin.from("ai_workforce_invocations")
        .update({ status: "success", cost_cents: 0, duration_ms: 0 })
        .eq("id", invocation.id);

      return new Response(JSON.stringify({
        status: "success", invocation_id: invocation.id,
        cached: true, cache_hit_count: (cachedOutput.hit_count || 0) + 1,
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
            error_message: (fallbackErr as Error).message,
          })
          .eq("id", invocation.id);

        // Update role health (canonical columns only)
        await supabaseAdmin.from("ai_workforce_role_health")
          .upsert({
            user_id: user.id,
            role_key,
            health_status: "degraded",
            last_error: (fallbackErr as Error).message,
            last_invocation_at: new Date().toISOString(),
            failed_invocations: 1,
            total_invocations: 1,
          }, { onConflict: "user_id,role_key" });

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

    // STEP 11: Persist output (canonical columns: invocation_id, output_type, content, quality_score)
    const { data: output } = await supabaseAdmin
      .from("ai_workforce_outputs")
      .insert({
        user_id: user.id,
        invocation_id: invocation.id,
        output_type: (task as Record<string, unknown>).task_family as string || "summary",
        content: {
          title: `${role.display_name}: ${task.display_name}`,
          summary: parsed.summary,
          findings: parsed.findings ?? [],
          recommendations: parsed.recommendations ?? [],
          confidence: parsed.confidence ?? 0.5,
          launch_honesty_class: (role as Record<string, unknown>).launch_honesty_class || "internal_only",
          contains_recommendations: hasRecommendations,
        },
        quality_score: typeof parsed.confidence === "number" ? Math.round(parsed.confidence * 100) / 100 : null,
        flagged: false,
      })
      .select().single();

    // STEP 12: Persist recommendations (canonical schema)
    let recsCreated = 0;
    let approvalItemsCreated = 0;
    if (hasRecommendations) {
      for (const rec of parsed.recommendations) {
        const sev = rec.severity || "medium";
        const isHighRisk = rec.risk_tier === "critical" || rec.risk_tier === "elevated" || sev === "critical" || sev === "high";

        const { data: recRow, error: recErr } = await supabaseAdmin
          .from("ai_workforce_recommendations")
          .insert({
            user_id: user.id,
            invocation_id: invocation.id,
            role_key: role_key,
            task_key: task_key,
            domain: (role as Record<string, unknown>).domain_family || "general",
            title: rec.title,
            summary: rec.summary,
            severity: sev,
            confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.7,
            evidence: [{ source: "ai_workforce_run", invocation_id: invocation.id, finding: rec.estimated_impact || null }],
            execution_required: isHighRisk,
            outcome_verification_required: isHighRisk,
            flagship_loop_key: "admin-truth-recommendation-approval",
            status: "new",
            lifecycle_status: "new",
          })
          .select("id, title, summary, flagship_loop_key")
          .single();

        if (recErr) {
          console.error("[ai-workforce-run] recommendation insert failed:", recErr);
          continue;
        }
        recsCreated++;

        // Route high-risk recommendations to the user approval queue (canonical columns only)
        if (recRow && isHighRisk) {
          const { error: queueErr } = await supabaseAdmin.from("ai_workforce_approval_queue").insert({
            user_id: user.id,
            recommendation_id: recRow.id,
            title: rec.title,
            summary: rec.summary,
            priority: sev === "critical" ? "urgent" : "high",
            status: "pending",
            evidence_links: [{ source: "ai_workforce_run", invocation_id: invocation.id }],
            cost_implications: rec.estimated_impact || null,
            launch_implications: (role as Record<string, unknown>).launch_honesty_class as string || null,
          });
          if (queueErr) {
            console.error("[ai-workforce-run] approval queue insert failed:", queueErr);
          } else {
            approvalItemsCreated++;
          }
        }
      }
    }

    // STEP 13: Update invocation with real results (canonical columns only)
    const completedAt = new Date().toISOString();
    await supabaseAdmin.from("ai_workforce_invocations")
      .update({
        status: fallbackOccurred ? "success" : "success",
        cost_cents: costCents,
        tokens_in: Math.floor(aiResult.tokens_used * 0.6),
        tokens_out: Math.floor(aiResult.tokens_used * 0.4),
        duration_ms: aiResult.latency_ms,
        model_used: modelUsed,
      })
      .eq("id", invocation.id);

    // STEP 14: Update role health (canonical columns only)
    const { data: existingHealth } = await supabaseAdmin
      .from("ai_workforce_role_health")
      .select("id, total_invocations, successful_invocations, failed_invocations")
      .eq("user_id", user.id)
      .eq("role_key", role_key)
      .maybeSingle();

    await supabaseAdmin.from("ai_workforce_role_health")
      .upsert({
        user_id: user.id,
        role_key,
        health_status: fallbackOccurred ? "degraded" : "healthy",
        last_invocation_at: completedAt,
        total_invocations: (existingHealth?.total_invocations ?? 0) + 1,
        successful_invocations: (existingHealth?.successful_invocations ?? 0) + 1,
        failed_invocations: existingHealth?.failed_invocations ?? 0,
        avg_cost_cents: costCents,
        avg_latency_ms: aiResult.latency_ms,
      }, { onConflict: "user_id,role_key" });

    // STEP 15: Cache output
    if ((task as Record<string, unknown>).allows_cached_output !== false && output) {
      const freshUntil = new Date(Date.now() + 3600_000).toISOString();
      await supabaseAdmin.from("ai_workforce_cached_outputs")
        .upsert({
          user_id: user.id,
          role_key,
          task_key,
          cache_key: scopeHash,
          output: { invocation_id: invocation.id, output_id: output.id, summary: parsed.summary },
          model_used: modelUsed,
          tokens_used: aiResult.tokens_used,
          cost_cents: costCents,
          expires_at: freshUntil,
          hit_count: 0,
        }, { onConflict: "cache_key" });
    }

    // STEP 16: Log to AI inference receipts (canonical sovereign-gateway ledger)
    await supabaseAdmin.from("ai_inference_receipts").insert({
      user_id: user.id,
      capability_id: `workforce.${role_key}.${task_key}`,
      provider: "lovable_ai_gateway",
      model: modelUsed,
      input_tokens: Math.floor(aiResult.tokens_used * 0.6),
      output_tokens: Math.floor(aiResult.tokens_used * 0.4),
      cost_estimate_cents: costCents,
      latency_ms: aiResult.latency_ms,
      status: fallbackOccurred ? "fallback" : "success",
      route_reason: fallbackOccurred ? "primary_failed_fallback" : "primary_success",
    }).catch((e: unknown) => console.error("[ai-workforce-run] inference receipt failed:", e));

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
