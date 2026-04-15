// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Deep Intelligence: 8-Layer Cognitive Pipeline
// Production-grade multi-stage AI reasoning engine
// ═══════════════════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function jsonResp(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

// ═══════════════════════════════════════════════════════════════
// MODEL ROUTING — Task-specific model selection with fallbacks
// ═══════════════════════════════════════════════════════════════
const MODEL_ROUTES: Record<string, { primary: string; fallback: string; maxTokens: number }> = {
  signal_classification: { primary: "google/gemini-2.5-flash-lite", fallback: "google/gemini-2.5-flash", maxTokens: 2000 },
  contextualization:     { primary: "google/gemini-2.5-flash",      fallback: "google/gemini-2.5-flash-lite", maxTokens: 3000 },
  advisor_reasoning:     { primary: "google/gemini-3-flash-preview", fallback: "google/gemini-2.5-flash", maxTokens: 6000 },
  cross_synthesis:       { primary: "google/gemini-3-flash-preview", fallback: "google/gemini-2.5-flash", maxTokens: 6000 },
  action_planning:       { primary: "google/gemini-2.5-flash",      fallback: "google/gemini-2.5-flash-lite", maxTokens: 4000 },
  financial_analysis:    { primary: "google/gemini-3-flash-preview", fallback: "google/gemini-2.5-flash", maxTokens: 4000 },
  reflection:            { primary: "google/gemini-2.5-flash-lite",  fallback: "google/gemini-2.5-flash-lite", maxTokens: 1500 },
};

// ═══════════════════════════════════════════════════════════════
// BUSINESS ARCHETYPES — Shape reasoning per business type
// ═══════════════════════════════════════════════════════════════
const ARCHETYPE_PROFILES: Record<string, { focus: string; risks: string[]; flows: string[]; metrics: string[] }> = {
  "solo-service": {
    focus: "Solo service provider optimizing time, pricing, and client flow",
    risks: ["missed leads", "slow follow-up", "underpricing", "scheduling gaps", "burnout"],
    flows: ["lead→quote→schedule→complete→invoice→review"],
    metrics: ["response time", "close rate", "revenue per hour", "utilization", "quote-to-close days"],
  },
  "local-service": {
    focus: "Local/home service business optimizing routes, scheduling, and seasonal demand",
    risks: ["missed calls", "route inefficiency", "seasonal dips", "no-shows", "underquoting"],
    flows: ["call→dispatch→schedule→complete→invoice→follow-up"],
    metrics: ["jobs per day", "drive time ratio", "callback rate", "seasonal revenue variance"],
  },
  "agency": {
    focus: "Agency balancing project delivery, client profitability, and pipeline velocity",
    risks: ["scope creep", "project drift", "client concentration", "utilization drops", "margin erosion"],
    flows: ["lead→proposal→close→onboard→deliver→review→renew"],
    metrics: ["revenue per client", "project margin", "utilization rate", "pipeline velocity", "NPS"],
  },
  "consulting": {
    focus: "Consulting/coaching leveraging expertise, renewals, and IP",
    risks: ["client dependency", "IP underuse", "renewal gaps", "pricing weakness"],
    flows: ["inquiry→discovery→proposal→engage→deliver→review→renew"],
    metrics: ["hourly rate effectiveness", "renewal rate", "client lifetime value", "referral rate"],
  },
  "appointment-based": {
    focus: "Appointment-based business maximizing booking density and retention",
    risks: ["no-shows", "empty slots", "booking friction", "retention drops"],
    flows: ["book→confirm→arrive→serve→follow-up→rebook"],
    metrics: ["fill rate", "no-show rate", "rebooking rate", "revenue per slot"],
  },
  "project-based": {
    focus: "Project-based business managing scope, milestones, and cash timing",
    risks: ["scope inflation", "milestone delays", "cash flow gaps", "resource bottlenecks"],
    flows: ["scope→plan→execute→milestone→deliver→close"],
    metrics: ["on-time delivery", "budget variance", "milestone velocity", "change order rate"],
  },
  "recurring-service": {
    focus: "Recurring service business preventing churn and maximizing LTV",
    risks: ["churn spikes", "service quality drops", "pricing pressure", "support overload"],
    flows: ["acquire→onboard→serve→review→upsell→renew"],
    metrics: ["MRR", "churn rate", "expansion revenue", "support ticket ratio"],
  },
  "ecommerce": {
    focus: "E-commerce optimizing conversion, AOV, and fulfillment",
    risks: ["conversion drops", "cart abandonment", "inventory mismatch", "CAC inflation"],
    flows: ["browse→cart→checkout→fulfill→deliver→review"],
    metrics: ["conversion rate", "AOV", "CAC", "return rate", "fulfillment speed"],
  },
  "field-operations": {
    focus: "Field operations optimizing dispatch, routes, and completion rates",
    risks: ["dispatch delays", "route waste", "equipment failures", "crew coordination"],
    flows: ["dispatch→route→arrive→execute→report→invoice"],
    metrics: ["jobs completed", "drive time", "first-time fix rate", "equipment uptime"],
  },
  "small-team": {
    focus: "Small team managing delegation, accountability, and coordination",
    risks: ["bottlenecks", "unclear ownership", "communication gaps", "uneven workload"],
    flows: ["assign→execute→review→handoff→complete"],
    metrics: ["task completion rate", "delegation ratio", "handoff failures", "team utilization"],
  },
  "hybrid": {
    focus: "Hybrid business coordinating across channels and service types",
    risks: ["channel conflicts", "priority confusion", "split attention", "unified reporting gaps"],
    flows: ["multi-channel intake→triage→route→serve→consolidate"],
    metrics: ["cross-channel conversion", "priority alignment", "unified pipeline health"],
  },
  "household-business": {
    focus: "Household-business blend managing dual responsibilities",
    risks: ["boundary erosion", "dual scheduling conflicts", "combined finance confusion"],
    flows: ["combined calendar→priority filter→execute→separate accounting"],
    metrics: ["work-life boundary score", "combined cash clarity", "schedule collision rate"],
  },
};

// ═══════════════════════════════════════════════════════════════
// ADVISOR PERSONAS — Deep role definitions
// ═══════════════════════════════════════════════════════════════
const ADVISOR_PERSONAS: Record<string, { role: string; lens: string; priorities: string[]; biases: string[] }> = {
  ceo: {
    role: "Chief Executive Advisor",
    lens: "Strategic direction, owner wellbeing, competitive positioning, growth trajectory",
    priorities: ["business survival", "strategic clarity", "owner health", "competitive edge"],
    biases: ["may overweight long-term at expense of immediate issues"],
  },
  coo: {
    role: "Chief Operations Advisor",
    lens: "Workflow efficiency, delivery quality, bottleneck identification, process optimization",
    priorities: ["execution speed", "quality standards", "bottleneck removal", "team coordination"],
    biases: ["may overoptimize process at expense of flexibility"],
  },
  cfo: {
    role: "Chief Financial Advisor",
    lens: "Cash flow protection, margin discipline, expense control, pricing strategy, financial risk",
    priorities: ["cash preservation", "margin improvement", "receivables collection", "cost control"],
    biases: ["may be overly conservative on growth investments"],
  },
  sales: {
    role: "Sales Director Advisor",
    lens: "Pipeline velocity, lead conversion, follow-up discipline, deal value maximization",
    priorities: ["lead response speed", "pipeline health", "close rate", "deal size"],
    biases: ["may overweight revenue at expense of profitability"],
  },
  marketing: {
    role: "Marketing Strategy Advisor",
    lens: "Lead generation quality, brand positioning, channel ROI, market awareness",
    priorities: ["lead quality", "channel effectiveness", "brand consistency", "market positioning"],
    biases: ["may overweight awareness metrics vs. conversion"],
  },
  "client-success": {
    role: "Client Success Advisor",
    lens: "Client retention, satisfaction signals, renewal rates, upsell identification, churn prevention",
    priorities: ["retention", "client health", "renewal pipeline", "NPS improvement"],
    biases: ["may over-accommodate clients at expense of margin"],
  },
  "executive-assistant": {
    role: "Executive Assistant Advisor",
    lens: "Owner calendar optimization, communication triage, preparation quality, clarity maintenance",
    priorities: ["owner time protection", "preparation quality", "communication management", "focus maintenance"],
    biases: ["may over-filter important items to protect owner time"],
  },
  "people-ops": {
    role: "People & Culture Advisor",
    lens: "Team health, workload balance, morale, delegation effectiveness, coordination",
    priorities: ["team wellbeing", "workload equity", "clear accountability", "effective delegation"],
    biases: ["may overweight team comfort vs. performance pressure"],
  },
  risk: {
    role: "Risk Management Advisor",
    lens: "Threat identification, contingency planning, compliance, financial exposure, operational vulnerability",
    priorities: ["risk identification", "mitigation planning", "compliance", "exposure reduction"],
    biases: ["may see threats where opportunities exist"],
  },
  strategy: {
    role: "Strategy Advisor",
    lens: "Long-term positioning, market differentiation, capacity planning, competitive advantage",
    priorities: ["market positioning", "differentiation", "sustainable advantage", "strategic focus"],
    biases: ["may underweight operational urgency for strategic purity"],
  },
};

// ═══════════════════════════════════════════════════════════════
// AI GATEWAY HELPER — Call with fallback + error handling
// ═══════════════════════════════════════════════════════════════
interface AICallOptions {
  task: string;
  systemPrompt: string;
  userPrompt: string;
  tools?: unknown[];
  toolChoice?: unknown;
  apiKey: string;
}

async function callAI(opts: AICallOptions): Promise<{ data: unknown; model: string; tokens: number }> {
  const route = MODEL_ROUTES[opts.task] ?? MODEL_ROUTES.advisor_reasoning;
  const models = [route.primary, route.fallback];

  for (const model of models) {
    try {
      const body: Record<string, unknown> = {
        model,
        messages: [
          { role: "system", content: opts.systemPrompt },
          { role: "user", content: opts.userPrompt },
        ],
        max_tokens: route.maxTokens,
      };
      if (opts.tools) body.tools = opts.tools;
      if (opts.toolChoice) body.tool_choice = opts.toolChoice;

      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${opts.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (resp.status === 429 || resp.status === 402) {
        throw { status: resp.status, message: resp.status === 429 ? "Rate limited" : "Credits exhausted" };
      }

      if (!resp.ok) {
        console.error(`AI call failed (${model}):`, resp.status);
        continue; // try fallback
      }

      const result = await resp.json();
      const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
      const totalTokens = result.usage?.total_tokens ?? 0;

      if (toolCall?.function?.arguments) {
        try {
          return { data: JSON.parse(toolCall.function.arguments), model, tokens: totalTokens };
        } catch { /* fall through to content */ }
      }

      const content = result.choices?.[0]?.message?.content ?? "";
      try {
        return { data: JSON.parse(content), model, tokens: totalTokens };
      } catch {
        return { data: content, model, tokens: totalTokens };
      }
    } catch (e) {
      if ((e as { status?: number }).status === 429 || (e as { status?: number }).status === 402) throw e;
      console.error(`Model ${model} failed:`, e);
      continue;
    }
  }
  throw new Error(`All models failed for task: ${opts.task}`);
}

// ═══════════════════════════════════════════════════════════════
// TYPED SIGNAL STRUCTURES
// ═══════════════════════════════════════════════════════════════
interface BusinessSignal {
  type: string;
  severity: "info" | "warning" | "critical";
  domain: string;
  summary: string;
  dataSource: string;
  rawMetric?: string;
}

interface PerceptionData {
  contacts: unknown[];
  tasks: unknown[];
  calendar: unknown[];
  invoices: unknown[];
  memories: unknown[];
  healthScores: unknown[];
  profitSignals: unknown[];
  pendingActions: unknown[];
  reflections: unknown[];
  appointments: unknown[];
}

// ═══════════════════════════════════════════════════════════════
// LAYER 1: PERCEPTION — Gather all business data
// ═══════════════════════════════════════════════════════════════
async function perceive(svc: ReturnType<typeof createClient>, userId: string): Promise<PerceptionData> {
  const today = new Date().toISOString().split("T")[0];
  const safeQuery = (table: string, select: string, filters?: (q: any) => any) => {
    try {
      let q = svc.from(table).select(select).eq("user_id", userId);
      if (filters) q = filters(q);
      return q.limit(50);
    } catch { return Promise.resolve({ data: null }); }
  };

  const [contacts, tasks, calendar, invoices, memories, healthScores, profitSignals, pendingActions, reflections, appointments] = await Promise.all([
    safeQuery("contacts", "id,first_name,last_name,company,status,last_contacted_at,lead_score,email,phone,tags", (q: any) => q.in("status", ["active", "lead", "prospect"])),
    safeQuery("tasks", "id,title,status,priority,due_date,assigned_to,description,category", (q: any) => q.in("status", ["pending", "in_progress", "blocked"])),
    safeQuery("calendar_events", "id,title,event_date,start_time,end_time,domain,event_type,description", (q: any) => q.gte("event_date", today)),
    safeQuery("invoices", "id,amount,status,due_date,customer_name,line_items,notes", null),
    safeQuery("advisor_board_memory", "id,content,memory_layer,importance,advisor_id,category,confidence,metadata", (q: any) => q.eq("status", "active").order("importance", { ascending: false })),
    safeQuery("business_health_scores", "dimension,score,trend,previous_score,biggest_drag,improvement_opportunity", (q: any) => q.order("scored_at", { ascending: false }).limit(9)),
    safeQuery("profit_signals", "id,title,category,urgency,status,description,estimated_impact_cents,confidence", (q: any) => q.eq("status", "detected")),
    safeQuery("advisor_board_actions", "id,title,status,advisor_id,domain,risk_tier,confidence,description", (q: any) => q.in("status", ["proposed", "approved", "executing"])),
    safeQuery("advisor_board_reflections", "advisor_id,owner_action,outcome_quality,lesson_learned,should_repeat,pattern_tags", (q: any) => q.order("created_at", { ascending: false }).limit(20)),
    safeQuery("appointments", "id,title,appointment_date,status,provider,category,who,location", (q: any) => q.gte("appointment_date", today)),
  ]);

  return {
    contacts: (contacts as any)?.data ?? [],
    tasks: (tasks as any)?.data ?? [],
    calendar: (calendar as any)?.data ?? [],
    invoices: (invoices as any)?.data ?? [],
    memories: (memories as any)?.data ?? [],
    healthScores: (healthScores as any)?.data ?? [],
    profitSignals: (profitSignals as any)?.data ?? [],
    pendingActions: (pendingActions as any)?.data ?? [],
    reflections: (reflections as any)?.data ?? [],
    appointments: (appointments as any)?.data ?? [],
  };
}

// ═══════════════════════════════════════════════════════════════
// LAYER 2: NORMALIZATION — Transform raw data to business signals
// ═══════════════════════════════════════════════════════════════
function normalize(data: PerceptionData): BusinessSignal[] {
  const signals: BusinessSignal[] = [];
  const now = Date.now();
  const dayMs = 86400000;

  // Contact/Lead signals
  const contacts = data.contacts as Array<Record<string, unknown>>;
  const staleLeads = contacts.filter(c => {
    const lastContact = c.last_contacted_at ? new Date(c.last_contacted_at as string).getTime() : 0;
    return (now - lastContact) > 14 * dayMs && (c.status === "lead" || c.status === "prospect");
  });
  if (staleLeads.length > 0) {
    signals.push({ type: "stale-leads", severity: staleLeads.length > 3 ? "critical" : "warning", domain: "revenue", summary: `${staleLeads.length} leads not contacted in 14+ days: ${staleLeads.slice(0, 3).map(c => `${c.first_name} ${c.last_name}`).join(", ")}`, dataSource: "contacts" });
  }
  if (contacts.length === 0) {
    signals.push({ type: "empty-pipeline", severity: "critical", domain: "revenue", summary: "No active contacts/leads in CRM — pipeline is empty", dataSource: "contacts" });
  }

  // Task signals
  const tasks = data.tasks as Array<Record<string, unknown>>;
  const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date as string).getTime() < now && t.status !== "completed");
  const blockedTasks = tasks.filter(t => t.status === "blocked");
  const highPriorityTasks = tasks.filter(t => t.priority === "high" || t.priority === "urgent");
  if (overdueTasks.length > 0) signals.push({ type: "overdue-tasks", severity: overdueTasks.length > 5 ? "critical" : "warning", domain: "operations", summary: `${overdueTasks.length} overdue tasks: ${overdueTasks.slice(0, 3).map(t => t.title).join(", ")}`, dataSource: "tasks", rawMetric: `${overdueTasks.length} overdue` });
  if (blockedTasks.length > 0) signals.push({ type: "blocked-workflows", severity: "warning", domain: "operations", summary: `${blockedTasks.length} blocked tasks requiring attention`, dataSource: "tasks" });
  if (highPriorityTasks.length > 3) signals.push({ type: "priority-overload", severity: "warning", domain: "operations", summary: `${highPriorityTasks.length} high-priority tasks — possible priority inflation`, dataSource: "tasks" });

  // Invoice/Financial signals
  const invoices = data.invoices as Array<Record<string, unknown>>;
  const overdueInvoices = invoices.filter(i => i.status === "overdue");
  const totalOverdue = overdueInvoices.reduce((sum, i) => sum + ((i.amount as number) || 0), 0);
  if (overdueInvoices.length > 0) signals.push({ type: "overdue-invoices", severity: totalOverdue > 10000 ? "critical" : "warning", domain: "finance", summary: `${overdueInvoices.length} overdue invoices totaling $${(totalOverdue / 100).toLocaleString()}: ${overdueInvoices.slice(0, 3).map(i => i.customer_name).join(", ")}`, dataSource: "invoices", rawMetric: `$${(totalOverdue / 100).toFixed(0)} overdue` });
  const unpaidInvoices = invoices.filter(i => i.status === "sent" || i.status === "pending");
  if (unpaidInvoices.length > 5) signals.push({ type: "receivables-pressure", severity: "warning", domain: "finance", summary: `${unpaidInvoices.length} unpaid invoices creating receivables pressure`, dataSource: "invoices" });

  // Calendar signals
  const calendar = data.calendar as Array<Record<string, unknown>>;
  const todayEvents = calendar.filter(e => (e.event_date as string)?.startsWith(new Date().toISOString().split("T")[0]));
  if (todayEvents.length > 5) signals.push({ type: "schedule-congestion", severity: "warning", domain: "operations", summary: `${todayEvents.length} events today — heavy schedule`, dataSource: "calendar" });
  if (calendar.length === 0) signals.push({ type: "empty-calendar", severity: "info", domain: "operations", summary: "No upcoming calendar events — potential scheduling gap", dataSource: "calendar" });

  // Health score signals
  const health = data.healthScores as Array<Record<string, unknown>>;
  health.forEach(h => {
    const score = h.score as number;
    if (score < 40) signals.push({ type: `health-critical-${h.dimension}`, severity: "critical", domain: (h.dimension as string) ?? "general", summary: `${h.dimension} health critically low at ${score}/100. Drag: ${h.biggest_drag ?? "unknown"}`, dataSource: "health_scores", rawMetric: `${score}/100` });
    else if (score < 60) signals.push({ type: `health-warning-${h.dimension}`, severity: "warning", domain: (h.dimension as string) ?? "general", summary: `${h.dimension} health below target at ${score}/100. Opportunity: ${h.improvement_opportunity ?? "review needed"}`, dataSource: "health_scores", rawMetric: `${score}/100` });
  });

  // Profit signal passthrough
  const profit = data.profitSignals as Array<Record<string, unknown>>;
  profit.forEach(p => {
    signals.push({ type: `profit-${p.category}`, severity: p.urgency === "critical" ? "critical" : "warning", domain: "finance", summary: `${p.title}: ${p.description ?? ""}. Est. impact: $${((p.estimated_impact_cents as number ?? 0) / 100).toFixed(0)}`, dataSource: "profit_signals" });
  });

  // Reflection-based learning signals
  const reflections = data.reflections as Array<Record<string, unknown>>;
  const recentRejections = reflections.filter(r => r.owner_action === "rejected" || r.owner_action === "ignored");
  if (recentRejections.length > 5) {
    const tags = recentRejections.flatMap(r => (r.pattern_tags as string[]) ?? []);
    const topTag = tags.length > 0 ? tags.sort((a, b) => tags.filter(t => t === b).length - tags.filter(t => t === a).length)[0] : "unknown";
    signals.push({ type: "learning-signal", severity: "info", domain: "general", summary: `Owner frequently rejects/ignores "${topTag}" recommendations — advisors should calibrate`, dataSource: "reflections" });
  }

  // Pending action signals
  if (data.pendingActions.length > 5) signals.push({ type: "action-backlog", severity: "warning", domain: "operations", summary: `${data.pendingActions.length} pending actions in queue — possible decision bottleneck`, dataSource: "actions" });

  // Appointment signals
  const appointments = data.appointments as Array<Record<string, unknown>>;
  if (appointments.length > 0) {
    const upcoming = appointments.filter(a => {
      const d = new Date(a.appointment_date as string);
      return d.getTime() - now < 3 * dayMs;
    });
    if (upcoming.length > 0) signals.push({ type: "upcoming-appointments", severity: "info", domain: "operations", summary: `${upcoming.length} appointments in next 3 days: ${upcoming.slice(0, 3).map(a => `${a.title} (${a.who ?? ""})`).join(", ")}`, dataSource: "appointments" });
  }

  return signals;
}

// ═══════════════════════════════════════════════════════════════
// LAYER 3: SIGNAL CLASSIFICATION — AI-powered signal triage
// ═══════════════════════════════════════════════════════════════
async function classifySignals(signals: BusinessSignal[], archetype: string, apiKey: string): Promise<{ classified: Array<BusinessSignal & { priority: number; advisorRelevance: string[] }>; executiveSummary: string }> {
  if (signals.length === 0) return { classified: [], executiveSummary: "No business signals detected." };

  const profile = ARCHETYPE_PROFILES[archetype] ?? ARCHETYPE_PROFILES["solo-service"];
  const result = await callAI({
    task: "signal_classification",
    apiKey,
    systemPrompt: `You are a business signal classifier for a ${profile.focus}. Known risks: ${profile.risks.join(", ")}. Key metrics: ${profile.metrics.join(", ")}.
Classify each signal by priority (1-100, higher = more urgent) and which advisors should act on it.`,
    userPrompt: `Classify these ${signals.length} business signals:\n${JSON.stringify(signals, null, 1)}`,
    tools: [{
      type: "function",
      function: {
        name: "classify_signals",
        description: "Classify and prioritize business signals",
        parameters: {
          type: "object",
          properties: {
            classifications: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  signalType: { type: "string" },
                  priority: { type: "number", description: "1-100 priority score" },
                  advisorRelevance: { type: "array", items: { type: "string" }, description: "Which advisor IDs should act on this" },
                  escalate: { type: "boolean", description: "Whether this needs immediate owner attention" },
                },
                required: ["signalType", "priority", "advisorRelevance"],
              },
            },
            executiveSummary: { type: "string", description: "2-3 sentence summary of the business state right now" },
          },
          required: ["classifications", "executiveSummary"],
        },
      },
    }],
    toolChoice: { type: "function", function: { name: "classify_signals" } },
  });

  const parsed = result.data as { classifications?: Array<{ signalType: string; priority: number; advisorRelevance: string[] }>; executiveSummary?: string };
  const classMap = new Map((parsed.classifications ?? []).map(c => [c.signalType, c]));

  return {
    classified: signals.map(s => {
      const cls = classMap.get(s.type);
      return { ...s, priority: cls?.priority ?? 50, advisorRelevance: cls?.advisorRelevance ?? [] };
    }).sort((a, b) => b.priority - a.priority),
    executiveSummary: parsed.executiveSummary ?? "Business state analysis complete.",
  };
}

// ═══════════════════════════════════════════════════════════════
// LAYER 4: ADVISOR REASONING — Each advisor interprets signals
// ═══════════════════════════════════════════════════════════════
async function advisorReasoning(
  activeAdvisors: string[],
  classifiedSignals: Array<BusinessSignal & { priority: number; advisorRelevance: string[] }>,
  archetype: string,
  memoryContext: string,
  businessContext: string,
  apiKey: string
): Promise<unknown> {
  const profile = ARCHETYPE_PROFILES[archetype] ?? ARCHETYPE_PROFILES["solo-service"];
  const personaBlocks = activeAdvisors.map(id => {
    const p = ADVISOR_PERSONAS[id];
    if (!p) return `${id}: General advisor`;
    const relevantSignals = classifiedSignals.filter(s => s.advisorRelevance.includes(id) || s.priority > 70);
    return `
## ${p.role} (${id})
Lens: ${p.lens}
Priorities: ${p.priorities.join(", ")}
Known bias: ${p.biases[0]}
Relevant signals (${relevantSignals.length}): ${relevantSignals.slice(0, 8).map(s => `[P${s.priority}] ${s.summary}`).join(" | ")}`;
  }).join("\n");

  const result = await callAI({
    task: "advisor_reasoning",
    apiKey,
    systemPrompt: `You are ${activeAdvisors.length} specialized business advisors conducting a board analysis session.
Business type: ${profile.focus}
Key flows: ${profile.flows.join("; ")}
Key risks: ${profile.risks.join(", ")}

${businessContext ? `BUSINESS CONTEXT:\n${businessContext}` : ""}
${memoryContext ? `\nADVISOR MEMORY (learned preferences):\n${memoryContext}` : ""}

ADVISOR ROLES:
${personaBlocks}

RULES:
- Each advisor MUST speak from their specialist perspective
- Cite specific signal data driving each recommendation
- State confidence honestly (0.0-1.0)
- Flag disagreements between advisors explicitly
- Include at least one revenue-protection and one cost-control item
- Never claim certainty you don't have
- Distinguish facts from inferences`,
    userPrompt: `Full signal set (${classifiedSignals.length} signals, sorted by priority):
${classifiedSignals.slice(0, 20).map(s => `[P${s.priority}|${s.severity}|${s.domain}] ${s.summary}`).join("\n")}

Generate 6-12 recommendations. Each must be from a specific advisor, cite signals, and include actionable next steps.`,
    tools: [{
      type: "function",
      function: {
        name: "provide_advisor_recommendations",
        description: "Return structured recommendations from each advisor's perspective",
        parameters: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  advisorId: { type: "string" },
                  title: { type: "string", description: "Clear, action-oriented title" },
                  summary: { type: "string", description: "2-3 sentence recommendation" },
                  rationale: { type: "string", description: "Why now — cite specific signals" },
                  domain: { type: "string", enum: ["revenue", "operations", "finance", "clients", "strategy", "team", "general"] },
                  category: { type: "string", enum: ["revenue-protection", "cost-control", "growth", "risk-mitigation", "efficiency", "retention", "strategic", "operational"] },
                  urgency: { type: "string", enum: ["low", "medium", "high", "critical"] },
                  confidence: { type: "number", description: "0.0-1.0 honest confidence" },
                  suggestedActions: { type: "array", items: { type: "string" }, description: "Specific executable next steps" },
                  riskFlags: { type: "array", items: { type: "string" } },
                  contributingAdvisors: { type: "array", items: { type: "string" } },
                  confidenceProfile: {
                    type: "object",
                    properties: {
                      confidence: { type: "number" }, urgency: { type: "number" },
                      businessImpact: { type: "number" }, reversibility: { type: "number" },
                      profitRelevance: { type: "number" }, relationshipRisk: { type: "number" },
                      operationalRisk: { type: "number" }, clarity: { type: "number" },
                    },
                    required: ["confidence", "urgency", "businessImpact", "reversibility", "profitRelevance", "relationshipRisk", "operationalRisk", "clarity"],
                  },
                  dataGaps: { type: "array", items: { type: "string" } },
                  estimatedImpactCents: { type: "number", description: "Estimated financial impact in cents" },
                  timeHorizon: { type: "string", enum: ["immediate", "this-week", "this-month", "this-quarter"] },
                },
                required: ["advisorId", "title", "summary", "rationale", "domain", "category", "urgency", "confidence", "suggestedActions", "riskFlags", "confidenceProfile"],
              },
            },
            disagreements: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  topic: { type: "string" },
                  advisorA: { type: "string" }, positionA: { type: "string" },
                  advisorB: { type: "string" }, positionB: { type: "string" },
                  resolution: { type: "string" },
                },
                required: ["topic", "advisorA", "positionA", "advisorB", "positionB"],
              },
            },
          },
          required: ["recommendations", "disagreements"],
        },
      },
    }],
    toolChoice: { type: "function", function: { name: "provide_advisor_recommendations" } },
  });

  return result.data;
}

// ═══════════════════════════════════════════════════════════════
// LAYER 5: CROSS-ADVISOR SYNTHESIS — Merge, rank, de-duplicate
// ═══════════════════════════════════════════════════════════════
function synthesize(advisorOutput: any): { recommendations: any[]; disagreements: any[]; boardSummary: string; topPriority: string } {
  const recs = (advisorOutput?.recommendations ?? []) as Array<Record<string, unknown>>;
  const disagreements = advisorOutput?.disagreements ?? [];

  // De-duplicate by title similarity
  const seen = new Set<string>();
  const deduped = recs.filter(r => {
    const key = (r.title as string).toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 30);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Score and rank
  const scored = deduped.map(r => {
    const cp = r.confidenceProfile as Record<string, number> | undefined;
    const compositeScore =
      (cp?.urgency ?? 50) * 0.25 +
      (cp?.businessImpact ?? 50) * 0.25 +
      (cp?.profitRelevance ?? 50) * 0.2 +
      (cp?.confidence ?? 50) * 0.15 +
      (cp?.clarity ?? 50) * 0.15;
    return { ...r, _compositeScore: compositeScore };
  }).sort((a, b) => (b._compositeScore as number) - (a._compositeScore as number));

  const topRec = scored[0];
  const topPriority = topRec
    ? `${topRec.title} (${topRec.urgency} urgency, ${((topRec.confidence as number) * 100).toFixed(0)}% confidence)`
    : "Review business state manually.";

  const domainCounts = scored.reduce((acc, r) => { acc[r.domain as string] = (acc[r.domain as string] ?? 0) + 1; return acc; }, {} as Record<string, number>);
  const topDomains = Object.entries(domainCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([d]) => d);
  const boardSummary = `Board generated ${scored.length} recommendations across ${Object.keys(domainCounts).length} domains. Primary focus areas: ${topDomains.join(", ")}. ${disagreements.length > 0 ? `${disagreements.length} advisor disagreement(s) flagged.` : "Board consensus achieved."} Top priority: ${topRec?.title ?? "none"}.`;

  return { recommendations: scored, disagreements, boardSummary, topPriority };
}

// ═══════════════════════════════════════════════════════════════
// LAYER 6: ACTION PLANNING — Generate executable action plans
// ═══════════════════════════════════════════════════════════════
function generateActionPlans(recommendations: any[]): any[] {
  return recommendations.map(r => ({
    ...r,
    actionPlan: {
      steps: (r.suggestedActions ?? []).map((a: string, i: number) => ({
        order: i + 1,
        description: a,
        requiresApproval: (r.urgency === "critical" || r.domain === "finance") ? true : i === 0 ? false : true,
        estimatedMinutes: 15 + (i * 10),
        toolCategory: r.domain === "finance" ? "finance" : r.domain === "revenue" ? "crm" : r.domain === "operations" ? "task" : "general",
      })),
      totalSteps: (r.suggestedActions ?? []).length,
      canAutoExecute: r.confidence > 0.8 && r.urgency !== "critical" && r.domain !== "finance",
      riskTier: r.urgency === "critical" ? "critical" : r.confidence < 0.5 ? "elevated" : "standard",
    },
  }));
}

// ═══════════════════════════════════════════════════════════════
// LAYER 7: REFLECTION — Persist learnings to memory
// ═══════════════════════════════════════════════════════════════
async function reflect(svc: ReturnType<typeof createClient>, userId: string, pipeline: {
  signalCount: number;
  recommendationCount: number;
  topDomains: string[];
  hadRealData: boolean;
  archetype: string;
  modelUsed: string;
  disagreementCount: number;
}) {
  try {
    // Store a procedural memory of what the pipeline produced
    await svc.from("advisor_board_memory").insert({
      user_id: userId,
      advisor_id: "system",
      memory_layer: "procedural",
      category: "pipeline-run",
      content: `Pipeline run: ${pipeline.signalCount} signals → ${pipeline.recommendationCount} recommendations. Top domains: ${pipeline.topDomains.join(", ")}. Archetype: ${pipeline.archetype}. Real data: ${pipeline.hadRealData}. Disagreements: ${pipeline.disagreementCount}.`,
      importance: 0.3,
      confidence: 0.9,
      metadata: { ...pipeline, timestamp: new Date().toISOString() },
    });
  } catch (e) {
    console.error("Reflection persistence error:", e);
  }
}

// ═══════════════════════════════════════════════════════════════
// LAYER 8: PERSISTENCE — Save recommendations to DB
// ═══════════════════════════════════════════════════════════════
async function persistRecommendations(svc: ReturnType<typeof createClient>, userId: string, recommendations: any[]) {
  if (recommendations.length === 0) return 0;

  const rows = recommendations.map(r => ({
    user_id: userId,
    advisor_id: r.advisorId ?? "ceo",
    title: r.title ?? "Recommendation",
    summary: r.summary ?? "",
    rationale: r.rationale ?? r.summary ?? "",
    domain: r.domain ?? "business",
    category: r.category ?? "general",
    confidence_score: r.confidence ?? 0.5,
    urgency_score: r.confidenceProfile?.urgency ? r.confidenceProfile.urgency / 100 : 0.5,
    business_impact_score: r.confidenceProfile?.businessImpact ? r.confidenceProfile.businessImpact / 100 : 0.5,
    reversibility_score: r.confidenceProfile?.reversibility ? r.confidenceProfile.reversibility / 100 : 0.8,
    profitability_score: r.confidenceProfile?.profitRelevance ? r.confidenceProfile.profitRelevance / 100 : 0.5,
    relationship_risk_score: r.confidenceProfile?.relationshipRisk ? r.confidenceProfile.relationshipRisk / 100 : 0.2,
    operational_risk_score: r.confidenceProfile?.operationalRisk ? r.confidenceProfile.operationalRisk / 100 : 0.2,
    clarity_score: r.confidenceProfile?.clarity ? r.confidenceProfile.clarity / 100 : 0.7,
    contributing_advisors: r.contributingAdvisors ?? [],
    evidence_refs: r.riskFlags ?? [],
    action_plan: r.actionPlan ?? { suggestedActions: r.suggestedActions ?? [] },
    status: "new",
  }));

  const { error } = await svc.from("advisor_board_recommendations").insert(rows);
  if (error) console.error("Persist recommendations error:", error);
  return rows.length;
}

// ═══════════════════════════════════════════════════════════════
// MAIN HANDLER — Full 8-Layer Cognitive Pipeline
// ═══════════════════════════════════════════════════════════════
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const pipelineStart = Date.now();

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const body = await req.json();
    const { advisorIds, businessContext, memorySnapshot, archetype, advisorPersonas, _userId, _persist } = body;
    const svc = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const activeAdvisors = (advisorIds ?? Object.keys(ADVISOR_PERSONAS)).slice(0, 10);
    const selectedArchetype = archetype ?? "solo-service";

    // ═════════════════════════════════════════════════════════
    // LAYER 1: PERCEPTION
    // ═════════════════════════════════════════════════════════
    console.log("🔍 Layer 1: Perception — gathering business data...");
    let perceptionData: PerceptionData = { contacts: [], tasks: [], calendar: [], invoices: [], memories: [], healthScores: [], profitSignals: [], pendingActions: [], reflections: [], appointments: [] };
    let hadRealData = false;

    if (_userId) {
      try {
        perceptionData = await perceive(svc, _userId);
        hadRealData = Object.values(perceptionData).some(arr => (arr as unknown[]).length > 0);
      } catch (e) {
        console.error("Perception layer error:", e);
      }
    }
    console.log(`   Perceived: ${Object.entries(perceptionData).map(([k, v]) => `${k}=${(v as unknown[]).length}`).join(", ")}`);

    // ═════════════════════════════════════════════════════════
    // LAYER 2: NORMALIZATION
    // ═════════════════════════════════════════════════════════
    console.log("📊 Layer 2: Normalization — converting to business signals...");
    const rawSignals = normalize(perceptionData);
    console.log(`   Normalized: ${rawSignals.length} signals (${rawSignals.filter(s => s.severity === "critical").length} critical)`);

    // ═════════════════════════════════════════════════════════
    // LAYER 3: SIGNAL CLASSIFICATION (AI Call 1 — fast model)
    // ═════════════════════════════════════════════════════════
    console.log("🏷️ Layer 3: Signal Classification — AI-powered triage...");
    let classifiedSignals: Array<BusinessSignal & { priority: number; advisorRelevance: string[] }>;
    let executiveSummary: string;

    if (rawSignals.length > 0) {
      const classification = await classifySignals(rawSignals, selectedArchetype, LOVABLE_API_KEY);
      classifiedSignals = classification.classified;
      executiveSummary = classification.executiveSummary;
    } else {
      classifiedSignals = [];
      executiveSummary = "No active business signals detected. Business data may not be connected yet.";
    }
    console.log(`   Classified: ${classifiedSignals.length} signals, top priority: ${classifiedSignals[0]?.type ?? "none"}`);

    // ═════════════════════════════════════════════════════════
    // LAYER 3.5: CONTEXTUALIZATION — Memory + archetype context
    // ═════════════════════════════════════════════════════════
    const memoryData = perceptionData.memories as Array<Record<string, unknown>>;
    const memoryContext = memoryData.length > 0
      ? memoryData.map(m => `[${m.memory_layer}|${m.category}] ${m.content}`).join("\n")
      : memorySnapshot ? JSON.stringify(memorySnapshot).slice(0, 2000) : "";

    // ═════════════════════════════════════════════════════════
    // LAYER 4 + 5: ADVISOR REASONING + SYNTHESIS (AI Call 2)
    // ═════════════════════════════════════════════════════════
    console.log("🧠 Layer 4-5: Advisor Reasoning & Synthesis...");
    const advisorOutput = await advisorReasoning(
      activeAdvisors, classifiedSignals, selectedArchetype,
      memoryContext, businessContext ?? "", LOVABLE_API_KEY
    );
    const synthesis = synthesize(advisorOutput);
    console.log(`   Synthesized: ${synthesis.recommendations.length} recs, ${synthesis.disagreements.length} disagreements`);

    // ═════════════════════════════════════════════════════════
    // LAYER 6: ACTION PLANNING
    // ═════════════════════════════════════════════════════════
    console.log("📋 Layer 6: Action Planning...");
    const withPlans = generateActionPlans(synthesis.recommendations);

    // ═════════════════════════════════════════════════════════
    // LAYER 7: REFLECTION — Persist learnings
    // ═════════════════════════════════════════════════════════
    const topDomains = [...new Set(withPlans.map(r => r.domain as string))].slice(0, 3);
    if (_userId) {
      console.log("💾 Layer 7: Reflection — persisting learnings...");
      await reflect(svc, _userId, {
        signalCount: rawSignals.length,
        recommendationCount: withPlans.length,
        topDomains,
        hadRealData,
        archetype: selectedArchetype,
        modelUsed: MODEL_ROUTES.advisor_reasoning.primary,
        disagreementCount: synthesis.disagreements.length,
      });
    }

    // ═════════════════════════════════════════════════════════
    // LAYER 8: PERSISTENCE — Save recommendations to DB
    // ═════════════════════════════════════════════════════════
    let persisted = 0;
    if (_userId && (_persist !== false)) {
      console.log("💾 Layer 8: Persistence — saving recommendations...");
      persisted = await persistRecommendations(svc, _userId, withPlans);
    }

    // ═════════════════════════════════════════════════════════
    // RECEIPT
    // ═════════════════════════════════════════════════════════
    const elapsed = Date.now() - pipelineStart;
    const receipt = {
      pipelineVersion: "3.0",
      layers: 8,
      signalsDetected: rawSignals.length,
      signalsCritical: rawSignals.filter(s => s.severity === "critical").length,
      recommendationsGenerated: withPlans.length,
      recommendationsPersisted: persisted,
      disagreements: synthesis.disagreements.length,
      activeAdvisors: activeAdvisors.length,
      archetype: selectedArchetype,
      hadRealData,
      dataSources: [...new Set(rawSignals.map(s => s.dataSource))],
      modelsUsed: [MODEL_ROUTES.signal_classification.primary, MODEL_ROUTES.advisor_reasoning.primary],
      elapsedMs: elapsed,
      timestamp: new Date().toISOString(),
    };

    console.log(`✅ Pipeline complete in ${elapsed}ms: ${withPlans.length} recommendations from ${rawSignals.length} signals`);

    return jsonResp({
      recommendations: withPlans,
      boardSummary: synthesis.boardSummary,
      topPriority: synthesis.topPriority,
      disagreements: synthesis.disagreements,
      executiveSummary,
      signals: classifiedSignals.slice(0, 15),
      receipt,
    });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    if (err.status === 429) return jsonResp({ error: "Rate limited — please try again shortly." }, 429);
    if (err.status === 402) return jsonResp({ error: "AI credits exhausted." }, 402);

    console.error("advisor-deep-intelligence error:", e);
    return jsonResp({ error: err.message ?? "Unknown error", elapsed: Date.now() - pipelineStart }, 500);
  }
});
