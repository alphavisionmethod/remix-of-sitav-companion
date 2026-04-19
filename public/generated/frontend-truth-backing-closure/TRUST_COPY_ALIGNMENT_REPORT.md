# Trust-Copy Alignment Report

> Alignment of trust-bearing copy on the 5 in-scope surfaces against the
> canonical proof state.

## Validator

`scripts/validation/check-qualified-surface-copy.ts` — WARN-tier adoption
tracker. Flags overclaim phrases on the 4 in-scope surface files:

- `AIRuntimeNightlyTruthPanel.tsx`
- `ConnectorTruthSummaryPanel.tsx`
- `IntegrationStreakPanel.tsx`
- `ConciergeBoardroom.tsx`

## Banned phrases (each is a regex — case-insensitive)

| Phrase | Reason |
|---|---|
| "fully autonomous" | Concierge & boardroom are suggest-then-confirm, never autonomous |
| "always live" | Live status is per-run, not unconditional |
| "100% verified" | Verification is per-tier (structurally wired vs behaviorally proven vs nightly verified) |
| "guaranteed (live\|delivery\|accuracy)" | No SLA-style guarantees in copy |
| "never fails" | Failures are tracked and acknowledged — not denied |
| "zero-downtime" | Operator copy must not promise infra SLAs |
| "perfect (accuracy\|reliability)" | Reserved for math, not copy |

## Current run

| Metric | Value |
|---|---|
| Files scanned | 4 |
| Offenders | 0 |
| Errors | 0 |
| Warnings | 0 |

Result: **clean**. All 4 in-scope surface files use qualified language
(`gateway-governed`, `nightly-verified`, `worst-of-day`, `last DB
observation`, `read-only summary — canonical control lives at the
Integrations Hub`).

## Alignment to existing trust-copy specs

The trust-copy specs in `generated/trust-state-and-copy-closure/` remain
authoritative for the broader 8-surface set (Boardroom, Concierge, Comms,
AI Runtime, Integrations, Health, Releases, Onboarding). This pass adds
visible **provenance** affordances without changing trust-copy semantics.
