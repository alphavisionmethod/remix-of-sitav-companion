// ═══════════════════════════════════════════════════════════════
// Business OS — Verification Matrix
// ───────────────────────────────────────────────────────────────
// Single source of truth classifying every Business OS surface
// (page, service, route, engine, trust flow, E2E journey) by its
// verification state. Drives:
//   • src/__tests__/business-os/_matrix/matrix.test.ts
//   • scripts/architecture/check-business-os-coverage.ts (CI gate)
//   • BUSINESS_OS_VERIFICATION_HARDENING_REPORT.md
//
// Update this file whenever a Business OS surface is added,
// renamed, or its verification level changes. CI will fail if
// a new page/service is missing from this matrix.
// ═══════════════════════════════════════════════════════════════

export type CoverageStatus =
  | "missing"        // no test exists
  | "partial"        // limited / heuristic only
  | "behavioral"     // unit/integration test asserting behavior
  | "e2e";           // exercised by a Playwright spec

export type Priority = "P0" | "P1" | "P2";

export interface SurfaceEntry {
  id: string;
  kind: "page" | "service" | "engine" | "route" | "trust" | "integration" | "adaptive" | "e2e";
  /** Path of the implementation file or route (relative to repo root). */
  ref: string;
  /** Path(s) of the test file(s) that cover it (relative to repo root). */
  tests: string[];
  status: CoverageStatus;
  priority: Priority;
  notes?: string;
}

// ── Pages (high-value Business OS surfaces) ───────────────────
export const PAGE_SURFACES: SurfaceEntry[] = [
  { id: "page.crm-home", kind: "page", ref: "src/modules/business/pages/CRMHome.tsx", tests: ["src/__tests__/business-os/pages/crm-home.test.tsx"], status: "behavioral", priority: "P0" },
  { id: "page.crm-pipeline", kind: "page", ref: "src/modules/business/pages/CRMPipeline.tsx", tests: ["src/__tests__/business-os/pages/crm-pipeline.test.tsx"], status: "behavioral", priority: "P0" },
  { id: "page.crm-contacts", kind: "page", ref: "src/modules/business/pages/CRMContacts.tsx", tests: ["src/__tests__/business-os/pages/crm-contacts.test.tsx"], status: "behavioral", priority: "P0" },
  { id: "page.crm-import-center", kind: "page", ref: "src/modules/business/pages/CRMImportCenter.tsx", tests: ["src/__tests__/business-os/pages/crm-import-center.test.tsx"], status: "behavioral", priority: "P1" },
  { id: "page.crm-duplicates", kind: "page", ref: "src/modules/business/pages/CRMDuplicates.tsx", tests: ["src/__tests__/business-os/pages/crm-duplicates.test.tsx"], status: "behavioral", priority: "P1" },
  { id: "page.leads-inbox", kind: "page", ref: "src/modules/business/pages/LeadsInbox.tsx", tests: ["src/__tests__/business-os/pages/leads-inbox.test.tsx"], status: "behavioral", priority: "P0" },
  { id: "page.lead-recovery", kind: "page", ref: "src/modules/business/pages/LeadRecovery.tsx", tests: ["src/__tests__/business-os/pages/lead-recovery.test.tsx"], status: "behavioral", priority: "P0" },
  { id: "page.autopilot-hub", kind: "page", ref: "src/modules/business/pages/AutopilotHub.tsx", tests: ["src/__tests__/business-os/pages/autopilot-hub.test.tsx"], status: "behavioral", priority: "P0" },
  { id: "page.business-advisor-board", kind: "page", ref: "src/modules/business/pages/BusinessAdvisorBoardPage.tsx", tests: ["src/__tests__/business-os/pages/business-advisor-board.test.tsx"], status: "behavioral", priority: "P0" },
  { id: "page.appointments", kind: "page", ref: "src/modules/business/pages/AppointmentsScheduling.tsx", tests: ["src/__tests__/business-os/pages/appointments-scheduling.test.tsx"], status: "behavioral", priority: "P0" },
  { id: "page.business-proof", kind: "page", ref: "src/modules/business/pages/BusinessProof.tsx", tests: ["src/__tests__/business-os/pages/business-proof.test.tsx"], status: "behavioral", priority: "P0" },
  { id: "page.proposals-contracts", kind: "page", ref: "src/modules/business/pages/ProposalsContracts.tsx", tests: ["src/__tests__/business-os/pages/proposals-contracts.test.tsx"], status: "behavioral", priority: "P0" },
  { id: "page.invoices-collections", kind: "page", ref: "src/modules/business/pages/InvoicesCollections.tsx", tests: ["src/__tests__/business-os/pages/invoices-collections.test.tsx"], status: "behavioral", priority: "P0" },
  { id: "page.revenue-autopilot", kind: "page", ref: "src/modules/business/pages/RevenueAutopilot.tsx", tests: ["src/__tests__/business-os/pages/revenue-autopilot.test.tsx"], status: "behavioral", priority: "P1" },
  { id: "page.customer-health", kind: "page", ref: "src/modules/business/pages/CustomerHealthPage.tsx", tests: ["src/__tests__/business-os/pages/customer-health.test.tsx"], status: "behavioral", priority: "P1" },
];

// ── Services / engines with deterministic behavioral tests ────
export const SERVICE_SURFACES: SurfaceEntry[] = [
  { id: "svc.lead-scoring", kind: "service", ref: "src/lib/services/business-os/lead-scoring.service.ts", tests: ["src/__tests__/business-os/services/lead-scoring.service.test.ts"], status: "behavioral", priority: "P0" },
  { id: "svc.opportunity-ranking", kind: "service", ref: "src/lib/services/business-os/opportunity-ranking.service.ts", tests: ["src/__tests__/business-os/services/opportunity-ranking.service.test.ts"], status: "behavioral", priority: "P0" },
  { id: "svc.recovery-engine", kind: "service", ref: "src/lib/services/business-os/recovery-engine.service.ts", tests: ["src/__tests__/business-os/services/recovery-engine.service.test.ts"], status: "behavioral", priority: "P0" },
  { id: "svc.no-show-recovery", kind: "service", ref: "src/lib/services/business-os/no-show-recovery.service.ts", tests: ["src/__tests__/business-os/services/no-show-recovery.service.test.ts"], status: "behavioral", priority: "P0" },
  { id: "svc.profile-evolution", kind: "service", ref: "src/lib/services/business-os/profile-evolution.service.ts", tests: ["src/__tests__/business-os/services/profile-evolution.service.test.ts"], status: "behavioral", priority: "P1" },
  { id: "svc.business-profile", kind: "service", ref: "src/lib/services/business-os/business-profile.service.ts", tests: ["src/__tests__/business-os/services/business-profile.service.test.ts"], status: "behavioral", priority: "P0" },
  { id: "svc.recovered-value-ledger", kind: "service", ref: "src/lib/services/business-os/recovered-value-ledger.service.ts", tests: ["src/__tests__/business-os/services/recovered-value-ledger.service.test.ts"], status: "behavioral", priority: "P1" },
  { id: "svc.stale-lead-detector", kind: "service", ref: "src/lib/services/business-os/stale-lead-detector.service.ts", tests: ["src/__tests__/business-os/services/stale-lead-detector.service.test.ts"], status: "behavioral", priority: "P1" },
  { id: "svc.leakage-engine", kind: "service", ref: "src/lib/services/business-os/leakage-engine.service.ts", tests: ["src/__tests__/business-os/services/leakage-engine.service.test.ts"], status: "behavioral", priority: "P1" },
  { id: "svc.crm-finance-bridge", kind: "service", ref: "src/lib/services/business-os/crm-finance-bridge.service.ts", tests: ["src/__tests__/business-os/integration/crm-finance-bridge.test.ts"], status: "behavioral", priority: "P0" },
  { id: "svc.revenue-autopilot", kind: "service", ref: "src/lib/services/business-os/revenue-autopilot.service.ts", tests: ["src/__tests__/business-os/services/revenue-autopilot.service.test.ts"], status: "behavioral", priority: "P1" },
  { id: "svc.opportunity-engine", kind: "service", ref: "src/lib/services/business-os/opportunity-engine.service.ts", tests: ["src/__tests__/business-os/services/opportunity-engine.service.test.ts"], status: "behavioral", priority: "P1" },
  { id: "svc.invoice-linking", kind: "service", ref: "src/lib/services/business-os/invoice-linking.service.ts", tests: ["src/__tests__/business-os/services/invoice-linking.service.test.ts"], status: "behavioral", priority: "P1" },
  { id: "svc.callback-queue", kind: "service", ref: "src/lib/services/business-os/callback-queue.service.ts", tests: ["src/__tests__/business-os/services/callback-queue.service.test.ts"], status: "behavioral", priority: "P1" },
  { id: "svc.customer-health", kind: "service", ref: "src/lib/services/business-os/customer-health.service.ts", tests: ["src/__tests__/business-os/services/customer-health.service.test.ts"], status: "behavioral", priority: "P1" },
  { id: "svc.continuity-verification", kind: "service", ref: "src/lib/services/business-os/continuity-verification.service.ts", tests: ["src/__tests__/business-os/services/continuity-verification.service.test.ts", "src/__tests__/business-os/trust/continuity-verification.test.ts"], status: "behavioral", priority: "P0" },
  { id: "svc.support-health-loop", kind: "service", ref: "src/lib/services/business-os/support-health-loop.service.ts", tests: ["src/__tests__/business-os/integration/support-health-loop.test.ts"], status: "behavioral", priority: "P1", notes: "Phase 8 — drift fix; existing test was orphaned from matrix" },
];

/** Services intentionally excluded from dedicated behavioral tests, with stable reason. */
export const SERVICE_TEST_EXCLUSIONS: Record<string, string> = {
  "src/lib/services/business-os/accounts.service.ts": "thin Supabase CRUD wrapper — exercised via CRM page tests",
  "src/lib/services/business-os/business-boardroom-inputs.service.ts": "data adapter — covered by boardroom-journey E2E",
  "src/lib/services/business-os/collections-command.service.ts": "view aggregator — covered by revenue-flow E2E",
  "src/lib/services/business-os/collections.service.ts": "thin CRUD — covered by revenue-flow E2E",
  "src/lib/services/business-os/contacts.service.ts": "thin CRUD — covered by CRMContacts page test",
  "src/lib/services/business-os/customer-dashboard.service.ts": "view aggregator — covered by customer-health page test",
  "src/lib/services/business-os/customer-timeline.service.ts": "view aggregator — covered by integration test",
  "src/lib/services/business-os/follow-up.service.ts": "thin Supabase CRUD wrapper",
  "src/lib/services/business-os/lead-intake.service.ts": "thin Supabase CRUD wrapper — covered by leads-inbox page test",
  "src/lib/services/business-os/proposals.service.ts": "thin Supabase CRUD — covered by proposals-contracts page test",
  "src/lib/services/business-os/quotes.service.ts": "thin Supabase CRUD — covered by revenue-flow E2E",
  "src/lib/services/business-os/reactivation.service.ts": "thin Supabase CRUD — covered by lead-recovery page test",
  "src/lib/services/business-os/website-management.service.ts": "tier-gated marketing surface, no business logic",
};

// ── Route integrity ────────────────────────────────────────────
export const ROUTE_SURFACES: SurfaceEntry[] = [
  { id: "route.business-routes", kind: "route", ref: "src/routes/families/business-routes.tsx", tests: ["src/__tests__/business-os/routes/business-routes-integrity.test.ts", "src/__tests__/business-os/routes/business-page-composition.test.ts"], status: "behavioral", priority: "P0" },
];

// ── Trust / receipt / approval ────────────────────────────────
export const TRUST_SURFACES: SurfaceEntry[] = [
  { id: "trust.receipt-emission", kind: "trust", ref: "src/hooks/use-phase10-actions.ts", tests: ["src/__tests__/business-os/trust/receipt-emission.test.tsx"], status: "behavioral", priority: "P0" },
  { id: "trust.approval-routing", kind: "trust", ref: "src/lib/policy/", tests: ["src/__tests__/business-os/trust/approval-routing.test.ts"], status: "behavioral", priority: "P0" },
  { id: "trust.proof-lineage", kind: "trust", ref: "src/lib/services/business-os/continuity-verification.service.ts", tests: ["src/__tests__/business-os/trust/proof-lineage.test.ts"], status: "behavioral", priority: "P1" },
  { id: "trust.edge-receipt-binding", kind: "trust", ref: "supabase/functions/_shared/receipt-emitter.ts", tests: ["src/__tests__/business-os/trust/edge-receipt-binding.test.ts"], status: "behavioral", priority: "P0", notes: "Phase 8 — drift gate proving every edge writer to ai_action_receipts carries canonical lineage columns" },
  { id: "trust.journey-e2e", kind: "trust", ref: "src/lib/services/canonical-pipeline/pipeline-orchestrator.ts", tests: ["src/__tests__/business-os/trust/trust-journey-e2e.test.ts"], status: "behavioral", priority: "P0", notes: "Phase 9 — full 9-stage canonical pipeline E2E + approval-map ↔ proof-requirements lineage coherence" },
  { id: "trust.rls-multi-tenancy", kind: "trust", ref: "generated/db/rls-snapshot.json", tests: ["src/__tests__/tenant-isolation/rls-behavioral-e2e.test.ts"], status: "behavioral", priority: "P0", notes: "Phase 10 — live RLS snapshot proves 100% RLS coverage, is_org_member SECURITY DEFINER seam, and 32-table org-isolation pattern" },
  { id: "trust.edge-function-security", kind: "trust", ref: "generated/edge-functions/security-snapshot.json", tests: ["src/__tests__/edge-function-security/edge-function-security-e2e.test.ts"], status: "behavioral", priority: "P0", notes: "Phase 11 — fleet-wide edge function security E2E: 100% CORS/OPTIONS coverage, JWT/admin/service-role/anon/webhook contract parity, capability-refusal posture, single SDK major, env-leak guard, and bounded auth-map drift exemptions (8 jwt + 5 admin + 4 service-role/admin + 1 service-role usage)" },
  { id: "trust.connector-oauth-refresh", kind: "trust", ref: "generated/connectors/connector-snapshot.json", tests: ["src/__tests__/connector-trust/connector-oauth-refresh-e2e.test.ts"], status: "behavioral", priority: "P0", notes: "Phase 12 — connector OAuth refresh chain E2E: live snapshot of 13 connector tables + token-refresh worker provider parity (google/microsoft/slack) + probe failure-class taxonomy + nightly verifier 3-pillar evidence (live_refresh, expiry_pressure, state_consistency) + reauth tracker single-table contract" },
  { id: "trust.storage-bucket-rls", kind: "trust", ref: "generated/storage/storage-snapshot.json", tests: ["src/__tests__/storage-trust/storage-rls-behavioral-e2e.test.ts"], status: "behavioral", priority: "P0", notes: "Phase 12 — storage RLS E2E: every bucket pinned to one of 4 access patterns (per-user / admin-only / public-read+admin-write / public-read+per-user-write); no public flag escapes, no ALL grants to broad roles, owner-folder gating proven on every mutating verb, and policy-bucket reference graph fully closed" },
  { id: "trust.sovereign-ai-gateway", kind: "trust", ref: "generated/ai-gateway/gateway-snapshot.json", tests: ["src/__tests__/ai-gateway/sovereign-ai-gateway-e2e.test.ts"], status: "behavioral", priority: "P0", notes: "Phase 14 — Sovereign AI Gateway behavioral E2E: 9 canonical invariants (auth/kill-switch/strict-budget/3-table-receipt-lineage/fallback-events/R3+ raw-prompt rejection/rate-limit), ZERO direct provider SDK imports anywhere, ZERO src/** direct provider HTTP calls, edge fleet drift bounded at 24 with stable per-file remediation rationales (Tier A observability / Tier B streaming / Tier C advisor loops / Tier D agent service-role lane / Tier E specialized pipelines), invokeAI client R3+ promptFamilyId enforcement (defense in depth), and stale-detector for remediated entries" },
  { id: "trust.unified-policy-resolver", kind: "trust", ref: "src/lib/policy/", tests: ["src/__tests__/policy-enforcement/unified-policy-resolver-e2e.test.ts"], status: "behavioral", priority: "P0", notes: "Phase 15 — Unified Policy Resolver behavioral E2E (51 invariants across 9 dimensions): actor-capability ceilings (anonymous→R0, advisor→R2), surface gating (money offline-blocked, system web-read-only), risk×surface approval matrix (R5 ⇒ boardroom-approval + 7-component proof bundle), exemption codification (identity/R4 substitutes biometric step-up for approval receipts), and resolver determinism on every (actor × surface × risk × runtime) cell" },
  { id: "trust.webhook-signature", kind: "trust", ref: "generated/webhooks/webhook-snapshot.json", tests: ["src/__tests__/webhook-security/webhook-signature-e2e.test.ts"], status: "behavioral", priority: "P0", notes: "Phase 16 — Webhook signature & external-callback E2E: 11-function fleet snapshot (1 intake / 1 dispatcher / 1 processor / 1 retry / 1 replay / 6 domain-ingest), canonical intake parses provider sig headers + advertises them in CORS + writes signature_valid + idempotency anchor + service-role lane, dispatcher signs with per-subscription HMAC secrets (DB-stored, not env-shared), retry processor enforces bounded attempts + DLQ, processor/retry/replay all anchor to service-role (no end-user JWT path), domain-ingest fleet pinned at 6 with codified rationale (alert/apm/crash/error/recovery-evidence/trace), and only the canonical intake exposes signature headers in CORS (no silent broadening)" },
];

// ── Cross-module integration ──────────────────────────────────
export const INTEGRATION_SURFACES: SurfaceEntry[] = [
  { id: "int.crm-finance-bridge", kind: "integration", ref: "src/lib/services/business-os/crm-finance-bridge.service.ts", tests: ["src/__tests__/business-os/integration/crm-finance-bridge.test.ts"], status: "behavioral", priority: "P0" },
  { id: "int.crm-files-linkage", kind: "integration", ref: "src/lib/services/business-os/", tests: ["src/__tests__/business-os/integration/crm-files-linkage.test.ts"], status: "behavioral", priority: "P1" },
  { id: "int.advisor-business-action", kind: "integration", ref: "src/lib/kernel-handlers", tests: ["src/__tests__/business-os/integration/advisor-business-action.test.ts"], status: "behavioral", priority: "P0" },
  { id: "int.background-task-source", kind: "integration", ref: "src/modules/business/pages/BackgroundTaskCenter.tsx", tests: ["src/__tests__/business-os/integration/background-task-source.test.ts"], status: "behavioral", priority: "P2" },
  { id: "int.concierge-business-linkage", kind: "integration", ref: "src/domains/engines/cross-os-integration.ts", tests: ["src/__tests__/business-os/integration/concierge-business-linkage.test.ts", "src/__tests__/business-os/integration/crm-concierge-linkage-live.test.tsx"], status: "behavioral", priority: "P0", notes: "Phase 8 — archetype-filtered Business↔Concierge cross-OS seams + live CRM→Concierge query" },
  { id: "int.cross-os-e2e", kind: "integration", ref: "src/domains/engines/cross-os-integration.ts", tests: ["src/__tests__/cross-os/cross-os-integration-e2e.test.ts"], status: "behavioral", priority: "P0", notes: "Phase 13 — full Business↔Finance↔Concierge bridge E2E: registry truth, archetype filter integrity (12 archetypes × 3 source apps = 36 cells), bidirectional pair coverage, adaptation parity (Finance + Concierge × 12), signal lineage (signal→link coherence), event bus + crossNavigate behavioral contract, and ratchet-protected link/signal counts" },
];

// ── Adaptive profile persistence ──────────────────────────────
export const ADAPTIVE_SURFACES: SurfaceEntry[] = [
  { id: "adaptive.business-profile-persistence", kind: "adaptive", ref: "src/contexts/BusinessProfileContext.tsx", tests: ["src/__tests__/business-os/adaptive/business-profile-persistence.test.tsx"], status: "behavioral", priority: "P0" },
  { id: "adaptive.surface-reactivity", kind: "adaptive", ref: "src/modules/business/components/business/adaptive/", tests: ["src/__tests__/business-os/adaptive/adaptive-surface-reactivity.test.tsx"], status: "behavioral", priority: "P0" },
  { id: "adaptive.profile-evolution", kind: "adaptive", ref: "src/lib/services/business-os/profile-evolution.service.ts", tests: ["src/__tests__/business-os/adaptive/profile-evolution-persistence.test.ts"], status: "behavioral", priority: "P1" },
];

// ── End-to-end journeys (Playwright) ──────────────────────────
export const E2E_SURFACES: SurfaceEntry[] = [
  { id: "e2e.revenue-flow", kind: "e2e", ref: "/business/crm-contacts → /business/collections", tests: ["tests/e2e/business-os/revenue-flow.spec.ts"], status: "e2e", priority: "P0" },
  { id: "e2e.advisor-action-approval", kind: "e2e", ref: "/business/crm-advisor → /business/proof", tests: ["tests/e2e/business-os/advisor-action-approval.spec.ts"], status: "e2e", priority: "P0" },
  { id: "e2e.crm-import-dedupe", kind: "e2e", ref: "/business/crm-import → /business/crm-duplicates", tests: ["tests/e2e/business-os/crm-import-dedupe.spec.ts"], status: "e2e", priority: "P0" },
  { id: "e2e.autopilot-setup-control", kind: "e2e", ref: "/business/autopilot-hub", tests: ["tests/e2e/business-os/autopilot-setup-control.spec.ts"], status: "e2e", priority: "P0" },
  { id: "e2e.lead-recovery", kind: "e2e", ref: "/business/leads → /business/lead-recovery", tests: ["tests/e2e/business-os/lead-recovery-flow.spec.ts"], status: "e2e", priority: "P0" },
  { id: "e2e.appointments-phase10", kind: "e2e", ref: "/business/appointments + /sign/:token", tests: ["tests/e2e/business-os/appointments-phase10.spec.ts"], status: "e2e", priority: "P0" },
  { id: "e2e.business-proof-trail", kind: "e2e", ref: "/business/proof + /business/continuity-report", tests: ["tests/e2e/business-os/business-proof-trail.spec.ts"], status: "e2e", priority: "P1" },
];

export const ALL_SURFACES: SurfaceEntry[] = [
  ...PAGE_SURFACES,
  ...SERVICE_SURFACES,
  ...ROUTE_SURFACES,
  ...TRUST_SURFACES,
  ...INTEGRATION_SURFACES,
  ...ADAPTIVE_SURFACES,
  ...E2E_SURFACES,
];

/** Pages explicitly excluded from per-page state-honesty tests, with a stable reason. */
export const PAGE_TEST_EXCLUSIONS: Record<string, string> = {
  "BusinessCenter.tsx": "router/dispatcher — covered by route-integrity test",
  "BusinessSettingsPage.tsx": "settings shell — covered by settings-routes coverage",
  "BusinessOverview.tsx": "redirect shim",
  "BusinessDocuments.tsx": "files passthrough — covered by files-journey",
  "WebsiteBuilder.tsx": "tier-gated marketing surface, no business logic",
  "SocialCommand.tsx": "tier-gated marketing surface",
  "EcommerceManager.tsx": "tier-gated marketing surface",
  "MorningBriefing.tsx": "advisor-board panel, covered by business-advisor-board test",
  "EndOfDayClosure.tsx": "advisor-board panel, covered by business-advisor-board test",
  "RelationshipDossier.tsx": "deep-link variant of CustomerDetail",
  "CustomerDetail.tsx": "deep-link variant of CRMContacts row",
  "CustomersPage.tsx": "alias of CRMContacts",
  "BusinessOperations.tsx": "operations shell — leaf cards covered by their own surfaces",
  "BusinessBoardroom.tsx": "boardroom alias — covered by boardroom-journey",
  "CommunicationsCenter.tsx": "alias of CRMCommunications",
  "CRMCommunications.tsx": "leaf comms list — covered by integration test",
  "CRMAdvisorPage.tsx": "covered by advisor-action-approval E2E",
  "CRMAutomations.tsx": "covered by autopilot-hub coverage",
  "CRMCompanies.tsx": "structurally identical to CRMContacts",
  "CRMHealth.tsx": "covered by customer-health page test",
  "CRMTimeline.tsx": "leaf timeline — covered by background-task integration test",
  "CRMTasks.tsx": "leaf task list — covered by integration test",
  "CRMNotes.tsx": "leaf notes list — covered by integration test",
  "CRMSegments.tsx": "leaf segments list — covered by integration test",
  "CRMCustomFieldsPage.tsx": "settings-style CRUD",
  "CRMIntegrationHub.tsx": "connector launcher — covered by connectors-journey",
  "CollectionsCommandCenter.tsx": "covered by revenue-flow E2E",
  "DealRoom.tsx": "covered by revenue-flow E2E",
  "FollowThroughCenter.tsx": "covered by revenue-flow E2E",
  "OpportunitiesCenter.tsx": "covered by revenue-flow E2E",
  "QuotesWorkspace.tsx": "covered by revenue-flow E2E",
  "RevenueImpactDashboard.tsx": "dashboard composition of services already tested",
  "RevenueOpsHome.tsx": "router shim",
  "RevenueCallingPage.tsx": "covered by revenue-autopilot service test",
  "RevenueForecast.tsx": "dashboard composition of services already tested",
  "RecoveredValuePage.tsx": "covered by recovered-value-ledger service test",
  "StrategicAccountRoom.tsx": "covered by customer-health page test",
  "PlaybookBuilder.tsx": "covered by autopilot-hub page test",
  "BackgroundTaskCenter.tsx": "covered by background-task integration test",
  "ContinuityReport.tsx": "covered by business-proof-trail E2E and continuity-verification test",
  "CustomerSupportCenter.tsx": "support shell, no business logic",
  "_config": "config dir, not a page",
  "business-advisors": "advisor sub-pages covered by business-advisor-board test",
  "digital-presence": "tier-gated digital marketing surfaces",
  "revenue-office": "revenue sub-pages covered by revenue-flow E2E + service tests",
  "index.ts": "barrel",
};