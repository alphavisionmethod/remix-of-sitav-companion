# Deployment Wording Policy

**Status**: BLOCK-level governance — enforced by `check-deployment-wording-safety.ts`, `check-launch-honesty-alignment.ts`, `check-qualifier-required-claims.ts`
**Owner**: Platform Truth Council
**Effective**: 2026-04-18

## ✅ APPROVED phrases (current maturity level)

| Phrase | When |
|---|---|
| **deployable with qualifiers** | preferred default for outward claims |
| **production-capable on Track A** | when describing Ubuntu-native userland readiness |
| **pilot-ready** | when describing limited-deployment readiness |
| **controlled-launch-ready** | when describing staged rollout readiness |
| **release-system-ready with a short P1 closure list** | when summarizing release tooling |
| **all 36+ release gates GREEN** | factual, when paired with the gate list |
| **deployable** (with caveat block nearby) | acceptable when `## Active Caveats` is in the same doc |

## 🔴 PROHIBITED phrases (until P1 caveats are closed)

| Phrase | Why prohibited |
|---|---|
| "nothing left to prove" | overclaims given pending P1 evidence |
| "fully production-certified in all respects" | overclaims |
| "100% production-ready" | overclaims |
| "no remaining operational caveats" | factually wrong while caveats exist |
| "no remaining gaps" | same |
| "production-hardened across every dimension" | overclaims |
| "complete with nothing left to do" | overclaims |
| "fully deployable in all environments" | overclaims (no Fedora/Arch test evidence) |

## 🟡 QUALIFIER-REQUIRED phrases (allowed only with caveat block in same doc)

| Phrase | Required adjacent context |
|---|---|
| "production-ready" | must be paired with `## Active Caveats` block |
| "DEPLOYABLE" | must be paired with `## Active Caveats` block |
| "release-ready" | must be paired with `## Active Caveats` block |
| "deployable=true" | must be paired with `## Active Caveats` block |

## Standardized `## Active Caveats` block

Every claim-bearing doc MUST contain (or reference) the following block, kept in sync with reality:

```markdown
## Active Caveats

The following P1 evidence gaps remain open as of {DATE}. Status claims in this document are made **subject to** this list:

| # | Caveat | Owner | Tracking |
|---|---|---|---|
| 1 | TPM hardware proof on real hardware | Trust Council | `generated/final-hardening/MOK_TEST_MATRIX.md` |
| 2 | Production-shape restore drill — first scheduled live execution | DR Owner | `generated/restore-and-oauth-hardening/PRODUCTION_RESTORE_DRILL_RUNBOOK.md` |
| 3 | OAuth refresh probe — 7-day continuous health window | Connectors Owner | `generated/restore-and-oauth-hardening/OAUTH_REFRESH_PROBE_LOGGING_AND_RECEIPTS.md` |
| 4 | Boardroom L7 follow-through — operator-trained runbook drill | Boardroom Owner | `generated/final-hardening/BOARDROOM_FOLLOWTHROUGH_RUNBOOK.md` |
| 5 | MOK per-distro live tests — Fedora 40 + Arch | Install Owner | `generated/final-hardening/MOK_TEST_MATRIX.md` |

Until each caveat is independently closed with evidence linked from the corresponding tracking doc, **deployability claims must be read together with this list**, not in isolation.
```

## Examples

### ✅ Good
> SITA OS is production-capable on Track A and release-system-ready with a short P1 closure list. See `## Active Caveats` for current evidence gaps.

### 🔴 Bad
> SITA OS is fully production-certified with nothing left to prove.

### ✅ Good
> Status: DEPLOYABLE.
> ## Active Caveats
> 1. TPM hardware proof — pending …

### 🔴 Bad
> Status: DEPLOYABLE. (no caveat block anywhere in doc)

## Promotion Process

When a P1 caveat is **independently closed**:
1. Update the tracking doc with evidence (drill log, test transcript, hardware report).
2. Remove the row from the `## Active Caveats` block in this policy and in every doc.
3. If all five close, the qualifier-required list above may be relaxed.
4. Run all three Phase-5 wording validators.
5. Get Platform Truth Council sign-off.

## CI Enforcement

| Gate | What it checks | Severity |
|---|---|---|
| `check-deployment-wording-safety.ts` | Prohibited phrases anywhere in claim-bearing docs | BLOCK |
| `check-launch-honesty-alignment.ts` | Every "DEPLOYABLE" / "production-ready" doc has an `## Active Caveats` block | BLOCK |
| `check-qualifier-required-claims.ts` | Qualifier-required phrases are properly qualified | BLOCK |
