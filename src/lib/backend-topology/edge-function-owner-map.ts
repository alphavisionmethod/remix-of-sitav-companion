// ═══════════════════════════════════════════════════════════════
// SITA OS — Edge Function Owner Map
// Team/domain ownership for each function
// ═══════════════════════════════════════════════════════════════

export type OwnerTeam =
  | "platform-core"
  | "admin-governance"
  | "advisor-intelligence"
  | "agent-runtime"
  | "ai-engineering"
  | "cloud-infrastructure"
  | "connector-integrations"
  | "finance-engine"
  | "notification-services"
  | "os-kernel"
  | "compliance-security"
  | "user-experience";

export const EDGE_FUNCTION_OWNER_MAP: Record<string, OwnerTeam> = {
  "admin-ai-workforce-run": "admin-governance",
  "admin-api": "admin-governance",
  "admin-bff-gateway": "admin-governance",
  "admin-gateway": "admin-governance",
  "admin-intelligence": "admin-governance",
  "admin-users": "admin-governance",
  "advisor-agent-loop": "advisor-intelligence",
  "advisor-avatar-generate": "advisor-intelligence",
  "advisor-conversation": "advisor-intelligence",
  "advisor-deep-intelligence": "advisor-intelligence",
  "advisor-knowledge-manage": "advisor-intelligence",
  "advisor-weekly-report": "advisor-intelligence",
  "agent-executor": "agent-runtime",
  "agent-heartbeat": "agent-runtime",
  "agent-intelligence": "agent-runtime",
  "agent-scheduler": "agent-runtime",
  "agent-signal": "agent-runtime",
  "ai-gateway": "ai-engineering",
  "ai-health": "ai-engineering",
  "check-ai-budget": "ai-engineering",
  "ambient-os-operations": "os-kernel",
  "api-gateway": "platform-core",
  "booking-manage": "user-experience",
  "brain-core": "ai-engineering",
  "business-advisor-intelligence": "advisor-intelligence",
  "business-board-api": "advisor-intelligence",
  "cashflow-calculate": "finance-engine",
  "chat-advisor": "advisor-intelligence",
  "cloud-admin-api": "cloud-infrastructure",
  "cloud-device-api": "cloud-infrastructure",
  "cloud-lifecycle-api": "cloud-infrastructure",
  "cloud-storage-api": "cloud-infrastructure",
  "cloud-sync-api": "cloud-infrastructure",
  "cloud-tenant-api": "cloud-infrastructure",
  "cloud-worker-api": "cloud-infrastructure",
  "connector-batch": "connector-integrations",
  "connector-discover": "connector-integrations",
  "connector-health": "connector-integrations",
  "connector-oauth": "connector-integrations",
  "connector-operations": "connector-integrations",
  "connector-proxy": "connector-integrations",
  "connector-transform": "connector-integrations",
  "cost-alert": "finance-engine",
  "crm-sync": "connector-integrations",
  "device-telemetry": "cloud-infrastructure",
  "ecosystem-operations": "platform-core",
  "event-processor": "platform-core",
  "file-ingestion": "platform-core",
  "gdpr-delete": "compliance-security",
  "gdpr-export": "compliance-security",
  "get-weather": "user-experience",
  "intelligence-api": "ai-engineering",
  "invoice-generate": "finance-engine",
  "main": "platform-core",
  "msa-operations": "finance-engine",
  "os-agent-channel": "os-kernel",
  "os-command": "os-kernel",
  "os-status": "os-kernel",
  "payment-process": "finance-engine",
  "personal-brain": "ai-engineering",
  "provider-family-operations": "connector-integrations",
  "push-dispatch": "notification-services",
  "push-track": "notification-services",
  "revenue-caller": "finance-engine",
  "runtime-probes": "os-kernel",
  "scheduler-dispatch": "platform-core",
  "seed-user-data": "platform-core",
  "self-healing": "os-kernel",
  "support-gateway": "user-experience",
  "system-updates": "os-kernel",
  "tax-estimate": "finance-engine",
  "user-bff-gateway": "user-experience",
  "vapid-public-key": "notification-services",
  "verification-recorder": "compliance-security",
} as const;

export function getOwnerForFunction(name: string): OwnerTeam | undefined {
  return EDGE_FUNCTION_OWNER_MAP[name];
}

export function getFunctionsByOwner(owner: OwnerTeam): string[] {
  return Object.entries(EDGE_FUNCTION_OWNER_MAP)
    .filter(([, o]) => o === owner)
    .map(([name]) => name);
}

export function getOwnerCounts(): Record<OwnerTeam, number> {
  const counts = {} as Record<OwnerTeam, number>;
  for (const owner of Object.values(EDGE_FUNCTION_OWNER_MAP)) {
    counts[owner] = (counts[owner] || 0) + 1;
  }
  return counts;
}
