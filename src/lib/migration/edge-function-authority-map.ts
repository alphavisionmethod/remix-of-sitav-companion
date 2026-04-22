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
  { name: "db-truth-introspect", category: "admin-api", authClass: "admin-required", owner: "admin", riskTier: "R0", corsRequired: true, description: "Read-only DB schema/RLS/drift introspection for admin DbTruthExplorer" },
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
  // ─── AUTO-REGISTERED (117 missing) ───────────────────────
  { name: "account-delete", category: "domain-api", authClass: "service-role", owner: "platform", riskTier: "R4", corsRequired: true, description: "account delete", authJustification: "Service-internal function" },
  { name: "admin-reset-user-setup", category: "admin-api", authClass: "service-role", owner: "admin", riskTier: "R2", corsRequired: true, description: "admin reset user setup", authJustification: "Service-internal function" },
  { name: "admin-revoke-session", category: "admin-api", authClass: "service-role", owner: "admin", riskTier: "R2", corsRequired: true, description: "admin revoke session", authJustification: "Service-internal function" },
  { name: "ai-receipt-completeness-snapshot", category: "domain-api", authClass: "service-role", owner: "ai", riskTier: "R2", corsRequired: true, description: "ai receipt completeness snapshot", authJustification: "Service-internal function" },
  { name: "ai-runtime-nightly-verify", category: "domain-api", authClass: "service-role", owner: "ai", riskTier: "R2", corsRequired: true, description: "ai runtime nightly verify", authJustification: "Service-internal function" },
  { name: "alert-actions", category: "domain-api", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: true, description: "alert actions", authJustification: "Service-internal function" },
  { name: "alert-ingest", category: "domain-api", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: true, description: "alert ingest", authJustification: "Service-internal function" },
  { name: "alert-route", category: "domain-api", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: true, description: "alert route", authJustification: "Service-internal function" },
  { name: "alert-router", category: "domain-api", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: true, description: "alert router", authJustification: "Service-internal function" },
  { name: "apm-metrics-ingest", category: "domain-api", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: true, description: "apm metrics ingest", authJustification: "Service-internal function" },
  { name: "app-ingest-pwa", category: "domain-api", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: true, description: "app ingest pwa", authJustification: "Service-internal function" },
  { name: "app-ingest-web", category: "domain-api", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: true, description: "app ingest web", authJustification: "Service-internal function" },
  { name: "app-install", category: "domain-api", authClass: "jwt-required", owner: "platform", riskTier: "R2", corsRequired: true, description: "app install" },
  { name: "app-launch-resolve", category: "domain-api", authClass: "jwt-required", owner: "platform", riskTier: "R2", corsRequired: true, description: "app launch resolve" },
  { name: "app-manifest-sync", category: "domain-api", authClass: "service-role", owner: "platform", riskTier: "R0", corsRequired: true, description: "app manifest sync", authJustification: "Service-internal function" },
  { name: "app-manifest-verifier", category: "domain-api", authClass: "service-role", owner: "platform", riskTier: "R0", corsRequired: true, description: "app manifest verifier", authJustification: "Service-internal function" },
  { name: "app-permissions-sync", category: "domain-api", authClass: "jwt-required", owner: "platform", riskTier: "R2", corsRequired: true, description: "app permissions sync" },
  { name: "app-screenshot-capture", category: "domain-api", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: true, description: "app screenshot capture", authJustification: "Service-internal function" },
  { name: "app-store-catalog", category: "domain-api", authClass: "jwt-required", owner: "platform", riskTier: "R2", corsRequired: true, description: "app store catalog" },
  { name: "app-uninstall", category: "domain-api", authClass: "jwt-required", owner: "platform", riskTier: "R2", corsRequired: true, description: "app uninstall" },
  { name: "app-update-check", category: "domain-api", authClass: "jwt-required", owner: "platform", riskTier: "R0", corsRequired: true, description: "app update check" },
  { name: "attestation-packet-builder", category: "domain-api", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: true, description: "attestation packet builder", authJustification: "Service-internal function" },
  { name: "audit-export-bundler", category: "domain-api", authClass: "service-role", owner: "compliance", riskTier: "R2", corsRequired: true, description: "audit export bundler", authJustification: "Service-internal function" },
  { name: "audit-log-export", category: "domain-api", authClass: "service-role", owner: "compliance", riskTier: "R2", corsRequired: true, description: "audit log export", authJustification: "Service-internal function" },
  { name: "beta-apply", category: "domain-api", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: true, description: "beta apply", authJustification: "Service-internal function" },
  { name: "boardroom-cockpit-telemetry", category: "domain-api", authClass: "service-role", owner: "advisor", riskTier: "R2", corsRequired: true, description: "boardroom cockpit telemetry", authJustification: "Service-internal function" },
  { name: "boardroom-followthrough-dispatch", category: "domain-api", authClass: "service-role", owner: "advisor", riskTier: "R2", corsRequired: true, description: "boardroom followthrough dispatch", authJustification: "Service-internal function" },
  { name: "boardroom-followthrough-sla", category: "domain-api", authClass: "service-role", owner: "advisor", riskTier: "R2", corsRequired: true, description: "boardroom followthrough sla", authJustification: "Service-internal function" },
  { name: "boardroom-outcome-record", category: "domain-api", authClass: "service-role", owner: "advisor", riskTier: "R2", corsRequired: true, description: "boardroom outcome record", authJustification: "Service-internal function" },
  { name: "boardroom-replay", category: "domain-api", authClass: "jwt-required", owner: "advisor", riskTier: "R2", corsRequired: true, description: "boardroom replay" },
  { name: "boardroom-session", category: "domain-api", authClass: "jwt-required", owner: "advisor", riskTier: "R2", corsRequired: true, description: "boardroom session" },
  { name: "canary-chaos-cron", category: "system-api", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: false, description: "canary chaos cron", authJustification: "Service-internal function" },
  { name: "chaos-drill-runner", category: "system-api", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: true, description: "chaos drill runner", authJustification: "Service-internal function" },
  { name: "compliance-evidence-collector", category: "domain-api", authClass: "service-role", owner: "compliance", riskTier: "R2", corsRequired: true, description: "compliance evidence collector", authJustification: "Service-internal function" },
  { name: "compliance-evidence-cron", category: "system-api", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: false, description: "compliance evidence cron", authJustification: "Service-internal function" },
  { name: "connector-reauth-tracker", category: "webhook", authClass: "jwt-required", owner: "connectors", riskTier: "R2", corsRequired: true, description: "connector reauth tracker" },
  { name: "connector-refresh-nightly-verify", category: "webhook", authClass: "service-role", owner: "connectors", riskTier: "R2", corsRequired: true, description: "connector refresh nightly verify", authJustification: "Service-internal function" },
  { name: "connector-token-refresh", category: "webhook", authClass: "service-role", owner: "connectors", riskTier: "R2", corsRequired: true, description: "connector token refresh", authJustification: "Service-internal function" },
  { name: "crash-report-ingest", category: "domain-api", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: true, description: "crash report ingest", authJustification: "Service-internal function" },
  { name: "cron-receipt-collector", category: "system-api", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: false, description: "cron receipt collector", authJustification: "Service-internal function" },
  { name: "data-cleanup", category: "domain-api", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: true, description: "data cleanup", authJustification: "Service-internal function" },
  { name: "data-export", category: "domain-api", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: true, description: "data export", authJustification: "Service-internal function" },
  { name: "db-introspection", category: "domain-api", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: true, description: "db introspection", authJustification: "Service-internal function" },
  { name: "desktop-update-manifest", category: "domain-api", authClass: "jwt-required", owner: "platform", riskTier: "R0", corsRequired: true, description: "desktop update manifest" },
  { name: "dr-drill-cron", category: "system-api", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: false, description: "dr drill cron", authJustification: "Service-internal function" },
  { name: "dr-drill-executor", category: "system-api", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: true, description: "dr drill executor", authJustification: "Service-internal function" },
  { name: "dr-drill-runner", category: "system-api", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: true, description: "dr drill runner", authJustification: "Service-internal function" },
  { name: "error-ingest", category: "domain-api", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: true, description: "error ingest", authJustification: "Service-internal function" },
  { name: "escalation-engine", category: "domain-api", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: true, description: "escalation engine", authJustification: "Service-internal function" },
  { name: "evidence-graph-builder", category: "domain-api", authClass: "service-role", owner: "compliance", riskTier: "R2", corsRequired: true, description: "evidence graph builder", authJustification: "Service-internal function" },
  { name: "external-workforce-api", category: "domain-api", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: true, description: "external workforce api", authJustification: "Service-internal function" },
  { name: "external-workforce-webhook-dispatcher", category: "webhook", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: true, description: "external workforce webhook dispatcher", authJustification: "Service-internal function" },
  { name: "federated-knowledge-aggregator", category: "domain-api", authClass: "jwt-required", owner: "platform", riskTier: "R2", corsRequired: true, description: "federated knowledge aggregator" },
  { name: "generate-support-bundle", category: "domain-api", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: true, description: "generate support bundle", authJustification: "Service-internal function" },
  { name: "health-beat", category: "system-api", authClass: "service-role", owner: "platform", riskTier: "R0", corsRequired: true, description: "health beat", authJustification: "Service-internal function" },
  { name: "health-cron", category: "system-api", authClass: "service-role", owner: "platform", riskTier: "R0", corsRequired: false, description: "health cron", authJustification: "Service-internal function" },
  { name: "health-live", category: "system-api", authClass: "public", owner: "platform", riskTier: "R0", corsRequired: true, description: "health live", authJustification: "Public endpoint" },
  { name: "health-ready", category: "system-api", authClass: "service-role", owner: "platform", riskTier: "R0", corsRequired: true, description: "health ready", authJustification: "Service-internal function" },
  { name: "internal-agent-canary-runner", category: "internal", authClass: "service-role", owner: "agents", riskTier: "R2", corsRequired: true, description: "internal agent canary runner", authJustification: "Service-internal function" },
  { name: "internal-agent-chaos-scheduler", category: "internal", authClass: "service-role", owner: "agents", riskTier: "R2", corsRequired: true, description: "internal agent chaos scheduler", authJustification: "Service-internal function" },
  { name: "internal-agent-consensus-engine", category: "internal", authClass: "service-role", owner: "agents", riskTier: "R2", corsRequired: true, description: "internal agent consensus engine", authJustification: "Service-internal function" },
  { name: "internal-agent-cost-optimizer", category: "internal", authClass: "service-role", owner: "agents", riskTier: "R2", corsRequired: true, description: "internal agent cost optimizer", authJustification: "Service-internal function" },
  { name: "internal-agent-dependency-scanner", category: "internal", authClass: "service-role", owner: "agents", riskTier: "R2", corsRequired: true, description: "internal agent dependency scanner", authJustification: "Service-internal function" },
  { name: "internal-agent-execute-action", category: "internal", authClass: "service-role", owner: "agents", riskTier: "R2", corsRequired: true, description: "internal agent execute action", authJustification: "Service-internal function" },
  { name: "internal-agent-loop", category: "internal", authClass: "service-role", owner: "agents", riskTier: "R2", corsRequired: true, description: "internal agent loop", authJustification: "Service-internal function" },
  { name: "internal-agent-policy-architect", category: "internal", authClass: "service-role", owner: "agents", riskTier: "R2", corsRequired: true, description: "internal agent policy architect", authJustification: "Service-internal function" },
  { name: "internal-agent-reflect", category: "internal", authClass: "service-role", owner: "agents", riskTier: "R2", corsRequired: true, description: "internal agent reflect", authJustification: "Service-internal function" },
  { name: "internal-agent-self-healer", category: "internal", authClass: "service-role", owner: "agents", riskTier: "R2", corsRequired: true, description: "internal agent self healer", authJustification: "Service-internal function" },
  { name: "internal-agent-slo-evaluator", category: "internal", authClass: "service-role", owner: "agents", riskTier: "R2", corsRequired: true, description: "internal agent slo evaluator", authJustification: "Service-internal function" },
  { name: "internal-agent-suggestion-generator", category: "internal", authClass: "service-role", owner: "agents", riskTier: "R2", corsRequired: true, description: "internal agent suggestion generator", authJustification: "Service-internal function" },
  { name: "internal-agent-tenant-federation", category: "internal", authClass: "jwt-required", owner: "agents", riskTier: "R2", corsRequired: true, description: "internal agent tenant federation" },
  { name: "internal-agent-trust-evaluator", category: "internal", authClass: "service-role", owner: "agents", riskTier: "R2", corsRequired: true, description: "internal agent trust evaluator", authJustification: "Service-internal function" },
  { name: "internal-agent-weekly-digest", category: "internal", authClass: "service-role", owner: "agents", riskTier: "R2", corsRequired: true, description: "internal agent weekly digest", authJustification: "Service-internal function" },
  { name: "investor-request", category: "domain-api", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: true, description: "investor request", authJustification: "Service-internal function" },
  { name: "kill-switch-state", category: "admin-api", authClass: "admin-required", owner: "admin", riskTier: "R4", corsRequired: true, description: "kill switch state" },
  { name: "kill-switch-toggle", category: "admin-api", authClass: "service-role", owner: "admin", riskTier: "R4", corsRequired: true, description: "kill switch toggle", authJustification: "Service-internal function" },
  { name: "mobile-deferral-attestor", category: "domain-api", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: true, description: "mobile deferral attestor", authJustification: "Service-internal function" },
  { name: "oauth-refresh-probe", category: "webhook", authClass: "service-role", owner: "connectors", riskTier: "R2", corsRequired: true, description: "oauth refresh probe", authJustification: "Service-internal function" },
  { name: "onboarding-branch-tracker", category: "domain-api", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: true, description: "onboarding branch tracker", authJustification: "Service-internal function" },
  { name: "onboarding-resume-checkpoint", category: "domain-api", authClass: "service-role", owner: "platform", riskTier: "R0", corsRequired: true, description: "onboarding resume checkpoint", authJustification: "Service-internal function" },
  { name: "os-update-manifest", category: "domain-api", authClass: "service-role", owner: "platform", riskTier: "R0", corsRequired: true, description: "os update manifest", authJustification: "Service-internal function" },
  { name: "owner-copilot-bff", category: "system-api", authClass: "jwt-required", owner: "platform", riskTier: "R2", corsRequired: true, description: "owner copilot bff" },
  { name: "owner-copilot-session-tracker", category: "system-api", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: true, description: "owner copilot session tracker", authJustification: "Service-internal function" },
  { name: "package-verify", category: "domain-api", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: true, description: "package verify", authJustification: "Service-internal function" },
  { name: "press-inquiry", category: "domain-api", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: true, description: "press inquiry", authJustification: "Service-internal function" },
  { name: "production-launch-attestor", category: "domain-api", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: true, description: "production launch attestor", authJustification: "Service-internal function" },
  { name: "prompt-versioning", category: "domain-api", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: true, description: "prompt versioning", authJustification: "Service-internal function" },
  { name: "recovery-evidence-ingest", category: "domain-api", authClass: "service-role", owner: "compliance", riskTier: "R2", corsRequired: true, description: "recovery evidence ingest", authJustification: "Service-internal function" },
  { name: "release-artifact-signer", category: "domain-api", authClass: "jwt-required", owner: "platform", riskTier: "R2", corsRequired: true, description: "release artifact signer" },
  { name: "release-artifact-verifier", category: "domain-api", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: true, description: "release artifact verifier", authJustification: "Service-internal function" },
  { name: "release-env-gate", category: "domain-api", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: true, description: "release env gate", authJustification: "Service-internal function" },
  { name: "release-evidence-graph-snapshot", category: "domain-api", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: true, description: "release evidence graph snapshot", authJustification: "Service-internal function" },
  { name: "routing-policy-update", category: "domain-api", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: true, description: "routing policy update", authJustification: "Service-internal function" },
  { name: "runbook-drill", category: "domain-api", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: true, description: "runbook drill", authJustification: "Service-internal function" },
  { name: "secret-rotation-orchestrator", category: "domain-api", authClass: "service-role", owner: "security", riskTier: "R2", corsRequired: true, description: "secret rotation orchestrator", authJustification: "Service-internal function" },
  { name: "security-anomaly-rotation-trigger", category: "domain-api", authClass: "service-role", owner: "security", riskTier: "R2", corsRequired: true, description: "security anomaly rotation trigger", authJustification: "Service-internal function" },
  { name: "security-council-tick", category: "domain-api", authClass: "service-role", owner: "security", riskTier: "R2", corsRequired: true, description: "security council tick", authJustification: "Service-internal function" },
  { name: "security-fabric-runtime-probe", category: "system-api", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: true, description: "security fabric runtime probe", authJustification: "Service-internal function" },
  { name: "security-kill-switch-recommender", category: "admin-api", authClass: "service-role", owner: "admin", riskTier: "R4", corsRequired: true, description: "security kill switch recommender", authJustification: "Service-internal function" },
  { name: "seed-advisor-registry", category: "domain-api", authClass: "service-role", owner: "advisor", riskTier: "R2", corsRequired: true, description: "seed advisor registry", authJustification: "Service-internal function" },
  { name: "seed-connector-registry", category: "webhook", authClass: "service-role", owner: "connectors", riskTier: "R2", corsRequired: true, description: "seed connector registry", authJustification: "Service-internal function" },
  { name: "sla-evaluator", category: "system-api", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: true, description: "sla evaluator", authJustification: "Service-internal function" },
  { name: "support-recovery-api", category: "domain-api", authClass: "service-role", owner: "compliance", riskTier: "R2", corsRequired: true, description: "support recovery api", authJustification: "Service-internal function" },
  { name: "tenant-self-service-bff", category: "system-api", authClass: "jwt-required", owner: "platform", riskTier: "R2", corsRequired: true, description: "tenant self service bff" },
  { name: "trace-ingest", category: "domain-api", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: true, description: "trace ingest", authJustification: "Service-internal function" },
  { name: "uptime-rollup", category: "domain-api", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: true, description: "uptime rollup", authJustification: "Service-internal function" },
  { name: "waitlist-signup", category: "domain-api", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: true, description: "waitlist signup", authJustification: "Service-internal function" },
  { name: "waitlist-stats", category: "domain-api", authClass: "service-role", owner: "platform", riskTier: "R0", corsRequired: true, description: "waitlist stats", authJustification: "Service-internal function" },
  { name: "webauthn-challenge", category: "domain-api", authClass: "jwt-required", owner: "security", riskTier: "R2", corsRequired: true, description: "webauthn challenge" },
  { name: "webhook-ingest", category: "webhook", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: true, description: "webhook ingest", authJustification: "Service-internal function" },
  { name: "webhook-process", category: "webhook", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: true, description: "webhook process", authJustification: "Service-internal function" },
  { name: "webhook-replay", category: "webhook", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: true, description: "webhook replay", authJustification: "Service-internal function" },
  { name: "webhook-retry-processor", category: "webhook", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: true, description: "webhook retry processor", authJustification: "Service-internal function" },
  { name: "workflow-execute", category: "internal", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: true, description: "workflow execute", authJustification: "Service-internal function" },
  { name: "workflow-repair", category: "internal", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: true, description: "workflow repair", authJustification: "Service-internal function" },
  { name: "workflow-replay", category: "internal", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: true, description: "workflow replay", authJustification: "Service-internal function" },
  { name: "workflow-stuck-detector", category: "internal", authClass: "service-role", owner: "platform", riskTier: "R2", corsRequired: true, description: "workflow stuck detector", authJustification: "Service-internal function" },

