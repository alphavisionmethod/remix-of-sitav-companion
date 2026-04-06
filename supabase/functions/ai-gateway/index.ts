import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders, corsResponse, corsError, handleCors } from "../_shared/cors.ts";

/**
 * SITA OS — Central AI Gateway Edge Function
 * 
 * All AI requests route through here. This function:
 * 1. Validates auth
 * 2. Resolves routing policy for the capability
 * 3. Checks budget
 * 4. Calls the Lovable AI Gateway
 * 5. Logs a receipt
 * 6. Returns the response
 */

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

// Task class → default model mapping
const TASK_CLASS_MODELS: Record<string, string> = {
  premium_synthesis: "google/gemini-2.5-pro",
  balanced_assistant: "google/gemini-3-flash-preview",
  cheap_utility: "google/gemini-2.5-flash-lite",
  fallback_degraded: "google/gemini-2.5-flash-lite",
};

serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Auth
    const authHeader = req.headers.get("Authorization");
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader ?? "" } },
    });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return corsError("Unauthorized", 401);
    }

    const body = await req.json();
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

    // 2. Resolve model from routing policy or task class default
    let model = TASK_CLASS_MODELS[taskClass] ?? "google/gemini-3-flash-preview";

    // Try to get routing policy from DB
    const { data: routingPolicy } = await supabase
      .from("ai_routing_policies")
      .select("default_model, default_provider, fallback_model, max_cost_cents, enabled")
      .eq("capability_id", capabilityId)
      .eq("enabled", true)
      .maybeSingle();

    if (routingPolicy?.default_model) {
      model = routingPolicy.default_model;
    }

    // 3. Check budget
    const { data: budgetResult } = await supabase.rpc("update_ai_budget_usage", {
      p_user_id: user.id,
      p_tokens: 0, // Pre-check
      p_cost: 0,
    });

    if (budgetResult && typeof budgetResult === "object" && "allowed" in budgetResult && !budgetResult.allowed) {
      // Try fallback to cheaper model
      if (routingPolicy?.fallback_model) {
        model = routingPolicy.fallback_model;
      } else {
        return corsResponse({
          status: "degraded",
          reason: "budget_exceeded",
          message: "AI budget exceeded. Please contact your administrator.",
          launchLevel: "unavailable",
        }, 429);
      }
    }

    // 4. Call Lovable AI Gateway
    const startTime = Date.now();

    const aiPayload: Record<string, unknown> = {
      model,
      messages,
      stream,
    };
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

      // Log receipt async (fire-and-forget for streaming)
      const serviceClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      serviceClient.from("ai_inference_receipts").insert({
        user_id: user.id,
        provider: model.split("/")[0] ?? "lovable",
        model,
        capability_id: capabilityId,
        latency_ms: latencyMs,
        route_reason: `task_class=${taskClass}`,
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
      if (routingPolicy?.fallback_model && model !== routingPolicy.fallback_model) {
        aiPayload.model = routingPolicy.fallback_model;
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

          // Log receipt
          const serviceClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
          await serviceClient.from("ai_inference_receipts").insert({
            user_id: user.id,
            provider: (routingPolicy.fallback_model as string).split("/")[0],
            model: routingPolicy.fallback_model,
            capability_id: capabilityId,
            input_tokens: usage.prompt_tokens ?? 0,
            output_tokens: usage.completion_tokens ?? 0,
            cost_estimate_cents: 0,
            latency_ms: Date.now() - startTime,
            route_reason: `fallback from ${model}`,
            verification_outcome: "fallback_used",
          });

          return corsResponse({
            content,
            provider: (routingPolicy.fallback_model as string).split("/")[0],
            model: routingPolicy.fallback_model,
            taskClass,
            inputTokens: usage.prompt_tokens ?? 0,
            outputTokens: usage.completion_tokens ?? 0,
            costCents: 0,
            latencyMs: Date.now() - startTime,
            cached: false,
            fallbackUsed: true,
            receiptId: crypto.randomUUID(),
          });
        }
        await fallbackResp.text();
      }

      return corsError("AI gateway error", 500);
    }

    // 5. Parse response
    const responseData = await aiResponse.json();
    const content = responseData.choices?.[0]?.message?.content ?? "";
    const usage = responseData.usage ?? {};
    const inputTokens = usage.prompt_tokens ?? 0;
    const outputTokens = usage.completion_tokens ?? 0;

    // Estimate cost (rough)
    const costCents = Math.round((inputTokens + outputTokens) * 0.001);

    // 6. Log receipt
    const serviceClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: receipt } = await serviceClient.from("ai_inference_receipts").insert({
      user_id: user.id,
      provider: model.split("/")[0] ?? "lovable",
      model,
      capability_id: capabilityId,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      cost_estimate_cents: costCents,
      latency_ms: latencyMs,
      route_reason: `task_class=${taskClass}, capability=${capabilityId}`,
      verification_outcome: "success",
    }).select("id").single();

    // Update budget
    await supabase.rpc("update_ai_budget_usage", {
      p_user_id: user.id,
      p_tokens: inputTokens + outputTokens,
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
      fallbackUsed: false,
      receiptId: receipt?.id ?? crypto.randomUUID(),
    });

  } catch (e) {
    console.error("ai-gateway error:", e);
    return corsError(e instanceof Error ? e.message : "Unknown error", 500);
  }
});
