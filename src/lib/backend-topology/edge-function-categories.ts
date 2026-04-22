// ═══════════════════════════════════════════════════════════════
// SITA OS — Edge Function Categories (STRICT 6-CLASS TOPOLOGY)
//
// Phase 1 + Phase 2 of Edge Function Topology Hardening.
//
// Every function belongs to ONE primary BackendCategory (the strict
// 6-class topology) and ONE finer-grained EdgeFunctionSubCategory
// (kept for backwards compatibility with existing dashboards).
//
// HARD RULE: One function, one BackendCategory. No overlap.
// ═══════════════════════════════════════════════════════════════

/**
 * Strict 6-class backend topology.
 * Every edge function MUST be classified as exactly one of these.
 */
export type BackendCategory =
  | "PUBLIC_BFF"               // user-facing aggregation only
  | "ADMIN_BFF"                // owner/admin aggregation only
  | "DOMAIN_FUNCTION"          // single bounded domain concern
  | "ORCHESTRATION_FUNCTION"   // multi-step coordination only
  | "CONNECTOR_WEBHOOK_FUNCTION" // provider ingestion/adaptation
  | "RUNTIME_SYSTEM_FUNCTION"; // OS/device/runtime channels

/**
 * Audit verdict — used during migration phases to mark
 * functions that need restructuring before they can be
 * assigned a final BackendCategory.
 */
export type ClassificationVerdict =
  | BackendCategory
  | "SPLIT_REQUIRED"
  | "DUPLICATE_MERGE_REQUIRED"
  | "WRAPPER_ONLY"
  | "DEPRECATE_AND_REDIRECT";

/**
 * Legacy finer-grained category (kept for dashboards).
 * @deprecated — use BackendCategory + subCategory string from registry instead.
 */
export type EdgeFunctionCategory =
  | "admin"
  | "advisor"
  | "agent"
  | "ai"
  | "cloud"
  | "connector"
  | "finance"
  | "notification"
  | "os"
  | "platform"
  | "user"
  | "compliance"
  | "intelligence";

/**
 * Strict BackendCategory mapping for every edge function on disk.
 * This is the authoritative classification per Phase 1 audit.
 */
export const EDGE_FUNCTION_BACKEND_CATEGORY: Record<string, ClassificationVerdict> = {
  // ── ADMIN BFF (canonical singleton) ──────────────────────────
  "admin-bff-gateway": "ADMIN_BFF",

  // ── PUBLIC BFFs ──────────────────────────────────────────────
  "user-bff-gateway": "PUBLIC_BFF",
  "intelligence-api": "PUBLIC_BFF",
  "support-gateway": "PUBLIC_BFF",
  "license-gateway": "PUBLIC_BFF",

  // ── Legacy generic gateways → wrappers (Phase 3-4) ───────────
  "main": "DEPRECATE_AND_REDIRECT",
  "api-gateway": "WRAPPER_ONLY",
  "admin-api": "WRAPPER_ONLY",
  "admin-gateway": "WRAPPER_ONLY",

  // ── ORCHESTRATION FUNCTIONS ──────────────────────────────────
  "agent-executor": "ORCHESTRATION_FUNCTION",
  "brain-core": "ORCHESTRATION_FUNCTION",
  "scheduler-dispatch": "ORCHESTRATION_FUNCTION",
  "advisor-agent-loop": "ORCHESTRATION_FUNCTION",
  "advisor-deep-intelligence": "ORCHESTRATION_FUNCTION",
  "event-processor": "ORCHESTRATION_FUNCTION",
  "digital-twin-engine": "ORCHESTRATION_FUNCTION",
  "simulation-engine-api": "ORCHESTRATION_FUNCTION",
  "admin-ai-workforce-run": "ORCHESTRATION_FUNCTION",
  "agent-scheduler": "ORCHESTRATION_FUNCTION",
  "agent-signal": "ORCHESTRATION_FUNCTION",
  "ecosystem-operations": "ORCHESTRATION_FUNCTION",

  // ── CONNECTOR / WEBHOOK FUNCTIONS ────────────────────────────
  "connector-batch": "CONNECTOR_WEBHOOK_FUNCTION",
  "connector-discover": "CONNECTOR_WEBHOOK_FUNCTION",
  "connector-health": "CONNECTOR_WEBHOOK_FUNCTION",
  "connector-oauth": "CONNECTOR_WEBHOOK_FUNCTION",
  "connector-operations": "CONNECTOR_WEBHOOK_FUNCTION",
  "connector-proxy": "CONNECTOR_WEBHOOK_FUNCTION",
  "connector-sync": "CONNECTOR_WEBHOOK_FUNCTION",
  "connector-transform": "CONNECTOR_WEBHOOK_FUNCTION",
  "crm-sync": "CONNECTOR_WEBHOOK_FUNCTION",
  "provider-family-operations": "CONNECTOR_WEBHOOK_FUNCTION",
  "agent-heartbeat": "CONNECTOR_WEBHOOK_FUNCTION",

  // ── RUNTIME / SYSTEM FUNCTIONS ───────────────────────────────
  "os-command": "RUNTIME_SYSTEM_FUNCTION",
  "os-status": "RUNTIME_SYSTEM_FUNCTION",
  "os-agent-channel": "RUNTIME_SYSTEM_FUNCTION",
  "ambient-os-operations": "SPLIT_REQUIRED",
  "runtime-probes": "RUNTIME_SYSTEM_FUNCTION",
  "device-telemetry": "RUNTIME_SYSTEM_FUNCTION",
  "system-updates": "RUNTIME_SYSTEM_FUNCTION",
  "self-healing": "RUNTIME_SYSTEM_FUNCTION",
  "db-truth-introspect": "DOMAIN_FUNCTION",

  // ── DOMAIN FUNCTIONS — finance ───────────────────────────────
  "cashflow-calculate": "DOMAIN_FUNCTION",
  "cost-alert": "DOMAIN_FUNCTION",
  "invoice-generate": "DOMAIN_FUNCTION",
  "msa-operations": "DOMAIN_FUNCTION",
  "payment-process": "DOMAIN_FUNCTION",
  "payment-kill-switch": "DOMAIN_FUNCTION",
  "revenue-caller": "DOMAIN_FUNCTION",
  "tax-estimate": "DOMAIN_FUNCTION",
  "investment-portfolio-api": "DOMAIN_FUNCTION",

  // ── DOMAIN FUNCTIONS — user ──────────────────────────────────
  "booking-manage": "DOMAIN_FUNCTION",
  "get-weather": "DOMAIN_FUNCTION",
  "chat-advisor": "DOMAIN_FUNCTION",
  "personal-brain": "DOMAIN_FUNCTION",
  "tasks-workflow-api": "DOMAIN_FUNCTION",
  "communications-api": "DOMAIN_FUNCTION",
  "app-store-api": "DOMAIN_FUNCTION",
  "business-board-api": "DOMAIN_FUNCTION",
  "business-advisor-intelligence": "DOMAIN_FUNCTION",

  // ── DOMAIN FUNCTIONS — advisor / agent ───────────────────────
  "advisor-avatar-generate": "DOMAIN_FUNCTION",
  "advisor-conversation": "DOMAIN_FUNCTION",
  "advisor-knowledge-manage": "DOMAIN_FUNCTION",
  "advisor-weekly-report": "DOMAIN_FUNCTION",
  "agent-intelligence": "DOMAIN_FUNCTION",

  // ── DOMAIN FUNCTIONS — admin ─────────────────────────────────
  "admin-intelligence": "DOMAIN_FUNCTION",
  "admin-users": "DOMAIN_FUNCTION",

  // ── DOMAIN FUNCTIONS — cloud control plane ───────────────────
  "cloud-admin-api": "DOMAIN_FUNCTION",
  "cloud-device-api": "DOMAIN_FUNCTION",
  "cloud-lifecycle-api": "DOMAIN_FUNCTION",
  "cloud-storage-api": "DOMAIN_FUNCTION",
  "cloud-sync-api": "DOMAIN_FUNCTION",
  "cloud-tenant-api": "DOMAIN_FUNCTION",
  "cloud-worker-api": "DOMAIN_FUNCTION",

  // ── DOMAIN FUNCTIONS — AI gateway / health / budget ──────────
  "ai-gateway": "DOMAIN_FUNCTION",
  "ai-health": "DOMAIN_FUNCTION",
  "check-ai-budget": "DOMAIN_FUNCTION",

  // ── DOMAIN FUNCTIONS — platform / files / events ─────────────
  "file-ingestion": "DOMAIN_FUNCTION",
  "seed-user-data": "DOMAIN_FUNCTION",
  "health-check": "DOMAIN_FUNCTION",

  // ── DOMAIN FUNCTIONS — notifications ─────────────────────────
  "push-dispatch": "DOMAIN_FUNCTION",
  "push-track": "DOMAIN_FUNCTION",
  "vapid-public-key": "DOMAIN_FUNCTION",

  // ── DOMAIN FUNCTIONS — compliance ────────────────────────────
  "gdpr-delete": "DOMAIN_FUNCTION",
  "gdpr-export": "DOMAIN_FUNCTION",
  "verification-recorder": "DOMAIN_FUNCTION",
  "account-delete": "DOMAIN_FUNCTION",
  "admin-reset-user-setup": "DOMAIN_FUNCTION",
  "admin-revoke-session": "DOMAIN_FUNCTION",
  "ai-receipt-completeness-snapshot": "DOMAIN_FUNCTION",
  "ai-runtime-nightly-verify": "DOMAIN_FUNCTION",
  "alert-actions": "DOMAIN_FUNCTION",
  "alert-ingest": "DOMAIN_FUNCTION",
  "alert-route": "DOMAIN_FUNCTION",
  "alert-router": "DOMAIN_FUNCTION",
  "apm-metrics-ingest": "DOMAIN_FUNCTION",
  "app-ingest-pwa": "DOMAIN_FUNCTION",
  "app-ingest-web": "DOMAIN_FUNCTION",
  "app-install": "DOMAIN_FUNCTION",
  "app-launch-resolve": "DOMAIN_FUNCTION",
  "app-manifest-sync": "DOMAIN_FUNCTION",
  "app-manifest-verifier": "DOMAIN_FUNCTION",
  "app-permissions-sync": "DOMAIN_FUNCTION",
  "app-screenshot-capture": "DOMAIN_FUNCTION",
  "app-store-catalog": "DOMAIN_FUNCTION",
  "app-uninstall": "DOMAIN_FUNCTION",
  "app-update-check": "DOMAIN_FUNCTION",
  "attestation-packet-builder": "DOMAIN_FUNCTION",
  "audit-export-bundler": "DOMAIN_FUNCTION",
  "audit-log-export": "DOMAIN_FUNCTION",
  "beta-apply": "DOMAIN_FUNCTION",
  "boardroom-cockpit-telemetry": "DOMAIN_FUNCTION",
  "boardroom-followthrough-dispatch": "DOMAIN_FUNCTION",
  "boardroom-followthrough-sla": "DOMAIN_FUNCTION",
  "boardroom-outcome-record": "DOMAIN_FUNCTION",
  "boardroom-replay": "DOMAIN_FUNCTION",
  "boardroom-session": "DOMAIN_FUNCTION",
  "canary-chaos-cron": "RUNTIME_SYSTEM_FUNCTION",
  "chaos-drill-runner": "RUNTIME_SYSTEM_FUNCTION",
  "compliance-evidence-collector": "DOMAIN_FUNCTION",
  "compliance-evidence-cron": "RUNTIME_SYSTEM_FUNCTION",
  "connector-reauth-tracker": "CONNECTOR_WEBHOOK_FUNCTION",
  "connector-refresh-nightly-verify": "CONNECTOR_WEBHOOK_FUNCTION",
  "connector-token-refresh": "CONNECTOR_WEBHOOK_FUNCTION",
  "crash-report-ingest": "DOMAIN_FUNCTION",
  "cron-receipt-collector": "RUNTIME_SYSTEM_FUNCTION",
  "data-cleanup": "DOMAIN_FUNCTION",
  "data-export": "DOMAIN_FUNCTION",
  "db-introspection": "DOMAIN_FUNCTION",
  "desktop-update-manifest": "DOMAIN_FUNCTION",
  "dr-drill-cron": "RUNTIME_SYSTEM_FUNCTION",
  "dr-drill-executor": "RUNTIME_SYSTEM_FUNCTION",
  "dr-drill-runner": "RUNTIME_SYSTEM_FUNCTION",
  "error-ingest": "DOMAIN_FUNCTION",
  "escalation-engine": "DOMAIN_FUNCTION",
  "evidence-graph-builder": "DOMAIN_FUNCTION",
  "external-workforce-api": "DOMAIN_FUNCTION",
  "external-workforce-webhook-dispatcher": "CONNECTOR_WEBHOOK_FUNCTION",
  "federated-knowledge-aggregator": "DOMAIN_FUNCTION",
  "generate-support-bundle": "DOMAIN_FUNCTION",
  "health-beat": "RUNTIME_SYSTEM_FUNCTION",
  "health-cron": "RUNTIME_SYSTEM_FUNCTION",
  "health-live": "RUNTIME_SYSTEM_FUNCTION",
  "health-ready": "RUNTIME_SYSTEM_FUNCTION",
  "internal-agent-canary-runner": "ORCHESTRATION_FUNCTION",
  "internal-agent-chaos-scheduler": "ORCHESTRATION_FUNCTION",
  "internal-agent-consensus-engine": "ORCHESTRATION_FUNCTION",
  "internal-agent-cost-optimizer": "ORCHESTRATION_FUNCTION",
  "internal-agent-dependency-scanner": "ORCHESTRATION_FUNCTION",
  "internal-agent-execute-action": "ORCHESTRATION_FUNCTION",
  "internal-agent-loop": "ORCHESTRATION_FUNCTION",
  "internal-agent-policy-architect": "ORCHESTRATION_FUNCTION",
  "internal-agent-reflect": "ORCHESTRATION_FUNCTION",
  "internal-agent-self-healer": "ORCHESTRATION_FUNCTION",
  "internal-agent-slo-evaluator": "ORCHESTRATION_FUNCTION",
  "internal-agent-suggestion-generator": "ORCHESTRATION_FUNCTION",
  "internal-agent-tenant-federation": "ORCHESTRATION_FUNCTION",
  "internal-agent-trust-evaluator": "ORCHESTRATION_FUNCTION",
  "internal-agent-weekly-digest": "ORCHESTRATION_FUNCTION",
  "investor-request": "DOMAIN_FUNCTION",
  "kill-switch-state": "DOMAIN_FUNCTION",
  "kill-switch-toggle": "DOMAIN_FUNCTION",
  "mobile-deferral-attestor": "DOMAIN_FUNCTION",
  "oauth-refresh-probe": "CONNECTOR_WEBHOOK_FUNCTION",
  "onboarding-branch-tracker": "DOMAIN_FUNCTION",
  "onboarding-resume-checkpoint": "DOMAIN_FUNCTION",
  "os-update-manifest": "DOMAIN_FUNCTION",
  "owner-copilot-bff": "PUBLIC_BFF",
  "owner-copilot-session-tracker": "PUBLIC_BFF",
  "package-verify": "DOMAIN_FUNCTION",
  "press-inquiry": "DOMAIN_FUNCTION",
  "production-launch-attestor": "DOMAIN_FUNCTION",
  "prompt-versioning": "DOMAIN_FUNCTION",
  "recovery-evidence-ingest": "DOMAIN_FUNCTION",
  "release-artifact-signer": "DOMAIN_FUNCTION",
  "release-artifact-verifier": "DOMAIN_FUNCTION",
  "release-env-gate": "DOMAIN_FUNCTION",
  "release-evidence-graph-snapshot": "DOMAIN_FUNCTION",
  "routing-policy-update": "DOMAIN_FUNCTION",
  "runbook-drill": "DOMAIN_FUNCTION",
  "secret-rotation-orchestrator": "DOMAIN_FUNCTION",
  "security-anomaly-rotation-trigger": "DOMAIN_FUNCTION",
  "security-council-tick": "DOMAIN_FUNCTION",
  "security-fabric-runtime-probe": "RUNTIME_SYSTEM_FUNCTION",
  "security-kill-switch-recommender": "DOMAIN_FUNCTION",
  "seed-advisor-registry": "DOMAIN_FUNCTION",
  "seed-connector-registry": "CONNECTOR_WEBHOOK_FUNCTION",
  "sla-evaluator": "RUNTIME_SYSTEM_FUNCTION",
  "support-recovery-api": "DOMAIN_FUNCTION",
  "tenant-self-service-bff": "PUBLIC_BFF",
  "trace-ingest": "DOMAIN_FUNCTION",
  "uptime-rollup": "DOMAIN_FUNCTION",
  "waitlist-signup": "DOMAIN_FUNCTION",
  "waitlist-stats": "DOMAIN_FUNCTION",
  "webauthn-challenge": "DOMAIN_FUNCTION",
  "webhook-ingest": "CONNECTOR_WEBHOOK_FUNCTION",
  "webhook-process": "CONNECTOR_WEBHOOK_FUNCTION",
  "webhook-replay": "CONNECTOR_WEBHOOK_FUNCTION",
  "webhook-retry-processor": "CONNECTOR_WEBHOOK_FUNCTION",
  "workflow-execute": "ORCHESTRATION_FUNCTION",
  "workflow-repair": "ORCHESTRATION_FUNCTION",
  "workflow-replay": "ORCHESTRATION_FUNCTION",
  "workflow-stuck-detector": "ORCHESTRATION_FUNCTION",
};

/**
 * Legacy finer-grained category map.
 * @deprecated retained only for the existing dashboard.
 */
export const EDGE_FUNCTION_CATEGORIES: Record<string, EdgeFunctionCategory> = {
  "admin-ai-workforce-run": "admin",
  "admin-api": "admin",
  "admin-bff-gateway": "admin",
  "admin-gateway": "admin",
  "admin-intelligence": "admin",
  "admin-users": "admin",
  "advisor-agent-loop": "advisor",
  "advisor-avatar-generate": "advisor",
  "advisor-conversation": "advisor",
  "advisor-deep-intelligence": "advisor",
  "advisor-knowledge-manage": "advisor",
  "advisor-weekly-report": "advisor",
  "agent-executor": "agent",
  "agent-heartbeat": "agent",
  "agent-intelligence": "agent",
  "agent-scheduler": "agent",
  "agent-signal": "agent",
  "ai-gateway": "ai",
  "ai-health": "ai",
  "check-ai-budget": "ai",
  "ambient-os-operations": "os",
  "api-gateway": "platform",
  "app-store-api": "user",
  "booking-manage": "user",
  "brain-core": "intelligence",
  "business-advisor-intelligence": "intelligence",
  "business-board-api": "intelligence",
  "cashflow-calculate": "finance",
  "chat-advisor": "advisor",
  "cloud-admin-api": "cloud",
  "cloud-device-api": "cloud",
  "cloud-lifecycle-api": "cloud",
  "cloud-storage-api": "cloud",
  "cloud-sync-api": "cloud",
  "cloud-tenant-api": "cloud",
  "cloud-worker-api": "cloud",
  "communications-api": "user",
  "connector-batch": "connector",
  "connector-discover": "connector",
  "connector-health": "connector",
  "connector-oauth": "connector",
  "connector-operations": "connector",
  "connector-proxy": "connector",
  "connector-sync": "connector",
  "connector-transform": "connector",
  "cost-alert": "finance",
  "crm-sync": "connector",
  "db-truth-introspect": "platform",
  "device-telemetry": "cloud",
  "digital-twin-engine": "intelligence",
  "ecosystem-operations": "platform",
  "event-processor": "platform",
  "file-ingestion": "platform",
  "gdpr-delete": "compliance",
  "gdpr-export": "compliance",
  "get-weather": "user",
  "health-check": "platform",
  "intelligence-api": "intelligence",
  "investment-portfolio-api": "finance",
  "invoice-generate": "finance",
  "license-gateway": "user",
  "main": "platform",
  "msa-operations": "finance",
  "os-agent-channel": "os",
  "os-command": "os",
  "os-status": "os",
  "payment-kill-switch": "finance",
  "payment-process": "finance",
  "personal-brain": "intelligence",
  "provider-family-operations": "connector",
  "push-dispatch": "notification",
  "push-track": "notification",
  "revenue-caller": "finance",
  "runtime-probes": "os",
  "scheduler-dispatch": "platform",
  "seed-user-data": "platform",
  "self-healing": "os",
  "simulation-engine-api": "intelligence",
  "support-gateway": "user",
  "system-updates": "os",
  "tasks-workflow-api": "user",
  "tax-estimate": "finance",
  "user-bff-gateway": "user",
  "vapid-public-key": "notification",
  "verification-recorder": "compliance",
  "account-delete": "platform",
  "admin-reset-user-setup": "admin",
  "admin-revoke-session": "admin",
  "ai-receipt-completeness-snapshot": "ai",
  "ai-runtime-nightly-verify": "ai",
  "alert-actions": "platform",
  "alert-ingest": "platform",
  "alert-route": "platform",
  "alert-router": "platform",
  "apm-metrics-ingest": "platform",
  "app-ingest-pwa": "platform",
  "app-ingest-web": "platform",
  "app-install": "platform",
  "app-launch-resolve": "platform",
  "app-manifest-sync": "platform",
  "app-manifest-verifier": "platform",
  "app-permissions-sync": "platform",
  "app-screenshot-capture": "platform",
  "app-store-catalog": "platform",
  "app-uninstall": "platform",
  "app-update-check": "platform",
  "attestation-packet-builder": "platform",
  "audit-export-bundler": "compliance",
  "audit-log-export": "compliance",
  "beta-apply": "platform",
  "boardroom-cockpit-telemetry": "advisor",
  "boardroom-followthrough-dispatch": "advisor",
  "boardroom-followthrough-sla": "advisor",
  "boardroom-outcome-record": "advisor",
  "boardroom-replay": "advisor",
  "boardroom-session": "advisor",
  "canary-chaos-cron": "os",
  "chaos-drill-runner": "os",
  "compliance-evidence-collector": "compliance",
  "compliance-evidence-cron": "platform",
  "connector-reauth-tracker": "connector",
  "connector-refresh-nightly-verify": "connector",
  "connector-token-refresh": "connector",
  "crash-report-ingest": "platform",
  "cron-receipt-collector": "platform",
  "data-cleanup": "platform",
  "data-export": "platform",
  "db-introspection": "platform",
  "desktop-update-manifest": "platform",
  "dr-drill-cron": "os",
  "dr-drill-executor": "os",
  "dr-drill-runner": "os",
  "error-ingest": "platform",
  "escalation-engine": "platform",
  "evidence-graph-builder": "compliance",
  "external-workforce-api": "platform",
  "external-workforce-webhook-dispatcher": "platform",
  "federated-knowledge-aggregator": "platform",
  "generate-support-bundle": "platform",
  "health-beat": "os",
  "health-cron": "os",
  "health-live": "os",
  "health-ready": "os",
  "internal-agent-canary-runner": "agent",
  "internal-agent-chaos-scheduler": "agent",
  "internal-agent-consensus-engine": "agent",
  "internal-agent-cost-optimizer": "agent",
  "internal-agent-dependency-scanner": "agent",
  "internal-agent-execute-action": "agent",
  "internal-agent-loop": "agent",
  "internal-agent-policy-architect": "agent",
  "internal-agent-reflect": "agent",
  "internal-agent-self-healer": "agent",
  "internal-agent-slo-evaluator": "agent",
  "internal-agent-suggestion-generator": "agent",
  "internal-agent-tenant-federation": "agent",
  "internal-agent-trust-evaluator": "agent",
  "internal-agent-weekly-digest": "agent",
  "investor-request": "platform",
  "kill-switch-state": "admin",
  "kill-switch-toggle": "admin",
  "mobile-deferral-attestor": "platform",
  "oauth-refresh-probe": "connector",
  "onboarding-branch-tracker": "user",
  "onboarding-resume-checkpoint": "user",
  "os-update-manifest": "platform",
  "owner-copilot-bff": "user",
  "owner-copilot-session-tracker": "user",
  "package-verify": "platform",
  "press-inquiry": "platform",
  "production-launch-attestor": "platform",
  "prompt-versioning": "platform",
  "recovery-evidence-ingest": "compliance",
  "release-artifact-signer": "platform",
  "release-artifact-verifier": "platform",
  "release-env-gate": "platform",
  "release-evidence-graph-snapshot": "platform",
  "routing-policy-update": "platform",
  "runbook-drill": "platform",
  "secret-rotation-orchestrator": "platform",
  "security-anomaly-rotation-trigger": "platform",
  "security-council-tick": "platform",
  "security-fabric-runtime-probe": "os",
  "security-kill-switch-recommender": "admin",
  "seed-advisor-registry": "advisor",
  "seed-connector-registry": "connector",
  "sla-evaluator": "os",
  "support-recovery-api": "compliance",
  "tenant-self-service-bff": "user",
  "trace-ingest": "platform",
  "uptime-rollup": "platform",
  "waitlist-signup": "platform",
  "waitlist-stats": "platform",
  "webauthn-challenge": "platform",
  "webhook-ingest": "platform",
  "webhook-process": "platform",
  "webhook-replay": "platform",
  "webhook-retry-processor": "platform",
  "workflow-execute": "platform",
  "workflow-repair": "platform",
  "workflow-replay": "platform",
  "workflow-stuck-detector": "platform",
} as const;

export function getFunctionsByCategory(category: EdgeFunctionCategory): string[] {
  return Object.entries(EDGE_FUNCTION_CATEGORIES)
    .filter(([, cat]) => cat === category)
    .map(([name]) => name);
}

export function getCategoryForFunction(name: string): EdgeFunctionCategory | undefined {
  return EDGE_FUNCTION_CATEGORIES[name];
}

export function getCategoryCounts(): Record<EdgeFunctionCategory, number> {
  const counts = {} as Record<EdgeFunctionCategory, number>;
  for (const cat of Object.values(EDGE_FUNCTION_CATEGORIES)) {
    counts[cat] = (counts[cat] || 0) + 1;
  }
  return counts;
}

export function getBackendCategory(name: string): ClassificationVerdict | undefined {
  return EDGE_FUNCTION_BACKEND_CATEGORY[name];
}

export function getStrictBackendCategory(name: string): BackendCategory | null {
  const v = EDGE_FUNCTION_BACKEND_CATEGORY[name];
  if (!v) return null;
  if (
    v === "PUBLIC_BFF" || v === "ADMIN_BFF" || v === "DOMAIN_FUNCTION" ||
    v === "ORCHESTRATION_FUNCTION" || v === "CONNECTOR_WEBHOOK_FUNCTION" ||
    v === "RUNTIME_SYSTEM_FUNCTION"
  ) return v;
  return null;
}

export function getFunctionsByBackendCategory(category: BackendCategory): string[] {
  return Object.entries(EDGE_FUNCTION_BACKEND_CATEGORY)
    .filter(([, c]) => c === category)
    .map(([n]) => n);
}

export function getBackendCategoryCounts(): Record<ClassificationVerdict, number> {
  const counts = {} as Record<ClassificationVerdict, number>;
  for (const v of Object.values(EDGE_FUNCTION_BACKEND_CATEGORY)) {
    counts[v] = (counts[v] || 0) + 1;
  }
  return counts;
}
