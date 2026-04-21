

## Wave 19 — Truth Governance and Contradiction Management Layer

### Summary

The release-readiness aggregator currently produces a single flat GREEN/RED verdict across 250+ BLOCK gates. There is no formal system for tracking contradictions, mapping claims to proofs, separating readiness dimensions, interpreting advisory-heavy states, or invalidating stale artifacts semantically. This wave creates the `src/lib/truth/` package with 8 canonical policy files, a validator script, and 13 generated proof artifacts.

### What Already Exists (Preserve, Do Not Duplicate)

- `scripts/architecture/checks/check-os-release-readiness.ts` — master aggregator (250+ BLOCK gates, WARN-tier advisory ingestion). **Extend** with dimensional breakdown, do not replace.
- `scripts/architecture/checks/check-evidence-freshness.ts` — time-based staleness for 9 artifacts. **Extend** with semantic invalidation rules.
- `src/lib/claim-safety/demo-only-surface-registry.ts` — existing claim safety for demo/future-vision routes. **Preserve** as-is; the new truth layer is complementary, not overlapping.
- `docs/architecture/registry/truth-status.yaml` — staleness thresholds and downgrade behavior. **Reference** from the new invalidation rules.
- `generated/validator-gate-map.json` — advisory classification map. **Consumed** by the new advisory interpretation policy.

### Part 1 — New Files to Create

All in `src/lib/truth/`:

| # | File | Purpose |
|---|------|---------|
| 1 | `readiness-claim-contract.ts` | TypeScript types for claims, proofs, dimensions, contradictions |
| 2 | `readiness-dimension-model.ts` | 5-dimension model: structural, behavioral, distribution, operational, trust. Per-subsystem scoring with rollup |
| 3 | `claim-proof-registry.ts` | 30+ major claims mapped to proof artifacts, evidence sources, invalidation conditions, owners |
| 4 | `contradiction-ledger.ts` | Registry of known contradictions (green vs pending notarization, green vs unencrypted OAuth, green vs missing E2E boot, green vs duplicates/dead pages, green vs distribution-blocked mobile) |
| 5 | `advisory-interpretation-policy.ts` | Rules: advisory count thresholds triggering conditional readiness, dimension-specific downgrade triggers, contradiction-forced claim downgrades |
| 6 | `stale-artifact-invalidation.ts` | Semantic invalidation rules keyed by source-change categories (schema, routes, workflows, migrations), extending the time-based model in check-evidence-freshness.ts |
| 7 | `status-language-policy.ts` | Approved status vocabulary: READY, CONDITIONALLY_READY, STRUCTURALLY_READY_ONLY, BEHAVIORALLY_PARTIAL, DISTRIBUTION_BLOCKED, OPERATIONALLY_DEFERRED, TRUST_GAP_OPEN, DEFERRED |
| 8 | `index.ts` | Barrel re-export |

### Part 2 — Generated Artifacts

All in `generated/`:

| # | File | Contents |
|---|------|----------|
| 1 | `contradiction-ledger.json` | 5+ open contradictions with ids, severity, impacted dimensions, mitigation paths |
| 2 | `claim-proof-registry.json` | 30+ claims with proof mappings, confidence scores, invalidation rules |
| 3 | `readiness-dimension-scoreboard.json` | Per-dimension (structural/behavioral/distribution/operational/trust) scores for 8 major subsystems |
| 4 | `advisory-heavy-readiness-report.json` | Advisory burden analysis: counts by category, dimensional impact, interpretation verdicts |
| 5 | `stale-artifact-invalidations.json` | Current invalidation state for tracked artifacts |
| 6 | `proof-gap-register.json` | Missing proofs per subsystem with confidence penalties |
| 7 | `structural-vs-behavioral-gap-report.json` | Per-subsystem structural vs behavioral readiness comparison |
| 8 | `readiness-language-audit.json` | Audit of status language used across generated artifacts against approved vocabulary |
| 9 | `claim-confidence-report.json` | Per-claim confidence with dimensional breakdown |

### Part 3 — Validator Script

`scripts/truth/check-truth-governance.ts` — BLOCK-tier validator that:
- Verifies all 5 readiness dimensions have scores
- Verifies all open contradictions have mitigation paths
- Verifies all major claims have proof mappings
- Verifies no stale artifacts are in INVALID state without acknowledgment
- Emits `generated/truth-governance-report.json`

### Part 4 — Integration

1. Register `truth-governance` as a BLOCK gate in `check-os-release-readiness.ts` REQUIRED_GATES
2. Add dimensional breakdown section to `os-release-readiness-summary.md` output
3. Register in `scripts/validate-all.ts` under new `"truth"` category

### Part 5 — Contradiction Ledger Initial Entries

| ID | Contradiction | Severity | Dimension |
|----|--------------|----------|-----------|
| CTR-001 | GREEN release vs Apple notarization pending | high | distribution |
| CTR-002 | GREEN integration vs OAuth tokens unencrypted at rest | high | trust |
| CTR-003 | GREEN OS vs E2E boot validation roadmap-only | medium | behavioral |
| CTR-004 | GREEN frontend vs 13 duplicate component families | low | structural |
| CTR-005 | GREEN frontend vs 12 dead pages | low | structural |
| CTR-006 | GREEN mobile vs distribution-blocked (archived) | medium | distribution |
| CTR-007 | GREEN aggregate vs 4,252 advisory warnings | medium | operational |

### Part 6 — Readiness Dimensions

Each subsystem scored independently across:

| Dimension | What It Measures |
|-----------|-----------------|
| Structural | Files exist, types compile, routes registered, tables created |
| Behavioral | Runtime proof exists (receipts, nightly runs, E2E validation) |
| Distribution | Can be packaged, signed, delivered to end users |
| Operational | Runbooks, kill-switches, support diagnostics, DR drills proven |
| Trust | RLS policies, encryption, claim honesty, evidence grading |

### Part 7 — Claim-Proof Registry Sample Entries

Each entry maps a claim to its proof chain:

- "AI Runtime is production-ready" → `ai-live-provider-nightly-report.json` + `ai-receipt-persistence-report.json` + 4 more
- "Advisor layer is behaviorally closed" → `advisor-boardroom-proof/` (13 files) + 3 BLOCK validators
- "Connector OAuth is secure" → `connector-refresh-streak-report.json` + `oauth-security-closure-report.json`
- "Mobile is honestly classified" → `mobile-scope-closure/` (5 BLOCK gates)

### Verification

- All 8 source files compile with 0 errors
- Validator passes with GREEN
- 9 generated artifacts produced
- BLOCK gate registered in aggregator
- Production build succeeds

