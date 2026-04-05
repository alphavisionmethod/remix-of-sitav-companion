// ═══════════════════════════════════════════════════════════════
// SITA OS — Demo Policy Engine
// Side-effect blocking, safety controls, kill switches
// ═══════════════════════════════════════════════════════════════

import type { RealityModeKey } from "./reality-mode-registry";
import { getModeDefinition } from "./reality-mode-registry";

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

// ── Kill Switches ───────────────────────────────────────────────

const killSwitches = {
  demoModeGlobal: false,
  demoAILiveCalls: false,
  demoSimulatedWrites: false,
  demoSpecificScenarios: new Set<string>(),
};

export function setKillSwitch(key: keyof Omit<typeof killSwitches, "demoSpecificScenarios">, value: boolean): void {
  (killSwitches as any)[key] = value;
}

export function disableScenario(scenarioId: string): void {
  killSwitches.demoSpecificScenarios.add(scenarioId);
}

export function enableScenario(scenarioId: string): void {
  killSwitches.demoSpecificScenarios.delete(scenarioId);
}

export function isScenarioKilled(scenarioId: string): boolean {
  return killSwitches.demoModeGlobal || killSwitches.demoSpecificScenarios.has(scenarioId);
}

export function getKillSwitchState() {
  return {
    ...killSwitches,
    demoSpecificScenarios: Array.from(killSwitches.demoSpecificScenarios),
  };
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
  if (killSwitches.demoModeGlobal) {
    return { allowed: false, reason: "Demo mode globally disabled via kill switch", executionMode: "blocked", receiptType: "demo_receipt" };
  }

  // Scenario kill switch
  if (opts?.scenarioId && isScenarioKilled(opts.scenarioId)) {
    return { allowed: false, reason: `Scenario ${opts.scenarioId} disabled via kill switch`, executionMode: "blocked", receiptType: "demo_receipt" };
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
    return {
      allowed: true,
      reason: `Side effect '${sideEffect}' permitted in ${mode} mode`,
      executionMode: "simulated",
      receiptType: def.receiptMode as DemoPolicyDecision["receiptType"],
    };
  }

  return {
    allowed: false,
    reason: `Side effect '${sideEffect}' blocked in ${mode} mode`,
    executionMode: "simulated",
    receiptType: "demo_receipt",
  };
}

// ── AI Policy ───────────────────────────────────────────────────

export function evaluateAIPolicy(mode: RealityModeKey): {
  allowed: boolean;
  mode: string;
  budgetCapCents?: number;
  preferCached: boolean;
} {
  const def = getModeDefinition(mode);

  if (killSwitches.demoAILiveCalls && mode !== "real") {
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
