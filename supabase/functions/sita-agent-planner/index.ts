// ═══════════════════════════════════════════════════════════════
// SITA OS — Sita Agent Planner (Phase E)
// ═══════════════════════════════════════════════════════════════
// Turns a free-form user intent + autonomy tier into a typed
// ActionPlan. Uses Lovable AI Gateway with tool calling so the
// model is forced to return a structured plan we can validate.
//
// Server-side enforcement:
//  - Unknown skillIds are rejected (we hand the model the catalog).
//  - Irreversible / high-risk steps are forced to requiresApproval.
//  - canAutoRun is computed from the *server-known* policy, not
//    whatever the model asserts.
// ═══════════════════════════════════════════════════════════════

import { corsHeaders } from "@supabase/supabase-js/cors";

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

// ── Skill catalog (kept in sync with src/lib/sita-agent/skills/*) ──
type Risk = "low" | "medium" | "high";
type Domain = "business" | "finance" | "concierge";
interface CatalogEntry {
  id: string;
  domain: Domain;
  description: string;
  risk: Risk;
  reversible: boolean;
  requiresApproval: boolean;
}

const CATALOG: CatalogEntry[] = [
  // Business
  { id: "business.task.create", domain: "business", description: "Create a task.", risk: "low", reversible: true, requiresApproval: false },
  { id: "business.task.update", domain: "business", description: "Edit an existing task.", risk: "low", reversible: true, requiresApproval: false },
  { id: "business.proposal.draft", domain: "business", description: "Draft a proposal (no send).", risk: "low", reversible: true, requiresApproval: false },
  { id: "business.meeting.schedule", domain: "business", description: "Schedule a calendar meeting.", risk: "medium", reversible: true, requiresApproval: false },
  { id: "business.report.generate", domain: "business", description: "Generate a report artifact.", risk: "low", reversible: true, requiresApproval: false },
  { id: "business.contact.upsert", domain: "business", description: "Create / update a contact.", risk: "low", reversible: true, requiresApproval: false },
  { id: "business.workflow.trigger", domain: "business", description: "Trigger a saved workflow.", risk: "medium", reversible: false, requiresApproval: true },
  // Finance
  { id: "finance.bill.create", domain: "finance", description: "Record a bill.", risk: "low", reversible: true, requiresApproval: false },
  { id: "finance.invoice.create", domain: "finance", description: "Draft an invoice.", risk: "low", reversible: true, requiresApproval: false },
  { id: "finance.invoice.send", domain: "finance", description: "Email an invoice (irreversible).", risk: "medium", reversible: false, requiresApproval: true },
  { id: "finance.transaction.categorize", domain: "finance", description: "Categorize a transaction.", risk: "low", reversible: true, requiresApproval: false },
  { id: "finance.cashflow.project", domain: "finance", description: "Run a cash-flow projection.", risk: "low", reversible: true, requiresApproval: false },
  { id: "finance.scenario.simulate", domain: "finance", description: "Simulate a what-if scenario.", risk: "low", reversible: true, requiresApproval: false },
  { id: "finance.payment.prepare", domain: "finance", description: "Stage a payment for approval.", risk: "high", reversible: true, requiresApproval: true },
  // Concierge
  { id: "concierge.reservation.book", domain: "concierge", description: "Book a reservation.", risk: "medium", reversible: true, requiresApproval: false },
  { id: "concierge.reservation.reschedule", domain: "concierge", description: "Reschedule a reservation.", risk: "low", reversible: true, requiresApproval: false },
  { id: "concierge.reservation.cancel", domain: "concierge", description: "Cancel a reservation.", risk: "medium", reversible: false, requiresApproval: true },
  { id: "concierge.reminder.create", domain: "concierge", description: "Create a reminder.", risk: "low", reversible: true, requiresApproval: false },
  { id: "concierge.travel.request", domain: "concierge", description: "Open a travel request.", risk: "high", reversible: true, requiresApproval: true },
  { id: "concierge.lifestyle.task", domain: "concierge", description: "Lifestyle errand.", risk: "low", reversible: true, requiresApproval: false },
];

const CATALOG_BY_ID = new Map(CATALOG.map((e) => [e.id, e]));

const MAX_STEPS = 12;

function maxRisk(steps: { risk: Risk }[]): Risk {
  let r: Risk = "low";
  for (const s of steps) {
    if (s.risk === "high") return "high";
    if (s.risk === "medium") r = "medium";
  }
  return r;
}

function canAutoRun(steps: { risk: Risk; reversible: boolean; requiresApproval: boolean }[], tier: number): boolean {
  if (tier <= 1) return false;
  for (const s of steps) {
    if (s.requiresApproval) return false;
    if (!s.reversible && s.risk !== "low") return false;
    if (tier === 2 && !(s.risk === "low" && s.reversible)) return false;
    if (tier === 3 && !s.reversible) return false;
  }
  return true;
}

function uid(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

const PLANNER_TOOL = {
  type: "function",
  function: {
    name: "emit_action_plan",
    description: "Emit a typed action plan composed of allowed skills only.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "Short headline of the plan." },
        rationale: { type: "string", description: "Plain-English why." },
        steps: {
          type: "array",
          minItems: 1,
          maxItems: MAX_STEPS,
          items: {
            type: "object",
            properties: {
              skillId: { type: "string", description: "MUST be one of the allowed skill ids from the catalog." },
              summary: { type: "string", description: "User-facing one-liner for this step." },
              payload: { type: "object", additionalProperties: true, description: "Parameters for the kernel capability." },
            },
            required: ["skillId", "summary", "payload"],
            additionalProperties: false,
          },
        },
      },
      required: ["title", "steps"],
      additionalProperties: false,
    },
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY missing" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const intent = typeof body.intent === "string" ? body.intent.trim() : "";
    const domain: Domain = ["business", "finance", "concierge"].includes(body.domain) ? body.domain : "business";
    const autonomyTier = Math.max(0, Math.min(4, Number.parseInt(String(body.autonomyTier ?? 1), 10) || 1));

    if (!intent) {
      return new Response(JSON.stringify({ error: "intent required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const allowed = CATALOG.map((e) => `- ${e.id} (${e.domain}, risk=${e.risk}, reversible=${e.reversible}): ${e.description}`).join("\n");

    const systemPrompt = [
      "You are Sita's planner. Translate the user's intent into a concrete, ordered Action Plan.",
      `Primary domain hint: ${domain}.`,
      "RULES:",
      "1. ONLY emit steps whose skillId appears in the allowed catalog below — never invent ids.",
      "2. Prefer the smallest number of steps that completes the intent. Max 12 steps.",
      "3. Each step's `payload` must be a JSON object the capability can consume directly.",
      "4. Order steps so prerequisites come first.",
      "5. Keep summaries short (≤ 80 chars), human-readable, action-oriented.",
      "",
      "ALLOWED SKILLS:",
      allowed,
    ].join("\n");

    const aiResp = await fetch(LOVABLE_AI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: intent },
        ],
        tools: [PLANNER_TOOL],
        tool_choice: { type: "function", function: { name: "emit_action_plan" } },
      }),
    });

    if (aiResp.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (aiResp.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in Settings → Workspace → Usage." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("[sita-agent-planner] gateway error", aiResp.status, t);
      return new Response(JSON.stringify({ error: "planner_gateway_error" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiResp.json();
    const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
    const argsRaw = toolCall?.function?.arguments;
    if (!argsRaw) {
      return new Response(JSON.stringify({ error: "planner_no_tool_call" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let parsed: { title?: string; rationale?: string; steps?: Array<{ skillId: string; summary: string; payload: Record<string, unknown> }> };
    try {
      parsed = JSON.parse(argsRaw);
    } catch (e) {
      console.error("[sita-agent-planner] bad json", e, argsRaw);
      return new Response(JSON.stringify({ error: "planner_bad_json" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rawSteps = Array.isArray(parsed.steps) ? parsed.steps.slice(0, MAX_STEPS) : [];
    if (rawSteps.length === 0) {
      return new Response(JSON.stringify({ plan: null }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate + harden each step against the server-side catalog.
    const steps = [];
    for (let i = 0; i < rawSteps.length; i++) {
      const s = rawSteps[i];
      const meta = CATALOG_BY_ID.get(s?.skillId);
      if (!meta) continue; // drop unknown skills entirely
      steps.push({
        id: `s${i + 1}`,
        skillId: meta.id,
        summary: typeof s.summary === "string" ? s.summary.slice(0, 200) : meta.description,
        payload: (s.payload && typeof s.payload === "object") ? s.payload : {},
        risk: meta.risk,
        reversible: meta.reversible,
        // Force approval on high-risk or irreversible regardless of model output.
        requiresApproval: meta.requiresApproval || meta.risk === "high" || !meta.reversible,
      });
    }

    if (steps.length === 0) {
      return new Response(JSON.stringify({ plan: null }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const plan = {
      id: uid("plan"),
      intent,
      domain,
      title: typeof parsed.title === "string" && parsed.title.trim() ? parsed.title.slice(0, 120) : intent.slice(0, 120),
      rationale: typeof parsed.rationale === "string" ? parsed.rationale.slice(0, 600) : undefined,
      steps,
      risk: maxRisk(steps),
      reversible: steps.every((s) => s.reversible),
      autonomyTier,
      canAutoRun: canAutoRun(steps, autonomyTier),
      createdAt: Date.now(),
    };

    return new Response(JSON.stringify({ plan }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[sita-agent-planner] crashed", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});