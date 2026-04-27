
# Phase 7 — System-Wide Trust Coverage (Beyond Advisor Flows)

**Discipline**: One phase at a time. Do NOT advance until the current phase has 0 violations, all new tests pass, the truth-coverage report is updated, and the closure gate is green. No stubs. No duplicate infrastructure. No fake trust UI.

---

## Audit summary (already complete — used to ground every phase)

**Canonical trust infrastructure that exists and MUST be reused (no duplicates):**

| Concern | Canonical primitive | Path |
|---|---|---|
| Edge-side receipt emission | `emitActionReceipt(serviceClient, params)` | `supabase/functions/_shared/receipt-emitter.ts` |
| Receipt store | `public.ai_action_receipts` table | DB |
| Approval queue store | `public.ai_workforce_approval_queue` table | DB |
| Approval CRUD hooks | `useApprovalQueue` / `useApproveApprovalItem` / `useRejectApprovalItem` | `src/hooks/use-approval-queue-mutations.ts` |
| Client action execution | `useAction()` → `useCanonicalAction()` → `SitaKernel.executeAction()` | `src/hooks/useAction.ts`, `src/contexts/SitaKernelContext.tsx` |
| In-app receipt persist | `executeAction.service.ts` (writes to `ai_action_receipts`) | `src/lib/services/executor-service/` |
| Loop / proof-chain emitter | `emitLoopCompletion()` | `src/hooks/use-flagship-loop-proof.ts` |
| Authority / risk / reversibility | `unified-policy-matrix` + `policy-trust-thresholds` + `policy-reversibility-map` + `policy-approval-map` | `src/lib/policy/` |
| Receipt protocol types | `ReceiptEnvelope`, `ExecutionReceiptData`, `ApprovalReceiptData`, `RollbackReceiptData` | `src/packages/protocols/receipt-protocol.ts` |
| Approval protocol types | `ApprovalRequest`, `ApprovalDecision`, `ApprovalPolicy` | `src/packages/protocols/approval-protocol.ts` |

**Gaps confirmed by direct inspection of the repo:**

1. `src/data/repositories/crm-data-service.ts` — full CRUD on contacts/companies/opportunities/notes/tasks. **Zero receipt emissions, zero approval gating, zero proof linkage.**
2. `src/lib/services/business-os/revenue-autopilot.service.ts` and `lead-intake.service.ts` — execution paths do not enqueue to `ai_workforce_approval_queue` even when actions affect external parties.
3. `src/lib/services/concierge-os/*.service.ts` (28 services: reservations, providers, household ops, dispatch, recurring supplies, etc.) — no receipts, no approval, no proof.
4. `src/modules/finance/pages/money/{Bills,Reserves,Subscriptions}.tsx` use `useAction` inconsistently; investment-office mutations bypass the canonical pipeline.
5. `src/modules/business/components/business/crm/CRMProofTrail.tsx` reads `generateDemoTrail()` — UI implies provenance that isn't actually backed by `ai_action_receipts`. **This is fake trust UI and must be wired to the real table.**
6. No module-wide proof surface for Concierge or Finance equivalent to `BusinessProof`.
7. No canonical client-side receipt helper — `recordAutopilotEvent()` reinvents the wheel locally; we must extract it into a single canonical `emitClientReceipt()` and reuse it everywhere.
8. No system-wide trust-coverage validator script (we have receipt-coverage for edge functions only — `src/__tests__/edge-functions/receipt-emission-coverage.test.ts` — but nothing for client services).

---

## Phase 7.1 — Canonical client-side receipt + approval helper (foundation)

**Goal**: Extract the receipt-emission pattern used by `recordAutopilotEvent()` into one canonical client helper; do the same for "enqueue an approval request". All later phases reuse these — zero duplication.

**Implementation:**
- Create `src/lib/trust/emit-client-receipt.ts` exporting:
  - `emitClientReceipt({ actionType, summary, payload, riskTier, status, confidence, correlationId, parentReceiptId })` → writes to `ai_action_receipts` via `fromTable`. Mode-aware (skips in demo). Returns `{ receiptId } | null`. Fire-and-forget by default; throws only on `{ strict: true }`.
  - `emitClientFailureReceipt(...)` — same shape but `status: "failed"` with `error_code`/`error_message`.
- Create `src/lib/trust/request-approval.ts` exporting:
  - `requestApproval({ actionType, riskTier, justification, payload, correlationId, parentReceiptId, executionRequired })` → inserts into `ai_workforce_approval_queue` and returns `{ approvalId, status: "pending" }`. Reuses the same row contract `useApprovalQueue` already reads.
  - `withApprovalGate(action, opts)` — higher-order wrapper: if `riskTier ≥ opts.threshold`, enqueues approval and short-circuits with `{ gated: true, approvalId }`; otherwise executes inline.
- Extract `recordAutopilotEvent` to delegate to `emitClientReceipt` (no behavior change, just dedupe).
- Add `src/__tests__/trust/emit-client-receipt.test.ts` and `src/__tests__/trust/request-approval.test.ts` covering: receipt write, failure-receipt path, demo-mode skip, approval insert, `withApprovalGate` short-circuit at threshold.

**Closure gate for 7.1:**
- All new tests pass.
- `recordAutopilotEvent` continues to behave identically (existing autopilot tests still pass).
- 0 new TypeScript errors.

---

## Phase 7.2 — CRM mutations: receipts + approval gating + real proof trail

**Goal**: Every CRM CRUD path emits a real receipt; bulk operations and external-impact actions are approval-gated; `CRMProofTrail` reads from real receipts (no more demo).

**Implementation:**
- `src/data/repositories/crm-data-service.ts` — wrap each mutation (createContact / updateContact / deleteContact, createCompany / updateCompany / deleteCompany, createOpportunity / updateOpportunity / changeStage / markWon / markLost, createTask, createNote, **bulk** triage / merge / delete) so they:
  - Call `emitClientReceipt` post-mutation with `actionType: "crm.<entity>.<verb>"`, `payload: { entity_id, diff }`, `riskTier` per the policy matrix (delete=high, bulk=high, single update=low).
  - For `riskTier: "high"` (bulk delete, bulk owner reassignment, mass merge), route through `withApprovalGate(threshold: "high")` so execution is blocked until approved.
  - Emit `emitClientFailureReceipt` on caught errors.
- `CRMProofTrail.tsx` — replace `generateDemoTrail()` with a real query: `SELECT * FROM ai_action_receipts WHERE action_payload->>'entity_id' = entityId AND action_type LIKE 'crm.%' ORDER BY executed_at DESC`. Keep demo data only when `useDataMode().isDemo === true`. Update `ProofEntry` mapping to use real receipt fields. Keep demo path under `// truth-allow: ia-config` because it's the demo fixture.
- Add a real "Approval pending" badge on the entity detail header when an approval is queued.
- Tests: `src/__tests__/business-os/crm/crm-receipt-coverage.test.ts` — asserts each public mutation in `crm-data-service.ts` emits one receipt. `crm-approval-gating.test.ts` — asserts bulk delete/merge insert into `ai_workforce_approval_queue`. `crm-proof-trail-live.test.tsx` — asserts component renders real receipts when `isDemo === false`.

**Closure gate for 7.2:**
- 0 CRM mutations missing a receipt (validated by new audit script `scripts/architecture/check-trust-coverage.ts`).
- 0 high-risk CRM actions without approval gating.
- `CRMProofTrail` no longer renders fake provenance in live mode (visual proof: snapshot test).
- All new vitest suites pass.

---

## Phase 7.3 — Autopilot, lead-intake, outreach: receipts + approval

**Goal**: Revenue Autopilot, lead recovery, no-show recovery, and any external outreach (email/SMS/dispatch) emit receipts and require approval per their risk tier.

**Implementation:**
- `src/lib/services/business-os/revenue-autopilot.service.ts`, `lead-intake.service.ts`, `stale-lead-detector.service.ts`, `crm-finance-bridge.service.ts` — wire `emitClientReceipt` on every triggered action and `withApprovalGate` for actions that touch external parties (send email, SMS, dispatch follow-up).
- `src/modules/business/pages/{LeadsInbox,LeadRecovery,AppointmentsScheduling,AutopilotHub,RevenueAutopilot,BackgroundTaskCenter,CommunicationsCenter}.tsx` — convert any direct DB writes to go through `useAction` (which already routes to the canonical executor, which already writes a receipt) **OR** call `emitClientReceipt` directly from the page mutation. Add a "Pending approval" surface (existing `useApprovalQueue` hook) so the operator sees the queued items inline.
- `src/data/repositories/business-background-tasks-service.ts` — already imports `ai_action_receipts`; verify it uses the new canonical helper instead of inline insert.
- Add `<ApprovalPendingBanner>` to autopilot/outreach pages (reuses existing approval-queue hook; no new infra).
- Tests: `src/__tests__/business-os/autopilot/autopilot-receipt-coverage.test.ts`, `outreach-approval-gating.test.ts`, `lead-recovery-trust.test.ts`.

**Closure gate for 7.3:**
- Every external-outreach call enqueues approval.
- Every autopilot action emits a receipt.
- Approval-pending banner renders on Autopilot, Lead Recovery, Communications, Revenue Autopilot pages.

---

## Phase 7.4 — Concierge: receipts + approval for third-party-affecting actions

**Goal**: Concierge actions that affect third parties (reservations, providers, dispatch, gift orders, household ops with external touch) emit receipts and gate when risky.

**Implementation:**
- Wrap mutations in `src/lib/services/concierge-os/*.service.ts` — focus on services with real third-party impact: `reservation-ingest`, `provider-memory`, `gift-reminders`, `home-admin`, `recurring-supplies`, `event-continuity`, `travel-continuity`, `school-items`, `responsibilities`. Skip purely-internal services (`prep-derivation`, `prep-checklist`, `projection`).
- Each wrapped mutation calls `emitClientReceipt({ actionType: "concierge.<service>.<verb>", riskTier: <per matrix> })`.
- External-outreach concierge actions (provider dispatch, gift order send, reservation cancel) go through `withApprovalGate("high")`.
- Build `src/modules/concierge/components/concierge/ConciergeProofTrail.tsx` (new — there is no existing equivalent; this is NOT a duplicate of `CRMProofTrail` because Concierge entities and risk semantics differ; it reuses the `ProofEntry` shape exported from a shared `src/lib/trust/proof-entry.ts`).
- Add `src/modules/concierge/pages/ConciergeProof.tsx` — the module-level proof surface (matches the `BusinessProof` precedent).
- Wire route in concierge route registry.
- Tests: `src/__tests__/concierge/concierge-receipt-coverage.test.ts`, `concierge-approval-gating.test.ts`, `concierge-proof-page.test.tsx`.

**Closure gate for 7.4:**
- Every third-party-affecting concierge mutation emits a receipt.
- Provider dispatch / reservation cancel / gift order require approval.
- `/concierge/proof` route renders real receipts.

---

## Phase 7.5 — Finance: receipts + approval for money-movement-adjacent actions

**Goal**: Finance mutations (Bills, Reserves, Subscriptions, holdings/allocation, tax estimate adjustments, investment-office actions) emit receipts; high-impact decisions (large allocation change, large bill schedule, subscription cancel, debt action) require approval.

**Implementation:**
- Pages already using `useAction`: audit and ensure each `useAction` call passes `amount` so the existing budget/approval gate in `SitaKernel.executeAction` activates correctly. Currently many calls omit `amount`, which silently disables the gate.
- For investment-office and money-page mutations not yet on `useAction`, wrap with `useAction({ amount, riskTier })` so they route through the canonical pipeline (which already emits receipts).
- Build `src/modules/finance/pages/FinanceProof.tsx` (parallel to `BusinessProof`) and `src/modules/finance/components/finance/FinanceProofTrail.tsx` (reuses shared `ProofEntry` from 7.4).
- Wire route.
- Tests: `src/__tests__/finance/finance-receipt-coverage.test.ts`, `finance-approval-gating.test.ts`, `finance-proof-page.test.tsx`.

**Closure gate for 7.5:**
- Every money-impacting Finance mutation emits a receipt.
- High-impact actions (above policy threshold) gate via approval queue.
- `/finance/proof` route renders real receipts.

---

## Phase 7.6 — Rollback & outcome lineage (truthful only)

**Goal**: Where rollback truly exists, link it to the originating receipt. Where rollback does NOT exist, surface that honestly (do NOT add fake "Undo" buttons).

**Implementation:**
- Inventory rollback-capable actions by reading `policy-reversibility-map.ts`. Only those rows get rollback wiring.
- For each reversible action, when the rollback executes:
  - Emit a new receipt with `category: "rollback"`, `parent_receipt_id: <original>`, payload describing what was reverted.
  - Update the original receipt's `metadata.rollback_receipt_id` so proof trails can render the linkage.
- For irreversible actions: in proof surfaces, render a `<IrreversibleBadge>` instead of any rollback affordance. Add lint test `src/__tests__/trust/no-fake-undo.test.tsx` that fails if any proof component renders an "Undo" button for an action whose policy entry has `reversibility === "irreversible"`.
- Outcome lineage: when an approval-gated action eventually executes, write a receipt with `parent_receipt_id` pointing to the approval receipt — closing the chain `recommendation → approval → execution → outcome`.
- Tests: `src/__tests__/trust/rollback-lineage.test.ts`, `outcome-lineage.test.ts`.

**Closure gate for 7.6:**
- Every rollback emits a child receipt linked to its parent.
- No fake undo affordances anywhere (lint test green).
- Outcome chain visible on `/business/proof`, `/concierge/proof`, `/finance/proof`.

---

## Phase 7.7 — System-wide trust-coverage validator + closure report

**Goal**: One repo-wide audit script + one report file. Future regressions caught in CI.

**Implementation:**
- Create `scripts/architecture/check-trust-coverage.ts` — for each module (`business`, `concierge`, `finance`):
  1. Parse `*-data-service.ts` and `services/**/*.service.ts` for exported async functions that perform `.insert/.update/.delete` on a table.
  2. Assert each one calls `emitClientReceipt` (or routes through `useAction` / `executeAction`).
  3. Cross-reference `policy-approval-map` — assert every `riskTier: "high" | "critical"` action has a `withApprovalGate` call.
  4. Print coverage % per module and fail if any module < 95%.
- Wire into `.github/workflows/check-boundaries.yml` as `system_wide_trust_enforce`.
- Create `SITA_OS_SYSTEM_WIDE_TRUST_COVERAGE_REPORT.md` at repo root with the exact structure the user requested:
  1. Canonical trust systems reused
  2. Actions now covered by receipts (table per module)
  3. Actions now gated by approval (table per module)
  4. Execution proof added (per workflow)
  5. Rollback / outcome lineage added (per action)
  6. Proof surfaces strengthened (BusinessProof / ConciergeProof / FinanceProof / CRMProofTrail)
  7. Exact files changed (auto-generated section)
  8. Tests added
  9. Remaining future-facing trust gaps + why deferred
- Add `src/__tests__/trust/system-wide-trust-coverage.test.ts` that runs the validator and asserts the global threshold.

**Closure gate for 7.7 (final):**
- `check-trust-coverage.ts` reports ≥ 95% coverage on each of business / concierge / finance.
- Report file committed and accurate.
- Full vitest suite green for `src/__tests__/trust/**`, `src/__tests__/business-os/**`, `src/__tests__/concierge/**`, `src/__tests__/finance/**`.
- CI workflow includes the new gate.

---

## Non-negotiable rules enforced across all 7 phases

- **No parallel infrastructure** — every receipt goes through `emitClientReceipt` → `ai_action_receipts`; every approval goes through `requestApproval` → `ai_workforce_approval_queue`. No new tables, no new queues.
- **No fake trust UI** — `CRMProofTrail` switches to real data; new proof surfaces query `ai_action_receipts` directly; no "Undo" buttons on irreversible actions (lint-enforced).
- **No stubs** — every wrapped mutation actually emits the receipt at runtime, verified by unit tests that mock `fromTable` and assert the insert payload.
- **One phase at a time** — each phase has its own closure gate. I will not start phase N+1 until phase N is fully green and the report section for phase N is written.
- **Advisor flows preserved** — existing advisor approval/receipt tests (`src/__tests__/business-os/trust/proof-lineage.test.ts`, etc.) must remain green at every checkpoint.

---

## Ready to execute

On your approval I will switch to default mode and start with **Phase 7.1 (canonical helpers)**, run its closure gate, write the report-section-1 entry, and only then move to 7.2.
