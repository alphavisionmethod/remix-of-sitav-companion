// ═══════════════════════════════════════════════════════════════
// SITA OS — Kill Switch Drill Runner
// Executes and validates safety drill scenarios
// ═══════════════════════════════════════════════════════════════

export type DrillMode = "dry-run" | "live";

export interface KillSwitchDrillDefinition {
  switchId: string;
  displayName: string;
  description: string;
  scope: string;
  disables: string;
  blastRadius: "low" | "medium" | "high" | "critical";
  triggerMethod: "api" | "dashboard" | "cli";
  expectedEffect: string;
  rollbackPath: string;
  timeToDisableMs: number; // expected max
  successCriteria: string[];
  failureEscalation: string;
  authorizedRoles: string[];
}

export interface DrillResult {
  switchId: string;
  drillType: DrillMode;
  startedAt: string;
  completedAt: string | null;
  success: boolean;
  timeToDisableMs: number | null;
  failureNotes: string | null;
  rollbackVerified: boolean;
  operatorId: string;
}

export const KILL_SWITCH_DRILL_INVENTORY: readonly KillSwitchDrillDefinition[] = [
  {
    switchId: "KS-AI-ADVISORY",
    displayName: "AI Advisory Layer",
    description: "Disables all AI advisor invocations across all domains",
    scope: "ai-orchestration",
    disables: "All AI advisory chat, boardroom sessions, recommendation generation",
    blastRadius: "high",
    triggerMethod: "dashboard",
    expectedEffect: "AI features show graceful degradation message, no new invocations created",
    rollbackPath: "Re-enable switch; verify invocation pipeline resumes within 60s",
    timeToDisableMs: 5000,
    successCriteria: [
      "No new ai_invocations created after activation",
      "User sees degradation notice within 2s",
      "Existing sessions gracefully conclude",
    ],
    failureEscalation: "Page on-call platform engineer",
    authorizedRoles: ["admin", "operator"],
  },
  {
    switchId: "KS-WORKFLOW-AUTO",
    displayName: "Workflow Automation",
    description: "Pauses all automated workflow triggers and step execution",
    scope: "workflow-engine",
    disables: "Automated workflow triggers, scheduled steps, event-driven execution",
    blastRadius: "high",
    triggerMethod: "dashboard",
    expectedEffect: "No new workflow runs started, in-progress runs complete current step then pause",
    rollbackPath: "Re-enable; queued triggers execute in order",
    timeToDisableMs: 3000,
    successCriteria: [
      "No new workflow_runs created",
      "In-progress runs pause after current step",
      "Queue resumes cleanly on rollback",
    ],
    failureEscalation: "Page on-call platform engineer",
    authorizedRoles: ["admin"],
  },
  {
    switchId: "KS-OUTBOUND-MSG",
    displayName: "Outbound Messaging",
    description: "Stops all outbound emails, notifications, and campaign sends",
    scope: "campaigns-messaging",
    disables: "Email sends, push notifications, SMS, webhook outbound calls",
    blastRadius: "high",
    triggerMethod: "dashboard",
    expectedEffect: "Messages queued but not delivered; queue preserved for later flush",
    rollbackPath: "Re-enable; queue flushes automatically",
    timeToDisableMs: 2000,
    successCriteria: [
      "No outbound messages leave the system",
      "Queue grows but does not drop messages",
      "Delivery resumes on rollback",
    ],
    failureEscalation: "Page messaging on-call",
    authorizedRoles: ["admin"],
  },
  {
    switchId: "KS-INVESTOR-ACCESS",
    displayName: "Investor Access Lockdown",
    description: "Revokes all active investor/deal room access immediately",
    scope: "investor-dealroom",
    disables: "Deal room document access, investor portal, document downloads",
    blastRadius: "medium",
    triggerMethod: "dashboard",
    expectedEffect: "All deal room pages return 403, download links disabled",
    rollbackPath: "Re-enable; existing access grants restored from audit log",
    timeToDisableMs: 2000,
    successCriteria: [
      "All deal room routes return 403",
      "No document downloads possible",
      "Access grants preserved for restoration",
    ],
    failureEscalation: "Page investor relations + platform engineer",
    authorizedRoles: ["admin"],
  },
  {
    switchId: "KS-BUILD-DOWNLOAD",
    displayName: "Build/Download Suspension",
    description: "Suspends all build artifact downloads from launchpad",
    scope: "launchpad-build",
    disables: "ISO downloads, desktop app downloads, checksum verification endpoints",
    blastRadius: "medium",
    triggerMethod: "dashboard",
    expectedEffect: "Download buttons disabled, links return 503 with maintenance message",
    rollbackPath: "Re-enable; download links restore immediately",
    timeToDisableMs: 1000,
    successCriteria: [
      "Download endpoints return 503",
      "User sees maintenance message",
      "No partial downloads served",
    ],
    failureEscalation: "Page platform engineer",
    authorizedRoles: ["admin", "operator"],
  },
  {
    switchId: "KS-PUBLIC-CHAT",
    displayName: "Public Chat Disable",
    description: "Disables public-facing AI chat interface",
    scope: "ai-orchestration",
    disables: "Public chat widget, demo chat, unauthenticated AI interactions",
    blastRadius: "low",
    triggerMethod: "dashboard",
    expectedEffect: "Chat widget hidden or shows unavailable message",
    rollbackPath: "Re-enable; chat widget reappears on next page load",
    timeToDisableMs: 1000,
    successCriteria: [
      "Chat widget not rendered",
      "No public AI invocations accepted",
    ],
    failureEscalation: "Notify product team",
    authorizedRoles: ["admin", "operator"],
  },
  {
    switchId: "KS-THIRD-PARTY",
    displayName: "Third-Party Integration Disconnect",
    description: "Disables all third-party API integrations (OAuth, webhooks, connectors)",
    scope: "platform-integrations",
    disables: "OAuth provider calls, outbound webhooks, connector sync, third-party API calls",
    blastRadius: "high",
    triggerMethod: "dashboard",
    expectedEffect: "All external API calls blocked, connectors show disconnected state",
    rollbackPath: "Re-enable; connectors re-authenticate on next sync cycle",
    timeToDisableMs: 3000,
    successCriteria: [
      "No outbound third-party API calls",
      "Connectors show disconnected state",
      "Re-auth triggers on rollback",
    ],
    failureEscalation: "Page platform engineer + integration owner",
    authorizedRoles: ["admin"],
  },
  {
    switchId: "KS-CROWDFUND",
    displayName: "Payment/Crowdfund Freeze",
    description: "Freezes all payment processing and crowdfund pledge acceptance",
    scope: "donor-crowdfund",
    disables: "New pledge acceptance, payment processing, refund processing",
    blastRadius: "critical",
    triggerMethod: "dashboard",
    expectedEffect: "Payment forms disabled, pledge buttons show paused, no charges processed",
    rollbackPath: "Re-enable; pending pledges re-enter queue",
    timeToDisableMs: 2000,
    successCriteria: [
      "No payment charges processed",
      "Pledge forms show paused state",
      "Pending queue preserved",
    ],
    failureEscalation: "Page finance lead + platform engineer immediately",
    authorizedRoles: ["admin"],
  },
] as const;

export function getDrillDefinition(switchId: string): KillSwitchDrillDefinition | undefined {
  return KILL_SWITCH_DRILL_INVENTORY.find((d) => d.switchId === switchId);
}

export function simulateDryRunDrill(switchId: string, operatorId: string): DrillResult {
  const def = getDrillDefinition(switchId);
  if (!def) throw new Error(`Unknown switch: ${switchId}`);
  const start = new Date();
  // Simulate drill timing (dry-run always succeeds with simulated timing)
  const simulatedTime = Math.round(def.timeToDisableMs * (0.5 + Math.random() * 0.8));
  return {
    switchId,
    drillType: "dry-run",
    startedAt: start.toISOString(),
    completedAt: new Date(start.getTime() + simulatedTime).toISOString(),
    success: true,
    timeToDisableMs: simulatedTime,
    failureNotes: null,
    rollbackVerified: true,
    operatorId,
  };
}