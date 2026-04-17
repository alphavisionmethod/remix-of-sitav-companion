// ═══════════════════════════════════════════════════════════════
// SITA OS — Kill Switch Enforcement Map
// Declarative truth: WHERE each switch is enforced in the runtime.
// Used by `check-kill-switch-coverage.ts` to assert every switch
// has at least one enforcement point.
// ═══════════════════════════════════════════════════════════════

import type { EnforcementPoint } from "./kill-switch-types";

export const KILL_SWITCH_ENFORCEMENT_MAP: readonly EnforcementPoint[] = [
  // ── KS-ADVISORS ────────────────────────────────────────────────
  {
    switchId: "KS-ADVISORS",
    layer: "edge-function",
    enforcedAt: "supabase/functions/chat-advisor/index.ts",
    symbol: "checkKillSwitchOrReject",
    blocks: "Advisor chat completions and recommendation generation",
  },
  {
    switchId: "KS-ADVISORS",
    layer: "domain-service",
    enforcedAt: "src/services/advisor-orchestrator.ts",
    symbol: "advisorOrchestratorService",
    blocks: "Synchronous advisor invocations from UI",
  },
  {
    switchId: "KS-ADVISORS",
    layer: "scheduler",
    enforcedAt: "supabase/functions/advisor-agent-loop/index.ts",
    symbol: "Deno.serve",
    blocks: "Background advisor reflection and autonomous action loops",
  },

  // ── KS-OUTBOUND ────────────────────────────────────────────────
  {
    switchId: "KS-OUTBOUND",
    layer: "edge-function",
    enforcedAt: "supabase/functions/push-dispatch/index.ts",
    symbol: "checkAnyKillSwitchOrReject",
    blocks: "All outbound emails, SMS, and in-app pushes",
  },
  {
    switchId: "KS-OUTBOUND",
    layer: "domain-service",
    enforcedAt: "src/services/communication-service.ts",
    symbol: "communicationService",
    blocks: "Pre-flight message dispatch from product surfaces",
  },

  // ── KS-CONNECTORS ──────────────────────────────────────────────
  {
    switchId: "KS-CONNECTORS",
    layer: "connector",
    enforcedAt: "supabase/functions/connector-oauth/index.ts",
    symbol: "Deno.serve",
    blocks: "OAuth callbacks and connector token refresh",
  },
  {
    switchId: "KS-CONNECTORS",
    layer: "edge-function",
    enforcedAt: "supabase/functions/connector-sync/index.ts",
    symbol: "checkAnyKillSwitchOrReject",
    blocks: "Inbound and outbound connector sync runs",
  },

  // ── KS-SYNC ────────────────────────────────────────────────────
  {
    switchId: "KS-SYNC",
    layer: "edge-function",
    enforcedAt: "supabase/functions/connector-sync/index.ts",
    symbol: "checkAnyKillSwitchOrReject",
    blocks: "All bi-directional sync runs across providers",
  },
  {
    switchId: "KS-SYNC",
    layer: "scheduler",
    enforcedAt: "src/services/sync-service.ts",
    symbol: "syncService",
    blocks: "Scheduled sync cadence",
  },

  // ── KS-PAYMENTS ────────────────────────────────────────────────
  {
    switchId: "KS-PAYMENTS",
    layer: "edge-function",
    enforcedAt: "supabase/functions/payment-process/index.ts",
    symbol: "checkKillSwitchOrReject",
    blocks: "Payment capture, refunds, and gateway calls",
  },
  {
    switchId: "KS-PAYMENTS",
    layer: "ui-gate",
    enforcedAt: "src/pages/admin/AR08KillSwitchCenter.tsx",
    symbol: "useAction",
    blocks: "Pay / refund operator gates surfaced in admin",
  },
  {
    switchId: "KS-PAYMENTS",
    layer: "edge-function",
    enforcedAt: "supabase/functions/payment-kill-switch/index.ts",
    symbol: "Deno.serve",
    blocks: "Dedicated emergency payment circuit-breaker endpoint",
  },

  // ── KS-MOBILE-PUSH ─────────────────────────────────────────────
  {
    switchId: "KS-MOBILE-PUSH",
    layer: "edge-function",
    enforcedAt: "supabase/functions/push-dispatch/index.ts",
    symbol: "checkAnyKillSwitchOrReject",
    blocks: "VAPID web push and mobile push delivery",
  },

  // ── KS-MODEL-PROVIDERS ─────────────────────────────────────────
  {
    switchId: "KS-MODEL-PROVIDERS",
    layer: "ai-gateway",
    enforcedAt: "supabase/functions/ai-gateway/index.ts",
    symbol: "Deno.serve",
    blocks: "All outbound LLM/model API calls",
  },
  {
    switchId: "KS-MODEL-PROVIDERS",
    layer: "domain-service",
    enforcedAt: "src/services/ai-gateway-service.ts",
    symbol: "invokeAICapability",
    blocks: "Sovereign AI gateway entrypoint used by every AI feature",
  },

  // ── KS-WORKFLOW ────────────────────────────────────────────────
  {
    switchId: "KS-WORKFLOW",
    layer: "edge-function",
    enforcedAt: "supabase/functions/workflow-execute/index.ts",
    symbol: "checkKillSwitchOrReject",
    blocks: "Workflow execution and state transitions",
  },
  {
    switchId: "KS-WORKFLOW",
    layer: "scheduler",
    enforcedAt: "supabase/functions/scheduler-dispatch/index.ts",
    symbol: "checkKillSwitchOrReject",
    blocks: "Background workflow tick loops",
  },

  // ── KS-SIMULATIONS ─────────────────────────────────────────────
  {
    switchId: "KS-SIMULATIONS",
    layer: "edge-function",
    enforcedAt: "supabase/functions/run-simulation/index.ts",
    symbol: "Deno.serve",
    blocks: "Scenario simulations and what-if engines",
  },

  // ── KS-AUTOMATIONS ─────────────────────────────────────────────
  {
    switchId: "KS-AUTOMATIONS",
    layer: "scheduler",
    enforcedAt: "supabase/functions/scheduler-dispatch/index.ts",
    symbol: "checkKillSwitchOrReject",
    blocks: "All scheduled automations and cron triggers",
  },

  // ── KS-RELEASE-ROLLOUT (new) ───────────────────────────────────
  {
    switchId: "KS-RELEASE-ROLLOUT",
    layer: "release-pipeline",
    enforcedAt: "scripts/deployment/check-deploy-readiness.ps1",
    symbol: "Test-DeployReadiness",
    blocks: "Deployment gate — refuses to ship a new release",
  },
  {
    switchId: "KS-RELEASE-ROLLOUT",
    layer: "ui-gate",
    enforcedAt: "src/pages/admin/AR08KillSwitchCenter.tsx",
    symbol: "ReleaseRolloutPanel",
    blocks: "Operator visible rollout controls",
  },

  // ── KS-APPLIANCE-UPDATE (new) ──────────────────────────────────
  {
    switchId: "KS-APPLIANCE-UPDATE",
    layer: "appliance-update",
    enforcedAt: "scripts/release/iso/sita-ota-agent.sh",
    symbol: "ota_check_killswitch",
    blocks: "OTA appliance update channel pull and apply",
  },

  // ── KS-SELF-HEALING (new) ──────────────────────────────────────
  {
    switchId: "KS-SELF-HEALING",
    layer: "self-healing",
    enforcedAt: "src/services/self-healing-service.ts",
    symbol: "selfHealingService.attemptRepair",
    blocks: "Autonomous repair / restart loops",
  },

  // ── KS-PROVIDER-INGESTION (new) ────────────────────────────────
  {
    switchId: "KS-PROVIDER-INGESTION",
    layer: "connector",
    enforcedAt: "supabase/functions/connector-sync/index.ts",
    symbol: "checkAnyKillSwitchOrReject",
    blocks: "Inbound webhook ingestion from provider families",
  },
] as const;

export function getEnforcementPoints(switchId: string): readonly EnforcementPoint[] {
  return KILL_SWITCH_ENFORCEMENT_MAP.filter((p) => p.switchId === switchId);
}

export function getEnforcementCoverage(): Map<string, number> {
  const map = new Map<string, number>();
  for (const point of KILL_SWITCH_ENFORCEMENT_MAP) {
    map.set(point.switchId, (map.get(point.switchId) ?? 0) + 1);
  }
  return map;
}
