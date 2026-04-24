// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Advisor Runtime (Shared Orchestrator)
//
// One canonical entry point that every Business System advisor
// uses. Wraps:
//   1. Manifest lookup (compile-time + DB seed)
//   2. Context loading (RLS-scoped data slices)
//   3. AI capability invocation (sovereign gateway)
//   4. Permission + reversibility classification
//   5. Source-citation persistence
//   6. Receipt emission for proof
//
// Used by AdvisorPage shell and by the per-advisor specialised
// pages built in Phases 1-9.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { invokeAICapability, type TrustEnrichedResponse } from "./ai-capability-client";
import {
  getBusinessAdvisor,
  isBusinessAdvisor,
  type BusinessAdvisorId,
  type BusinessAdvisorManifest,
} from "./business-advisor-registry";
import { loadAdvisorContext, type AdvisorContextSnapshot } from "./advisor-context-loader";

export interface AdvisorAskRequest {
  advisorId: BusinessAdvisorId;
  prompt: string;
  intent?: "ask" | "draft" | "analyze" | "simulate";
  attachContext?: boolean;
  capabilityKey?: string;
}

export interface AdvisorCitation {
  sourceType: string;
  sourceRef: string;
  sourceLabel: string;
  excerpt?: string;
  weight?: number;
}

export interface AdvisorAskResult {
  advisor: BusinessAdvisorManifest;
  context: AdvisorContextSnapshot | null;
  response: TrustEnrichedResponse;
  citations: AdvisorCitation[];
  authorityNotice: string;
  blockedActionsReminder: readonly string[];
  professionalDisclaimer: boolean;
  sensitiveDomain: boolean;
}

export class AdvisorRuntimeError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = "AdvisorRuntimeError";
  }
}

function buildAuthorityNotice(advisor: BusinessAdvisorManifest): string {
  switch (advisor.authority) {
    case "L1-suggest":
      return `${advisor.displayName} can only suggest — never drafts external content or commits actions on your behalf.`;
    case "L2-recommend":
      return `${advisor.displayName} produces structured recommendations with reasoning. You decide what happens next.`;
    case "L3-draft":
      return `${advisor.displayName} may draft outputs (scripts, replies, briefs). You review and send.`;
    case "L4-simulate":
      return `${advisor.displayName} may run scenarios and produce action plans. Execution requires your approval.`;
    case "L5-approval-ready":
      return `${advisor.displayName} can prepare actions for one-click approval. Nothing executes without your explicit go.`;
  }
}

async function persistCitations(
  advisorId: BusinessAdvisorId,
  userId: string,
  invocationId: string | null,
  citations: AdvisorCitation[],
): Promise<void> {
  if (citations.length === 0) return;
  const rows = citations.map((c) => ({
    user_id: userId,
    advisor_id: advisorId,
    invocation_id: invocationId,
    source_type: c.sourceType,
    source_ref: c.sourceRef,
    source_label: c.sourceLabel,
    excerpt: c.excerpt ?? null,
    weight: c.weight ?? 1.0,
    metadata: {},
  }));
  // Best-effort persistence — failure to log citations must not break the advisor reply.
  await supabase.from("advisor_source_citations").insert(rows).then(({ error }) => {
    if (error) console.warn("[advisor-runtime] failed to persist citations", error.message);
  });
}

function deriveCitationsFromContext(
  context: AdvisorContextSnapshot | null,
): AdvisorCitation[] {
  if (!context) return [];
  return context.slices
    .filter((s) => s.available && s.itemCount > 0)
    .map((s) => ({
      sourceType: "context-slice",
      sourceRef: s.source,
      sourceLabel: s.source.replace(/_/g, " "),
      excerpt: `${s.itemCount} record(s), last updated ${s.lastUpdatedAt ?? "n/a"}`,
      weight: 1.0,
    }));
}

export async function askBusinessAdvisor(
  request: AdvisorAskRequest,
): Promise<AdvisorAskResult> {
  if (!isBusinessAdvisor(request.advisorId)) {
    throw new AdvisorRuntimeError(`Unknown advisor: ${request.advisorId}`, "unknown-advisor");
  }
  const advisor = getBusinessAdvisor(request.advisorId)!;

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) {
    throw new AdvisorRuntimeError("Sign-in required to consult an advisor.", "auth-required");
  }

  // 1. Load context (best-effort — empty-state is honest)
  let context: AdvisorContextSnapshot | null = null;
  if (request.attachContext !== false) {
    try {
      context = await loadAdvisorContext(advisor.id, userId);
    } catch (err) {
      console.warn("[advisor-runtime] context load failed", err);
      context = null;
    }
  }

  // 2. Invoke AI capability through the sovereign gateway
  const capabilityKey =
    request.capabilityKey ??
    (advisor.id === "ceo-advisor" ? "executive-synthesis" : "advisor-conversation");

  const contextSummary = context
    ? `Advisor: ${advisor.displayName} (${advisor.authority}, ${advisor.riskTier} risk)\n` +
      `Mission: ${advisor.mission}\n` +
      `Available context (${context.totalAvailable}/${context.totalRequested} sources):\n` +
      context.slices
        .map((s) => `  • ${s.source}: ${s.available ? `${s.itemCount} record(s)` : "no data"}`)
        .join("\n") +
      (advisor.professionalDisclaimer
        ? "\nDisclaimer required: this advisor must remind the user it is not a licensed professional."
        : "") +
      `\nBlocked actions (NEVER execute): ${advisor.blockedActions.join(", ") || "none"}`
    : `Advisor: ${advisor.displayName} — operating without business context (empty workspace).`;

  const response = await invokeAICapability({
    capabilityKey,
    messages: [
      { role: "system", content: contextSummary },
      { role: "user", content: request.prompt },
    ],
    intent:
      request.intent === "draft"
        ? "draft"
        : request.intent === "analyze"
          ? "analyze"
          : request.intent === "simulate"
            ? "analyze"
            : "chat",
    receiptRequested: true,
  });

  // 3. Persist citations (drawn from context + any returned by the model)
  const derived = deriveCitationsFromContext(context);
  await persistCitations(advisor.id, userId, response.receiptId ?? null, derived);

  return {
    advisor,
    context,
    response,
    citations: derived,
    authorityNotice: buildAuthorityNotice(advisor),
    blockedActionsReminder: advisor.blockedActions,
    professionalDisclaimer: advisor.professionalDisclaimer,
    sensitiveDomain: advisor.sensitive,
  };
}

export interface AdvisorSimulationRequest {
  advisorId: BusinessAdvisorId;
  scenarioTitle: string;
  inputs: Record<string, unknown>;
  assumptions: Record<string, unknown>;
}

export interface AdvisorSimulationResult {
  id: string;
  advisorId: BusinessAdvisorId;
  status: "completed" | "failed";
  projectedOutcomes: Record<string, unknown>;
  riskSummary: string;
  confidence: number;
}

export async function runAdvisorSimulation(
  req: AdvisorSimulationRequest,
): Promise<AdvisorSimulationResult> {
  const advisor = getBusinessAdvisor(req.advisorId);
  if (!advisor) {
    throw new AdvisorRuntimeError(`Unknown advisor: ${req.advisorId}`, "unknown-advisor");
  }
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) {
    throw new AdvisorRuntimeError("Sign-in required to run a simulation.", "auth-required");
  }

  // Insert in 'running' state so the UI can stream the row
  const { data: row, error: insertErr } = await supabase
    .from("advisor_simulation_runs")
    .insert({
      user_id: userId,
      advisor_id: advisor.id,
      domain: "business-os",
      scenario_title: req.scenarioTitle,
      scenario_inputs: req.inputs as never,
      scenario_assumptions: req.assumptions as never,
      status: "running",
    })
    .select("id")
    .single();

  if (insertErr || !row) {
    throw new AdvisorRuntimeError(
      insertErr?.message ?? "failed to create simulation row",
      "sim-insert-failed",
    );
  }

  try {
    const response = await invokeAICapability({
      capabilityKey: "advisor-simulation",
      messages: [
        {
          role: "system",
          content: `You are running a what-if scenario for ${advisor.displayName}. Return JSON with projected_outcomes, risk_summary, and confidence (0-1).`,
        },
        {
          role: "user",
          content:
            `Scenario: ${req.scenarioTitle}\n` +
            `Inputs: ${JSON.stringify(req.inputs)}\n` +
            `Assumptions: ${JSON.stringify(req.assumptions)}`,
        },
      ],
      intent: "analyze",
      receiptRequested: true,
    });

    const structured = response.structuredOutput ?? {};
    const outcomes: Record<string, unknown> =
      (structured.projected_outcomes as Record<string, unknown> | undefined) ??
      { narrative: response.content };
    const confidenceRaw = structured.confidence;
    const confidence =
      typeof confidenceRaw === "number"
        ? Math.max(0, Math.min(1, confidenceRaw))
        : 0.5;
    const risk =
      (outcomes.risk_summary as string) ??
      (outcomes.risks as string) ??
      "No structured risk summary returned.";

    await supabase
      .from("advisor_simulation_runs")
      .update({
        status: "completed",
        projected_outcomes: outcomes as never,
        risk_summary: risk,
        confidence,
        ran_at: new Date().toISOString(),
      })
      .eq("id", row.id);

    return {
      id: row.id,
      advisorId: advisor.id,
      status: "completed",
      projectedOutcomes: outcomes,
      riskSummary: risk,
      confidence,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "simulation failed";
    await supabase
      .from("advisor_simulation_runs")
      .update({ status: "failed", risk_summary: message })
      .eq("id", row.id);
    return {
      id: row.id,
      advisorId: advisor.id,
      status: "failed",
      projectedOutcomes: {},
      riskSummary: message,
      confidence: 0,
    };
  }
}