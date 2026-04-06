import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { handleCors, corsHeaders, corsError } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth.ts";
import { zodValidate, PersonalBrainSchema } from "../_shared/zod-validate.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";
import { EdgeLogger } from "../_shared/logger.ts";

const MODE_PROMPTS: Record<string, string> = {
  think: `You are SITA Brain — Think Mode. You are a reflective thinking partner. Help the user brainstorm, debate ideas, journal, analyze problems from multiple angles. Use Socratic questioning. Present counterarguments. Help them think deeply.`,
  learn: `You are SITA Brain — Learn Mode. You are a patient, expert tutor. Help the user learn any skill: coding, languages, instruments, business concepts, science, math. Break complex topics into digestible steps. Track their progress. Quiz them. Celebrate wins.`,
  build: `You are SITA Brain — Build Mode. You are a startup advisor and product strategist. Help the user build a new business or project: validate ideas, analyze markets, plan MVPs, create task lists, design business models, estimate costs. Be practical and actionable.`,
  create: `You are SITA Brain — Create Mode. You are a creative assistant. Help the user write, design, compose, invent. Offer templates, examples, and frameworks. Help them create presentations, documents, proposals, content. Suggest improvements and alternatives.`,
};

async function buildBrainContext(
  supabaseClient: ReturnType<typeof createClient>,
  userId: string,
  mode: string
): Promise<string> {
  const modePrompt = MODE_PROMPTS[mode] || MODE_PROMPTS.think;

  // Fetch cross-advisor memories for holistic context
  const [factsRes, memoriesRes, prefsRes] = await Promise.all([
    supabaseClient
      .from("advisor_memories")
      .select("advisor_id, content")
      .eq("user_id", userId)
      .eq("memory_type", "fact")
      .order("created_at", { ascending: false })
      .limit(20),
    supabaseClient
      .from("advisor_memories")
      .select("advisor_id, content")
      .eq("user_id", userId)
      .eq("memory_type", "summary")
      .order("created_at", { ascending: false })
      .limit(10),
    supabaseClient
      .from("advisor_memories")
      .select("content")
      .eq("user_id", userId)
      .eq("memory_type", "preference")
      .limit(10),
  ]);

  let prompt = modePrompt;

  const facts = factsRes.data ?? [];
  if (facts.length > 0) {
    prompt += "\n\n## What I Know About This User (from all advisors)\n";
    for (const f of facts) {
      prompt += `- [${f.advisor_id}]: ${f.content}\n`;
    }
  }

  const memories = memoriesRes.data ?? [];
  if (memories.length > 0) {
    prompt += "\n\n## Recent Context\n";
    for (const m of memories) {
      prompt += `- [${m.advisor_id}]: ${m.content}\n`;
    }
  }

  const prefs = prefsRes.data ?? [];
  if (prefs.length > 0) {
    prompt += "\n\n## User Preferences\n";
    for (const p of prefs) {
      prompt += `- ${p.content}\n`;
    }
  }

  return prompt;
}

serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const correlationId = crypto.randomUUID();
  const requestStartTime = Date.now();

  try {
    const auth = await requireAuth(req);
    if (auth instanceof Response) return auth;
    const user = auth.user;
    const supabaseClient = auth.supabase;

    // Rate limit: 30 requests per minute per user
    const rl = checkRateLimit(user.id, 30, 60_000);
    if (!rl.allowed) return rateLimitResponse(rl, corsHeaders);

    const rawBody = await req.json().catch(() => null);
    if (!rawBody) return corsError("Invalid JSON body", 400);
    const validated = zodValidate(rawBody, PersonalBrainSchema);
    if (!validated.success) return validated.response;
    const { messages, mode = "think" } = validated.data;

    // Rate limit: max 20 requests/min
    const { count } = await supabaseClient
      .from("ai_token_usage")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("advisor_id", "personal-brain")
      .gte("created_at", new Date(Date.now() - 60000).toISOString());
    if ((count ?? 0) >= 20) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded — max 20 requests per minute", code: "RATE_LIMITED", correlation_id: correlationId }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI provider not configured", code: "PROVIDER_MISSING", correlation_id: correlationId }), {
        status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check budget
    const { data: budget } = await supabaseClient
      .from("user_ai_budgets")
      .select("*")
      .eq("user_id", user.id)
      .eq("period", "monthly")
      .maybeSingle();

    let model = "google/gemini-3-flash-preview";
    if (budget && budget.hard_limit && budget.used_cost_cents >= budget.limit_cost_cents) {
      return new Response(JSON.stringify({ error: "Monthly AI budget exceeded. Upgrade or wait for reset.", code: "BUDGET_EXCEEDED", correlation_id: correlationId }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = await buildBrainContext(supabaseClient, user.id, mode);

    const aiCallStart = Date.now();
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });
    const aiLatencyMs = Date.now() - aiCallStart;

    if (!response.ok) {
      const t = await response.text();
      const errorCode = response.status === 429 ? "PROVIDER_RATE_LIMITED" : response.status === 402 ? "CREDITS_EXHAUSTED" : "PROVIDER_ERROR";
      const errorMsg = response.status === 429 ? "Rate limited — try again shortly." : response.status === 402 ? "AI credits exhausted. Add funds in Settings → Workspace → Usage." : "AI service error";
      console.error(`personal-brain [${correlationId}] AI gateway error:`, response.status, t.slice(0, 200));
      return new Response(JSON.stringify({ error: errorMsg, code: errorCode, correlation_id: correlationId }), {
        status: response.status === 429 || response.status === 402 ? response.status : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log token usage
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const inputApprox = JSON.stringify(messages).length / 4;
    adminClient.from("ai_token_usage").insert({
      user_id: user.id,
      advisor_id: "personal-brain",
      model,
      provider: "google",
      input_tokens: Math.ceil(inputApprox),
      output_tokens: 0,
      cost_cents: 0,
      domain: mode,
      category: "inference",
      session_id: correlationId,
    }).then(() => {}).catch(e => console.error("Token log error:", e));

    // Budget metering
    const estCost = Math.ceil(inputApprox * 0.002);
    adminClient.rpc("update_ai_budget_usage", {
      p_user_id: user.id,
      p_tokens: Math.ceil(inputApprox),
      p_cost: estCost,
    }).then(() => {}).catch(e => console.error("Budget metering error:", e));

    return new Response(response.body!, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "X-Correlation-Id": correlationId,
        "X-Latency-Ms": aiLatencyMs.toString(),
      },
    });
  } catch (e) {
    const totalLatency = Date.now() - requestStartTime;
    console.error(`personal-brain [${correlationId}] error (${totalLatency}ms):`, e);
    return new Response(JSON.stringify({
      error: e instanceof Error ? e.message : "Unknown error",
      code: "INTERNAL_ERROR",
      correlation_id: correlationId,
    }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
