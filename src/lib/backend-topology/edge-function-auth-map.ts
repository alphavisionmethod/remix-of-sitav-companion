// ═══════════════════════════════════════════════════════════════
// SITA OS — Edge Function Auth Map
// Auth requirements per function
// ═══════════════════════════════════════════════════════════════

export type AuthRequirement = "jwt" | "anon" | "service-role" | "webhook-secret" | "api-key";

export interface EdgeFunctionAuthEntry {
  readonly auth: AuthRequirement;
  readonly requiresUserContext: boolean;
  readonly adminOnly: boolean;
}

export const EDGE_FUNCTION_AUTH_MAP: Record<string, EdgeFunctionAuthEntry> = {
  "admin-ai-workforce-run": { auth: "jwt", requiresUserContext: true, adminOnly: true },
  "admin-api": { auth: "jwt", requiresUserContext: true, adminOnly: true },
  "admin-bff-gateway": { auth: "jwt", requiresUserContext: true, adminOnly: true },
  "admin-gateway": { auth: "jwt", requiresUserContext: true, adminOnly: true },
  "admin-intelligence": { auth: "jwt", requiresUserContext: true, adminOnly: true },
  "admin-users": { auth: "jwt", requiresUserContext: true, adminOnly: true },
  "advisor-agent-loop": { auth: "jwt", requiresUserContext: true, adminOnly: false },
  "advisor-avatar-generate": { auth: "jwt", requiresUserContext: true, adminOnly: false },
  "advisor-conversation": { auth: "jwt", requiresUserContext: true, adminOnly: false },
  "advisor-deep-intelligence": { auth: "jwt", requiresUserContext: true, adminOnly: false },
  "advisor-knowledge-manage": { auth: "jwt", requiresUserContext: true, adminOnly: false },
  "advisor-weekly-report": { auth: "jwt", requiresUserContext: true, adminOnly: false },
  "agent-executor": { auth: "service-role", requiresUserContext: false, adminOnly: false },
  "agent-heartbeat": { auth: "service-role", requiresUserContext: false, adminOnly: false },
  "agent-intelligence": { auth: "service-role", requiresUserContext: false, adminOnly: false },
  "agent-scheduler": { auth: "service-role", requiresUserContext: false, adminOnly: false },
  "agent-signal": { auth: "service-role", requiresUserContext: false, adminOnly: false },
  "ai-gateway": { auth: "jwt", requiresUserContext: true, adminOnly: false },
  "ai-health": { auth: "anon", requiresUserContext: false, adminOnly: false },
  "check-ai-budget": { auth: "jwt", requiresUserContext: true, adminOnly: false },
  "ambient-os-operations": { auth: "service-role", requiresUserContext: false, adminOnly: false },
  "api-gateway": { auth: "api-key", requiresUserContext: false, adminOnly: false },
  "app-store-api": { auth: "jwt", requiresUserContext: true, adminOnly: false },
  "booking-manage": { auth: "jwt", requiresUserContext: true, adminOnly: false },
  "brain-core": { auth: "jwt", requiresUserContext: true, adminOnly: false },
  "business-advisor-intelligence": { auth: "jwt", requiresUserContext: true, adminOnly: false },
  "business-board-api": { auth: "jwt", requiresUserContext: true, adminOnly: false },
  "cashflow-calculate": { auth: "jwt", requiresUserContext: true, adminOnly: false },
  "chat-advisor": { auth: "jwt", requiresUserContext: true, adminOnly: false },
  "cloud-admin-api": { auth: "jwt", requiresUserContext: true, adminOnly: true },
  "cloud-device-api": { auth: "jwt", requiresUserContext: true, adminOnly: false },
  "cloud-lifecycle-api": { auth: "jwt", requiresUserContext: true, adminOnly: true },
  "cloud-storage-api": { auth: "jwt", requiresUserContext: true, adminOnly: false },
  "cloud-sync-api": { auth: "jwt", requiresUserContext: true, adminOnly: false },
  "cloud-tenant-api": { auth: "jwt", requiresUserContext: true, adminOnly: true },
  "cloud-worker-api": { auth: "service-role", requiresUserContext: false, adminOnly: false },
  "communications-api": { auth: "jwt", requiresUserContext: true, adminOnly: false },
  "connector-batch": { auth: "jwt", requiresUserContext: true, adminOnly: false },
  "connector-discover": { auth: "jwt", requiresUserContext: true, adminOnly: false },
  "connector-health": { auth: "jwt", requiresUserContext: true, adminOnly: false },
  "connector-oauth": { auth: "jwt", requiresUserContext: true, adminOnly: false },
  "connector-operations": { auth: "jwt", requiresUserContext: true, adminOnly: false },
  "connector-proxy": { auth: "jwt", requiresUserContext: true, adminOnly: false },
  "connector-sync": { auth: "jwt", requiresUserContext: true, adminOnly: false },
  "connector-transform": { auth: "jwt", requiresUserContext: true, adminOnly: false },
  "cost-alert": { auth: "service-role", requiresUserContext: false, adminOnly: false },
  "crm-sync": { auth: "jwt", requiresUserContext: true, adminOnly: false },
  "db-truth-introspect": { auth: "jwt", requiresUserContext: true, adminOnly: true },
  "device-telemetry": { auth: "jwt", requiresUserContext: true, adminOnly: false },
  "digital-twin-engine": { auth: "jwt", requiresUserContext: true, adminOnly: false },
  "ecosystem-operations": { auth: "jwt", requiresUserContext: true, adminOnly: false },
  "event-processor": { auth: "service-role", requiresUserContext: false, adminOnly: false },
  "file-ingestion": { auth: "jwt", requiresUserContext: true, adminOnly: false },
  "gdpr-delete": { auth: "jwt", requiresUserContext: true, adminOnly: false },
  "gdpr-export": { auth: "jwt", requiresUserContext: true, adminOnly: false },
  "get-weather": { auth: "anon", requiresUserContext: false, adminOnly: false },
  "health-check": { auth: "anon", requiresUserContext: false, adminOnly: false },
  "intelligence-api": { auth: "jwt", requiresUserContext: true, adminOnly: false },
  "investment-portfolio-api": { auth: "jwt", requiresUserContext: true, adminOnly: false },
  "invoice-generate": { auth: "jwt", requiresUserContext: true, adminOnly: false },
  "license-gateway": { auth: "jwt", requiresUserContext: true, adminOnly: false },
  "main": { auth: "anon", requiresUserContext: false, adminOnly: false },
  "msa-operations": { auth: "jwt", requiresUserContext: true, adminOnly: false },
  "os-agent-channel": { auth: "service-role", requiresUserContext: false, adminOnly: false },
  "os-command": { auth: "jwt", requiresUserContext: true, adminOnly: true },
  "os-status": { auth: "anon", requiresUserContext: false, adminOnly: false },
  "payment-kill-switch": { auth: "jwt", requiresUserContext: true, adminOnly: true },
  "payment-process": { auth: "jwt", requiresUserContext: true, adminOnly: false },
  "personal-brain": { auth: "jwt", requiresUserContext: true, adminOnly: false },
  "provider-family-operations": { auth: "jwt", requiresUserContext: true, adminOnly: false },
  "push-dispatch": { auth: "service-role", requiresUserContext: false, adminOnly: false },
  "push-track": { auth: "jwt", requiresUserContext: true, adminOnly: false },
  "revenue-caller": { auth: "jwt", requiresUserContext: true, adminOnly: false },
  "runtime-probes": { auth: "anon", requiresUserContext: false, adminOnly: false },
  "scheduler-dispatch": { auth: "service-role", requiresUserContext: false, adminOnly: false },
  "seed-user-data": { auth: "jwt", requiresUserContext: true, adminOnly: true },
  "self-healing": { auth: "service-role", requiresUserContext: false, adminOnly: false },
  "simulation-engine-api": { auth: "jwt", requiresUserContext: true, adminOnly: false },
  "support-gateway": { auth: "jwt", requiresUserContext: true, adminOnly: false },
  "system-updates": { auth: "service-role", requiresUserContext: false, adminOnly: false },
  "tasks-workflow-api": { auth: "jwt", requiresUserContext: true, adminOnly: false },
  "tax-estimate": { auth: "jwt", requiresUserContext: true, adminOnly: false },
  "user-bff-gateway": { auth: "jwt", requiresUserContext: true, adminOnly: false },
  "vapid-public-key": { auth: "anon", requiresUserContext: false, adminOnly: false },
  "verification-recorder": { auth: "jwt", requiresUserContext: true, adminOnly: false },
} as const;

export function getAuthForFunction(name: string): EdgeFunctionAuthEntry | undefined {
  return EDGE_FUNCTION_AUTH_MAP[name];
}

export function getFunctionsByAuth(auth: AuthRequirement): string[] {
  return Object.entries(EDGE_FUNCTION_AUTH_MAP)
    .filter(([, entry]) => entry.auth === auth)
    .map(([name]) => name);
}

export function getAdminOnlyFunctions(): string[] {
  return Object.entries(EDGE_FUNCTION_AUTH_MAP)
    .filter(([, entry]) => entry.adminOnly)
    .map(([name]) => name);
}
