// ═══════════════════════════════════════════════════════════════
// SITA OS — Runbook Subsystem Map
// Declarative truth: which subsystems must have at least one
// runbook. Used by `check-runbook-coverage.ts` to detect gaps.
// ═══════════════════════════════════════════════════════════════

import type { RunbookSubsystem } from "./runbook-types";

export interface RunbookSubsystemRequirement {
  readonly subsystem: RunbookSubsystem;
  readonly displayName: string;
  readonly mandatory: boolean;
  readonly criticalIncidentClass: boolean;
  readonly description: string;
}

export const RUNBOOK_SUBSYSTEM_REQUIREMENTS: readonly RunbookSubsystemRequirement[] = [
  { subsystem: "auth", displayName: "Authentication", mandatory: true, criticalIncidentClass: true,
    description: "Sign-in, session, MFA, and identity recovery" },
  { subsystem: "ai-providers", displayName: "AI Provider APIs", mandatory: true, criticalIncidentClass: true,
    description: "OpenAI, Google, and other LLM provider availability" },
  { subsystem: "sync", displayName: "Data Sync", mandatory: true, criticalIncidentClass: false,
    description: "Bi-directional sync with external integrations" },
  { subsystem: "workflow", displayName: "Workflow Engine", mandatory: true, criticalIncidentClass: false,
    description: "Stuck or jammed workflow recovery" },
  { subsystem: "proof", displayName: "Proof / Receipts", mandatory: true, criticalIncidentClass: true,
    description: "Audit receipts and proof bundle integrity" },
  { subsystem: "manifest-drift", displayName: "Generated vs Runtime Drift", mandatory: true, criticalIncidentClass: false,
    description: "Drift between generated manifests and live runtime" },
  { subsystem: "push", displayName: "Push Delivery", mandatory: true, criticalIncidentClass: false,
    description: "Web/Mobile push notification delivery" },
  { subsystem: "desktop-host", displayName: "Desktop Host Bridge", mandatory: true, criticalIncidentClass: false,
    description: "Electron host bridge / VMware boot recovery" },
  { subsystem: "release", displayName: "Release / Rollback", mandatory: true, criticalIncidentClass: true,
    description: "Bad deploy rollback and release pipeline recovery" },
  { subsystem: "ai-degradation", displayName: "AI Quality Degradation", mandatory: true, criticalIncidentClass: false,
    description: "Graceful degradation when AI quality drops" },
  { subsystem: "connectors", displayName: "Connector Tokens", mandatory: true, criticalIncidentClass: false,
    description: "OAuth token expiry / connector failure" },
  { subsystem: "setup", displayName: "Setup Checkpoint", mandatory: true, criticalIncidentClass: false,
    description: "Onboarding/setup checkpoint corruption recovery" },
  { subsystem: "approvals", displayName: "Approval Queue", mandatory: true, criticalIncidentClass: false,
    description: "Approval queue jam / dead-letter recovery" },
  { subsystem: "db", displayName: "DB Restore", mandatory: true, criticalIncidentClass: true,
    description: "Database restore from backup" },
  { subsystem: "rls", displayName: "RLS Misconfig", mandatory: true, criticalIncidentClass: true,
    description: "Row-level security misconfiguration response" },
  { subsystem: "mobile-push", displayName: "Mobile Push Registration", mandatory: true, criticalIncidentClass: false,
    description: "Mobile push registration failures" },
  { subsystem: "runtime-probe", displayName: "Runtime Probe Failure", mandatory: true, criticalIncidentClass: false,
    description: "Runtime capability probe failures" },
  { subsystem: "support-escalation", displayName: "Support Escalation", mandatory: true, criticalIncidentClass: false,
    description: "Failed support escalation paths" },
  { subsystem: "ingress", displayName: "Ingress / Edge", mandatory: true, criticalIncidentClass: true,
    description: "Ingress and edge routing failures (Nginx/Traefik/Kong)" },
] as const;

export function getMandatorySubsystems(): readonly RunbookSubsystem[] {
  return RUNBOOK_SUBSYSTEM_REQUIREMENTS.filter((r) => r.mandatory).map((r) => r.subsystem);
}

export function getCriticalIncidentSubsystems(): readonly RunbookSubsystem[] {
  return RUNBOOK_SUBSYSTEM_REQUIREMENTS.filter((r) => r.criticalIncidentClass).map((r) => r.subsystem);
}
