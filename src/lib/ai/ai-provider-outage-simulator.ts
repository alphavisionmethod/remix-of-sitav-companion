// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Provider Outage Simulator
// Declares outage scenarios and expected system behavior.
// References ai-fallback-policy.ts for chain resolution.
// ═══════════════════════════════════════════════════════════════

import { resolveFallback } from "./ai-fallback-policy";
import { AI_CAPABILITY_REGISTRY } from "./ai-capability-registry";

export type OutageScenarioId =
  | "provider-unavailable"
  | "model-unavailable"
  | "timeout"
  | "invalid-output"
  | "fallback-chain-exhaustion"
  | "degraded-safe-mode";

export interface OutageScenario {
  scenarioId: OutageScenarioId;
  description: string;
  affectedCapabilities: readonly string[];
  expectedBehavior: string;
  fallbackResult: string;
  operatorAlertPath: string;
  recoverySteps: readonly string[];
}

export const OUTAGE_SCENARIOS: readonly OutageScenario[] = [
  {
    scenarioId: "provider-unavailable",
    description: "Entire provider (e.g., Google AI) becomes unreachable",
    affectedCapabilities: AI_CAPABILITY_REGISTRY.filter((c) => c.preferredRoute.startsWith("google/")).map((c) => c.capabilityId),
    expectedBehavior: "Automatic fallback to next provider in chain; refuse-with-receipt if all Google-dependent",
    fallbackResult: "OpenAI models or cached-only depending on capability policy",
    operatorAlertPath: "admin → dual-admin escalation",
    recoverySteps: ["Detect via provider health monitor", "Auto-route to fallback chain", "Alert operator", "Monitor recovery", "Restore primary when healthy"],
  },
  {
    scenarioId: "model-unavailable",
    description: "Specific model (e.g., gemini-2.5-pro) returns 503/404",
    affectedCapabilities: AI_CAPABILITY_REGISTRY.filter((c) => c.preferredRoute === "google/gemini-2.5-pro").map((c) => c.capabilityId),
    expectedBehavior: "Fallback to next model in chain; continue with reduced quality if acceptable",
    fallbackResult: "Next model in fallback chain per capability policy",
    operatorAlertPath: "admin notification",
    recoverySteps: ["Log model unavailability", "Trigger fallback resolution", "Emit degraded receipt", "Alert operator", "Re-check model availability on next invocation"],
  },
  {
    scenarioId: "timeout",
    description: "Provider response exceeds configured timeout (30s default)",
    affectedCapabilities: AI_CAPABILITY_REGISTRY.map((c) => c.capabilityId),
    expectedBehavior: "Abort request, attempt fallback model, emit timeout receipt",
    fallbackResult: "Next model or degraded response depending on chain",
    operatorAlertPath: "admin notification if repeated",
    recoverySteps: ["Abort timed-out request", "Attempt fallback", "Emit timeout receipt", "Track consecutive timeouts", "Escalate if pattern persists"],
  },
  {
    scenarioId: "invalid-output",
    description: "Model returns malformed, unparseable, or unsafe output",
    affectedCapabilities: AI_CAPABILITY_REGISTRY.map((c) => c.capabilityId),
    expectedBehavior: "Reject output, log with evidence, attempt retry or fallback once",
    fallbackResult: "Single retry then fallback model; refuse if still invalid",
    operatorAlertPath: "admin notification with evidence payload",
    recoverySteps: ["Validate output structure", "Log invalid output evidence", "Single retry", "Fallback if retry fails", "Refuse with receipt if chain exhausted"],
  },
  {
    scenarioId: "fallback-chain-exhaustion",
    description: "All models in fallback chain are unavailable or failing",
    affectedCapabilities: AI_CAPABILITY_REGISTRY.map((c) => c.capabilityId),
    expectedBehavior: "Apply noProviderBehavior: refuse-with-receipt, cached-only, or degrade-gracefully",
    fallbackResult: "Capability-specific degraded behavior per policy",
    operatorAlertPath: "dual-admin escalation (critical)",
    recoverySteps: ["Log chain exhaustion", "Apply degraded behavior", "Emit refusal/degraded receipt", "Critical alert to operator", "Block further attempts until recovery"],
  },
  {
    scenarioId: "degraded-safe-mode",
    description: "System enters global degraded mode due to multiple provider failures",
    affectedCapabilities: AI_CAPABILITY_REGISTRY.map((c) => c.capabilityId),
    expectedBehavior: "Only cached-only and economy-tier capabilities active; critical capabilities refuse-with-receipt",
    fallbackResult: "Minimal AI functionality preserved via cached responses",
    operatorAlertPath: "dual-admin escalation (critical) + owner notification",
    recoverySteps: ["Activate degraded-safe-mode flag", "Disable non-essential AI capabilities", "Serve cached responses where available", "Monitor all providers for recovery", "Gradually restore capabilities as providers recover"],
  },
];

export interface SimulationResult {
  scenarioId: OutageScenarioId;
  capabilityId: string;
  fallbackResolution: ReturnType<typeof resolveFallback>;
  handledGracefully: boolean;
}

export function simulateOutage(scenarioId: OutageScenarioId): SimulationResult[] {
  const scenario = OUTAGE_SCENARIOS.find((s) => s.scenarioId === scenarioId);
  if (!scenario) return [];

  const triggerMap: Record<OutageScenarioId, Parameters<typeof resolveFallback>[1]> = {
    "provider-unavailable": "error",
    "model-unavailable": "model-unavailable",
    "timeout": "timeout",
    "invalid-output": "invalid-output",
    "fallback-chain-exhaustion": "error",
    "degraded-safe-mode": "error",
  };

  return scenario.affectedCapabilities.map((capId) => {
    const failedModels = scenarioId === "fallback-chain-exhaustion"
      ? AI_CAPABILITY_REGISTRY.find((c) => c.capabilityId === capId)?.allowedModels.slice() ?? []
      : [AI_CAPABILITY_REGISTRY.find((c) => c.capabilityId === capId)?.preferredRoute ?? "unknown"];

    const resolution = resolveFallback(capId, triggerMap[scenarioId], failedModels);
    return {
      scenarioId,
      capabilityId: capId,
      fallbackResolution: resolution,
      handledGracefully: !resolution.chainExhausted || resolution.noProviderBehavior !== "refuse-with-receipt",
    };
  });
}