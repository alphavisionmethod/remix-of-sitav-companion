// ═══════════════════════════════════════════════════════════════
// SITA OS — Edge Function Bounded Contexts
// Maps each function to its owning bounded context/domain
// ═══════════════════════════════════════════════════════════════

export type BoundedContext =
  | "admin-plane"
  | "advisor-council"
  | "agent-runtime"
  | "ai-gateway"
  | "cloud-infrastructure"
  | "connector-fabric"
  | "finance-engine"
  | "notification-dispatch"
  | "os-kernel"
  | "platform-services"
  | "user-experience"
  | "compliance-privacy"
  | "intelligence-pipeline";

export const EDGE_FUNCTION_BOUNDED_CONTEXTS: Record<string, BoundedContext> = {
  "admin-ai-workforce-run": "admin-plane",
  "admin-api": "admin-plane",
  "admin-bff-gateway": "admin-plane",
  "admin-gateway": "admin-plane",
  "admin-intelligence": "admin-plane",
  "admin-users": "admin-plane",
  "advisor-agent-loop": "advisor-council",
  "advisor-avatar-generate": "advisor-council",
  "advisor-conversation": "advisor-council",
  "advisor-deep-intelligence": "advisor-council",
  "advisor-knowledge-manage": "advisor-council",
  "advisor-weekly-report": "advisor-council",
  "agent-executor": "agent-runtime",
  "agent-heartbeat": "agent-runtime",
  "agent-intelligence": "agent-runtime",
  "agent-scheduler": "agent-runtime",
  "agent-signal": "agent-runtime",
  "ai-gateway": "ai-gateway",
  "ai-health": "ai-gateway",
  "check-ai-budget": "ai-gateway",
  "ambient-os-operations": "os-kernel",
  "api-gateway": "platform-services",
  "app-store-api": "user-experience",
  "booking-manage": "user-experience",
  "brain-core": "intelligence-pipeline",
  "business-advisor-intelligence": "intelligence-pipeline",
  "business-board-api": "intelligence-pipeline",
  "cashflow-calculate": "finance-engine",
  "chat-advisor": "advisor-council",
  "cloud-admin-api": "cloud-infrastructure",
  "cloud-device-api": "cloud-infrastructure",
  "cloud-lifecycle-api": "cloud-infrastructure",
  "cloud-storage-api": "cloud-infrastructure",
  "cloud-sync-api": "cloud-infrastructure",
  "cloud-tenant-api": "cloud-infrastructure",
  "cloud-worker-api": "cloud-infrastructure",
  "communications-api": "user-experience",
  "connector-batch": "connector-fabric",
  "connector-discover": "connector-fabric",
  "connector-health": "connector-fabric",
  "connector-oauth": "connector-fabric",
  "connector-operations": "connector-fabric",
  "connector-proxy": "connector-fabric",
  "connector-sync": "connector-fabric",
  "connector-transform": "connector-fabric",
  "cost-alert": "finance-engine",
  "crm-sync": "connector-fabric",
  "device-telemetry": "os-kernel",
  "digital-twin-engine": "intelligence-pipeline",
  "ecosystem-operations": "platform-services",
  "event-processor": "platform-services",
  "file-ingestion": "platform-services",
  "gdpr-delete": "compliance-privacy",
  "gdpr-export": "compliance-privacy",
  "get-weather": "user-experience",
  "health-check": "platform-services",
  "intelligence-api": "intelligence-pipeline",
  "investment-portfolio-api": "finance-engine",
  "invoice-generate": "finance-engine",
  "license-gateway": "user-experience",
  "main": "platform-services",
  "msa-operations": "finance-engine",
  "os-agent-channel": "os-kernel",
  "os-command": "os-kernel",
  "os-status": "os-kernel",
  "payment-kill-switch": "finance-engine",
  "payment-process": "finance-engine",
  "personal-brain": "intelligence-pipeline",
  "provider-family-operations": "connector-fabric",
  "push-dispatch": "notification-dispatch",
  "push-track": "notification-dispatch",
  "revenue-caller": "finance-engine",
  "runtime-probes": "os-kernel",
  "scheduler-dispatch": "platform-services",
  "seed-user-data": "platform-services",
  "self-healing": "os-kernel",
  "simulation-engine-api": "intelligence-pipeline",
  "support-gateway": "user-experience",
  "system-updates": "os-kernel",
  "tasks-workflow-api": "user-experience",
  "tax-estimate": "finance-engine",
  "user-bff-gateway": "user-experience",
  "vapid-public-key": "notification-dispatch",
  "verification-recorder": "compliance-privacy",
} as const;

export function getFunctionsByContext(context: BoundedContext): string[] {
  return Object.entries(EDGE_FUNCTION_BOUNDED_CONTEXTS)
    .filter(([, ctx]) => ctx === context)
    .map(([name]) => name);
}

export function getContextForFunction(name: string): BoundedContext | undefined {
  return EDGE_FUNCTION_BOUNDED_CONTEXTS[name];
}
