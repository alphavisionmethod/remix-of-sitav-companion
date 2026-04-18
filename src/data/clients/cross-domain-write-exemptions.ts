// ═══════════════════════════════════════════════════════════════
// SITA OS — Cross-Domain Write Exemption Registry (Phase 18.1.A)
//
// Every cross-domain writer surfaced by `table-writer-reader-map`
// MUST be registered here with a reason + rationale + reviewer.
// `check-db-reality.ts` errors (release blocker) on any unregistered
// cross-domain writer.
//
// Updating this file requires governance review — it is the only
// allowed escape valve from domain-boundary enforcement.
// ═══════════════════════════════════════════════════════════════

export type ExemptionReason =
  | "admin-bff-by-design"      // admin-tier BFFs are designed to aggregate across domains
  | "gateway-by-design"        // gateways legitimately own their domain slice
  | "seed-fixture"             // dev / test seed only — never runs in prod write path
  | "system-orchestrator"      // system-level orchestrators (brain-core, self-healing)
  | "shared-audit-sink";       // shared audit / event sinks accept cross-domain writes

export interface CrossDomainWriteExemption {
  readonly function: string;
  readonly table: string;
  readonly reason: ExemptionReason;
  readonly rationale: string;
  readonly reviewedBy: string;
  readonly reviewedAt: string; // ISO date
}

/**
 * Canonical exemption list. Keyed by `${table}::${function}` for fast lookup.
 * Every entry MUST be reviewed by a domain owner + the platform-architecture team.
 */
export const CROSS_DOMAIN_WRITE_EXEMPTIONS: readonly CrossDomainWriteExemption[] = [
  // ── ai-workforce: admin-ai-workforce-run is the admin runner ─────────
  {
    function: "admin-ai-workforce-run",
    table: "ai_workforce_approval_queue",
    reason: "admin-bff-by-design",
    rationale: "Admin runner enqueues approval items into ai-workforce queue as part of admin invocation flow.",
    reviewedBy: "ai-engineering + admin-governance",
    reviewedAt: "2026-04-17",
  },
  {
    function: "admin-ai-workforce-run",
    table: "ai_workforce_invocations",
    reason: "admin-bff-by-design",
    rationale: "Admin runner records the invocation it just executed against the ai-workforce ledger.",
    reviewedBy: "ai-engineering + admin-governance",
    reviewedAt: "2026-04-17",
  },
  {
    function: "admin-ai-workforce-run",
    table: "ai_workforce_outputs",
    reason: "admin-bff-by-design",
    rationale: "Admin runner persists the output blob produced by the invocation.",
    reviewedBy: "ai-engineering + admin-governance",
    reviewedAt: "2026-04-17",
  },
  {
    function: "admin-ai-workforce-run",
    table: "ai_workforce_role_health",
    reason: "admin-bff-by-design",
    rationale: "Admin runner updates per-role health stats after each invocation.",
    reviewedBy: "ai-engineering + admin-governance",
    reviewedAt: "2026-04-17",
  },

  // ── platform-engineering: admin-users manages user_roles ─────────────
  {
    function: "admin-users",
    table: "user_roles",
    reason: "admin-bff-by-design",
    rationale: "User-management admin BFF assigns and revokes roles via the user_roles table.",
    reviewedBy: "platform-engineering + admin-governance",
    reviewedAt: "2026-04-17",
  },

  // ── crm: booking-manage + seed-user-data ─────────────────────────────
  {
    function: "booking-manage",
    table: "appointments",
    reason: "gateway-by-design",
    rationale: "Booking gateway is the canonical writer for appointments; CRM owns the table for read-side relationships.",
    reviewedBy: "crm-team + platform-engineering",
    reviewedAt: "2026-04-17",
  },
  {
    function: "seed-user-data",
    table: "appointments",
    reason: "seed-fixture",
    rationale: "Seed-only function used in dev/test to bootstrap demo appointments; never runs in production write path.",
    reviewedBy: "platform-engineering",
    reviewedAt: "2026-04-17",
  },
  {
    function: "crm-sync",
    table: "leads",
    reason: "gateway-by-design",
    rationale: "CRM-sync is the inbound integration writer for leads ingested from external CRMs; lives outside crm-team domain to keep sync isolated.",
    reviewedBy: "crm-team + connector-integrations",
    reviewedAt: "2026-04-17",
  },
  {
    function: "seed-user-data",
    table: "leads",
    reason: "seed-fixture",
    rationale: "Seed-only function used in dev/test to bootstrap demo leads.",
    reviewedBy: "platform-engineering",
    reviewedAt: "2026-04-17",
  },

  // ── cloud: os-agent-channel writes activity journal ──────────────────
  {
    function: "os-agent-channel",
    table: "cloud_activity_journal",
    reason: "system-orchestrator",
    rationale: "OS agent channel is the system orchestrator that writes structured activity events to the cloud activity journal.",
    reviewedBy: "cloud-team + os-kernel-team",
    reviewedAt: "2026-04-17",
  },
  {
    function: "os-agent-channel",
    table: "communication_metrics",
    reason: "system-orchestrator",
    rationale: "OS agent channel emits communication metrics for UX dashboards as a side-effect of agent traffic.",
    reviewedBy: "ux-team + os-kernel-team",
    reviewedAt: "2026-04-17",
  },

  // ── compliance: self-healing creates incident records ────────────────
  {
    function: "self-healing",
    table: "incidents",
    reason: "system-orchestrator",
    rationale: "Self-healing system orchestrator opens incidents when it detects health regressions; compliance owns the read/audit side.",
    reviewedBy: "compliance-team + platform-engineering",
    reviewedAt: "2026-04-17",
  },

  // ── os-kernel: brain-core writes command memory ──────────────────────
  {
    function: "brain-core",
    table: "command_memory",
    reason: "system-orchestrator",
    rationale: "Brain-core is the system-level memory orchestrator that updates command_memory after every reasoning loop.",
    reviewedBy: "os-kernel-team + ai-engineering",
    reviewedAt: "2026-04-17",
  },

  // ── platform: license-gateway owns license tables ────────────────────
  {
    function: "license-gateway",
    table: "license_activations",
    reason: "gateway-by-design",
    rationale: "License gateway is the canonical writer for license activations; platform-engineering owns the schema for cross-domain reads.",
    reviewedBy: "platform-engineering",
    reviewedAt: "2026-04-17",
  },
  {
    function: "license-gateway",
    table: "license_audit_log",
    reason: "shared-audit-sink",
    rationale: "License audit log is a shared audit sink written by the license gateway and read by compliance + admin.",
    reviewedBy: "platform-engineering + compliance-team",
    reviewedAt: "2026-04-17",
  },

  // ── platform: support-gateway + user-bff-gateway own support tables ──
  {
    function: "support-gateway",
    table: "support_case_events",
    reason: "gateway-by-design",
    rationale: "Support gateway is the canonical writer for support case events.",
    reviewedBy: "platform-engineering",
    reviewedAt: "2026-04-17",
  },
  {
    function: "user-bff-gateway",
    table: "support_case_events",
    reason: "gateway-by-design",
    rationale: "User BFF gateway records user-side support events when end users update their own cases.",
    reviewedBy: "platform-engineering",
    reviewedAt: "2026-04-17",
  },
  {
    function: "support-gateway",
    table: "support_cases",
    reason: "gateway-by-design",
    rationale: "Support gateway is the canonical writer for support cases.",
    reviewedBy: "platform-engineering",
    reviewedAt: "2026-04-17",
  },
];

/** Fast-lookup index keyed by `${table}::${function}`. */
const EXEMPTION_INDEX = new Set(
  CROSS_DOMAIN_WRITE_EXEMPTIONS.map((e) => `${e.table}::${e.function}`),
);

export function isExemptedCrossDomainWriter(table: string, fn: string): boolean {
  return EXEMPTION_INDEX.has(`${table}::${fn}`);
}

export function getExemption(table: string, fn: string): CrossDomainWriteExemption | undefined {
  return CROSS_DOMAIN_WRITE_EXEMPTIONS.find((e) => e.table === table && e.function === fn);
}

export function exemptionStats() {
  const byReason: Record<string, number> = {};
  for (const e of CROSS_DOMAIN_WRITE_EXEMPTIONS) {
    byReason[e.reason] = (byReason[e.reason] ?? 0) + 1;
  }
  return {
    total: CROSS_DOMAIN_WRITE_EXEMPTIONS.length,
    byReason,
  };
}
