// ═══════════════════════════════════════════════════════════════
// SITA OS — Runbook Resolver (Phase 28.B)
// Maps alert subsystems / affected services → canonical runbook IDs.
// Used by alert-client and incident-management to auto-link recovery
// procedures so operators never see an alert without a runbook.
// ═══════════════════════════════════════════════════════════════

import { RUNBOOK_REGISTRY, getRunbookForSubsystem, type RunbookEntry, type RunbookSubsystem, type RunbookSeverity } from "./runbook-registry";

/**
 * Severity-based fallback chain. If subsystem can't be matched, we still
 * pick a sensible runbook based on severity to keep the operator in motion.
 */
const SEVERITY_FALLBACK: Record<RunbookSeverity, string> = {
  critical: "RB-009", // Release Rollback — broadest critical recovery
  high:     "RB-019", // Support Escalation Failure — page a human
  medium:   "RB-006", // Generated vs Runtime Drift — investigate
  low:      "RB-007", // Push Failure — informational
};

/**
 * Map alert source → canonical RunbookSubsystem.
 * Sources are free-form strings emitted by edge functions / clients.
 */
const SOURCE_TO_SUBSYSTEM: Record<string, RunbookSubsystem> = {
  // auth
  "auth-service": "auth", "auth": "auth", "supabase-auth": "auth",
  // ai providers
  "ai-gateway": "ai-providers", "openai": "ai-providers", "anthropic": "ai-providers",
  "lovable-ai": "ai-providers", "ai-provider": "ai-providers",
  // sync
  "sync-service": "sync", "sync": "sync", "connector-sync": "sync",
  // workflow
  "workflow-execute": "workflow", "workflow": "workflow", "advisor-action-engine": "workflow",
  // proof
  "audit-service": "proof", "ai-receipt-service": "proof", "proof": "proof",
  // manifest drift
  "manifest-drift": "manifest-drift", "boundary-check": "manifest-drift",
  // push
  "push-service": "push", "push-dispatch": "push", "web-push": "push",
  // desktop
  "desktop-runtime": "desktop-host", "electron": "desktop-host", "vmware": "desktop-host",
  // release
  "release-pipeline": "release", "deploy": "release", "rollout": "release",
  // ai degradation
  "advisor-orchestrator": "ai-degradation", "epistemic-firewall": "ai-degradation",
  // connectors
  "connector-service": "connectors", "connector-oauth": "connectors", "connector-token": "connectors",
  // setup
  "setup-service": "setup", "onboarding": "setup",
  // approvals
  "approval-service": "approvals", "approval-queue": "approvals",
  // db
  "db-restore-service": "db", "postgres": "db", "supabase-db": "db",
  // rls
  "security-monitor": "rls", "rls-audit": "rls",
  // mobile push
  "mobile-push": "mobile-push", "fcm": "mobile-push", "apns": "mobile-push",
  // runtime probe
  "runtime-monitor": "runtime-probe", "runtime-probe": "runtime-probe",
  // support escalation
  "support-service": "support-escalation", "communication-service": "support-escalation",
  // ingress
  "nginx": "ingress", "traefik": "ingress", "ingress": "ingress", "kong": "ingress",
};

export interface ResolveAlertInput {
  subsystem?: string | null;
  source?: string | null;
  severity?: RunbookSeverity | "info" | null;
}

export interface ResolveIncidentInput {
  affectedServices?: readonly string[];
  severity?: RunbookSeverity | null;
}

/**
 * Resolve a single best-fit runbook ID for an alert.
 * Returns null only when nothing in the registry matches.
 */
export function resolveRunbookForAlert(input: ResolveAlertInput): string | null {
  // 1) direct subsystem match
  if (input.subsystem) {
    const direct = getRunbookForSubsystem(input.subsystem);
    if (direct) return direct.runbookId;
  }
  // 2) source string → subsystem mapping
  if (input.source) {
    const sub = SOURCE_TO_SUBSYSTEM[input.source.toLowerCase()];
    if (sub) {
      const rb = getRunbookForSubsystem(sub);
      if (rb) return rb.runbookId;
    }
  }
  // 3) severity-based fallback
  const sev = input.severity && input.severity !== "info" ? input.severity : null;
  if (sev) {
    return SEVERITY_FALLBACK[sev];
  }
  return null;
}

/**
 * Resolve every relevant runbook for an incident, plus a primary.
 * - Inspects affectedServices to find runbooks whose registry lists the service.
 * - Falls back to severity-based primary.
 */
export function resolveRunbooksForIncident(input: ResolveIncidentInput): { primary: string | null; all: string[] } {
  const matches = new Set<string>();
  const services = input.affectedServices ?? [];

  for (const svc of services) {
    for (const rb of RUNBOOK_REGISTRY) {
      if (rb.affectedServices.includes(svc)) matches.add(rb.runbookId);
    }
    // also try source mapping
    const sub = SOURCE_TO_SUBSYSTEM[svc.toLowerCase()];
    if (sub) {
      const rb = getRunbookForSubsystem(sub);
      if (rb) matches.add(rb.runbookId);
    }
  }

  const all = Array.from(matches);
  let primary: string | null = all[0] ?? null;
  if (!primary && input.severity) {
    primary = SEVERITY_FALLBACK[input.severity];
    if (primary) all.push(primary);
  }
  return { primary, all };
}

/** Diagnostics — used by telemetry to detect resolution misses. */
export function describeResolution(input: ResolveAlertInput): {
  resolved: boolean;
  runbookId: string | null;
  matchedBy: "subsystem" | "source" | "severity" | "none";
} {
  if (input.subsystem && getRunbookForSubsystem(input.subsystem)) {
    return { resolved: true, runbookId: getRunbookForSubsystem(input.subsystem)!.runbookId, matchedBy: "subsystem" };
  }
  if (input.source && SOURCE_TO_SUBSYSTEM[input.source.toLowerCase()]) {
    const sub = SOURCE_TO_SUBSYSTEM[input.source.toLowerCase()];
    const rb = getRunbookForSubsystem(sub);
    if (rb) return { resolved: true, runbookId: rb.runbookId, matchedBy: "source" };
  }
  const sev = input.severity && input.severity !== "info" ? input.severity : null;
  if (sev) return { resolved: true, runbookId: SEVERITY_FALLBACK[sev], matchedBy: "severity" };
  return { resolved: false, runbookId: null, matchedBy: "none" };
}

export type { RunbookEntry };
