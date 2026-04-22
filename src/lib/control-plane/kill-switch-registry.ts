// ═══════════════════════════════════════════════════════════════
// SITA OS — Kill Switch Registry
// 14 subsystem kill switches with impact, rollback, escalation,
// bounded-context cross-links, and enforcement metadata.
// ═══════════════════════════════════════════════════════════════

import type {
  KillSwitchEntry,
  KillSwitchState,
  ImpactLevel,
} from "./kill-switch-types";

// Re-export types so existing imports `from "./kill-switch-registry"` keep working.
export type { KillSwitchEntry, KillSwitchState, ImpactLevel } from "./kill-switch-types";

export const KILL_SWITCH_REGISTRY: readonly KillSwitchEntry[] = [
  {
    switchId: "KS-ADVISORS",
    target: "advisors",
    displayName: "Advisor Council Kill Switch",
    description:
      "Disables all advisor agents, recommendation generation, and autonomous actions",
    impactLevel: "significant",
    affectedServices: [
      "advisor-orchestrator",
      "advisor-memory-service",
      "advisor-action-engine",
    ],
    affectedTables: [
      "advisor_agents",
      "advisor_board_actions",
      "advisor_board_recommendations",
      "advisor_action_queue",
    ],
    affectedEdgeFunctions: ["advisor-chat", "advisor-orchestrate", "advisor-reflect"],
    userFacingImpact:
      "No AI advisor recommendations or autonomous actions. Manual operation only.",
    rollbackProcedure:
      "Disarm switch, verify advisor_agents.is_active flags, restart advisor-orchestrator",
    requiresDualApproval: false,
    cooldownMs: 60_000,
    runbookRef: "RB-010",
    defaultState: "disarmed",
    boundedContextId: "boardroom",
    enforcementLayers: ["edge-function", "domain-service", "scheduler"],
    dependsOn: ["KS-MODEL-PROVIDERS"],
    supersedes: [],
    ownerTeam: "advisor-platform",
  },
  {
    switchId: "KS-OUTBOUND",
    target: "outbound-comms",
    displayName: "Outbound Communications Kill Switch",
    description: "Blocks all outbound emails, SMS, and push notifications",
    impactLevel: "moderate",
    affectedServices: ["communication-service", "push-service"],
    affectedTables: ["notification_delivery_receipts"],
    affectedEdgeFunctions: ["send-notification", "send-email"],
    userFacingImpact:
      "No emails, SMS, or push sent. Queued messages held until re-enabled.",
    rollbackProcedure:
      "Disarm switch, flush notification queue, verify delivery pipeline",
    requiresDualApproval: false,
    cooldownMs: 30_000,
    runbookRef: "RB-007",
    defaultState: "disarmed",
    boundedContextId: "integrations",
    enforcementLayers: ["edge-function", "domain-service"],
    dependsOn: [],
    supersedes: ["KS-MOBILE-PUSH"],
    ownerTeam: "messaging-team",
  },
  {
    switchId: "KS-CONNECTORS",
    target: "connectors",
    displayName: "Connector Integration Kill Switch",
    description: "Disables all external integrations and OAuth connector operations",
    impactLevel: "moderate",
    affectedServices: ["connector-service", "webhook-service"],
    affectedTables: ["connector_oauth_flows", "connector_sync_runs"],
    affectedEdgeFunctions: [
      "connector-auth-callback",
      "connector-sync",
      "connector-webhook",
    ],
    userFacingImpact:
      "No data sync with external CRMs, calendars, or tools. Existing data preserved.",
    rollbackProcedure:
      "Disarm switch, re-authenticate expired OAuth tokens, trigger catch-up sync",
    requiresDualApproval: false,
    cooldownMs: 30_000,
    runbookRef: "RB-003",
    defaultState: "disarmed",
    boundedContextId: "integrations",
    enforcementLayers: ["connector", "edge-function"],
    dependsOn: [],
    supersedes: ["KS-SYNC", "KS-PROVIDER-INGESTION"],
    ownerTeam: "integrations-team",
  },
  {
    switchId: "KS-SYNC",
    target: "sync",
    displayName: "Data Sync Kill Switch",
    description: "Halts all bi-directional data synchronization",
    impactLevel: "moderate",
    affectedServices: ["sync-service"],
    affectedTables: ["connector_sync_runs"],
    affectedEdgeFunctions: ["connector-sync"],
    userFacingImpact:
      "Data may become stale. No new external data pulled or pushed.",
    rollbackProcedure:
      "Disarm switch, run reconciliation sync, verify data freshness",
    requiresDualApproval: false,
    cooldownMs: 30_000,
    runbookRef: "RB-003",
    defaultState: "disarmed",
    boundedContextId: "integrations",
    enforcementLayers: ["edge-function", "scheduler"],
    dependsOn: ["KS-CONNECTORS"],
    supersedes: [],
    ownerTeam: "integrations-team",
  },
  {
    switchId: "KS-PAYMENTS",
    target: "payments",
    displayName: "Payment Processing Kill Switch",
    description:
      "Disables all payment processing, invoice generation, and financial transactions",
    impactLevel: "severe",
    affectedServices: ["finance-engine", "invoice-service"],
    affectedTables: ["invoices", "payments", "financial_transactions"],
    affectedEdgeFunctions: ["process-payment", "generate-invoice", "payment-kill-switch"],
    userFacingImpact:
      "No invoices generated or payments processed. Financial data read-only.",
    rollbackProcedure:
      "Disarm switch, verify payment gateway connectivity, reconcile pending transactions",
    requiresDualApproval: true,
    cooldownMs: 120_000,
    runbookRef: "RB-005",
    defaultState: "disarmed",
    boundedContextId: "finance-os",
    enforcementLayers: ["edge-function", "ui-gate"],
    dependsOn: [],
    supersedes: [],
    ownerTeam: "finance-team",
  },
  {
    switchId: "KS-MOBILE-PUSH",
    target: "mobile-push",
    displayName: "Mobile Push Kill Switch",
    description: "Disables VAPID web push and mobile push notification delivery",
    impactLevel: "minimal",
    affectedServices: ["push-service"],
    affectedTables: ["push_subscriptions"],
    affectedEdgeFunctions: ["send-push-notification"],
    userFacingImpact:
      "No push notifications on mobile or desktop. In-app notifications still work.",
    rollbackProcedure: "Disarm switch, verify VAPID key, test push delivery",
    requiresDualApproval: false,
    cooldownMs: 15_000,
    runbookRef: "RB-007",
    defaultState: "disarmed",
    boundedContextId: "mobile",
    enforcementLayers: ["edge-function"],
    dependsOn: [],
    supersedes: [],
    ownerTeam: "mobile-team",
  },
  {
    switchId: "KS-MODEL-PROVIDERS",
    target: "model-providers",
    displayName: "AI Model Provider Kill Switch",
    description:
      "Disables all external AI model API calls (OpenAI, Google, etc.)",
    impactLevel: "significant",
    affectedServices: [
      "ai-gateway",
      "ai-budget-service",
      "epistemic-firewall",
      "prompt-orchestrator",
    ],
    affectedTables: ["ai_inference_receipts", "ai_workforce_invocations"],
    affectedEdgeFunctions: ["ai-gateway", "invoke-ai-capability"],
    userFacingImpact:
      "No AI-powered features. Cached outputs may still be served. Manual mode only.",
    rollbackProcedure:
      "Disarm switch, verify API key validity, test model connectivity, restart ai-gateway",
    requiresDualApproval: true,
    cooldownMs: 60_000,
    runbookRef: "RB-002",
    defaultState: "disarmed",
    boundedContextId: "runtime-kernel",
    enforcementLayers: ["ai-gateway", "domain-service"],
    dependsOn: [],
    supersedes: [],
    ownerTeam: "ai-platform",
  },
  {
    switchId: "KS-WORKFLOW",
    target: "workflow",
    displayName: "Workflow Engine Kill Switch",
    description: "Halts all automated workflow execution and state transitions",
    impactLevel: "moderate",
    affectedServices: ["advisor-action-engine"],
    affectedTables: ["advisor_board_actions", "advisor_board_tool_executions"],
    affectedEdgeFunctions: ["agent-executor", "workflow-step"],
    userFacingImpact:
      "Automated workflows paused. Manual action required for pending approvals.",
    rollbackProcedure:
      "Disarm switch, resume pending workflows, verify state consistency",
    requiresDualApproval: false,
    cooldownMs: 30_000,
    runbookRef: "RB-004",
    defaultState: "disarmed",
    boundedContextId: "runtime-kernel",
    enforcementLayers: ["edge-function", "scheduler"],
    dependsOn: [],
    supersedes: [],
    ownerTeam: "platform-runtime",
  },
  {
    switchId: "KS-SIMULATIONS",
    target: "simulations",
    displayName: "Simulation Engine Kill Switch",
    description: "Disables all scenario simulations and what-if analyses",
    impactLevel: "minimal",
    affectedServices: ["boardroom-service"],
    affectedTables: ["boardroom_sessions", "boardroom_recommendations"],
    affectedEdgeFunctions: ["run-simulation", "scenario-analysis"],
    userFacingImpact:
      "No new simulations can be run. Historical results still viewable.",
    rollbackProcedure: "Disarm switch, verify simulation engine state",
    requiresDualApproval: false,
    cooldownMs: 15_000,
    runbookRef: null,
    defaultState: "disarmed",
    boundedContextId: "boardroom",
    enforcementLayers: ["edge-function"],
    dependsOn: ["KS-MODEL-PROVIDERS"],
    supersedes: [],
    ownerTeam: "boardroom-team",
  },
  {
    switchId: "KS-AUTOMATIONS",
    target: "automations",
    displayName: "Automation Engine Kill Switch",
    description:
      "Disables all scheduled automations, triggers, and recurring tasks",
    impactLevel: "moderate",
    affectedServices: ["advisor-orchestrator", "concierge-orchestrator"],
    affectedTables: ["advisor_autonomy_policies"],
    affectedEdgeFunctions: ["run-automation", "scheduled-task"],
    userFacingImpact:
      "No automated tasks fire. All recurring work paused until re-enabled.",
    rollbackProcedure:
      "Disarm switch, reschedule missed automations, verify cron state",
    requiresDualApproval: false,
    cooldownMs: 30_000,
    runbookRef: null,
    defaultState: "disarmed",
    boundedContextId: "concierge-os",
    enforcementLayers: ["scheduler"],
    dependsOn: [],
    supersedes: [],
    ownerTeam: "automation-team",
  },
  // ── New switches (Phase 4) ─────────────────────────────────────
  {
    switchId: "KS-RELEASE-ROLLOUT",
    target: "release-rollout",
    displayName: "Release Rollout Kill Switch",
    description:
      "Halts new release deployments across web, desktop, and appliance channels",
    impactLevel: "severe",
    affectedServices: ["release-service", "deployment-service"],
    affectedTables: [],
    affectedEdgeFunctions: [],
    userFacingImpact:
      "No new versions ship. Existing deployments continue running unchanged.",
    rollbackProcedure:
      "Disarm switch, re-run deployment readiness checks, resume canary cohort",
    requiresDualApproval: true,
    cooldownMs: 300_000,
    runbookRef: "RB-009",
    defaultState: "disarmed",
    boundedContextId: "cloud-control-plane",
    enforcementLayers: ["release-pipeline", "ui-gate"],
    dependsOn: [],
    supersedes: [],
    ownerTeam: "release-engineering",
  },
  {
    switchId: "KS-APPLIANCE-UPDATE",
    target: "appliance-update",
    displayName: "Appliance Update Channel Kill Switch",
    description:
      "Pauses OTA updates to physical SITA appliances and VMware images",
    impactLevel: "significant",
    affectedServices: ["appliance-update-service"],
    affectedTables: [],
    affectedEdgeFunctions: [],
    userFacingImpact:
      "Appliances remain on their current image. New patches are not delivered.",
    rollbackProcedure:
      "Disarm switch, validate update bundle signature, resume staged rollout",
    requiresDualApproval: true,
    cooldownMs: 300_000,
    runbookRef: "RB-008",
    defaultState: "disarmed",
    boundedContextId: "cloud-control-plane",
    enforcementLayers: ["appliance-update"],
    dependsOn: ["KS-RELEASE-ROLLOUT"],
    supersedes: [],
    ownerTeam: "release-engineering",
  },
  {
    switchId: "KS-SELF-HEALING",
    target: "self-healing",
    displayName: "Self-Healing Loop Kill Switch",
    description:
      "Disables autonomous self-repair, restart, and reconciliation routines",
    impactLevel: "moderate",
    affectedServices: ["self-healing-service", "platform-monitor"],
    affectedTables: [],
    affectedEdgeFunctions: ["self-healing-tick"],
    userFacingImpact:
      "Operators must manually intervene. No automatic restarts or reconciliation.",
    rollbackProcedure:
      "Disarm switch, verify healing service health, replay missed reconciliation cycles",
    requiresDualApproval: false,
    cooldownMs: 60_000,
    runbookRef: "RB-006",
    defaultState: "disarmed",
    boundedContextId: "runtime-kernel",
    enforcementLayers: ["self-healing"],
    dependsOn: [],
    supersedes: [],
    ownerTeam: "platform-runtime",
  },
  {
    switchId: "KS-PROVIDER-INGESTION",
    target: "provider-ingestion",
    displayName: "Provider Ingestion Kill Switch",
    description:
      "Freezes inbound webhooks and event ingestion from external provider families",
    impactLevel: "moderate",
    affectedServices: ["webhook-service", "ingestion-service"],
    affectedTables: ["connector_sync_runs"],
    affectedEdgeFunctions: ["connector-webhook"],
    userFacingImpact:
      "Provider webhooks are acknowledged but not processed; data freshness lags.",
    rollbackProcedure:
      "Disarm switch, replay buffered webhook events, reconcile provider state",
    requiresDualApproval: false,
    cooldownMs: 30_000,
    runbookRef: "RB-003",
    defaultState: "disarmed",
    boundedContextId: "integrations",
    enforcementLayers: ["connector"],
    dependsOn: ["KS-CONNECTORS"],
    supersedes: [],
    ownerTeam: "integrations-team",
  },
  {
    switchId: "KS-PAYMENTS-AUTH",
    target: "payments-auth",
    displayName: "Payment Authorization Kill Switch",
    description:
      "Blocks new payment authorization attempts (card auth, tokenization, 3DS) without halting refunds or settlement of already-authorized charges",
    impactLevel: "severe",
    affectedServices: ["payment-auth-service", "tokenization-service"],
    affectedTables: ["payments", "payment_authorizations"],
    affectedEdgeFunctions: ["payment-process", "payment-kill-switch"],
    userFacingImpact:
      "New card authorizations are refused. In-flight settlements and refunds continue normally.",
    rollbackProcedure:
      "Disarm switch, verify gateway 3DS connectivity, replay queued authorization attempts",
    requiresDualApproval: true,
    cooldownMs: 120_000,
    runbookRef: "RB-020",
    defaultState: "disarmed",
    boundedContextId: "finance-os",
    enforcementLayers: ["edge-function", "ui-gate"],
    dependsOn: [],
    supersedes: [],
    ownerTeam: "finance-team",
  },
  {
    switchId: "KS-PAYMENTS-SCA",
    target: "payment-sca",
    displayName: "Payment SCA/3DS Kill Switch",
    description:
      "Refuses new card-on-file authorizations and SCA/3DS challenges while leaving captures, refunds, and reconciliation untouched. Used during identity-provider or 3DS gateway incidents.",
    impactLevel: "severe",
    affectedServices: [
      "payment-auth-service",
      "tokenization-service",
      "sca-3ds-gateway",
    ],
    affectedTables: [
      "payment_authorizations",
      "payment_method_tokens",
      "sca_challenges",
    ],
    affectedEdgeFunctions: [
      "payment-process",
      "payment-kill-switch",
      "webauthn-challenge",
    ],
    userFacingImpact:
      "Customers cannot add new cards or pass step-up authentication. Existing tokenized payments + captures continue to clear.",
    rollbackProcedure:
      "Disarm switch, verify 3DS provider health probe, replay queued auth attempts via payment-process replay endpoint",
    requiresDualApproval: true,
    cooldownMs: 180_000,
    runbookRef: "RB-005-AUTH",
    defaultState: "disarmed",
    boundedContextId: "finance-os",
    enforcementLayers: ["edge-function", "ui-gate", "domain-service"],
    dependsOn: [],
    supersedes: [],
    ownerTeam: "finance-team",
  },
] as const;

// ── Query Functions ────────────────────────────────────────────

export function getKillSwitch(switchId: string): KillSwitchEntry | undefined {
  return KILL_SWITCH_REGISTRY.find((ks) => ks.switchId === switchId);
}

export function getKillSwitchByTarget(target: string): KillSwitchEntry | undefined {
  return KILL_SWITCH_REGISTRY.find((ks) => ks.target === target);
}

export function getDualApprovalSwitches(): readonly KillSwitchEntry[] {
  return KILL_SWITCH_REGISTRY.filter((ks) => ks.requiresDualApproval);
}

export function getSwitchesByImpact(level: ImpactLevel): readonly KillSwitchEntry[] {
  return KILL_SWITCH_REGISTRY.filter((ks) => ks.impactLevel === level);
}

export function getSwitchesAffectingService(
  serviceId: string,
): readonly KillSwitchEntry[] {
  return KILL_SWITCH_REGISTRY.filter((ks) =>
    ks.affectedServices.includes(serviceId),
  );
}

export function getSwitchesAffectingTable(table: string): readonly KillSwitchEntry[] {
  return KILL_SWITCH_REGISTRY.filter((ks) => ks.affectedTables.includes(table));
}

export function getSwitchesWithRunbook(): readonly KillSwitchEntry[] {
  return KILL_SWITCH_REGISTRY.filter((ks) => ks.runbookRef !== null);
}

export function getSwitchesByBoundedContext(
  contextId: string,
): readonly KillSwitchEntry[] {
  return KILL_SWITCH_REGISTRY.filter((ks) => ks.boundedContextId === contextId);
}

export function getSwitchesByOwner(team: string): readonly KillSwitchEntry[] {
  return KILL_SWITCH_REGISTRY.filter((ks) => ks.ownerTeam === team);
}

export function getImpactSummary(): Record<ImpactLevel, number> {
  const summary: Record<ImpactLevel, number> = {
    minimal: 0,
    moderate: 0,
    significant: 0,
    severe: 0,
    total: 0,
  };
  for (const ks of KILL_SWITCH_REGISTRY) summary[ks.impactLevel]++;
  return summary;
}
