import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders, corsResponse, corsError, handleCors } from "../_shared/cors.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";
import { logSecurityEvent, getClientIP, getUserAgent } from "../_shared/audit-logger.ts";

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
  premium_synthesis: "google/gemini-2.5-pro",
  balanced_assistant: "google/gemini-3-flash-preview",
  economy_utility: "google/gemini-2.5-flash-lite",
  cheap_utility: "google/gemini-2.5-flash-lite",
  internal_only: "google/gemini-2.5-pro",
  fallback: "google/gemini-2.5-flash-lite",
  fallback_degraded: "google/gemini-2.5-flash-lite",
};

// Rough cost estimate per 1K tokens by model prefix
const COST_PER_1K: Record<string, number> = {
  "google/gemini-2.5-pro": 0.01,
  "google/gemini-3-flash-preview": 0.002,
  "google/gemini-2.5-flash": 0.001,
  "google/gemini-2.5-flash-lite": 0.0005,
};

function estimateCostUsd(model: string, totalTokens: number): number {
  const rate = COST_PER_1K[model] ?? 0.002;
  return (totalTokens / 1000) * rate;
}

serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    // Rate limiting
    const clientIP = getClientIP(req);
    const rateCheck = checkRateLimit(`ai-gw:${clientIP}`, 30, 60_000);
    if (!rateCheck.allowed) {
      await logSecurityEvent({ eventType: "rate_limit_hit", ipAddress: clientIP, functionName: "ai-gateway", severity: "warning", details: { remaining: rateCheck.remaining } });
      return rateLimitResponse(rateCheck, corsHeaders);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
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

    const body = await req.json();

    // Health check / ping endpoint — zero cost, validates reachability + auth
    if (body.ping) {
      return corsResponse({
        status: "ok",
        timestamp: new Date().toISOString(),
        userId: user.id,
        hasApiKey: !!LOVABLE_API_KEY,
      }, 200);
    }

    const {
      capabilityId = "general",
      taskClass = "balanced_assistant",
      messages = [],
      stream = false,
      maxTokens,
      temperature,
    } = body;

    // 1. Check if AI is available
    if (!LOVABLE_API_KEY) {
      return corsResponse({
        status: "degraded",
        reason: "no_api_key",
        message: "AI services are currently unavailable. No provider key configured.",
        launchLevel: "unavailable",
      }, 503);
    }

    const serviceClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

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

    // 3. Check budget policies
    const estimatedCost = estimateCostUsd(model, (maxTokens ?? 1000) * 2);
    const { data: budgetCheck } = await serviceClient.rpc("check_ai_budget_policies", {
      p_user_id: user.id,
      p_capability_key: capabilityId,
      p_estimated_cost_usd: estimatedCost,
    });

    const budgetResult = budgetCheck as Record<string, unknown> | null;
    let budgetDowngrade = false;

    if (budgetResult) {
      // Block
      if (budgetResult.should_block) {
        // Log blocked event
        await serviceClient.from("ai_usage_ledger").insert({
          user_id: user.id,
          capability_key: capabilityId,
          mode: "real",
          request_class: taskClass,
          status: "blocked_budget",
          estimated_cost_usd: estimatedCost,
          error_code: "budget_exceeded",
          error_summary: budgetResult.reason as string,
        });

        return corsResponse({
          status: "degraded",
          reason: "budget_exceeded",
          message: `AI budget exceeded: ${budgetResult.reason}`,
          policyKey: budgetResult.policy_key,
          launchLevel: "unavailable",
        }, 429);
      }

      // Downgrade
      if (budgetResult.should_downgrade) {
        budgetDowngrade = true;
        if (fallbackModel) {
          model = fallbackModel;
        } else {
          model = TASK_CLASS_MODELS["fallback_degraded"];
        }
      }

      // Premium blocked
      if (budgetResult.premium_blocked && taskClass === "premium_synthesis") {
        model = TASK_CLASS_MODELS["balanced_assistant"];
        budgetDowngrade = true;
      }

      // Record alert if threshold breached
      if (budgetResult.alert_state) {
        await serviceClient.from("ai_budget_alerts").insert({
          user_id: user.id,
          scope_type: "user",
          scope_ref: user.id,
          threshold_percent: budgetResult.pct as number,
          observed_cost_usd: estimatedCost,
          period_class: "daily",
          alert_state: budgetResult.alert_state as string,
        });
      }
    }

    // 4. Call Lovable AI Gateway
    const startTime = Date.now();

    const aiPayload: Record<string, unknown> = { model, messages, stream };
    if (maxTokens) aiPayload.max_tokens = maxTokens;
    if (temperature !== undefined) aiPayload.temperature = temperature;

    const aiResponse = await fetch(LOVABLE_AI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(aiPayload),
    });

    const latencyMs = Date.now() - startTime;

    // Handle streaming
    if (stream) {
      if (!aiResponse.ok) {
        const errText = await aiResponse.text();
        console.error("AI gateway stream error:", aiResponse.status, errText);

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
        provider: model.split("/")[0] ?? "lovable",
        model,
        capability_id: capabilityId,
        latency_ms: latencyMs,
        route_reason: `${routingSource}, task_class=${taskClass}`,
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
        const fallbackResp = await fetch(LOVABLE_AI_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(aiPayload),
        });

        if (fallbackResp.ok) {
          const fallbackData = await fallbackResp.json();
          const content = fallbackData.choices?.[0]?.message?.content ?? "";
          const usage = fallbackData.usage ?? {};
          const fbLatency = Date.now() - startTime;
          const inputTokens = usage.prompt_tokens ?? 0;
          const outputTokens = usage.completion_tokens ?? 0;
          const totalTokens = inputTokens + outputTokens;
          const costUsd = estimateCostUsd(fallbackModel, totalTokens);

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
            provider: fallbackModel.split("/")[0],
            model: fallbackModel,
            capability_id: capabilityId,
            input_tokens: inputTokens,
            output_tokens: outputTokens,
            cost_estimate_cents: Math.round(costUsd * 100),
            latency_ms: fbLatency,
            route_reason: `fallback from ${model}`,
            verification_outcome: "fallback_used",
          });

          return corsResponse({
            content,
            provider: fallbackModel.split("/")[0],
            model: fallbackModel,
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
    const costUsd = estimateCostUsd(model, totalTokens);
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
      provider: model.split("/")[0] ?? "lovable",
      model,
      capability_id: capabilityId,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      cost_estimate_cents: costCents,
      latency_ms: latencyMs,
      route_reason: `${routingSource}, task_class=${taskClass}, capability=${capabilityId}`,
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
      provider: model.split("/")[0] ?? "lovable",
      model,
      taskClass,
      inputTokens,
      outputTokens,
      costCents,
      latencyMs,
      cached: false,
      fallbackUsed: budgetDowngrade,
      receiptId: ledgerRow?.id ?? crypto.randomUUID(),
    });

  } catch (e) {
    console.error("ai-gateway error:", e);
    return corsError(e instanceof Error ? e.message : "Unknown error", 500);
  }
});
