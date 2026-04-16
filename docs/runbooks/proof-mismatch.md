# RB-005 — Proof Mismatch Resolution

| Field | Value |
|---|---|
| Severity | **high** |
| Bounded Context | `proof-trust` |
| Subsystem | proof |
| Owner | platform |
| Estimated MTTR | 10 min |
| Kill switch | — |
| Message code | `POL-001` |

## Trigger

Launch readiness engine detects a proof count mismatch between mutations and receipts.

## Steps

1. **Identify which proof type** is mismatched.
2. **Verify if the gap is real** vs a timing issue.
3. **Backfill missing receipts** if the underlying data exists.
4. **Update launch readiness score** to reflect the corrected state.

## Rollback

Remove backfilled entries if root cause turns out to be a counting bug.

## Evidence

- Mutation vs receipt counts per table
- Backfill report
- Updated launch readiness snapshot
