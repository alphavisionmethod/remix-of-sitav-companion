// ═══════════════════════════════════════════════════════════════
// SITA OS — Runbook Registry
// 19 operational runbooks with steps, escalation, evidence,
// bounded-context cross-links, subsystem classification, and
// pointers to per-subsystem markdown files.
// ═══════════════════════════════════════════════════════════════

import type { RunbookEntry, RunbookSeverity, RunbookStatus, RunbookStep } from "./runbook-types";

// Re-export so existing `from "./runbook-registry"` imports keep working.
export type { RunbookEntry, RunbookSeverity, RunbookStatus, RunbookStep } from "./runbook-types";

export const RUNBOOK_REGISTRY: readonly RunbookEntry[] = [
  // ═══ RB-001 — Auth Outage ═══
  {
    runbookId: "RB-001", title: "Auth Outage Recovery",
    description: "Recover from auth service degradation or outage",
    severity: "critical", status: "reviewed",
    triggerCondition: "Auth service health check fails 3+ consecutive times",
    affectedServices: ["auth-service"], killSwitchRef: null, messageCodeRef: "CRASH-001",
    steps: [
      { order: 1, action: "Verify upstream auth provider status", command: null, expectedOutcome: "Confirm external outage vs local issue", rollbackAction: null, timeoutMs: 60_000 },
      { order: 2, action: "Enable offline auth cache mode", command: null, expectedOutcome: "Users with cached sessions can continue", rollbackAction: "Disable offline cache", timeoutMs: 30_000 },
      { order: 3, action: "Notify active users via in-app banner", command: null, expectedOutcome: "Users aware of degraded state", rollbackAction: null, timeoutMs: 30_000 },
      { order: 4, action: "Monitor for service restoration", command: null, expectedOutcome: "Auth service returns healthy", rollbackAction: null, timeoutMs: 600_000 },
      { order: 5, action: "Flush expired sessions and re-validate", command: null, expectedOutcome: "All sessions re-authenticated", rollbackAction: null, timeoutMs: 120_000 },
    ],
    escalationTarget: "admin", estimatedResolutionMs: 900_000, lastTestedAt: null, owner: "platform",
    boundedContextId: "setup-identity", subsystem: "auth", markdownRef: "docs/runbooks/auth-outage.md",
  },

  // ═══ RB-002 — AI Provider Outage ═══
  {
    runbookId: "RB-002", title: "AI Provider Outage",
    description: "Handle degradation or outage of AI model provider APIs",
    severity: "high", status: "reviewed",
    triggerCondition: "AI Gateway returns 3+ consecutive errors from same provider",
    affectedServices: ["ai-gateway", "ai-budget-service", "epistemic-firewall"],
    killSwitchRef: "KS-MODEL-PROVIDERS", messageCodeRef: "AI-003",
    steps: [
      { order: 1, action: "Activate fallback model chain", command: null, expectedOutcome: "Traffic routes to secondary provider", rollbackAction: "Restore primary provider", timeoutMs: 30_000 },
      { order: 2, action: "Enable cached output serving", command: null, expectedOutcome: "Recent identical queries served from cache", rollbackAction: "Disable cache serving", timeoutMs: 15_000 },
      { order: 3, action: "Reduce AI budget posture to conservative", command: null, expectedOutcome: "Only critical AI calls processed", rollbackAction: "Restore normal posture", timeoutMs: 15_000 },
      { order: 4, action: "If total outage: activate model-providers kill switch", command: null, expectedOutcome: "All AI calls halted gracefully", rollbackAction: "Disarm kill switch", timeoutMs: 30_000 },
      { order: 5, action: "Monitor provider status, test connectivity", command: null, expectedOutcome: "Provider restored", rollbackAction: null, timeoutMs: 600_000 },
    ],
    escalationTarget: "admin", estimatedResolutionMs: 600_000, lastTestedAt: null, owner: "ai",
    boundedContextId: "runtime-kernel", subsystem: "ai-providers", markdownRef: "docs/runbooks/provider-outage.md",
  },

  // ═══ RB-003 — Sync Lag ═══
  {
    runbookId: "RB-003", title: "Sync Lag Recovery",
    description: "Resolve excessive sync lag with external integrations",
    severity: "medium", status: "reviewed",
    triggerCondition: "Sync lag exceeds 5 minutes for any active connector",
    affectedServices: ["sync-service", "connector-service"],
    killSwitchRef: "KS-SYNC", messageCodeRef: "SYNC-001",
    steps: [
      { order: 1, action: "Identify lagging connector(s)", command: null, expectedOutcome: "Specific connector identified", rollbackAction: null, timeoutMs: 60_000 },
      { order: 2, action: "Check connector OAuth token validity", command: null, expectedOutcome: "Token valid or refreshed", rollbackAction: null, timeoutMs: 30_000 },
      { order: 3, action: "Trigger manual catch-up sync", command: null, expectedOutcome: "Sync gap reduced", rollbackAction: "Cancel sync", timeoutMs: 300_000 },
      { order: 4, action: "If persistent: pause connector, notify user", command: null, expectedOutcome: "User aware, connector paused", rollbackAction: "Resume connector", timeoutMs: 60_000 },
    ],
    escalationTarget: "operator", estimatedResolutionMs: 600_000, lastTestedAt: null, owner: "integration",
    boundedContextId: "integrations", subsystem: "sync", markdownRef: "docs/runbooks/sync-lag.md",
  },

  // ═══ RB-004 — Stuck Workflow ═══
  {
    runbookId: "RB-004", title: "Stuck Workflow Recovery",
    description: "Recover workflows stuck in intermediate states",
    severity: "medium", status: "reviewed",
    triggerCondition: "Workflow in non-terminal state for >30 minutes",
    affectedServices: ["advisor-action-engine"],
    killSwitchRef: "KS-WORKFLOW", messageCodeRef: "WF-001",
    steps: [
      { order: 1, action: "Identify stuck workflow and current state", command: null, expectedOutcome: "State and blocking condition identified", rollbackAction: null, timeoutMs: 60_000 },
      { order: 2, action: "Check for pending approvals", command: null, expectedOutcome: "Approval status confirmed", rollbackAction: null, timeoutMs: 30_000 },
      { order: 3, action: "Attempt state transition retry", command: null, expectedOutcome: "Workflow progresses", rollbackAction: "Revert to previous state", timeoutMs: 60_000 },
      { order: 4, action: "If stuck: force-complete or force-fail with audit entry", command: null, expectedOutcome: "Workflow in terminal state", rollbackAction: null, timeoutMs: 30_000 },
    ],
    escalationTarget: "operator", estimatedResolutionMs: 300_000, lastTestedAt: null, owner: "ai",
    boundedContextId: "runtime-kernel", subsystem: "workflow", markdownRef: "docs/runbooks/stuck-workflow.md",
  },

  // ═══ RB-005 — Proof Mismatch ═══
  {
    runbookId: "RB-005", title: "Proof Mismatch Resolution",
    description: "Handle mismatched or missing proof receipts",
    severity: "high", status: "reviewed",
    triggerCondition: "Launch readiness engine detects proof count mismatch",
    affectedServices: ["audit-service", "ai-receipt-service"],
    killSwitchRef: null, messageCodeRef: "POL-001",
    steps: [
      { order: 1, action: "Identify which proof type is mismatched", command: null, expectedOutcome: "Specific table/count gap identified", rollbackAction: null, timeoutMs: 60_000 },
      { order: 2, action: "Verify if gap is real vs timing issue", command: null, expectedOutcome: "Root cause determined", rollbackAction: null, timeoutMs: 120_000 },
      { order: 3, action: "Backfill missing receipts if data exists", command: null, expectedOutcome: "Receipt count matches", rollbackAction: "Remove backfilled entries", timeoutMs: 300_000 },
      { order: 4, action: "Update launch readiness score", command: null, expectedOutcome: "Score reflects current reality", rollbackAction: null, timeoutMs: 30_000 },
    ],
    escalationTarget: "admin", estimatedResolutionMs: 600_000, lastTestedAt: null, owner: "platform",
    boundedContextId: "proof-trust", subsystem: "proof", markdownRef: "docs/runbooks/proof-mismatch.md",
  },

  // ═══ RB-006 — Architecture/Manifest Drift ═══
  {
    runbookId: "RB-006", title: "Generated vs Runtime Drift",
    description: "Respond to detected manifest or architecture boundary drift",
    severity: "medium", status: "reviewed",
    triggerCondition: "CI boundary check or manifest drift gate reports violations",
    affectedServices: ["health-monitor"], killSwitchRef: null, messageCodeRef: "POL-002",
    steps: [
      { order: 1, action: "Review CI output for specific violations", command: null, expectedOutcome: "Violation files and imports identified", rollbackAction: null, timeoutMs: 60_000 },
      { order: 2, action: "Classify: accidental vs structural drift", command: null, expectedOutcome: "Category determined", rollbackAction: null, timeoutMs: 120_000 },
      { order: 3, action: "Fix imports via proxy/shim layer or re-generate manifests", command: null, expectedOutcome: "Boundary violations resolved", rollbackAction: "Revert changes", timeoutMs: 600_000 },
      { order: 4, action: "Update service ownership manifest", command: null, expectedOutcome: "Manifest reflects current state", rollbackAction: null, timeoutMs: 60_000 },
    ],
    escalationTarget: "operator", estimatedResolutionMs: 1_800_000, lastTestedAt: null, owner: "platform",
    boundedContextId: "cloud-control-plane", subsystem: "manifest-drift", markdownRef: "docs/runbooks/generated-vs-runtime-drift.md",
  },

  // ═══ RB-007 — Push Failure ═══
  {
    runbookId: "RB-007", title: "Push Notification Failure",
    description: "Diagnose and recover push notification delivery failures",
    severity: "low", status: "reviewed",
    triggerCondition: "Push delivery error rate exceeds 10%",
    affectedServices: ["push-service"],
    killSwitchRef: "KS-MOBILE-PUSH", messageCodeRef: "NET-001",
    steps: [
      { order: 1, action: "Check VAPID key validity", command: null, expectedOutcome: "Key valid or identified as expired", rollbackAction: null, timeoutMs: 30_000 },
      { order: 2, action: "Verify push subscription freshness", command: null, expectedOutcome: "Stale subscriptions identified", rollbackAction: null, timeoutMs: 60_000 },
      { order: 3, action: "Purge expired subscriptions", command: null, expectedOutcome: "Only valid subscriptions remain", rollbackAction: null, timeoutMs: 60_000 },
      { order: 4, action: "Test push delivery to verified device", command: null, expectedOutcome: "Push delivered successfully", rollbackAction: null, timeoutMs: 30_000 },
    ],
    escalationTarget: "operator", estimatedResolutionMs: 300_000, lastTestedAt: null, owner: "integration",
    boundedContextId: "integrations", subsystem: "push", markdownRef: "docs/runbooks/push-failure.md",
  },

  // ═══ RB-008 — VMware/Desktop Boot ═══
  {
    runbookId: "RB-008", title: "VMware/Desktop Boot Failure",
    description: "Handle Electron/desktop/appliance boot failures",
    severity: "medium", status: "draft",
    triggerCondition: "Desktop or appliance app fails to initialize within 30 seconds",
    affectedServices: ["config-service"], killSwitchRef: "KS-APPLIANCE-UPDATE", messageCodeRef: "BOOT-003",
    steps: [
      { order: 1, action: "Check Electron main process logs / appliance journalctl", command: null, expectedOutcome: "Error identified", rollbackAction: null, timeoutMs: 60_000 },
      { order: 2, action: "Verify local storage and config integrity", command: null, expectedOutcome: "Config valid or rebuilt", rollbackAction: null, timeoutMs: 60_000 },
      { order: 3, action: "Clear app cache and restart", command: null, expectedOutcome: "App boots successfully", rollbackAction: null, timeoutMs: 60_000 },
      { order: 4, action: "If persistent: reinstall from latest release", command: null, expectedOutcome: "Fresh install works", rollbackAction: null, timeoutMs: 600_000 },
    ],
    escalationTarget: "operator", estimatedResolutionMs: 900_000, lastTestedAt: null, owner: "platform",
    boundedContextId: "runtime-kernel", subsystem: "desktop-host", markdownRef: "docs/runbooks/vmware-boot-failure.md",
  },

  // ═══ RB-009 — Emergency Rollback ═══
  {
    runbookId: "RB-009", title: "Release Rollback",
    description: "Roll back a bad deployment or configuration change",
    severity: "critical", status: "reviewed",
    triggerCondition: "Critical errors spike post-deployment",
    affectedServices: ["health-monitor", "config-service"],
    killSwitchRef: "KS-RELEASE-ROLLOUT", messageCodeRef: "CRASH-001",
    steps: [
      { order: 1, action: "Confirm error spike is deployment-related", command: null, expectedOutcome: "Correlation with deploy timestamp confirmed", rollbackAction: null, timeoutMs: 60_000 },
      { order: 2, action: "Activate KS-RELEASE-ROLLOUT to freeze pipeline", command: null, expectedOutcome: "No further releases ship", rollbackAction: "Disarm switch", timeoutMs: 30_000 },
      { order: 3, action: "Trigger deployment rollback to previous version", command: null, expectedOutcome: "Previous version serving traffic", rollbackAction: null, timeoutMs: 120_000 },
      { order: 4, action: "Verify rollback success via health checks", command: null, expectedOutcome: "All health checks green", rollbackAction: null, timeoutMs: 60_000 },
      { order: 5, action: "Create incident report with root cause", command: null, expectedOutcome: "Incident documented", rollbackAction: null, timeoutMs: 300_000 },
    ],
    escalationTarget: "admin", estimatedResolutionMs: 600_000, lastTestedAt: null, owner: "platform",
    boundedContextId: "cloud-control-plane", subsystem: "release", markdownRef: "docs/runbooks/release-rollback.md",
  },

  // ═══ RB-010 — AI Degradation ═══
  {
    runbookId: "RB-010", title: "AI Degradation Response",
    description: "Manage graceful degradation when AI capabilities are reduced",
    severity: "high", status: "reviewed",
    triggerCondition: "AI quality scores drop below threshold or budget exhausted",
    affectedServices: ["ai-gateway", "advisor-orchestrator", "epistemic-firewall"],
    killSwitchRef: "KS-MODEL-PROVIDERS", messageCodeRef: "AI-002",
    steps: [
      { order: 1, action: "Assess degradation scope (single model vs all)", command: null, expectedOutcome: "Scope determined", rollbackAction: null, timeoutMs: 30_000 },
      { order: 2, action: "Switch to degraded-mode UI indicators", command: null, expectedOutcome: "Users see degraded badges on AI features", rollbackAction: "Remove badges", timeoutMs: 15_000 },
      { order: 3, action: "Reduce advisor autonomy to 0 (approval-only)", command: null, expectedOutcome: "No autonomous actions until restored", rollbackAction: "Restore autonomy levels", timeoutMs: 15_000 },
      { order: 4, action: "Serve cached recommendations where available", command: null, expectedOutcome: "Stale but useful outputs served", rollbackAction: "Stop cache serving", timeoutMs: 15_000 },
      { order: 5, action: "Monitor for restoration, gradually increase autonomy", command: null, expectedOutcome: "Full AI capability restored", rollbackAction: null, timeoutMs: 600_000 },
    ],
    escalationTarget: "admin", estimatedResolutionMs: 900_000, lastTestedAt: null, owner: "ai",
    boundedContextId: "runtime-kernel", subsystem: "ai-degradation", markdownRef: "docs/runbooks/ai-provider-degradation.md",
  },

  // ═══ RB-011 — Connector Token Failure ═══
  {
    runbookId: "RB-011", title: "Connector Token Failure",
    description: "Recover from expired or revoked connector OAuth tokens",
    severity: "medium", status: "reviewed",
    triggerCondition: "Connector returns 401/403 from provider 3+ times",
    affectedServices: ["connector-service"], killSwitchRef: "KS-CONNECTORS", messageCodeRef: "AUTH-002",
    steps: [
      { order: 1, action: "Identify failing connector and provider", command: null, expectedOutcome: "Connector + provider identified", rollbackAction: null, timeoutMs: 60_000 },
      { order: 2, action: "Attempt automatic token refresh", command: null, expectedOutcome: "Token refreshed or refresh fails", rollbackAction: null, timeoutMs: 30_000 },
      { order: 3, action: "If refresh fails, mark connector as needs-reauth", command: null, expectedOutcome: "User prompted to re-authorize", rollbackAction: null, timeoutMs: 15_000 },
      { order: 4, action: "Pause sync for the connector until reauth", command: null, expectedOutcome: "Failed retries stop", rollbackAction: "Resume sync", timeoutMs: 15_000 },
    ],
    escalationTarget: "operator", estimatedResolutionMs: 300_000, lastTestedAt: null, owner: "integration",
    boundedContextId: "integrations", subsystem: "connectors", markdownRef: "docs/runbooks/connector-token-failure.md",
  },

  // ═══ RB-012 — Setup Checkpoint Corruption ═══
  {
    runbookId: "RB-012", title: "Setup Checkpoint Corruption",
    description: "Recover a corrupted onboarding/setup checkpoint",
    severity: "medium", status: "reviewed",
    triggerCondition: "Setup state machine cannot resume from saved checkpoint",
    affectedServices: ["setup-service"], killSwitchRef: null, messageCodeRef: "SETUP-001",
    steps: [
      { order: 1, action: "Identify last known-good checkpoint", command: null, expectedOutcome: "Checkpoint id resolved", rollbackAction: null, timeoutMs: 60_000 },
      { order: 2, action: "Restore checkpoint state from snapshot", command: null, expectedOutcome: "Setup resumes at last good step", rollbackAction: "Reset to fresh setup", timeoutMs: 120_000 },
      { order: 3, action: "Re-run validation for steps post checkpoint", command: null, expectedOutcome: "All later steps still valid", rollbackAction: null, timeoutMs: 120_000 },
      { order: 4, action: "Notify user and resume", command: null, expectedOutcome: "User can complete setup", rollbackAction: null, timeoutMs: 30_000 },
    ],
    escalationTarget: "operator", estimatedResolutionMs: 600_000, lastTestedAt: null, owner: "platform",
    boundedContextId: "setup-identity", subsystem: "setup", markdownRef: "docs/runbooks/setup-checkpoint-corruption.md",
  },

  // ═══ RB-013 — Approval Queue Jam ═══
  {
    runbookId: "RB-013", title: "Approval Queue Jam",
    description: "Recover a jammed or backed-up approval queue",
    severity: "high", status: "reviewed",
    triggerCondition: "Approval queue depth >100 or oldest item >24h",
    affectedServices: ["approval-service"], killSwitchRef: null, messageCodeRef: "APPR-001",
    steps: [
      { order: 1, action: "Snapshot queue state", command: null, expectedOutcome: "Snapshot captured for audit", rollbackAction: null, timeoutMs: 60_000 },
      { order: 2, action: "Identify root cause: stuck reviewer, missing actor, dead-letter", command: null, expectedOutcome: "Root cause classified", rollbackAction: null, timeoutMs: 120_000 },
      { order: 3, action: "Reassign or auto-escalate items past SLA", command: null, expectedOutcome: "Queue depth begins to drop", rollbackAction: "Revert reassignments", timeoutMs: 300_000 },
      { order: 4, action: "Move unrecoverable items to dead-letter with audit", command: null, expectedOutcome: "Queue cleared, dead letters tracked", rollbackAction: null, timeoutMs: 60_000 },
    ],
    escalationTarget: "admin", estimatedResolutionMs: 900_000, lastTestedAt: null, owner: "platform",
    boundedContextId: "boardroom", subsystem: "approvals", markdownRef: "docs/runbooks/approval-queue-jam.md",
  },

  // ═══ RB-014 — DB Restore Failure ═══
  {
    runbookId: "RB-014", title: "DB Restore Failure",
    description: "Recover when a database restore from backup fails",
    severity: "critical", status: "reviewed",
    triggerCondition: "Restore job fails or restored DB fails integrity check",
    affectedServices: ["db-restore-service"], killSwitchRef: null, messageCodeRef: "DB-001",
    steps: [
      { order: 1, action: "Identify failed restore job and error class", command: null, expectedOutcome: "Failure root cause identified", rollbackAction: null, timeoutMs: 60_000 },
      { order: 2, action: "Verify integrity of backup artifact (checksum)", command: null, expectedOutcome: "Backup integrity confirmed or rejected", rollbackAction: null, timeoutMs: 120_000 },
      { order: 3, action: "Try previous backup if current is corrupt", command: null, expectedOutcome: "Restore succeeds from older snapshot", rollbackAction: null, timeoutMs: 600_000 },
      { order: 4, action: "Run post-restore RLS and integrity validators", command: null, expectedOutcome: "DB passes validators", rollbackAction: null, timeoutMs: 300_000 },
      { order: 5, action: "Open critical incident, preserve evidence", command: null, expectedOutcome: "Incident report filed", rollbackAction: null, timeoutMs: 300_000 },
    ],
    escalationTarget: "admin", estimatedResolutionMs: 1_800_000, lastTestedAt: null, owner: "platform",
    boundedContextId: "cloud-control-plane", subsystem: "db", markdownRef: "docs/runbooks/db-restore-failure.md",
  },

  // ═══ RB-015 — RLS Misconfig ═══
  {
    runbookId: "RB-015", title: "RLS Misconfiguration Response",
    description: "Respond to row-level security misconfiguration or leakage",
    severity: "critical", status: "reviewed",
    triggerCondition: "RLS audit reports policy gap or privilege escalation",
    affectedServices: ["security-monitor"], killSwitchRef: null, messageCodeRef: "SEC-001",
    steps: [
      { order: 1, action: "Snapshot affected table(s) and identify exposed rows", command: null, expectedOutcome: "Exposure scope quantified", rollbackAction: null, timeoutMs: 120_000 },
      { order: 2, action: "Apply emergency restrictive policy or revoke role", command: null, expectedOutcome: "Exposure stopped", rollbackAction: "Restore previous policy", timeoutMs: 60_000 },
      { order: 3, action: "Rotate any leaked credentials/tokens", command: null, expectedOutcome: "Affected secrets rotated", rollbackAction: null, timeoutMs: 300_000 },
      { order: 4, action: "Notify affected tenants per policy", command: null, expectedOutcome: "Notifications dispatched and logged", rollbackAction: null, timeoutMs: 600_000 },
      { order: 5, action: "Open security incident, preserve forensic logs", command: null, expectedOutcome: "Incident filed with full evidence", rollbackAction: null, timeoutMs: 600_000 },
    ],
    escalationTarget: "admin", estimatedResolutionMs: 3_600_000, lastTestedAt: null, owner: "platform",
    boundedContextId: "proof-trust", subsystem: "rls", markdownRef: "docs/runbooks/rls-misconfig.md",
  },

  // ═══ RB-016 — Desktop Host Bridge Failure ═══
  {
    runbookId: "RB-016", title: "Desktop Host Bridge Failure",
    description: "Recover when the Electron host bridge stops responding",
    severity: "medium", status: "reviewed",
    triggerCondition: "Desktop bridge probe fails or returns invalid contract",
    affectedServices: ["desktop-runtime"], killSwitchRef: null, messageCodeRef: "BOOT-002",
    steps: [
      { order: 1, action: "Probe bridge via detectDesktopRuntime()", command: null, expectedOutcome: "Bridge state captured", rollbackAction: null, timeoutMs: 30_000 },
      { order: 2, action: "Fall back to web-only feature surface", command: null, expectedOutcome: "App continues with degraded surface", rollbackAction: "Re-enable desktop features", timeoutMs: 30_000 },
      { order: 3, action: "Restart Electron main process if available", command: null, expectedOutcome: "Bridge restored", rollbackAction: null, timeoutMs: 60_000 },
      { order: 4, action: "If unrecoverable, prompt user to relaunch app", command: null, expectedOutcome: "User informed; relaunch path clear", rollbackAction: null, timeoutMs: 30_000 },
    ],
    escalationTarget: "operator", estimatedResolutionMs: 300_000, lastTestedAt: null, owner: "platform",
    boundedContextId: "runtime-kernel", subsystem: "desktop-host", markdownRef: "docs/runbooks/desktop-host-bridge-failure.md",
  },

  // ═══ RB-017 — Mobile Push Registration ═══
  {
    runbookId: "RB-017", title: "Mobile Push Registration Failure",
    description: "Recover when mobile push registration fails on the device",
    severity: "low", status: "reviewed",
    triggerCondition: "Push subscription registration returns error or empty endpoint",
    affectedServices: ["push-service"], killSwitchRef: "KS-MOBILE-PUSH", messageCodeRef: "NET-002",
    steps: [
      { order: 1, action: "Check VAPID public key parity client/server", command: null, expectedOutcome: "Keys match", rollbackAction: null, timeoutMs: 30_000 },
      { order: 2, action: "Re-prompt for notification permission", command: null, expectedOutcome: "Permission granted or denied explicitly", rollbackAction: null, timeoutMs: 60_000 },
      { order: 3, action: "Recreate subscription, persist to push_subscriptions", command: null, expectedOutcome: "Subscription stored", rollbackAction: "Delete subscription", timeoutMs: 60_000 },
      { order: 4, action: "Send test notification to verify path", command: null, expectedOutcome: "Test push delivered", rollbackAction: null, timeoutMs: 30_000 },
    ],
    escalationTarget: "operator", estimatedResolutionMs: 300_000, lastTestedAt: null, owner: "mobile",
    boundedContextId: "mobile", subsystem: "mobile-push", markdownRef: "docs/runbooks/mobile-push-registration.md",
  },

  // ═══ RB-018 — Runtime Probe Failure ═══
  {
    runbookId: "RB-018", title: "Runtime Probe Failure",
    description: "Diagnose when runtime capability probes fail or report inconsistencies",
    severity: "medium", status: "reviewed",
    triggerCondition: "probeRuntimeTier() reports unexpected tier or missing capability",
    affectedServices: ["runtime-monitor"], killSwitchRef: null, messageCodeRef: "RUNTIME-001",
    steps: [
      { order: 1, action: "Capture runtime probe snapshot", command: null, expectedOutcome: "Snapshot recorded", rollbackAction: null, timeoutMs: 30_000 },
      { order: 2, action: "Compare against generated runtime-capability-matrix.json", command: null, expectedOutcome: "Drift identified", rollbackAction: null, timeoutMs: 60_000 },
      { order: 3, action: "Re-run capability detection and emit corrected receipt", command: null, expectedOutcome: "Probe matches matrix", rollbackAction: null, timeoutMs: 60_000 },
      { order: 4, action: "If drift persists, regenerate matrix and re-deploy", command: null, expectedOutcome: "Matrix and runtime aligned", rollbackAction: "Revert matrix change", timeoutMs: 600_000 },
    ],
    escalationTarget: "operator", estimatedResolutionMs: 900_000, lastTestedAt: null, owner: "platform",
    boundedContextId: "runtime-kernel", subsystem: "runtime-probe", markdownRef: "docs/runbooks/runtime-probe-failure.md",
  },

  // ═══ RB-019 — Support Escalation Failure ═══
  {
    runbookId: "RB-019", title: "Support Escalation Failure",
    description: "Recover when support escalation paths fail to deliver",
    severity: "high", status: "reviewed",
    triggerCondition: "Escalation does not reach target within configured SLA",
    affectedServices: ["support-service", "communication-service"], killSwitchRef: "KS-OUTBOUND", messageCodeRef: "SUP-001",
    steps: [
      { order: 1, action: "Verify outbound communications are not blocked by KS-OUTBOUND", command: null, expectedOutcome: "Channel availability confirmed", rollbackAction: null, timeoutMs: 30_000 },
      { order: 2, action: "Re-route via secondary escalation channel", command: null, expectedOutcome: "Escalation delivered", rollbackAction: null, timeoutMs: 60_000 },
      { order: 3, action: "Manually page on-call admin", command: null, expectedOutcome: "Human in the loop engaged", rollbackAction: null, timeoutMs: 60_000 },
      { order: 4, action: "Open incident to fix the broken escalation path", command: null, expectedOutcome: "Root cause tracked", rollbackAction: null, timeoutMs: 300_000 },
    ],
    escalationTarget: "admin", estimatedResolutionMs: 600_000, lastTestedAt: null, owner: "support",
    boundedContextId: "admin", subsystem: "support-escalation", markdownRef: "docs/runbooks/support-escalation-failure.md",
  },

  // ═══ RB-020 — Ingress / Edge Routing Failure ═══
  {
    runbookId: "RB-020", title: "Ingress / Edge Routing Failure",
    description: "Recover when the ingress / edge layer (Nginx/Traefik/Kong) fails or misroutes traffic",
    severity: "high", status: "reviewed",
    triggerCondition: "Ingress returns 5xx to >5% of requests for >2 minutes",
    affectedServices: ["ingress", "nginx", "traefik"], killSwitchRef: null, messageCodeRef: "NET-003",
    steps: [
      { order: 1, action: "Identify failing edge layer from access logs", command: null, expectedOutcome: "Failing upstream identified", rollbackAction: null, timeoutMs: 60_000 },
      { order: 2, action: "Bypass ingress and call upstream directly", command: null, expectedOutcome: "Upstream-vs-ingress isolation done", rollbackAction: null, timeoutMs: 60_000 },
      { order: 3, action: "Reload routing config (nginx -s reload / traefik / kong API)", command: null, expectedOutcome: "Routing table reloaded", rollbackAction: "Revert config", timeoutMs: 60_000 },
      { order: 4, action: "Drain & recycle a single replica to clear cert cache", command: null, expectedOutcome: "Connection pools refreshed", rollbackAction: null, timeoutMs: 120_000 },
      { order: 5, action: "If recent deploy: pair with RB-009 release rollback", command: null, expectedOutcome: "Edge config rolled back", rollbackAction: null, timeoutMs: 300_000 },
    ],
    escalationTarget: "admin", estimatedResolutionMs: 900_000, lastTestedAt: null, owner: "platform",
    boundedContextId: "cloud-control-plane", subsystem: "ingress", markdownRef: "docs/runbooks/ingress-failure.md",
  },

  // ═══ RB-020 — Boardroom Layer 7 Stuck Follow-Through ═══
  {
    runbookId: "RB-020", title: "Boardroom Layer 7 — Stuck Follow-Through Recovery",
    description: "Recover a Boardroom approved decision whose follow-through dispatch breached its SLA window (e.g., outcome_pending > 72h)",
    severity: "high", status: "reviewed",
    triggerCondition: "boardroom-followthrough-sla edge function pages a warning/critical bucket via alert-router",
    affectedServices: ["boardroom-service", "agent-executor", "boardroom-followthrough-dispatch", "boardroom-outcome-record"],
    killSwitchRef: "KS-WORKFLOW", messageCodeRef: "BOARD-007",
    steps: [
      { order: 1, action: "Open Layer 7 admin board at /admin/boardroom-layer7 and filter by state=outcome_pending or executing, sorted by oldest updated_at", command: null, expectedOutcome: "Breaching dispatch row visible at top", rollbackAction: null, timeoutMs: 60_000 },
      { order: 2, action: "Inspect dispatch evidence (correlation_id, retry_count, execution_result, linked receipt)", command: null, expectedOutcome: "Root cause classified: real failure, missed outcome write, or external blocker", rollbackAction: null, timeoutMs: 180_000 },
      { order: 3, action: "Choose remediation path: (A) record outcome if execution actually completed, (B) mark dispatch failed and roll back, (C) toggle KS-WORKFLOW only if many dispatches are stuck", command: null, expectedOutcome: "Dispatch advances or is safely terminated", rollbackAction: "Revert dispatch state via admin tooling", timeoutMs: 600_000 },
      { order: 4, action: "Confirm closure: dispatch reaches outcome_tracked → reflected → closed and boardroom_items.followthrough_state matches", command: null, expectedOutcome: "Lifecycle terminal state reached", rollbackAction: null, timeoutMs: 300_000 },
      { order: 5, action: "Acknowledge the boardroom_followthrough_sla_alerts row (sets acknowledged_at) so cooldown applies and no re-page fires", command: null, expectedOutcome: "Alert row acknowledged, no re-page within cooldown", rollbackAction: null, timeoutMs: 60_000 },
    ],
    escalationTarget: "admin", estimatedResolutionMs: 1_200_000, lastTestedAt: null, owner: "boardroom",
    boundedContextId: "boardroom", subsystem: "boardroom-followthrough", markdownRef: "docs/runbooks/boardroom-l7-stuck.md",
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

export function getRunbookForKillSwitch(switchId: string): RunbookEntry | undefined {
  return RUNBOOK_REGISTRY.find((r) => r.killSwitchRef === switchId);
}

export function getRunbooksByBoundedContext(contextId: string): readonly RunbookEntry[] {
  return RUNBOOK_REGISTRY.filter((r) => r.boundedContextId === contextId);
}

export function getRunbookForSubsystem(subsystem: string): RunbookEntry | undefined {
  return RUNBOOK_REGISTRY.find((r) => r.subsystem === subsystem);
}
