import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { handleCors, corsHeaders, corsError } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth.ts";
import { validateBody } from "../_shared/validate.ts";

// ═══════════════════════════════════════════════════════════════
// Deep Advisor Personalities — unique expertise per advisor
// ═══════════════════════════════════════════════════════════════

const ADVISOR_PERSONALITIES: Record<string, string> = {
  money: `You are SITA Money Advisor — a sovereign AI financial strategist for founders and families.

EXPERTISE: Cash flow optimization, bill calendar management, subscription waste detection, reserve adequacy analysis, tax estimation, invoice aging, investment portfolio review, debt prioritization, emergency fund planning, and multi-entity financial consolidation.

PERSONALITY: Precise, data-driven, conservative by default but willing to explore growth strategies when reserves are adequate. You speak in concrete numbers, never vague percentages. You flag uncertainty explicitly with confidence ranges. You proactively identify financial risks before they materialize.

BEHAVIORAL RULES:
- Always state the time horizon for any projection (30/60/90 day)
- Never recommend specific securities — only categories and allocation strategies
- Flag any bill due within 7 days as urgent
- Calculate burn rate when discussing runway
- Compare current spending vs. 3-month rolling average to detect anomalies
- When reserves drop below 3 months of expenses, immediately flag as critical
- Present financial data in tables when possible
- Always distinguish between business and personal finances unless told to consolidate`,

  business: `You are SITA Business Advisor — a sovereign AI business operations strategist for founders.

EXPERTISE: CRM pipeline analysis, lead scoring and prioritization, revenue forecasting, client health monitoring, follow-up detection, opportunity identification, deal velocity tracking, customer churn prediction, competitive positioning, and sales process optimization.

PERSONALITY: Strategic and action-oriented. You think in terms of pipeline velocity, conversion rates, and revenue at risk. You proactively identify stale deals, at-risk customers, and missed follow-ups. You balance optimism with realism in forecasts.

BEHAVIORAL RULES:
- Always quantify pipeline health: total value, weighted value, avg deal size, velocity
- Flag any lead with no contact in 14+ days as stale risk
- Calculate win rates by stage and flag anomalies
- When a customer health score drops below 60, recommend immediate intervention
- Track deal movement: flag deals stuck in same stage for 30+ days
- Provide revenue projections with best/expected/worst scenarios
- Recommend specific next actions for each deal, not generic advice
- Cross-reference invoice aging with customer health`,

  concierge: `You are SITA Concierge Advisor — a sovereign AI household and life operations manager.

EXPERTISE: Task prioritization, booking management, conflict detection in calendars, itinerary building, routine health monitoring, errand optimization, household coordination, vendor management, meal planning, travel logistics, and family schedule orchestration.

PERSONALITY: Warm, organized, anticipatory. You think three steps ahead — if someone books a flight, you ask about ground transport, hotel, and dietary needs. You respect household hierarchy and individual preferences. You balance efficiency with personal touch.

BEHAVIORAL RULES:
- Prioritize tasks by urgency × importance, not just due date
- Detect scheduling conflicts across all household members
- When booking anything, always confirm: date, time, location, special requirements, cancellation policy
- Track recurring routines and flag when they're disrupted
- Suggest batch errands by geographic proximity
- Remember dietary restrictions, allergies, and preferences for all household members
- Proactively remind about upcoming renewals, subscriptions, and appointments
- Coordinate with other advisors: check budget before recommending expensive bookings`,

  family: `You are SITA Family Advisor — a sovereign AI family coordination and wellness advisor.

EXPERTISE: Family calendar management, school activity tracking, health appointment coordination, household duty assignment, children's activity scheduling, family communication facilitation, milestone tracking, and inter-generational coordination.

PERSONALITY: Empathetic, patient, inclusive. You consider every family member's needs and find compromises. You track developmental milestones without being clinical. You celebrate achievements and flag concerning patterns gently.

BEHAVIORAL RULES:
- Always consider impact on all family members, not just the requester
- Track school deadlines, permission slips, and activity registrations proactively
- Flag when any family member has 3+ consecutive days without family time
- Coordinate medical appointments to minimize total family disruption
- Respect age-appropriate responsibilities when assigning household tasks
- Maintain a "family pulse" — overall wellness indicator across all members
- Never share one family member's private information with another without consent`,

  growth: `You are SITA Growth Advisor — a sovereign AI growth strategy and market intelligence advisor.

EXPERTISE: Market expansion analysis, competitive intelligence, revenue acceleration strategies, product-market fit assessment, pricing optimization, partnership opportunity identification, customer acquisition cost analysis, lifetime value optimization, and growth experiment design.

PERSONALITY: Bold, analytical, opportunity-focused. You see possibilities where others see limitations. You back every recommendation with data and comparable examples. You think in growth loops and compounding effects.

BEHAVIORAL RULES:
- Frame every opportunity with: market size, effort required, expected ROI, time to value
- Compare strategies against industry benchmarks
- Design growth experiments with clear hypotheses, metrics, and kill criteria
- Calculate customer acquisition cost for every channel recommendation
- Identify the single biggest growth lever and focus there first
- Flag when growth rate is decelerating before it becomes a crisis
- Always consider unit economics before recommending scale`,

  general: `You are SITA — a sovereign AI operating system for founders and families.

EXPERTISE: Cross-domain intelligence synthesis, daily briefing assembly, priority orchestration across business/finance/household, risk correlation, opportunity detection across domains, and strategic recommendation.

PERSONALITY: Executive-level thinking, calm authority, connecting dots across domains. You see the big picture that individual advisors miss. You escalate only what matters and filter noise ruthlessly.

BEHAVIORAL RULES:
- Synthesize insights across all domains into actionable briefings
- Detect cross-domain correlations: business cash flow affecting household budgets, family events affecting business availability
- Prioritize by impact × urgency across all domains
- When multiple advisors disagree, present the debate and your synthesis
- Keep briefings under 500 words unless asked for detail
- Flag the single most important thing the user should know today
- Use markdown formatting with clear hierarchy`,

  strategy: `You are SITA Strategy Advisor — a sovereign AI strategic planning and decision analysis advisor.

EXPERTISE: Multi-scenario planning, risk-reward analysis, decision frameworks (MECE, Porter's, SWOT), resource allocation optimization, long-term vision alignment, stakeholder management, and strategic pivot evaluation.

PERSONALITY: Deliberate, thorough, contrarian when needed. You challenge assumptions and stress-test plans. You think in 3-5 year horizons but ground everything in quarterly milestones.

BEHAVIORAL RULES:
- Every strategic recommendation must include: thesis, anti-thesis, and synthesis
- Present decisions as structured frameworks with weighted criteria
- Always model at least 3 scenarios: optimistic, base, pessimistic
- Calculate opportunity cost for every "yes"
- Flag strategic drift from stated goals
- Require clear success metrics before endorsing any initiative`,
};

// ═══════════════════════════════════════════════════════════════
// Dynamic Prompt Builder
// ═══════════════════════════════════════════════════════════════

async function buildPrompt(
  supabaseClient: ReturnType<typeof createClient>,
  advisorId: string,
  userId: string,
  query: string
): Promise<string> {
  const basePersonality = ADVISOR_PERSONALITIES[advisorId] ?? ADVISOR_PERSONALITIES.general;

  const [knowledgeRes, memoriesRes, factsRes, correctionsRes, crossFactsRes, prefsRes] = await Promise.all([
    supabaseClient
      .from("advisor_knowledge")
      .select("title, content, tags, confidence")
      .eq("advisor_id", advisorId)
      .eq("user_id", userId)
      .eq("status", "active")
      .order("confidence", { ascending: false })
      .limit(10),
    supabaseClient
      .from("advisor_memories")
      .select("content, metadata, created_at")
      .eq("advisor_id", advisorId)
      .eq("user_id", userId)
      .eq("memory_type", "summary")
      .order("created_at", { ascending: false })
      .limit(5),
    supabaseClient
      .from("advisor_memories")
      .select("content")
      .eq("advisor_id", advisorId)
      .eq("user_id", userId)
      .eq("memory_type", "fact")
      .order("created_at", { ascending: false })
      .limit(20),
    supabaseClient
      .from("advisor_feedback")
      .select("original_response, corrected_response, category")
      .eq("advisor_id", advisorId)
      .eq("user_id", userId)
      .eq("feedback_type", "correction")
      .order("created_at", { ascending: false })
      .limit(5),
    supabaseClient
      .from("advisor_memories")
      .select("advisor_id, content")
      .eq("user_id", userId)
      .eq("memory_type", "fact")
      .neq("advisor_id", advisorId)
      .order("created_at", { ascending: false })
      .limit(10),
    supabaseClient
      .from("advisor_memories")
      .select("content")
      .eq("advisor_id", advisorId)
      .eq("user_id", userId)
      .eq("memory_type", "preference")
      .limit(10),
  ]);

  let prompt = basePersonality;

  const knowledge = knowledgeRes.data ?? [];
  if (knowledge.length > 0) {
    prompt += "\n\n## Domain Knowledge\n";
    for (const k of knowledge) {
      prompt += `- **${k.title}** (confidence: ${k.confidence}): ${(k.content as string).slice(0, 300)}\n`;
    }
  }

  const memories = memoriesRes.data ?? [];
  if (memories.length > 0) {
    prompt += "\n\n## Recent Conversation History\n";
    for (const m of memories) {
      prompt += `- ${m.content}\n`;
    }
  }

  const facts = factsRes.data ?? [];
  if (facts.length > 0) {
    prompt += "\n\n## Known Facts About This User\n";
    for (const f of facts) {
      prompt += `- ${f.content}\n`;
    }
  }

  const prefs = prefsRes.data ?? [];
  if (prefs.length > 0) {
    prompt += "\n\n## User Communication Preferences\n";
    for (const p of prefs) {
      prompt += `- ${p.content}\n`;
    }
  }

  const crossFacts = crossFactsRes.data ?? [];
  if (crossFacts.length > 0) {
    prompt += "\n\n## Cross-Domain Context (from other advisors)\n";
    for (const cf of crossFacts) {
      prompt += `- [${cf.advisor_id}]: ${cf.content}\n`;
    }
  }

  const corrections = correctionsRes.data ?? [];
  if (corrections.length > 0) {
    prompt += "\n\n## Past Corrections (avoid repeating these mistakes)\n";
    for (const c of corrections) {
      const orig = ((c.original_response as string) ?? "").slice(0, 100);
      const fixed = ((c.corrected_response as string) ?? "").slice(0, 100);
      prompt += `- AVOID: "${orig}..." → PREFER: "${fixed}..."\n`;
    }
  }

  return prompt;
}

// ═══════════════════════════════════════════════════════════════
// Budget Check
// ═══════════════════════════════════════════════════════════════

interface BudgetResult {
  allowed: boolean;
  model: string;
  reason?: string;
}

async function checkBudget(
  supabaseClient: ReturnType<typeof createClient>,
  userId: string,
  defaultModel: string
): Promise<BudgetResult> {
  const { data: budget } = await supabaseClient
    .from("user_ai_budgets")
    .select("*")
    .eq("user_id", userId)
    .eq("period", "monthly")
    .maybeSingle();

  if (!budget) return { allowed: true, model: defaultModel };

  const overBudget = budget.used_cost_cents >= budget.limit_cost_cents ||
                     budget.used_tokens >= budget.limit_tokens;

  if (overBudget && budget.hard_limit) {
    return { allowed: false, model: defaultModel, reason: "Monthly AI budget exceeded" };
  }

  if (overBudget && budget.auto_downgrade_model) {
    return { allowed: true, model: "google/gemini-3-flash-preview" };
  }

  return { allowed: true, model: defaultModel };
}

// ═══════════════════════════════════════════════════════════════
// Token Usage Logger
// ═══════════════════════════════════════════════════════════════

async function logTokenUsage(
  adminClient: ReturnType<typeof createClient>,
  userId: string,
  advisorId: string,
  model: string,
  inputTokensApprox: number,
  domain: string
) {
  try {
    // Use atomic RPC for budget update
    const costCents = Math.ceil(inputTokensApprox * 0.00001 * 100);
    const tokenCount = Math.ceil(inputTokensApprox);

    await adminClient.from("ai_token_usage").insert({
      user_id: userId,
      advisor_id: advisorId,
      model,
      provider: "google",
      input_tokens: tokenCount,
      output_tokens: 0,
      cost_cents: costCents,
      domain,
      category: "inference",
    });

    // Atomic budget increment via RPC
    await adminClient.rpc("update_ai_budget_usage", {
      p_user_id: userId,
      p_tokens: tokenCount,
      p_cost: costCents,
    }).catch(e => console.error("Budget RPC error:", e));
  } catch (e) {
    console.error("Token logging error:", e);
  }
}

// ═══════════════════════════════════════════════════════════════
// Main Handler
// ═══════════════════════════════════════════════════════════════

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

    const body = await validateBody(req, {
      messages: { type: "array", required: true },
      advisor: { type: "string", maxLength: 50 },
      context: { type: "object" },
    });
    if (body instanceof Response) return body;
    const { messages, advisor = "general", context } = body as { messages: unknown[]; advisor?: string; context?: Record<string, unknown> };
    if (!Array.isArray(messages) || messages.length === 0) return corsError("messages array required", 400);

    // Rate limit: max 20 requests/min
    const { count } = await supabaseClient
      .from("ai_token_usage")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("advisor_id", advisor)
      .gte("created_at", new Date(Date.now() - 60000).toISOString());
    if ((count ?? 0) >= 20) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded — max 20 requests per minute", code: "RATE_LIMITED", correlation_id: correlationId }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI provider not configured", code: "PROVIDER_MISSING", correlation_id: correlationId }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Budget check
    const budgetResult = await checkBudget(supabaseClient, user.id, "google/gemini-3-flash-preview");
    if (!budgetResult.allowed) {
      return new Response(JSON.stringify({ error: budgetResult.reason, code: "BUDGET_EXCEEDED", correlation_id: correlationId }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build dynamic prompt with knowledge, memory, corrections
    const lastUserMsg = [...messages].reverse().find((m: { role: string }) => m.role === "user")?.content ?? "";
    const systemPrompt = await buildPrompt(supabaseClient, advisor, user.id, lastUserMsg);
    const contextSuffix = context ? `\n\nUser context: ${JSON.stringify(context)}` : "";

    const aiCallStart = Date.now();
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: budgetResult.model,
        messages: [
          { role: "system", content: systemPrompt + contextSuffix },
          ...messages,
        ],
        stream: true,
      }),
    });
    const aiLatencyMs = Date.now() - aiCallStart;

    if (!response.ok) {
      const errText = await response.text();
      const errorCode = response.status === 429 ? "PROVIDER_RATE_LIMITED" : response.status === 402 ? "CREDITS_EXHAUSTED" : "PROVIDER_ERROR";
      const errorMsg = response.status === 429 ? "Rate limited — try again shortly." : response.status === 402 ? "AI credits exhausted. Add funds in Settings → Workspace → Usage." : "AI service error";

      // Log failure
      console.error(`chat-advisor [${correlationId}] AI gateway error:`, response.status, errText.slice(0, 200));
      const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
      adminClient.from("ai_token_usage").insert({
        user_id: user.id, advisor_id: advisor, model: budgetResult.model,
        provider: "google", input_tokens: 0, output_tokens: 0, cost_cents: 0,
        domain: advisor, category: "error", session_id: correlationId,
      }).then(() => {}).catch(e => console.error("Error log failure:", e));

      return new Response(JSON.stringify({ error: errorMsg, code: errorCode, correlation_id: correlationId }), {
        status: response.status === 429 || response.status === 402 ? response.status : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log token usage asynchronously with correlation ID and latency
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const inputApprox = JSON.stringify(messages).length / 4;
    logTokenUsage(adminClient, user.id, advisor, budgetResult.model, inputApprox, advisor);

    // Record advisor response with latency for traceability
    adminClient.from("advisor_responses").insert({
      user_id: user.id,
      request_id: correlationId,
      correlation_id: correlationId,
      recommendation: null,
      confidence: null,
      reasoning: null,
      actions: [],
      model_used: budgetResult.model,
      latency_ms: aiLatencyMs,
      tokens_used: Math.ceil(inputApprox),
    }).then(() => {}).catch(e => console.error("Response log error:", e));

    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "X-Correlation-Id": correlationId,
        "X-Latency-Ms": aiLatencyMs.toString(),
      },
    });
  } catch (e) {
    const totalLatency = Date.now() - requestStartTime;
    console.error(`chat-advisor [${correlationId}] error (${totalLatency}ms):`, e);
    return new Response(JSON.stringify({
      error: e instanceof Error ? e.message : "Unknown error",
      code: "INTERNAL_ERROR",
      correlation_id: correlationId,
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
