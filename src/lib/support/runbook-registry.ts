// ═══════════════════════════════════════════════════════════════
// SITA OS — Runbook Registry
// 10 operational runbooks with steps, escalation, and evidence
// ═══════════════════════════════════════════════════════════════

export type RunbookSeverity = "low" | "medium" | "high" | "critical";
export type RunbookStatus = "draft" | "reviewed" | "approved" | "tested";

export interface RunbookStep {
  readonly order: number;
  readonly action: string;
  readonly command: string | null;
  readonly expectedOutcome: string;
  readonly rollbackAction: string | null;
  readonly timeoutMs: number;
}

export interface RunbookEntry {
  readonly runbookId: string;
  readonly title: string;
  readonly description: string;
  readonly severity: RunbookSeverity;
  readonly status: RunbookStatus;
  readonly triggerCondition: string;
  readonly affectedServices: readonly string[];
  readonly killSwitchRef: string | null;
  readonly messageCodeRef: string | null;
  readonly steps: readonly RunbookStep[];
  readonly escalationTarget: string;
  readonly estimatedResolutionMs: number;
  readonly lastTestedAt: string | null;
  readonly owner: string;
}

export const RUNBOOK_REGISTRY: readonly RunbookEntry[] = [
  {
    runbookId: "RB-001", title: "Auth Outage Recovery", description: "Recover from Supabase auth service degradation or outage",
    severity: "critical", status: "reviewed", triggerCondition: "Auth service health check fails 3+ consecutive times",
    affectedServices: ["auth-service"], killSwitchRef: null, messageCodeRef: "CRASH-001",
    steps: [
      { order: 1, action: "Verify Supabase status page", command: null, expectedOutcome: "Confirm external outage vs local issue", rollbackAction: null, timeoutMs: 60000 },
      { order: 2, action: "Enable offline auth cache mode", command: null, expectedOutcome: "Users with cached sessions can continue", rollbackAction: "Disable offline cache", timeoutMs: 30000 },
      { order: 3, action: "Notify active users via in-app banner", command: null, expectedOutcome: "Users aware of degraded state", rollbackAction: null, timeoutMs: 30000 },
      { order: 4, action: "Monitor for service restoration", command: null, expectedOutcome: "Auth service returns healthy", rollbackAction: null, timeoutMs: 600000 },
      { order: 5, action: "Flush expired sessions and re-validate", command: null, expectedOutcome: "All sessions re-authenticated", rollbackAction: null, timeoutMs: 120000 },
    ],
    escalationTarget: "admin", estimatedResolutionMs: 900000, lastTestedAt: null, owner: "platform"
  },
  {
    runbookId: "RB-002", title: "AI Provider Outage", description: "Handle degradation or outage of AI model provider APIs",
    severity: "high", status: "reviewed", triggerCondition: "AI Gateway returns 3+ consecutive errors from same provider",
    affectedServices: ["ai-gateway", "ai-budget-service", "epistemic-firewall"], killSwitchRef: "KS-MODEL-PROVIDERS", messageCodeRef: "AI-003",
    steps: [
      { order: 1, action: "Activate fallback model chain", command: null, expectedOutcome: "Traffic routes to secondary provider", rollbackAction: "Restore primary provider", timeoutMs: 30000 },
      { order: 2, action: "Enable cached output serving", command: null, expectedOutcome: "Recent identical queries served from cache", rollbackAction: "Disable cache serving", timeoutMs: 15000 },
      { order: 3, action: "Reduce AI budget posture to conservative", command: null, expectedOutcome: "Only critical AI calls processed", rollbackAction: "Restore normal posture", timeoutMs: 15000 },
      { order: 4, action: "If total outage: activate model-providers kill switch", command: null, expectedOutcome: "All AI calls halted gracefully", rollbackAction: "Disarm kill switch", timeoutMs: 30000 },
      { order: 5, action: "Monitor provider status, test connectivity", command: null, expectedOutcome: "Provider restored", rollbackAction: null, timeoutMs: 600000 },
    ],
    escalationTarget: "admin", estimatedResolutionMs: 600000, lastTestedAt: null, owner: "ai"
  },
  {
    runbookId: "RB-003", title: "Sync Lag Recovery", description: "Resolve excessive sync lag with external integrations",
    severity: "medium", status: "reviewed", triggerCondition: "Sync lag exceeds 5 minutes for any active connector",
    affectedServices: ["sync-service", "connector-service"], killSwitchRef: "KS-SYNC", messageCodeRef: "SYNC-001",
    steps: [
      { order: 1, action: "Identify lagging connector(s)", command: null, expectedOutcome: "Specific connector identified", rollbackAction: null, timeoutMs: 60000 },
      { order: 2, action: "Check connector OAuth token validity", command: null, expectedOutcome: "Token valid or refreshed", rollbackAction: null, timeoutMs: 30000 },
      { order: 3, action: "Trigger manual catch-up sync", command: null, expectedOutcome: "Sync gap reduced", rollbackAction: "Cancel sync", timeoutMs: 300000 },
      { order: 4, action: "If persistent: pause connector, notify user", command: null, expectedOutcome: "User aware, connector paused", rollbackAction: "Resume connector", timeoutMs: 60000 },
    ],
    escalationTarget: "operator", estimatedResolutionMs: 600000, lastTestedAt: null, owner: "integration"
  },
  {
    runbookId: "RB-004", title: "Stuck Workflow Recovery", description: "Recover workflows stuck in intermediate states",
    severity: "medium", status: "reviewed", triggerCondition: "Workflow in non-terminal state for >30 minutes",
    affectedServices: ["advisor-action-engine"], killSwitchRef: "KS-WORKFLOW", messageCodeRef: "WF-001",
    steps: [
      { order: 1, action: "Identify stuck workflow and current state", command: null, expectedOutcome: "State and blocking condition identified", rollbackAction: null, timeoutMs: 60000 },
      { order: 2, action: "Check for pending approvals", command: null, expectedOutcome: "Approval status confirmed", rollbackAction: null, timeoutMs: 30000 },
      { order: 3, action: "Attempt state transition retry", command: null, expectedOutcome: "Workflow progresses", rollbackAction: "Revert to previous state", timeoutMs: 60000 },
      { order: 4, action: "If stuck: force-complete or force-fail with audit entry", command: null, expectedOutcome: "Workflow in terminal state", rollbackAction: null, timeoutMs: 30000 },
    ],
    escalationTarget: "operator", estimatedResolutionMs: 300000, lastTestedAt: null, owner: "ai"
  },
  {
    runbookId: "RB-005", title: "Proof Mismatch Resolution", description: "Handle mismatched or missing proof receipts",
    severity: "high", status: "reviewed", triggerCondition: "Launch readiness engine detects proof count mismatch",
    affectedServices: ["audit-service", "ai-receipt-service"], killSwitchRef: null, messageCodeRef: "POL-001",
    steps: [
      { order: 1, action: "Identify which proof type is mismatched", command: null, expectedOutcome: "Specific table/count gap identified", rollbackAction: null, timeoutMs: 60000 },
      { order: 2, action: "Verify if gap is real vs timing issue", command: null, expectedOutcome: "Root cause determined", rollbackAction: null, timeoutMs: 120000 },
      { order: 3, action: "Backfill missing receipts if data exists", command: null, expectedOutcome: "Receipt count matches", rollbackAction: "Remove backfilled entries", timeoutMs: 300000 },
      { order: 4, action: "Update launch readiness score", command: null, expectedOutcome: "Score reflects current reality", rollbackAction: null, timeoutMs: 30000 },
    ],
    escalationTarget: "admin", estimatedResolutionMs: 600000, lastTestedAt: null, owner: "platform"
  },
  {
    runbookId: "RB-006", title: "Architecture Drift Detection", description: "Respond to detected architecture boundary violations",
    severity: "medium", status: "reviewed", triggerCondition: "CI boundary check reports illegal imports",
    affectedServices: ["health-monitor"], killSwitchRef: null, messageCodeRef: "POL-002",
    steps: [
      { order: 1, action: "Review CI output for specific violations", command: null, expectedOutcome: "Violation files and imports identified", rollbackAction: null, timeoutMs: 60000 },
      { order: 2, action: "Classify: accidental vs structural drift", command: null, expectedOutcome: "Category determined", rollbackAction: null, timeoutMs: 120000 },
      { order: 3, action: "Fix imports via proxy/shim layer", command: null, expectedOutcome: "Boundary violations resolved", rollbackAction: "Revert changes", timeoutMs: 600000 },
      { order: 4, action: "Update service ownership manifest", command: null, expectedOutcome: "Manifest reflects current state", rollbackAction: null, timeoutMs: 60000 },
    ],
    escalationTarget: "operator", estimatedResolutionMs: 1800000, lastTestedAt: null, owner: "platform"
  },
  {
    runbookId: "RB-007", title: "Push Notification Failure", description: "Diagnose and recover push notification delivery failures",
    severity: "low", status: "reviewed", triggerCondition: "Push delivery error rate exceeds 10%",
    affectedServices: ["push-service"], killSwitchRef: "KS-MOBILE-PUSH", messageCodeRef: "NET-001",
    steps: [
      { order: 1, action: "Check VAPID key validity", command: null, expectedOutcome: "Key valid or identified as expired", rollbackAction: null, timeoutMs: 30000 },
      { order: 2, action: "Verify push subscription freshness", command: null, expectedOutcome: "Stale subscriptions identified", rollbackAction: null, timeoutMs: 60000 },
      { order: 3, action: "Purge expired subscriptions", command: null, expectedOutcome: "Only valid subscriptions remain", rollbackAction: null, timeoutMs: 60000 },
      { order: 4, action: "Test push delivery to verified device", command: null, expectedOutcome: "Push delivered successfully", rollbackAction: null, timeoutMs: 30000 },
    ],
    escalationTarget: "operator", estimatedResolutionMs: 300000, lastTestedAt: null, owner: "integration"
  },
  {
    runbookId: "RB-008", title: "VMware/Desktop Boot Failure", description: "Handle Electron/desktop app boot failures",
    severity: "low", status: "draft", triggerCondition: "Desktop app fails to initialize within 30 seconds",
    affectedServices: ["config-service"], killSwitchRef: null, messageCodeRef: "BOOT-003",
    steps: [
      { order: 1, action: "Check Electron main process logs", command: null, expectedOutcome: "Error identified", rollbackAction: null, timeoutMs: 60000 },
      { order: 2, action: "Verify local storage and config integrity", command: null, expectedOutcome: "Config valid or rebuilt", rollbackAction: null, timeoutMs: 60000 },
      { order: 3, action: "Clear app cache and restart", command: null, expectedOutcome: "App boots successfully", rollbackAction: null, timeoutMs: 60000 },
      { order: 4, action: "If persistent: reinstall from latest release", command: null, expectedOutcome: "Fresh install works", rollbackAction: null, timeoutMs: 600000 },
    ],
    escalationTarget: "operator", estimatedResolutionMs: 900000, lastTestedAt: null, owner: "platform"
  },
  {
    runbookId: "RB-009", title: "Emergency Rollback", description: "Roll back a bad deployment or configuration change",
    severity: "critical", status: "reviewed", triggerCondition: "Critical errors spike post-deployment",
    affectedServices: ["health-monitor", "config-service"], killSwitchRef: null, messageCodeRef: "CRASH-001",
    steps: [
      { order: 1, action: "Confirm error spike is deployment-related", command: null, expectedOutcome: "Correlation with deploy timestamp confirmed", rollbackAction: null, timeoutMs: 60000 },
      { order: 2, action: "Trigger deployment rollback to previous version", command: null, expectedOutcome: "Previous version serving traffic", rollbackAction: null, timeoutMs: 120000 },
      { order: 3, action: "Verify rollback success via health checks", command: null, expectedOutcome: "All health checks green", rollbackAction: null, timeoutMs: 60000 },
      { order: 4, action: "Create incident report with root cause", command: null, expectedOutcome: "Incident documented", rollbackAction: null, timeoutMs: 300000 },
    ],
    escalationTarget: "admin", estimatedResolutionMs: 600000, lastTestedAt: null, owner: "platform"
  },
  {
    runbookId: "RB-010", title: "AI Degradation Response", description: "Manage graceful degradation when AI capabilities are reduced",
    severity: "high", status: "reviewed", triggerCondition: "AI quality scores drop below threshold or budget exhausted",
    affectedServices: ["ai-gateway", "advisor-orchestrator", "epistemic-firewall"], killSwitchRef: "KS-MODEL-PROVIDERS", messageCodeRef: "AI-002",
    steps: [
      { order: 1, action: "Assess degradation scope (single model vs all)", command: null, expectedOutcome: "Scope determined", rollbackAction: null, timeoutMs: 30000 },
      { order: 2, action: "Switch to degraded-mode UI indicators", command: null, expectedOutcome: "Users see degraded badges on AI features", rollbackAction: "Remove badges", timeoutMs: 15000 },
      { order: 3, action: "Reduce advisor autonomy to 0 (approval-only)", command: null, expectedOutcome: "No autonomous actions until restored", rollbackAction: "Restore autonomy levels", timeoutMs: 15000 },
      { order: 4, action: "Serve cached recommendations where available", command: null, expectedOutcome: "Stale but useful outputs served", rollbackAction: "Stop cache serving", timeoutMs: 15000 },
      { order: 5, action: "Monitor for restoration, gradually increase autonomy", command: null, expectedOutcome: "Full AI capability restored", rollbackAction: null, timeoutMs: 600000 },
    ],
    escalationTarget: "admin", estimatedResolutionMs: 900000, lastTestedAt: null, owner: "ai"
  },
] as const;

// ── Query Functions ────────────────────────────────────────────

export function getRunbook(id: string): RunbookEntry | undefined {
  return RUNBOOK_REGISTRY.find((r) => r.runbookId === id);
}

export function getRunbooksBySeverity(severity: RunbookSeverity): readonly RunbookEntry[] {
  return RUNBOOK_REGISTRY.filter((r) => r.severity === severity);
}

export function getRunbooksForService(serviceId: string): readonly RunbookEntry[] {
  return RUNBOOK_REGISTRY.filter((r) => r.affectedServices.includes(serviceId));
}

export function getRunbooksWithKillSwitch(): readonly RunbookEntry[] {
  return RUNBOOK_REGISTRY.filter((r) => r.killSwitchRef !== null);
}

export function getRunbooksByOwner(owner: string): readonly RunbookEntry[] {
  return RUNBOOK_REGISTRY.filter((r) => r.owner === owner);
}

export function getUntestedRunbooks(): readonly RunbookEntry[] {
  return RUNBOOK_REGISTRY.filter((r) => r.lastTestedAt === null);
}

export function getRunbooksByStatus(status: RunbookStatus): readonly RunbookEntry[] {
  return RUNBOOK_REGISTRY.filter((r) => r.status === status);
}
