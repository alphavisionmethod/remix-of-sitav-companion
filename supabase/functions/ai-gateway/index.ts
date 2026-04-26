import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders, corsResponse, corsError, handleCors } from "../_shared/cors.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";
import { logSecurityEvent, getClientIP, getUserAgent } from "../_shared/audit-logger.ts";
import { withTrace } from "../_shared/tracing.ts";
import { checkKillSwitchOrReject } from "../_shared/kill-switch.ts";
import { checkAIBudget } from "../_shared/ai-budget-check.ts";

/**
 * SITA OS — Central AI Gateway Edge Function
 * 
 * All AI requests route through here. This function:
 * 1. Validates auth
 * 2. Resolves routing from ai_capability_routing → ai_routing_policies
 * 3. Checks budget via check_ai_budget_policies()
 * 4. Calls the Lovable AI Gateway
 * 5. Logs to ai_usage_ledger + ai_receipt_records + ai_inference_receipts
 * 6. Records fallback events when applicable
 * 7. Returns the response with full traceability
 */

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

// Task class → default model mapping
const TASK_CLASS_MODELS: Record<string, string> = {
  // ─── Quatarly-first model map (Lovable AI used as automatic fallback) ───
  premium_synthesis: "claude-opus-4-6-thinking",
  balanced_assistant: "gemini-3-flash",
  economy_utility: "claude-haiku-4-5-20251001",
  cheap_utility: "gemini-3-flash",
  internal_only: "gpt-5.2",
  fallback: "gemini-3-flash",
  fallback_degraded: "gemini-3-flash",
};

// Rough cost estimate per 1K tokens by model prefix
const COST_PER_1K: Record<string, number> = {
  // Quatarly model IDs
  "claude-opus-4-6-thinking": 0.015,
  "claude-sonnet-4-6-thinking": 0.006,
  "claude-haiku-4-5-20251001": 0.0008,
  "gemini-3.1-pro": 0.005,
  "gemini-3-flash": 0.0003,
  "gpt-5.2": 0.010,
  "gpt-5.2-codex": 0.010,
  "gpt-5.1": 0.008,
  "gpt-5.1-codex": 0.008,
  "gpt-5.1-codex-max": 0.012,
  "gpt-5.3-codex": 0.012,
  "gpt-5.4": 0.012,
  // Lovable equivalents (used on fallback)
  "google/gemini-2.5-pro": 0.01,
  "google/gemini-3-flash-preview": 0.002,
  "google/gemini-2.5-flash": 0.001,
  "google/gemini-2.5-flash-lite": 0.0005,
};

function estimateCostUsd(model: string, totalTokens: number): number {
  const rate = COST_PER_1K[model] ?? 0.002;
  return (totalTokens / 1000) * rate;
}

// ─── Quatarly model ID → nearest Lovable AI equivalent (for fallback) ───
const QUATARLY_TO_LOVABLE: Record<string, string> = {
  "claude-opus-4-6-thinking":     "google/gemini-2.5-pro",
  "claude-sonnet-4-6-thinking":   "google/gemini-2.5-pro",
  "claude-haiku-4-5-20251001":    "google/gemini-2.5-flash-lite",
  "gemini-3.1-pro":               "google/gemini-2.5-pro",
  "gemini-3-flash":               "google/gemini-3-flash-preview",
  "gpt-5.2":                      "openai/gpt-5",
  "gpt-5.2-codex":                "openai/gpt-5",
  "gpt-5.3-codex":                "openai/gpt-5",
  "gpt-5.4":                      "openai/gpt-5",
  "gpt-5.1":                      "openai/gpt-5-mini",
  "gpt-5.1-codex":                "openai/gpt-5-mini",
  "gpt-5.1-codex-max":            "openai/gpt-5",
};

function translateToLovableModel(quatarlyModel: string): string {
  // If already a Lovable model id (contains "/"), keep it as-is.
  if (quatarlyModel.includes("/")) return quatarlyModel;
  return QUATARLY_TO_LOVABLE[quatarlyModel] ?? "google/gemini-3-flash-preview";
}

const QUATARLY_URL = "https://api.quatarly.cloud/v1/chat/completions";

/**
 * Calls Quatarly first (primary). On infra/credit/rate failures (402, 429, 5xx)
 * automatically retries against Lovable AI with a translated model id.
 * Returns the actual provider used so receipts stay honest.
 */
async function callProvider(
  payload: Record<string, unknown>,
  quatarlyKey: string | undefined,
  lovableKey: string | undefined,
): Promise<{ res: Response; provider: "quatarly" | "lovable"; modelUsed: string }> {
  const originalModel = String(payload.model ?? "");

  if (quatarlyKey) {
    try {
      const res = await fetch(QUATARLY_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${quatarlyKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      // Only fall back on infra / credit / rate failures (not on 4xx client errors)
      if (res.ok || ![402, 429, 500, 502, 503, 504].includes(res.status)) {
        return { res, provider: "quatarly", modelUsed: originalModel };
      }
      console.warn(`[ai-gateway] Quatarly returned ${res.status} — falling back to Lovable AI`);
      // Drain the body so it doesn't leak.
      try { await res.text(); } catch { /* ignore */ }
    } catch (e) {
      console.warn(`[ai-gateway] Quatarly fetch threw: ${(e as Error).message} — falling back to Lovable AI`);
    }
  }

  if (!lovableKey) {
    // Construct a synthetic 503 so the caller can degrade gracefully.
    const body = JSON.stringify({ error: "no_provider_available" });
    return {
      res: new Response(body, { status: 503, headers: { "Content-Type": "application/json" } }),
      provider: "lovable",
      modelUsed: originalModel,
    };
  }

  const lovableModel = translateToLovableModel(originalModel);
  const fallbackPayload = { ...payload, model: lovableModel };
  const res = await fetch(LOVABLE_AI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(fallbackPayload),
  });
  return { res, provider: "lovable", modelUsed: lovableModel };
}

serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  return withTrace(req, "ai-gateway", "completions", async (_logger, state) => {
  try {
    // Rate limiting
    const clientIP = getClientIP(req);
    const rateCheck = checkRateLimit(`ai-gw:${clientIP}`, 30, 60_000);
    if (!rateCheck.allowed) {
      await logSecurityEvent({ eventType: "rate_limit_hit", ipAddress: clientIP, functionName: "ai-gateway", severity: "warning", details: { remaining: rateCheck.remaining } });
      return rateLimitResponse(rateCheck, corsHeaders);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const QUATARLY_API_KEY = Deno.env.get("QUATARLY_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Auth
    const authHeader = req.headers.get("Authorization");
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader ?? "" } },
    });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      await logSecurityEvent({ eventType: "auth_failure", ipAddress: clientIP, userAgent: getUserAgent(req), functionName: "ai-gateway", severity: "warning" });
      return corsError("Unauthorized", 401);
    }
    state.setUser(user.id);

    // Phase 27 — Kill-switch enforcement (KS-MODEL-PROVIDERS)
    const serviceClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const killed = await checkKillSwitchOrReject("KS-MODEL-PROVIDERS", serviceClient);
    if (killed) return killed;

    const body = await req.json();

    // Health check / ping endpoint — zero cost, validates reachability + auth
    if (body.ping) {
      return corsResponse({
        status: "ok",
        timestamp: new Date().toISOString(),
        userId: user.id,
        hasApiKey: !!(QUATARLY_API_KEY || LOVABLE_API_KEY),
        primaryProvider: QUATARLY_API_KEY ? "quatarly" : "lovable",
        fallbackProvider: QUATARLY_API_KEY && LOVABLE_API_KEY ? "lovable" : null,
      }, 200);
    }

    const {
      capabilityId = "general",
      taskClass = "balanced_assistant",
      messages: rawMessages = [],
      stream = false,
      maxTokens,
      temperature,
      promptFamilyId,
      promptVars,
      riskTier = "R1",
    } = body;

    let messages = rawMessages;
    let resolvedPromptVersionId: string | null = null;

    // 1. Check if AI is available
    if (!QUATARLY_API_KEY && !LOVABLE_API_KEY) {
      return corsResponse({
        status: "degraded",
        reason: "no_api_key",
        message: "AI services are currently unavailable. No provider key configured.",
        launchLevel: "unavailable",
      }, 503);
    }


    // ─── Phase 21: Resolve prompt family if provided ───
    if (promptFamilyId) {
      const { data: promptVersion } = await serviceClient
        .from("ai_prompt_versions")
        .select("id, system_prompt, template")
        .eq("family_id", promptFamilyId)
        .eq("status", "active")
        .maybeSingle();
      if (promptVersion) {
        resolvedPromptVersionId = promptVersion.id;
        // Inject as system message at front (replacing any inline system if present)
        messages = messages.filter((m: { role: string }) => m.role !== "system");
        let systemContent = promptVersion.system_prompt as string;
        if (promptVars && promptVersion.template) {
          let rendered = promptVersion.template as string;
          for (const [k, v] of Object.entries(promptVars)) {
            rendered = rendered.replace(new RegExp(`\\{\\{\\s*${k}\\s*\\}\\}`, "g"), String(v));
          }
          systemContent = `${systemContent}\n\n${rendered}`;
        }
        messages = [{ role: "system", content: systemContent }, ...messages];

        // Log prompt invocation
        await serviceClient.from("ai_prompt_invocations").insert({
          family_id: promptFamilyId,
          version_id: resolvedPromptVersionId,
          capability_key: capabilityId,
          user_id: user.id,
        });
      }
    } else {
      // ─── Phase 21: Reject raw system prompts on R3+ without promptFamilyId ───
      const isR3Plus = ["R3", "R4", "R5"].includes(riskTier);
      const hasInlineSystem = messages.some((m: { role: string }) => m.role === "system");
      if (isR3Plus && hasInlineSystem) {
        return corsResponse({
          status: "rejected",
          reason: "raw_prompt_on_r3",
          message: `Risk tier ${riskTier} requires promptFamilyId; inline system messages are blocked.`,
        }, 400);
      }
    }

    // 2. Resolve model: capability_routing → routing_policies → task class default
    let model = TASK_CLASS_MODELS[taskClass] ?? "google/gemini-3-flash-preview";
    let fallbackModel: string | null = null;
    let routingSource = "task_class_default";

    // Try canonical capability routing first
    const { data: capRouting } = await serviceClient
      .from("ai_capability_routing")
      .select("*")
      .eq("capability_key", capabilityId)
      .eq("is_active", true)
      .eq("user_id", user.id)
      .maybeSingle();

    if (capRouting) {
      // Look up model key from model registry if we have model_id
      if (capRouting.default_model_id) {
        const { data: modelRec } = await serviceClient
          .from("ai_model_registry")
          .select("model_id, provider")
          .eq("id", capRouting.default_model_id)
          .maybeSingle();
        if (modelRec) {
          model = modelRec.model_id;
          routingSource = "capability_routing";
        }
      }
      if (capRouting.fallback_model_id) {
        const { data: fbModel } = await serviceClient
          .from("ai_model_registry")
          .select("model_id")
          .eq("id", capRouting.fallback_model_id)
          .maybeSingle();
        if (fbModel) fallbackModel = fbModel.model_id;
      }
    }

    // Fallback to legacy routing policies
    if (routingSource === "task_class_default") {
      const { data: routingPolicy } = await serviceClient
        .from("ai_routing_policies")
        .select("default_model, default_provider, fallback_model, max_cost_cents, enabled")
        .eq("capability_id", capabilityId)
        .eq("enabled", true)
        .eq("user_id", user.id)
        .maybeSingle();

      if (routingPolicy?.default_model) {
        model = routingPolicy.default_model;
        routingSource = "routing_policy";
        fallbackModel = routingPolicy.fallback_model ?? null;
      }
    }

    // 3. Check budget policies (canonical, strict — fail-closed at gateway)
    const estimatedCost = estimateCostUsd(model, (maxTokens ?? 1000) * 2);
    const budgetResult = await checkAIBudget(
      serviceClient,
      user.id,
      capabilityId,
      estimatedCost,
      { strict: true },
    );
    let budgetDowngrade = false;

    if (budgetResult.shouldBlock) {
      await serviceClient.from("ai_usage_ledger").insert({
        user_id: user.id,
        capability_key: capabilityId,
        mode: "real",
        request_class: taskClass,
        status: "blocked_budget",
        estimated_cost_usd: estimatedCost,
        error_code: "budget_exceeded",
        error_summary: budgetResult.reason,
      });

      // Premium-calm structured 429 so the client can render a graceful notice
      // (not a bug-feeling error). Includes reset time + percent state.
      const isUserCeiling = budgetResult.policyKey === "user_hard_ceiling";
      const resetsAt = budgetResult.userCeiling?.resetsAt ?? null;
      const retryAfterSeconds = resetsAt
        ? Math.max(60, Math.floor((new Date(resetsAt).getTime() - Date.now()) / 1000))
        : 3600;

      return corsResponse({
        status: "degraded",
        kind: isUserCeiling ? "budget_ceiling" : "budget_policy",
        reason: budgetResult.reason,
        message: `AI budget exceeded: ${budgetResult.reason}`,
        message_user_safe: isUserCeiling
          ? "You've used today's AI workspace allowance. New requests resume shortly."
          : "AI capacity is temporarily unavailable for this capability.",
        policyKey: budgetResult.policyKey,
        launchLevel: "unavailable",
        retry_after_seconds: retryAfterSeconds,
        daily_resets_at: resetsAt,
        current_pct: budgetResult.userCeiling?.dailyPct ?? budgetResult.pct ?? null,
        cap_kind: budgetResult.userCeiling?.capKind ?? null,
      }, 429);
    }

    if (budgetResult.shouldDowngrade) {
      budgetDowngrade = true;
      model =
        budgetResult.fallbackModelId ??
        fallbackModel ??
        TASK_CLASS_MODELS["fallback_degraded"];
    }

    if (budgetResult.premiumBlocked && taskClass === "premium_synthesis") {
      model = TASK_CLASS_MODELS["balanced_assistant"];
      budgetDowngrade = true;
    }

    if (budgetResult.alertState && budgetResult.alertState !== "ok") {
      await serviceClient.from("ai_budget_alerts").insert({
        user_id: user.id,
        scope_type: "user",
        scope_ref: user.id,
        threshold_percent: budgetResult.pct,
        observed_cost_usd: estimatedCost,
        period_class: "daily",
        alert_state: budgetResult.alertState,
      });
    }

    // 4. Call AI provider (Quatarly primary, Lovable AI fallback)
    const startTime = Date.now();

    const aiPayload: Record<string, unknown> = { model, messages, stream };
    if (maxTokens) aiPayload.max_tokens = maxTokens;
    if (temperature !== undefined) aiPayload.temperature = temperature;

    const { res: aiResponse, provider: providerUsed, modelUsed } =
      await callProvider(aiPayload, QUATARLY_API_KEY, LOVABLE_API_KEY);

    const latencyMs = Date.now() - startTime;

    // Handle streaming
    if (stream) {
      if (!aiResponse.ok) {
        const errText = await aiResponse.text();
        console.error(`AI gateway stream error (${providerUsed}):`, aiResponse.status, errText);

        if (aiResponse.status === 429) {
          return corsResponse({ error: "Rate limited. Please try again later.", status: "rate_limited" }, 429);
        }
        if (aiResponse.status === 402) {
          return corsResponse({ error: "AI credits exhausted. Add funds in workspace settings.", status: "payment_required" }, 402);
        }
        return corsError("AI gateway error", 500);
      }

      // Log receipt async for streaming
      serviceClient.from("ai_usage_ledger").insert({
        user_id: user.id,
        capability_key: capabilityId,
        mode: "real",
        request_class: taskClass,
        status: budgetDowngrade ? "fallback_success" : "success",
        latency_ms: latencyMs,
      }).then(() => {});

      serviceClient.from("ai_inference_receipts").insert({
        user_id: user.id,
        provider: providerUsed,
        model: modelUsed,
        capability_id: capabilityId,
        latency_ms: latencyMs,
        route_reason: `${routingSource}, task_class=${taskClass}, provider=${providerUsed}`,
      }).then(() => {});

      return new Response(aiResponse.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // Non-streaming
    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);

      if (aiResponse.status === 429) {
        return corsResponse({ error: "Rate limited", status: "rate_limited" }, 429);
      }
      if (aiResponse.status === 402) {
        return corsResponse({ error: "Credits exhausted", status: "payment_required" }, 402);
      }

      // Try fallback
      if (fallbackModel && model !== fallbackModel) {
        aiPayload.model = fallbackModel;
        const { res: fallbackResp, provider: fbProvider, modelUsed: fbModelUsed } =
          await callProvider(aiPayload, QUATARLY_API_KEY, LOVABLE_API_KEY);

        if (fallbackResp.ok) {
          const fallbackData = await fallbackResp.json();
          const content = fallbackData.choices?.[0]?.message?.content ?? "";
          const usage = fallbackData.usage ?? {};
          const fbLatency = Date.now() - startTime;
          const inputTokens = usage.prompt_tokens ?? 0;
          const outputTokens = usage.completion_tokens ?? 0;
          const totalTokens = inputTokens + outputTokens;
          const costUsd = estimateCostUsd(fbModelUsed, totalTokens);

          // Log fallback event
          await serviceClient.from("ai_fallback_events").insert({
            user_id: user.id,
            capability_key: capabilityId,
            fallback_reason: `primary_error_${aiResponse.status}`,
            result_state: "fallback_success",
          });

          // Log to usage ledger
          const { data: ledgerRow } = await serviceClient.from("ai_usage_ledger").insert({
            user_id: user.id,
            capability_key: capabilityId,
            mode: "real",
            request_class: taskClass,
            status: "fallback_success",
            prompt_tokens: inputTokens,
            completion_tokens: outputTokens,
            total_tokens: totalTokens,
            estimated_cost_usd: costUsd,
            latency_ms: fbLatency,
          }).select("id").single();

          // Log receipt record
          await serviceClient.from("ai_receipt_records").insert({
            user_id: user.id,
            capability_key: capabilityId,
            mode: "real",
            decision_class: "fallback",
            degraded_reason: `primary_model_error_${aiResponse.status}`,
            usage_ledger_id: ledgerRow?.id,
          });

          // Legacy receipt
          await serviceClient.from("ai_inference_receipts").insert({
            user_id: user.id,
            provider: fbProvider,
            model: fbModelUsed,
            capability_id: capabilityId,
            input_tokens: inputTokens,
            output_tokens: outputTokens,
            cost_estimate_cents: Math.round(costUsd * 100),
            latency_ms: fbLatency,
            route_reason: `fallback from ${model} via ${fbProvider}`,
            verification_outcome: "fallback_used",
          });

          return corsResponse({
            content,
            provider: fbProvider,
            model: fbModelUsed,
            taskClass,
            inputTokens,
            outputTokens,
            costCents: Math.round(costUsd * 100),
            latencyMs: fbLatency,
            cached: false,
            fallbackUsed: true,
            receiptId: ledgerRow?.id ?? crypto.randomUUID(),
          });
        }
        await fallbackResp.text();
      }

      // Log failed request
      await serviceClient.from("ai_usage_ledger").insert({
        user_id: user.id,
        capability_key: capabilityId,
        mode: "real",
        request_class: taskClass,
        status: "failed",
        latency_ms: latencyMs,
        error_code: `http_${aiResponse.status}`,
        error_summary: errText.substring(0, 500),
      });

      return corsError("AI gateway error", 500);
    }

    // 5. Parse response
    const responseData = await aiResponse.json();
    const content = responseData.choices?.[0]?.message?.content ?? "";
    const usage = responseData.usage ?? {};
    const inputTokens = usage.prompt_tokens ?? 0;
    const outputTokens = usage.completion_tokens ?? 0;
    const totalTokens = inputTokens + outputTokens;
    const costUsd = estimateCostUsd(modelUsed, totalTokens);
    const costCents = Math.round(costUsd * 100);

    // 6. Log to all canonical tables
    const { data: ledgerRow } = await serviceClient.from("ai_usage_ledger").insert({
      user_id: user.id,
      capability_key: capabilityId,
      mode: "real",
      request_class: taskClass,
      status: budgetDowngrade ? "fallback_success" : "success",
      prompt_tokens: inputTokens,
      completion_tokens: outputTokens,
      total_tokens: totalTokens,
      estimated_cost_usd: costUsd,
      latency_ms: latencyMs,
    }).select("id").single();

    // Receipt record
    await serviceClient.from("ai_receipt_records").insert({
      user_id: user.id,
      capability_key: capabilityId,
      mode: "real",
      decision_class: budgetDowngrade ? "budget_downgrade" : routingSource,
      usage_ledger_id: ledgerRow?.id,
    });

    // Legacy inference receipt
    await serviceClient.from("ai_inference_receipts").insert({
      user_id: user.id,
      provider: providerUsed,
      model: modelUsed,
      capability_id: capabilityId,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      cost_estimate_cents: costCents,
      latency_ms: latencyMs,
      route_reason: `${routingSource}, task_class=${taskClass}, capability=${capabilityId}, provider=${providerUsed}`,
      verification_outcome: "success",
    });

    // Budget downgrade fallback event
    if (budgetDowngrade) {
      await serviceClient.from("ai_fallback_events").insert({
        user_id: user.id,
        capability_key: capabilityId,
        fallback_reason: "budget_downgrade",
        result_state: "fallback_success",
      });
    }

    // Update legacy budget tracking
    await supabase.rpc("update_ai_budget_usage", {
      p_user_id: user.id,
      p_tokens: totalTokens,
      p_cost: costCents,
    });

    return corsResponse({
      content,
      provider: providerUsed,
      model: modelUsed,
      taskClass,
      inputTokens,
      outputTokens,
      costCents,
      latencyMs,
      cached: false,
      fallbackUsed: budgetDowngrade || providerUsed === "lovable",
      receiptId: ledgerRow?.id ?? crypto.randomUUID(),
    });

  } catch (e) {
    console.error("ai-gateway error:", e);
    return corsError(e instanceof Error ? e.message : "Unknown error", 500);
  }
  });
});
