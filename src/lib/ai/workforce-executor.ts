// ═══════════════════════════════════════════════════════════════
// SITA OS — Workforce Executor
// Bridges AI workforce roles → sovereign AI gateway
// Every workforce task routes through the canonical capability client
// ═══════════════════════════════════════════════════════════════

import { invokeAICapability } from "./ai-capability-client";
import type { AIResponseEnvelope, AITaskClass } from "./ai-state-types";
import { supabase } from "@/integrations/supabase/client";

// ── Role → Prompt mapping ──
const ROLE_SYSTEM_PROMPTS: Record<string, string> = {
  chief_architect: `You are the Chief Architect for SITA OS. Analyze architecture decisions, identify structural risks, recommend design improvements, and produce synthesis-grade analysis. Be precise, evidence-aware, and actionable.`,
  runtime_truth_analyst: `You are the Runtime Truth Analyst for SITA OS. Identify gaps between claimed and actual runtime states. Detect mock/demo vs real contradictions. Produce structured truth assessments with severity ratings.`,
  connector_ops_engineer: `You are the Connector Operations Engineer for SITA OS. Diagnose connector health, OAuth failures, sync issues, and scope/consent drift. Produce actionable diagnostic reports.`,
  ai_governance_engineer: `You are the AI Governance Engineer for SITA OS. Analyze provider routing, model selection, budget policies, and launch honesty. Detect drift, waste, and misconfiguration.`,
  quality_launch_engineer: `You are the Quality & Launch Readiness Engineer for SITA OS. Assess E2E test coverage, CI gaps, launch gate status, and broken flows. Prioritize by impact.`,
  data_schema_engineer: `You are the Data/Schema Operations Engineer for SITA OS. Analyze migrations, schema coverage, orphan tables, RLS consistency, and data model health.`,
  device_surface_engineer: `You are the Device/Surface Readiness Engineer for SITA OS. Assess web vs mobile vs device readiness, surface portability gaps, and continuity architecture.`,
  budget_efficiency_analyst: `You are the Budget & Efficiency Analyst for SITA OS. Analyze AI spend patterns, detect expensive routes, identify optimization opportunities, and recommend premium vs economy routing.`,
  incident_drift_analyst: `You are the Incident & Drift Analyst for SITA OS. Triage system degradation, summarize recurring failures, investigate drift correlations, and prioritize remediation.`,
  remediation_planner: `You are the Remediation Planner for SITA OS. Convert audit findings into phased execution plans with leverage ordering, verification criteria, and risk assessment.`,
};

const TASK_TYPE_TO_INTENT: Record<string, string> = {
  summarize: "summarize",
  diagnose: "analyze",
  classify: "classify",
  audit: "analyze",
  recommend: "recommend",
  investigate: "analyze",
  produce_remediation_plan: "draft",
  generate_digest: "summarize",
  compare: "analyze",
  propose: "draft",
};

const BUDGET_TO_TASK_CLASS: Record<string, AITaskClass> = {
  economy_admin: "cheap_utility",
  balanced_admin: "balanced_assistant",
  premium_architecture: "premium_synthesis",
  internal_diagnostics: "cheap_utility",
  deep_audit: "premium_synthesis",
};

export interface WorkforceExecutionRequest {
  roleKey: string;
  taskType: string;
  inputSummary: string;
  budgetClass?: string;
  scope?: string;
}

export interface WorkforceExecutionResult {
  invocationId: string | null;
  response: AIResponseEnvelope;
  roleKey: string;
  taskType: string;
  costCents: number;
}

/**
 * Execute a workforce task by routing through the sovereign AI gateway.
 * Records the invocation in the DB with cost/trace data.
 */
export async function executeWorkforceTask(
  userId: string,
  request: WorkforceExecutionRequest,
): Promise<WorkforceExecutionResult> {
  const { roleKey, taskType, inputSummary, budgetClass = "economy_admin" } = request;

  const systemPrompt = ROLE_SYSTEM_PROMPTS[roleKey]
    ?? `You are an AI operations assistant for SITA OS performing a ${taskType} task.`;

  const capabilityKey = `admin.workforce.${roleKey}.${taskType}`;
  const taskClass = BUDGET_TO_TASK_CLASS[budgetClass] ?? "balanced_assistant";
  const intent = TASK_TYPE_TO_INTENT[taskType] ?? "analyze";

  const startMs = Date.now();

  // Create DB invocation record first
  let invocationId: string | null = null;
  try {
    const { data } = await supabase
      .from("ai_workforce_invocations")
      .insert({
        user_id: userId,
        role_key: roleKey,
        task_type: taskType,
        capability_key: capabilityKey,
        input_summary: inputSummary.slice(0, 2000),
        budget_class: budgetClass,
        mode: "real",
        status: "running",
      })
      .select("id")
      .single();
    invocationId = data?.id ?? null;
  } catch (e) {
    console.warn("[WorkforceExecutor] Could not create invocation record:", e);
  }

  // Route through sovereign AI gateway
  const response = await invokeAICapability({
    capabilityKey,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: inputSummary },
    ],
    taskClass,
    surface: "web.admin",
    intent: intent as any,
    maxTokens: taskClass === "premium_synthesis" ? 2000 : 800,
    temperature: taskClass === "cheap_utility" ? 0.1 : 0.3,
  });

  const latencyMs = Date.now() - startMs;
  const costCents = response.usageSummary?.costCents ?? 0;
  const tokensUsed = (response.usageSummary?.inputTokens ?? 0) + (response.usageSummary?.outputTokens ?? 0);

  // Update invocation record with results
  if (invocationId) {
    try {
      await supabase
        .from("ai_workforce_invocations")
        .update({
          status: response.status.startsWith("success_") ? "completed" : "failed",
          output_summary: response.content?.slice(0, 2000) ?? null,
          output_data: (response.structuredOutput as any) ?? null,
          cost_cents: costCents,
          tokens_used: tokensUsed,
          latency_ms: latencyMs,
          fallback_occurred: response.fallbackOccurred,
          provider_used: response.providerUsed ?? null,
          model_used: response.modelUsed ?? null,
          receipt_id: response.receiptId ?? null,
          completed_at: new Date().toISOString(),
        })
        .eq("id", invocationId);
    } catch (e) {
      console.warn("[WorkforceExecutor] Could not update invocation:", e);
    }
  }

  return {
    invocationId,
    response,
    roleKey,
    taskType,
    costCents,
  };
}
