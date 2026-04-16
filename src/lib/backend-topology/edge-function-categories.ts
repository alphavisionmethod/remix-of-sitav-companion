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
