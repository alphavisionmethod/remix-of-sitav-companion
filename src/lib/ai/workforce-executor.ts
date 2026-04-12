// ═══════════════════════════════════════════════════════════════
// SITA OS — Workforce Executor
// Bridges AI workforce roles → sovereign AI gateway
// Budget-policy-aware with pre-flight checks, fallback routing,
// and cost-saving strategies
// ═══════════════════════════════════════════════════════════════

import { invokeAICapability } from "./ai-capability-client";
import type { AIResponseEnvelope, AITaskClass } from "./ai-state-types";
import { supabase } from "@/integrations/supabase/client";
const db = supabase as any;
import {
  checkBudgetPreFlight,
  buildInvocationHistory,
  getBudgetExecutionParams,
  type AdminBudgetClass,
  type BudgetPreFlightResult,
} from "@/lib/services/ai-workforce/admin-budget-routing-policy";

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
  budgetCheck: BudgetPreFlightResult;
}

/**
 * Execute a workforce task with full budget policy enforcement.
 * 1. Fetches recent invocations for budget history
 * 2. Runs pre-flight budget check (may downgrade class)
 * 3. Routes through sovereign AI gateway with effective class
 * 4. Records invocation with budget metadata
 */
export async function executeWorkforceTask(
  userId: string,
  request: WorkforceExecutionRequest,
): Promise<WorkforceExecutionResult> {
  const { roleKey, taskType, inputSummary, budgetClass = "economy_admin" } = request;

  // ── Step 1: Gather recent invocation history for budget analysis ──
  const { data: recentInvs } = await db
    .from("ai_workforce_invocations")
    .select("role_key, task_type, cost_cents, budget_class, created_at, input_summary")
    .order("created_at", { ascending: false })
    .limit(200);

  const history = buildInvocationHistory(
    (recentInvs ?? []) as never[],
    roleKey,
    taskType,
  );

  // ── Step 2: Pre-flight budget check ──
  const budgetCheck = checkBudgetPreFlight(
    roleKey,
    budgetClass as AdminBudgetClass,
    taskType,
    history,
  );

  // If blocked, return immediately without invoking AI
  if (!budgetCheck.allowed) {
    return {
      invocationId: null,
      response: {
        status: "error_budget_blocked",
        content: `Budget policy blocked this request: ${budgetCheck.warnings.join("; ")}`,
        rawResponse: null,
        providerUsed: null,
        modelUsed: null,
        fallbackOccurred: false,
        receiptId: null,
        usageSummary: null,
        structuredOutput: null,
      } as unknown as AIResponseEnvelope,
      roleKey,
      taskType,
      costCents: 0,
      budgetCheck,
    };
  }

  // ── Step 3: Use effective (possibly downgraded) budget class ──
  const effectiveClass = budgetCheck.effectiveBudgetClass;
  const execParams = getBudgetExecutionParams(effectiveClass);

  const systemPrompt = ROLE_SYSTEM_PROMPTS[roleKey]
    ?? `You are an AI operations assistant for SITA OS performing a ${taskType} task.`;

  const capabilityKey = `admin.workforce.${roleKey}.${taskType}`;
  const intent = TASK_TYPE_TO_INTENT[taskType] ?? "analyze";

  const startMs = Date.now();

  // Create DB invocation record
  let invocationId: string | null = null;
  try {
    const { data } = await db
      .from("ai_workforce_invocations")
      .insert({
        user_id: userId,
        role_key: roleKey,
        task_type: taskType,
        capability_key: capabilityKey,
        input_summary: inputSummary.slice(0, 2000),
        budget_class: effectiveClass,
        mode: "real",
        status: "running",
      })
      .select("id")
      .single();
    invocationId = data?.id ?? null;
  } catch (e) {
    console.warn("[WorkforceExecutor] Could not create invocation record:", e);
  }

  // ── Step 4: Route through sovereign AI gateway ──
  const response = await invokeAICapability({
    capabilityKey,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: inputSummary },
    ],
    taskClass: execParams.taskClass,
    surface: "web.admin",
    intent: intent as never,
    maxTokens: execParams.maxTokens,
    temperature: execParams.temperature,
  });

  const latencyMs = Date.now() - startMs;
  const costCents = response.usageSummary?.costCents ?? 0;
  const tokensUsed = (response.usageSummary?.inputTokens ?? 0) + (response.usageSummary?.outputTokens ?? 0);

  // Update invocation record with results + budget metadata
  if (invocationId) {
    try {
      await db
        .from("ai_workforce_invocations")
        .update({
          status: response.status.startsWith("success_") ? "completed" : "failed",
          output_summary: response.content?.slice(0, 2000) ?? null,
          output_data: (response.structuredOutput as never) ?? null,
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
    budgetCheck,
  };
}
