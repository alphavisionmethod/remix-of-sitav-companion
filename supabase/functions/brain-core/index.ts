import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Types ───────────────────────────────────────────────────────────────────

interface BrainRequest {
  intent: string;
  advisor: AdvisorDomain;
  context?: Record<string, unknown>;
  secondary_advisor?: AdvisorDomain;
  stream?: boolean;
}

type AdvisorDomain = "money" | "business" | "concierge" | "family" | "growth" | "general";

interface AdvisorResult {
  recommendation: string;
  confidence: number;
  reasoning: string;
  actions: unknown[];
  source: "rules" | "ai" | "fallback" | "error" | "composed";
  requiresApproval: boolean;
  model?: string;
  tokens?: number;
  complexity?: string;
}

interface MemoryRecord {
  key: string;
  value: unknown;
  category: string;
}

interface PolicyRecord {
  id: string;
  name: string;
  category: string;
  conditions: unknown;
  actions: unknown;
  approval_required: boolean;
}

// ── Intent Classifier ───────────────────────────────────────────────────────
// Maps intents to domains and complexity levels for routing

const INTENT_CATALOG: Record<string, { domain: AdvisorDomain; complexity: "simple" | "medium" | "complex"; description: string }> = {
  // Money domain
  analyze_bills: { domain: "money", complexity: "simple", description: "Analyze bill payment status" },
  detect_waste: { domain: "money", complexity: "simple", description: "Detect subscription waste" },
  analyze_receivables: { domain: "money", complexity: "simple", description: "Analyze overdue invoices" },
  cash_posture: { domain: "money", complexity: "medium", description: "Assess cash runway and health" },
  optimize_reserves: { domain: "money", complexity: "medium", description: "Review reserve fund strategy" },
  financial_review: { domain: "money", complexity: "complex", description: "Full financial health review" },
  bill_payment_strategy: { domain: "money", complexity: "medium", description: "Prioritize bill payments" },

  // Business domain
  pipeline_health: { domain: "business", complexity: "medium", description: "Analyze sales pipeline" },
  lead_scoring: { domain: "business", complexity: "medium", description: "Score and prioritize leads" },
  customer_health: { domain: "business", complexity: "medium", description: "Assess customer health scores" },
  revenue_forecast: { domain: "business", complexity: "complex", description: "Forecast revenue trajectory" },
  stale_lead_recovery: { domain: "business", complexity: "medium", description: "Identify and recover stale leads" },
  quote_followup: { domain: "business", complexity: "simple", description: "Follow up on pending quotes" },
  collections_strategy: { domain: "business", complexity: "complex", description: "Collections and receivables strategy" },

  // Concierge domain
  daily_briefing: { domain: "concierge", complexity: "medium", description: "Daily life briefing" },
  task_prioritization: { domain: "concierge", complexity: "simple", description: "Prioritize tasks" },
  grocery_planning: { domain: "concierge", complexity: "simple", description: "Plan grocery shopping" },
  travel_planning: { domain: "concierge", complexity: "complex", description: "Plan travel arrangements" },
  event_planning: { domain: "concierge", complexity: "medium", description: "Plan events and gifts" },
  schedule_optimization: { domain: "concierge", complexity: "medium", description: "Optimize calendar schedule" },

  // Family domain
  family_calendar: { domain: "family", complexity: "simple", description: "Family schedule management" },
  school_coordination: { domain: "family", complexity: "simple", description: "School and activities coordination" },
  household_tasks: { domain: "family", complexity: "simple", description: "Household task management" },
  service_provider_review: { domain: "family", complexity: "medium", description: "Review service providers" },

  // Growth domain
  growth_opportunities: { domain: "growth", complexity: "complex", description: "Identify growth opportunities" },
  market_positioning: { domain: "growth", complexity: "complex", description: "Market positioning analysis" },

  // General
  boardroom_summary: { domain: "general", complexity: "complex", description: "Cross-domain executive summary" },
  general_advice: { domain: "general", complexity: "medium", description: "General advisor query" },
};

function classifyIntent(intent: string, requestedAdvisor: AdvisorDomain): { domain: AdvisorDomain; complexity: "simple" | "medium" | "complex" } {
  const catalogEntry = INTENT_CATALOG[intent];
  if (catalogEntry) {
    return { domain: catalogEntry.domain, complexity: catalogEntry.complexity };
  }
  // Unknown intent: use requested advisor, default medium complexity
  return { domain: requestedAdvisor, complexity: "medium" };
}

// ── Cost-Aware Model Router ─────────────────────────────────────────────────

function selectModel(complexity: "simple" | "medium" | "complex"): string {
  switch (complexity) {
    case "simple": return "google/gemini-2.5-flash-lite";
    case "medium": return "google/gemini-3-flash-preview";
    case "complex": return "google/gemini-2.5-pro";
  }
}

// ── Memory Scoping ──────────────────────────────────────────────────────────

function scopeMemoryForDomain(memory: MemoryRecord[], domain: AdvisorDomain): MemoryRecord[] {
  const domainCategories: Record<string, string[]> = {
    money: ["preference", "pattern", "history", "context"],
    business: ["preference", "pattern", "history", "context"],
    concierge: ["preference", "context", "history"],
    family: ["preference", "context", "history"],
    growth: ["pattern", "context", "history"],
    general: ["preference", "pattern", "history", "context"],
  };
  const categories = domainCategories[domain] || domainCategories.general;
  // Also include domain-prefixed keys
  return memory.filter(m =>
    categories.includes(m.category) ||
    m.key.startsWith(`${domain}:`) ||
    m.category === domain
  );
}

// ── Deterministic Rules Engine ──────────────────────────────────────────────

function runRules(
  intent: string,
  advisor: string,
  context: Record<string, unknown>,
  memory: MemoryRecord[],
  policies: PolicyRecord[]
): { handled: boolean; recommendation?: string; confidence?: number; reasoning?: string; actions?: unknown[]; requiresApproval?: boolean; policyId?: string } {

  const mem: Record<string, unknown> = {};
  for (const m of memory) mem[`${m.category}:${m.key}`] = m.value;

  // ── Bill overdue detection ──
  if (intent === "analyze_bills" && context.bills) {
    const bills = context.bills as Array<{ payee: string; due_date: string; amount: number; status: string }>;
    const today = new Date();
    const overdue = bills.filter(b => new Date(b.due_date) < today && b.status !== "paid");
    const dueSoon = bills.filter(b => {
      const d = new Date(b.due_date);
      const diff = (d.getTime() - today.getTime()) / 86400000;
      return diff >= 0 && diff <= 7 && b.status !== "paid";
    });

    if (overdue.length > 0 || dueSoon.length > 0) {
      const items = [
        ...overdue.map(b => `⚠️ OVERDUE: ${b.payee} — $${b.amount}`),
        ...dueSoon.map(b => `📅 Due soon: ${b.payee} — $${b.amount} (${b.due_date})`),
      ];
      return {
        handled: true,
        recommendation: items.join("\n"),
        confidence: 0.95,
        reasoning: `Deterministic rule: Found ${overdue.length} overdue and ${dueSoon.length} upcoming bills.`,
        actions: overdue.map(b => ({ type: "flag_overdue", payee: b.payee, amount: b.amount })),
      };
    }
  }

  // ── Subscription waste detection ──
  if (intent === "detect_waste" && context.subscriptions) {
    const subs = context.subscriptions as Array<{ service_name: string; amount: number; usage_level: string; waste_flag: boolean }>;
    const waste = subs.filter(s => s.waste_flag || s.usage_level === "none" || s.usage_level === "low");
    if (waste.length > 0) {
      const savings = waste.reduce((s, w) => s + w.amount, 0);
      return {
        handled: true,
        recommendation: `${waste.length} subscriptions flagged for waste. Potential monthly savings: $${savings.toFixed(2)}.\n` +
          waste.map(w => `• ${w.service_name} — $${w.amount}/mo (usage: ${w.usage_level})`).join("\n"),
        confidence: 0.9,
        reasoning: "Deterministic rule: Flagged subscriptions with low/no usage.",
        actions: waste.map(w => ({ type: "recommend_cancel", service: w.service_name, savings: w.amount })),
      };
    }
  }

  // ── Invoice aging ──
  if (intent === "analyze_receivables" && context.invoices) {
    const invoices = context.invoices as Array<{ invoice_number: string; amount: number; due_date: string; status: string }>;
    const today = new Date();
    const overdue = invoices.filter(i => new Date(i.due_date) < today && i.status !== "paid");
    if (overdue.length > 0) {
      const total = overdue.reduce((s, i) => s + i.amount, 0);
      return {
        handled: true,
        recommendation: `${overdue.length} overdue invoices totaling $${total.toLocaleString()}. Follow up immediately.\n` +
          overdue.map(i => `• Invoice #${i.invoice_number} — $${i.amount}`).join("\n"),
        confidence: 0.92,
        reasoning: "Deterministic rule: Overdue invoice detection.",
        actions: overdue.map(i => ({ type: "follow_up_invoice", invoice: i.invoice_number, amount: i.amount })),
      };
    }
  }

  // ── Cash runway warning ──
  if (intent === "cash_posture" && context.total_balance !== undefined) {
    const balance = context.total_balance as number;
    const monthlyBurn = (mem["pattern:monthly_burn"] as number) || (context.monthly_burn as number) || 6000;
    const runway = balance / monthlyBurn;
    if (runway < 2) {
      return {
        handled: true,
        recommendation: `⚠️ Cash runway is ${runway.toFixed(1)} months. Consider reducing expenses or accelerating receivables.`,
        confidence: 0.95,
        reasoning: "Deterministic rule: Cash runway below 2-month threshold.",
        actions: [{ type: "alert_low_runway", runway_months: runway }],
      };
    }
  }

  // ── Stale lead detection ──
  if (intent === "stale_lead_recovery" && context.leads) {
    const leads = context.leads as Array<{ name: string; stale_risk: boolean; last_contact_at: string; likely_value: number }>;
    const stale = leads.filter(l => l.stale_risk);
    if (stale.length > 0) {
      const totalValue = stale.reduce((s, l) => s + (l.likely_value || 0), 0);
      return {
        handled: true,
        recommendation: `${stale.length} leads at risk of going stale. Potential value at risk: $${totalValue.toLocaleString()}.\n` +
          stale.map(l => `• ${l.name} — $${l.likely_value || 0} (last contact: ${l.last_contact_at || "never"})`).join("\n"),
        confidence: 0.88,
        reasoning: "Deterministic rule: Stale lead risk detection.",
        actions: stale.map(l => ({ type: "recover_lead", name: l.name, value: l.likely_value })),
      };
    }
  }

  // ── Task prioritization ──
  if (intent === "task_prioritization" && context.tasks) {
    const tasks = context.tasks as Array<{ title: string; priority: string; due_date: string; status: string }>;
    const pending = tasks.filter(t => t.status !== "done" && t.status !== "completed");
    const overdue = pending.filter(t => t.due_date && new Date(t.due_date) < new Date());
    const high = pending.filter(t => t.priority === "high" || t.priority === "urgent");
    if (overdue.length > 0 || high.length > 0) {
      const items = [
        ...overdue.map(t => `🔴 OVERDUE: ${t.title}`),
        ...high.filter(t => !overdue.includes(t)).map(t => `🟡 HIGH: ${t.title}`),
      ];
      return {
        handled: true,
        recommendation: `${overdue.length} overdue tasks, ${high.length} high-priority items.\n` + items.join("\n"),
        confidence: 0.9,
        reasoning: "Deterministic rule: Task priority and overdue detection.",
        actions: overdue.map(t => ({ type: "escalate_task", title: t.title })),
      };
    }
  }

  // ── Policy Engine ──
  for (const policy of policies) {
    const conditions = policy.conditions as Array<{ field: string; operator: string; value: unknown }>;
    if (!Array.isArray(conditions)) continue;

    const allMatch = conditions.every(c => {
      const val = context[c.field];
      switch (c.operator) {
        case "gt": return typeof val === "number" && val > (c.value as number);
        case "gte": return typeof val === "number" && val >= (c.value as number);
        case "lt": return typeof val === "number" && val < (c.value as number);
        case "lte": return typeof val === "number" && val <= (c.value as number);
        case "eq": return val === c.value;
        case "neq": return val !== c.value;
        case "in": return Array.isArray(c.value) && (c.value as unknown[]).includes(val);
        case "contains": return typeof val === "string" && typeof c.value === "string" && val.includes(c.value);
        default: return false;
      }
    });

    if (allMatch) {
      return {
        handled: true,
        recommendation: `Policy "${policy.name}" triggered.`,
        confidence: 1.0,
        reasoning: `Policy engine: All conditions matched for "${policy.name}" (category: ${policy.category}).`,
        actions: policy.actions as unknown[],
        requiresApproval: policy.approval_required,
        policyId: policy.id,
      };
    }
  }

  return { handled: false };
}

// ── LLM Escalation ─────────────────────────────────────────────────────────

async function callLLM(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  model: string
): Promise<{ recommendation: string; confidence: number; reasoning: string; actions: unknown[]; model: string; tokens: number }> {
  const startTime = Date.now();

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "advisor_response",
            description: "Return a structured advisor response with recommendation, confidence, reasoning, and suggested actions",
            parameters: {
              type: "object",
              properties: {
                recommendation: { type: "string", description: "Clear, actionable recommendation to the user" },
                confidence: { type: "number", description: "Confidence score 0-1" },
                reasoning: { type: "string", description: "Step-by-step reasoning chain explaining how you arrived at this recommendation" },
                actions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      type: { type: "string", description: "Action type identifier" },
                      description: { type: "string", description: "Human-readable action description" },
                      priority: { type: "string", enum: ["low", "medium", "high", "urgent"] },
                    },
                    required: ["type", "description"],
                    additionalProperties: false,
                  },
                  description: "Suggested actions to take",
                },
              },
              required: ["recommendation", "confidence", "reasoning", "actions"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "advisor_response" } },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("LLM error:", response.status, errorText);
    if (response.status === 429) throw new Error("RATE_LIMITED");
    if (response.status === 402) throw new Error("CREDITS_EXHAUSTED");
    throw new Error(`AI gateway error: ${response.status}`);
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

  if (toolCall?.function?.arguments) {
    const parsed = JSON.parse(toolCall.function.arguments);
    return {
      recommendation: parsed.recommendation || "No recommendation available.",
      confidence: parsed.confidence || 0.5,
      reasoning: parsed.reasoning || "AI-generated response.",
      actions: parsed.actions || [],
      model: data.model || model,
      tokens: data.usage?.total_tokens || 0,
    };
  }

  const content = data.choices?.[0]?.message?.content || "Unable to generate recommendation.";
  return {
    recommendation: content,
    confidence: 0.5,
    reasoning: "AI-generated response (fallback path).",
    actions: [],
    model: data.model || model,
    tokens: data.usage?.total_tokens || 0,
  };
}

// ── Advisor System Prompts ──────────────────────────────────────────────────

const defaultPrompts: Record<string, string> = {
  money: `You are the SITA Money Advisor — a sharp, quantitative financial operations advisor for founders and small business owners. You analyze cash posture, bills, subscriptions, reserves, and financial obligations.

Rules:
- Always be specific with numbers and dates
- Flag risks before making suggestions
- Prioritize cash preservation
- Consider both personal and business finances
- Recommend concrete next steps with timelines
- When suggesting cancellations or changes, estimate savings`,

  business: `You are the SITA Business Advisor — a strategic growth and revenue advisor for founders. You analyze leads, opportunities, customers, invoices, quotes, and pipeline health.

Rules:
- Focus on revenue impact and ROI
- Prioritize actions by potential value
- Flag stale opportunities and at-risk customers
- Recommend specific follow-up actions with timelines
- Consider conversion probability in recommendations
- Track pipeline momentum and velocity`,

  concierge: `You are the SITA Concierge Advisor — an executive life management advisor. You help manage household tasks, scheduling, grocery planning, travel, events, and daily operations.

Rules:
- Prioritize by urgency and importance
- Consider family dynamics and preferences
- Be practical and time-efficient
- Suggest delegation where appropriate
- Group related tasks for efficiency
- Remember recurring patterns and preferences`,

  family: `You are the SITA Family Advisor — a household and family coordination advisor. You manage family calendars, school activities, household tasks, service providers, and family wellness.

Rules:
- Consider all family members' schedules
- Prioritize children's needs and activities
- Coordinate across family members
- Track recurring commitments
- Flag scheduling conflicts early
- Suggest fair task distribution`,

  growth: `You are the SITA Growth Advisor — a strategic growth and market positioning advisor for founders. You identify expansion opportunities, analyze market positioning, and recommend growth strategies.

Rules:
- Focus on sustainable growth, not vanity metrics
- Consider resource constraints
- Recommend experiments with clear success criteria
- Analyze competitive positioning
- Prioritize by effort-to-impact ratio
- Consider timing and market conditions`,

  general: `You are SITA, an intelligent operating system for founders. You provide clear, actionable recommendations across money, business, and life management. Be concise, high-confidence, and always suggest concrete next steps.`,
};

// ── Multi-Advisor Composition ───────────────────────────────────────────────

function composeAdvisorResults(primary: AdvisorResult, secondary: AdvisorResult, primaryDomain: string, secondaryDomain: string): AdvisorResult {
  // Merge actions, deduplicate by type
  const allActions = [...(primary.actions as Array<{ type: string }>), ...(secondary.actions as Array<{ type: string }>)];
  const seenTypes = new Set<string>();
  const deduped = allActions.filter(a => {
    if (seenTypes.has(a.type)) return false;
    seenTypes.add(a.type);
    return true;
  });

  // Use higher confidence as primary, note both in reasoning
  const leadAdvisor = primary.confidence >= secondary.confidence ? primary : secondary;
  const supportAdvisor = primary.confidence >= secondary.confidence ? secondary : primary;

  return {
    recommendation: `**${primaryDomain.toUpperCase()} ADVISOR**: ${primary.recommendation}\n\n**${secondaryDomain.toUpperCase()} ADVISOR**: ${secondary.recommendation}`,
    confidence: Math.max(primary.confidence, secondary.confidence),
    reasoning: `Composed from ${primaryDomain} (confidence: ${primary.confidence.toFixed(2)}) and ${secondaryDomain} (confidence: ${secondary.confidence.toFixed(2)}). Lead: ${leadAdvisor === primary ? primaryDomain : secondaryDomain}.`,
    actions: deduped,
    source: "composed",
    requiresApproval: primary.requiresApproval || secondary.requiresApproval,
    model: primary.model || secondary.model,
    tokens: (primary.tokens || 0) + (secondary.tokens || 0),
  };
}

// ── Correlation ID Generator ────────────────────────────────────────────────

function generateCorrelationId(): string {
  return `sita-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// ── Main Handler ────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const correlationId = generateCorrelationId();
  const startTime = Date.now();

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    // ── Auth ──
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized", correlation_id: correlationId }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUser = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized", correlation_id: correlationId }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Parse Request ──
    const body: BrainRequest = await req.json();
    if (!body.intent) {
      return new Response(JSON.stringify({ error: "intent is required", correlation_id: correlationId }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const advisor = body.advisor || "general";
    const context = body.context || {};

    // ── Intent Classification ──
    const { domain, complexity } = classifyIntent(body.intent, advisor);
    const model = selectModel(complexity);

    console.log(`[${correlationId}] Intent: ${body.intent} | Domain: ${domain} | Complexity: ${complexity} | Model: ${model}`);

    // ── Load Memory (domain-scoped) ──
    const { data: rawMemory } = await supabase
      .from("user_memory")
      .select("key, value, category")
      .eq("user_id", user.id)
      .limit(100);

    const memory = scopeMemoryForDomain(rawMemory || [], domain);

    // ── Load Policies ──
    const { data: policies } = await supabase
      .from("policies")
      .select("id, name, category, conditions, actions, approval_required")
      .eq("user_id", user.id)
      .eq("active", true);

    // ── Load Advisor Config ──
    const { data: advisorConfig } = await supabase
      .from("advisor_configs")
      .select("system_prompt, rules, escalation_threshold, allowed_actions")
      .eq("user_id", user.id)
      .eq("persona", domain)
      .eq("active", true)
      .limit(1)
      .maybeSingle();

    const escalationThreshold = advisorConfig?.escalation_threshold || 0.7;

    // ── Log Request ──
    const { data: requestRecord } = await supabase
      .from("advisor_requests")
      .insert({
        user_id: user.id,
        intent: body.intent,
        context,
        status: "processing",
        correlation_id: correlationId,
        complexity,
      })
      .select("id")
      .single();

    const requestId = requestRecord?.id;

    // ── Step 1: Deterministic Rules ──
    const ruleResult = runRules(body.intent, domain, context, memory, (policies || []) as PolicyRecord[]);

    let finalResponse: AdvisorResult;

    if (ruleResult.handled) {
      finalResponse = {
        recommendation: ruleResult.recommendation!,
        confidence: ruleResult.confidence!,
        reasoning: ruleResult.reasoning!,
        actions: ruleResult.actions || [],
        source: "rules",
        requiresApproval: ruleResult.requiresApproval || false,
        complexity,
      };
    } else {
      // ── Step 2: LLM Escalation ──
      if (!LOVABLE_API_KEY) {
        finalResponse = {
          recommendation: "AI advisor is not configured. Enable Lovable AI in settings.",
          confidence: 0,
          reasoning: "No API key available for LLM escalation.",
          actions: [],
          source: "fallback",
          requiresApproval: false,
          complexity,
        };
      } else {
        const systemPrompt = advisorConfig?.system_prompt || defaultPrompts[domain] || defaultPrompts.general;
        const memoryContext = memory.map(m => `${m.category}/${m.key}: ${JSON.stringify(m.value)}`).join("\n");
        const userPrompt = `Intent: ${body.intent}\n\nContext:\n${JSON.stringify(context, null, 2)}\n\nUser Memory:\n${memoryContext || "No memory stored yet."}`;

        try {
          const llmResult = await callLLM(systemPrompt, userPrompt, LOVABLE_API_KEY, model);

          // Check if confidence is below escalation threshold
          const needsApproval = llmResult.confidence < escalationThreshold;

          finalResponse = {
            recommendation: llmResult.recommendation,
            confidence: llmResult.confidence,
            reasoning: llmResult.reasoning,
            actions: llmResult.actions,
            source: "ai",
            model: llmResult.model,
            tokens: llmResult.tokens,
            requiresApproval: needsApproval,
            complexity,
          };

          // ── Multi-Advisor Composition ──
          if (body.secondary_advisor && body.secondary_advisor !== domain) {
            const secondaryPrompt = defaultPrompts[body.secondary_advisor] || defaultPrompts.general;
            try {
              const secondaryResult = await callLLM(secondaryPrompt, userPrompt, LOVABLE_API_KEY, model);
              const secondaryResponse: AdvisorResult = {
                recommendation: secondaryResult.recommendation,
                confidence: secondaryResult.confidence,
                reasoning: secondaryResult.reasoning,
                actions: secondaryResult.actions,
                source: "ai",
                requiresApproval: secondaryResult.confidence < escalationThreshold,
                model: secondaryResult.model,
                tokens: secondaryResult.tokens,
              };
              finalResponse = composeAdvisorResults(finalResponse, secondaryResponse, domain, body.secondary_advisor);
            } catch (e) {
              console.warn(`[${correlationId}] Secondary advisor (${body.secondary_advisor}) failed, using primary only:`, e);
              // Continue with primary result only
            }
          }
        } catch (e) {
          console.error(`[${correlationId}] LLM call failed:`, e);
          const errMsg = e instanceof Error ? e.message : "Unknown";

          if (errMsg === "RATE_LIMITED") {
            return new Response(JSON.stringify({ error: "Rate limited — try again in a moment.", correlation_id: correlationId }), {
              status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          if (errMsg === "CREDITS_EXHAUSTED") {
            return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in Settings → Workspace → Usage.", correlation_id: correlationId }), {
              status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }

          finalResponse = {
            recommendation: "Unable to generate AI recommendation at this time. Try again shortly.",
            confidence: 0,
            reasoning: `LLM error: ${errMsg}`,
            actions: [],
            source: "error",
            requiresApproval: false,
            complexity,
          };
        }
      }
    }

    const latencyMs = Date.now() - startTime;

    // ── Persist: Response, Proof, Approval ──
    if (requestId) {
      await supabase.from("advisor_responses").insert({
        user_id: user.id,
        request_id: requestId,
        recommendation: finalResponse.recommendation,
        confidence: finalResponse.confidence,
        reasoning: finalResponse.reasoning,
        actions: finalResponse.actions,
        model_used: finalResponse.source === "ai" || finalResponse.source === "composed" ? finalResponse.model : finalResponse.source,
        tokens_used: finalResponse.tokens || 0,
        correlation_id: correlationId,
        latency_ms: latencyMs,
      });

      await supabase.from("advisor_requests").update({ status: "completed" }).eq("id", requestId);

      await supabase.from("proof_records").insert({
        user_id: user.id,
        action_summary: `${domain} advisor: ${body.intent}`,
        result: finalResponse.source === "error" ? "failed" : "completed",
        verification: finalResponse.source === "rules" ? "system-verified" : "unverified",
        category: domain,
        advisor_request_id: requestId,
        correlation_id: correlationId,
        policy_id: (ruleResult as any).policyId || null,
      });

      if (finalResponse.requiresApproval) {
        await supabase.from("approval_queue").insert({
          user_id: user.id,
          advisor_request_id: requestId,
          action_summary: finalResponse.recommendation.slice(0, 500),
          proposed_action: { actions: finalResponse.actions, source: finalResponse.source, confidence: finalResponse.confidence },
          status: "pending",
        });
      }
    }

    console.log(`[${correlationId}] Completed in ${latencyMs}ms | Source: ${finalResponse.source} | Confidence: ${finalResponse.confidence}`);

    return new Response(JSON.stringify({
      request_id: requestId,
      correlation_id: correlationId,
      advisor: domain,
      ...finalResponse,
      latency_ms: latencyMs,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    const latencyMs = Date.now() - startTime;
    console.error(`[${correlationId}] Brain Core error (${latencyMs}ms):`, e);
    return new Response(JSON.stringify({
      error: e instanceof Error ? e.message : "Unknown error",
      correlation_id: correlationId,
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
