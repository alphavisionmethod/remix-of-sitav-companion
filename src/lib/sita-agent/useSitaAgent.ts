// ═══════════════════════════════════════════════════════════════
// SITA OS — useSitaAgent (Phase E)
// ═══════════════════════════════════════════════════════════════
// React hook that turns a free-form intent into an ActionPlan
// (via the planner edge function), publishes it for the approval
// card, and exposes `executePlan` which runs each step through
// the canonical kernel.
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCanonicalAction } from "@/contexts/SitaKernelContext";
import { toast } from "sonner";
import {
  publishAgentPlan,
  clearAgentPlan,
  speakAgentSummary,
  summarizePlanResult,
} from "./agent-core";
import { getSkill } from "./skill-registry";
import {
  getAutonomyTier,
  canAutoRunStep,
} from "./autonomy-tier";
import type { ActionPlan, PlanResult, PlanStepResult, SitaAgentDomain } from "./plan-types";

export interface PlanRequestOptions {
  /** Optional override domain hint. */
  domain?: SitaAgentDomain;
  /** Skip publishing — return the plan synchronously instead. */
  silent?: boolean;
}

function detectDomain(intent: string): SitaAgentDomain {
  const t = intent.toLowerCase();
  if (/invoice|bill|payment|cash|expense|budget|payroll|tax|finance/.test(t)) return "finance";
  if (/reservation|book|reschedul|reminder|travel|hotel|flight|concierge|errand|gift/.test(t)) return "concierge";
  return "business";
}

export function useSitaAgent() {
  const { user } = useAuth();
  const { execute } = useCanonicalAction();
  const inFlightRef = useRef(false);

  /** Ask the planner for a typed Action Plan. */
  const planIntent = useCallback(async (intent: string, opts: PlanRequestOptions = {}): Promise<ActionPlan | null> => {
    if (!intent.trim()) return null;
    if (inFlightRef.current) return null;
    inFlightRef.current = true;
    try {
      const domain = opts.domain ?? detectDomain(intent);
      const tier = getAutonomyTier(domain);

      const { data, error } = await supabase.functions.invoke("sita-agent-planner", {
        body: { intent, domain, autonomyTier: tier },
      });
      if (error) throw error;

      const plan = (data?.plan ?? null) as ActionPlan | null;
      if (!plan || !Array.isArray(plan.steps) || plan.steps.length === 0) {
        toast.message("Sita couldn't form a plan for that.", {
          description: "Try rephrasing or being more specific.",
        });
        return null;
      }

      // Reject any step pointing to an unknown skill.
      for (const s of plan.steps) {
        if (!getSkill(s.skillId)) {
          toast.error(`Sita produced an unknown skill: ${s.skillId}`);
          return null;
        }
      }

      // Persist the plan record (best-effort).
      if (user) {
        try {
          await supabase.from("sita_agent_plans").insert({
            id: plan.id,
            user_id: user.id,
            intent,
            domain,
            plan: plan as unknown as Record<string, unknown>,
            status: "pending",
            autonomy_tier: tier,
          });
        } catch (err) {
          console.warn("[sita-agent] plan persist failed", err);
        }
      }

      if (!opts.silent) publishAgentPlan(plan);
      return plan;
    } catch (err) {
      console.error("[sita-agent] planIntent failed", err);
      toast.error("Sita planner failed.", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
      return null;
    } finally {
      inFlightRef.current = false;
    }
  }, [user]);

  /** Execute a plan through the kernel, step-by-step. */
  const executePlan = useCallback(async (plan: ActionPlan): Promise<PlanResult> => {
    const startedAt = Date.now();
    const stepResults: PlanStepResult[] = [];
    let allOk = true;

    if (user) {
      try {
        await supabase.from("sita_agent_plans").update({
          status: "executing",
          approved_at: new Date().toISOString(),
        }).eq("id", plan.id);
      } catch { /* noop */ }
    }

    for (const step of plan.steps) {
      const skill = getSkill(step.skillId);
      if (!skill) {
        stepResults.push({ stepId: step.id, ok: false, error: `Unknown skill ${step.skillId}` });
        allOk = false;
        break;
      }
      try {
        const result = await execute(skill.domain, skill.capabilityId, step.payload, {
          intent: skill.id,
        });
        stepResults.push({ stepId: step.id, ok: result !== null, result });
        if (result === null) { allOk = false; break; }
      } catch (err) {
        stepResults.push({
          stepId: step.id,
          ok: false,
          error: err instanceof Error ? err.message : "execution_failed",
        });
        allOk = false;
        break;
      }
    }

    const finishedAt = Date.now();
    const status: PlanResult["status"] = allOk ? "completed" : "failed";
    const result: PlanResult = { planId: plan.id, status, steps: stepResults, startedAt, finishedAt };

    if (user) {
      try {
        await supabase.from("sita_agent_plans").update({
          status,
          completed_at: new Date().toISOString(),
          result: result as unknown as Record<string, unknown>,
          error: allOk ? null : (stepResults.find((s) => !s.ok)?.error ?? "step_failed"),
        }).eq("id", plan.id);
      } catch { /* noop */ }
    }

    const summary = summarizePlanResult(plan, result);
    speakAgentSummary(summary);
    if (allOk) toast.success(summary);
    else toast.error(summary);

    clearAgentPlan();
    return result;
  }, [execute, user]);

  /** Cancel the active plan (also marks it cancelled in DB). */
  const cancelPlan = useCallback(async (plan: ActionPlan, reason?: string) => {
    clearAgentPlan();
    if (!user) return;
    try {
      await supabase.from("sita_agent_plans").update({
        status: "cancelled",
        completed_at: new Date().toISOString(),
        error: reason ?? null,
      }).eq("id", plan.id);
    } catch { /* noop */ }
  }, [user]);

  /** Plan + (maybe) auto-run. Used by voice + "Do it for me" nudges. */
  const runIntent = useCallback(async (intent: string, opts: PlanRequestOptions = {}) => {
    const plan = await planIntent(intent, opts);
    if (!plan) return null;
    if (plan.canAutoRun) {
      // Skip the approval card — execute directly.
      clearAgentPlan();
      return executePlan(plan);
    }
    return plan;
  }, [planIntent, executePlan]);

  // Bridge: `sita-agent-intent` events from voice / nudges.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ intent?: string; domain?: SitaAgentDomain; autoRun?: boolean }>).detail;
      if (!detail?.intent) return;
      void runIntent(detail.intent, { domain: detail.domain });
    };
    window.addEventListener("sita-agent-intent", handler);
    return () => window.removeEventListener("sita-agent-intent", handler);
  }, [runIntent]);

  return {
    planIntent,
    executePlan,
    cancelPlan,
    runIntent,
    isPlanning: inFlightRef.current,
    canAutoRunStep,
  };
}