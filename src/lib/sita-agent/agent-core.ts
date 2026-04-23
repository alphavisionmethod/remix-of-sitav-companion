// ═══════════════════════════════════════════════════════════════
// SITA OS — Sita Agent core (Phase E)
// ═══════════════════════════════════════════════════════════════
// Tiny pub/sub bus for the *active* Action Plan. The HUD subscribes
// via `useActiveAgentPlan` and renders the approval card. The hook
// `useSitaAgent` publishes plans, executes them through the kernel,
// and emits `sita-voice-reply` for TTS confirmation.
//
// All execution flows through `useAction` → `useCanonicalAction`
// (12-stage kernel). This file only orchestrates; it does NOT call
// fetch/supabase directly for execution.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import type { ActionPlan, PlanResult } from "./plan-types";

type Listener = (plan: ActionPlan | null) => void;
const listeners = new Set<Listener>();
let active: ActionPlan | null = null;

export function publishAgentPlan(plan: ActionPlan) {
  active = plan;
  for (const l of listeners) {
    try { l(plan); } catch (err) { console.warn("[sita-agent] listener", err); }
  }
}

export function clearAgentPlan() {
  active = null;
  for (const l of listeners) {
    try { l(null); } catch { /* noop */ }
  }
}

export function readActiveAgentPlan(): ActionPlan | null {
  return active;
}

export function subscribeAgentPlan(l: Listener): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useActiveAgentPlan(): ActionPlan | null {
  const [plan, setPlan] = useState<ActionPlan | null>(active);
  useEffect(() => subscribeAgentPlan(setPlan), []);
  return plan;
}

/** Emit a voice-reply event so HUD/TTS can speak the result. */
export function speakAgentSummary(text: string) {
  if (typeof window === "undefined" || !text.trim()) return;
  window.dispatchEvent(new CustomEvent("sita-voice-reply", { detail: { text } }));
}

export function summarizePlanResult(plan: ActionPlan, result: PlanResult): string {
  const ok = result.steps.filter((s) => s.ok).length;
  const total = result.steps.length;
  if (result.status === "completed") {
    return `Done — ${ok} of ${total} step${total === 1 ? "" : "s"} for "${plan.title}".`;
  }
  if (result.status === "cancelled") return `Cancelled "${plan.title}".`;
  return `Stopped — ${ok} of ${total} step${total === 1 ? "" : "s"} completed for "${plan.title}".`;
}