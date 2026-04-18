// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Message Registry
// Typed system message catalog with severity, audience, remediation
// ═══════════════════════════════════════════════════════════════

import type { ProductRealityTier } from "./product-reality-tiers";

export type MessageSeverity = "trace" | "debug" | "info" | "warn" | "error" | "critical" | "fatal";
export type MessageAudience = "system" | "operator" | "user" | "advisor" | "audit";
export type MessageCategory =
  | "boot" | "shutdown" | "crash" | "lifecycle"
  | "security" | "auth" | "trust"
  | "sync" | "storage" | "network"
  | "ai" | "budget" | "policy"
  | "advisor" | "workflow" | "approval"
  | "deployment" | "health" | "kill-switch";

export interface RuntimeMessageEntry {
  readonly code: string;
  readonly category: MessageCategory;
  readonly severity: MessageSeverity;
  readonly audience: readonly MessageAudience[];
  readonly template: string;
  readonly remediation: string | null;
  readonly tier: ProductRealityTier;
  readonly killSwitchTarget: string | null;
  readonly escalatesTo: string | null;
}

export const RUNTIME_MESSAGE_REGISTRY: readonly RuntimeMessageEntry[] = [
  // ── Boot / Lifecycle ─────────────────────────────────────────
  { code: "BOOT-001", category: "boot", severity: "info", audience: ["system", "operator"], template: "Kernel boot sequence initiated", remediation: null, tier: "simulated", killSwitchTarget: null, escalatesTo: null },
  { code: "BOOT-002", category: "boot", severity: "info", audience: ["system"], template: "Service registry loaded: {count} services registered", remediation: null, tier: "simulated", killSwitchTarget: null, escalatesTo: null },
  { code: "BOOT-003", category: "boot", severity: "error", audience: ["system", "operator"], template: "Boot failed: {service} dependency missing", remediation: "Check service-lifecycle-registry for dependency chain", tier: "simulated", killSwitchTarget: null, escalatesTo: "operator" },
  { code: "BOOT-004", category: "boot", severity: "info", audience: ["system"], template: "Trust chain validation passed for zone {zone}", remediation: null, tier: "simulated", killSwitchTarget: null, escalatesTo: null },
  { code: "BOOT-005", category: "boot", severity: "critical", audience: ["system", "operator", "audit"], template: "Trust chain validation FAILED for zone {zone}", remediation: "Inspect runtime-trust-chain.ts zone definitions and device attestation", tier: "simulated", killSwitchTarget: null, escalatesTo: "admin" },

  // ── Shutdown ─────────────────────────────────────────────────
  { code: "SHUT-001", category: "shutdown", severity: "info", audience: ["system", "operator"], template: "Graceful shutdown initiated by {actor}", remediation: null, tier: "simulated", killSwitchTarget: null, escalatesTo: null },
  { code: "SHUT-002", category: "shutdown", severity: "warn", audience: ["system", "operator"], template: "Forced shutdown: {reason}", remediation: "Review kill-switch-registry for active switches", tier: "simulated", killSwitchTarget: null, escalatesTo: "operator" },

  // ── Crash ────────────────────────────────────────────────────
  { code: "CRASH-001", category: "crash", severity: "fatal", audience: ["system", "operator", "audit"], template: "Unrecoverable error in {service}: {error}", remediation: "Check runbook-registry for recovery procedure", tier: "simulated", killSwitchTarget: null, escalatesTo: "admin" },
  { code: "CRASH-002", category: "crash", severity: "error", audience: ["system", "operator"], template: "Service {service} crashed, restart attempt {attempt}/{max}", remediation: "If max retries exceeded, escalate to operator", tier: "simulated", killSwitchTarget: null, escalatesTo: "operator" },

  // ── Security / Auth / Trust ──────────────────────────────────
  { code: "SEC-001", category: "security", severity: "critical", audience: ["system", "operator", "audit"], template: "Intrusion detected: {details}", remediation: "Engage IDS response, review admin_action_audit", tier: "simulated", killSwitchTarget: null, escalatesTo: "admin" },
  { code: "SEC-002", category: "auth", severity: "warn", audience: ["system", "audit"], template: "Auth token expired for session {sessionId}", remediation: "Re-authenticate via standard flow", tier: "production", killSwitchTarget: null, escalatesTo: null },
  { code: "SEC-003", category: "trust", severity: "error", audience: ["system", "operator"], template: "Trust level degraded for device {deviceId}: {reason}", remediation: "Re-attest device or revoke credentials", tier: "simulated", killSwitchTarget: null, escalatesTo: "operator" },
  { code: "SEC-004", category: "security", severity: "critical", audience: ["system", "operator", "audit"], template: "Privilege escalation attempt by user {userId}", remediation: "Lock account, review user_roles table", tier: "production", killSwitchTarget: null, escalatesTo: "admin" },

  // ── AI / Budget ──────────────────────────────────────────────
  { code: "AI-001", category: "ai", severity: "warn", audience: ["system", "operator"], template: "AI budget {budgetClass} at {percent}% utilization", remediation: "Reduce invocation frequency or upgrade budget class", tier: "production", killSwitchTarget: "model-providers", escalatesTo: null },
  { code: "AI-002", category: "ai", severity: "error", audience: ["system", "operator", "audit"], template: "AI model {model} returned unsafe output: {reason}", remediation: "Engage epistemic firewall, log to ai_inference_receipts", tier: "production", killSwitchTarget: "model-providers", escalatesTo: "operator" },
  { code: "AI-003", category: "budget", severity: "critical", audience: ["system", "operator"], template: "AI budget exhausted for class {budgetClass}", remediation: "Kill switch model-providers or increase allocation", tier: "production", killSwitchTarget: "model-providers", escalatesTo: "admin" },

  // ── Advisor / Workflow / Approval ────────────────────────────
  { code: "ADV-001", category: "advisor", severity: "info", audience: ["system", "user"], template: "Advisor {advisorId} generated recommendation: {title}", remediation: null, tier: "production", killSwitchTarget: "advisors", escalatesTo: null },
  { code: "ADV-002", category: "advisor", severity: "warn", audience: ["system", "operator"], template: "Advisor {advisorId} confidence below threshold: {score}", remediation: "Review advisor calibration in advisor_autonomy_policies", tier: "production", killSwitchTarget: "advisors", escalatesTo: null },
  { code: "WF-001", category: "workflow", severity: "error", audience: ["system", "operator"], template: "Workflow {workflowId} stuck in state {state} for {duration}", remediation: "See runbook RB-004 (stuck-workflow)", tier: "simulated", killSwitchTarget: "workflow", escalatesTo: "operator" },
  { code: "APR-001", category: "approval", severity: "info", audience: ["system", "user"], template: "Approval required for action {actionKey} by {actor}", remediation: null, tier: "production", killSwitchTarget: null, escalatesTo: null },

  // ── Sync / Storage / Network ─────────────────────────────────
  { code: "SYNC-001", category: "sync", severity: "warn", audience: ["system", "operator"], template: "Sync lag detected: {source} behind by {lagMs}ms", remediation: "See runbook RB-003 (sync-lag)", tier: "simulated", killSwitchTarget: "sync", escalatesTo: null },
  { code: "STOR-001", category: "storage", severity: "error", audience: ["system", "operator"], template: "Storage backend {backend} unavailable", remediation: "Failover to secondary backend per storage-topology-registry", tier: "simulated", killSwitchTarget: null, escalatesTo: "operator" },
  { code: "NET-001", category: "network", severity: "warn", audience: ["system"], template: "Network connectivity degraded: latency {latencyMs}ms", remediation: "Enable offline queue, defer non-critical syncs", tier: "simulated", killSwitchTarget: null, escalatesTo: null },

  // ── Deployment / Health ──────────────────────────────────────
  { code: "DEP-001", category: "deployment", severity: "info", audience: ["system", "operator"], template: "Deployment unit {unit} promoted to {environment}", remediation: null, tier: "simulated", killSwitchTarget: null, escalatesTo: null },
  { code: "HEALTH-001", category: "health", severity: "warn", audience: ["system", "operator"], template: "Health check failed for {target}: {reason}", remediation: "Inspect db-health-engine or service health endpoint", tier: "simulated", killSwitchTarget: null, escalatesTo: "operator" },

  // ── Kill Switch ──────────────────────────────────────────────
  { code: "KS-001", category: "kill-switch", severity: "critical", audience: ["system", "operator", "audit"], template: "Kill switch activated: {target} by {actor}", remediation: "Review kill-switch-registry, confirm intentional", tier: "simulated", killSwitchTarget: null, escalatesTo: "admin" },
  { code: "KS-002", category: "kill-switch", severity: "info", audience: ["system", "operator"], template: "Kill switch deactivated: {target} by {actor}", remediation: null, tier: "simulated", killSwitchTarget: null, escalatesTo: null },

  // ── Policy ───────────────────────────────────────────────────
  { code: "POL-001", category: "policy", severity: "warn", audience: ["system", "operator", "audit"], template: "Policy violation: {policyId} by {subject}", remediation: "Review unified-policy-matrix for enforcement rules", tier: "simulated", killSwitchTarget: null, escalatesTo: "operator" },
  { code: "POL-002", category: "policy", severity: "error", audience: ["system", "operator", "audit"], template: "RLS policy bypass attempted on table {table}", remediation: "Immediate audit, review rls-policy-registry", tier: "production", killSwitchTarget: null, escalatesTo: "admin" },
] as const;

// ── Query Functions ────────────────────────────────────────────

export function getMessageByCode(code: string): RuntimeMessageEntry | undefined {
  return RUNTIME_MESSAGE_REGISTRY.find((m) => m.code === code);
}

export function getMessagesByCategory(category: MessageCategory): readonly RuntimeMessageEntry[] {
  return RUNTIME_MESSAGE_REGISTRY.filter((m) => m.category === category);
}

export function getMessagesBySeverity(severity: MessageSeverity): readonly RuntimeMessageEntry[] {
  return RUNTIME_MESSAGE_REGISTRY.filter((m) => m.severity === severity);
}

export function getMessagesByAudience(audience: MessageAudience): readonly RuntimeMessageEntry[] {
  return RUNTIME_MESSAGE_REGISTRY.filter((m) => m.audience.includes(audience));
}

export function getCriticalMessages(): readonly RuntimeMessageEntry[] {
  return RUNTIME_MESSAGE_REGISTRY.filter((m) => m.severity === "critical" || m.severity === "fatal");
}

export function getMessagesWithRemediation(): readonly RuntimeMessageEntry[] {
  return RUNTIME_MESSAGE_REGISTRY.filter((m) => m.remediation !== null);
}

export function getMessagesForKillSwitch(target: string): readonly RuntimeMessageEntry[] {
  return RUNTIME_MESSAGE_REGISTRY.filter((m) => m.killSwitchTarget === target);
}

export function formatMessage(code: string, params: Record<string, string>): string {
  const entry = getMessageByCode(code);
  if (!entry) return `Unknown message: ${code}`;
  return Object.entries(params).reduce(
    (tpl, [k, v]) => tpl.replace(`{${k}}`, v),
    entry.template
  );
}
