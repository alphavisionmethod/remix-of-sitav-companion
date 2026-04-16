// ═══════════════════════════════════════════════════════════════
// SITA OS — Edge Function Authority Map
//
// Canonical classification of every edge function in supabase/functions/.
// Enforced by scripts/runtime/run-edge-function-governance.ts.
//
// CATEGORIES:
//   • domain-api      — Business/domain API for a specific surface
//   • system-api      — Cross-cutting system function (gateway, dispatch)
//   • ai-gateway      — AI/LLM routing and inference
//   • admin-api       — Admin-only operations
//   • webhook         — Inbound webhook from external service
//   • cron            — Scheduled job (pg_cron triggered)
//   • public          — Intentionally public, no auth required
//   • internal        — Service-to-service or internal infra
//
// AUTH CLASSES:
//   • jwt-required    — Must validate user JWT via _shared/auth.ts
//   • admin-required  — Must validate admin role via requireAdmin
//   • service-role    — Uses service role key (no user context)
//   • webhook-sig     — Validates webhook signature instead of JWT
//   • public          — No auth (intentional)
//
// RISK TIERS:
//   • R0 — Read-only, no PII
//   • R1 — Read-only with PII
//   • R2 — Mutates non-financial state
//   • R3 — Mutates financial / sensitive state
//   • R4 — Cross-tenant or admin-level mutation
//   • R5 — Destructive / irreversible
// ═══════════════════════════════════════════════════════════════

export type EdgeFunctionCategory =
  | "domain-api"
  | "system-api"
  | "ai-gateway"
  | "admin-api"
  | "webhook"
  | "cron"
  | "public"
  | "internal";

export type EdgeFunctionAuthClass =
  | "jwt-required"
  | "admin-required"
  | "service-role"
  | "webhook-sig"
  | "public";

export type EdgeFunctionRiskTier = "R0" | "R1" | "R2" | "R3" | "R4" | "R5";

export type EdgeFunctionOwner =
  | "platform"
  | "ai"
  | "advisor"
  | "boardroom"
  | "business"
  | "money"
  | "concierge"
  | "investment"
  | "files"
  | "communications"
  | "connectors"
  | "admin"
  | "security"
  | "cloud-control"
  | "agents"
  | "support"
  | "compliance";

export interface EdgeFunctionAuthorityEntry {
  /** Function directory name under supabase/functions/ */
  name: string;
  category: EdgeFunctionCategory;
  authClass: EdgeFunctionAuthClass;
  owner: EdgeFunctionOwner;
  riskTier: EdgeFunctionRiskTier;
  /** Whether CORS is required (false only for cron / pure internal) */
  corsRequired: boolean;
  /** Brief responsibility statement */
  description: string;
  /** Justification for non-jwt auth classes */
  authJustification?: string;
}

export const EDGE_FUNCTION_AUTHORITY: readonly EdgeFunctionAuthorityEntry[] = [
  // ── Admin APIs ────────────────────────────────────────────────────
  { name: "admin-ai-workforce-run", category: "admin-api", authClass: "admin-required", owner: "admin", riskTier: "R3", corsRequired: true, description: "Trigger AI workforce runs from admin console" },
  { name: "admin-api", category: "admin-api", authClass: "admin-required", owner: "admin", riskTier: "R4", corsRequired: true, description: "Admin operations API" },
  { name: "admin-bff-gateway", category: "admin-api", authClass: "admin-required", owner: "admin", riskTier: "R4", corsRequired: true, description: "Admin BFF gateway" },
  { name: "admin-gateway", category: "admin-api", authClass: "admin-required", owner: "admin", riskTier: "R4", corsRequired: true, description: "Admin gateway router" },
  { name: "admin-intelligence", category: "admin-api", authClass: "admin-required", owner: "admin", riskTier: "R2", corsRequired: true, description: "Admin intelligence aggregation" },
  { name: "admin-users", category: "admin-api", authClass: "admin-required", owner: "admin", riskTier: "R4", corsRequired: true, description: "Admin user management" },
  { name: "cloud-admin-api", category: "admin-api", authClass: "admin-required", owner: "cloud-control", riskTier: "R4", corsRequired: true, description: "Cloud control plane admin operations" },
  { name: "payment-kill-switch", category: "admin-api", authClass: "admin-required", owner: "security", riskTier: "R5", corsRequired: true, description: "Emergency disable of payment processing" },

  // ── AI Gateway ────────────────────────────────────────────────────
  { name: "ai-gateway", category: "ai-gateway", authClass: "jwt-required", owner: "ai", riskTier: "R2", corsRequired: true, description: "Sovereign AI inference gateway" },
  { name: "ai-health", category: "system-api", authClass: "jwt-required", owner: "ai", riskTier: "R0", corsRequired: true, description: "AI subsystem health" },
  { name: "check-ai-budget", category: "system-api", authClass: "jwt-required", owner: "ai", riskTier: "R0", corsRequired: true, description: "Budget check before AI invocation" },
  { name: "brain-core", category: "ai-gateway", authClass: "jwt-required", owner: "ai", riskTier: "R2", corsRequired: true, description: "Brain core orchestration" },

  // ── Advisor / Boardroom ───────────────────────────────────────────
  { name: "advisor-agent-loop", category: "domain-api", authClass: "jwt-required", owner: "advisor", riskTier: "R2", corsRequired: true, description: "Advisor agent execution loop" },
  { name: "advisor-avatar-generate", category: "domain-api", authClass: "jwt-required", owner: "advisor", riskTier: "R1", corsRequired: true, description: "Generate advisor avatar images" },
  { name: "advisor-conversation", category: "domain-api", authClass: "jwt-required", owner: "advisor", riskTier: "R2", corsRequired: true, description: "Advisor conversational interface" },
  { name: "advisor-deep-intelligence", category: "domain-api", authClass: "jwt-required", owner: "advisor", riskTier: "R2", corsRequired: true, description: "8-layer cognitive pipeline" },
  { name: "advisor-knowledge-manage", category: "domain-api", authClass: "jwt-required", owner: "advisor", riskTier: "R2", corsRequired: true, description: "Manage advisor knowledge base" },
  { name: "advisor-weekly-report", category: "domain-api", authClass: "jwt-required", owner: "advisor", riskTier: "R1", corsRequired: true, description: "Generate weekly advisor reports" },
  { name: "business-advisor-intelligence", category: "domain-api", authClass: "jwt-required", owner: "business", riskTier: "R2", corsRequired: true, description: "Business advisor intelligence" },
  { name: "business-board-api", category: "domain-api", authClass: "jwt-required", owner: "boardroom", riskTier: "R2", corsRequired: true, description: "Boardroom unified API" },
  { name: "chat-advisor", category: "domain-api", authClass: "jwt-required", owner: "advisor", riskTier: "R2", corsRequired: true, description: "Chat with advisor" },

  // ── Agents (autonomous workforce) ─────────────────────────────────
  { name: "agent-executor", category: "domain-api", authClass: "jwt-required", owner: "agents", riskTier: "R3", corsRequired: true, description: "Execute approved agent actions" },
  { name: "agent-heartbeat", category: "internal", authClass: "service-role", owner: "agents", riskTier: "R0", corsRequired: true, description: "Agent liveness heartbeat", authJustification: "Service-to-service heartbeat" },
  { name: "agent-intelligence", category: "domain-api", authClass: "jwt-required", owner: "agents", riskTier: "R2", corsRequired: true, description: "Agent reasoning surface" },
  { name: "agent-scheduler", category: "cron", authClass: "service-role", owner: "agents", riskTier: "R2", corsRequired: false, description: "Schedule agent runs", authJustification: "pg_cron triggered" },
  { name: "agent-signal", category: "internal", authClass: "service-role", owner: "agents", riskTier: "R1", corsRequired: true, description: "Inter-agent signaling", authJustification: "Service-to-service signal" },

  // ── Domain APIs ───────────────────────────────────────────────────
  { name: "ambient-os-operations", category: "domain-api", authClass: "jwt-required", owner: "platform", riskTier: "R2", corsRequired: true, description: "Ambient OS surface operations" },
  { name: "app-store-api", category: "domain-api", authClass: "jwt-required", owner: "platform", riskTier: "R2", corsRequired: true, description: "App store catalog and install" },
  { name: "booking-manage", category: "domain-api", authClass: "jwt-required", owner: "concierge", riskTier: "R3", corsRequired: true, description: "Booking lifecycle management" },
  { name: "cashflow-calculate", category: "domain-api", authClass: "jwt-required", owner: "money", riskTier: "R1", corsRequired: true, description: "Cashflow projections" },
  { name: "communications-api", category: "domain-api", authClass: "jwt-required", owner: "communications", riskTier: "R2", corsRequired: true, description: "Communications surface API" },
  { name: "cost-alert", category: "domain-api", authClass: "jwt-required", owner: "money", riskTier: "R1", corsRequired: true, description: "Cost monitoring and alerts" },
  { name: "digital-twin-engine", category: "domain-api", authClass: "jwt-required", owner: "platform", riskTier: "R2", corsRequired: true, description: "Digital twin simulation engine" },
  { name: "ecosystem-operations", category: "domain-api", authClass: "jwt-required", owner: "platform", riskTier: "R2", corsRequired: true, description: "Ecosystem-wide operations" },
  { name: "file-ingestion", category: "domain-api", authClass: "jwt-required", owner: "files", riskTier: "R2", corsRequired: true, description: "File ingestion + extraction pipeline" },
  { name: "intelligence-api", category: "domain-api", authClass: "jwt-required", owner: "ai", riskTier: "R2", corsRequired: true, description: "Intelligence aggregation API" },
  { name: "investment-portfolio-api", category: "domain-api", authClass: "jwt-required", owner: "investment", riskTier: "R3", corsRequired: true, description: "Investment portfolio operations" },
  { name: "invoice-generate", category: "domain-api", authClass: "jwt-required", owner: "money", riskTier: "R3", corsRequired: true, description: "Generate invoices" },
  { name: "msa-operations", category: "domain-api", authClass: "jwt-required", owner: "compliance", riskTier: "R3", corsRequired: true, description: "Master service agreement ops" },
  { name: "personal-brain", category: "domain-api", authClass: "jwt-required", owner: "ai", riskTier: "R2", corsRequired: true, description: "Personal brain memory ops" },
  { name: "revenue-caller", category: "domain-api", authClass: "jwt-required", owner: "business", riskTier: "R2", corsRequired: true, description: "Revenue calling workflows" },
  { name: "simulation-engine-api", category: "domain-api", authClass: "jwt-required", owner: "platform", riskTier: "R2", corsRequired: true, description: "Monte Carlo simulation engine" },
  { name: "tasks-workflow-api", category: "domain-api", authClass: "jwt-required", owner: "platform", riskTier: "R2", corsRequired: true, description: "Tasks and workflow surface" },
  { name: "tax-estimate", category: "domain-api", authClass: "jwt-required", owner: "money", riskTier: "R2", corsRequired: true, description: "Tax estimation" },

  // ── Connectors ────────────────────────────────────────────────────
  { name: "connector-batch", category: "domain-api", authClass: "jwt-required", owner: "connectors", riskTier: "R2", corsRequired: true, description: "Batch connector operations" },
  { name: "connector-discover", category: "domain-api", authClass: "jwt-required", owner: "connectors", riskTier: "R1", corsRequired: true, description: "Discover available connectors" },
  { name: "connector-health", category: "system-api", authClass: "jwt-required", owner: "connectors", riskTier: "R0", corsRequired: true, description: "Connector health checks" },
  { name: "connector-oauth", category: "domain-api", authClass: "jwt-required", owner: "connectors", riskTier: "R3", corsRequired: true, description: "Connector OAuth flow" },
  { name: "connector-operations", category: "domain-api", authClass: "jwt-required", owner: "connectors", riskTier: "R2", corsRequired: true, description: "Connector lifecycle ops" },
  { name: "connector-proxy", category: "domain-api", authClass: "jwt-required", owner: "connectors", riskTier: "R2", corsRequired: true, description: "Proxy requests through connector" },
  { name: "connector-sync", category: "domain-api", authClass: "jwt-required", owner: "connectors", riskTier: "R2", corsRequired: true, description: "Sync data from connector" },
  { name: "connector-transform", category: "domain-api", authClass: "jwt-required", owner: "connectors", riskTier: "R2", corsRequired: true, description: "Transform connector data" },
  { name: "crm-sync", category: "domain-api", authClass: "jwt-required", owner: "connectors", riskTier: "R2", corsRequired: true, description: "CRM data synchronization" },
  { name: "provider-family-operations", category: "domain-api", authClass: "jwt-required", owner: "connectors", riskTier: "R2", corsRequired: true, description: "Provider family operations" },

  // ── Cloud Control Plane ──────────────────────────────────────────
  { name: "cloud-device-api", category: "domain-api", authClass: "jwt-required", owner: "cloud-control", riskTier: "R2", corsRequired: true, description: "Device management API" },
  { name: "cloud-lifecycle-api", category: "domain-api", authClass: "jwt-required", owner: "cloud-control", riskTier: "R3", corsRequired: true, description: "Tenant lifecycle operations" },
  { name: "cloud-storage-api", category: "domain-api", authClass: "jwt-required", owner: "cloud-control", riskTier: "R2", corsRequired: true, description: "Cloud storage operations" },
  { name: "cloud-sync-api", category: "domain-api", authClass: "jwt-required", owner: "cloud-control", riskTier: "R2", corsRequired: true, description: "Cross-device sync" },
  { name: "cloud-tenant-api", category: "domain-api", authClass: "jwt-required", owner: "cloud-control", riskTier: "R3", corsRequired: true, description: "Tenant management" },
  { name: "cloud-worker-api", category: "domain-api", authClass: "jwt-required", owner: "cloud-control", riskTier: "R2", corsRequired: true, description: "Worker job operations" },

  // ── System / Gateway ─────────────────────────────────────────────
  { name: "api-gateway", category: "system-api", authClass: "jwt-required", owner: "platform", riskTier: "R2", corsRequired: true, description: "Unified API gateway router" },
  { name: "license-gateway", category: "system-api", authClass: "jwt-required", owner: "platform", riskTier: "R2", corsRequired: true, description: "License validation gateway" },
  { name: "support-gateway", category: "system-api", authClass: "jwt-required", owner: "support", riskTier: "R1", corsRequired: true, description: "Support escalation gateway" },
  { name: "user-bff-gateway", category: "system-api", authClass: "jwt-required", owner: "platform", riskTier: "R2", corsRequired: true, description: "User-facing BFF gateway" },
  { name: "main", category: "internal", authClass: "service-role", owner: "platform", riskTier: "R0", corsRequired: true, description: "Main routing dispatcher — downstream functions enforce auth", authJustification: "Pure dispatcher; downstream functions own auth" },
  { name: "os-command", category: "domain-api", authClass: "jwt-required", owner: "platform", riskTier: "R2", corsRequired: true, description: "OS command execution" },
  { name: "os-status", category: "system-api", authClass: "jwt-required", owner: "platform", riskTier: "R0", corsRequired: true, description: "OS status surface" },
  { name: "self-healing", category: "system-api", authClass: "jwt-required", owner: "platform", riskTier: "R2", corsRequired: true, description: "Self-healing orchestrator" },
  { name: "system-updates", category: "system-api", authClass: "service-role", owner: "platform", riskTier: "R3", corsRequired: true, description: "Apply system updates", authJustification: "Service-to-service update channel" },
  { name: "verification-recorder", category: "internal", authClass: "service-role", owner: "compliance", riskTier: "R2", corsRequired: true, description: "Record verification proofs", authJustification: "Internal verification pipeline" },

  // ── Realtime / Channels ──────────────────────────────────────────
  { name: "os-agent-channel", category: "internal", authClass: "webhook-sig", owner: "agents", riskTier: "R2", corsRequired: true, description: "OS agent realtime channel (device-token authenticated)", authJustification: "Authenticates via x-agent-token header issued at device registration" },

  // ── Push & Notifications ─────────────────────────────────────────
  { name: "push-dispatch", category: "internal", authClass: "service-role", owner: "platform", riskTier: "R1", corsRequired: true, description: "Dispatch push notifications", authJustification: "Triggered by db events / cron" },
  { name: "push-track", category: "public", authClass: "public", owner: "platform", riskTier: "R0", corsRequired: true, description: "Track push delivery (anonymous tracking pixel)", authJustification: "Public delivery tracking endpoint" },
  { name: "vapid-public-key", category: "public", authClass: "public", owner: "platform", riskTier: "R0", corsRequired: true, description: "Serve VAPID public key for push subscription", authJustification: "Public key — safe to expose" },

  // ── Cron / Schedulers ────────────────────────────────────────────
  { name: "scheduler-dispatch", category: "cron", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: false, description: "Dispatch scheduled jobs", authJustification: "pg_cron triggered" },
  { name: "event-processor", category: "cron", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: false, description: "Process queued events", authJustification: "pg_cron triggered" },
  { name: "runtime-probes", category: "cron", authClass: "service-role", owner: "platform", riskTier: "R0", corsRequired: false, description: "Periodic runtime health probes", authJustification: "pg_cron triggered" },
  { name: "seed-user-data", category: "internal", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: true, description: "Seed initial user data", authJustification: "Triggered post-signup" },

  // ── Public Endpoints ─────────────────────────────────────────────
  { name: "health-check", category: "public", authClass: "public", owner: "platform", riskTier: "R0", corsRequired: true, description: "Public health check", authJustification: "Public liveness probe" },
  { name: "get-weather", category: "public", authClass: "public", owner: "concierge", riskTier: "R0", corsRequired: true, description: "Weather lookup (no PII)", authJustification: "Public weather API proxy" },

  // ── Telemetry ────────────────────────────────────────────────────
  { name: "device-telemetry", category: "internal", authClass: "service-role", owner: "cloud-control", riskTier: "R1", corsRequired: true, description: "Device telemetry ingest", authJustification: "Device-authenticated telemetry stream" },

  // ── Payments / Compliance ────────────────────────────────────────
  { name: "payment-process", category: "domain-api", authClass: "jwt-required", owner: "money", riskTier: "R5", corsRequired: true, description: "Process payment transactions" },
  { name: "gdpr-delete", category: "domain-api", authClass: "jwt-required", owner: "compliance", riskTier: "R5", corsRequired: true, description: "GDPR data deletion" },
  { name: "gdpr-export", category: "domain-api", authClass: "jwt-required", owner: "compliance", riskTier: "R3", corsRequired: true, description: "GDPR data export" },
] as const;

/** Lookup an entry by function name */
export function getEdgeFunctionEntry(name: string): EdgeFunctionAuthorityEntry | undefined {
  return EDGE_FUNCTION_AUTHORITY.find((e) => e.name === name);
}

/** All function names registered in the authority map */
export function getRegisteredFunctionNames(): readonly string[] {
  return EDGE_FUNCTION_AUTHORITY.map((e) => e.name);
}

/** Count by category */
export function getCategoryCounts(): Record<EdgeFunctionCategory, number> {
  const counts = {} as Record<EdgeFunctionCategory, number>;
  for (const entry of EDGE_FUNCTION_AUTHORITY) {
    counts[entry.category] = (counts[entry.category] || 0) + 1;
  }
  return counts;
}
