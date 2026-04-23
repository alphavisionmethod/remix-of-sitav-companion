// ═══════════════════════════════════════════════════════════════
// SITA OS — Sita Agent: Plan types (Phase E)
// ═══════════════════════════════════════════════════════════════
// Pure types shared by planner, executor, UI, and the edge function.
// Mirrors the Zod schema in supabase/functions/sita-agent-planner.
// ═══════════════════════════════════════════════════════════════

export type SitaAgentDomain = "business" | "finance" | "concierge";

export type SitaActionRisk = "low" | "medium" | "high";

export interface ActionStep {
  /** Stable id within the plan (e.g. "s1"). */
  id: string;
  /** Skill registry key, e.g. "business.task.create". */
  skillId: string;
  /** Short, user-facing description shown in the approval card. */
  summary: string;
  /** Payload passed to the kernel capability. */
  payload: Record<string, unknown>;
  /** Risk badge — UI only; safety is enforced server-side too. */
  risk: SitaActionRisk;
  /** Whether this specific step is reversible. */
  reversible: boolean;
  /** Whether the step requires explicit per-step approval regardless of tier. */
  requiresApproval: boolean;
}

export interface ActionPlan {
  /** Plan id (matches sita_agent_plans.id once persisted). */
  id: string;
  /** The original utterance / instruction from the user. */
  intent: string;
  /** Primary domain — drives autonomy tier lookup. */
  domain: SitaAgentDomain;
  /** Short headline shown atop the approval card. */
  title: string;
  /** Optional subtitle describing the goal in plain English. */
  rationale?: string;
  steps: ActionStep[];
  /** Aggregate risk = max(step.risk). */
  risk: SitaActionRisk;
  /** Aggregate reversible = every(step.reversible). */
  reversible: boolean;
  /** Tier the planner believed was active when planning. */
  autonomyTier: number;
  /** Whether the plan can fully auto-run without prompting. */
  canAutoRun: boolean;
  createdAt: number;
}

export interface PlanStepResult {
  stepId: string;
  ok: boolean;
  result?: Record<string, unknown> | null;
  error?: string;
}

export interface PlanResult {
  planId: string;
  status: "completed" | "failed" | "cancelled";
  steps: PlanStepResult[];
  startedAt: number;
  finishedAt: number;
}