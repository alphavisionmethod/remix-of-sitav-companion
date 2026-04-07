// ═══════════════════════════════════════════════════════════════
// SITA OS — Demo Policy Engine
// Side-effect blocking, safety controls, DB-backed kill switches,
// receipt logging for every policy decision
// ═══════════════════════════════════════════════════════════════

import type { RealityModeKey } from "./reality-mode-registry";
import { getModeDefinition } from "./reality-mode-registry";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";

export interface DemoPolicyDecision {
  allowed: boolean;
  reason: string;
  executionMode: "real" | "simulated" | "blocked" | "preview_only";
  receiptType: "real_receipt" | "demo_receipt" | "simulated_receipt";
}

export type SideEffectCategory =
  | "external_write"
  | "connector_write"
  | "notification"
  | "approval_execute"
  | "billing"
  | "ai_inference"
  | "data_mutation"
  | "email_send"
  | "sms_send"
  | "webhook_fire"
  | "automation_trigger";

// ── Kill Switches (in-memory cache + DB persistence) ────────────

const killSwitchCache = {
  demoModeGlobal: false,
  demoAILiveCalls: false,
  demoSimulatedWrites: false,
  demoSpecificScenarios: new Set<string>(),
  _loaded: false,
};

/** Load kill switches from Supabase into the in-memory cache */
export async function loadKillSwitches(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await fromTable("demo_kill_switches")
      .select("key, enabled")
      .eq("user_id", user.id);

    if (!data) return;

    for (const row of data as { key: string; enabled: boolean }[]) {
      if (row.key === "demo_mode_global") killSwitchCache.demoModeGlobal = row.enabled;
      else if (row.key === "demo_ai_live_calls") killSwitchCache.demoAILiveCalls = row.enabled;
      else if (row.key === "demo_simulated_writes") killSwitchCache.demoSimulatedWrites = row.enabled;
      else if (row.key.startsWith("scenario:") && row.enabled) {
        killSwitchCache.demoSpecificScenarios.add(row.key.replace("scenario:", ""));
      }
    }
    killSwitchCache._loaded = true;
  } catch {
    // Graceful fallback to in-memory defaults
  }
}

/** Persist a kill switch change to Supabase */
export async function setKillSwitch(
  key: "demoModeGlobal" | "demoAILiveCalls" | "demoSimulatedWrites",
  value: boolean,
  reason?: string
): Promise<void> {
  (killSwitchCache as unknown)[key] = value;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const dbKey = key === "demoModeGlobal" ? "demo_mode_global"
      : key === "demoAILiveCalls" ? "demo_ai_live_calls"
      : "demo_simulated_writes";

    await fromTable("demo_kill_switches").upsert(
      { user_id: user.id, key: dbKey, enabled: value, reason: reason ?? null },
      { onConflict: "user_id,key" }
    );
  } catch {
    // Best-effort persistence
  }
}

export async function disableScenario(scenarioId: string, reason?: string): Promise<void> {
  killSwitchCache.demoSpecificScenarios.add(scenarioId);
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await fromTable("demo_kill_switches").upsert(
      { user_id: user.id, key: `scenario:${scenarioId}`, enabled: true, reason: reason ?? null },
      { onConflict: "user_id,key" }
    );
  } catch { /* best effort */ }
}

export async function enableScenario(scenarioId: string): Promise<void> {
  killSwitchCache.demoSpecificScenarios.delete(scenarioId);
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await fromTable("demo_kill_switches").upsert(
      { user_id: user.id, key: `scenario:${scenarioId}`, enabled: false },
      { onConflict: "user_id,key" }
    );
  } catch { /* best effort */ }
}

export function isScenarioKilled(scenarioId: string): boolean {
  return killSwitchCache.demoModeGlobal || killSwitchCache.demoSpecificScenarios.has(scenarioId);
}

export function getKillSwitchState() {
  return {
    demoModeGlobal: killSwitchCache.demoModeGlobal,
    demoAILiveCalls: killSwitchCache.demoAILiveCalls,
    demoSimulatedWrites: killSwitchCache.demoSimulatedWrites,
    demoSpecificScenarios: Array.from(killSwitchCache.demoSpecificScenarios),
  };
}

// ── Receipt Logging ─────────────────────────────────────────────

async function logDemoReceipt(decision: DemoPolicyDecision, sideEffect: SideEffectCategory, mode: RealityModeKey): Promise<void> {
  if (mode === "real") return; // Real mode doesn't create demo receipts
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await fromTable("demo_receipts").insert({
      user_id: user.id,
      receipt_type: decision.receiptType,
      summary: `${sideEffect}: ${decision.reason}`,
      simulated: decision.executionMode === "simulated" || decision.executionMode === "blocked",
      visible_to_roles: ["admin", "owner"],
      feature_id: sideEffect,
    });
  } catch {
    // Non-blocking receipt logging
  }
}

// ── Policy Evaluation ───────────────────────────────────────────

export function evaluateDemoPolicy(
  mode: RealityModeKey,
  sideEffect: SideEffectCategory,
  opts?: { scenarioId?: string }
): DemoPolicyDecision {
  // Real mode: everything allowed
  if (mode === "real") {
    return { allowed: true, reason: "Real mode — all side effects permitted", executionMode: "real", receiptType: "real_receipt" };
  }

  // Global kill switch
  if (killSwitchCache.demoModeGlobal) {
    const decision: DemoPolicyDecision = { allowed: false, reason: "Demo mode globally disabled via kill switch", executionMode: "blocked", receiptType: "demo_receipt" };
    logDemoReceipt(decision, sideEffect, mode);
    return decision;
  }

  // Scenario kill switch
  if (opts?.scenarioId && isScenarioKilled(opts.scenarioId)) {
    const decision: DemoPolicyDecision = { allowed: false, reason: `Scenario ${opts.scenarioId} disabled via kill switch`, executionMode: "blocked", receiptType: "demo_receipt" };
    logDemoReceipt(decision, sideEffect, mode);
    return decision;
  }

  const def = getModeDefinition(mode);

  // Category-specific evaluation
  const categoryMap: Record<SideEffectCategory, boolean> = {
    external_write: def.sideEffects.externalWritesAllowed,
    connector_write: def.sideEffects.connectorWritesAllowed,
    notification: def.sideEffects.notificationsLive,
    approval_execute: def.sideEffects.approvalExecutesLive,
    billing: def.sideEffects.billingLive,
    ai_inference: def.aiPolicy !== "disabled",
    data_mutation: def.sideEffects.externalWritesAllowed,
    email_send: def.sideEffects.notificationsLive,
    sms_send: def.sideEffects.notificationsLive,
    webhook_fire: def.sideEffects.connectorWritesAllowed,
    automation_trigger: def.sideEffects.approvalExecutesLive,
  };

  const allowed = categoryMap[sideEffect] ?? false;

  if (allowed) {
    const decision: DemoPolicyDecision = {
      allowed: true,
      reason: `Side effect '${sideEffect}' permitted in ${mode} mode`,
      executionMode: "simulated",
      receiptType: def.receiptMode as DemoPolicyDecision["receiptType"],
    };
    logDemoReceipt(decision, sideEffect, mode);
    return decision;
  }

  const decision: DemoPolicyDecision = {
    allowed: false,
    reason: `Side effect '${sideEffect}' blocked in ${mode} mode`,
    executionMode: "simulated",
    receiptType: "demo_receipt",
  };
  logDemoReceipt(decision, sideEffect, mode);
  return decision;
}

// ── AI Policy ───────────────────────────────────────────────────

export function evaluateAIPolicy(mode: RealityModeKey): {
  allowed: boolean;
  mode: string;
  budgetCapCents?: number;
  preferCached: boolean;
} {
  const def = getModeDefinition(mode);

  if (killSwitchCache.demoAILiveCalls && mode !== "real") {
    return { allowed: false, mode: "disabled", preferCached: true };
  }

  switch (def.aiPolicy) {
    case "full_live":
      return { allowed: true, mode: "full_live", preferCached: false };
    case "limited_live":
      return { allowed: true, mode: "limited_live", budgetCapCents: 50, preferCached: true };
    case "scenario_grounded":
      return { allowed: true, mode: "scenario_grounded", budgetCapCents: 10, preferCached: true };
    case "cached_only":
      return { allowed: false, mode: "cached_only", preferCached: true };
    case "disabled":
    default:
      return { allowed: false, mode: "disabled", preferCached: true };
  }
}
