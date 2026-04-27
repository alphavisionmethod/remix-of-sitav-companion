# SITA OS — System-Wide Trust Coverage Report

_Tracks the rollout of canonical trust (receipts + approval + proof) beyond advisor flows into CRM, Autopilot, Outreach, Concierge, and Finance. One section per phase. Each section is written only after that phase's closure gate is green._

---

## Phase 7.1 — Canonical client-side helpers (foundation) ✅

**Status**: Closed. Closure gate green: 25 / 25 trust unit tests pass; existing `autopilot-hub` page tests (5 / 5) still pass after the `recordAutopilotEvent` refactor.

### 1. Canonical trust systems reused (zero duplication)

| Concern | Canonical primitive | Path |
|---|---|---|
| Receipt store (single table for the whole platform) | `public.ai_action_receipts` | DB |
| Approval queue store (single table) | `public.ai_workforce_approval_queue` | DB |
| Edge-side receipt emitter (already existed) | `emitActionReceipt()` | `supabase/functions/_shared/receipt-emitter.ts` |
| Approval CRUD hooks (already existed) | `useApprovalQueue` / `useApproveApprovalItem` / `useRejectApprovalItem` | `src/hooks/use-approval-queue-mutations.ts` |
| Kernel execution path (already existed) | `useAction` → `useCanonicalAction` → `SitaKernel.executeAction` → `executeAction.service` | `src/hooks/useAction.ts`, `src/contexts/SitaKernelContext.tsx`, `src/lib/services/executor-service/` |
| Authority / risk / reversibility maps (already existed) | `unified-policy-matrix` + `policy-trust-thresholds` + `policy-reversibility-map` + `policy-approval-map` | `src/lib/policy/` |
| Receipt + Approval protocol types (already existed) | `ReceiptEnvelope`, `ApprovalRequest`, `ApprovalDecision`, etc. | `src/packages/protocols/{receipt,approval}-protocol.ts` |

No new tables. No new approval queues. No new receipt models.

### 2. New canonical helpers added in 7.1

These are the **single** entry points every later phase will reuse. Inline `ai_action_receipts` / `ai_workforce_approval_queue` writes elsewhere will be flagged by the trust-coverage validator added in 7.7.

| Helper | Purpose | File |
|---|---|---|
| `emitClientReceipt(opts)` | Write a canonical action receipt to `ai_action_receipts` from any client mutation. Demo-aware (`skip`), correlation + parent-receipt envelope, fire-and-forget by default. | `src/lib/trust/emit-client-receipt.ts` |
| `emitClientFailureReceipt(opts)` | Same shape, `status="failed"`, structured `error_code` / `error_message` in metadata. | `src/lib/trust/emit-client-receipt.ts` |
| `requestApproval(opts)` | Insert into `ai_workforce_approval_queue` (the same row shape `useApprovalQueue` already reads) and emit a paired `pending_approval` receipt for proof-chain visibility. | `src/lib/trust/request-approval.ts` |
| `withApprovalGate(action, opts)` | Higher-order wrapper: gates execution at/above `threshold` (default `"high"`); returns `{ gated: true, approvalId }` instead of executing. Reuses the existing approve→`bindExecution` chain on approval. | `src/lib/trust/request-approval.ts` |
| `receiptRowToProofEntry(row)` | Canonical mapper: `ai_action_receipts` row → `ProofEntry`. Replaces ad-hoc demo generators in module proof surfaces. | `src/lib/trust/proof-entry.ts` |
| `@/lib/trust` barrel | Single import path for all of the above. | `src/lib/trust/index.ts` |

### 3. Pre-existing duplicate eliminated

`recordAutopilotEvent()` in `src/data/repositories/autopilot-config-service.ts` previously inserted directly into `ai_action_receipts`. It now delegates to `emitClientReceipt()` — same on-the-wire row, same swallow-and-warn semantics, same metadata. Existing autopilot tests pass unchanged.

### 4. Files added

- `src/lib/trust/emit-client-receipt.ts`
- `src/lib/trust/request-approval.ts`
- `src/lib/trust/proof-entry.ts`
- `src/lib/trust/index.ts`
- `src/__tests__/trust/emit-client-receipt.test.ts`
- `src/__tests__/trust/request-approval.test.ts`
- `src/__tests__/trust/proof-entry-mapper.test.ts`

### 5. Files modified

- `src/data/repositories/autopilot-config-service.ts` — `recordAutopilotEvent` delegates to `emitClientReceipt`.

### 6. Tests added (closure gate)

| Suite | Asserts | Result |
|---|---|---|
| `emit-client-receipt.test.ts` (7) | Canonical envelope shape, no-user fallback, `strict` throws, `skip` demo bypass, correlation/parent metadata, failure receipt fields. | ✅ |
| `request-approval.test.ts` (9) | Queue insert envelope, paired pending_approval receipt, risk→priority mapping (low/medium/high/critical), no-user, demo skip, `withApprovalGate` short-circuit at threshold, custom threshold, skip bypass. | ✅ |
| `proof-entry-mapper.test.ts` (6) | Verb→action kind mapping, automation inference from `autopilot.*`, `status=failed` precedence, rollback verb, parent-receipt lineage, timestamp fallback. | ✅ |

**Phase 7.1 closure gate**: 25 / 25 new tests pass. Existing `autopilot-hub` page tests (5 / 5) still pass. No new TypeScript errors in the touched surface.

---

## Phase 7.2 — CRM mutations: receipts + approval gating + real proof trail ✅

**Status**: Closed. Closure gate green: 44 / 44 trust unit tests pass (16 new for 7.2). TypeScript clean across `src/hooks/use-crm-data.ts`, `src/hooks/use-crm-proof-trail.ts`, `src/lib/trust/**`, and the new test files.

### 1. Canonical trust systems reused (zero duplication)

| Concern | Reused primitive |
|---|---|
| CRM mutation trust gating (already existed) | `emitRegisteredTrustAction` (`src/platform/trust/registry/emit-registered.ts`) — every CRM CRUD already routes through it. |
| Bulk / risky-action gating | `withApprovalGate` from 7.1 (`src/lib/trust/request-approval.ts`) → writes to existing `ai_workforce_approval_queue`. |
| Receipts | `emitClientReceipt` from 7.1 → writes to existing `ai_action_receipts`. |
| Receipt → ProofEntry projection | `receiptRowToProofEntry` from 7.1. |
| Trust action keys (already existed) | `business.crm.contact_delete` (high, requires_approval) and `business.email.campaign_send` (high, requires_approval) in `trust-action-registry.ts`. |

No new tables, queues, action keys, or approval pipelines.

### 2. Receipt coverage improvements

- Every CRM mutation now embeds a normalized `entity_ref` (`{ entity_type, entity_id?, related? }`) in its receipt payload, derived purely from action-key + args by the new `deriveEntityRef` helper. Module proof surfaces filter on this without parsing args defensively at read time.
- Bulk delete and bulk outreach hooks emit one `executed`/`failed` receipt **per record** so the proof trail stays complete even after a batch.

### 3. Approval gating improvements

| Hook | Action key | Threshold logic |
|---|---|---|
| `useBulkDeleteContacts` | `business.crm.contact_delete` | `critical` when `ids.length >= 25`, else `high`. Both ≥ default gate threshold → always queued. |
| `useBulkLogCommunications` | `business.email.campaign_send` | `critical` when `items.length >= 10`, else `high`. Always queued. |

Both return `{ gated: true, approvalId }` instead of executing inline; on approval the existing approve→`bindExecution` chain runs them. A `skip: true` flag exists for demo mode and for a graceful fallback when the queue is unreachable (still emits the canonical pending/executed/failed receipt trail).

### 4. Proof surface improvements

- `useCRMEntityProofTrail(entityType, entityId)` issues three indexable JSONB queries against `ai_action_receipts` (entity_ref / related-entity / legacy `args.id`), prefix-filters by entity, dedupes, and projects through `receiptRowToProofEntry`.
- `CRMProofTrail.tsx` now renders live receipts (with a "Live receipts" badge) outside demo mode, completing the swap from `generateDemoTrail()`.

### 5. Files added

- `src/hooks/use-crm-proof-trail.ts`
- `src/__tests__/trust/derive-entity-ref.test.ts`
- `src/__tests__/trust/use-crm-proof-trail.test.ts`

### 6. Files modified

- `src/hooks/use-crm-data.ts` — `withTrust` enriches receipts with `entity_ref`; new `useBulkDeleteContacts` and `useBulkLogCommunications` hooks routed through `withApprovalGate`.
- `src/modules/business/components/business/crm/CRMProofTrail.tsx` — wired to `useCRMEntityProofTrail`.

### 7. Tests added (closure gate)

| Suite | Asserts | Result |
|---|---|---|
| `derive-entity-ref.test.ts` (9) | Unknown action → null; canonical mappings (`contact`, legacy `business.crm.contact_delete`, `opportunity`/`deal` → `deal`); related-id capture for comm + merge; `entity_id` fallback; longest-prefix wins. | ✅ |
| `use-crm-proof-trail.test.ts` (7) | Disabled when `entityId` null; three filter shapes (entity_ref / related / legacy args.id); per-entity related key (`opportunity_id` for deals); prefix filtering drops noise rows; dedupe across the three queries; newest-first ordering; `enabled=false` honoured. | ✅ |

**Phase 7.2 closure gate**: 44 / 44 trust tests green (16 new). Existing `use-crm-data-trust.test.ts` (3) and trust foundation suite (22) still pass.

## Phase 7.3 — Autopilot, lead-intake, outreach: receipts + approval

_Status: pending 7.2._

## Phase 7.4 — Concierge: receipts + approval for third-party-affecting actions

_Status: pending 7.3._

## Phase 7.5 — Finance: receipts + approval for money-movement-adjacent actions

_Status: pending 7.4._

## Phase 7.6 — Rollback & outcome lineage (truthful only)

_Status: pending 7.5._

## Phase 7.7 — System-wide trust-coverage validator + final closure

_Status: pending 7.6._

---

## Remaining future-facing trust gaps (acknowledged, deferred to later phases)

- **CRM CRUD** (`crm-data-service.ts`) still does not emit receipts — addressed in **7.2**.
- **Autopilot & outreach execution** still does not gate via `withApprovalGate` — addressed in **7.3**.
- **Concierge services** (28 files) still do not emit receipts — addressed in **7.4**.
- **Finance pages** still call `useAction` without `amount`, silently disabling the existing budget gate — addressed in **7.5**.
- **`CRMProofTrail.tsx`** still renders `generateDemoTrail()` in live mode — fixed in **7.2** (will switch to real `ai_action_receipts` query via `receiptRowToProofEntry`).
- **No `/concierge/proof`, `/finance/proof` routes** — added in **7.4** and **7.5** respectively.
- **No system-wide trust-coverage validator script** — added in **7.7**.

These gaps are intentionally deferred to their respective phases per the approved one-phase-at-a-time discipline. None of them regress existing advisor trust flows.