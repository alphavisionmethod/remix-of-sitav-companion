// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Cross-Module Integration Map
// ───────────────────────────────────────────────────────────────
// Single source of truth for every meaningful cross-module
// relationship in the platform. Every later phase of the
// "Cross-Module Integration Deepening" project reads from this
// registry. Validators (cross-module-map-coverage.test.ts and
// check-bidirectional-navigation.ts) enforce that:
//
//   1. No known integration pair is missing here.
//   2. Every entry declares its identity model, navigation lineage,
//      proof carrier, and owning canonical service.
//   3. Pairs flagged `bidirectional: true` have real back-link
//      surfaces, not just one-way handoff.
//
// DO NOT add a parallel registry. Extend this file.
// ═══════════════════════════════════════════════════════════════

export type ModuleId =
  | "business"
  | "concierge"
  | "finance"
  | "advisor"
  | "boardroom"
  | "platform"
  | "files"
  | "notifications";

export type IdentityModel =
  // Both sides share the same primary key (rare, only when the entity is
  // truly the same record).
  | "shared-id"
  // A dedicated link table (e.g. `crm_customer_link`) carries the join.
  | "link-table"
  // One side carries a foreign-key column referencing the other (e.g.
  // `invoices.crm_contact_id`).
  | "foreign-key"
  // Loose association via a typed event/receipt payload — used when no
  // structural join makes sense but lineage must still flow.
  | "event-payload";

export type ProofCarrier =
  // Walks through `ai_action_receipts` (canonical receipt emission).
  | "ai-action-receipt"
  // Walks through `advisor_action_outcomes` (Phase 5).
  | "advisor-outcome"
  // Walks through `recovered_value_entries` (Phase 6).
  | "recovered-value"
  // Walks through `background_jobs` source/result refs (Phase 4).
  | "background-job"
  // Walks through evidence-graph nodes (Layer-3 proof).
  | "evidence-graph"
  // No structured proof carrier — UI lineage only. Must be justified.
  | "ui-only";

export interface CrossModuleIntegration {
  /** Stable id, kebab-case: `<source>-to-<target>-<entity>` */
  id: string;
  source: ModuleId;
  target: ModuleId;
  entity: string;
  identityModel: IdentityModel;
  /** Owning canonical service path (relative to repo root). */
  ownerService: string;
  /** Forward navigation (source → target). Route + handoff helper. */
  forwardRoute: string;
  forwardHandoff: "setLinkedContext" | "route-param" | "context-provider";
  /** Reverse navigation (target → source). `null` only if intentionally
   *  one-way and recorded in `oneWayRationale`. */
  reverseRoute: string | null;
  bidirectional: boolean;
  oneWayRationale?: string;
  proofCarrier: ProofCarrier;
  /** Notification dispatcher topic, when outcomes here should notify. */
  notificationTopic?: string;
  /** Free-form notes — implementation-specific context. */
  notes?: string;
}

export const CROSS_MODULE_INTEGRATIONS: readonly CrossModuleIntegration[] = [
  // ── CRM ↔ Finance ─────────────────────────────────────────────
  {
    id: "crm-to-finance-contact-customer",
    source: "business",
    target: "finance",
    entity: "crm_contact ↔ customer",
    identityModel: "link-table",
    ownerService: "src/lib/services/business-os/crm-finance-bridge.service.ts",
    forwardRoute: "/business/quotes",
    forwardHandoff: "setLinkedContext",
    reverseRoute: "/business/crm",
    bidirectional: true,
    proofCarrier: "ai-action-receipt",
    notificationTopic: "finance.invoice",
    notes: "Bridge table crm_customer_link; auto-link on quote/invoice create.",
  },
  {
    id: "crm-to-finance-company-customer",
    source: "business",
    target: "finance",
    entity: "crm_company ↔ customer",
    identityModel: "link-table",
    ownerService: "src/lib/services/business-os/crm-finance-bridge.service.ts",
    forwardRoute: "/business/quotes",
    forwardHandoff: "setLinkedContext",
    reverseRoute: "/business/crm",
    bidirectional: true,
    proofCarrier: "ai-action-receipt",
    notes: "Phase 2 — adds crm_company_id partial-unique index to bridge.",
  },

  // ── CRM ↔ Concierge ───────────────────────────────────────────
  {
    id: "crm-to-concierge-contact-appointment",
    source: "business",
    target: "concierge",
    entity: "crm_contact ↔ appointment",
    identityModel: "foreign-key",
    ownerService: "src/modules/business/components/business/crm/CRMConciergeLinkage.tsx",
    forwardRoute: "/concierge/appointments",
    forwardHandoff: "setLinkedContext",
    reverseRoute: "/business/crm",
    bidirectional: true,
    proofCarrier: "ai-action-receipt",
    notes: "appointments.crm_contact_id / crm_company_id direct FK.",
  },
  {
    id: "concierge-to-business-household-contact",
    source: "concierge",
    target: "business",
    entity: "household ↔ crm_contact|crm_company",
    identityModel: "link-table",
    ownerService: "src/lib/services/concierge/household-business-bridge.service.ts",
    forwardRoute: "/business/crm",
    forwardHandoff: "setLinkedContext",
    reverseRoute: "/concierge/household",
    bidirectional: true,
    proofCarrier: "ai-action-receipt",
    notes: "Phase 3 — new household_business_link table, mirrors crm_customer_link shape.",
  },
  {
    id: "concierge-to-business-provider-contact",
    source: "concierge",
    target: "business",
    entity: "provider ↔ crm_contact",
    identityModel: "link-table",
    ownerService: "src/lib/services/concierge/household-business-bridge.service.ts",
    forwardRoute: "/business/crm",
    forwardHandoff: "setLinkedContext",
    reverseRoute: "/concierge/providers",
    bidirectional: true,
    proofCarrier: "ai-action-receipt",
    notes: "Phase 3 — provider rows surfaced on CRMContactDetail.",
  },

  // ── Background tasks ↔ source/result modules ─────────────────
  {
    id: "background-task-to-source",
    source: "platform",
    target: "business",
    entity: "background_job ↔ originating workflow",
    identityModel: "foreign-key",
    ownerService: "src/platform/integration/background-task-target-resolver.ts",
    forwardRoute: "/operations/background-tasks",
    forwardHandoff: "route-param",
    reverseRoute: "*",
    bidirectional: true,
    proofCarrier: "background-job",
    notes: "Phase 4 — promote resolver, extend with Concierge + Finance source tables.",
  },
  {
    id: "background-task-to-result",
    source: "platform",
    target: "files",
    entity: "background_job ↔ result_artifact",
    identityModel: "foreign-key",
    ownerService: "src/platform/integration/background-task-target-resolver.ts",
    forwardRoute: "/files",
    forwardHandoff: "route-param",
    reverseRoute: "/operations/background-tasks",
    bidirectional: true,
    proofCarrier: "background-job",
    notes: "Phase 4 — surface result_artifact_ref as 'Open result'.",
  },

  // ── Advisor ↔ business / finance / concierge outcomes ────────
  {
    id: "advisor-to-operational-outcome",
    source: "advisor",
    target: "business",
    entity: "advisor_recommendation ↔ advisor_action_outcomes",
    identityModel: "foreign-key",
    ownerService: "src/lib/services/advisors/advisor-outcome-bridge.service.ts",
    forwardRoute: "/business/crm",
    forwardHandoff: "setLinkedContext",
    reverseRoute: "/boardroom/advisors",
    bidirectional: true,
    proofCarrier: "advisor-outcome",
    notificationTopic: "advisor.outcome",
    notes: "Phase 5 — new advisor_action_outcomes table, trigger from receipts.",
  },

  // ── Recovered value ↔ Finance / Revenue ──────────────────────
  {
    id: "recovered-value-to-finance",
    source: "business",
    target: "finance",
    entity: "recovered_value_entry ↔ invoice",
    identityModel: "foreign-key",
    ownerService: "src/lib/services/business-os/recovered-value-ledger.service.ts",
    forwardRoute: "/business/revenue",
    forwardHandoff: "setLinkedContext",
    reverseRoute: "/money/wealth",
    bidirectional: true,
    proofCarrier: "recovered-value",
    notes: "Phase 6 — DB-backed ledger, surfaces on RevenueAutopilotConsole + WealthCommandCenter.",
  },

  // ── Adaptive signals ↔ cross-domain receivers ────────────────
  {
    id: "adaptive-signal-bus",
    source: "platform",
    target: "business",
    entity: "adaptive_signal ↔ overview prioritization",
    identityModel: "event-payload",
    ownerService: "src/platform/integration/cross-domain-signal-bus.ts",
    forwardRoute: "*",
    forwardHandoff: "context-provider",
    reverseRoute: null,
    bidirectional: false,
    oneWayRationale:
      "Signals are emitted; receivers consume passively to reorder priority. No reverse navigation semantics.",
    proofCarrier: "ui-only",
    notes: "Phase 7 — promote CrossDomainSignalBridge to platform, wire receivers in Concierge/Finance/Boardroom.",
  },

  // ── Wearable / readiness ↔ interruption policy ───────────────
  {
    id: "readiness-to-interruption-policy",
    source: "platform",
    target: "notifications",
    entity: "readiness_snapshot ↔ notification gate",
    identityModel: "event-payload",
    ownerService: "src/platform/notifications/readiness-gate.ts",
    forwardRoute: "*",
    forwardHandoff: "context-provider",
    reverseRoute: null,
    bidirectional: false,
    oneWayRationale:
      "Readiness is a sensor signal that gates dispatch; users do not navigate from a notification back to the readiness sample.",
    proofCarrier: "ui-only",
    notes: "Phase 7 — pure gate function used by NotificationDispatcher and SitaProactiveBus.",
  },
] as const;

/** Lookup helper used by validators. */
export function getIntegration(id: string): CrossModuleIntegration | undefined {
  return CROSS_MODULE_INTEGRATIONS.find((i) => i.id === id);
}

/** Stable list of integration ids — used by coverage tests. */
export const CROSS_MODULE_INTEGRATION_IDS = CROSS_MODULE_INTEGRATIONS.map((i) => i.id);