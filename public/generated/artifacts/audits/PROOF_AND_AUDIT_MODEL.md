# Proof & Audit Model

> **Layer:** L3 Platform Service · **Registry:** `src/lib/platform/proof/proof-registry.ts`, `proof-requirement-map.ts`

## Purpose

Defines every class of *durable evidence* that the system produces — approvals, executions, reversals, audits, attestations, consent, AI inference receipts, lineage rows.

## Proof Classes

| Class | Examples |
|-------|----------|
| `approval` | approval queue decision rows |
| `execution` | execution bindings + events |
| `verification` | post-action outcome verifications |
| `negative` | structured refusals |
| `audit` | admin action audit |
| `lineage` | flagship loop completions, hash chains |
| `attestation` | device attestations |
| `consent` | explicit user consent records |
| `ai-inference` | per-call AI receipts |
| `reversal` | rollback receipts |

## Proof Requirements per Action Class

`PROOF_REQUIREMENT_MAP` declares **must-emit**, **may-emit**, lineage parent, minimum proof count, and whether approval is required.

Examples:
- `finance.transfer` → must emit `approval-decision` + `execution-event` + `audit-event`
- `comms.send-sms` → must emit `execution-event` + `audit-event` + `consent-record`
- `owner.transfer-control` → 4 proofs minimum including `device-attestation`

## Storage

| Medium | Where |
|--------|-------|
| `db-row` | normal Supabase tables (most receipts) |
| `event-stream` | append-only event tables (audit, lineage) |
| `blob-store` | large evidence bundles |
| `external-anchor` | external KMS / transparency log |

Hash chaining is on for every approval/execution/audit/lineage class. External anchoring is on for `audit-event` and `device-attestation`.

## Retention

User-visible proofs default to 7 years; AI inference receipts to 1 year; transient ephemeral proofs to 90 days.

## Enforcement

- **Executor** (`src/lib/platform/execution/execution-policy-map.ts`) calls `assertRequiredProofs(actionClass, emitted)` before marking complete.
- **CI** runs `audit-proof-coverage.ts` and fails if a `must-emit` proof is missing for any action.
- **Admin UI** at `/admin/proof` surfaces coverage % per class.
