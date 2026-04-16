// ═══════════════════════════════════════════════════════════════
// SITA OS — Edge Function Registry
// Master registry of all 74 edge functions
// ═══════════════════════════════════════════════════════════════

export type EdgeFunctionStatus = "active" | "deprecated" | "experimental" | "internal";
export type EdgeFunctionRuntime = "deno";

export interface EdgeFunctionEntry {
  readonly name: string;
  readonly path: string;
  readonly runtime: EdgeFunctionRuntime;
  readonly status: EdgeFunctionStatus;
  readonly description: string;
}

export const EDGE_FUNCTION_REGISTRY = [
  { name: "admin-ai-workforce-run", path: "supabase/functions/admin-ai-workforce-run/index.ts", runtime: "deno", status: "active", description: "Triggers AI workforce invocation for admin" },
  { name: "admin-api", path: "supabase/functions/admin-api/index.ts", runtime: "deno", status: "active", description: "General admin REST API" },
  { name: "admin-bff-gateway", path: "supabase/functions/admin-bff-gateway/index.ts", runtime: "deno", status: "active", description: "Backend-for-frontend gateway for admin plane" },
  { name: "admin-gateway", path: "supabase/functions/admin-gateway/index.ts", runtime: "deno", status: "active", description: "Admin gateway routing" },
  { name: "admin-intelligence", path: "supabase/functions/admin-intelligence/index.ts", runtime: "deno", status: "active", description: "Admin intelligence and analytics" },
  { name: "admin-users", path: "supabase/functions/admin-users/index.ts", runtime: "deno", status: "active", description: "Admin user management" },
  { name: "advisor-agent-loop", path: "supabase/functions/advisor-agent-loop/index.ts", runtime: "deno", status: "active", description: "Advisor autonomous agent loop" },
  { name: "advisor-avatar-generate", path: "supabase/functions/advisor-avatar-generate/index.ts", runtime: "deno", status: "active", description: "Generates advisor avatar images" },
  { name: "advisor-conversation", path: "supabase/functions/advisor-conversation/index.ts", runtime: "deno", status: "active", description: "Advisor chat conversation endpoint" },
  { name: "advisor-deep-intelligence", path: "supabase/functions/advisor-deep-intelligence/index.ts", runtime: "deno", status: "active", description: "Deep intelligence analysis by advisors" },
  { name: "advisor-knowledge-manage", path: "supabase/functions/advisor-knowledge-manage/index.ts", runtime: "deno", status: "active", description: "Manages advisor knowledge base" },
  { name: "advisor-weekly-report", path: "supabase/functions/advisor-weekly-report/index.ts", runtime: "deno", status: "active", description: "Generates weekly advisor reports" },
  { name: "agent-executor", path: "supabase/functions/agent-executor/index.ts", runtime: "deno", status: "active", description: "Executes agent actions" },
  { name: "agent-heartbeat", path: "supabase/functions/agent-heartbeat/index.ts", runtime: "deno", status: "active", description: "Agent liveness heartbeat" },
  { name: "agent-intelligence", path: "supabase/functions/agent-intelligence/index.ts", runtime: "deno", status: "active", description: "Agent intelligence processing" },
  { name: "agent-scheduler", path: "supabase/functions/agent-scheduler/index.ts", runtime: "deno", status: "active", description: "Schedules agent tasks" },
  { name: "agent-signal", path: "supabase/functions/agent-signal/index.ts", runtime: "deno", status: "active", description: "Agent signal ingestion" },
  { name: "ai-gateway", path: "supabase/functions/ai-gateway/index.ts", runtime: "deno", status: "active", description: "Sovereign AI Gateway — model routing and budget" },
  { name: "ai-health", path: "supabase/functions/ai-health/index.ts", runtime: "deno", status: "active", description: "AI subsystem health check" },
  { name: "ambient-os-operations", path: "supabase/functions/ambient-os-operations/index.ts", runtime: "deno", status: "active", description: "Ambient OS background operations" },
  { name: "api-gateway", path: "supabase/functions/api-gateway/index.ts", runtime: "deno", status: "active", description: "Public API gateway" },
  { name: "booking-manage", path: "supabase/functions/booking-manage/index.ts", runtime: "deno", status: "active", description: "Booking CRUD operations" },
  { name: "brain-core", path: "supabase/functions/brain-core/index.ts", runtime: "deno", status: "active", description: "Core brain intelligence pipeline" },
  { name: "business-advisor-intelligence", path: "supabase/functions/business-advisor-intelligence/index.ts", runtime: "deno", status: "active", description: "Business domain advisor intelligence" },
  { name: "business-board-api", path: "supabase/functions/business-board-api/index.ts", runtime: "deno", status: "active", description: "Business board decision API" },
  { name: "cashflow-calculate", path: "supabase/functions/cashflow-calculate/index.ts", runtime: "deno", status: "active", description: "Cash flow calculation engine" },
  { name: "chat-advisor", path: "supabase/functions/chat-advisor/index.ts", runtime: "deno", status: "active", description: "Chat-based advisor interaction" },
  { name: "check-ai-budget", path: "supabase/functions/check-ai-budget/index.ts", runtime: "deno", status: "active", description: "AI budget enforcement check" },
  { name: "cloud-admin-api", path: "supabase/functions/cloud-admin-api/index.ts", runtime: "deno", status: "active", description: "Cloud admin management API" },
  { name: "cloud-device-api", path: "supabase/functions/cloud-device-api/index.ts", runtime: "deno", status: "active", description: "Cloud device registration and management" },
  { name: "cloud-lifecycle-api", path: "supabase/functions/cloud-lifecycle-api/index.ts", runtime: "deno", status: "active", description: "Cloud resource lifecycle management" },
  { name: "cloud-storage-api", path: "supabase/functions/cloud-storage-api/index.ts", runtime: "deno", status: "active", description: "Cloud storage operations" },
  { name: "cloud-sync-api", path: "supabase/functions/cloud-sync-api/index.ts", runtime: "deno", status: "active", description: "Cloud data synchronization" },
  { name: "cloud-tenant-api", path: "supabase/functions/cloud-tenant-api/index.ts", runtime: "deno", status: "active", description: "Multi-tenant management API" },
  { name: "cloud-worker-api", path: "supabase/functions/cloud-worker-api/index.ts", runtime: "deno", status: "active", description: "Cloud worker orchestration" },
  { name: "connector-batch", path: "supabase/functions/connector-batch/index.ts", runtime: "deno", status: "active", description: "Batch connector operations" },
  { name: "connector-discover", path: "supabase/functions/connector-discover/index.ts", runtime: "deno", status: "active", description: "Connector discovery and catalog" },
  { name: "connector-health", path: "supabase/functions/connector-health/index.ts", runtime: "deno", status: "active", description: "Connector health monitoring" },
  { name: "connector-oauth", path: "supabase/functions/connector-oauth/index.ts", runtime: "deno", status: "active", description: "Connector OAuth flow handler" },
  { name: "connector-operations", path: "supabase/functions/connector-operations/index.ts", runtime: "deno", status: "active", description: "Connector CRUD operations" },
  { name: "connector-proxy", path: "supabase/functions/connector-proxy/index.ts", runtime: "deno", status: "active", description: "Proxies requests to external connectors" },
  { name: "connector-transform", path: "supabase/functions/connector-transform/index.ts", runtime: "deno", status: "active", description: "Transforms connector data formats" },
  { name: "cost-alert", path: "supabase/functions/cost-alert/index.ts", runtime: "deno", status: "active", description: "Cost threshold alerting" },
  { name: "crm-sync", path: "supabase/functions/crm-sync/index.ts", runtime: "deno", status: "active", description: "CRM data synchronization" },
  { name: "device-telemetry", path: "supabase/functions/device-telemetry/index.ts", runtime: "deno", status: "active", description: "Device telemetry ingestion" },
  { name: "ecosystem-operations", path: "supabase/functions/ecosystem-operations/index.ts", runtime: "deno", status: "active", description: "Ecosystem-wide operations" },
  { name: "event-processor", path: "supabase/functions/event-processor/index.ts", runtime: "deno", status: "active", description: "Event processing pipeline" },
  { name: "file-ingestion", path: "supabase/functions/file-ingestion/index.ts", runtime: "deno", status: "active", description: "File upload and ingestion" },
  { name: "gdpr-delete", path: "supabase/functions/gdpr-delete/index.ts", runtime: "deno", status: "active", description: "GDPR data deletion handler" },
  { name: "gdpr-export", path: "supabase/functions/gdpr-export/index.ts", runtime: "deno", status: "active", description: "GDPR data export handler" },
  { name: "get-weather", path: "supabase/functions/get-weather/index.ts", runtime: "deno", status: "active", description: "Weather data fetch" },
  { name: "intelligence-api", path: "supabase/functions/intelligence-api/index.ts", runtime: "deno", status: "active", description: "Intelligence pipeline API" },
  { name: "invoice-generate", path: "supabase/functions/invoice-generate/index.ts", runtime: "deno", status: "active", description: "Invoice PDF generation" },
  { name: "main", path: "supabase/functions/main/index.ts", runtime: "deno", status: "active", description: "Main entry point / health check" },
  { name: "msa-operations", path: "supabase/functions/msa-operations/index.ts", runtime: "deno", status: "active", description: "MSA document operations" },
  { name: "os-agent-channel", path: "supabase/functions/os-agent-channel/index.ts", runtime: "deno", status: "active", description: "OS agent communication channel" },
  { name: "os-command", path: "supabase/functions/os-command/index.ts", runtime: "deno", status: "active", description: "OS command execution" },
  { name: "os-status", path: "supabase/functions/os-status/index.ts", runtime: "deno", status: "active", description: "OS status reporting" },
  { name: "payment-process", path: "supabase/functions/payment-process/index.ts", runtime: "deno", status: "active", description: "Payment processing" },
  { name: "personal-brain", path: "supabase/functions/personal-brain/index.ts", runtime: "deno", status: "active", description: "Personal brain intelligence" },
  { name: "provider-family-operations", path: "supabase/functions/provider-family-operations/index.ts", runtime: "deno", status: "active", description: "Provider family management" },
  { name: "push-dispatch", path: "supabase/functions/push-dispatch/index.ts", runtime: "deno", status: "active", description: "Push notification dispatch" },
  { name: "push-track", path: "supabase/functions/push-track/index.ts", runtime: "deno", status: "active", description: "Push notification tracking" },
  { name: "revenue-caller", path: "supabase/functions/revenue-caller/index.ts", runtime: "deno", status: "active", description: "Revenue calculation caller" },
  { name: "runtime-probes", path: "supabase/functions/runtime-probes/index.ts", runtime: "deno", status: "active", description: "Runtime health probes" },
  { name: "scheduler-dispatch", path: "supabase/functions/scheduler-dispatch/index.ts", runtime: "deno", status: "active", description: "Scheduled task dispatch" },
  { name: "seed-user-data", path: "supabase/functions/seed-user-data/index.ts", runtime: "deno", status: "active", description: "Seeds demo/test user data" },
  { name: "self-healing", path: "supabase/functions/self-healing/index.ts", runtime: "deno", status: "active", description: "Self-healing recovery operations" },
  { name: "support-gateway", path: "supabase/functions/support-gateway/index.ts", runtime: "deno", status: "active", description: "Support ticket gateway" },
  { name: "system-updates", path: "supabase/functions/system-updates/index.ts", runtime: "deno", status: "active", description: "System update notifications" },
  { name: "tax-estimate", path: "supabase/functions/tax-estimate/index.ts", runtime: "deno", status: "active", description: "Tax estimation calculator" },
  { name: "user-bff-gateway", path: "supabase/functions/user-bff-gateway/index.ts", runtime: "deno", status: "active", description: "User BFF gateway" },
  { name: "vapid-public-key", path: "supabase/functions/vapid-public-key/index.ts", runtime: "deno", status: "active", description: "Returns VAPID public key for push" },
  { name: "verification-recorder", path: "supabase/functions/verification-recorder/index.ts", runtime: "deno", status: "active", description: "Records verification/proof results" },
] as const satisfies readonly EdgeFunctionEntry[];

export type EdgeFunctionName = typeof EDGE_FUNCTION_REGISTRY[number]["name"];

export function getEdgeFunction(name: string): EdgeFunctionEntry | undefined {
  return EDGE_FUNCTION_REGISTRY.find(f => f.name === name);
}

export function getEdgeFunctionsByStatus(status: EdgeFunctionStatus): readonly EdgeFunctionEntry[] {
  return EDGE_FUNCTION_REGISTRY.filter(f => f.status === status);
}

export function getAllEdgeFunctionNames(): readonly string[] {
  return EDGE_FUNCTION_REGISTRY.map(f => f.name);
}
