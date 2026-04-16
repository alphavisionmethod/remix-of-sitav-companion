// ═══════════════════════════════════════════════════════════════
// SITA OS — Edge Function Categories
// Classifies all 74 edge functions into functional categories
// ═══════════════════════════════════════════════════════════════

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
  "connector-batch": "connector",
  "connector-discover": "connector",
  "connector-health": "connector",
  "connector-oauth": "connector",
  "connector-operations": "connector",
  "connector-proxy": "connector",
  "connector-transform": "connector",
  "cost-alert": "finance",
  "crm-sync": "connector",
  "device-telemetry": "cloud",
  "ecosystem-operations": "platform",
  "event-processor": "platform",
  "file-ingestion": "platform",
  "gdpr-delete": "compliance",
  "gdpr-export": "compliance",
  "get-weather": "user",
  "intelligence-api": "intelligence",
  "invoice-generate": "finance",
  "main": "platform",
  "msa-operations": "finance",
  "os-agent-channel": "os",
  "os-command": "os",
  "os-status": "os",
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
  "support-gateway": "user",
  "system-updates": "os",
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
