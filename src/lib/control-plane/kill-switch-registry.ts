// ═══════════════════════════════════════════════════════════════
// SITA OS — Kill Switch Registry
// 10 subsystem kill switches with impact, rollback, escalation
// ═══════════════════════════════════════════════════════════════

export type KillSwitchState = "active" | "armed" | "disarmed" | "testing";
export type ImpactLevel = "minimal" | "moderate" | "significant" | "severe" | "total";

export interface KillSwitchEntry {
  readonly switchId: string;
  readonly target: string;
  readonly displayName: string;
  readonly description: string;
  readonly impactLevel: ImpactLevel;
  readonly affectedServices: readonly string[];
  readonly affectedTables: readonly string[];
  readonly affectedEdgeFunctions: readonly string[];
  readonly userFacingImpact: string;
  readonly rollbackProcedure: string;
  readonly requiresDualApproval: boolean;
  readonly cooldownMs: number;
  readonly runbookRef: string | null;
  readonly defaultState: KillSwitchState;
}

export const KILL_SWITCH_REGISTRY: readonly KillSwitchEntry[] = [
  {
    switchId: "KS-ADVISORS", target: "advisors", displayName: "Advisor Council Kill Switch",
    description: "Disables all advisor agents, recommendation generation, and autonomous actions",
    impactLevel: "significant", affectedServices: ["advisor-orchestrator", "advisor-memory-service", "advisor-action-engine"],
    affectedTables: ["advisor_agents", "advisor_board_actions", "advisor_board_recommendations", "advisor_action_queue"],
    affectedEdgeFunctions: ["advisor-chat", "advisor-orchestrate", "advisor-reflect"],
    userFacingImpact: "No AI advisor recommendations or autonomous actions. Manual operation only.",
    rollbackProcedure: "Disarm switch, verify advisor_agents.is_active flags, restart advisor-orchestrator",
    requiresDualApproval: false, cooldownMs: 60000, runbookRef: "RB-010", defaultState: "disarmed"
  },
  {
    switchId: "KS-OUTBOUND", target: "outbound-comms", displayName: "Outbound Communications Kill Switch",
    description: "Blocks all outbound emails, SMS, and push notifications",
    impactLevel: "moderate", affectedServices: ["communication-service", "push-service"],
    affectedTables: ["notification_delivery_receipts"],
    affectedEdgeFunctions: ["send-notification", "send-email"],
    userFacingImpact: "No emails, SMS, or push sent. Queued messages held until re-enabled.",
    rollbackProcedure: "Disarm switch, flush notification queue, verify delivery pipeline",
    requiresDualApproval: false, cooldownMs: 30000, runbookRef: null, defaultState: "disarmed"
  },
  {
    switchId: "KS-CONNECTORS", target: "connectors", displayName: "Connector Integration Kill Switch",
    description: "Disables all external integrations and OAuth connector operations",
    impactLevel: "moderate", affectedServices: ["connector-service", "webhook-service"],
    affectedTables: ["connector_oauth_flows", "connector_sync_runs"],
    affectedEdgeFunctions: ["connector-auth-callback", "connector-sync", "connector-webhook"],
    userFacingImpact: "No data sync with external CRMs, calendars, or tools. Existing data preserved.",
    rollbackProcedure: "Disarm switch, re-authenticate expired OAuth tokens, trigger catch-up sync",
    requiresDualApproval: false, cooldownMs: 30000, runbookRef: null, defaultState: "disarmed"
  },
  {
    switchId: "KS-SYNC", target: "sync", displayName: "Data Sync Kill Switch",
    description: "Halts all bi-directional data synchronization",
    impactLevel: "moderate", affectedServices: ["sync-service"],
    affectedTables: ["connector_sync_runs"],
    affectedEdgeFunctions: ["connector-sync"],
    userFacingImpact: "Data may become stale. No new external data pulled or pushed.",
    rollbackProcedure: "Disarm switch, run reconciliation sync, verify data freshness",
    requiresDualApproval: false, cooldownMs: 30000, runbookRef: "RB-003", defaultState: "disarmed"
  },
  {
    switchId: "KS-PAYMENTS", target: "payments", displayName: "Payment Processing Kill Switch",
    description: "Disables all payment processing, invoice generation, and financial transactions",
    impactLevel: "severe", affectedServices: ["finance-engine", "invoice-service"],
    affectedTables: ["invoices", "payments", "financial_transactions"],
    affectedEdgeFunctions: ["process-payment", "generate-invoice"],
    userFacingImpact: "No invoices generated or payments processed. Financial data read-only.",
    rollbackProcedure: "Disarm switch, verify payment gateway connectivity, reconcile pending transactions",
    requiresDualApproval: true, cooldownMs: 120000, runbookRef: null, defaultState: "disarmed"
  },
  {
    switchId: "KS-MOBILE-PUSH", target: "mobile-push", displayName: "Mobile Push Kill Switch",
    description: "Disables VAPID web push and mobile push notification delivery",
    impactLevel: "minimal", affectedServices: ["push-service"],
    affectedTables: ["push_subscriptions"],
    affectedEdgeFunctions: ["send-push-notification"],
    userFacingImpact: "No push notifications on mobile or desktop. In-app notifications still work.",
    rollbackProcedure: "Disarm switch, verify VAPID key, test push delivery",
    requiresDualApproval: false, cooldownMs: 15000, runbookRef: "RB-007", defaultState: "disarmed"
  },
  {
    switchId: "KS-MODEL-PROVIDERS", target: "model-providers", displayName: "AI Model Provider Kill Switch",
    description: "Disables all external AI model API calls (OpenAI, Google, etc.)",
    impactLevel: "significant", affectedServices: ["ai-gateway", "ai-budget-service", "epistemic-firewall", "prompt-orchestrator"],
    affectedTables: ["ai_inference_receipts", "ai_workforce_invocations"],
    affectedEdgeFunctions: ["ai-gateway", "invoke-ai-capability"],
    userFacingImpact: "No AI-powered features. Cached outputs may still be served. Manual mode only.",
    rollbackProcedure: "Disarm switch, verify API key validity, test model connectivity, restart ai-gateway",
    requiresDualApproval: true, cooldownMs: 60000, runbookRef: "RB-010", defaultState: "disarmed"
  },
  {
    switchId: "KS-WORKFLOW", target: "workflow", displayName: "Workflow Engine Kill Switch",
    description: "Halts all automated workflow execution and state transitions",
    impactLevel: "moderate", affectedServices: ["advisor-action-engine"],
    affectedTables: ["advisor_board_actions", "advisor_board_tool_executions"],
    affectedEdgeFunctions: ["execute-workflow", "workflow-step"],
    userFacingImpact: "Automated workflows paused. Manual action required for pending approvals.",
    rollbackProcedure: "Disarm switch, resume pending workflows, verify state consistency",
    requiresDualApproval: false, cooldownMs: 30000, runbookRef: "RB-004", defaultState: "disarmed"
  },
  {
    switchId: "KS-SIMULATIONS", target: "simulations", displayName: "Simulation Engine Kill Switch",
    description: "Disables all scenario simulations and what-if analyses",
    impactLevel: "minimal", affectedServices: ["boardroom-service"],
    affectedTables: ["boardroom_sessions", "boardroom_recommendations"],
    affectedEdgeFunctions: ["run-simulation", "scenario-analysis"],
    userFacingImpact: "No new simulations can be run. Historical results still viewable.",
    rollbackProcedure: "Disarm switch, verify simulation engine state",
    requiresDualApproval: false, cooldownMs: 15000, runbookRef: null, defaultState: "disarmed"
  },
  {
    switchId: "KS-AUTOMATIONS", target: "automations", displayName: "Automation Engine Kill Switch",
    description: "Disables all scheduled automations, triggers, and recurring tasks",
    impactLevel: "moderate", affectedServices: ["advisor-orchestrator", "concierge-orchestrator"],
    affectedTables: ["advisor_autonomy_policies"],
    affectedEdgeFunctions: ["run-automation", "scheduled-task"],
    userFacingImpact: "No automated tasks fire. All recurring work paused until re-enabled.",
    rollbackProcedure: "Disarm switch, reschedule missed automations, verify cron state",
    requiresDualApproval: false, cooldownMs: 30000, runbookRef: null, defaultState: "disarmed"
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

export function getSwitchesAffectingService(serviceId: string): readonly KillSwitchEntry[] {
  return KILL_SWITCH_REGISTRY.filter((ks) => ks.affectedServices.includes(serviceId));
}

export function getSwitchesAffectingTable(table: string): readonly KillSwitchEntry[] {
  return KILL_SWITCH_REGISTRY.filter((ks) => ks.affectedTables.includes(table));
}

export function getSwitchesWithRunbook(): readonly KillSwitchEntry[] {
  return KILL_SWITCH_REGISTRY.filter((ks) => ks.runbookRef !== null);
}

export function getImpactSummary(): Record<ImpactLevel, number> {
  const summary: Record<ImpactLevel, number> = { minimal: 0, moderate: 0, significant: 0, severe: 0, total: 0 };
  for (const ks of KILL_SWITCH_REGISTRY) summary[ks.impactLevel]++;
  return summary;
}
