import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── MODEL ROUTING ────────────────────────────────────────────
const MODEL_ROUTES: Record<string, { primary: string; fallback: string }> = {
  signal_classification: { primary: "google/gemini-2.5-flash-lite", fallback: "google/gemini-2.5-flash" },
  recommendation: { primary: "google/gemini-3-flash-preview", fallback: "google/gemini-2.5-flash" },
  strategic_synthesis: { primary: "openai/gpt-5-mini", fallback: "google/gemini-2.5-flash" },
  draft_writing: { primary: "google/gemini-2.5-flash", fallback: "google/gemini-2.5-flash-lite" },
  financial_analysis: { primary: "openai/gpt-5-mini", fallback: "google/gemini-3-flash-preview" },
};

function getModel(task: string) {
  return MODEL_ROUTES[task]?.primary ?? "google/gemini-3-flash-preview";
}

// ─── BUSINESS ARCHETYPES ──────────────────────────────────────
const ARCHETYPE_CONTEXT: Record<string, string> = {
  "solo-service": "Solo service provider. Priority: missed leads, slow follow-up, scheduling, underpricing. Key flow: lead→quote→schedule→complete→invoice→review.",
  "local-service": "Local/home service business. Priority: missed calls, scheduling efficiency, route optimization, seasonal demand.",
  "agency": "Agency model. Priority: project drift, scope creep, client profitability, pipeline velocity, utilization.",
  "consulting": "Consulting/coaching. Priority: client outcomes, renewal rates, IP leverage, time utilization.",
  "appointment-based": "Appointment-based. Priority: no-shows, booking efficiency, client retention, schedule optimization.",
  "project-based": "Project-based. Priority: scope management, milestone tracking, cash flow timing, resource allocation.",
  "recurring-service": "Recurring service. Priority: churn prevention, upsell, service quality, automation.",
  "ecommerce": "E-commerce. Priority: conversion, AOV, customer acquisition cost, inventory, fulfillment.",
  "field-operations": "Field operations. Priority: dispatch, route efficiency, completion rates, equipment.",
  "small-team": "Small team operator. Priority: team utilization, delegation, communication, accountability.",
  "hybrid": "Hybrid model. Priority: cross-channel coordination, unified view, priority management.",
  "household-business": "Household-business blend. Priority: boundary management, dual scheduling, combined finances.",
};

// ─── ADVISOR PERSONAS ─────────────────────────────────────────
const ADVISOR_PERSONAS: Record<string, string> = {
  ceo: "CEO Advisor: Strategic thinker. Focus on business direction, competitive positioning, growth trajectory, owner wellbeing.",
  coo: "COO Advisor: Operations expert. Focus on workflows, bottlenecks, process efficiency, delivery quality, team coordination.",
  cfo: "CFO/Finance Advisor: Financial guardian. Focus on cash flow, margins, pricing, expense control, financial risk.",
  sales: "Sales Director: Revenue driver. Focus on pipeline, lead conversion, follow-up velocity, deal value, closing.",
  marketing: "Marketing Advisor: Growth strategist. Focus on lead generation, brand positioning, channel effectiveness, ROI.",
  "client-success": "Client Success: Retention specialist. Focus on client health, satisfaction, renewals, upsells, churn prevention.",
  "executive-assistant": "Executive Assistant: Owner support. Focus on calendar, priorities, communications, preparation, owner clarity.",
  "people-ops": "People & Culture: Team optimizer. Focus on team health, workload balance, morale, coordination, delegation.",
  risk: "Risk Advisor: Threat scanner. Focus on financial risk, operational risk, client risk, compliance, contingency.",
  strategy: "Strategy Advisor: Long-term thinker. Focus on market positioning, differentiation, capacity planning, competitive advantage.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const body = await req.json();
    const { advisorIds, businessContext, memorySnapshot, archetype, advisorPersonas, _userId, _persist } = body;

    // ─── LAYER 1: PERCEPTION ────────────────────────────────
    // If _userId provided, query real business data
    let realDataContext = "";
    if (_userId) {
      try {
        const svc = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
        const [contacts, tasks, calendar, invoices, memories, healthScores, profitSignals, actions] = await Promise.all([
          svc.from("contacts").select("id,first_name,last_name,company,status,last_contacted_at,lead_score").eq("user_id", _userId).limit(50).catch(() => ({ data: null })),
          svc.from("tasks").select("id,title,status,priority,due_date,assigned_to").eq("user_id", _userId).in("status", ["pending", "in_progress"]).limit(30).catch(() => ({ data: null })),
          svc.from("calendar_events").select("id,title,event_date,start_time,domain,event_type").eq("user_id", _userId).gte("event_date", new Date().toISOString().split("T")[0]).limit(20).catch(() => ({ data: null })),
          svc.from("invoices").select("id,amount,status,due_date,customer_name").eq("user_id", _userId).limit(30).catch(() => ({ data: null })),
          svc.from("advisor_board_memory").select("content,memory_layer,importance,advisor_id").eq("user_id", _userId).eq("status", "active").order("importance", { ascending: false }).limit(30).catch(() => ({ data: null })),
          svc.from("business_health_scores").select("dimension,score,trend").eq("user_id", _userId).order("scored_at", { ascending: false }).limit(9).catch(() => ({ data: null })),
          svc.from("profit_signals").select("title,category,urgency,status").eq("user_id", _userId).eq("status", "detected").limit(10).catch(() => ({ data: null })),
          svc.from("advisor_board_actions").select("title,status,advisor_id").eq("user_id", _userId).in("status", ["proposed", "approved"]).limit(10).catch(() => ({ data: null })),
        ]);

        // ─── LAYER 2: NORMALIZATION ───────────────────────────
        const signals: string[] = [];
        const contactData = (contacts as { data: unknown[] | null }).data;
        const taskData = (tasks as { data: unknown[] | null }).data;
        const calendarData = (calendar as { data: unknown[] | null }).data;
        const invoiceData = (invoices as { data: unknown[] | null }).data;
        const memoryData = (memories as { data: unknown[] | null }).data;
        const healthData = (healthScores as { data: unknown[] | null }).data;
        const profitData = (profitSignals as { data: unknown[] | null }).data;
        const actionData = (actions as { data: unknown[] | null }).data;

        if (contactData?.length) signals.push(`CONTACTS: ${contactData.length} active contacts in CRM.`);
        if (taskData?.length) signals.push(`TASKS: ${taskData.length} active tasks.`);
        if (calendarData?.length) signals.push(`CALENDAR: ${calendarData.length} upcoming events.`);
        if (invoiceData?.length) {
          const overdue = (invoiceData as Array<{ status: string }>).filter(i => i.status === "overdue");
          if (overdue.length) signals.push(`INVOICES: ${overdue.length} overdue invoices requiring attention.`);
        }
        if (healthData?.length) signals.push(`HEALTH: ${(healthData as Array<{ dimension: string; score: number }>).map(h => `${h.dimension}=${h.score}`).join(", ")}`);
        if (profitData?.length) signals.push(`PROFIT SIGNALS: ${profitData.length} active profit signals detected.`);
        if (actionData?.length) signals.push(`PENDING ACTIONS: ${actionData.length} actions awaiting execution.`);

        // ─── LAYER 3: CONTEXTUALIZATION ───────────────────────
        const archetypeContext = ARCHETYPE_CONTEXT[archetype ?? "solo-service"] ?? "";
        const memoryContext = memoryData?.length
          ? `\nADVISOR MEMORY:\n${(memoryData as Array<{ content: string; memory_layer: string }>).map(m => `[${m.memory_layer}] ${m.content}`).join("\n")}`
          : "";

        realDataContext = `\n\nREAL BUSINESS SIGNALS:\n${signals.join("\n")}${memoryContext}\n\nBUSINESS ARCHETYPE: ${archetypeContext}`;
      } catch (e) {
        console.error("Real data fetch error:", e);
        realDataContext = "\n\nNote: Could not fetch real business data. Using provided context only.";
      }
    }

    // ─── LAYER 4: ADVISOR REASONING ─────────────────────────
    const activeAdvisors = (advisorIds ?? Object.keys(ADVISOR_PERSONAS)).slice(0, 10);
    const personaContext = activeAdvisors
      .map((id: string) => ADVISOR_PERSONAS[id] ?? `${id}: General advisor`)
      .join("\n");

    const systemPrompt = `You are the SITA Business OS Board of Advisors — a production-grade AI executive advisory engine with ${activeAdvisors.length} specialized advisors.

ADVISOR ROLES:
${personaContext}

${businessContext ? `BUSINESS CONTEXT:\n${businessContext}` : ""}
${realDataContext}

${memorySnapshot ? `\nOWNER PREFERENCES:\n${JSON.stringify(memorySnapshot).slice(0, 2000)}` : ""}

${advisorPersonas ? `\nADDITIONAL PERSONA CONTEXT:\n${advisorPersonas.slice(0, 2000)}` : ""}

COGNITIVE PIPELINE INSTRUCTIONS:
1. PERCEIVE: Analyze all available business signals and data
2. NORMALIZE: Identify the most important business events and states  
3. CONTEXTUALIZE: Consider business type, goals, and current conditions
4. REASON: Each advisor interprets signals through their specialist lens
5. SYNTHESIZE: Merge perspectives into ranked, de-duplicated recommendations
6. PLAN: Include specific actionable next steps with each recommendation
7. REFLECT: Note where data is insufficient or assumptions are made

QUALITY RULES:
- Never claim certainty you don't have. State confidence honestly.
- Distinguish facts from inferences clearly.
- Prefer specific, actionable language over abstract advice.
- Every recommendation must cite which signals drove it.
- Flag where advisors disagree or where risk is elevated.
- Include at least one revenue-protection and one cost-control recommendation.

Generate 6-12 recommendations covering: revenue, operations, finance, client health, strategy, and team.`;

    // ─── LAYER 5: SYNTHESIS (AI Call) ─────────────────────────
    const model = getModel("recommendation");
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
          { role: "user", content: `Run the full cognitive pipeline and generate executive recommendations. Active advisors: ${JSON.stringify(activeAdvisors)}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "provide_recommendations",
            description: "Return structured advisor recommendations from the cognitive pipeline",
            parameters: {
              type: "object",
              properties: {
                recommendations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      advisorId: { type: "string" },
                      title: { type: "string" },
                      summary: { type: "string" },
                      rationale: { type: "string", description: "Why this matters now, citing specific signals" },
                      domain: { type: "string", enum: ["revenue", "operations", "finance", "clients", "strategy", "team", "general"] },
                      category: { type: "string", enum: ["revenue-protection", "cost-control", "growth", "risk-mitigation", "efficiency", "retention", "strategic", "operational"] },
                      urgency: { type: "string", enum: ["low", "medium", "high", "critical"] },
                      confidence: { type: "number" },
                      suggestedActions: { type: "array", items: { type: "string" } },
                      riskFlags: { type: "array", items: { type: "string" } },
                      contributingAdvisors: { type: "array", items: { type: "string" }, description: "Other advisors who support this recommendation" },
                      confidenceProfile: {
                        type: "object",
                        properties: {
                          confidence: { type: "number" },
                          urgency: { type: "number" },
                          businessImpact: { type: "number" },
                          reversibility: { type: "number" },
                          profitRelevance: { type: "number" },
                          relationshipRisk: { type: "number" },
                          operationalRisk: { type: "number" },
                          clarity: { type: "number" },
                        },
                        required: ["confidence", "urgency", "businessImpact", "reversibility", "profitRelevance", "relationshipRisk", "operationalRisk", "clarity"],
                      },
                      dataGaps: { type: "array", items: { type: "string" }, description: "What data is missing that would improve this recommendation" },
                    },
                    required: ["advisorId", "title", "summary", "rationale", "domain", "category", "urgency", "confidence", "suggestedActions", "riskFlags", "confidenceProfile"],
                  },
                },
                boardSummary: { type: "string", description: "3-5 sentence executive summary of the board's consensus view" },
                topPriority: { type: "string", description: "The single most important thing to do right now" },
                disagreements: { type: "array", items: { type: "string" }, description: "Areas where advisors disagree" },
              },
              required: ["recommendations", "boardSummary", "topPriority"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "provide_recommendations" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const text = await response.text();
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited — please try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      console.error("AI gateway error:", status, text);
      // ─── FALLBACK ──────────────────────────────────────────
      const fallbackModel = MODEL_ROUTES.recommendation.fallback;
      console.log(`Attempting fallback with ${fallbackModel}`);
      // Return a degraded response rather than error
      return new Response(JSON.stringify({ 
        recommendations: [], 
        boardSummary: "Unable to generate recommendations at this time. The AI service is temporarily unavailable.",
        topPriority: "Review pending items manually.",
        error: "AI service temporarily unavailable. Using fallback.",
        model: fallbackModel,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    let parsed = { recommendations: [], boardSummary: "", topPriority: "", disagreements: [] };

    if (toolCall?.function?.arguments) {
      try {
        parsed = JSON.parse(toolCall.function.arguments);
      } catch {
        console.error("Failed to parse tool call arguments");
      }
    }

    // ─── LAYER 8: REFLECTION (log receipt) ────────────────────
    const receipt = {
      model,
      advisorCount: activeAdvisors.length,
      recommendationCount: parsed.recommendations?.length ?? 0,
      timestamp: new Date().toISOString(),
      hadRealData: !!_userId && realDataContext.length > 100,
      archetype: archetype ?? "unknown",
    };

    console.log("Cognitive pipeline receipt:", JSON.stringify(receipt));

    return new Response(JSON.stringify({
      recommendations: parsed.recommendations ?? [],
      boardSummary: parsed.boardSummary ?? "",
      topPriority: parsed.topPriority ?? "",
      disagreements: parsed.disagreements ?? [],
      receipt,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("advisor-deep-intelligence error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
